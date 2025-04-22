/** @format */

import React from "react";
import { Link as RouterLink } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useAuth } from "../context/AuthContext"; // Import useAuth

function Navbar() {
	const { signOut } = useAuth(); // Get signOut function from context

	const handleLogout = async () => {
		const { error } = await signOut();
		if (error) {
			console.error("Error logging out:", error.message);
			// Optionally show an error message to the user
		} else {
			// AuthContext listener will handle redirect via App.js
		}
	};

	return (
		<AppBar position="static">
			<Toolbar>
				<Typography
					variant="h6"
					component={RouterLink}
					to="/"
					sx={{ flexGrow: 1, color: "inherit", textDecoration: "none" }}>
					HMIS
				</Typography>
				<Box>
					<Button color="inherit" component={RouterLink} to="/">
						Dashboard
					</Button>
					<Button color="inherit" component={RouterLink} to="/patients">
						Patients
					</Button>
					<Button color="inherit" component={RouterLink} to="/doctors">
						Doctors
					</Button>
					<Button color="inherit" component={RouterLink} to="/rooms">
						Rooms
					</Button>
					<Button color="inherit" component={RouterLink} to="/billing">
						Billing
					</Button>
					<Button color="inherit" component={RouterLink} to="/pathology">
						Pathology
					</Button>
					<Button color="inherit" component={RouterLink} to="/admin">
						Admin
					</Button>
					{/* Replace Login button with Logout button */}
					<Button color="inherit" onClick={handleLogout}>
						Logout
					</Button>
				</Box>
			</Toolbar>
		</AppBar>
	);
}

export default Navbar;
