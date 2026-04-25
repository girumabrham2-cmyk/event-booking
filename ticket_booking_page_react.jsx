// 🚀 PRODUCTION-READY EVENT BOOKING SYSTEM
// Stack: React + Node.js + MongoDB + JWT + Payments + Email + QR + Admin + Analytics

// ================= BACKEND (Node.js + Express) =================

// Install:
// npm install express mongoose cors jsonwebtoken bcryptjs stripe nodemailer qrcode dotenv

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Stripe = require("stripe");
const nodemailer = require("nodemailer");
const QRCode = require("qrcode");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

const stripe = new Stripe(process.env.STRIPE_SECRET);

// ================= MODELS =================

const User = mongoose.model("User", new mongoose.Schema({
  email: String,
  password: String,
  isAdmin: { type: Boolean, default: false }
}));

const Event = mongoose.model("Event", new mongoose.Schema({
  title: String,
  date: String,
  price: Number,
  tickets: Number
}));

const Booking = mongoose.model("Booking", new mongoose.Schema({
  userId: String,
  eventId: String,
  qrCode: String,
  createdAt: { type: Date, default: Date.now }
}));

// ================= AUTH =================

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.sendStatus(403);
  }
};

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashed });
  res.json(user);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
  res.json({ token });
});

// ================= EVENTS =================

app.post("/events", authMiddleware, async (req, res) => {
  if (!req.user.isAdmin) return res.sendStatus(403);
  const event = await Event.create(req.body);
  res.json(event);
});

app.get("/events", async (req, res) => {
  res.json(await Event.find());
});

// ================= PAYMENT (Stripe example) =================

app.post("/create-checkout-session", authMiddleware, async (req, res) => {
  const { eventId } = req.body;
  const event = await Event.findById(eventId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: event.title },
        unit_amount: event.price * 100
      },
      quantity: 1
    }],
    mode: "payment",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel"
  });

  res.json({ url: session.url });
});

// ================= BOOKING + QR + EMAIL =================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  }
});

app.post("/confirm-booking", authMiddleware, async (req, res) => {
  const { eventId } = req.body;

  const qr = await QRCode.toDataURL(`User:${req.user.id}-Event:${eventId}`);

  const booking = await Booking.create({
    userId: req.user.id,
    eventId,
    qrCode: qr
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: req.user.email,
    subject: "Your Ticket",
    html: `<h1>Your Event Ticket</h1><img src="${qr}" />`
  });

  res.json({ message: "Booking confirmed", booking });
});

// ================= ANALYTICS =================

app.get("/analytics", authMiddleware, async (req, res) => {
  if (!req.user.isAdmin) return res.sendStatus(403);

  const totalBookings = await Booking.countDocuments();
  const events = await Event.find();

  res.json({ totalBookings, events });
});

app.listen(5000, () => console.log("Server running"));

// ================= FRONTEND (Key Features) =================

// - Login / Signup pages (store JWT)
// - Event listing page
// - Payment redirect (Stripe or Chapa API)
// - Success page → call /confirm-booking
// - Show QR ticket to user
// - Admin dashboard (create event + analytics)

// ================= CHAPA (ETHIOPIA PAYMENT) =================

// Replace Stripe with Chapa:
// https://developer.chapa.co/
// Use fetch to initialize payment

// ================= DEPLOYMENT =================

// FRONTEND: Vercel
// BACKEND: Render / Railway
// DATABASE: MongoDB Atlas
// STORAGE: AWS S3 (optional for images)

// ================= ENV VARIABLES =================

// MONGO_URI=
// JWT_SECRET=
// STRIPE_SECRET=
// EMAIL=
// EMAIL_PASS=

// ================= NEXT LEVEL =================

// - Role-based dashboards
// - Seat selection system
// - Mobile app (React Native)
// - SMS notifications (Twilio / local APIs)
