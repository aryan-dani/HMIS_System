/** @format */

const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
	name: { type: String, required: true },
	specialization: { type: String, required: true },
	qualification: { type: String, required: true },
	contactInfo: {
		phoneNumber: { type: String, required: true },
		email: { type: String, unique: true, sparse: true }, // Optional, but unique if provided
	},
	visitingHours: { type: String }, // e.g., "Mon-Fri 9am-5pm"
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt` field
doctorSchema.pre("save", function (next) {
	this.updatedAt = Date.now();
	next();
});

doctorSchema.pre("findOneAndUpdate", function (next) {
	this.set({ updatedAt: Date.now() });
	next();
});

module.exports = mongoose.model("Doctor", doctorSchema);
