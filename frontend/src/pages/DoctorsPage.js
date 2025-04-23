/** @format */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../supabaseClient";
import {
	Box,
	Typography,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	CircularProgress,
	Alert,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	TextField,
	InputAdornment,
	IconButton,
	MenuItem, // Added for Select dropdown
	Select, // Added for Select dropdown
	FormControl, // Added for Select dropdown
	InputLabel, // Added for Select dropdown
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import debounce from "lodash.debounce";

// Assume a structure for the doctors table:
// id, created_at, full_name, specialization, phone, email, availability_status (e.g., 'Available', 'Unavailable', 'On Leave')

const DOCTOR_STATUSES = ["Available", "Unavailable", "On Leave", "Busy"]; // Define statuses

function DoctorsPage() {
	const [doctors, setDoctors] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");

	// Add Dialog State
	const [openAddDialog, setOpenAddDialog] = useState(false);
	const [newDoctorData, setNewDoctorData] = useState({
		full_name: "",
		specialization: "",
		phone: "",
		email: "",
		availability_status: DOCTOR_STATUSES[0], // Default status using constant
	});
	const [submitLoading, setSubmitLoading] = useState(false);
	const [submitError, setSubmitError] = useState(null);

	// Edit Dialog State
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [editingDoctor, setEditingDoctor] = useState(null);
	const [editLoading, setEditLoading] = useState(false);
	const [editError, setEditError] = useState(null);

	// View Dialog State
	const [openViewDialog, setOpenViewDialog] = useState(false);
	const [viewingDoctor, setViewingDoctor] = useState(null);

	// Delete Dialog State
	const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
	const [deletingDoctorId, setDeletingDoctorId] = useState(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteError, setDeleteError] = useState(null);

	// Fetch Doctors Function (wrapped in useCallback)
	const fetchDoctors = useCallback(async (query = "") => {
		setError(null);
		try {
			let supabaseQuery = supabase
				.from("doctors") // Assuming 'doctors' table
				.select(
					"id, full_name, specialization, phone, email, availability_status, created_at"
				)
				.order("created_at", { ascending: false });

			if (query) {
				const potentialId = parseInt(query, 10);
				if (!isNaN(potentialId)) {
					supabaseQuery = supabaseQuery.or(
						`full_name.ilike.%${query}%,specialization.ilike.%${query}%,id.eq.${potentialId}`
					);
				} else {
					supabaseQuery = supabaseQuery.or(
						`full_name.ilike.%${query}%,specialization.ilike.%${query}%`
					);
				}
			}

			const { data, error: fetchError } = await supabaseQuery;

			if (fetchError) {
				// Handle case where table might not exist yet gracefully
				if (fetchError.code === "42P01") {
					// PostgreSQL error code for undefined table
					console.warn(
						"Supabase fetch error: 'doctors' table not found. Please ensure it exists."
					);
					setError(
						"Doctor data is currently unavailable. Setup might be incomplete."
					);
					setDoctors([]); // Set to empty array if table doesn't exist
				} else {
					throw fetchError;
				}
			} else {
				setDoctors(data || []);
			}
		} catch (err) {
			console.error("Error fetching doctors:", err.message);
			setError("Failed to fetch doctors. Please try again.");
		} finally {
			setLoading(false);
		}
	}, []);

	// Debounced Fetch - Corrected usage
	// We memoize the debounced function itself, ensuring it has a stable reference
	// as long as fetchDoctors doesn't change.
	const debouncedFetchDoctors = useMemo(
		() =>
			debounce((query) => {
				fetchDoctors(query);
			}, 500),
		[fetchDoctors] // Dependency: Recreate debounce if fetchDoctors changes
	);

	// Initial Fetch and Search Trigger
	useEffect(() => {
		fetchDoctors();
	}, [fetchDoctors]);

	useEffect(() => {
		setLoading(true);
		debouncedFetchDoctors(searchQuery);
		return () => {
			debouncedFetchDoctors.cancel();
		};
	}, [searchQuery, debouncedFetchDoctors]);

	// --- Search Handler ---
	const handleSearchChange = (event) => {
		setSearchQuery(event.target.value);
	};

	// --- Add Dialog Handlers ---
	const handleAddClickOpen = () => {
		setSubmitError(null);
		setNewDoctorData({
			full_name: "",
			specialization: "",
			phone: "",
			email: "",
			availability_status: DOCTOR_STATUSES[0],
		});
		setOpenAddDialog(true);
	};

	const handleAddClose = () => {
		setOpenAddDialog(false);
		setSubmitError(null);
	};

	const handleAddInputChange = (e) => {
		const { name, value } = e.target;
		setNewDoctorData({ ...newDoctorData, [name]: value });
	};

	const handleAddSubmit = async (e) => {
		e.preventDefault();
		setSubmitLoading(true);
		setSubmitError(null);

		if (!newDoctorData.full_name || !newDoctorData.specialization) {
			setSubmitError("Full Name and Specialization are required.");
			setSubmitLoading(false);
			return;
		}

		try {
			const { data, error: insertError } = await supabase
				.from("doctors")
				.insert([newDoctorData])
				.select();

			if (insertError) throw insertError;

			console.log("Doctor added:", data);
			fetchDoctors(searchQuery);
			handleAddClose();
		} catch (err) {
			console.error("Error adding doctor:", err.message);
			setSubmitError(`Failed to add doctor: ${err.message}`);
		} finally {
			setSubmitLoading(false);
		}
	};

	// --- Edit Dialog Handlers ---
	const handleEditClick = (doctor) => {
		setEditError(null);
		setEditingDoctor({ ...doctor });
		setOpenEditDialog(true);
	};

	const handleEditClose = () => {
		setOpenEditDialog(false);
		setEditingDoctor(null);
		setEditError(null);
	};

	const handleEditInputChange = (e) => {
		const { name, value } = e.target;
		setEditingDoctor({ ...editingDoctor, [name]: value });
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();
		setEditLoading(true);
		setEditError(null);

		if (!editingDoctor || !editingDoctor.id) {
			setEditError("Cannot update doctor: ID is missing.");
			setEditLoading(false);
			return;
		}
		if (!editingDoctor.full_name || !editingDoctor.specialization) {
			setEditError("Full Name and Specialization are required.");
			setEditLoading(false);
			return;
		}

		try {
			const { id, created_at, ...updateData } = editingDoctor;
			const { error: updateError } = await supabase
				.from("doctors")
				.update(updateData)
				.eq("id", id);

			if (updateError) throw updateError;

			console.log("Doctor updated:", id);
			fetchDoctors(searchQuery);
			handleEditClose();
		} catch (err) {
			console.error("Error updating doctor:", err.message);
			setEditError(`Failed to update doctor: ${err.message}`);
		} finally {
			setEditLoading(false);
		}
	};

	// --- View Dialog Handlers ---
	const handleViewClick = (doctor) => {
		setViewingDoctor(doctor);
		setOpenViewDialog(true);
	};

	const handleViewClose = () => {
		setOpenViewDialog(false);
		setViewingDoctor(null);
	};

	// --- Delete Dialog Handlers ---
	const handleDeleteClick = (doctorId) => {
		setDeleteError(null);
		setDeletingDoctorId(doctorId);
		setOpenDeleteConfirm(true);
	};

	const handleDeleteClose = () => {
		setOpenDeleteConfirm(false);
		setDeletingDoctorId(null);
		setDeleteError(null);
	};

	const handleDeleteConfirm = async () => {
		setDeleteLoading(true);
		setDeleteError(null);

		if (!deletingDoctorId) {
			setDeleteError("Cannot delete doctor: ID is missing.");
			setDeleteLoading(false);
			return;
		}

		try {
			const { error: deleteError } = await supabase
				.from("doctors")
				.delete()
				.eq("id", deletingDoctorId);

			if (deleteError) throw deleteError;

			console.log("Doctor deleted:", deletingDoctorId);
			fetchDoctors(searchQuery);
			handleDeleteClose();
		} catch (err) {
			console.error("Error deleting doctor:", err.message);
			setDeleteError(`Failed to delete doctor: ${err.message}`);
		} finally {
			setDeleteLoading(false);
		}
	};

	return (
		<Box>
			{/* Header and Actions */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
					flexWrap: "wrap",
					gap: 2,
				}}>
				<Typography variant="h4" component="h1">
					Doctor Management
				</Typography>
				<TextField
					variant="outlined"
					size="small"
					placeholder="Search by Name, Specialization, or ID..."
					value={searchQuery}
					onChange={handleSearchChange}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon />
							</InputAdornment>
						),
					}}
					sx={{ minWidth: "300px", flexGrow: { xs: 1, sm: 0 } }}
				/>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={handleAddClickOpen}>
					Add Doctor
				</Button>
			</Box>

			{/* Loading and Error Display */}
			{loading && !searchQuery && (
				<Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
					<CircularProgress />
				</Box>
			)}
			{error && (
				<Alert severity="error" sx={{ my: 2 }}>
					{error}
				</Alert>
			)}

			{/* Doctors Table */}
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} aria-label="doctors table">
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Full Name</TableCell>
							<TableCell>Specialization</TableCell>
							<TableCell>Phone</TableCell>
							<TableCell>Status</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={6} align="center">
									<CircularProgress size={30} />
								</TableCell>
							</TableRow>
						) : doctors.length === 0 && !error ? ( // Show 'No doctors' only if no error
							<TableRow>
								<TableCell colSpan={6} align="center">
									{searchQuery
										? `No doctors found matching "${searchQuery}".`
										: "No doctors found. Click 'Add Doctor' to begin."}
								</TableCell>
							</TableRow>
						) : (
							doctors.map((doctor) => (
								<TableRow
									key={doctor.id}
									sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
									<TableCell>{doctor.id}</TableCell>
									<TableCell>{doctor.full_name || "N/A"}</TableCell>
									<TableCell>{doctor.specialization || "N/A"}</TableCell>
									<TableCell>{doctor.phone || "N/A"}</TableCell>
									<TableCell>{doctor.availability_status || "N/A"}</TableCell>
									<TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
										{" "}
										{/* Prevent wrapping */}
										<IconButton
											size="small"
											sx={{ mr: 0.5 }}
											onClick={() => handleViewClick(doctor)}
											title="View Details">
											<VisibilityIcon />
										</IconButton>
										<IconButton
											size="small"
											sx={{ mr: 0.5 }}
											onClick={() => handleEditClick(doctor)}
											title="Edit Doctor">
											<EditIcon />
										</IconButton>
										<IconButton
											size="small"
											color="error"
											onClick={() => handleDeleteClick(doctor.id)}
											title="Delete Doctor">
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Add Doctor Dialog */}
			<Dialog
				open={openAddDialog}
				onClose={handleAddClose}
				maxWidth="sm"
				fullWidth>
				<DialogTitle>Add New Doctor</DialogTitle>
				<DialogContent>
					{" "}
					<DialogContentText sx={{ my: 2 }}>
						Fill in the details for the new doctor.
					</DialogContentText>{" "}
					{submitError && (
						<Alert severity="error" sx={{ my: 2 }}>
							{submitError}
						</Alert>
					)}
					<TextField
						autoFocus
						margin="dense"
						name="full_name"
						label="Full Name"
						type="text"
						fullWidth
						variant="standard"
						value={newDoctorData.full_name}
						onChange={handleAddInputChange}
						required
					/>
					<TextField
						margin="dense"
						name="specialization"
						label="Specialization"
						type="text"
						fullWidth
						variant="standard"
						value={newDoctorData.specialization}
						onChange={handleAddInputChange}
						required
					/>
					<TextField
						margin="dense"
						name="phone"
						label="Phone Number"
						type="tel"
						fullWidth
						variant="standard"
						value={newDoctorData.phone}
						onChange={handleAddInputChange}
					/>
					<TextField
						margin="dense"
						name="email"
						label="Email Address"
						type="email"
						fullWidth
						variant="standard"
						value={newDoctorData.email}
						onChange={handleAddInputChange}
					/>
					{/* Replace TextField with Select for availability_status */}
					<FormControl fullWidth margin="dense" variant="standard">
						<InputLabel id="add-doctor-status-label">
							Availability Status
						</InputLabel>
						<Select
							labelId="add-doctor-status-label"
							name="availability_status"
							value={newDoctorData.availability_status}
							onChange={handleAddInputChange}
							label="Availability Status">
							{DOCTOR_STATUSES.map((status) => (
								<MenuItem key={status} value={status}>
									{status}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleAddClose} disabled={submitLoading}>
						Cancel
					</Button>
					<Button onClick={handleAddSubmit} disabled={submitLoading}>
						{submitLoading ? <CircularProgress size={24} /> : "Add Doctor"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Doctor Dialog */}
			<Dialog
				open={openEditDialog}
				onClose={handleEditClose}
				maxWidth="sm"
				fullWidth>
				<DialogTitle>Edit Doctor Details</DialogTitle>
				<DialogContent>
					{" "}
					<DialogContentText sx={{ my: 2 }}>
						Update the doctor's information.
					</DialogContentText>{" "}
					{editError && (
						<Alert severity="error" sx={{ my: 2 }}>
							{editError}
						</Alert>
					)}
					{editingDoctor && (
						<>
							<TextField
								autoFocus
								margin="dense"
								name="full_name"
								label="Full Name"
								type="text"
								fullWidth
								variant="standard"
								value={editingDoctor.full_name || ""}
								onChange={handleEditInputChange}
								required
							/>
							<TextField
								margin="dense"
								name="specialization"
								label="Specialization"
								type="text"
								fullWidth
								variant="standard"
								value={editingDoctor.specialization || ""}
								onChange={handleEditInputChange}
								required
							/>
							<TextField
								margin="dense"
								name="phone"
								label="Phone Number"
								type="tel"
								fullWidth
								variant="standard"
								value={editingDoctor.phone || ""}
								onChange={handleEditInputChange}
							/>
							<TextField
								margin="dense"
								name="email"
								label="Email Address"
								type="email"
								fullWidth
								variant="standard"
								value={editingDoctor.email || ""}
								onChange={handleEditInputChange}
							/>
							{/* Replace TextField with Select for availability_status */}
							<FormControl fullWidth margin="dense" variant="standard">
								<InputLabel id="edit-doctor-status-label">
									Availability Status
								</InputLabel>
								<Select
									labelId="edit-doctor-status-label"
									name="availability_status"
									value={editingDoctor.availability_status || ""}
									onChange={handleEditInputChange}
									label="Availability Status">
									{DOCTOR_STATUSES.map((status) => (
										<MenuItem key={status} value={status}>
											{status}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleEditClose} disabled={editLoading}>
						Cancel
					</Button>
					<Button onClick={handleEditSubmit} disabled={editLoading}>
						{editLoading ? <CircularProgress size={24} /> : "Save Changes"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* View Doctor Dialog */}
			<Dialog
				open={openViewDialog}
				onClose={handleViewClose}
				maxWidth="sm"
				fullWidth>
				<DialogTitle>Doctor Details</DialogTitle>
				<DialogContent dividers>
					{viewingDoctor ? (
						<Box>
							<Typography gutterBottom>
								<strong>ID:</strong> {viewingDoctor.id}
							</Typography>
							<Typography gutterBottom>
								<strong>Full Name:</strong> {viewingDoctor.full_name || "N/A"}
							</Typography>
							<Typography gutterBottom>
								<strong>Specialization:</strong>{" "}
								{viewingDoctor.specialization || "N/A"}
							</Typography>
							<Typography gutterBottom>
								<strong>Phone:</strong> {viewingDoctor.phone || "N/A"}
							</Typography>
							<Typography gutterBottom>
								<strong>Email:</strong> {viewingDoctor.email || "N/A"}
							</Typography>
							<Typography gutterBottom>
								<strong>Status:</strong>{" "}
								{viewingDoctor.availability_status || "N/A"}
							</Typography>
							<Typography gutterBottom>
								<strong>Registered On:</strong>{" "}
								{viewingDoctor.created_at
									? new Date(viewingDoctor.created_at).toLocaleString()
									: "N/A"}
							</Typography>
						</Box>
					) : (
						<Typography>No doctor data available.</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleViewClose}>Close</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={openDeleteConfirm}
				onClose={handleDeleteClose}
				maxWidth="sm"
				fullWidth>
				<DialogTitle>Confirm Deletion</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete this doctor record? This action
						cannot be undone.
					</DialogContentText>{" "}
					{deleteError && (
						<Alert severity="error" sx={{ my: 2 }}>
							{deleteError}
						</Alert>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteClose} disabled={deleteLoading}>
						Cancel
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						color="error"
						disabled={deleteLoading}
						autoFocus>
						{deleteLoading ? (
							<CircularProgress size={24} color="inherit" />
						) : (
							"Delete"
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

export default DoctorsPage;
