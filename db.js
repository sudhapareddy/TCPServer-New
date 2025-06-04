const mongoose = require("mongoose");

require("dotenv").config(); // safe for local, ignored in Railway

const mongoURI = process.env.MONGO_URI;

console.log("MONGO_URI (sanitized):", mongoURI?.slice(0, 30) + "...");

console.log("🔍 MONGO_URI (raw):", process.env.MONGO_URI);
console.log("✅ Type of MONGO_URI:", typeof process.env.MONGO_URI);

if (!mongoURI) {
  console.error("❌ MONGO_URI is not defined");
  process.exit(1);
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("✅ Connected to MongoDB Atlas");
});

module.exports = { mongoose, db };
