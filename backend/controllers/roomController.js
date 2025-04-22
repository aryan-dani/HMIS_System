/** @format */

const RoomModel = require("../models/RoomModel");

// @route   GET api/rooms
// @desc    Get all rooms
// @access  Private
exports.getAllRooms = async (req, res) => {
	try {
		const rooms = await RoomModel.getAllRooms();
		res.json(rooms);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   GET api/rooms/available
// @desc    Get all available rooms
// @access  Private
exports.getAvailableRooms = async (req, res) => {
	try {
		const rooms = await RoomModel.getAvailableRooms();
		res.json(rooms);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   GET api/rooms/:id
// @desc    Get room by ID
// @access  Private
exports.getRoomById = async (req, res) => {
	try {
		const room = await RoomModel.getRoomById(req.params.id);
		if (!room) {
			return res.status(404).json({ msg: "Room not found" });
		}
		res.json(room);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   POST api/rooms
// @desc    Add new room
// @access  Private (Admin)
exports.createRoom = async (req, res) => {
	try {
		// Add validation
		const newRoom = await RoomModel.createRoom(req.body);
		res.status(201).json(newRoom);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   PUT api/rooms/:id
// @desc    Update room details (e.g., type, rate)
// @access  Private (Admin)
exports.updateRoom = async (req, res) => {
	try {
		const updatedRoom = await RoomModel.updateRoom(req.params.id, req.body);
		if (!updatedRoom) {
			return res.status(404).json({ msg: "Room not found" });
		}
		res.json(updatedRoom);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   PUT api/rooms/:id/assign
// @desc    Assign a patient to a room
// @access  Private
exports.assignRoom = async (req, res) => {
	try {
		const { patientId } = req.body;
		if (!patientId) {
			return res.status(400).json({ msg: "Patient ID is required" });
		}
		// Add check: ensure patient exists? ensure room is available?
		const assignedRoom = await RoomModel.assignRoom(req.params.id, patientId);
		if (!assignedRoom) {
			return res.status(404).json({ msg: "Room not found" });
		}
		res.json(assignedRoom);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   PUT api/rooms/:id/release
// @desc    Release a room (mark as unoccupied)
// @access  Private
exports.releaseRoom = async (req, res) => {
	try {
		const releasedRoom = await RoomModel.releaseRoom(req.params.id);
		if (!releasedRoom) {
			return res.status(404).json({ msg: "Room not found" });
		}
		res.json(releasedRoom);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

// @route   DELETE api/rooms/:id
// @desc    Delete room
// @access  Private (Admin)
exports.deleteRoom = async (req, res) => {
	try {
		const result = await RoomModel.deleteRoom(req.params.id);
		if (!result || !result.success) {
			// Model throws specific error if occupied
		}
		res.json({ msg: "Room removed" });
	} catch (err) {
		console.error(err.message);
		if (err.message === "Cannot delete an occupied room") {
			return res.status(400).json({ msg: err.message });
		}
		res.status(500).send("Server Error");
	}
};
