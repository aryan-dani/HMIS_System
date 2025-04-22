/** @format */

const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			// Mongoose 6 doesn't require useCreateIndex or useFindAndModify
		});
		console.log("MongoDB Connected...");
	} catch (err) {
		console.error("MongoDB connection error:", err.message);
		// Exit process with failure
		process.exit(1);
	}
};

module.exports = connectDB;
