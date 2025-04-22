/** @format */

const BillModel = require("../models/BillModel");
const PatientModel = require("../models/PatientModel"); // To verify patient exists

// @route   GET api/bills
// @desc    Get all bills
// @access  Private
exports.getAllBills = async (req, res) => {
	try {
		const bills = await BillModel.getAllBills();
		res.json(bills);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   GET api/bills/:id
// @desc    Get bill by ID
// @access  Private
exports.getBillById = async (req, res) => {
	try {
		const bill = await BillModel.getBillById(req.params.id);
		if (!bill) {
			return res.status(404).json({ msg: "Bill not found" });
		}
		res.json(bill);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   GET api/bills/patient/:patientId
// @desc    Get bills by patient ID
// @access  Private
exports.getBillsByPatientId = async (req, res) => {
	try {
		const bills = await BillModel.getBillsByPatientId(req.params.patientId);
		res.json(bills);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   POST api/bills
// @desc    Create a bill
// @access  Private
exports.createBill = async (req, res) => {
	try {
		const { patient_id, items } = req.body;

		// Basic validation
		if (!patient_id || !items || !Array.isArray(items) || items.length === 0) {
			return res
				.status(400)
				.json({ msg: "Patient ID and at least one bill item are required" });
		}

		// Verify patient exists
		const patientExists = await PatientModel.getPatientById(patient_id);
		if (!patientExists) {
			return res.status(404).json({ msg: "Patient not found" });
		}

		// Add user ID from authenticated user
		const billData = { ...req.body, user_id: req.user.id };

		const newBill = await BillModel.createBill(billData);
		res.status(201).json(newBill);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   PUT api/bills/:id
// @desc    Update bill (e.g., payment status, items)
// @access  Private
exports.updateBill = async (req, res) => {
	try {
		const updatedBill = await BillModel.updateBill(req.params.id, req.body);
		if (!updatedBill) {
			return res.status(404).json({ msg: "Bill not found" });
		}
		res.json(updatedBill);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   DELETE api/bills/:id
// @desc    Delete bill
// @access  Private (Admin)
exports.deleteBill = async (req, res) => {
	try {
		const result = await BillModel.deleteBill(req.params.id);
		if (!result || !result.success) {
			// Model should throw if not found
		}
		res.json({ msg: "Bill removed" });
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};
