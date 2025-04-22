/** @format */

const mongoose = require("mongoose");

const pathologyReportSchema = new mongoose.Schema({
	patient: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Patient",
		required: true,
	},
	doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }, // Doctor who ordered the test
	testName: { type: String, required: true },
	reportDate: { type: Date, default: Date.now },
	results: { type: String, required: true }, // Could be structured JSON or just text
	notes: { type: String },
	cost: { type: Number, required: true },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt` field
pathologyReportSchema.pre("save", function (next) {
	this.updatedAt = Date.now();
	next();
});

pathologyReportSchema.pre("findOneAndUpdate", function (next) {
	this.set({ updatedAt: Date.now() });
	next();
});

module.exports = mongoose.model("PathologyReport", pathologyReportSchema);
