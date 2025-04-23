/** @format */

import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // Assuming supabaseClient is correctly set up
import {
	Box,
	Typography,
	Grid,
	Card,
	CircularProgress,
	Alert,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ReceiptIcon from "@mui/icons-material/Receipt";

function DashboardPage() {
	const [stats, setStats] = useState({
		patients: 0,
		doctors: 0,
		roomsAvailable: 0,
		unpaidBills: 0,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchStats = async () => {
			setLoading(true);
			setError(null);
			try {
				// Fetch patient count
				const { count: patientCount, error: patientError } = await supabase
					.from("patients")
					.select("*", { count: "exact", head: true });
				if (patientError) throw patientError;

				// Fetch doctor count
				const { count: doctorCount, error: doctorError } = await supabase
					.from("doctors")
					.select("*", { count: "exact", head: true });
				if (doctorError) throw doctorError;

				// Fetch available rooms count (Assuming 'Available' status exists)
				const { count: roomCount, error: roomError } = await supabase
					.from("rooms")
					.select("*", { count: "exact", head: true })
					.eq("status", "Available"); // Adjust status value if needed
				if (roomError) throw roomError;

				// Fetch unpaid bills count (Assuming 'Unpaid' or similar status exists)
				const { count: billCount, error: billError } = await supabase
					.from("bills")
					.select("*", { count: "exact", head: true })
					.in("status", ["Unpaid", "Pending"]); // Adjust status values if needed
				if (billError) throw billError;

				setStats({
					patients: patientCount || 0,
					doctors: doctorCount || 0,
					roomsAvailable: roomCount || 0,
					unpaidBills: billCount || 0,
				});
			} catch (err) {
				console.error("Error fetching dashboard stats:", err);
				setError(`Failed to load dashboard data: ${err.message}`);
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	const StatCard = ({ title, value, icon }) => (
		<Card sx={{ display: "flex", alignItems: "center", p: 2 }}>
			<Box sx={{ mr: 2, color: "primary.main" }}>{icon}</Box>
			<Box>
				<Typography color="text.secondary" gutterBottom>
					{title}
				</Typography>
				<Typography variant="h5" component="div">
					{value}
				</Typography>
			</Box>
		</Card>
	);

	return (
		<Box sx={{ flexGrow: 1 }}>
			<Typography variant="h4" gutterBottom component="div" sx={{ mb: 3 }}>
				Hospital Dashboard
			</Typography>

			{loading && (
				<Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
					<CircularProgress />
				</Box>
			)}
			{error && (
				<Alert severity="error" sx={{ my: 2 }}>
					{error}
				</Alert>
			)}

			{!loading && !error && (
				<Grid container spacing={3}>
					<Grid item xs={12} sm={6} md={3}>
						<StatCard
							title="Total Patients"
							value={stats.patients}
							icon={<PeopleIcon fontSize="large" />}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={3}>
						<StatCard
							title="Total Doctors"
							value={stats.doctors}
							icon={<MedicalServicesIcon fontSize="large" />}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={3}>
						<StatCard
							title="Available Rooms"
							value={stats.roomsAvailable}
							icon={<MeetingRoomIcon fontSize="large" />}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={3}>
						<StatCard
							title="Pending Bills"
							value={stats.unpaidBills}
							icon={<ReceiptIcon fontSize="large" />}
						/>
					</Grid>
					{/* Add more cards or charts as needed */}
				</Grid>
			)}
		</Box>
	);
}

export default DashboardPage;
