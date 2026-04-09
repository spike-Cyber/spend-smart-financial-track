const express = require("express");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { createStore, sanitizeUser } = require("./lib/store");
const { createMailer, sendDataChangeNotification } = require("./lib/mailer");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const JWT_SECRET = process.env.JWT_SECRET || "spend-smart-dev-secret-change-me";
const COOKIE_NAME = "auth_token";
const ALLOWED_THEMES = new Set(["light", "dark", "sky-blue", "light-green", "grey-shades"]);

async function bootstrap() {
  const { store, driver } = await createStore();
  const mailer = createMailer();
  const app = express();

  app.use(express.json());
  app.use(express.static(PUBLIC_DIR));

  app.get("/api/health", (req, res) => {
    res.json({ ok: true, storage: driver });
  });

  app.get("/api/auth/me", async (req, res) => {
    const user = await getCurrentUser(req, store);
    res.json({ user: user ? sanitizeUser(user) : null });
  });

  app.post("/api/auth/signup", async (req, res) => {
    const { name, email, password, monthlyGoal = 2500 } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required." });
      return;
    }

    const existing = await store.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: "An account with that email already exists." });
      return;
    }

    const user = await store.createUser({
      name,
      email,
      monthlyGoal: Number(monthlyGoal) || 2500,
      passwordHash: await hashPassword(password)
    });

    setSession(res, user.id);
    res.status(201).json({ user: sanitizeUser(user) });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await store.findUserByEmail(String(email || ""));
    if (!user || !(await verifyPassword(password || "", user.passwordHash))) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    setSession(res, user.id);
    res.json({ user: sanitizeUser(user) });
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const email = String(req.body.email || "").trim();
    if (!email) {
      res.status(400).json({ error: "Email is required." });
      return;
    }

    const user = await store.findUserByEmail(email);
    if (!user) {
      res.json({ success: true, message: "If that account exists, reset instructions were prepared." });
      return;
    }

    const token = crypto.randomBytes(24).toString("hex");
    const tokenHash = hashResetToken(token);
    const expiresAt = Date.now() + 1000 * 60 * 30;
    await store.updateUser(user.id, { resetTokenHash: tokenHash, resetTokenExpiresAt: expiresAt });

    const origin = req.headers.origin || `http://localhost:${PORT}`;
    const resetLink = `${origin}/?resetToken=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;

    await mailer.sendMail({
      to: user.email,
      subject: "Spend Smart password reset",
      text: [
        `Hello ${user.name},`,
        ``,
        `Use this link to reset your Spend Smart password:`,
        resetLink,
        ``,
        `This link expires in 30 minutes.`
      ].join("\n"),
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#18364b">
        <h2>Reset your Spend Smart password</h2>
        <p>Hello ${escapeHtml(user.name)},</p>
        <p>Use the link below to choose a new password:</p>
        <p><a href="${escapeHtml(resetLink)}">${escapeHtml(resetLink)}</a></p>
        <p>This link expires in 30 minutes.</p>
      </div>`
    });

    res.json({
      success: true,
      message: "If that account exists, reset instructions were prepared.",
      resetLink
    });
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const email = String(req.body.email || "").trim();
    const token = String(req.body.token || "").trim();
    const newPassword = String(req.body.newPassword || "");

    if (!email || !token || newPassword.length < 6) {
      res.status(400).json({ error: "Email, token, and a new password of at least 6 characters are required." });
      return;
    }

    const user = await store.findUserByEmail(email);
    if (!user || !user.resetTokenHash || !user.resetTokenExpiresAt) {
      res.status(400).json({ error: "Reset request is invalid or expired." });
      return;
    }

    if (user.resetTokenExpiresAt < Date.now() || user.resetTokenHash !== hashResetToken(token)) {
      res.status(400).json({ error: "Reset request is invalid or expired." });
      return;
    }

    await store.updateUser(user.id, {
      passwordHash: await hashPassword(newPassword),
      resetTokenHash: null,
      resetTokenExpiresAt: null
    });

    res.json({ success: true, message: "Password reset successful. You can log in now." });
  });

  app.put("/api/auth/change-password", async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");
    if (!currentPassword || newPassword.length < 6) {
      res.status(400).json({ error: "Current password and a new password of at least 6 characters are required." });
      return;
    }

    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      res.status(401).json({ error: "Current password is incorrect." });
      return;
    }

    await store.updateUser(user.id, {
      passwordHash: await hashPassword(newPassword),
      resetTokenHash: null,
      resetTokenExpiresAt: null
    });

    res.json({ success: true, message: "Password updated successfully." });
  });

  app.post("/api/auth/logout", (req, res) => {
    clearSession(req, res);
    res.json({ success: true });
  });

  app.put("/api/preferences/theme", async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const theme = ALLOWED_THEMES.has(req.body.theme) ? req.body.theme : "light";
    const updated = await store.updateUser(user.id, { theme });
    res.json({ user: sanitizeUser(updated) });
  });

  app.put("/api/preferences/notifications", async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const emailNotifications = req.body.emailNotifications !== false;
    const updated = await store.updateUser(user.id, { emailNotifications });
    res.json({ user: sanitizeUser(updated) });
  });

  app.put("/api/preferences/workspace", async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const updated = await store.updateUser(user.id, {
      weeklyDigest: req.body.weeklyDigest === true,
      compactMode: req.body.compactMode === true
    });
    res.json({ user: sanitizeUser(updated) });
  });

  app.get("/api/transactions", async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    const transactions = await store.listTransactions(user.id);
    res.json({ transactions });
  });

  app.post("/api/transactions", async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const { title, amount, type, category, date, notes = "" } = req.body;
    if (!title || !amount || !type || !category || !date) {
      res.status(400).json({ error: "Title, amount, type, category, and date are required." });
      return;
    }

    const transaction = await store.createTransaction({
      userId: user.id,
      title,
      amount: Number(amount),
      type,
      category,
      date,
      notes
    });

    await sendDataChangeNotification(mailer, user, "created", transaction);

    res.status(201).json({ transaction });
  });

  app.put("/api/transactions/:id", async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const patch = { ...req.body };
    if (patch.amount !== undefined) {
      patch.amount = Number(patch.amount);
    }

    const transaction = await store.updateTransaction(user.id, req.params.id, patch);
    if (!transaction) {
      res.status(404).json({ error: "Transaction not found." });
      return;
    }

    await sendDataChangeNotification(mailer, user, "updated", transaction);

    res.json({ transaction });
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const transaction = await store.deleteTransaction(user.id, req.params.id);
    if (!transaction) {
      res.status(404).json({ error: "Transaction not found." });
      return;
    }

    await sendDataChangeNotification(mailer, user, "deleted", transaction);

    res.json({ transaction });
  });

  app.get("/api/summary", async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const transactions = await store.listTransactions(user.id);
    const summary = buildSummary(transactions, user.monthlyGoal);
    res.json(summary);
  });

  app.get("/api/export/data", async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const transactions = await store.listTransactions(user.id);
    const summary = buildSummary(transactions, user.monthlyGoal);
    res.json({
      exportedAt: new Date().toISOString(),
      user: sanitizeUser(user),
      summary,
      transactions
    });
  });

  app.get("/api/export/profile", async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    res.json({
      exportedAt: new Date().toISOString(),
      user: sanitizeUser(user)
    });
  });

  app.get("*", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
  });

  app.listen(PORT, () => {
    console.log(`Spend Smart running at http://localhost:${PORT}`);
    console.log(`Storage driver: ${driver}`);
    console.log(`Mail notifications: ${mailer.enabled ? "smtp-enabled" : "log-only fallback"}`);
  });
}

