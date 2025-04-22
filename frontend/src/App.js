/** @format */

import React from "react";
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext"; // Import useAuth

// Import pages
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import PatientsPage from "./pages/PatientsPage";
import DoctorsPage from "./pages/DoctorsPage";
import RoomsPage from "./pages/RoomsPage";
import BillingPage from "./pages/BillingPage";
import PathologyPage from "./pages/PathologyPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

// Import components
import Navbar from "./components/Navbar";
import { Box, CircularProgress } from "@mui/material"; // Import Box and CircularProgress

// Determine the base path based on the environment
const basename =
	process.env.NODE_ENV === "development" ? "/" : process.env.PUBLIC_URL || "/";

function App() {
	const { session, loading } = useAuth(); // Get session and loading state

	// Show loading indicator while checking auth state
	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Router basename={basename}>
			<div className="App">
				{/* Only show Navbar if logged in */}
				{session && <Navbar />}
				<Box component="main" sx={{ p: 3 }}>
					<Routes>
						{/* Public Route: Login */}
						<Route
							path="/login"
							element={!session ? <LoginPage /> : <Navigate to="/" replace />}
						/>

						{/* Protected Routes */}
						<Route
							path="/"
							element={
								session ? <DashboardPage /> : <Navigate to="/login" replace />
							}
						/>
						<Route
							path="/patients"
							element={
								session ? <PatientsPage /> : <Navigate to="/login" replace />
							}
						/>
						<Route
							path="/doctors"
							element={
								session ? <DoctorsPage /> : <Navigate to="/login" replace />
							}
						/>
						<Route
							path="/rooms"
							element={
								session ? <RoomsPage /> : <Navigate to="/login" replace />
							}
						/>
						<Route
							path="/billing"
							element={
								session ? <BillingPage /> : <Navigate to="/login" replace />
							}
						/>
						<Route
							path="/pathology"
							element={
								session ? <PathologyPage /> : <Navigate to="/login" replace />
							}
						/>
						<Route
							path="/admin"
							element={
								session ? (
									<AdminDashboardPage />
								) : (
									<Navigate to="/login" replace />
								)
							}
						/>

						{/* Catch-all for unknown routes - redirect based on auth state */}
						<Route
							path="*"
							element={<Navigate to={session ? "/" : "/login"} replace />}
						/>
					</Routes>
				</Box>
			</div>
		</Router>
	);
}
export default App;
