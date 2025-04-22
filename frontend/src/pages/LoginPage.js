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
} from "@mui/material";
// import api from "../utils/api"; // Assuming you have an api utility for backend calls

function LoginPage() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const { email, password } = formData;

	const onChange = (e) =>
		setFormData({ ...formData, [e.target.name]: e.target.value });

	const onSubmit = async (e) => {
		e.preventDefault();
		setError(""); // Clear previous errors
		try {
			// Replace with your actual API call
			// const res = await api.post('/auth/login', formData);
			// localStorage.setItem('token', res.data.token); // Store token or handle session
			console.log("Login attempt with:", formData); // Placeholder
			// Simulate successful login for now
			if (email === "admin@example.com" && password === "password") {
				// Replace with actual logic
				console.log("Login successful (simulated)");
				// Redirect to dashboard or appropriate page after login
				navigate("/");
			} else {
				setError("Invalid Credentials (simulated)");
			}
		} catch (err) {
			console.error(
				"Login error:",
				err.response ? err.response.data : err.message
			);
			setError(err.response?.data?.msg || "Login failed. Please try again.");
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
						sx={{ mt: 3, mb: 2 }}>
						Sign In
					</Button>
					{/* Add Forgot password/Sign up links if needed */}
				</Box>
			</Box>
		</Container>
	);
}

export default LoginPage;
