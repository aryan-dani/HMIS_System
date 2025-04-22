/** @format */

const UserModel = require("../models/UserModel");

// @route   POST api/users/register
// @desc    Register a new user (Admin only)
// @access  Private (Admin)
exports.registerUser = async (req, res) => {
	const { email, password, username, role } = req.body;

	// Basic validation
	if (!email || !password || !username) {
		return res
			.status(400)
			.json({ msg: "Please provide email, password, and username" });
	}

	try {
		// Check if user already exists (by email or username)
		// Note: Supabase auth handles email uniqueness, we might check username in our table
		// const existingUser = await UserModel.findUserByUsername(username);
		// if (existingUser) return res.status(400).json({ msg: "Username already exists" });

		const newUser = await UserModel.registerUser({
			email,
			password,
			username,
			role,
		});

		// Don't return sensitive info
		delete newUser.password;

		res
			.status(201)
			.json({ msg: "User registered successfully", user: newUser });
	} catch (err) {
		console.error("Error during user registration:", err.message);
		// Handle specific Supabase errors if needed
		if (
			err.message.includes("duplicate key value violates unique constraint")
		) {
			return res
				.status(400)
				.json({ msg: "User with this email or username already exists." });
		}
		if (err.message.includes("Password should be at least 6 characters")) {
			return res
				.status(400)
				.json({ msg: "Password should be at least 6 characters long." });
		}
		res.status(500).send("Server error during user registration");
	}
};

// @route   GET api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
	try {
		const users = await UserModel.getAllUsers();
		res.json(users);
	} catch (err) {
		console.error("Error fetching users:", err.message);
		res.status(500).send("Server error fetching users");
	}
};

// @route   DELETE api/users/:id
// @desc    Delete a user (Admin only)
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
	try {
		const userId = req.params.id;
		// Optional: Add check to prevent self-deletion if needed
		// if (req.user.id === userId) {
		//   return res.status(400).json({ msg: "Admin cannot delete themselves." });
		// }

		await UserModel.deleteUser(userId);
		res.json({ msg: "User deleted successfully" });
	} catch (err) {
		console.error("Error deleting user:", err.message);
		res.status(500).send("Server error deleting user");
	}
};
