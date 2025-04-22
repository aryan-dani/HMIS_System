/** @format */

import React from "react";
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Import Layout
import Layout from "./components/Layout"; // Import the new Layout component

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
import { Box, CircularProgress } from "@mui/material";

// Determine the base path based on the environment
const basename =
	process.env.NODE_ENV === "development" ? "/" : process.env.PUBLIC_URL || "/";

function App() {
	const { session, loading } = useAuth();

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
			<Routes>
				{/* Public Route: Login - Rendered outside the main Layout */}
				<Route
					path="/login"
					element={!session ? <LoginPage /> : <Navigate to="/" replace />}
				/>

				{/* Protected Routes: Rendered inside the main Layout */}
				<Route
					path="/"
					element={session ? <Layout /> : <Navigate to="/login" replace />}>
					{/* Child routes of Layout (rendered via Outlet) */}
					{/* Restore DashboardPage for index route */}
					{/* <Route index element={<PatientsPage />} /> */}
					<Route index element={<DashboardPage />} />
					<Route path="patients" element={<PatientsPage />} />
					<Route path="doctors" element={<DoctorsPage />} />
					<Route path="rooms" element={<RoomsPage />} />
					<Route path="billing" element={<BillingPage />} />
					<Route path="pathology" element={<PathologyPage />} />
					<Route path="admin" element={<AdminDashboardPage />} />
				</Route>

				{/* Catch-all for unknown routes - redirect based on auth state */}
				<Route
					path="*"
					element={<Navigate to={session ? "/" : "/login"} replace />}
				/>
			</Routes>
		</Router>
	);
}

export default App;
