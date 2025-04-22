/** @format */

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const billController = require("../controllers/billController");

// @route   GET api/bills
// @desc    Get all bills
// @access  Private
router.get("/", authMiddleware, billController.getAllBills);

// @route   GET api/bills/:id
// @desc    Get bill by ID
// @access  Private
router.get("/:id", authMiddleware, billController.getBillById);

// @route   GET api/bills/patient/:patientId
// @desc    Get bills by patient ID
// @access  Private
router.get(
	"/patient/:patientId",
	authMiddleware,
	billController.getBillsByPatientId
);

// @route   POST api/bills
// @desc    Create a bill
// @access  Private
router.post("/", authMiddleware, billController.createBill);

// @route   PUT api/bills/:id
// @desc    Update bill
// @access  Private
router.put("/:id", authMiddleware, billController.updateBill);

// @route   DELETE api/bills/:id
// @desc    Delete bill
// @access  Private (Admin)
router.delete(
	"/:id",
	[authMiddleware, authMiddleware.isAdmin],
	billController.deleteBill
);

module.exports = router;
