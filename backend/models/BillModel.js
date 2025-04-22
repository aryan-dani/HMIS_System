/** @format */

const { supabase } = require("../config/db");

// Get all bills
exports.getAllBills = async () => {
	try {
		const { data, error } = await supabase
			.from("bills")
			.select(
				`
        *,
        patient:patient_id (id, full_name, patient_id)
      `
			)
			.order("created_at", { ascending: false });

		if (error) throw error;

		return data;
	} catch (err) {
		throw err;
	}
};

// Get bill by ID
exports.getBillById = async (id) => {
	try {
		const { data, error } = await supabase
			.from("bills")
			.select(
				`
        *,
        patient:patient_id (id, full_name, patient_id, phone, address),
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

// Get bills by patient ID
exports.getBillsByPatientId = async (patientId) => {
	try {
		const { data, error } = await supabase
			.from("bills")
			.select(
				`
        *,
        patient:patient_id (id, full_name, patient_id)
      `
			)
			.eq("patient_id", patientId)
			.order("created_at", { ascending: false });

		if (error) throw error;

		return data;
	} catch (err) {
		throw err;
	}
};

// Create bill
exports.createBill = async (billData) => {
	try {
		// Calculate financial values
		const {
			items,
			discount = 0,
			tax_rate = 0,
			patient_id,
			bill_type,
			payment_status,
			payment_method,
		} = billData;

		const subtotal = items.reduce(
			(sum, item) => sum + item.quantity * item.rate,
			0
		);
		const tax = (subtotal * tax_rate) / 100;
		const discount_amount = (subtotal * discount) / 100;
		const total = subtotal + tax - discount_amount;

		// Prepare bill data for insertion
		const newBill = {
			patient_id,
			bill_type,
			items,
			subtotal,
			discount,
			discount_amount,
			tax_rate,
			tax,
			total,
			payment_status: payment_status || "Pending",
			payment_method,
			user_id: billData.user_id,
		};

		const { data, error } = await supabase
			.from("bills")
			.insert([newBill])
			.select();

		if (error) throw error;

		return data[0];
	} catch (err) {
		throw err;
	}
};

// Update bill
exports.updateBill = async (id, billData) => {
	try {
		let updateData = {};

		// If items are being updated, recalculate totals
		if (billData.items) {
			const { items } = billData;
			const discount = billData.discount !== undefined ? billData.discount : 0;
			const tax_rate = billData.tax_rate !== undefined ? billData.tax_rate : 0;

			const subtotal = items.reduce(
				(sum, item) => sum + item.quantity * item.rate,
				0
			);
			const tax = (subtotal * tax_rate) / 100;
			const discount_amount = (subtotal * discount) / 100;
			const total = subtotal + tax - discount_amount;

			updateData = {
				...billData,
				subtotal,
				tax,
				discount_amount,
				total,
				updated_at: new Date().toISOString(),
			};
		} else {
			// Just update payment details
			updateData = {
				...billData,
				updated_at: new Date().toISOString(),
			};
		}

		const { data, error } = await supabase
			.from("bills")
			.update(updateData)
			.eq("id", id)
			.select();

		if (error) throw error;

		return data[0];
	} catch (err) {
		throw err;
	}
};

// Delete bill
exports.deleteBill = async (id) => {
	try {
		const { error } = await supabase.from("bills").delete().eq("id", id);

		if (error) throw error;

		return { success: true };
	} catch (err) {
		throw err;
	}
};
