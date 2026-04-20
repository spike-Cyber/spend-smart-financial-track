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

async function sendSummaryAlertNotification(mailer, user, summary) {
  if (!user?.email || user.emailNotifications === false) {
    return;
  }

  const alerts = [];
  if (user.targetAlerts !== false && summary.goalPending > 0) {
    alerts.push({
      subject: "Spend Smart: target pending alert",
      text: [
        `Hello ${user.name},`,
        ``,
        `Your monthly goal is still pending by ${formatCurrency(summary.goalPending)}.`,
        `Current goal progress: ${summary.goalProgress}%`,
        ``,
        `Keep tracking your income and savings to stay on target.`
      ].join("\n"),
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#3f2a20">
        <h2>Target Pending Alert</h2>
        <p>Hello ${escapeHtml(user.name)},</p>
        <p>Your monthly goal is still pending by <strong>${escapeHtml(formatCurrency(summary.goalPending))}</strong>.</p>
        <p>Current goal progress: <strong>${escapeHtml(String(summary.goalProgress))}%</strong></p>
        <p>Keep tracking your income and savings to stay on target.</p>
      </div>`
    });
  }

  if (user.overspendingAlerts !== false && summary.totals.expenses > summary.totals.income) {
    alerts.push({
      subject: "Spend Smart: overspending alert",
      text: [
        `Hello ${user.name},`,
        ``,
        `Your expenses have crossed your income.`,
        `Income: ${formatCurrency(summary.totals.income)}`,
        `Expenses: ${formatCurrency(summary.totals.expenses)}`,
        `Balance: ${formatCurrency(summary.totals.balance)}`,
        ``,
        `Review your recent transactions to rebalance your spending.`
      ].join("\n"),
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#3f2a20">
        <h2>Overspending Alert</h2>
        <p>Hello ${escapeHtml(user.name)},</p>
        <p>Your expenses have crossed your income.</p>
        <ul>
          <li><strong>Income:</strong> ${escapeHtml(formatCurrency(summary.totals.income))}</li>
          <li><strong>Expenses:</strong> ${escapeHtml(formatCurrency(summary.totals.expenses))}</li>
          <li><strong>Balance:</strong> ${escapeHtml(formatCurrency(summary.totals.balance))}</li>
        </ul>
        <p>Review your recent transactions to rebalance your spending.</p>
      </div>`
    });
  }

  for (const alert of alerts) {
    await mailer.sendMail({
      to: user.email,
      subject: alert.subject,
      text: alert.text,
      html: alert.html
    });
  }
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
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

module.exports = { createMailer, sendDataChangeNotification, sendSummaryAlertNotification };
