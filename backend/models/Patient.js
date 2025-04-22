/** @format */

const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
	name: { type: String, required: true },
	age: { type: Number, required: true },
	gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
	address: { type: String, required: true },
	phoneNumber: { type: String, required: true },
	email: { type: String, unique: true, sparse: true }, // Optional, but unique if provided
	patientType: {
		type: String,
		enum: ["In-Patient", "Out-Patient"],
		required: true,
	},
	admissionDate: {
		type: Date,
		default: Date.now,
		required: function () {
			return this.patientType === "In-Patient";
		},
	},
	dischargeDate: { type: Date },
	assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
	assignedRoom: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Room",
		required: function () {
			return this.patientType === "In-Patient";
		},
	},
	medicalHistory: { type: String },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt` field
patientSchema.pre("save", function (next) {
	this.updatedAt = Date.now();
	next();
});

patientSchema.pre("findOneAndUpdate", function (next) {
	this.set({ updatedAt: Date.now() });
	next();
});

module.exports = mongoose.model("Patient", patientSchema);
