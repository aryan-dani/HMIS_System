/** @format */

const PathologyModel = require("../models/PathologyModel");
const PatientModel = require("../models/PatientModel"); // To verify patient
const DoctorModel = require("../models/DoctorModel"); // To verify doctor

// @route   GET api/pathology
// @desc    Get all pathology reports
// @access  Private
exports.getAllReports = async (req, res) => {
	try {
		const reports = await PathologyModel.getAllReports();
		res.json(reports);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   GET api/pathology/:id
// @desc    Get pathology report by ID
// @access  Private
exports.getReportById = async (req, res) => {
	try {
		const report = await PathologyModel.getReportById(req.params.id);
		if (!report) {
			return res.status(404).json({ msg: "Report not found" });
		}
		res.json(report);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   GET api/pathology/patient/:patientId
// @desc    Get pathology reports by patient ID
// @access  Private
exports.getReportsByPatientId = async (req, res) => {
	try {
		const reports = await PathologyModel.getReportsByPatientId(
			req.params.patientId
		);
		res.json(reports);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   POST api/pathology
// @desc    Create a pathology report
// @access  Private
exports.createReport = async (req, res) => {
	try {
		const { patient_id, doctor_id, test_type, results } = req.body;

		// Basic validation
		if (!patient_id || !doctor_id || !test_type || !results) {
			return res
				.status(400)
				.json({
					msg: "Patient ID, Doctor ID, Test Type, and Results are required",
				});
		}

		// Verify patient and doctor exist
		const patientExists = await PatientModel.getPatientById(patient_id);
		if (!patientExists) {
			return res.status(404).json({ msg: "Patient not found" });
		}
		const doctorExists = await DoctorModel.getDoctorById(doctor_id);
		if (!doctorExists) {
			return res.status(404).json({ msg: "Doctor not found" });
		}

		// Add user ID from authenticated user
		const reportData = { ...req.body, user_id: req.user.id };

		const newReport = await PathologyModel.createReport(reportData);
		res.status(201).json(newReport);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   PUT api/pathology/:id
// @desc    Update pathology report
// @access  Private
exports.updateReport = async (req, res) => {
	try {
		const updatedReport = await PathologyModel.updateReport(
			req.params.id,
			req.body
		);
		if (!updatedReport) {
			return res.status(404).json({ msg: "Report not found" });
		}
		res.json(updatedReport);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   DELETE api/pathology/:id
// @desc    Delete pathology report
// @access  Private (Admin)
exports.deleteReport = async (req, res) => {
	try {
		const result = await PathologyModel.deleteReport(req.params.id);
		if (!result || !result.success) {
			// Model should throw if not found
		}
		res.json({ msg: "Report removed" });
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};
