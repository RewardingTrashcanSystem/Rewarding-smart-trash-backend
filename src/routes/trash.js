const express = require("express");
const router = express.Router();
const { sql } = require("../config/db");
const auth = require("../middleware/auth");

// Helper function to calculate points based on trash type
const calculatePoints = (trash_type, item_count) => {
  const pointsMap = {
    metal: 5,
    wet: 2,
    dry: 3,
    plastic: 4,
  };
  return (pointsMap[trash_type] || 1) * item_count;
};

// POST /trashdrops → Record a new trash drop
router.post("/",auth, async (req, res) => {
  const { bin_id, trash_type, item_count } = req.body;
  const user_id = req.user.user_id;

  try {
    // 1. Check if user exists
    const userCheck =
      await sql.query`SELECT * FROM Users WHERE user_id = ${user_id}`;
    if (!userCheck.recordset[0])
      return res.status(400).json({ error: "User not found" });

    // 2. Check if bin exists and is active
    const binCheck =
      await sql.query`SELECT * FROM SmartBins WHERE bin_id = ${bin_id} AND status = 'active'`;
    if (!binCheck.recordset[0])
      return res.status(400).json({ error: "Bin not found or inactive" });

    // 3. Calculate points earned
    const points_earned = calculatePoints(trash_type, item_count);

    // 4. Insert into TrashDrops
    await sql.query`
      INSERT INTO TrashDrops (user_id, bin_id, trash_type, item_count, points_earned)
      VALUES (${user_id}, ${bin_id}, ${trash_type}, ${item_count}, ${points_earned})
    `;

    // 5. Update user total_points
    await sql.query`
      UPDATE Users
      SET total_points = total_points + ${points_earned}
      WHERE user_id = ${user_id}
    `;

    res.status(201).json({ message: "Trash drop recorded", points_earned });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /trashdrops/:user_id → Get all drops of a user
router.get("/:user_id", async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const result = await sql.query`
      SELECT td.drop_id, td.trash_type, td.item_count, td.points_earned, td.drop_time, sb.location AS bin_location
      FROM TrashDrops td
      JOIN SmartBins sb ON td.bin_id = sb.bin_id
      WHERE td.user_id = ${user_id}
      ORDER BY td.drop_time DESC
    `;

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
