/** @format */

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

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

function App() {
	return (
		<Router>
			<div className="App">
				<Navbar />
				<main className="content">
					<Routes>
						<Route path="/" element={<DashboardPage />} />
						<Route path="/login" element={<LoginPage />} />
						<Route path="/patients" element={<PatientsPage />} />
						<Route path="/doctors" element={<DoctorsPage />} />
						<Route path="/rooms" element={<RoomsPage />} />
						<Route path="/billing" element={<BillingPage />} />
						<Route path="/pathology" element={<PathologyPage />} />
						<Route path="/admin" element={<AdminDashboardPage />} />
					</Routes>
				</main>
			</div>
		</Router>
	);
}
export default App;
