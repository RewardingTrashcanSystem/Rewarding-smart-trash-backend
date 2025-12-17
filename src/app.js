const express = require("express");
const cors = require("cors");

const app = express();
const userRoutes = require("./routes/users");
const trashRoutes = require("./routes/trash");
const rewardRoutes = require("./routes/rewards")
const redemptionRoutes = require("./routes/redemptions")
const smartbinsRoutes = require("./routes/smartbins")
const qrcodesRoutes = require("./routes/qrcodes")


app.use(cors({
    origin: '*',
    
}));
app.use(express.json());

app.use("/users", userRoutes);
app.use("/trashdrops", trashRoutes);
app.use("/rewards", rewardRoutes);
app.use("/redemptions", redemptionRoutes);
app.use("/smartbins", smartbinsRoutes);
app.use("/qrcodes", qrcodesRoutes);


module.exports = app;
