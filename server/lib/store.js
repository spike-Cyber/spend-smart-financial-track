const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  monthlyGoal: Number,
  theme: { type: String, default: "light" },
  emailNotifications: { type: Boolean, default: true },
  weeklyDigest: { type: Boolean, default: false },
  compactMode: { type: Boolean, default: false },
  resetTokenHash: String,
  resetTokenExpiresAt: Number
});

const TransactionSchema = new mongoose.Schema({
  userId: String,
  title: String,
  amount: Number,
  type: String,
  category: String,
  date: String,
  notes: String
});

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
const TransactionModel = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], transactions: [] }, null, 2));
  }
}

function readJsonDb() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeJsonDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

async function connectMongo() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  await mongoose.connect(mongoUri, { dbName: process.env.MONGO_DB_NAME || "spend-smart" });
  return true;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    monthlyGoal: user.monthlyGoal,
    theme: user.theme || "light",
    emailNotifications: user.emailNotifications !== false,
    weeklyDigest: user.weeklyDigest === true,
    compactMode: user.compactMode === true
  };
}

function makeId() {
  return crypto.randomUUID();
}

class JsonStore {
  async findUserByEmail(email) {
    const db = readJsonDb();
    return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserById(id) {
    const db = readJsonDb();
    return db.users.find((user) => user.id === id) || null;
  }

  async createUser(payload) {
    const db = readJsonDb();
    const user = {
      id: makeId(),
      theme: "light",
      emailNotifications: true,
      weeklyDigest: false,
      compactMode: false,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      ...payload
    };
    db.users.push(user);
    writeJsonDb(db);
    return user;
  }

  async updateUser(id, patch) {
    const db = readJsonDb();
    const index = db.users.findIndex((user) => user.id === id);
    if (index === -1) return null;
    db.users[index] = { ...db.users[index], ...patch };
    writeJsonDb(db);
    return db.users[index];
  }

  async listTransactions(userId) {
    const db = readJsonDb();
    return db.transactions
      .filter((item) => item.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async createTransaction(payload) {
    const db = readJsonDb();
    const transaction = { id: makeId(), ...payload };
    db.transactions.push(transaction);
    writeJsonDb(db);
    return transaction;
  }

  async updateTransaction(userId, transactionId, patch) {
    const db = readJsonDb();
    const index = db.transactions.findIndex((item) => item.id === transactionId && item.userId === userId);
    if (index === -1) return null;
    db.transactions[index] = { ...db.transactions[index], ...patch };
    writeJsonDb(db);
    return db.transactions[index];
  }

  async deleteTransaction(userId, transactionId) {
    const db = readJsonDb();
    const index = db.transactions.findIndex((item) => item.id === transactionId && item.userId === userId);
    if (index === -1) return null;
    const [removed] = db.transactions.splice(index, 1);
    writeJsonDb(db);
    return removed;
  }
}

class MongoStore {
  normalizeUser(user) {
    if (!user) return null;
    const plain = user.toObject ? user.toObject() : user;
    return {
      id: plain.id || plain._id.toString(),
      name: plain.name,
      email: plain.email,
      passwordHash: plain.passwordHash,
      monthlyGoal: plain.monthlyGoal,
      theme: plain.theme || "light",
      emailNotifications: plain.emailNotifications !== false,
      weeklyDigest: plain.weeklyDigest === true,
      compactMode: plain.compactMode === true
    };
  }

  normalizeTransaction(transaction) {
    if (!transaction) return null;
    const plain = transaction.toObject ? transaction.toObject() : transaction;
    return {
      id: plain.id || plain._id.toString(),
      userId: plain.userId,
      title: plain.title,
      amount: plain.amount,
      type: plain.type,
      category: plain.category,
      date: plain.date,
      notes: plain.notes || ""
    };
  }

  async findUserByEmail(email) {
    return this.normalizeUser(await UserModel.findOne({ email: new RegExp(`^${email}$`, "i") }));
  }

  async findUserById(id) {
    return this.normalizeUser(await UserModel.findOne({ $or: [{ id }, { _id: id.match(/^[a-f0-9]{24}$/i) ? id : null }] }));
  }

  async createUser(payload) {
    const user = await UserModel.create({
      id: makeId(),
      theme: "light",
      emailNotifications: true,
      weeklyDigest: false,
      compactMode: false,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      ...payload
    });
    return this.normalizeUser(user);
  }

  async updateUser(id, patch) {
    const user = await UserModel.findOneAndUpdate({ id }, patch, { new: true });
    return this.normalizeUser(user);
  }

  async listTransactions(userId) {
    const transactions = await TransactionModel.find({ userId }).sort({ date: -1, _id: -1 });
    return transactions.map((item) => this.normalizeTransaction(item));
  }

  async createTransaction(payload) {
    const transaction = await TransactionModel.create({ id: makeId(), ...payload });
    return this.normalizeTransaction(transaction);
  }

  async updateTransaction(userId, transactionId, patch) {
    const transaction = await TransactionModel.findOneAndUpdate({ userId, id: transactionId }, patch, { new: true });
    return this.normalizeTransaction(transaction);
  }

  async deleteTransaction(userId, transactionId) {
    const transaction = await TransactionModel.findOneAndDelete({ userId, id: transactionId });
    return this.normalizeTransaction(transaction);
  }
}

async function createStore() {
  try {
    const connected = await connectMongo();
    if (connected) {
      return { driver: "mongo", store: new MongoStore(), sanitizeUser };
    }
  } catch (error) {
    console.warn("MongoDB connection failed, falling back to local JSON storage.");
  }

  ensureDataFile();
  return { driver: "json", store: new JsonStore(), sanitizeUser };
}

module.exports = { createStore, sanitizeUser };
