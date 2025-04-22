/** @format */

const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
	roomNumber: { type: String, required: true, unique: true },
	roomType: {
		type: String,
		enum: ["General", "Semi-Private", "Private", "ICU"],
		required: true,
	},
	availability: { type: Boolean, default: true },
	chargesPerDay: { type: Number, required: true },
	currentOccupant: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Patient",
		default: null,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt` field
roomSchema.pre("save", function (next) {
	this.updatedAt = Date.now();
	next();
});

roomSchema.pre("findOneAndUpdate", function (next) {
	this.set({ updatedAt: Date.now() });
	next();
});

module.exports = mongoose.model("Room", roomSchema);
