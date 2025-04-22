/** @format */

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { connectDB } = require("./config/db");

// Connect to Database
connectDB();

const app = express();

// Init Middleware
// Configure CORS for production with specific origin
app.use(
	cors({
		origin:
			process.env.NODE_ENV === "production"
				? ["https://your-github-pages-url.github.io"]
				: "http://localhost:3000",
		credentials: true,
	})
);
app.use(express.json({ extended: false })); // Body parser for JSON

// Define a simple root route
app.get("/", (req, res) => res.send("HMIS API Running"));

// Define Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/patients", require("./routes/patients"));
app.use("/api/doctors", require("./routes/doctors"));
app.use("/api/rooms", require("./routes/rooms"));
app.use("/api/bills", require("./routes/bills"));
app.use("/api/pathology", require("./routes/pathology"));

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
	// Set security headers
	app.use((req, res, next) => {
		res.setHeader("X-Content-Type-Options", "nosniff");
		res.setHeader("X-Frame-Options", "DENY");
		res.setHeader("X-XSS-Protection", "1; mode=block");
		next();
	});
}

const PORT = process.env.PORT || 5001; // Use environment variable or default

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
