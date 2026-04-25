const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const rootDir = path.join(__dirname, "..");
const dbPath = path.join(rootDir, "data", "db.json");
const dbBackupPath = path.join(rootDir, "data", "db.test.backup.json");
const testPort = 3011;
const baseUrl = `http://127.0.0.1:${testPort}`;

async function main() {
  backupDatabase();
  const results = [];
  let serverProcess = null;

  try {
    runCommand("npm", ["run", "build:client"]);
    serverProcess = startServer();
    await waitForHealth();

    const jar = createCookieJar();
    const email = `test_${Math.random().toString(16).slice(2, 10)}@example.com`;

    await runTest(results, "Health check", async () => {
      const response = await requestJson("/api/health", { jar });
      assert(response.ok === true, "Health endpoint did not return ok=true");
    });

    await runTest(results, "Auth me before login", async () => {
      const response = await requestJson("/api/auth/me", { jar });
      assert(response.user === null, "Expected unauthenticated user to be null");
    });

    await runTest(results, "Signup", async () => {
      const response = await requestJson("/api/auth/signup", {
        method: "POST",
        jar,
        body: {
          name: "Test User",
          email,
          password: "secret123",
          monthlyGoal: 5000
        }
      });
      assert(response.user?.email === email, "Signup user email mismatch");
    });

    await runTest(results, "Auth me after signup", async () => {
      const response = await requestJson("/api/auth/me", { jar });
      assert(response.user?.email === email, "Authenticated user email mismatch");
    });

    await runTest(results, "Theme preference update", async () => {
      const response = await requestJson("/api/preferences/theme", {
        method: "PUT",
        jar,
        body: { theme: "sky-blue" }
      });
      assert(response.user?.theme === "sky-blue", "Theme was not updated");
    });

    await runTest(results, "Notification preference update", async () => {
      const response = await requestJson("/api/preferences/notifications", {
        method: "PUT",
        jar,
        body: { emailNotifications: true, targetAlerts: true, overspendingAlerts: true }
      });
      assert(response.user?.emailNotifications === true, "Email notifications not updated");
    });

    await runTest(results, "Workspace preference update", async () => {
      const response = await requestJson("/api/preferences/workspace", {
        method: "PUT",
        jar,
        body: { weeklyDigest: true, compactMode: true }
      });
      assert(response.user?.weeklyDigest === true && response.user?.compactMode === true, "Workspace settings not updated");
    });

    let transactionId = null;

    await runTest(results, "Create transaction", async () => {
      const response = await requestJson("/api/transactions", {
        method: "POST",
        jar,
        body: {
          title: "Salary",
          amount: 18000,
          type: "income",
          category: "Salary",
          date: "2026-04-25",
          notes: "automated test"
        }
      });
      transactionId = response.transaction?.id;
      assert(Boolean(transactionId), "Transaction id missing");
    });

    await runTest(results, "List transactions", async () => {
      const response = await requestJson("/api/transactions", { jar });
      assert(Array.isArray(response.transactions) && response.transactions.length === 1, "Unexpected transaction count");
    });

    await runTest(results, "Summary", async () => {
      const response = await requestJson("/api/summary", { jar });
      assert(response.totals?.balance === 18000, "Summary balance mismatch");
    });

    await runTest(results, "Update transaction", async () => {
      const response = await requestJson(`/api/transactions/${transactionId}`, {
        method: "PUT",
        jar,
        body: { amount: 19000, notes: "updated automated test" }
      });
      assert(response.transaction?.amount === 19000, "Transaction amount not updated");
    });

    await runTest(results, "Export data", async () => {
      const response = await requestJson("/api/export/data", { jar });
      assert(Array.isArray(response.transactions) && response.transactions.length === 1, "Export data transaction count mismatch");
    });

    await runTest(results, "Export profile", async () => {
      const response = await requestJson("/api/export/profile", { jar });
      assert(response.user?.email === email, "Export profile email mismatch");
    });

    await runTest(results, "Change password", async () => {
      const response = await requestJson("/api/auth/change-password", {
        method: "PUT",
        jar,
        body: { currentPassword: "secret123", newPassword: "secret789" }
      });
      assert(response.message?.includes("updated"), "Password change message mismatch");
    });

    await runTest(results, "Logout", async () => {
      const response = await requestJson("/api/auth/logout", {
        method: "POST",
        jar
      });
      assert(response.success === true, "Logout failed");
    });

    const secondJar = createCookieJar();

    await runTest(results, "Login with changed password", async () => {
      const response = await requestJson("/api/auth/login", {
        method: "POST",
        jar: secondJar,
        body: { email, password: "secret789" }
      });
      assert(response.user?.email === email, "Login with changed password failed");
    });

    await runTest(results, "Delete transaction", async () => {
      const response = await requestJson(`/api/transactions/${transactionId}`, {
        method: "DELETE",
        jar: secondJar
      });
      assert(response.transaction?.id === transactionId, "Delete transaction failed");
    });

    await runTest(results, "Forgot/reset password flow", async () => {
      const forgot = await requestJson("/api/auth/forgot-password", {
        method: "POST",
        body: { email }
      });
      const resetLink = forgot.resetLink;
      assert(Boolean(resetLink), "Reset link missing");
      const resetUrl = new URL(resetLink);
      const token = resetUrl.searchParams.get("resetToken");
      const reset = await requestJson("/api/auth/reset-password", {
        method: "POST",
        body: { email, token, newPassword: "secret456" }
      });
      assert(reset.message?.includes("successful"), "Reset password failed");
    });

    await runTest(results, "Homepage runtime", async () => {
      const response = await fetch(baseUrl + "/");
      const html = await response.text();
      assert(response.status === 200 && html.includes("Spend Smart"), "Homepage did not load correctly");
    });
  } finally {
    stopServer(serverProcess);
    restoreDatabase();
    cleanupBackup();
  }

  printResults(results);
  const failed = results.filter((item) => item.status === "FAIL");
  if (failed.length > 0) {
    process.exit(1);
  }
}

