/** @format */

const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema(
	{
		description: { type: String, required: true },
		amount: { type: Number, required: true },
	},
	{ _id: false }
);

const billSchema = new mongoose.Schema({
	patient: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Patient",
		required: true,
	},
	patientType: {
		type: String,
		enum: ["In-Patient", "Out-Patient"],
		required: true,
	},
	billDate: { type: Date, default: Date.now },
	items: [billItemSchema],
	roomCharges: { type: Number, default: 0 }, // Applicable for In-Patients
	doctorCharges: { type: Number, default: 0 },
	pathologyCharges: { type: Number, default: 0 },
	otherCharges: { type: Number, default: 0 },
	totalAmount: { type: Number, required: true, default: 0 },
	paymentStatus: {
		type: String,
		enum: ["Pending", "Paid", "Partial"],
		default: "Pending",
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

// Middleware to calculate total amount before saving
billSchema.pre("save", function (next) {
	this.totalAmount =
		this.items.reduce((sum, item) => sum + item.amount, 0) +
		this.roomCharges +
		this.doctorCharges +
		this.pathologyCharges +
		this.otherCharges;
	this.updatedAt = Date.now();
	next();
});

billSchema.pre("findOneAndUpdate", function (next) {
	// Recalculate total if items or charges change
	const update = this.getUpdate();
	if (
		update.$set &&
		(update.$set.items ||
			update.$set.roomCharges !== undefined ||
			update.$set.doctorCharges !== undefined ||
			update.$set.pathologyCharges !== undefined ||
			update.$set.otherCharges !== undefined)
	) {
		// Fetch the document to access items array if needed for recalculation
		// This is a simplified approach; a more robust one might involve fetching the doc first
		// For now, assume the update provides enough info or recalculate based on existing doc + update
		// Note: Recalculating accurately in findOneAndUpdate middleware can be complex.
		// Often, it's better handled in the application logic calling the update.
		// We'll set updatedAt here.
		this.set({ updatedAt: Date.now() });
	}
	next();
});

module.exports = mongoose.model("Bill", billSchema);
