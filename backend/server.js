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

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS."));
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json({ limit: "10kb" }));
app.use("/api/contact", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many messages. Please try again in 15 minutes." }
}));

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
  createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model("Contact", contactSchema);

const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

async function sendContactNotification(contact) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    console.log("Email notification skipped: RESEND_API_KEY or RESEND_FROM_EMAIL is not configured.");
    return false;
  }

  const recipient = process.env.CONTACT_TO_EMAIL || "induprakashdeopandey@gmail.com";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to: [recipient],
      reply_to: contact.email,
      subject: `New portfolio message from ${contact.name}`,
      text: `Name: ${contact.name}\nEmail: ${contact.email}\n\nMessage:\n${contact.message}`,
      html: `<h2>New portfolio message</h2><p><strong>Name:</strong> ${escapeHtml(contact.name)}</p><p><strong>Email:</strong> ${escapeHtml(contact.email)}</p><p><strong>Message:</strong></p><p>${escapeHtml(contact.message).replace(/\n/g, "<br>")}</p>`
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Email provider returned ${response.status}: ${detail.slice(0, 300)}`);
  }
  return true;
}

app.get("/health", (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "degraded",
    service: "indu-portfolio-api",
    database: databaseConnected ? "connected" : "disconnected"
  });
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message, company } = req.body || {};

    // Hidden honeypot: bots often fill every form field. Accept quietly without saving.
    if (typeof company === "string" && company.trim()) {
      return res.status(202).json({ message: "Message received." });
    }

    if (typeof name !== "string" || typeof email !== "string" ||
        typeof message !== "string" || !name.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        !message.trim() || name.length > 80 || email.length > 254 ||
        message.length > 3000) {
      return res.status(400).json({
        message: "Please enter a valid name, email, and message."
      });
    }

    const contact = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim()
    };
    await Contact.create(contact);

    let notificationSent = false;
    try {
      notificationSent = await sendContactNotification(contact);
    } catch (emailError) {
      // A notification failure must not discard a message already saved in MongoDB.
      console.error("Contact notification failed:", emailError.message);
    }

    return res.status(201).json({
      message: "Message saved successfully.",
      notificationSent
    });
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
  if (error.type === "entity.too.large") {
    return res.status(413).json({ message: "Request is too large." });
  }
  return res.status(400).json({ message: "Invalid request." });
});

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is required.");
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => console.log(`Portfolio API listening on port ${port}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
