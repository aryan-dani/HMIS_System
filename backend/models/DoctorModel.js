/** @format */

const { supabase } = require("../config/db");

// Get all doctors
exports.getAllDoctors = async () => {
	try {
		const { data, error } = await supabase
			.from("doctors")
			.select("*")
			.order("last_name", { ascending: true });

		if (error) throw error;

		return data;
	} catch (err) {
		throw err;
	}
};

// Get doctor by ID
exports.getDoctorById = async (id) => {
	try {
		const { data, error } = await supabase
			.from("doctors")
			.select("*")
			.eq("id", id)
			.single();

		if (error) throw error;

		return data;
	} catch (err) {
		throw err;
	}
};

// Create doctor
exports.createDoctor = async (doctorData) => {
	try {
		const { data, error } = await supabase
			.from("doctors")
			.insert([doctorData])
			.select();

		if (error) throw error;

		return data[0];
	} catch (err) {
		throw err;
	}
};

// Update doctor
exports.updateDoctor = async (id, doctorData) => {
	try {
		const { data, error } = await supabase
			.from("doctors")
			.update(doctorData)
			.eq("id", id)
			.select();

		if (error) throw error;

		return data[0];
	} catch (err) {
		throw err;
	}
};

// Delete doctor
exports.deleteDoctor = async (id) => {
	try {
		const { error } = await supabase.from("doctors").delete().eq("id", id);

		if (error) throw error;

		return { success: true };
	} catch (err) {
		throw err;
	}
};

// Search doctors
exports.searchDoctors = async (query) => {
	try {
		const { data, error } = await supabase
			.from("doctors")
			.select("*")
			.or(
				`first_name.ilike.%${query}%,last_name.ilike.%${query}%,specialization.ilike.%${query}%`
			);

		if (error) throw error;

		return data;
	} catch (err) {
		throw err;
	}
};
