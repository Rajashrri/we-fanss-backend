const mongoose = require("mongoose");

require("dotenv").config({
  path: process.env.NODE_ENV === "development" ? ".env.development" : ".env.production"
})


console.log(process.env.MONGO_URL)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      autoIndex: true,
    });

    console.log("✅ MongoDB connected successfully");

  } catch (error) {
    console.error("❌ Initial MongoDB connection failed:", error.message);
    process.exit(1);
  }
};


mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB runtime error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔁 MongoDB reconnected");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 MongoDB connection closed due to app termination");
  process.exit(0);
});

module.exports = connectDB;
