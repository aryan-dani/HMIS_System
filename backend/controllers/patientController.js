/** @format */

const PatientModel = require("../models/PatientModel");

// @route   GET api/patients
// @desc    Get all patients
// @access  Private
exports.getAllPatients = async (req, res) => {
	try {
		const patients = await PatientModel.getAllPatients();
		res.json(patients);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   GET api/patients/:id
// @desc    Get patient by ID
// @access  Private
exports.getPatientById = async (req, res) => {
	try {
		const patient = await PatientModel.getPatientById(req.params.id);
		if (!patient) {
			return res.status(404).json({ msg: "Patient not found" });
		}
		res.json(patient);
	} catch (err) {
		console.error(err.message);
		// Handle specific errors like invalid UUID format if needed
		res.status(500).send("Server Error");
	}
};

// @route   POST api/patients
// @desc    Add new patient
// @access  Private
exports.createPatient = async (req, res) => {
	try {
		// Add validation as needed
		const newPatient = await PatientModel.createPatient(req.body);
		res.status(201).json(newPatient);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   PUT api/patients/:id
// @desc    Update patient
// @access  Private
exports.updatePatient = async (req, res) => {
	try {
		const updatedPatient = await PatientModel.updatePatient(
			req.params.id,
			req.body
		);
		if (!updatedPatient) {
			return res.status(404).json({ msg: "Patient not found" });
		}
		res.json(updatedPatient);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   DELETE api/patients/:id
// @desc    Delete patient
// @access  Private
exports.deletePatient = async (req, res) => {
	try {
		const result = await PatientModel.deletePatient(req.params.id);
		// Supabase delete doesn't typically return the deleted item, check for errors
		if (!result || !result.success) {
			// We might rely on the model throwing an error if not found
			// return res.status(404).json({ msg: "Patient not found or could not be deleted" });
		}
		res.json({ msg: "Patient removed" });
	} catch (err) {
		console.error(err.message);
		if (err.message.includes("violates foreign key constraint")) {
			return res
				.status(400)
				.json({
					msg: "Cannot delete patient with associated records (bills, reports, etc.).",
				});
		}
		res.status(500).send("Server Error");
	}
};

// @route   GET api/patients/search/:query
// @desc    Search patients by name, id, or phone
// @access  Private
exports.searchPatients = async (req, res) => {
	try {
		const searchQuery = req.params.query;
		if (!searchQuery) {
			return res.status(400).json({ msg: "Search query cannot be empty" });
		}
		const patients = await PatientModel.searchPatients(searchQuery);
		res.json(patients);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};
