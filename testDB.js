require("dotenv").config();

const { sql, connectDB } = require("./src/config/db");

const testQuery = async () => {
  try {
    await connectDB();
    const result = await sql.query`SELECT GETDATE() AS CurrentDate`;
    console.log("✅ Query Result:", result.recordset);
    process.exit(0);
  } catch (err) {
    console.error("❌ Query failed:", err);
    process.exit(1);
  }
};

testQuery();
