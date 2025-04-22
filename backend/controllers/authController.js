/** @format */

const UserModel = require("../models/UserModel");

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.loginUser = async (req, res) => {
	const { email, password } = req.body;

	try {
		// Authenticate user
		const authResult = await UserModel.loginUser({ email, password });

		// Return token
		res.json({ token: authResult.token });
	} catch (err) {
		console.error(err.message);

		if (err.status === 400) {
			return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
		}

		res.status(500).send("Server error");
	}
};

// @route   GET api/auth/me
// @desc    Get logged in user data
// @access  Private
exports.getLoggedInUser = async (req, res) => {
	try {
		// req.user is set by the authMiddleware
		const user = await UserModel.getUserById(req.user.id);

		if (!user) {
			return res.status(404).json({ msg: "User not found" });
		}

		// Don't send back sensitive info
		delete user.password;

		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};
