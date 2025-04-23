/** @format */

import React, { useState, useEffect } from "react";
// import supabase from '../supabaseClient'; // Assuming you'll use Supabase
import "./AppointmentsPage.css"; // Import the CSS file

function AppointmentsPage() {
	const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Placeholder for fetching appointments
	useEffect(() => {
		// Replace with actual API call to fetch appointments
		const fetchAppointments = async () => {
			setLoading(true);
			setError(null);
			try {
				// Example placeholder data
				const placeholderData = [
					{
						id: 1,
						patient_name: "John Doe",
						doctor_name: "Dr. Smith",
						appointment_date: "2025-05-10",
						time: "10:00 AM",
						status: "Scheduled",
					},
					{
						id: 2,
						patient_name: "Jane Roe",
						doctor_name: "Dr. Adams",
						appointment_date: "2025-05-11",
						time: "02:30 PM",
						status: "Completed",
					},
					{
						id: 3,
						patient_name: "Peter Jones",
						doctor_name: "Dr. Smith",
						appointment_date: "2025-05-12",
						time: "09:00 AM",
						status: "Scheduled",
					},
				];
				await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
				setAppointments(placeholderData);

				/*
                // Example Supabase fetch (uncomment and adapt when ready)
                const { data, error } = await supabase
                    .from('appointments') // Assuming 'appointments' table
                    .select(`
                        id,
                        appointment_date,
                        time,
                        status,
                        patients ( id, name ), // Assuming foreign key relationship
                        doctors ( id, name )   // Assuming foreign key relationship
                    `);

                if (error) throw error;
                // Process data if needed (e.g., format patient/doctor names)
                const formattedData = data.map(app => ({
                    ...app,
                    patient_name: app.patients?.name || 'N/A',
                    doctor_name: app.doctors?.name || 'N/A',
                }));
                setAppointments(formattedData);
                */
			} catch (err) {
				console.error("Error fetching appointments:", err);
				setError("Failed to fetch appointments. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		fetchAppointments();
	}, []);

	// Placeholder functions for Add/Edit/Delete
	const handleAddAppointment = () => {
		alert("Add Appointment functionality to be implemented.");
		// Open modal or navigate to a form
	};

	const handleEditAppointment = (id) => {
		alert(`Edit Appointment ${id} functionality to be implemented.`);
		// Open modal with appointment data
	};

	const handleDeleteAppointment = (id) => {
		if (window.confirm(`Are you sure you want to delete appointment ${id}?`)) {
			alert(`Delete Appointment ${id} functionality to be implemented.`);
			// Call API to delete, then refetch or update state
		}
	};

	return (
		<div className="appointments-page">
			{" "}
			{/* Add specific class if needed */}
			<h1>Appointments Management</h1>
			<button onClick={handleAddAppointment} style={{ marginBottom: "20px" }}>
				Schedule New Appointment
			</button>
			{loading && <p>Loading appointments...</p>}
			{error && <p style={{ color: "red" }}>{error}</p>}
			{!loading && !error && (
				<table>
					<thead>
						<tr>
							<th>ID</th>
							<th>Patient</th>
							<th>Doctor</th>
							<th>Date</th>
							<th>Time</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{appointments.length > 0 ? (
							appointments.map((app) => (
								<tr key={app.id}>
									<td>{app.id}</td>
									<td>{app.patient_name}</td>
									<td>{app.doctor_name}</td>
									<td>{app.appointment_date}</td>
									<td>{app.time}</td>
									<td>{app.status}</td>
									<td>
										<button onClick={() => handleEditAppointment(app.id)}>
											Edit
										</button>
										<button onClick={() => handleDeleteAppointment(app.id)}>
											Delete
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="7">No appointments found.</td>
							</tr>
						)}
					</tbody>
				</table>
			)}
		</div>
	);
}

export default AppointmentsPage;
