// src/middleware/adminAuth.js
const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token
  if (!token) return res.status(401).json({ error: "Token required" });

  try {
    const decoded = jwt.verify(token, "your_secret_key"); // same key used in login
    if (!decoded.is_admin)
      return res.status(403).json({ error: "Admin access required" });

    req.user = decoded; // store decoded info for use in API
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = adminAuth;
