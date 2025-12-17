const express = require("express");
const router = express.Router();
const { sql } = require("../config/db");
const auth = require("../middleware/auth");

// Redeem points for a reward
router.post("/", auth, async (req, res) => {
  const { reward_id } = req.body;
  const user_id = req.user.user_id;

  try {
    // 1. Check user exists
    const userResult = await sql.query`
      SELECT total_points FROM Users WHERE user_id = ${user_id}
    `;
    if (!userResult.recordset[0])
      return res.status(400).json({ error: "User not found" });

    const userPoints = userResult.recordset[0].total_points;

    // 2. Check reward exists and is active
    const rewardResult = await sql.query`
      SELECT required_points FROM Rewards WHERE reward_id = ${reward_id} AND active = 1
    `;
    if (!rewardResult.recordset[0])
      return res.status(400).json({ error: "Reward not found or inactive" });

    const requiredPoints = rewardResult.recordset[0].required_points;

    // 3. Check if user has enough points
    if (userPoints < requiredPoints)
      return res.status(400).json({ error: "Not enough points" });

    // 4. Insert into Redemptions
    await sql.query`
      INSERT INTO Redemptions (user_id, reward_id)
      VALUES (${user_id}, ${reward_id})
    `;

    // 5. Deduct points from user
    await sql.query`
      UPDATE Users
      SET total_points = total_points - ${requiredPoints}
      WHERE user_id = ${user_id}
    `;

    res.json({
      message: "Reward redeemed successfully",
      points_deducted: requiredPoints,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all redemptions for a user
router.get("/:user_id", auth, async (req, res) => {
  const user_id = parseInt(req.params.user_id);
  if (req.user.user_id !== user_id) {
    return res.status(403).json({ error: "Access denied" });
  }
  try {
    const result = await sql.query`
      SELECT r.redemption_id, rw.reward_name, rw.required_points, r.redeemed_at
      FROM Redemptions r
      JOIN Rewards rw ON r.reward_id = rw.reward_id
      WHERE r.user_id = ${user_id}
      ORDER BY r.redeemed_at DESC
    `;
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
