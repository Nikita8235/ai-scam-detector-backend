const express = require("express");
const cors = require("cors");
require("dotenv").config();

console.log("MONGODB_URI =", process.env.MONGODB_URI);
console.log("JWT_SECRET =", process.env.JWT_SECRET);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database
const connectDB = require("./config/db");
connectDB();

// Routes
const authRoutes = require("./routes/authRoutes");
const scamRoutes = require("./routes/scamRoutes");


app.use("/api/auth", authRoutes);
app.use("/api/scam", scamRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Scam Detection Backend Running 🚀",
  });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});