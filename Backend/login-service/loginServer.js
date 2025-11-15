require("dotenv").config();
const express = require("express");
const cors = require("cors");
const loginRoutes = require("./routes/loginRoute");
const registerRoutes = require("./routes/registerRoute");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(process.env.DATABASE_PATH || "./users.sqlite", (err) => 
{
  if (err) console.error("DB Error:", err);
  else console.log("Auth DB connected.");
});

app.set("db", db);

app.use("/api/register", registerRoutes);
app.use("/api/login", loginRoutes);

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => 
{
  console.log(`Auth service running on http://localhost:${PORT}`);
});

module.exports = app;