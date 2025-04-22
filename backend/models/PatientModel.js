/** @format */

const { supabase } = require("../config/db");

// Get all patients
exports.getAllPatients = async () => {
	try {
		const { data, error } = await supabase
			.from("patients")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) throw error;

		return data;
	} catch (err) {
		throw err;
	}
};

// Get patient by ID
exports.getPatientById = async (id) => {
	try {
		const { data, error } = await supabase
			.from("patients")
			.select("*")
			.eq("id", id)
			.single();

		if (error) throw error;

		return data;
	} catch (err) {
		throw err;
	}
};

// Create patient
exports.createPatient = async (patientData) => {
	try {
		const { data, error } = await supabase
			.from("patients")
			.insert([patientData])
			.select();

		if (error) throw error;

		return data[0];
	} catch (err) {
		throw err;
	}
};

// Update patient
exports.updatePatient = async (id, patientData) => {
	try {
		const { data, error } = await supabase
			.from("patients")
			.update(patientData)
			.eq("id", id)
			.select();

		if (error) throw error;

		return data[0];
	} catch (err) {
		throw err;
	}
};

// Delete patient
exports.deletePatient = async (id) => {
	try {
		const { error } = await supabase.from("patients").delete().eq("id", id);

		if (error) throw error;

		return { success: true };
	} catch (err) {
		throw err;
	}
};

// Search patients
exports.searchPatients = async (query) => {
	try {
		const { data, error } = await supabase
			.from("patients")
			.select("*")
			.or(
				`full_name.ilike.%${query}%,patient_id.ilike.%${query}%,phone.ilike.%${query}%`
			);

		if (error) throw error;

		return data;
	} catch (err) {
		throw err;
	}
};
