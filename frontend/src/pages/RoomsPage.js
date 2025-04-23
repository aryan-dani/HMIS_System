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

// Assume a structure for the rooms table:
// id, created_at, room_number, type (e.g., 'General', 'ICU', 'Private'), status (e.g., 'Available', 'Occupied', 'Maintenance')

const ROOM_STATUSES = ["Available", "Occupied", "Maintenance", "Cleaning"];
const ROOM_TYPES = [
	"General Ward",
	"Semi-Private",
	"Private",
	"ICU",
	"Operation Theater",
];

function RoomsPage() {
	const [rooms, setRooms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");

	// Add Dialog State
	const [openAddDialog, setOpenAddDialog] = useState(false);
	const [newRoomData, setNewRoomData] = useState({
		room_number: "",
		type: ROOM_TYPES[0], // Default type
		status: ROOM_STATUSES[0], // Default status
	});
	const [submitLoading, setSubmitLoading] = useState(false);
	const [submitError, setSubmitError] = useState(null);

	// Edit Dialog State
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [editingRoom, setEditingRoom] = useState(null);
	const [editLoading, setEditLoading] = useState(false);
	const [editError, setEditError] = useState(null);

	// View Dialog State
	const [openViewDialog, setOpenViewDialog] = useState(false);
	const [viewingRoom, setViewingRoom] = useState(null);

	// Delete Dialog State
	const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
	const [deletingRoomId, setDeletingRoomId] = useState(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteError, setDeleteError] = useState(null);

	// Fetch Rooms Function
	const fetchRooms = useCallback(async (query = "") => {
		setError(null);
		try {
			let supabaseQuery = supabase
				.from("rooms") // Assuming 'rooms' table
				.select("id, room_number, type, status, created_at")
				.order("room_number", { ascending: true }); // Order by room number

			if (query) {
				// Search by room number (case-insensitive) or type or status
				supabaseQuery = supabaseQuery.or(
					`room_number.ilike.%${query}%,type.ilike.%${query}%,status.ilike.%${query}%`
				);
			}

			const { data, error: fetchError } = await supabaseQuery;

			if (fetchError) {
				if (fetchError.code === "42P01") {
					console.warn(
						"Supabase fetch error: 'rooms' table not found. Please ensure it exists."
					);
					setError(
						"Room data is currently unavailable. Setup might be incomplete."
					);
					setRooms([]);
				} else {
					throw fetchError;
				}
			} else {
				setRooms(data || []);
			}
		} catch (err) {
			console.error("Error fetching rooms:", err.message);
			setError("Failed to fetch rooms. Please try again.");
		} finally {
			setLoading(false);
		}
	}, []);

	// Debounced Fetch
	const debouncedFetchRooms = useMemo(
		() => debounce((query) => fetchRooms(query), 500),
		[fetchRooms]
	);

	// Initial Fetch and Search Trigger
	useEffect(() => {
		fetchRooms();
	}, [fetchRooms]);

	useEffect(() => {
		setLoading(true);
		debouncedFetchRooms(searchQuery);
		return () => {
			debouncedFetchRooms.cancel();
		};
	}, [searchQuery, debouncedFetchRooms]);

	// --- Search Handler ---
	const handleSearchChange = (event) => {
		setSearchQuery(event.target.value);
	};

	// --- Add Dialog Handlers ---
	const handleAddClickOpen = () => {
		setSubmitError(null);
		setNewRoomData({
			room_number: "",
			type: ROOM_TYPES[0],
			status: ROOM_STATUSES[0],
		});
		setOpenAddDialog(true);
	};

	const handleAddClose = () => {
		setOpenAddDialog(false);
		setSubmitError(null);
	};

	const handleAddInputChange = (e) => {
		const { name, value } = e.target;
		setNewRoomData({ ...newRoomData, [name]: value });
	};

	const handleAddSubmit = async (e) => {
		e.preventDefault();
		setSubmitLoading(true);
		setSubmitError(null);

		if (!newRoomData.room_number || !newRoomData.type || !newRoomData.status) {
			setSubmitError("Room Number, Type, and Status are required.");
			setSubmitLoading(false);
			return;
		}

		try {
			const { data, error: insertError } = await supabase
				.from("rooms")
				.insert([newRoomData])
				.select();

			if (insertError) throw insertError;

			console.log("Room added:", data);
			fetchRooms(searchQuery); // Refresh list
			handleAddClose();
		} catch (err) {
			console.error("Error adding room:", err.message);
			setSubmitError(`Failed to add room: ${err.message}`);
		} finally {
			setSubmitLoading(false);
		}
	};

	// --- Edit Dialog Handlers ---
	const handleEditClick = (room) => {
		setEditError(null);
		setEditingRoom({ ...room });
		setOpenEditDialog(true);
	};

	const handleEditClose = () => {
		setOpenEditDialog(false);
		setEditingRoom(null);
		setEditError(null);
	};

	const handleEditInputChange = (e) => {
		const { name, value } = e.target;
		setEditingRoom({ ...editingRoom, [name]: value });
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();
		setEditLoading(true);
		setEditError(null);

		if (!editingRoom || !editingRoom.id) {
			setEditError("Cannot update room: ID is missing.");
			setEditLoading(false);
			return;
		}
		if (!editingRoom.room_number || !editingRoom.type || !editingRoom.status) {
			setEditError("Room Number, Type, and Status are required.");
			setEditLoading(false);
			return;
		}

		try {
			const { id, created_at, ...updateData } = editingRoom;
			const { error: updateError } = await supabase
				.from("rooms")
				.update(updateData)
				.eq("id", id);

			if (updateError) throw updateError;

			console.log("Room updated:", id);
			fetchRooms(searchQuery); // Refresh list
			handleEditClose();
		} catch (err) {
			console.error("Error updating room:", err.message);
			setEditError(`Failed to update room: ${err.message}`);
		} finally {
			setEditLoading(false);
		}
	};

	// --- View Dialog Handlers ---
	const handleViewClick = (room) => {
		setViewingRoom(room);
		setOpenViewDialog(true);
	};

	const handleViewClose = () => {
		setOpenViewDialog(false);
		setViewingRoom(null);
	};

	// --- Delete Dialog Handlers ---
	const handleDeleteClick = (roomId) => {
		setDeleteError(null);
		setDeletingRoomId(roomId);
		setOpenDeleteConfirm(true);
	};

	const handleDeleteClose = () => {
		setOpenDeleteConfirm(false);
		setDeletingRoomId(null);
		setDeleteError(null);
	};

	const handleDeleteConfirm = async () => {
		setDeleteLoading(true);
		setDeleteError(null);

		if (!deletingRoomId) {
			setDeleteError("Cannot delete room: ID is missing.");
			setDeleteLoading(false);
			return;
		}

		try {
			const { error: deleteError } = await supabase
				.from("rooms")
				.delete()
				.eq("id", deletingRoomId);

			if (deleteError) throw deleteError;

			console.log("Room deleted:", deletingRoomId);
			fetchRooms(searchQuery); // Refresh list
			handleDeleteClose();
		} catch (err) {
			console.error("Error deleting room:", err.message);
			setDeleteError(`Failed to delete room: ${err.message}`);
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
					Room Management
				</Typography>
				<TextField
					variant="outlined"
					size="small"
					placeholder="Search by Number, Type, Status..."
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
					Add Room
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

			{/* Rooms Table */}
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} aria-label="rooms table">
					<TableHead>
						<TableRow>
							<TableCell>Room Number</TableCell>
							<TableCell>Type</TableCell>
							<TableCell>Status</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={4} align="center">
									<CircularProgress size={30} />
								</TableCell>
							</TableRow>
						) : rooms.length === 0 && !error ? (
							<TableRow>
								<TableCell colSpan={4} align="center">
									{searchQuery
										? `No rooms found matching "${searchQuery}".`
										: "No rooms found. Click 'Add Room' to begin."}
								</TableCell>
							</TableRow>
						) : (
							rooms.map((room) => (
								<TableRow
									key={room.id}
									sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
									<TableCell>{room.room_number || "N/A"}</TableCell>
									<TableCell>{room.type || "N/A"}</TableCell>
									<TableCell>{room.status || "N/A"}</TableCell>
									<TableCell align="right">
										<IconButton
											size="small"
											sx={{ mr: 0.5 }}
											onClick={() => handleViewClick(room)}
											title="View Details">
											<VisibilityIcon />
										</IconButton>
										<IconButton
											size="small"
											sx={{ mr: 0.5 }}
											onClick={() => handleEditClick(room)}
											title="Edit Room">
											<EditIcon />
										</IconButton>
										<IconButton
											size="small"
											color="error"
											onClick={() => handleDeleteClick(room.id)}
											title="Delete Room">
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Add Room Dialog */}
			<Dialog
				open={openAddDialog}
				onClose={handleAddClose}
				maxWidth="sm"
				fullWidth>
				<DialogTitle>Add New Room</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ my: 2 }}>
						Fill in the details for the new room.
					</DialogContentText>{" "}
					{submitError && (
						<Alert severity="error" sx={{ my: 2 }}>
							{submitError}
						</Alert>
					)}
					<TextField
						autoFocus
						margin="dense"
						name="room_number"
						label="Room Number"
						type="text"
						fullWidth
						variant="standard"
						value={newRoomData.room_number}
						onChange={handleAddInputChange}
						required
					/>
					<FormControl fullWidth margin="dense" variant="standard" required>
						<InputLabel id="add-room-type-label">Type</InputLabel>
						<Select
							labelId="add-room-type-label"
							id="type"
							name="type"
							value={newRoomData.type}
							onChange={handleAddInputChange}
							label="Type">
							{ROOM_TYPES.map((type) => (
								<MenuItem key={type} value={type}>
									{type}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl fullWidth margin="dense" variant="standard" required>
						<InputLabel id="add-room-status-label">Status</InputLabel>
						<Select
							labelId="add-room-status-label"
							id="status"
							name="status"
							value={newRoomData.status}
							onChange={handleAddInputChange}
							label="Status">
							{ROOM_STATUSES.map((status) => (
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
						{submitLoading ? <CircularProgress size={24} /> : "Add Room"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Room Dialog */}
			<Dialog
				open={openEditDialog}
				onClose={handleEditClose}
				maxWidth="sm"
				fullWidth>
				<DialogTitle>Edit Room Details</DialogTitle>
				<DialogContent>					<DialogContentText sx={{ my: 2 }}>
						Update the room's information.
					</DialogContentText>
					{editError && (
						<Alert severity="error" sx={{ my: 2 }}>
							{editError}
						</Alert>
					)}
					{editingRoom && (
						<>
							<TextField
								autoFocus
								margin="dense"
								name="room_number"
								label="Room Number"
								type="text"
								fullWidth
								variant="standard"
								value={editingRoom.room_number || ""}
								onChange={handleEditInputChange}
								required
							/>
							<FormControl fullWidth margin="dense" variant="standard" required>
								<InputLabel id="edit-room-type-label">Type</InputLabel>
								<Select
									labelId="edit-room-type-label"
									id="edit_type"
									name="type"
									value={editingRoom.type || ""}
									onChange={handleEditInputChange}
									label="Type">
									{ROOM_TYPES.map((type) => (
										<MenuItem key={type} value={type}>
											{type}
										</MenuItem>
									))}
								</Select>
							</FormControl>
							<FormControl fullWidth margin="dense" variant="standard" required>
								<InputLabel id="edit-room-status-label">Status</InputLabel>
								<Select
									labelId="edit-room-status-label"
									id="edit_status"
									name="status"
									value={editingRoom.status || ""}
									onChange={handleEditInputChange}
									label="Status">
									{ROOM_STATUSES.map((status) => (
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

			{/* View Room Dialog */}
			<Dialog
				open={openViewDialog}
				onClose={handleViewClose}
				maxWidth="sm"
				fullWidth>
				<DialogTitle>Room Details</DialogTitle>
				<DialogContent dividers>
					{viewingRoom ? (
						<Box>
							<Typography gutterBottom>
								<strong>ID:</strong> {viewingRoom.id}
							</Typography>
							<Typography gutterBottom>
								<strong>Room Number:</strong> {viewingRoom.room_number || "N/A"}
							</Typography>
							<Typography gutterBottom>
								<strong>Type:</strong> {viewingRoom.type || "N/A"}
							</Typography>
							<Typography gutterBottom>
								<strong>Status:</strong> {viewingRoom.status || "N/A"}
							</Typography>
							<Typography gutterBottom>
								<strong>Created On:</strong>{" "}
								{viewingRoom.created_at
									? new Date(viewingRoom.created_at).toLocaleString()
									: "N/A"}
							</Typography>
							{/* Add Patient Info here if linking rooms to patients */}
							{/* <Typography gutterBottom><strong>Occupied By (Patient ID):</strong> {viewingRoom.patient_id || 'N/A'}</Typography> */}
						</Box>
					) : (
						<Typography>No room data available.</Typography>
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
						Are you sure you want to delete this room record? This action cannot
						be undone.
					</DialogContentText>					{deleteError && (
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

export default RoomsPage;
