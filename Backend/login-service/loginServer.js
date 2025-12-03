// // loginServer.js

// const path = require("path");
// require("dotenv").config({ 
//   path: path.join(__dirname, ".env"),
//   debug: true 
// });

// // Confirm env is loaded 
// console.log("JWT_SECRET:", process.env.JWT_SECRET ? "LOADED" : "MISSING");
// console.log("DATABASE_PATH from .env:", process.env.DATABASE_PATH || "Not set");

// // db PATH FIX
// const dbPath = process.env.DATABASE_PATH 
//   ? path.resolve(__dirname, process.env.DATABASE_PATH)
//   : path.join(__dirname, "db", "login.sqlite");

// console.log("Final DB Path:", dbPath);

// const jwt = require("jsonwebtoken");
// const express = require("express");
// const cors = require("cors");
// const loginRoutes = require("./routes/loginRoute");
// const registerRoutes = require("./routes/registerRoute");

// // REMOVED: Duplicate database connection
// // loginModel.js already creates the DB connection
// // No need to create another one here

// const app = express();
// app.use(cors());
// app.use(express.json());

// // REMOVED: app.set("db", db);
// // Use the db from loginModel instead

// app.use("/api/register", registerRoutes);
// app.use("/api/login", loginRoutes);

// app.get("/api/me", (req, res) => 
// {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) 
//   {
//     return res.status(401).json({ message: "No token provided" });
//   }

//   const JWT_SECRET = process.env.JWT_SECRET;
//   jwt.verify(token, JWT_SECRET, (err, decoded) => 
//   {
//     if (err) 
//     {
//       return res.status(403).json({ message: "Invalid token" });
//     }

//     // Use db from loginModel
//     const { db } = require("./models/loginModel");
//     db.get(
//       "SELECT id, username, email FROM users WHERE id = ?",
//       [decoded.id],
//       (err, user) => {
//         if (err || !user) {
//           return res.status(404).json({ message: "User not found" });
//         }
//         res.json(user);
//       }
//     );
//   });
// });

// // Only start server if NOT in test mode
// const PORT = process.env.PORT || 8001;
// if (process.env.NODE_ENV !== 'test') 
// {
//   app.listen(PORT, () => 
//   {
//     console.log(`Auth service running on port ${PORT}`);
//   });
// }

// module.exports = app;

/**
 * @file loginServer.js
 * @description Entry point for the Login microservice.
 * Handles registration and login for users.
 */
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase, getDb } = require('./setup'); // assumes setup exports initializeDatabase and getDb
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Replace with your actual Vercel frontend URL
const FRONTEND_URL = "https://your-frontend.vercel.app";

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

// ----- ROUTES -----

// REGISTER
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    const db = getDb();
    const existing = await db.get("SELECT * FROM users WHERE email = ?", email);
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", 
                 username, email, hashedPassword);

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: "Email/username and password required" });

    const db = getDb();
    const user = await db.get("SELECT * FROM users WHERE email = ? OR username = ?", identifier, identifier);
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    // generate JWT
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// PORT
const PORT = process.env.PORT || 7001;

// START SERVER
initializeDatabase().then(() => {
  if (require.main === module) {
    app.listen(PORT, () => console.log(`Login service running on port ${PORT}`));
  }
});

module.exports = app;

