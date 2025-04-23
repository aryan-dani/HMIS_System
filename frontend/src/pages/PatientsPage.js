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
	MenuItem,
	Select,
	FormControl,
	InputLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import debounce from "lodash.debounce";

// Assume a structure for the patients table:
// id (auto-increment, unique), created_at, full_name, dob (date), gender, address, phone, email, medical_history (text)

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

function PatientsPage() {
	const [patients, setPatients] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");

	// Add Dialog State
	const [openAddDialog, setOpenAddDialog] = useState(false);
	const [newPatientData, setNewPatientData] = useState({
		full_name: "",
		dob: "", // Date of Birth
		gender: GENDERS[0],
		address: "",
		phone: "",
		email: "",
		medical_history: "",
	});
	const [submitLoading, setSubmitLoading] = useState(false);
	const [submitError, setSubmitError] = useState(null);

	// Edit Dialog State
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [editingPatient, setEditingPatient] = useState(null);
	const [editLoading, setEditLoading] = useState(false);
	const [editError, setEditError] = useState(null);

	// View Dialog State
	const [openViewDialog, setOpenViewDialog] = useState(false);
	const [viewingPatient, setViewingPatient] = useState(null);

	// Delete Dialog State
	const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
	const [deletingPatientId, setDeletingPatientId] = useState(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteError, setDeleteError] = useState(null);

	// Fetch Patients Function
	const fetchPatients = useCallback(async (query = "") => {
		setError(null);
		try {
			let supabaseQuery = supabase
				.from("patients") // Assuming 'patients' table
				.select(
					"id, full_name, dob, gender, phone, email, address, medical_history, created_at"
				)
				.order("created_at", { ascending: false });

			if (query) {
				const potentialId = parseInt(query, 10);
				let filters = [
					`full_name.ilike.%${query}%`,
					`phone.ilike.%${query}%`,
					`email.ilike.%${query}%`,
				];
				if (!isNaN(potentialId)) {
					filters.push(`id.eq.${potentialId}`);
				}
				supabaseQuery = supabaseQuery.or(filters.join(","));
			}

			const { data, error: fetchError } = await supabaseQuery;

			if (fetchError) {
				if (fetchError.code === "42P01") {
					console.warn(
						"Supabase fetch error: 'patients' table not found. Please ensure it exists."
					);
					setError(
						"Patient data is currently unavailable. Setup might be incomplete."
					);
					setPatients([]);
				} else {
					throw fetchError;
				}
			} else {
				setPatients(data || []);
			}
		} catch (err) {
			console.error("Error fetching patients:", err.message);
			setError("Failed to fetch patients. Please try again.");
		} finally {
			setLoading(false);
		}
	}, []);

	// Debounced Fetch
	const debouncedFetchPatients = useMemo(
		() => debounce((query) => fetchPatients(query), 500),
		[fetchPatients]
	);

	// Initial Fetch and Search Trigger
	useEffect(() => {
		fetchPatients();
	}, [fetchPatients]);

	useEffect(() => {
		setLoading(true);
		debouncedFetchPatients(searchQuery);
		return () => {
			debouncedFetchPatients.cancel();
		};
	}, [searchQuery, debouncedFetchPatients]);

	// --- Search Handler ---
	const handleSearchChange = (event) => {
		setSearchQuery(event.target.value);
	};

	// --- Add Dialog Handlers ---
	const handleAddClickOpen = () => {
		setSubmitError(null);
		setNewPatientData({
			full_name: "",
			dob: "",
			gender: GENDERS[0],
			address: "",
			phone: "",
			email: "",
			medical_history: "",
		});
		setOpenAddDialog(true);
	};

	const handleAddClose = () => {
		setOpenAddDialog(false);
		setSubmitError(null);
	};

	const handleAddInputChange = (e) => {
		const { name, value } = e.target;
		setNewPatientData({ ...newPatientData, [name]: value });
	};

	const handleAddSubmit = async (e) => {
		e.preventDefault();
		setSubmitLoading(true);
		setSubmitError(null);

		if (
			!newPatientData.full_name ||
			!newPatientData.dob ||
			!newPatientData.gender
		) {
			setSubmitError("Full Name, Date of Birth, and Gender are required.");
			setSubmitLoading(false);
			return;
		}

		try {
			// Ensure dob is handled correctly (might need formatting if Supabase expects a specific date format)
			const patientDataToInsert = { ...newPatientData };
			if (!patientDataToInsert.dob) {
				patientDataToInsert.dob = null; // Handle empty date if needed
			}

			const { data, error: insertError } = await supabase
				.from("patients")
				.insert([patientDataToInsert])
				.select();

			if (insertError) throw insertError;

			console.log("Patient added:", data);
			fetchPatients(searchQuery); // Refresh list
			handleAddClose();
		} catch (err) {
			console.error("Error adding patient:", err.message);
			setSubmitError(`Failed to add patient: ${err.message}`);
		} finally {
			setSubmitLoading(false);
		}
	};

	// --- Edit Dialog Handlers ---
	const handleEditClick = (patient) => {
		setEditError(null);
		// Format date for input type='date'
		const formattedDob = patient.dob ? patient.dob.split("T")[0] : "";
		setEditingPatient({ ...patient, dob: formattedDob });
		setOpenEditDialog(true);
	};

	const handleEditClose = () => {
		setOpenEditDialog(false);
		setEditingPatient(null);
		setEditError(null);
	};

	const handleEditInputChange = (e) => {
		const { name, value } = e.target;
		setEditingPatient({ ...editingPatient, [name]: value });
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();
		setEditLoading(true);
		setEditError(null);

		if (!editingPatient || !editingPatient.id) {
			setEditError("Cannot update patient: ID is missing.");
			setEditLoading(false);
			return;
		}
		if (
			!editingPatient.full_name ||
			!editingPatient.dob ||
			!editingPatient.gender
		) {
			setEditError("Full Name, Date of Birth, and Gender are required.");
			setEditLoading(false);
			return;
		}

		try {
			const { id, created_at, ...updateData } = editingPatient;
			// Ensure dob is handled correctly
			const patientDataToUpdate = { ...updateData };
			if (!patientDataToUpdate.dob) {
				patientDataToUpdate.dob = null;
			}

			const { error: updateError } = await supabase
				.from("patients")
				.update(patientDataToUpdate)
				.eq("id", id);

			if (updateError) throw updateError;

			console.log("Patient updated:", id);
			fetchPatients(searchQuery); // Refresh list
			handleEditClose();
		} catch (err) {
			console.error("Error updating patient:", err.message);
			setEditError(`Failed to update patient: ${err.message}`);
		} finally {
			setEditLoading(false);
		}
	};

	// --- View Dialog Handlers ---
	const handleViewClick = (patient) => {
		setViewingPatient(patient);
		setOpenViewDialog(true);
	};

	const handleViewClose = () => {
		setOpenViewDialog(false);
		setViewingPatient(null);
	};

	// --- Delete Dialog Handlers ---
	const handleDeleteClick = (patientId) => {
		setDeleteError(null);
		setDeletingPatientId(patientId);
		setOpenDeleteConfirm(true);
	};

	const handleDeleteClose = () => {
		setOpenDeleteConfirm(false);
		setDeletingPatientId(null);
		setDeleteError(null);
	};

	const handleDeleteConfirm = async () => {
		setDeleteLoading(true);
		setDeleteError(null);

		if (!deletingPatientId) {
			setDeleteError("Cannot delete patient: ID is missing.");
			setDeleteLoading(false);
			return;
		}

		try {
			const { error: deleteError } = await supabase
				.from("patients")
				.delete()
				.eq("id", deletingPatientId);

			if (deleteError) throw deleteError;

			console.log("Patient deleted:", deletingPatientId);
			fetchPatients(searchQuery); // Refresh list
			handleDeleteClose();
		} catch (err) {
			console.error("Error deleting patient:", err.message);
			// Handle potential foreign key constraint errors if patients are linked elsewhere
			if (err.code === "23503") {
				// PostgreSQL foreign key violation
				setDeleteError(
					"Cannot delete patient: They may have associated records (e.g., appointments, bills). Please remove those first."
				);
			} else {
				setDeleteError(`Failed to delete patient: ${err.message}`);
			}
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
					Patient Management
				</Typography>
				<TextField
					variant="outlined"
					size="small"
					placeholder="Search by ID, Name, Phone, Email..."
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
					Add Patient
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

			{/* Patients Table */}
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} aria-label="patients table">
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Full Name</TableCell>
							<TableCell>Date of Birth</TableCell>
							<TableCell>Gender</TableCell>
							<TableCell>Phone</TableCell>
							<TableCell>Email</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={7} align="center">
									<CircularProgress size={30} />
								</TableCell>
							</TableRow>
						) : patients.length === 0 && !error ? (
							<TableRow>
								<TableCell colSpan={7} align="center">
									{searchQuery
										? `No patients found matching "${searchQuery}".`
										: "No patients found. Click 'Add Patient' to begin."}
								</TableCell>
							</TableRow>
						) : (
							patients.map((patient) => (
								<TableRow
									key={patient.id}
									sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
									<TableCell>{patient.id}</TableCell>
									<TableCell>{patient.full_name || "N/A"}</TableCell>
									<TableCell>
										{patient.dob
											? new Date(patient.dob).toLocaleDateString()
											: "N/A"}
									</TableCell>
									<TableCell>{patient.gender || "N/A"}</TableCell>
									<TableCell>{patient.phone || "N/A"}</TableCell>
									<TableCell>{patient.email || "N/A"}</TableCell>
									<TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
										{" "}
										{/* Prevent wrapping */}
										{/* Wrap buttons in a Box for better control if needed, but whiteSpace might be enough */}
										<IconButton
											size="small"
											sx={{ mr: 0.5 }}
											onClick={() => handleViewClick(patient)}
											title="View Details">
											<VisibilityIcon />
										</IconButton>
										<IconButton
											size="small"
											sx={{ mr: 0.5 }}
											onClick={() => handleEditClick(patient)}
											title="Edit Patient">
											<EditIcon />
										</IconButton>
										<IconButton
											size="small"
											color="error"
											onClick={() => handleDeleteClick(patient.id)}
											title="Delete Patient">
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Add Patient Dialog */}
			<Dialog
				open={openAddDialog}
				onClose={handleAddClose}
				maxWidth="sm"
				fullWidth>
				<DialogTitle>Add New Patient</DialogTitle>
				<DialogContent>
					{" "}
					<DialogContentText sx={{ my: 2 }}>
						Fill in the details for the new patient.
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
						value={newPatientData.full_name}
						onChange={handleAddInputChange}
						required
					/>
					<TextField
						margin="dense"
						name="dob"
						label="Date of Birth"
						type="date"
						fullWidth
						variant="standard"
						value={newPatientData.dob}
						onChange={handleAddInputChange}
						required
						InputLabelProps={{
							shrink: true, // Keep label floated for date input
						}}
					/>
					<FormControl fullWidth margin="dense" variant="standard" required>
						<InputLabel id="add-patient-gender-label">Gender</InputLabel>
						<Select
							labelId="add-patient-gender-label"
							name="gender"
							value={newPatientData.gender}
							onChange={handleAddInputChange}
							label="Gender">
							{GENDERS.map((gender) => (
								<MenuItem key={gender} value={gender}>
									{gender}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<TextField
						margin="dense"
						name="phone"
						label="Phone Number"
						type="tel"
						fullWidth
						variant="standard"
						value={newPatientData.phone}
						onChange={handleAddInputChange}
					/>
					<TextField
						margin="dense"
						name="email"
						label="Email Address"
						type="email"
						fullWidth
						variant="standard"
						value={newPatientData.email}
						onChange={handleAddInputChange}
					/>
					<TextField
						margin="dense"
						name="address"
						label="Address"
						type="text"
						fullWidth
						multiline
						rows={2}
						variant="standard"
						value={newPatientData.address}
						onChange={handleAddInputChange}
					/>
					<TextField
						margin="dense"
						name="medical_history"
						label="Medical History (Optional)"
						type="text"
						fullWidth
						multiline
						rows={3}
						variant="standard"
						value={newPatientData.medical_history}
						onChange={handleAddInputChange}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleAddClose} disabled={submitLoading}>
						Cancel
					</Button>
					<Button onClick={handleAddSubmit} disabled={submitLoading}>
						{submitLoading ? <CircularProgress size={24} /> : "Add Patient"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Patient Dialog */}
			<Dialog
				open={openEditDialog}
				onClose={handleEditClose}
				maxWidth="sm"
				fullWidth>
				<DialogTitle>Edit Patient Details</DialogTitle>
				<DialogContent>
					{" "}
					<DialogContentText sx={{ my: 2 }}>
						Update the patient's information.
					</DialogContentText>{" "}
					{editError && (
						<Alert severity="error" sx={{ my: 2 }}>
							{editError}
						</Alert>
					)}
					{editingPatient && (
						<>
							<TextField
								autoFocus
								margin="dense"
								name="full_name"
								label="Full Name"
								type="text"
								fullWidth
								variant="standard"
								value={editingPatient.full_name || ""}
								onChange={handleEditInputChange}
								required
							/>
							<TextField
								margin="dense"
								name="dob"
								label="Date of Birth"
								type="date"
								fullWidth
								variant="standard"
								value={editingPatient.dob || ""}
								onChange={handleEditInputChange}
								required
								InputLabelProps={{ shrink: true }}
							/>
							<FormControl fullWidth margin="dense" variant="standard" required>
								<InputLabel id="edit-patient-gender-label">Gender</InputLabel>
								<Select
									labelId="edit-patient-gender-label"
									name="gender"
									value={editingPatient.gender || ""}
									onChange={handleEditInputChange}
									label="Gender">
									{GENDERS.map((gender) => (
										<MenuItem key={gender} value={gender}>
											{gender}
										</MenuItem>
									))}
								</Select>
							</FormControl>
							<TextField
								margin="dense"
								name="phone"
								label="Phone Number"
								type="tel"
								fullWidth
								variant="standard"
								value={editingPatient.phone || ""}
								onChange={handleEditInputChange}
							/>
							<TextField
								margin="dense"
								name="email"
								label="Email Address"
								type="email"
								fullWidth
								variant="standard"
								value={editingPatient.email || ""}
								onChange={handleEditInputChange}
							/>
							<TextField
								margin="dense"
								name="address"
								label="Address"
								type="text"
								fullWidth
								multiline
								rows={2}
								variant="standard"
								value={editingPatient.address || ""}
								onChange={handleEditInputChange}
							/>
							<TextField
								margin="dense"
								name="medical_history"
								label="Medical History"
								type="text"
								fullWidth
								multiline
								rows={3}
								variant="standard"
								value={editingPatient.medical_history || ""}
								onChange={handleEditInputChange}
							/>
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

			{/* View Patient Dialog */}
			<Dialog
				open={openViewDialog}
				onClose={handleViewClose}
				maxWidth="sm"
				fullWidth>
				<DialogTitle>Patient Details</DialogTitle>
				<DialogContent dividers>
					{viewingPatient ? (
						<Box>
							<Typography gutterBottom>
								<strong>ID:</strong> {viewingPatient.id}
							</Typography>
							<Typography gutterBottom>
								<strong>Full Name:</strong> {viewingPatient.full_name || "N/A"}
							</Typography>
							<Typography gutterBottom>
								<strong>Date of Birth:</strong>{" "}
								{viewingPatient.dob
									? new Date(viewingPatient.dob).toLocaleDateString()
									: "N/A"}
							</Typography>
							<Typography gutterBottom>
								<strong>Gender:</strong> {viewingPatient.gender || "N/A"}
							</Typography>
							<Typography gutterBottom>
								<strong>Phone:</strong> {viewingPatient.phone || "N/A"}
							</Typography>
							<Typography gutterBottom>
								<strong>Email:</strong> {viewingPatient.email || "N/A"}
							</Typography>
							<Typography gutterBottom>
								<strong>Address:</strong> {viewingPatient.address || "N/A"}
							</Typography>
							<Typography gutterBottom component="div">
								<strong>Medical History:</strong>
								<Typography
									variant="body2"
									component="pre"
									sx={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
									{viewingPatient.medical_history || "N/A"}
								</Typography>
							</Typography>
							<Typography gutterBottom>
								<strong>Registered On:</strong>{" "}
								{viewingPatient.created_at
									? new Date(viewingPatient.created_at).toLocaleString()
									: "N/A"}
							</Typography>
						</Box>
					) : (
						<Typography>No patient data available.</Typography>
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
						Are you sure you want to delete this patient record? This action
						cannot be undone and might affect related records (e.g., bills,
						appointments).
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

export default PatientsPage;
