/** @format */

import React, { useState /*, useEffect */ } from "react"; // Keep useEffect commented for now
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import "./AdminDashboardPage.css"; // Assuming you'll create this CSS file for styling

// Placeholder data - replace with actual API calls
const patientData = [
	{ name: "Jan", patients: 30 },
	{ name: "Feb", patients: 45 },
	{ name: "Mar", patients: 60 },
	{ name: "Apr", patients: 55 },
	{ name: "May", patients: 70 },
	{ name: "Jun", patients: 85 },
];

const appointmentData = [
	{ status: "Scheduled", count: 120 },
	{ status: "Completed", count: 350 },
	{ status: "Cancelled", count: 45 },
];

const revenueData = [
	{ month: "Jan", revenue: 4000 },
	{ month: "Feb", revenue: 3000 },
	{ month: "Mar", revenue: 5000 },
	{ month: "Apr", revenue: 4500 },
	{ month: "May", revenue: 6000 },
	{ month: "Jun", revenue: 5500 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function AdminDashboardPage() {
	// In a real app, you'd fetch this data
	const [stats /*, setStats */] = useState({
		// Keep setStats commented for now
		totalPatients: 580,
		totalDoctors: 25,
		occupiedRooms: 45,
		totalAppointments: 515,
	});

	// useEffect(() => {
	//  // Fetch data from your API here and update state
	//  // e.g., fetch('/api/admin/stats').then(res => res.json()).then(data => setStats(data));
	//  // fetch('/api/admin/patient-trends').then(res => res.json()).then(data => setPatientData(data));
	//  // ... fetch other chart data
	// }, []);

	return (
		<div className="admin-dashboard">
			<h1>Admin Dashboard</h1>

			{/* Key Stats Section */}
			<div className="stats-grid">
				<div className="stat-card">
					<h2>Total Patients</h2>
					<p>{stats.totalPatients}</p>
				</div>
				<div className="stat-card">
					<h2>Total Doctors</h2>
					<p>{stats.totalDoctors}</p>
				</div>
				<div className="stat-card">
					<h2>Occupied Rooms</h2>
					<p>{stats.occupiedRooms}</p>
				</div>
				<div className="stat-card">
					<h2>Total Appointments</h2>
					<p>{stats.totalAppointments}</p>
				</div>
			</div>

			{/* Charts Section */}
			<div className="charts-section">
				<div className="chart-container">
					<h2>Patient Trends (Last 6 Months)</h2>
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={patientData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip />
							<Legend />
							<Line
								type="monotone"
								dataKey="patients"
								stroke="#8884d8"
								activeDot={{ r: 8 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>

				<div className="chart-container">
					<h2>Appointment Status</h2>
					<ResponsiveContainer width="100%" height={300}>
						<PieChart>
							<Pie
								data={appointmentData}
								cx="50%"
								cy="50%"
								labelLine={false}
								outerRadius={85} // Keep reduced radius
								fill="#8884d8"
								dataKey="count"
								nameKey="status"
								// Custom label component with smaller font size
								label={({
									cx,
									cy,
									midAngle,
									innerRadius,
									outerRadius,
									percent,
									index,
									name,
								}) => {
									const RADIAN = Math.PI / 180;
									const radius =
										innerRadius + (outerRadius - innerRadius) * 1.1; // Position label slightly outside
									const x = cx + radius * Math.cos(-midAngle * RADIAN);
									const y = cy + radius * Math.sin(-midAngle * RADIAN);

									return (
										<text
											x={x}
											y={y}
											fill="#666" // Label color
											textAnchor={x > cx ? "start" : "end"}
											dominantBaseline="central"
											fontSize="12px" // Smaller font size
										>
											{`${name} ${(percent * 100).toFixed(0)}%`}
										</text>
									);
								}}>
								{appointmentData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
							<Tooltip />
							<Legend />
						</PieChart>
					</ResponsiveContainer>
				</div>

				<div className="chart-container">
					<h2>Monthly Revenue</h2>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={revenueData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="month" />
							<YAxis />
							<Tooltip />
							<Legend />
							<Bar dataKey="revenue" fill="#82ca9d" />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Other Features Section */}
			<div className="features-section">
				<h2>Management Features</h2>
				<div className="feature-links">
					{/* Replace with actual Links from react-router-dom */}
					<button onClick={() => alert("Navigate to User Management")}>
						Manage Users
					</button>
					<button onClick={() => alert("Navigate to System Settings")}>
						System Settings
					</button>
					<button onClick={() => alert("Navigate to Reports")}>
						Generate Reports
					</button>
					<button onClick={() => alert("Navigate to Audit Log")}>
						View Audit Log
					</button>
				</div>
			</div>
		</div>
	);
}

export default AdminDashboardPage;
