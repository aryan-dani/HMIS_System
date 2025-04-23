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
	Autocomplete, // For patient selection
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import debounce from "lodash.debounce";

// Assume a structure for the bills table:
// id, created_at, patient_id (fk to patients.id), amount (numeric), bill_date (date), status (e.g., 'Paid', 'Unpaid'), description (text)
// Assume a structure for the patients table:
// id, full_name

const BILL_STATUSES = ["Unpaid", "Paid", "Pending", "Cancelled"];

function BillingPage() {
	const [bills, setBills] = useState([]);
	const [patients, setPatients] = useState([]); // To populate patient dropdown
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");

	// Add Dialog State
	const [openAddDialog, setOpenAddDialog] = useState(false);
	const [newBillData, setNewBillData] = useState({
		patient_id: null,
		amount: "",
		bill_date: new Date().toISOString().split("T")[0], // Default to today
		status: BILL_STATUSES[0],
		description: "",
	});
	const [selectedPatientAdd, setSelectedPatientAdd] = useState(null);
	const [submitLoading, setSubmitLoading] = useState(false);
	const [submitError, setSubmitError] = useState(null);

	// Edit Dialog State
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [editingBill, setEditingBill] = useState(null);
	const [selectedPatientEdit, setSelectedPatientEdit] = useState(null);
	const [editLoading, setEditLoading] = useState(false);
	const [editError, setEditError] = useState(null);

	// View Dialog State
	const [openViewDialog, setOpenViewDialog] = useState(false);
	const [viewingBill, setViewingBill] = useState(null);

	// Delete Dialog State
	const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
	const [deletingBillId, setDeletingBillId] = useState(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteError, setDeleteError] = useState(null);

	// Fetch Patients for Dropdown
	const fetchPatientsForDropdown = useCallback(async () => {
		try {
			const { data, error: patientError } = await supabase
				.from("patients")
				.select("id, full_name")
				.order("full_name", { ascending: true });

			if (patientError) throw patientError;
			setPatients(data || []);
		} catch (err) {
			console.error("Error fetching patients for dropdown:", err.message);
			// Non-critical error, maybe show a small warning?
		}
	}, []);

	// Fetch Bills Function
	const fetchBills = useCallback(async (query = "") => {
		setError(null);
		try {
			// Fetch bills and join with patients table to get patient name
			let supabaseQuery = supabase
				.from("bills")
				.select(
					`
                    id,
                    patient_id,
                    amount,
                    bill_date,
                    status,
                    description,
                    created_at,
                    patients!patient_id ( full_name ) // Explicitly specify the FK column
                `
				)
				.order("bill_date", { ascending: false });

			if (query) {
				// Search by patient name (requires join), description, or status
				// Note: Searching joined fields directly in .or() can be complex/limited.
				// A simpler approach might be client-side filtering after fetch or separate searches.
				// Here, we search description and status. Patient name search needs adjustment.
				// A workaround could be fetching patients matching the query first, then filtering bills by those patient IDs.
				// For simplicity, let's search description and status for now.
				supabaseQuery = supabaseQuery.or(
					`description.ilike.%${query}%,status.ilike.%${query}%`
					// Add patient name search later if needed, possibly with a separate patient fetch
				);
			}

			const { data, error: fetchError } = await supabaseQuery;

			if (fetchError) {
				if (fetchError.code === "42P01") {
					console.warn(
						"Supabase fetch error: 'bills' or 'patients' table not found. Please ensure they exist and relationships are set up."
					);
					setError(
						"Billing data is currently unavailable. Setup might be incomplete."
					);
					setBills([]);
				} else {
					throw fetchError;
				}
			} else {
				// Process data to flatten patient name
				const processedData = data.map((bill) => ({
					...bill,
					// Access the joined data correctly (it might still be nested under 'patients')
					patient_name: bill.patients?.full_name || "N/A",
				}));
				setBills(processedData || []);
			}
		} catch (err) {
			console.error("Error fetching bills:", err.message);
			// Provide a more specific error message if it's the relationship ambiguity error
			if (
				err.message.includes(
					"Could not embed because more than one relationship"
				)
			) {
				setError(
					"Failed to fetch bills due to ambiguous relationship. Please check table definitions."
				);
			} else {
				setError("Failed to fetch bills. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	}, []);

	// Debounced Fetch
	const debouncedFetchBills = useMemo(
		() => debounce((query) => fetchBills(query), 500),
		[fetchBills]
	);

	// Initial Fetch and Search Trigger
	useEffect(() => {
		setLoading(true);
		fetchPatientsForDropdown(); // Fetch patients first
		fetchBills();
	}, [fetchBills, fetchPatientsForDropdown]);

	useEffect(() => {
		setLoading(true);
		debouncedFetchBills(searchQuery);
		return () => {
			debouncedFetchBills.cancel();
		};
	}, [searchQuery, debouncedFetchBills]);

	// --- Search Handler ---
	const handleSearchChange = (event) => {
		setSearchQuery(event.target.value);
	};

	// --- Add Dialog Handlers ---
	const handleAddClickOpen = () => {
		setSubmitError(null);
		setSelectedPatientAdd(null); // Reset patient selection
		setNewBillData({
			patient_id: null,
			amount: "",
			bill_date: new Date().toISOString().split("T")[0],
			status: BILL_STATUSES[0],
			description: "",
		});
		setOpenAddDialog(true);
	};

	const handleAddClose = () => {
		setOpenAddDialog(false);
		setSubmitError(null);
	};

	const handleAddInputChange = (e) => {
		const { name, value } = e.target;
		setNewBillData({ ...newBillData, [name]: value });
	};

	const handleAddPatientChange = (event, newValue) => {
		setSelectedPatientAdd(newValue);
		setNewBillData({
			...newBillData,
			patient_id: newValue ? newValue.id : null,
		});
	};

	const handleAddSubmit = async (e) => {
		e.preventDefault();
		setSubmitLoading(true);
		setSubmitError(null);

		if (
			!newBillData.patient_id ||
			!newBillData.amount ||
			!newBillData.bill_date ||
			!newBillData.status
		) {
			setSubmitError("Patient, Amount, Bill Date, and Status are required.");
			setSubmitLoading(false);
			return;
		}

		// Validate amount is a number
		const amountValue = parseFloat(newBillData.amount);
		if (isNaN(amountValue) || amountValue < 0) {
			setSubmitError("Amount must be a valid positive number.");
			setSubmitLoading(false);
			return;
		}

		try {
			const billDataToInsert = {
				...newBillData,
				amount: amountValue, // Use the parsed number
			};

			const { data, error: insertError } = await supabase
				.from("bills")
				.insert([billDataToInsert])
				.select();

			if (insertError) throw insertError;

			console.log("Bill added:", data);
			fetchBills(searchQuery); // Refresh list
			handleAddClose();
		} catch (err) {
			console.error("Error adding bill:", err.message);
			setSubmitError(`Failed to add bill: ${err.message}`);
		} finally {
			setSubmitLoading(false);
		}
	};

	// --- Edit Dialog Handlers ---
	const handleEditClick = (bill) => {
		setEditError(null);
		const formattedDate = bill.bill_date ? bill.bill_date.split("T")[0] : "";
		// Find the patient object for Autocomplete
		const patient = patients.find((p) => p.id === bill.patient_id) || null;
		setSelectedPatientEdit(patient);
		setEditingBill({ ...bill, bill_date: formattedDate });
		setOpenEditDialog(true);
	};

	const handleEditClose = () => {
		setOpenEditDialog(false);
		setEditingBill(null);
		setSelectedPatientEdit(null);
		setEditError(null);
	};

	const handleEditInputChange = (e) => {
		const { name, value } = e.target;
		setEditingBill({ ...editingBill, [name]: value });
	};

	const handleEditPatientChange = (event, newValue) => {
		setSelectedPatientEdit(newValue);
		setEditingBill({
			...editingBill,
			patient_id: newValue ? newValue.id : null,
		});
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();
		setEditLoading(true);
		setEditError(null);

		if (!editingBill || !editingBill.id) {
			setEditError("Cannot update bill: ID is missing.");
			setEditLoading(false);
			return;
		}
		if (
			!editingBill.patient_id ||
			!editingBill.amount ||
			!editingBill.bill_date ||
			!editingBill.status
		) {
			setEditError("Patient, Amount, Bill Date, and Status are required.");
			setEditLoading(false);
			return;
		}

		// Validate amount
		const amountValue = parseFloat(editingBill.amount);
		if (isNaN(amountValue) || amountValue < 0) {
			setEditError("Amount must be a valid positive number.");
			setEditLoading(false);
			return;
		}

		try {
			// Exclude joined patient_name and potentially other non-table fields before update
			const { id, created_at, patient_name, patients, ...updateData } =
				editingBill;
			const billDataToUpdate = {
				...updateData,
				amount: amountValue, // Use parsed amount
			};

			const { error: updateError } = await supabase
				.from("bills")
				.update(billDataToUpdate)
				.eq("id", id);

			if (updateError) throw updateError;

			console.log("Bill updated:", id);
			fetchBills(searchQuery); // Refresh list
			handleEditClose();
		} catch (err) {
			console.error("Error updating bill:", err.message);
			setEditError(`Failed to update bill: ${err.message}`);
		} finally {
			setEditLoading(false);
		}
	};

	// --- View Dialog Handlers ---
	const handleViewClick = (bill) => {
		// Find patient name again if needed, or rely on the fetched name
		const patientName =
			bill.patient_name ||
			patients.find((p) => p.id === bill.patient_id)?.full_name ||
			"N/A";
		setViewingBill({ ...bill, patient_name: patientName });
		setOpenViewDialog(true);
	};

	const handleViewClose = () => {
		setOpenViewDialog(false);
		setViewingBill(null);
	};

	// --- Delete Dialog Handlers ---
	const handleDeleteClick = (billId) => {
		setDeleteError(null);
		setDeletingBillId(billId);
		setOpenDeleteConfirm(true);
	};

	const handleDeleteClose = () => {
		setOpenDeleteConfirm(false);
		setDeletingBillId(null);
		setDeleteError(null);
	};

	const handleDeleteConfirm = async () => {
		setDeleteLoading(true);
		setDeleteError(null);

		if (!deletingBillId) {
			setDeleteError("Cannot delete bill: ID is missing.");
			setDeleteLoading(false);
			return;
		}

		try {
			const { error: deleteError } = await supabase
				.from("bills")
				.delete()
				.eq("id", deletingBillId);

			if (deleteError) throw deleteError;

			console.log("Bill deleted:", deletingBillId);
			fetchBills(searchQuery); // Refresh list
			handleDeleteClose();
		} catch (err) {
			console.error("Error deleting bill:", err.message);
			setDeleteError(`Failed to delete bill: ${err.message}`);
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
					Billing Management
				</Typography>
				<TextField
					variant="outlined"
					size="small"
					placeholder="Search Description, Status..." // Update placeholder
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
					Add Bill
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

			{/* Bills Table */}
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} aria-label="billing table">
					<TableHead>
						<TableRow>
							<TableCell>Bill ID</TableCell>
							<TableCell>Patient Name</TableCell>
							<TableCell>Amount</TableCell>
							<TableCell>Bill Date</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Description</TableCell>
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
						) : bills.length === 0 && !error ? (
							<TableRow>
								<TableCell colSpan={7} align="center">
									{searchQuery
										? `No bills found matching "${searchQuery}".`
										: "No bills found. Click 'Add Bill' to begin."}
								</TableCell>
							</TableRow>
						) : (
							bills.map((bill) => (
								<TableRow
									key={bill.id}
									sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
									<TableCell>{bill.id}</TableCell>
									<TableCell>{bill.patient_name || "N/A"}</TableCell>
									<TableCell>
										{typeof bill.amount === "number"
											? bill.amount.toFixed(2) // Format currency
											: "N/A"}
									</TableCell>
									<TableCell>
										{bill.bill_date
											? new Date(bill.bill_date).toLocaleDateString()
											: "N/A"}
									</TableCell>
									<TableCell>{bill.status || "N/A"}</TableCell>
									<TableCell>{bill.description || "N/A"}</TableCell>
									<TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
										<IconButton
											size="small"
											sx={{ mr: 0.5 }}
											onClick={() => handleViewClick(bill)}
											title="View Details">
											<VisibilityIcon />
										</IconButton>
										<IconButton
											size="small"
											sx={{ mr: 0.5 }}
											onClick={() => handleEditClick(bill)}
											title="Edit Bill">
											<EditIcon />
										</IconButton>
										<IconButton
											size="small"
											color="error"
											onClick={() => handleDeleteClick(bill.id)}
											title="Delete Bill">
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Add Bill Dialog */}
			<Dialog
				open={openAddDialog}
				onClose={handleAddClose}
				maxWidth="sm"
				fullWidth>
				<DialogTitle>Add New Bill</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 2 }}>
						Fill in the details for the new bill.
					</DialogContentText>
					{submitError && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{submitError}
						</Alert>
					)}
					<Autocomplete
						options={patients}
						getOptionLabel={(option) =>
							`${option.full_name} (ID: ${option.id})`
						}
						value={selectedPatientAdd}
						onChange={handleAddPatientChange}
						isOptionEqualToValue={(option, value) => option.id === value.id}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Select Patient"
								margin="dense"
								variant="standard"
								required
							/>
						)}
					/>
					<TextField
						margin="dense"
						name="amount"
						label="Amount"
						type="number" // Use number type
						inputProps={{ step: "0.01" }} // Allow decimals
						fullWidth
						variant="standard"
						value={newBillData.amount}
						onChange={handleAddInputChange}
						required
					/>
					<TextField
						margin="dense"
						name="bill_date"
						label="Bill Date"
						type="date"
						fullWidth
						variant="standard"
						value={newBillData.bill_date}
						onChange={handleAddInputChange}
						required
						InputLabelProps={{ shrink: true }}
					/>
					<FormControl fullWidth margin="dense" variant="standard" required>
						<InputLabel id="add-bill-status-label">Status</InputLabel>
						<Select
							labelId="add-bill-status-label"
							name="status"
							value={newBillData.status}
							onChange={handleAddInputChange}
							label="Status">
							{BILL_STATUSES.map((status) => (
								<MenuItem key={status} value={status}>
									{status}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<TextField
						margin="dense"
						name="description"
						label="Description (Optional)"
						type="text"
						fullWidth
						multiline
						rows={3}
						variant="standard"
						value={newBillData.description}
						onChange={handleAddInputChange}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleAddClose} disabled={submitLoading}>
						Cancel
					</Button>
					<Button onClick={handleAddSubmit} disabled={submitLoading}>
						{submitLoading ? <CircularProgress size={24} /> : "Add Bill"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Bill Dialog */}
			<Dialog
				open={openEditDialog}
				onClose={handleEditClose}
				maxWidth="sm"
				fullWidth>
				<DialogTitle>Edit Bill Details</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 2 }}>
						Update the bill information.
					</DialogContentText>
					{editError && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{editError}
						</Alert>
					)}
					{editingBill && (
						<>
							<Autocomplete
								options={patients}
								getOptionLabel={(option) =>
									`${option.full_name} (ID: ${option.id})`
								}
								value={selectedPatientEdit}
								onChange={handleEditPatientChange}
								isOptionEqualToValue={(option, value) => option.id === value.id}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Select Patient"
										margin="dense"
										variant="standard"
										required
									/>
								)}
							/>
							<TextField
								margin="dense"
								name="amount"
								label="Amount"
								type="number"
								inputProps={{ step: "0.01" }}
								fullWidth
								variant="standard"
								value={editingBill.amount || ""}
								onChange={handleEditInputChange}
								required
							/>
							<TextField
								margin="dense"
								name="bill_date"
								label="Bill Date"
								type="date"
								fullWidth
								variant="standard"
								value={editingBill.bill_date || ""}
								onChange={handleEditInputChange}
								required
								InputLabelProps={{ shrink: true }}
							/>
							<FormControl fullWidth margin="dense" variant="standard" required>
								<InputLabel id="edit-bill-status-label">Status</InputLabel>
								<Select
									labelId="edit-bill-status-label"
									name="status"
									value={editingBill.status || ""}
									onChange={handleEditInputChange}
									label="Status">
									{BILL_STATUSES.map((status) => (
										<MenuItem key={status} value={status}>
											{status}
										</MenuItem>
									))}
								</Select>
							</FormControl>
							<TextField
								margin="dense"
								name="description"
								label="Description"
								type="text"
								fullWidth
								multiline
								rows={3}
								variant="standard"
								value={editingBill.description || ""}
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

			{/* View Bill Dialog */}
			<Dialog
				open={openViewDialog}
				onClose={handleViewClose}
				maxWidth="sm"
				fullWidth>
				<DialogTitle>Bill Details</DialogTitle>
				<DialogContent dividers>
					{viewingBill ? (
						<Box>
							<Typography gutterBottom>
								<strong>Bill ID:</strong> {viewingBill.id}
							</Typography>
							<Typography gutterBottom>
								<strong>Patient:</strong> {viewingBill.patient_name} (ID:{" "}
								{viewingBill.patient_id})
							</Typography>
							<Typography gutterBottom>
								<strong>Amount:</strong>{" "}
								{typeof viewingBill.amount === "number"
									? viewingBill.amount.toFixed(2)
									: "N/A"}
							</Typography>
							<Typography gutterBottom>
								<strong>Bill Date:</strong>{" "}
								{viewingBill.bill_date
									? new Date(viewingBill.bill_date).toLocaleDateString()
									: "N/A"}
							</Typography>
							<Typography gutterBottom>
								<strong>Status:</strong> {viewingBill.status || "N/A"}
							</Typography>
							<Typography gutterBottom component="div">
								<strong>Description:</strong>
								<Typography
									variant="body2"
									component="pre"
									sx={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
									{viewingBill.description || "N/A"}
								</Typography>
							</Typography>
							<Typography gutterBottom>
								<strong>Created On:</strong>{" "}
								{viewingBill.created_at
									? new Date(viewingBill.created_at).toLocaleString()
									: "N/A"}
							</Typography>
						</Box>
					) : (
						<Typography>No bill data available.</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleViewClose}>Close</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={openDeleteConfirm} onClose={handleDeleteClose}>
				<DialogTitle>Confirm Deletion</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete this bill record? This action cannot
						be undone.
					</DialogContentText>
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
		</Box>
	);
}

export default BillingPage;
