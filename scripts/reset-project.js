const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const rootDir = path.join(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const initialDbPath = path.join(dataDir, "db.initial.json");
const activeDbPath = path.join(dataDir, "db.json");

const removableFiles = [
  path.join(rootDir, "server-auth.log"),
  path.join(rootDir, "server-mail.log"),
  path.join(rootDir, "temp-mail.log"),
  path.join(rootDir, "temp-mail.err.log")
];

function ensureInitialSnapshot() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(initialDbPath)) {
    fs.writeFileSync(initialDbPath, JSON.stringify({ users: [], transactions: [] }, null, 2));
  }
}

function resetDatabase() {
  ensureInitialSnapshot();
  fs.copyFileSync(initialDbPath, activeDbPath);
}

function cleanupRuntimeFiles() {
  removableFiles.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}

function runBuild() {
  const result = spawnSync("npm", ["run", "build:client"], {
    cwd: rootDir,
    stdio: "inherit",
    shell: true
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function main() {
  resetDatabase();
  cleanupRuntimeFiles();

  if (process.argv.includes("--with-build")) {
    runBuild();
  }

  console.log("Spend Smart project reset to its initial data state.");
  console.log("Database restored from data/db.initial.json.");
  console.log("Temporary mail and server log files removed.");
  if (process.argv.includes("--with-build")) {
    console.log("Client bundle rebuilt.");
  }
}

main();