function getCookies(req) {
  const cookieHeader = req.headers.cookie || "";
  return cookieHeader.split(";").reduce((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

function toBase64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, "base64").toString("utf8");
}

function signJwt(payload, expiresInSeconds = 60 * 60 * 24 * 7) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSeconds };
  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedBody = toBase64Url(JSON.stringify(body));
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `${encodedHeader}.${encodedBody}.${signature}`;
}

function verifyJwt(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedBody, signature] = parts;
  const expected = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  if (signature !== expected) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedBody));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function setSession(res, userId) {
  const token = signJwt({ sub: userId });
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`);
}

function clearSession(req, res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
}

async function getCurrentUser(req, store) {
  const cookies = getCookies(req);
  const token = cookies[COOKIE_NAME];
  const payload = verifyJwt(token);
  if (!payload?.sub) {
    return null;
  }
  return store.findUserById(payload.sub);
}

async function requireUser(req, res, store) {
  const user = await getCurrentUser(req, store);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return user;
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password, storedHash) {
  return bcrypt.compare(password, storedHash);
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(String(token || "")).digest("hex");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildSummary(items, monthlyGoal) {
  const income = items.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = items.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const balance = income - expenses;

  const categoryTotals = items
    .filter((item) => item.type === "expense")
    .reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

  const monthly = items.reduce((acc, item) => {
    const key = item.date.slice(0, 7);
    if (!acc[key]) {
      acc[key] = { month: key, income: 0, expense: 0 };
    }
    acc[key][item.type] += item.amount;
    return acc;
  }, {});

  const incomeByCategory = items
    .filter((item) => item.type === "income")
    .reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

  return {
    totals: { income, expenses, balance },
    monthlyGoal,
    goalProgress: monthlyGoal > 0 ? Math.max(Math.min((balance / monthlyGoal) * 100, 100), 0) : 0,
    categoryTotals,
    incomeByCategory,
    monthly: Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month)).slice(-6),
    recent: items.slice(0, 6),
    insights: buildInsights(balance, expenses, categoryTotals)
  };
}

function buildInsights(balance, expenses, categoryTotals) {
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const insights = [];
  if (balance > 0) {
    insights.push(`You are currently cash-flow positive by ${Math.round(balance)}.`);
  } else {
    insights.push("Your expenses are currently overtaking income. Consider trimming one large category.");
  }
  if (topCategory) {
    insights.push(`${topCategory[0]} is your biggest expense category right now.`);
  }
  if (expenses === 0) {
    insights.push("Add an expense entry to unlock spending breakdowns and trends.");
  }
  return insights;
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
