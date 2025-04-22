/** @format */

const { supabase } = require("../config/db");

// Get all rooms
exports.getAllRooms = async () => {
	try {
		const { data, error } = await supabase
			.from("rooms")
			.select("*")
			.order("room_number", { ascending: true });

		if (error) throw error;

		return data;
	} catch (err) {
		throw err;
	}
};

// Get available rooms
exports.getAvailableRooms = async () => {
	try {
		const { data, error } = await supabase
			.from("rooms")
			.select("*")
			.eq("is_occupied", false)
			.order("room_number", { ascending: true });

		if (error) throw error;

		return data;
	} catch (err) {
		throw err;
	}
};

// Get room by ID
exports.getRoomById = async (id) => {
	try {
		const { data, error } = await supabase
			.from("rooms")
			.select("*")
			.eq("id", id)
			.single();

		if (error) throw error;

		return data;
	} catch (err) {
		throw err;
	}
};

// Create room
exports.createRoom = async (roomData) => {
	try {
		const { data, error } = await supabase
			.from("rooms")
			.insert([roomData])
			.select();

		if (error) throw error;

		return data[0];
	} catch (err) {
		throw err;
	}
};

// Update room
exports.updateRoom = async (id, roomData) => {
	try {
		const { data, error } = await supabase
			.from("rooms")
			.update(roomData)
			.eq("id", id)
			.select();

		if (error) throw error;

		return data[0];
	} catch (err) {
		throw err;
	}
};

// Assign patient to room
exports.assignRoom = async (id, patientId) => {
	try {
		const { data, error } = await supabase
			.from("rooms")
			.update({
				is_occupied: true,
				current_patient: patientId,
				occupied_since: new Date().toISOString(),
			})
			.eq("id", id)
			.select();

		if (error) throw error;

		return data[0];
	} catch (err) {
		throw err;
	}
};

// Release room
exports.releaseRoom = async (id) => {
	try {
		const { data, error } = await supabase
			.from("rooms")
			.update({
				is_occupied: false,
				current_patient: null,
				occupied_since: null,
			})
			.eq("id", id)
			.select();

		if (error) throw error;

		return data[0];
	} catch (err) {
		throw err;
	}
};

// Delete room
exports.deleteRoom = async (id) => {
	try {
		// First check if room is occupied
		const { data: room, error: roomError } = await supabase
			.from("rooms")
			.select("is_occupied")
			.eq("id", id)
			.single();

		if (roomError) throw roomError;

		if (room.is_occupied) {
			throw new Error("Cannot delete an occupied room");
		}

		const { error } = await supabase.from("rooms").delete().eq("id", id);

		if (error) throw error;

		return { success: true };
	} catch (err) {
		throw err;
	}
};
