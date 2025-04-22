/** @format */

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const doctorController = require("../controllers/doctorController");

// @route   GET api/doctors
// @desc    Get all doctors
// @access  Private
router.get("/", authMiddleware, doctorController.getAllDoctors);

// @route   GET api/doctors/:id
// @desc    Get doctor by ID
// @access  Private
router.get("/:id", authMiddleware, doctorController.getDoctorById);

// @route   POST api/doctors
// @desc    Add new doctor
// @access  Private (Admin)
router.post(
	"/",
	[authMiddleware, authMiddleware.isAdmin],
	doctorController.createDoctor
);

// @route   PUT api/doctors/:id
// @desc    Update doctor
// @access  Private (Admin)
router.put(
	"/:id",
	[authMiddleware, authMiddleware.isAdmin],
	doctorController.updateDoctor
);

// @route   DELETE api/doctors/:id
// @desc    Delete doctor
// @access  Private (Admin)
router.delete(
	"/:id",
	[authMiddleware, authMiddleware.isAdmin],
	doctorController.deleteDoctor
);

// @route   GET api/doctors/search/:query
// @desc    Search doctors by name or specialization
// @access  Private
router.get("/search/:query", authMiddleware, doctorController.searchDoctors);

module.exports = router;
