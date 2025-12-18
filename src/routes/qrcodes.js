const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const auth = require("../middleware/auth");
// Helper function to calculate points
const calculatePoints = (trash_type, item_count) => {
  const pointsMap = { metal: 5, wet: 2, dry: 3, plastic: 4 };
  return (pointsMap[trash_type] || 1) * item_count;
};

// POST /qrcodes/scan
// Called when user scans a QR code
router.post("/scan",auth, async (req, res) => {
  const { qr_id, trash_type, item_count } = req.body;
  const user_id = req.user.user_id;
  try {
    // 1. Check user exists
    const userResult = await pool.query(
      `SELECT * FROM users WHERE user_id = $1`,
      [user_id]
    );
    if (userResult.rows.length === 0)
      return res.status(400).json({ error: "User not found" });

    // 2. Check QR code exists and is not used
    const qrResult = await pool.query(
      `SELECT * FROM qrcodes WHERE qr_id = $1 AND is_used = FALSE`,
      [qr_id]
    );
    if (qrResult.rows.length === 0)
      return res.status(400).json({ error: "QR code invalid or already used" });

    const bin_id = qrResult.row[0].bin_id;

    // 3. Calculate points
    const points_earned = calculatePoints(trash_type, item_count);

    // 4. Insert TrashDrop
    await pool.query(
      `INSERT INTO trashdrops (user_id, bin_id, trash_type, item_count, points_earned, drop_time)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [user_id, bin_id, trash_type, item_count, points_earned]
    );

    // 5. Update user total points
    await pool.query(
      `UPDATE users
       SET total_points = total_points + $1
       WHERE user_id = $2`,
      [points_earned, user_id]
    );

    // 6. Mark QR code as used
    await pool.query(`UPDATE qrcodes SET is_used = TRUE WHERE qr_id = $1`, [
      qr_id,
    ]);

    res.json({ message: "Trash drop recorded successfully", points_earned });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /qrcodes/:bin_id
// List QR codes for a bin
router.get("/:bin_id", async (req, res) => {
  const bin_id = req.params.bin_id;

  try {
    const result = await pool.query(
      `SELECT * FROM qrcodes
       WHERE bin_id = $1
       ORDER BY created_at DESC`,
      [bin_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
