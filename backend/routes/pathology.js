/** @format */

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const pathologyController = require("../controllers/pathologyController");

// @route   GET api/pathology
// @desc    Get all pathology reports
// @access  Private
router.get("/", authMiddleware, pathologyController.getAllReports);

// @route   GET api/pathology/:id
// @desc    Get pathology report by ID
// @access  Private
router.get("/:id", authMiddleware, pathologyController.getReportById);

// @route   GET api/pathology/patient/:patientId
// @desc    Get pathology reports by patient ID
// @access  Private
router.get(
	"/patient/:patientId",
	authMiddleware,
	pathologyController.getReportsByPatientId
);

// @route   POST api/pathology
// @desc    Create a pathology report
// @access  Private
router.post("/", authMiddleware, pathologyController.createReport);

// @route   PUT api/pathology/:id
// @desc    Update pathology report
// @access  Private
router.put("/:id", authMiddleware, pathologyController.updateReport);

// @route   DELETE api/pathology/:id
// @desc    Delete pathology report
// @access  Private (Admin)
router.delete(
	"/:id",
	[authMiddleware, authMiddleware.isAdmin],
	pathologyController.deleteReport
);

module.exports = router;
