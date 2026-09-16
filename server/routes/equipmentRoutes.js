const express = require("express");
const Equipment = require("../models/Equipment");

const router = express.Router();

// Get all equipment
router.get("/", async (req, res) => {
  try {
    const equipment = await Equipment.find().sort({ createdAt: -1 });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get one equipment item
router.get("/:id", async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add equipment
router.post("/", async (req, res) => {
  try {
    const {
      name,
      category,
      totalQuantity,
      deposit,
      lateFeePerDay,
    } = req.body;

    const equipment = await Equipment.create({
      name,
      category,
      totalQuantity,
      availableQuantity: totalQuantity,
      deposit,
      lateFeePerDay,
    });

    res.status(201).json(equipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;