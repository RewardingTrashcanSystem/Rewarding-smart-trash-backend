const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST?.trim(),
  user: process.env.PGUSER?.trim(),
  password: process.env.PGPASSWORD?.trim(),
  database: process.env.PGDATABASE?.trim(),
  port: Number(process.env.PGPORT) || 5432,
  ssl: {
    rejectUnauthorized: false, // required by Render
  },
});

const connectDB = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Connected to PostgreSQL on Render");
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err);
    throw err;
  }
};

module.exports = { pool, connectDB };
