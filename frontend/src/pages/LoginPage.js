/** @format */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Container,
	Box,
	Typography,
	TextField,
	Button,
	Alert,
	CircularProgress, // Import CircularProgress for loading indicator
} from "@mui/material";
import { supabase } from "../supabaseClient"; // Import the supabase client

function LoginPage() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false); // Add loading state
	const navigate = useNavigate();

	const { email, password } = formData;

	const onChange = (e) =>
		setFormData({ ...formData, [e.target.name]: e.target.value });

	const onSubmit = async (e) => {
		e.preventDefault();
		setError(""); // Clear previous errors
		setLoading(true); // Set loading to true
		try {
			// Use Supabase auth
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email: email,
				password: password,
			});

			if (signInError) {
				throw signInError; // Throw error to be caught below
			}

			console.log("Login successful");
			// Redirect to dashboard or appropriate page after login
			navigate("/");
		} catch (err) {
			console.error("Login error:", err.message);
			setError(err.message || "Login failed. Please try again.");
		} finally {
			setLoading(false); // Set loading to false regardless of outcome
		}
	};

	return (
		<Container component="main" maxWidth="xs">
			<Box
				sx={{
					marginTop: 8,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}>
				<Typography component="h1" variant="h5">
					Sign in
				</Typography>
				<Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
					{error && (
						<Alert severity="error" sx={{ width: "100%", mb: 2 }}>
							{error}
						</Alert>
					)}
					<TextField
						margin="normal"
						required
						fullWidth
						id="email"
						label="Email Address"
						name="email"
						autoComplete="email"
						autoFocus
						value={email}
						onChange={onChange}
					/>
					<TextField
						margin="normal"
						required
						fullWidth
						name="password"
						label="Password"
						type="password"
						id="password"
						autoComplete="current-password"
						value={password}
						onChange={onChange}
					/>
					{/* Add Remember me checkbox if needed */}
					<Button
						type="submit"
						fullWidth
						variant="contained"
						sx={{ mt: 3, mb: 2 }}
						disabled={loading} // Disable button when loading
					>
						{loading ? <CircularProgress size={24} /> : "Sign In"}{" "}
						{/* Show loader or text */}
					</Button>
					{/* Add Forgot password/Sign up links if needed */}
				</Box>
			</Box>
		</Container>
	);
}

export default LoginPage;
