// src/routes/rewards.js
const express = require("express");
const router = express.Router();
const { sql } = require("../config/db");
const adminAuth = require("../middleware/adminAuth");

// Get all rewards (accessible to all)
router.get("/", async (req, res) => {
  try {
    const result = await sql.query`
      SELECT * FROM Rewards WHERE active = 1 ORDER BY required_points ASC
    `;
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create a reward (admin only)
router.post("/", adminAuth, async (req, res) => {
  const { reward_name, description, required_points } = req.body;
  const admin_id = req.user.user_id;

  try {
    await sql.query`
      INSERT INTO Rewards (reward_name, description, required_points)
      VALUES (${reward_name}, ${description}, ${required_points})
    `;
    res.status(201).json({ message: "Reward created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update reward (admin only)
router.patch("/:reward_id", adminAuth, async (req, res) => {
  const { reward_id } = req.params;
  const { reward_name, description, required_points, active } = req.body;

  try {
    await sql.query`
      UPDATE Rewards
      SET reward_name = COALESCE(${reward_name}, reward_name),
          description = COALESCE(${description}, description),
          required_points = COALESCE(${required_points}, required_points),
          active = COALESCE(${active}, active)
      WHERE reward_id = ${reward_id}
    `;
    res.json({ message: "Reward updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
