const path = require("path");
const { execSync, spawn, spawnSync } = require("child_process");

const rootDir = path.join(__dirname, "..");
const port = 3000;
const baseUrl = `http://127.0.0.1:${port}`;

async function main() {
  runCommand(process.execPath, [path.join("scripts", "reset-project.js"), "--with-build"]);
  killExistingPortListener(port);
  startServer();
  await waitForHealth();

  console.log("Spend Smart reset, rebuilt, and restarted successfully.");
  console.log(`Health endpoint: ${baseUrl}/api/health`);
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

function killExistingPortListener(targetPort) {
  if (process.platform !== "win32") {
    return;
  }

  try {
    const output = execSync(`netstat -ano | findstr :${targetPort}`, {
      cwd: rootDir,
      stdio: ["ignore", "pipe", "ignore"],
      shell: true
    }).toString();

    const pids = [...new Set(output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => line.includes("LISTENING"))
      .map((line) => line.split(/\s+/).pop())
      .filter(Boolean))];

    pids.forEach((pid) => {
      execSync(`taskkill /PID ${pid} /F`, {
        cwd: rootDir,
        stdio: ["ignore", "ignore", "ignore"],
        shell: true
      });
    });
  } catch {
    // No active listener on the target port.
  }
}

function startServer() {
  const child = spawn(process.execPath, ["server/index.js"], {
    cwd: rootDir,
    env: { ...process.env, PORT: String(port) },
    detached: true,
    stdio: "ignore",
    windowsHide: true
  });

  child.unref();
}

async function waitForHealth() {
  const start = Date.now();
  while (Date.now() - start < 20000) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        return;
      }
    } catch {}
    await delay(500);
  }
  throw new Error("Timed out waiting for the restarted server");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
