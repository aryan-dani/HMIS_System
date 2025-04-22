/** @format */

const DoctorModel = require("../models/DoctorModel");

// @route   GET api/doctors
// @desc    Get all doctors
// @access  Private
exports.getAllDoctors = async (req, res) => {
	try {
		const doctors = await DoctorModel.getAllDoctors();
		res.json(doctors);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   GET api/doctors/:id
// @desc    Get doctor by ID
// @access  Private
exports.getDoctorById = async (req, res) => {
	try {
		const doctor = await DoctorModel.getDoctorById(req.params.id);
		if (!doctor) {
			return res.status(404).json({ msg: "Doctor not found" });
		}
		res.json(doctor);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   POST api/doctors
// @desc    Add new doctor
// @access  Private (Consider Admin only?)
exports.createDoctor = async (req, res) => {
	try {
		// Add validation
		const newDoctor = await DoctorModel.createDoctor(req.body);
		res.status(201).json(newDoctor);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   PUT api/doctors/:id
// @desc    Update doctor
// @access  Private (Consider Admin only?)
exports.updateDoctor = async (req, res) => {
	try {
		const updatedDoctor = await DoctorModel.updateDoctor(
			req.params.id,
			req.body
		);
		if (!updatedDoctor) {
			return res.status(404).json({ msg: "Doctor not found" });
		}
		res.json(updatedDoctor);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   DELETE api/doctors/:id
// @desc    Delete doctor
// @access  Private (Consider Admin only?)
exports.deleteDoctor = async (req, res) => {
	try {
		const result = await DoctorModel.deleteDoctor(req.params.id);
		if (!result || !result.success) {
			// Model should throw if not found
		}
		res.json({ msg: "Doctor removed" });
	} catch (err) {
		console.error(err.message);
		if (err.message.includes("violates foreign key constraint")) {
			return res
				.status(400)
				.json({
					msg: "Cannot delete doctor with associated records (reports, etc.).",
				});
		}
		res.status(500).send("Server Error");
	}
};

// @route   GET api/doctors/search/:query
// @desc    Search doctors by name or specialization
// @access  Private
exports.searchDoctors = async (req, res) => {
	try {
		const searchQuery = req.params.query;
		if (!searchQuery) {
			return res.status(400).json({ msg: "Search query cannot be empty" });
		}
		const doctors = await DoctorModel.searchDoctors(searchQuery);
		res.json(doctors);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};
