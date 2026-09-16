const express = require("express");
const Rental = require("../models/Rental");
const Equipment = require("../models/Equipment");

const router = express.Router();

const MAX_ACTIVE_RENTALS = 3;

// Create rental request
router.post("/", async (req, res) => {
  try {
    const {
      equipmentId,
      borrowerName,
      borrowerEmail,
      quantity,
      borrowDate,
      dueDate,
    } = req.body;
if (new Date(dueDate) < new Date(borrowDate)) {
  return res.status(400).json({
    message: "Due date cannot be before the borrow date",
  });
}
    // 1. Check equipment
    const equipment = await Equipment.findById(equipmentId);

    if (!equipment) {
      return res.status(404).json({
        message: "Equipment not found",
      });
    }

    // 2. Check quantity
   

    // 3. Check active rental limit
    const activeRentals = await Rental.countDocuments({
      borrowerEmail,
      status: {
        $in: ["pending", "approved", "borrowed"],
      },
    });

    if (activeRentals >= MAX_ACTIVE_RENTALS) {
      return res.status(400).json({
        message: `Borrowing limit reached. Maximum ${MAX_ACTIVE_RENTALS} active rentals allowed.`,
      });
    }

    // 4. Check date conflict
const overlappingRentals = await Rental.find({
  equipment: equipmentId,
  status: { $in: ["pending", "approved", "borrowed"] },
  borrowDate: { $lte: new Date(dueDate) },
  dueDate: { $gte: new Date(borrowDate) },
});

const bookedQuantity = overlappingRentals.reduce(
  (total, rental) => total + rental.quantity,
  0
);

const remainingForDates =
  equipment.totalQuantity - bookedQuantity;

if (quantity > remainingForDates) {
  return res.status(400).json({
    message: `Only ${Math.max(
      0,
      remainingForDates
    )} unit(s) available for the selected dates`,
  });
}

    // 5. Create rental
    const rental = await Rental.create({
      equipment: equipmentId,
      borrowerName,
      borrowerEmail,
      quantity,
      borrowDate,
      dueDate,
      depositAmount: equipment.deposit * quantity,
      status: "pending",
    });

    // 6. Reduce available quantity
    equipment.availableQuantity -= quantity;
    await equipment.save();

    res.status(201).json({
      message: "Rental request created successfully",
      rental,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});
// Get all rentals
router.get("/", async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate("equipment")
      .sort({ createdAt: -1 });

    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Return equipment
router.put("/:id/return", async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate("equipment");

    if (!rental) {
      return res.status(404).json({
        message: "Rental not found",
      });
    }

    if (rental.status === "returned") {
      return res.status(400).json({
        message: "Equipment already returned",
      });
    }

    const returnDate = new Date();

    const dueDate = new Date(rental.dueDate);

    const lateDays = Math.max(
      0,
      Math.ceil(
        (returnDate - dueDate) / (1000 * 60 * 60 * 24)
      )
    );

    const lateFee =
      lateDays * rental.equipment.lateFeePerDay * rental.quantity;

    const refundAmount = Math.max(
      0,
      rental.depositAmount - lateFee
    );

    rental.returnDate = returnDate;
    rental.lateFee = lateFee;
    rental.refundAmount = refundAmount;
    rental.status = "returned";

    await rental.save();

    const equipment = await Equipment.findById(rental.equipment._id);

    equipment.availableQuantity += rental.quantity;

    await equipment.save();

    res.json({
      message: "Equipment returned successfully",
      lateDays,
      lateFee,
      refundAmount,
      rental,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
module.exports = router;