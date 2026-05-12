/**
 * DATA CLEANUP SCRIPT
 * Deletes all Applications and Transactions from the database,
 * and removes application-related files under server/uploads (documents, visa-files).
 * Does not remove country images, profile photos, or CMS page media.
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config({ path: path.join(__dirname, ".env") });

const Application = require("./models/Application");
const Transaction = require("./models/Transaction");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Remove directory contents and recreate an empty directory. */
function emptyAndRecreateDir(relativeToServer) {
  const dir = path.join(__dirname, relativeToServer);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  ensureDir(dir);
}

async function clearData() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/visa-voyage";
    console.log("Connecting to database...");
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 20_000,
    });
    console.log("✅ Connected to MongoDB.");

    const appResult = await Application.deleteMany({});
    console.log(`🗑️ Deleted ${appResult.deletedCount} Applications.`);

    const txResult = await Transaction.deleteMany({});
    console.log(`🗑️ Deleted ${txResult.deletedCount} Transactions.`);

    emptyAndRecreateDir(path.join("uploads", "documents"));
    emptyAndRecreateDir(path.join("uploads", "visa-files"));
    console.log("📂 Cleared uploads/documents and uploads/visa-files.");

    const uploadsRoot = path.join(__dirname, "uploads");
    if (fs.existsSync(uploadsRoot)) {
      for (const name of fs.readdirSync(uploadsRoot)) {
        const filePath = path.join(uploadsRoot, name);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      }
    }

    console.log("\n✨ Application data and related upload files have been cleared.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
    process.exit(1);
  }
}

clearData();
