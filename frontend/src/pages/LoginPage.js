/** @format */

import React, { useState } from "react";
import {
	Container,
	Box,
	Typography,
	TextField,
	Button,
	Alert,
	CircularProgress,
	Avatar,
	Paper,
} from "@mui/material";
import { supabase } from "../supabaseClient";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"; // Import Lock icon

function LoginPage() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const { email, password } = formData;

	const onChange = (e) =>
		setFormData({ ...formData, [e.target.name]: e.target.value });

	const onSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email: email,
				password: password,
			});
			if (signInError) {
				throw signInError;
			}
			console.log("Login successful");
			// Navigate is handled by AuthContext listener now, but can keep for immediate feedback if needed
			// navigate("/");
		} catch (err) {
			console.error("Login error:", err.message);
			setError(err.message || "Login failed. Please check your credentials.");
		} finally {
			setLoading(false);
		}
	};

	return (
		// Center the container vertically and horizontally
		<Container
			component="main"
			maxWidth="xs"
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "calc(100vh - 64px - 48px)",
			}}>
			{" "}
			{/* Adjust height based on Navbar and padding */}
			<Paper
				elevation={3}
				sx={{
					padding: 4,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					width: "100%",
				}}>
				<Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
					<LockOutlinedIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					Sign in
				</Typography>
				<Box
					component="form"
					onSubmit={onSubmit}
					noValidate
					sx={{ mt: 1, width: "100%" }}>
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
					{/* Add Checkbox for 'Remember me' if needed */}
					<Button
						type="submit"
						fullWidth
						variant="contained"
						sx={{ mt: 3, mb: 2 }}
						disabled={loading}>
						{loading ? <CircularProgress size={24} /> : "Sign In"}
					</Button>
					{/* Add Grid container for Forgot password/Sign up links if needed */}
					{/* <Grid container>
						<Grid item xs>
							<Link href="#" variant="body2">
								Forgot password?
							</Link>
						</Grid>
						<Grid item>
							<Link href="#" variant="body2">
								{"Don't have an account? Sign Up"}
							</Link>
						</Grid>
					</Grid> */}
				</Box>
			</Paper>
		</Container>
	);
}

export default LoginPage;
