/** @format */

import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import { supabase } from "../supabaseClient"; // Import supabase client
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
	Dialog, // Import Dialog components
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	TextField,
	InputAdornment, // For search icon
	IconButton, // For delete icon button
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add"; // Icon for the button
import SearchIcon from "@mui/icons-material/Search"; // Icon for search
import EditIcon from "@mui/icons-material/Edit"; // Icon for edit button
import DeleteIcon from "@mui/icons-material/Delete"; // Icon for delete button
import VisibilityIcon from "@mui/icons-material/Visibility"; // Icon for view button
import debounce from "lodash.debounce"; // Import debounce

function PatientsPage() {
	const [patients, setPatients] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [openAddDialog, setOpenAddDialog] = useState(false); // State for dialog visibility
	const [newPatientData, setNewPatientData] = useState({
		// State for new patient form data
		full_name: "",
		age: "",
		gender: "",
		phone: "",
		address: "",
		emergency_contact: "",
	});
	const [submitLoading, setSubmitLoading] = useState(false); // Loading state for submission
	const [submitError, setSubmitError] = useState(null); // Error state for submission
	const [searchQuery, setSearchQuery] = useState(""); // State for search query

	// --- Edit State ---
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [editingPatient, setEditingPatient] = useState(null); // Store the patient being edited
	const [editLoading, setEditLoading] = useState(false);
	const [editError, setEditError] = useState(null);
	// --- End Edit State ---

	// --- View State ---
	const [openViewDialog, setOpenViewDialog] = useState(false);
	const [viewingPatient, setViewingPatient] = useState(null);
	// --- End View State ---

	// --- Delete State ---
	const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
	const [deletingPatientId, setDeletingPatientId] = useState(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteError, setDeleteError] = useState(null);
	// --- End Delete State ---

	// Wrap fetchPatients in useCallback to stabilize its reference
	// Define fetchPatients *before* useEffects that use it
	const fetchPatients = useCallback(async (query = "") => {
		// setLoading(true); // Loading is handled by the useEffect calling this
		setError(null);
		try {
			let supabaseQuery = supabase
				.from("patients")
				.select(
					"id, full_name, age, gender, phone, address, emergency_contact, created_at"
				) // Select more columns for editing/viewing
				.order("created_at", { ascending: false });

			// Apply search filter if query exists
			if (query) {
				// Search by name (case-insensitive) or ID
				// Check if query is a number (potential ID)
				const potentialId = parseInt(query, 10);
				if (!isNaN(potentialId)) {
					supabaseQuery = supabaseQuery.or(
						`full_name.ilike.%${query}%,id.eq.${potentialId}`
					);
				} else {
					supabaseQuery = supabaseQuery.ilike("full_name", `%${query}%`);
				}
			}

			const { data, error: fetchError } = await supabaseQuery;

			if (fetchError) {
				throw fetchError;
			}
			setPatients(data || []);
		} catch (err) {
			console.error("Error fetching patients:", err.message);
			setError("Failed to fetch patients. Please try again.");
		} finally {
			setLoading(false);
		}
	}, []); // Empty dependency array is fine here as it doesn't depend on props or state

	// Debounced fetch function
	const debouncedFetchPatients = useCallback(
		debounce((query) => {
			fetchPatients(query);
		}, 500), // 500ms delay
		[] // Empty dependency array is correct here as debounce and fetchPatients are stable
	);

	useEffect(() => {
		// Initial fetch without query
		fetchPatients();
	}, [fetchPatients]); // Add fetchPatients as dependency

	useEffect(() => {
		// Fetch patients when searchQuery changes (debounced)
		setLoading(true); // Show loading indicator immediately on search change
		debouncedFetchPatients(searchQuery);
		// Cleanup function to cancel debounce on unmount or if query changes quickly
		return () => {
			debouncedFetchPatients.cancel();
		};
	}, [searchQuery, debouncedFetchPatients]);

	// --- Search Handler ---
	const handleSearchChange = (event) => {
		setSearchQuery(event.target.value);
	};

	// --- Add Dialog Handlers ---

	const handleClickOpen = () => {
		setSubmitError(null); // Clear previous submission errors when opening
		setNewPatientData({
			// Reset form
			full_name: "",
			age: "",
			gender: "",
			phone: "",
			address: "",
			emergency_contact: "",
		});
		setOpenAddDialog(true);
	};

	const handleClose = () => {
		setOpenAddDialog(false);
		setSubmitError(null); // Clear submission error on close
		// Reset form data when closing
		setNewPatientData({
			full_name: "",
			age: "",
			gender: "",
			phone: "",
			address: "",
			emergency_contact: "",
		});
	};

	const handleAddInputChange = (e) => {
		const { name, value } = e.target;
		// Convert age to number if the input is for age
		const processedValue =
			name === "age" ? (value === "" ? "" : parseInt(value, 10)) : value;
		setNewPatientData({ ...newPatientData, [name]: processedValue });
	};

	const handleAddSubmit = async (e) => {
		e.preventDefault();
		setSubmitLoading(true);
		setSubmitError(null);

		// Basic validation (optional, enhance as needed)
		if (!newPatientData.full_name || newPatientData.age === "") {
			// Check if age is empty string
			setSubmitError("Full Name and Age are required.");
			setSubmitLoading(false);
			return;
		}

		try {
			// Ensure age is a number or null if empty
			const patientDataToInsert = {
				...newPatientData,
				age: newPatientData.age === "" ? null : newPatientData.age,
			};

			const { data, error: insertError } = await supabase
				.from("patients")
				.insert([patientDataToInsert]) // Insert data
				.select(); // Optionally select the inserted data back

			if (insertError) {
				throw insertError;
			}

			console.log("Patient added:", data);
			fetchPatients(searchQuery); // Refresh the patient list with current search query
			handleClose(); // Close the dialog on success
		} catch (err) {
			console.error("Error adding patient:", err.message);
			setSubmitError(`Failed to add patient: ${err.message}`);
		} finally {
			setSubmitLoading(false);
		}
	};

	// --- Edit Dialog Handlers ---
	const handleEditClick = (patient) => {
		setEditError(null); // Clear previous edit errors
		setEditingPatient({ ...patient }); // Set the patient data to edit (create a copy)
		setOpenEditDialog(true);
	};

	const handleEditClose = () => {
		setOpenEditDialog(false);
		setEditingPatient(null); // Clear editing patient data
		setEditError(null);
	};

	const handleEditInputChange = (e) => {
		const { name, value } = e.target;
		const processedValue =
			name === "age" ? (value === "" ? "" : parseInt(value, 10)) : value;
		setEditingPatient({ ...editingPatient, [name]: processedValue });
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

		// Basic validation
		if (!editingPatient.full_name || editingPatient.age === "") {
			setEditError("Full Name and Age are required.");
			setEditLoading(false);
			return;
		}

		try {
			// Prepare data for update (remove id and created_at)
			const { id, created_at, ...updateData } = editingPatient;
			const patientDataToUpdate = {
				...updateData,
				age: updateData.age === "" ? null : updateData.age,
			};

			const { error: updateError } = await supabase
				.from("patients")
				.update(patientDataToUpdate)
				.eq("id", id); // Match the patient ID

			if (updateError) {
				throw updateError;
			}

			console.log("Patient updated:", id);
			fetchPatients(searchQuery); // Refresh the patient list with current search query
			handleEditClose(); // Close the dialog on success
		} catch (err) {
			console.error("Error updating patient:", err.message);
			setEditError(`Failed to update patient: ${err.message}`);
		} finally {
			setEditLoading(false);
		}
	};
	// --- End Edit Dialog Handlers ---

	// --- View Dialog Handlers ---
	const handleViewClick = (patient) => {
		setViewingPatient(patient);
		setOpenViewDialog(true);
	};

	const handleViewClose = () => {
		setOpenViewDialog(false);
		setViewingPatient(null);
	};
	// --- End View Dialog Handlers ---

	// --- Delete Dialog Handlers ---
	const handleDeleteClick = (patientId) => {
		setDeleteError(null); // Clear previous delete errors
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

			if (deleteError) {
				throw deleteError;
			}

			console.log("Patient deleted:", deletingPatientId);
			fetchPatients(searchQuery); // Refresh the list
			handleDeleteClose(); // Close the confirmation dialog
		} catch (err) {
			console.error("Error deleting patient:", err.message);
			setDeleteError(`Failed to delete patient: ${err.message}`);
		} finally {
			setDeleteLoading(false);
		}
	};
	// --- End Delete Dialog Handlers ---

	// Placeholder function for adding a patient - Now opens the dialog
	const handleAddPatient = () => {
		console.log("Add Patient button clicked - opening dialog");
		handleClickOpen(); // Open the dialog
	};

	return (
		<Box>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
					flexWrap: "wrap", // Allow wrapping on smaller screens
					gap: 2, // Add gap between items
				}}>
				<Typography variant="h4" component="h1">
					Patient Management
				</Typography>
				{/* Search Input */}
				<TextField
					variant="outlined"
					size="small"
					placeholder="Search by Name or ID..."
					value={searchQuery}
					onChange={handleSearchChange}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon />
							</InputAdornment>
						),
					}}
					sx={{ minWidth: "250px", flexGrow: { xs: 1, sm: 0 } }} // Allow grow on extra small screens
				/>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={handleAddPatient}>
					Add Patient
				</Button>
			</Box>

			{loading &&
				!searchQuery && ( // Show main loading only on initial load
					<Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
						<CircularProgress />
					</Box>
				)}
			{error && (
				<Alert severity="error" sx={{ my: 2 }}>
					{error}
				</Alert>
			)}
			{/* Table is always rendered, but body content changes based on loading/data */}
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} aria-label="simple patients table">
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Full Name</TableCell>
							<TableCell>Age</TableCell>
							<TableCell>Gender</TableCell>
							<TableCell>Phone</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? ( // Show loading indicator inside table body during search fetch or initial load
							<TableRow>
								<TableCell colSpan={6} align="center">
									<CircularProgress size={30} />
								</TableCell>
							</TableRow>
						) : patients.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} align="center">
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
									<TableCell component="th" scope="row">
										{patient.id}
									</TableCell>
									<TableCell>{patient.full_name || "N/A"}</TableCell>
									<TableCell>{patient.age ?? "N/A"}</TableCell>{" "}
									{/* Use nullish coalescing */}
									<TableCell>{patient.gender || "N/A"}</TableCell>
									<TableCell>{patient.phone || "N/A"}</TableCell>
									<TableCell align="right">
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

			{/* --- Add Patient Dialog --- */}
			<Dialog open={openAddDialog} onClose={handleClose}>
				<DialogTitle>Add New Patient</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 2 }}>
						Please fill in the details for the new patient.
					</DialogContentText>
					{/* Display submission error inside the dialog */}
					{submitError && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{submitError}
						</Alert>
					)}
					<TextField
						autoFocus
						margin="dense"
						id="full_name"
						name="full_name" // Name attribute matches state key
						label="Full Name"
						type="text"
						fullWidth
						variant="standard"
						value={newPatientData.full_name}
						onChange={handleAddInputChange}
						required // Mark name as required
					/>
					<TextField
						margin="dense"
						id="age"
						name="age"
						label="Age"
						type="number" // Use number type for age
						fullWidth
						variant="standard"
						value={newPatientData.age}
						onChange={handleAddInputChange}
						required // Mark age as required
					/>
					<TextField // Added Gender field
						margin="dense"
						id="gender"
						name="gender"
						label="Gender"
						type="text"
						fullWidth
						variant="standard"
						value={newPatientData.gender}
						onChange={handleAddInputChange}
					/>
					<TextField
						margin="dense"
						id="phone"
						name="phone"
						label="Phone Number"
						type="tel" // Use tel type for phone
						fullWidth
						variant="standard"
						value={newPatientData.phone}
						onChange={handleAddInputChange}
					/>
					<TextField
						margin="dense"
						id="address"
						name="address"
						label="Address"
						type="text"
						fullWidth
						multiline // Allow multiple lines for address
						rows={2}
						variant="standard"
						value={newPatientData.address}
						onChange={handleAddInputChange}
					/>
					<TextField
						margin="dense"
						id="emergency_contact"
						name="emergency_contact"
						label="Emergency Contact (Name & Phone)"
						type="text"
						fullWidth
						variant="standard"
						value={newPatientData.emergency_contact}
						onChange={handleAddInputChange}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} disabled={submitLoading}>
						Cancel
					</Button>
					<Button onClick={handleAddSubmit} disabled={submitLoading}>
						{submitLoading ? <CircularProgress size={24} /> : "Add Patient"}
					</Button>
				</DialogActions>
			</Dialog>
			{/* --- End Add Patient Dialog --- */}

			{/* --- Edit Patient Dialog --- */}
			<Dialog open={openEditDialog} onClose={handleEditClose}>
				<DialogTitle>Edit Patient Details</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 2 }}>
						Update the patient's information below.
					</DialogContentText>
					{/* Display edit error inside the dialog */}
					{editError && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{editError}
						</Alert>
					)}
					{editingPatient && (
						<>
							<TextField
								autoFocus
								margin="dense"
								id="edit_full_name"
								name="full_name"
								label="Full Name"
								type="text"
								fullWidth
								variant="standard"
								value={editingPatient.full_name || ""} // Handle potential null/undefined
								onChange={handleEditInputChange}
								required
							/>
							<TextField
								margin="dense"
								id="edit_age"
								name="age"
								label="Age"
								type="number"
								fullWidth
								variant="standard"
								value={editingPatient.age ?? ""} // Handle potential null/undefined
								onChange={handleEditInputChange}
								required
							/>
							<TextField
								margin="dense"
								id="edit_gender"
								name="gender"
								label="Gender"
								type="text"
								fullWidth
								variant="standard"
								value={editingPatient.gender || ""}
								onChange={handleEditInputChange}
							/>
							<TextField
								margin="dense"
								id="edit_phone"
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
								id="edit_address"
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
								id="edit_emergency_contact"
								name="emergency_contact"
								label="Emergency Contact (Name & Phone)"
								type="text"
								fullWidth
								variant="standard"
								value={editingPatient.emergency_contact || ""}
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
			{/* --- End Edit Patient Dialog --- */}

			{/* --- View Patient Dialog --- */}
			<Dialog
				open={openViewDialog}
				onClose={handleViewClose}
				maxWidth="sm"
				fullWidth>
				<DialogTitle>Patient Details</DialogTitle>
				<DialogContent dividers>
					{" "}
					{/* Add dividers for better separation */}
					{viewingPatient ? (
						<Box>
							<Typography variant="subtitle1" gutterBottom>
								<strong>ID:</strong> {viewingPatient.id}
							</Typography>
							<Typography variant="subtitle1" gutterBottom>
								<strong>Full Name:</strong> {viewingPatient.full_name || "N/A"}
							</Typography>
							<Typography variant="subtitle1" gutterBottom>
								<strong>Age:</strong> {viewingPatient.age ?? "N/A"}
							</Typography>
							<Typography variant="subtitle1" gutterBottom>
								<strong>Gender:</strong> {viewingPatient.gender || "N/A"}
							</Typography>
							<Typography variant="subtitle1" gutterBottom>
								<strong>Phone:</strong> {viewingPatient.phone || "N/A"}
							</Typography>
							<Typography variant="subtitle1" gutterBottom>
								<strong>Address:</strong> {viewingPatient.address || "N/A"}
							</Typography>
							<Typography variant="subtitle1" gutterBottom>
								<strong>Emergency Contact:</strong>{" "}
								{viewingPatient.emergency_contact || "N/A"}
							</Typography>
							<Typography variant="subtitle1" gutterBottom>
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
			{/* --- End View Patient Dialog --- */}

			{/* --- Delete Confirmation Dialog --- */}
			<Dialog
				open={openDeleteConfirm}
				onClose={handleDeleteClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description">
				<DialogTitle id="alert-dialog-title">Confirm Deletion</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						Are you sure you want to delete this patient record? This action
						cannot be undone.
					</DialogContentText>
					{/* Display delete error inside the dialog */}
					{deleteError && (
						<Alert severity="error" sx={{ mt: 2 }}>
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
			{/* --- End Delete Confirmation Dialog --- */}
		</Box>
	);
}

export default PatientsPage;
