// backend/src/app.js
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Middleware
app.use(cors({
    origin: ["https://campus-ride-frontend.vercel.app"], // Update this with your actual Vercel domain later
    methods: ["POST", "GET"],
    credentials: true
}));
app.use(express.json());

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.error("DB Error:", err));

app.get("/", (req, res) => {
    res.json("CampusRide Backend is Live!");
});

// IMPORTANT: Do NOT use app.listen()
module.exports = app;