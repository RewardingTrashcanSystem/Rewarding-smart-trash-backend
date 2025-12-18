const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT || 5432,
  ssl: {
    rejectUnauthorized: false, // Render Postgres uses SSL
  },
});

const connectDB = async () => {
  try {
    await pool.query("SELECT 1"); // simple test query
    console.log("✅ Connected to PostgreSQL on Render");
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err);
    throw err;
  }
};

module.exports = { pool, connectDB };