function createCookieJar() {
  return { cookie: "" };
}

async function runTest(results, name, fn) {
  try {
    await fn();
    results.push({ name, status: "PASS" });
  } catch (error) {
    results.push({ name, status: "FAIL", details: error.message });
  }
}

async function requestJson(url, { method = "GET", body, jar } = {}) {
  const headers = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (jar?.cookie) {
    headers.Cookie = jar.cookie;
  }

  const response = await fetch(baseUrl + url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    redirect: "manual"
  });

  updateCookieJar(response, jar);
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Non-JSON response from ${url}: ${text.slice(0, 120)}`);
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || `HTTP ${response.status}`);
  }

  return data;
}

function updateCookieJar(response, jar) {
  if (!jar) return;
  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) return;
  jar.cookie = setCookie.split(",").map((part) => part.split(";")[0]).join("; ");
}

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: true
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function startServer() {
  return spawn(process.execPath, ["server/index.js"], {
    cwd: rootDir,
    env: { ...process.env, PORT: String(testPort) },
    stdio: "ignore"
  });
}

function stopServer(serverProcess) {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
}

async function waitForHealth() {
  const start = Date.now();
  while (Date.now() - start < 20000) {
    try {
      const response = await fetch(baseUrl + "/api/health");
      if (response.ok) return;
    } catch {}
    await delay(500);
  }
  throw new Error("Timed out waiting for local test server");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backupDatabase() {
  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, dbBackupPath);
  }
}

function restoreDatabase() {
  if (fs.existsSync(dbBackupPath)) {
    fs.copyFileSync(dbBackupPath, dbPath);
  }
}

function cleanupBackup() {
  if (fs.existsSync(dbBackupPath)) {
    fs.unlinkSync(dbBackupPath);
  }
}

function printResults(results) {
  console.log("");
  console.log("Full project test results:");
  results.forEach((result) => {
    console.log(`- ${result.status} ${result.name}${result.details ? ` -> ${result.details}` : ""}`);
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
