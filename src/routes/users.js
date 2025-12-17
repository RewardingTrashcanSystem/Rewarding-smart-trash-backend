const express = require("express");
const router = express.Router();
const { sql } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register User
router.post("/register", async (req, res) => {
  const { full_name, username, phone_hash } = req.body;

  try {
    // Hash phone number
    const hashedPhone = await bcrypt.hash(phone_hash, 10);

    // Insert user
    await sql.query`
      INSERT INTO Users (full_name, username, phone_hash)
      VALUES (${full_name}, ${username}, ${hashedPhone})
    `;

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { username, phone_hash } = req.body;

  try {
    const result = await sql.query`
      SELECT * FROM Users WHERE username = ${username}
    `;

    const user = result.recordset[0];
    if (!user) return res.status(400).json({ error: "User not found" });

    // Compare phone number
    const valid = await bcrypt.compare(phone_hash, user.phone_hash); // assuming phone_hash as password for now
    if (!valid) return res.status(400).json({ error: "Invalid phone number" });

    // Create JWT token
    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, is_admin: user.is_admin },
      "your_secret_key",
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get User Info
router.get("/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await sql.query`
      SELECT user_id, full_name, username, total_points, created_at
      FROM Users
      WHERE user_id = ${userId}
    `;
    if (!result.recordset[0])
      return res.status(404).json({ error: "User not found" });

    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
