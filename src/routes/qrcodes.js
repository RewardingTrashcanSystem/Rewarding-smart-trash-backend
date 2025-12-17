const express = require("express");
const router = express.Router();
const { sql } = require("../config/db");
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
    const userResult =
      await sql.query`SELECT * FROM Users WHERE user_id = ${user_id}`;
    if (!userResult.recordset[0])
      return res.status(400).json({ error: "User not found" });

    // 2. Check QR code exists and is not used
    const qrResult = await sql.query`
      SELECT * FROM QRCodes WHERE qr_id = ${qr_id} AND is_used = 0
    `;
    if (!qrResult.recordset[0])
      return res.status(400).json({ error: "QR code invalid or already used" });

    const bin_id = qrResult.recordset[0].bin_id;

    // 3. Calculate points
    const points_earned = calculatePoints(trash_type, item_count);

    // 4. Insert TrashDrop
    await sql.query`
      INSERT INTO TrashDrops (user_id, bin_id, trash_type, item_count, points_earned)
      VALUES (${user_id}, ${bin_id}, ${trash_type}, ${item_count}, ${points_earned})
    `;

    // 5. Update user total points
    await sql.query`
      UPDATE Users SET total_points = total_points + ${points_earned} WHERE user_id = ${user_id}
    `;

    // 6. Mark QR code as used
    await sql.query`
      UPDATE QRCodes SET is_used = 1 WHERE qr_id = ${qr_id}
    `;

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
    const result = await sql.query`
      SELECT * FROM QRCodes WHERE bin_id = ${bin_id} ORDER BY created_at DESC
    `;
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
