// src/routes/smartbins.js
const express = require("express");
const router = express.Router();
const { sql } = require("../config/db");
const adminAuth = require("../middleware/adminAuth");

// Get all bins (all users)
router.get("/", async (req, res) => {
  try {
    const result =
      await sql.query`SELECT * FROM SmartBins ORDER BY created_at DESC`;
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new bin (admin only)
router.post("/", adminAuth, async (req, res) => {
  const { location, status } = req.body;
  const admin_id = req.user.user_id;

  try {
    await sql.query`
      INSERT INTO SmartBins (location, status, created_at)
      VALUES (${location}, ${status || "active"}, ${admin_id})
    `;
    res.status(201).json({ message: "Smart bin created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update bin status (admin only)
router.patch("/:bin_id/status", adminAuth, async (req, res) => {
  const bin_id = req.params.bin_id;
  const { status } = req.body;

  try {
    await sql.query`
      UPDATE SmartBins
      SET status = ${status}
      WHERE bin_id = ${bin_id}
    `;
    res.json({ message: "Bin status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get bin details (all users)
router.get("/:bin_id", async (req, res) => {
  const bin_id = req.params.bin_id;

  try {
    const result =
      await sql.query`SELECT * FROM SmartBins WHERE bin_id = ${bin_id}`;
    if (!result.recordset[0])
      return res.status(404).json({ error: "Bin not found" });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
