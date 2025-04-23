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
	Autocomplete, // For patient selection
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import debounce from "lodash.debounce";

// Assume a structure for the pathology_reports table:
// id, created_at, patient_id (fk to patients.id), report_date (date), test_name (text), results (text), notes (text)
// Assume a structure for the patients table:
// id, full_name

function PathologyPage() {
	const [reports, setReports] = useState([]);
	const [patients, setPatients] = useState([]); // To populate patient dropdown
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");

	// Add Dialog State
	const [openAddDialog, setOpenAddDialog] = useState(false);
	const [newReportData, setNewReportData] = useState({
		patient_id: null,
		report_date: new Date().toISOString().split("T")[0], // Default to today
		test_name: "",
		results: "",
		notes: "",
	});
	const [selectedPatientAdd, setSelectedPatientAdd] = useState(null);
	const [submitLoading, setSubmitLoading] = useState(false);
	const [submitError, setSubmitError] = useState(null);

	// Edit Dialog State
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [editingReport, setEditingReport] = useState(null);
	const [selectedPatientEdit, setSelectedPatientEdit] = useState(null);
	const [editLoading, setEditLoading] = useState(false);
	const [editError, setEditError] = useState(null);

	// View Dialog State
	const [openViewDialog, setOpenViewDialog] = useState(false);
	const [viewingReport, setViewingReport] = useState(null);

	// Delete Dialog State
	const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
	const [deletingReportId, setDeletingReportId] = useState(null);
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
		}
	}, []);

	// Fetch Pathology Reports Function
	const fetchReports = useCallback(async (query = "") => {
		setError(null);
		try {
			let supabaseQuery = supabase
				.from("pathology_reports")
				.select(
					`
                    id,
                    patient_id,
                    report_date,
                    test_name,
                    results,
                    notes,
                    created_at,
                    patients ( full_name )
                `
				)
				.order("report_date", { ascending: false });

			if (query) {
				// Search by test name or results. Patient name search requires adjustment.
				supabaseQuery = supabaseQuery.or(
					`test_name.ilike.%${query}%,results.ilike.%${query}%`
				);
			}

			const { data, error: fetchError } = await supabaseQuery;

			if (fetchError) {
				if (fetchError.code === "42P01") {
					console.warn(
						"Supabase fetch error: 'pathology_reports' or 'patients' table not found. Ensure relationships are set."
					);
					setError(
						"Pathology data is currently unavailable. Setup might be incomplete."
					);
					setReports([]);
				} else {
					throw fetchError;
				}
			} else {
				const processedData = data.map((report) => ({
					...report,
					patient_name: report.patients?.full_name || "N/A",
				}));
				setReports(processedData || []);
			}
		} catch (err) {
			console.error("Error fetching pathology reports:", err.message);
			setError("Failed to fetch reports. Please try again.");
		} finally {
			setLoading(false);
		}
	}, []);

	// Debounced Fetch
	const debouncedFetchReports = useMemo(
		() => debounce((query) => fetchReports(query), 500),
		[fetchReports]
	);

	// Initial Fetch
	useEffect(() => {
		setLoading(true);
		fetchPatientsForDropdown();
		fetchReports();
	}, [fetchReports, fetchPatientsForDropdown]);

	// Search Trigger
	useEffect(() => {
		setLoading(true);
		debouncedFetchReports(searchQuery);
		return () => {
			debouncedFetchReports.cancel();
		};
	}, [searchQuery, debouncedFetchReports]);

	// --- Search Handler ---
	const handleSearchChange = (event) => {
		setSearchQuery(event.target.value);
	};

	// --- Add Dialog Handlers ---
	const handleAddClickOpen = () => {
		setSubmitError(null);
		setSelectedPatientAdd(null);
		setNewReportData({
			patient_id: null,
			report_date: new Date().toISOString().split("T")[0],
			test_name: "",
			results: "",
			notes: "",
		});
		setOpenAddDialog(true);
	};

	const handleAddClose = () => {
		setOpenAddDialog(false);
		setSubmitError(null);
	};

	const handleAddInputChange = (e) => {
		const { name, value } = e.target;
		setNewReportData({ ...newReportData, [name]: value });
	};

	const handleAddPatientChange = (event, newValue) => {
		setSelectedPatientAdd(newValue);
		setNewReportData({
			...newReportData,
			patient_id: newValue ? newValue.id : null,
		});
	};

	const handleAddSubmit = async (e) => {
		e.preventDefault();
		setSubmitLoading(true);
		setSubmitError(null);

		if (
			!newReportData.patient_id ||
			!newReportData.report_date ||
			!newReportData.test_name ||
			!newReportData.results
		) {
			// Added missing closing parenthesis
			setSubmitError(
				"Patient, Report Date, Test Name, and Results are required."
			);
			setSubmitLoading(false);
			return;
		}

		try {
			const { data, error: insertError } = await supabase
				.from("pathology_reports")
				.insert([newReportData])
				.select();

			if (insertError) throw insertError;

			console.log("Report added:", data);
			fetchReports(searchQuery); // Refresh list
			handleAddClose();
		} catch (err) {
			console.error("Error adding report:", err.message);
			setSubmitError(`Failed to add report: ${err.message}`);
		} finally {
			setSubmitLoading(false);
		}
	};

	// --- Edit Dialog Handlers ---
	const handleEditClick = (report) => {
		setEditError(null);
		const formattedDate = report.report_date
			? report.report_date.split("T")[0]
			: "";
		const patient = patients.find((p) => p.id === report.patient_id) || null;
		setSelectedPatientEdit(patient);
		setEditingReport({ ...report, report_date: formattedDate });
		setOpenEditDialog(true);
	};

	const handleEditClose = () => {
		setOpenEditDialog(false);
		setEditingReport(null);
		setSelectedPatientEdit(null);
		setEditError(null);
	};

	const handleEditInputChange = (e) => {
		const { name, value } = e.target;
		setEditingReport({ ...editingReport, [name]: value });
	};

	const handleEditPatientChange = (event, newValue) => {
		setSelectedPatientEdit(newValue);
		setEditingReport({
			...editingReport,
			patient_id: newValue ? newValue.id : null,
		});
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();
		setEditLoading(true);
		setEditError(null);

		if (!editingReport || !editingReport.id) {
			setEditError("Cannot update report: ID is missing.");
			setEditLoading(false);
			return;
		}
		if (
			!editingReport.patient_id ||
			!editingReport.report_date ||
			!editingReport.test_name ||
			!editingReport.results
		) {
			// Added missing closing parenthesis
			setEditError(
				"Patient, Report Date, Test Name, and Results are required."
			);
			setEditLoading(false);
			return;
		}

		try {
			const { id, created_at, patient_name, patients, ...updateData } =
				editingReport;

			const { error: updateError } = await supabase
				.from("pathology_reports")
				.update(updateData)
				.eq("id", id);

			if (updateError) throw updateError;

			console.log("Report updated:", id);
			fetchReports(searchQuery); // Refresh list
			handleEditClose();
		} catch (err) {
			console.error("Error updating report:", err.message);
			setEditError(`Failed to update report: ${err.message}`);
		} finally {
			setEditLoading(false);
		}
	};

	// --- View Dialog Handlers ---
	const handleViewClick = (report) => {
		const patientName =
			report.patient_name ||
			patients.find((p) => p.id === report.patient_id)?.full_name ||
			"N/A";
		setViewingReport({ ...report, patient_name: patientName });
		setOpenViewDialog(true);
	};

	const handleViewClose = () => {
		setOpenViewDialog(false);
		setViewingReport(null);
	};

	// --- Delete Dialog Handlers ---
	const handleDeleteClick = (reportId) => {
		setDeleteError(null);
		setDeletingReportId(reportId);
		setOpenDeleteConfirm(true);
	};

	const handleDeleteClose = () => {
		setOpenDeleteConfirm(false);
		setDeletingReportId(null);
		setDeleteError(null);
	};

	const handleDeleteConfirm = async () => {
		setDeleteLoading(true);
		setDeleteError(null);

		if (!deletingReportId) {
			setDeleteError("Cannot delete report: ID is missing.");
			setDeleteLoading(false);
			return;
		}

		try {
			const { error: deleteError } = await supabase
				.from("pathology_reports")
				.delete()
				.eq("id", deletingReportId);

			if (deleteError) throw deleteError;

			console.log("Report deleted:", deletingReportId);
			fetchReports(searchQuery); // Refresh list
			handleDeleteClose();
		} catch (err) {
			console.error("Error deleting report:", err.message);
			setDeleteError(`Failed to delete report: ${err.message}`);
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
					Pathology Reports
				</Typography>
				<TextField
					variant="outlined"
					size="small"
					placeholder="Search Test Name, Results..."
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
					Add Report
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

			{/* Reports Table */}
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} aria-label="pathology reports table">
					<TableHead>
						<TableRow>
							<TableCell>Report ID</TableCell>
							<TableCell>Patient Name</TableCell>
							<TableCell>Test Name</TableCell>
							<TableCell>Report Date</TableCell>
							<TableCell>Results</TableCell>
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
						) : reports.length === 0 && !error ? (
							<TableRow>
								<TableCell colSpan={6} align="center">
									{searchQuery
										? `No reports found matching "${searchQuery}".`
										: "No reports found. Click 'Add Report' to begin."}
								</TableCell>
							</TableRow>
						) : (
							reports.map((report) => (
								<TableRow
									key={report.id}
									sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
									<TableCell>{report.id}</TableCell>
									<TableCell>{report.patient_name || "N/A"}</TableCell>
									<TableCell>{report.test_name || "N/A"}</TableCell>
									<TableCell>
										{report.report_date
											? new Date(report.report_date).toLocaleDateString()
											: "N/A"}
									</TableCell>
									<TableCell>{report.results || "N/A"}</TableCell>{" "}
									{/* Keep results concise */}
									<TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
										<IconButton
											size="small"
											sx={{ mr: 0.5 }}
											onClick={() => handleViewClick(report)}
											title="View Details">
											<VisibilityIcon />
										</IconButton>
										<IconButton
											size="small"
											sx={{ mr: 0.5 }}
											onClick={() => handleEditClick(report)}
											title="Edit Report">
											<EditIcon />
										</IconButton>
										<IconButton
											size="small"
											color="error"
											onClick={() => handleDeleteClick(report.id)}
											title="Delete Report">
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Add Report Dialog */}
			<Dialog
				open={openAddDialog}
				onClose={handleAddClose}
				maxWidth="sm"
				fullWidth>
				<DialogTitle>Add New Pathology Report</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ my: 2 }}>
						Fill in the details for the new report.
					</DialogContentText>{" "}
					{submitError && (
						<Alert severity="error" sx={{ my: 2 }}>
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
						name="test_name"
						label="Test Name"
						type="text"
						fullWidth
						variant="standard"
						value={newReportData.test_name}
						onChange={handleAddInputChange}
						required
					/>
					<TextField
						margin="dense"
						name="report_date"
						label="Report Date"
						type="date"
						fullWidth
						variant="standard"
						value={newReportData.report_date}
						onChange={handleAddInputChange}
						required
						InputLabelProps={{ shrink: true }}
					/>
					<TextField
						margin="dense"
						name="results"
						label="Results"
						type="text"
						fullWidth
						multiline
						rows={4}
						variant="standard"
						value={newReportData.results}
						onChange={handleAddInputChange}
						required
					/>
					<TextField
						margin="dense"
						name="notes"
						label="Notes (Optional)"
						type="text"
						fullWidth
						multiline
						rows={2}
						variant="standard"
						value={newReportData.notes}
						onChange={handleAddInputChange}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleAddClose} disabled={submitLoading}>
						Cancel
					</Button>
					<Button onClick={handleAddSubmit} disabled={submitLoading}>
						{submitLoading ? <CircularProgress size={24} /> : "Add Report"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Report Dialog */}
			<Dialog
				open={openEditDialog}
				onClose={handleEditClose}
				maxWidth="sm"
				fullWidth>
				<DialogTitle>Edit Pathology Report</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ my: 2 }}>
						Update the report information.
					</DialogContentText>{" "}
					{editError && (
						<Alert severity="error" sx={{ my: 2 }}>
							{editError}
						</Alert>
					)}
					{editingReport && (
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
								name="test_name"
								label="Test Name"
								type="text"
								fullWidth
								variant="standard"
								value={editingReport.test_name || ""}
								onChange={handleEditInputChange}
								required
							/>
							<TextField
								margin="dense"
								name="report_date"
								label="Report Date"
								type="date"
								fullWidth
								variant="standard"
								value={editingReport.report_date || ""}
								onChange={handleEditInputChange}
								required
								InputLabelProps={{ shrink: true }}
							/>
							<TextField
								margin="dense"
								name="results"
								label="Results"
								type="text"
								fullWidth
								multiline
								rows={4}
								variant="standard"
								value={editingReport.results || ""}
								onChange={handleEditInputChange}
								required
							/>
							<TextField
								margin="dense"
								name="notes"
								label="Notes"
								type="text"
								fullWidth
								multiline
								rows={2}
								variant="standard"
								value={editingReport.notes || ""}
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

			{/* View Report Dialog */}
			<Dialog
				open={openViewDialog}
				onClose={handleViewClose}
				maxWidth="sm"
				fullWidth>
				<DialogTitle>Pathology Report Details</DialogTitle>
				<DialogContent dividers>
					{viewingReport ? (
						<Box>
							<Typography gutterBottom>
								<strong>Report ID:</strong> {viewingReport.id}
							</Typography>
							<Typography gutterBottom>
								<strong>Patient:</strong> {viewingReport.patient_name} (ID:{" "}
								{viewingReport.patient_id})
							</Typography>
							<Typography gutterBottom>
								<strong>Test Name:</strong> {viewingReport.test_name || "N/A"}
							</Typography>
							<Typography gutterBottom>
								<strong>Report Date:</strong>{" "}
								{viewingReport.report_date
									? new Date(viewingReport.report_date).toLocaleDateString()
									: "N/A"}
							</Typography>
							<Typography gutterBottom component="div">
								<strong>Results:</strong>
								<Typography
									variant="body2"
									component="pre"
									sx={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
									{viewingReport.results || "N/A"}
								</Typography>
							</Typography>
							<Typography gutterBottom component="div">
								<strong>Notes:</strong>
								<Typography
									variant="body2"
									component="pre"
									sx={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
									{viewingReport.notes || "N/A"}
								</Typography>
							</Typography>
							<Typography gutterBottom>
								<strong>Created On:</strong>{" "}
								{viewingReport.created_at
									? new Date(viewingReport.created_at).toLocaleString()
									: "N/A"}
							</Typography>
						</Box>
					) : (
						<Typography>No report data available.</Typography>
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
						Are you sure you want to delete this pathology report? This action
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

export default PathologyPage;
