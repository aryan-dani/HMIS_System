/** @format */

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roomController = require("../controllers/roomController");

// @route   GET api/rooms
// @desc    Get all rooms
// @access  Private
router.get("/", authMiddleware, roomController.getAllRooms);

// @route   GET api/rooms/available
// @desc    Get all available rooms
// @access  Private
router.get("/available", authMiddleware, roomController.getAvailableRooms);

// @route   GET api/rooms/:id
// @desc    Get room by ID
// @access  Private
router.get("/:id", authMiddleware, roomController.getRoomById);

// @route   POST api/rooms
// @desc    Add new room
// @access  Private (Admin)
router.post(
	"/",
	[authMiddleware, authMiddleware.isAdmin],
	roomController.createRoom
);

// @route   PUT api/rooms/:id
// @desc    Update room details
// @access  Private (Admin)
router.put(
	"/:id",
	[authMiddleware, authMiddleware.isAdmin],
	roomController.updateRoom
);

// @route   PUT api/rooms/:id/assign
// @desc    Assign a patient to a room
// @access  Private
router.put("/:id/assign", authMiddleware, roomController.assignRoom);

// @route   PUT api/rooms/:id/release
// @desc    Release a room (mark as unoccupied)
// @access  Private
router.put("/:id/release", authMiddleware, roomController.releaseRoom);

// @route   DELETE api/rooms/:id
// @desc    Delete room
// @access  Private (Admin)
router.delete(
	"/:id",
	[authMiddleware, authMiddleware.isAdmin],
	roomController.deleteRoom
);

module.exports = router;
