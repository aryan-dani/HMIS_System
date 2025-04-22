/** @format */

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

// @route   POST api/users/register
// @desc    Register a new user
// @access  Private (Admin)
router.post(
	"/register",
	authMiddleware, // General authentication
	authMiddleware.isAdmin, // Admin role check
	userController.registerUser
);

// @route   GET api/users
// @desc    Get all users
// @access  Private (Admin)
router.get(
	"/",
	authMiddleware, // General authentication
	authMiddleware.isAdmin, // Admin role check
	userController.getAllUsers
);

// @route   DELETE api/users/:id
// @desc    Delete a user
// @access  Private (Admin)
router.delete(
	"/:id",
	authMiddleware,
	authMiddleware.isAdmin,
	userController.deleteUser
);

module.exports = router;
