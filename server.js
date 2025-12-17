require("dotenv").config();
const app = require("./src/app");
const { connectDB } = require("./src/config/db");

connectDB();

const PORT = process.env.DB_PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

