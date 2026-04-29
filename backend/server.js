const express = require('express'); // 1. Import the tool
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express(); // 2. DEFINE THE APP (This is what was missing!)

// 3. Use the app for middleware
app.use(cors());
app.use(express.json());

app.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



/*app.get("/", (req, res) => {
    res.send("API is working!");
});
/*app.get("/events", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});*/

// 4. Define your connection and port
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

// 5. Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    
    mongoose.connect(MONGO_URI)
        .then(() => console.log("✅ MongoDB Connected"))
        .catch(err => console.log("❌ MongoDB Error:", err));
});