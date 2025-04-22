/** @format */

const { supabase } = require("../config/db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Create user
exports.registerUser = async (userData) => {
	try {
		// First, create auth user in Supabase
		const { email, password, username, role } = userData;

		// Register user with Supabase Auth
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email,
			password,
		});

		if (authError) throw authError;

		// Add additional user info to users table
		const { data, error } = await supabase
			.from("users")
			.insert([
				{
					auth_id: authData.user.id,
					username,
					email,
					role: role || "Operator",
				},
			])
			.select();

		if (error) throw error;

		return data[0];
	} catch (err) {
		throw err;
	}
};

// Login user
exports.loginUser = async (credentials) => {
	try {
		const { email, password } = credentials;

		// Sign in with Supabase Auth
		const { data: authData, error: authError } =
			await supabase.auth.signInWithPassword({
				email,
				password,
			});

		if (authError) throw authError;

		// Get user details from users table
		const { data, error } = await supabase
			.from("users")
			.select("*")
			.eq("auth_id", authData.user.id)
			.single();

		if (error) throw error;

		// Create JWT token with role info (for compatibility with existing code)
		const payload = {
			user: {
				id: data.id,
				auth_id: data.auth_id,
				role: data.role,
				username: data.username,
			},
		};

		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: 360000,
		});

		return { token, user: data };
	} catch (err) {
		throw err;
	}
};

// Get user by ID
exports.getUserById = async (id) => {
	try {
		const { data, error } = await supabase
			.from("users")
			.select("*")
			.eq("id", id)
			.single();

		if (error) throw error;

		return data;
	} catch (err) {
		throw err;
	}
};

// Get all users
exports.getAllUsers = async () => {
	try {
		const { data, error } = await supabase
			.from("users")
			.select("*")
			.order("username");

		if (error) throw error;

		return data;
	} catch (err) {
		throw err;
	}
};

// Delete user
exports.deleteUser = async (id) => {
	try {
		// Get auth_id first
		const { data: userData, error: userError } = await supabase
			.from("users")
			.select("auth_id")
			.eq("id", id)
			.single();

		if (userError) throw userError;

		// Delete from users table
		const { error } = await supabase.from("users").delete().eq("id", id);

		if (error) throw error;

		// Delete from auth (if possible via admin API)
		// Note: This may require server-side admin API access

		return { success: true };
	} catch (err) {
		throw err;
	}
};
