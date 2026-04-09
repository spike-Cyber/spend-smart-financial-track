const nodemailer = require("nodemailer");

function createMailer() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM || user || "no-reply@spendsmart.local";

  if (!host || !user || !pass) {
    return {
      enabled: false,
      async sendMail({ to, subject, text }) {
        console.log("[mail disabled]", { to, subject, text });
      }
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  return {
    enabled: true,
    async sendMail({ to, subject, text, html }) {
      try {
        await transporter.sendMail({
          from,
          to,
          subject,
          text,
          html
        });
      } catch (error) {
        console.error("[mail send failed]", error.message);
      }
    }
  };
}

async function sendDataChangeNotification(mailer, user, action, transaction) {
  if (!user?.email || user.emailNotifications === false) {
    return;
  }

  const amount = Number(transaction.amount || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  });

  const subject = `Spend Smart: ${action} ${transaction.type} entry`;
  const text = [
    `Hello ${user.name},`,
    ``,
    `A financial record was ${action} in your Spend Smart account.`,
    `Title: ${transaction.title}`,
    `Amount: ${amount}`,
    `Type: ${transaction.type}`,
    `Category: ${transaction.category}`,
    `Date: ${transaction.date}`,
    transaction.notes ? `Notes: ${transaction.notes}` : null,
    ``,
    `You are receiving this because email notifications are enabled in settings.`
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#3f2a20">
      <h2 style="margin-bottom:8px;">Spend Smart Update</h2>
      <p>Hello ${escapeHtml(user.name)},</p>
      <p>A financial record was <strong>${escapeHtml(action)}</strong> in your account.</p>
      <ul>
        <li><strong>Title:</strong> ${escapeHtml(transaction.title)}</li>
        <li><strong>Amount:</strong> ${escapeHtml(amount)}</li>
        <li><strong>Type:</strong> ${escapeHtml(transaction.type)}</li>
        <li><strong>Category:</strong> ${escapeHtml(transaction.category)}</li>
        <li><strong>Date:</strong> ${escapeHtml(transaction.date)}</li>
      </ul>
      ${transaction.notes ? `<p><strong>Notes:</strong> ${escapeHtml(transaction.notes)}</p>` : ""}
      <p>You are receiving this because email notifications are enabled in settings.</p>
    </div>
  `;

  await mailer.sendMail({
    to: user.email,
    subject,
    text,
    html
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

module.exports = { createMailer, sendDataChangeNotification };
