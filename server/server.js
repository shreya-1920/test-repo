const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const equipmentRoutes = require("./routes/equipmentRoutes");
const rentalRoutes = require("./routes/rentalRoutes");
app.use(cors());
app.use(express.json());
app.use("/api/equipment", equipmentRoutes);
app.use("/api/rentals", rentalRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "AV Equipment Rental API is running",
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });