// src/routes/rewards.js
const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const adminAuth = require("../middleware/adminAuth");

// Get all rewards (accessible to all)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM rewards 
       WHERE active = TRUE 
       ORDER BY required_points ASC`
    );

    res.json(result.rows);
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
    await pool.query(
      `INSERT INTO rewards (reward_name, description, required_points, active)
       VALUES ($1, $2, $3, TRUE)`,
      [reward_name, description, required_points]
    );
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
     await pool.query(
       `UPDATE rewards
       SET reward_name = COALESCE($1, reward_name),
           description = COALESCE($2, description),
           required_points = COALESCE($3, required_points),
           active = COALESCE($4, active)
       WHERE reward_id = $5`,
       [reward_name, description, required_points, active, reward_id]
     );
    res.json({ message: "Reward updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
