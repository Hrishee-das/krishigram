import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";

dotenv.config({ path: "./config.env" });

// Database Connection
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB)
  .then(() => {
    console.log("✅ DB connection successful!!");
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err);
  });

// Initialize Express app
const app = express();

// Port
const PORT = process.env.PORT || 7000;

// Start server
app.listen(PORT, () => {
  if (process.env.NODE_ENV === "production") {
    console.log(`🚀 Server running in PRODUCTION on port ${PORT}`);
  } else {
    console.log(
      `🚀 Server running in DEVELOPMENT at http://127.0.0.1:${PORT}/`,
    );
  }
});
