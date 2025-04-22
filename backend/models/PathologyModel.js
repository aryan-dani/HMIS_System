/** @format */

const { supabase } = require("../config/db");

// Get all pathology reports
exports.getAllReports = async () => {
	try {
		const { data, error } = await supabase
			.from("pathology_reports")
			.select(
				`
        *,
        patient:patient_id (id, full_name, patient_id),
        doctor:doctor_id (id, first_name, last_name, specialization)
      `
			)
			.order("test_date", { ascending: false });

		if (error) throw error;

		return data;
	} catch (err) {
		throw err;
	}
};

// Get report by ID
exports.getReportById = async (id) => {
	try {
		const { data, error } = await supabase
			.from("pathology_reports")
			.select(
				`
        *,
        patient:patient_id (id, full_name, patient_id, gender, age, blood_group),
        doctor:doctor_id (id, first_name, last_name, specialization),
        created_by:user_id (username)
      `
			)
			.eq("id", id)
			.single();

		if (error) throw error;

		return data;
	} catch (err) {
		throw err;
	}
};

// Get reports by patient ID
exports.getReportsByPatientId = async (patientId) => {
	try {
		const { data, error } = await supabase
			.from("pathology_reports")
			.select(
				`
        *,
        patient:patient_id (id, full_name, patient_id),
        doctor:doctor_id (id, first_name, last_name, specialization)
      `
			)
			.eq("patient_id", patientId)
			.order("test_date", { ascending: false });

		if (error) throw error;

		return data;
	} catch (err) {
		throw err;
	}
};

// Create pathology report
exports.createReport = async (reportData) => {
	try {
		const {
			patient_id,
			doctor_id,
			test_type,
			test_date,
			sample_collection_date,
			results,
			normal_ranges,
			remarks,
			is_critical,
			user_id,
		} = reportData;

		const newReport = {
			patient_id,
			doctor_id,
			test_type,
			test_date: test_date || new Date().toISOString(),
			sample_collection_date:
				sample_collection_date || new Date().toISOString(),
			results,
			normal_ranges,
			remarks,
			is_critical: is_critical || false,
			user_id,
		};

		const { data, error } = await supabase
			.from("pathology_reports")
			.insert([newReport])
			.select();

		if (error) throw error;

		return data[0];
	} catch (err) {
		throw err;
	}
};

// Update pathology report
exports.updateReport = async (id, reportData) => {
	try {
		const updateData = {
			...reportData,
			updated_at: new Date().toISOString(),
		};

		const { data, error } = await supabase
			.from("pathology_reports")
			.update(updateData)
			.eq("id", id)
			.select();

		if (error) throw error;

		return data[0];
	} catch (err) {
		throw err;
	}
};

// Delete pathology report
exports.deleteReport = async (id) => {
	try {
		const { error } = await supabase
			.from("pathology_reports")
			.delete()
			.eq("id", id);

		if (error) throw error;

		return { success: true };
	} catch (err) {
		throw err;
	}
};
