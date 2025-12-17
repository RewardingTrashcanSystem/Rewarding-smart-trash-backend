const sql = require("mssql");

// ✅ First log your environment variables
console.log("ENV:", {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
});

// ✅ Then define your config object
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT), // convert to number
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};


const connectDB = async () => {
  try {
    await sql.connect(config);
    console.log("✅ Connected to SQL Server (TCP/IP)");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
};

module.exports = { sql, connectDB };

