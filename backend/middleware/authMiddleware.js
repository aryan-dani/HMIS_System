/** @format */

const jwt = require("jsonwebtoken");
const { supabase } = require("../config/db");
require("dotenv").config();

/**
 * Middleware to verify JWT tokens and protect routes
 */
const authMiddleware = async function (req, res, next) {
	// Get token from header
	const token = req.header("x-auth-token");

	// Check if not token
	if (!token) {
		return res.status(401).json({ msg: "No token, authorization denied" });
	}

	// Verify token
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded.user; // Add user payload to request object
		next();
	} catch (err) {
		res.status(401).json({ msg: "Token is not valid" });
	}
};

/**
 * Middleware to check for Admin role
 */
const isAdmin = async function (req, res, next) {
	try {
		if (!req.user || !req.user.id) {
			return res.status(401).json({ msg: "Authentication required" });
		}

		// Get user from Supabase
		const { data: user, error } = await supabase
			.from("users")
			.select("role")
			.eq("id", req.user.id)
			.single();

		if (error || !user) {
			return res.status(401).json({ msg: "User not found" });
		}

		if (user.role !== "Admin") {
			return res
				.status(403)
				.json({ msg: "Access denied. Admin role required." });
		}

		next();
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ msg: "Server error" });
	}
};

module.exports = authMiddleware;
module.exports.isAdmin = isAdmin;
