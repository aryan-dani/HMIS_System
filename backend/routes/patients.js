/** @format */

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const patientController = require("../controllers/patientController");

// @route   GET api/patients
// @desc    Get all patients
// @access  Private
router.get("/", authMiddleware, patientController.getAllPatients);

// @route   GET api/patients/:id
// @desc    Get patient by ID
// @access  Private
router.get("/:id", authMiddleware, patientController.getPatientById);

// @route   POST api/patients
// @desc    Add new patient
// @access  Private
router.post("/", authMiddleware, patientController.createPatient);

// @route   PUT api/patients/:id
// @desc    Update patient
// @access  Private
router.put("/:id", authMiddleware, patientController.updatePatient);

// @route   DELETE api/patients/:id
// @desc    Delete patient
// @access  Private
router.delete("/:id", authMiddleware, patientController.deletePatient);

// @route   GET api/patients/search/:query
// @desc    Search patients by name, id, or phone
// @access  Private
router.get("/search/:query", authMiddleware, patientController.searchPatients);

module.exports = router;
