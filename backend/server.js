require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",").map((origin) => origin.trim()).filter(Boolean);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS."));
  }
}));
app.use(express.json({ limit: "10kb" }));
app.use("/api/contact", rateLimit({
  windowMs: 15 * 60 * 1000, limit: 5,
  standardHeaders: "draft-7", legacyHeaders: false
}));

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
  createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model("Contact", contactSchema);

app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "indu-portfolio-api" })
);

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (typeof name !== "string" || typeof email !== "string" ||
        typeof message !== "string" || !name.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !message.trim() || name.length > 80 || email.length > 254 ||
        message.length > 3000) {
      return res.status(400).json({
        message: "Please enter a valid name, email, and message."
      });
    }
    await Contact.create({
      name: name.trim(), email: email.trim(), message: message.trim()
    });
    return res.status(201).json({ message: "Message saved successfully." });
  } catch (error) {
    console.error("Contact submission failed:", error.message);
    return res.status(500).json({
      message: "Could not save your message right now."
    });
  }
});

app.use((error, _req, res, _next) => {
  if (error.message === "Origin is not allowed by CORS.") {
    return res.status(403).json({ message: error.message });
  }
  return res.status(400).json({ message: "Invalid request." });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () =>
      console.log(`Portfolio API listening on port ${port}`)
    );
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
