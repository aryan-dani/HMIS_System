/** @format */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", authController.loginUser);

// @route   GET api/auth/me
// @desc    Get logged in user data
// @access  Private
router.get("/me", authMiddleware, authController.getLoggedInUser);

module.exports = router;
