/** @format */

import React from "react";
import {
	Box,
	Drawer,
	AppBar,
	Toolbar,
	List,
	Typography,
	Divider,
	ListItem,
	ListItemButton,
	ListItemText,
	CssBaseline,
} from "@mui/material";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import useAuth
import Button from "@mui/material/Button";

const drawerWidth = 240;

const navItems = [
	{ text: "Dashboard", /* icon: <DashboardIcon />, */ path: "/" },
	{ text: "Patients", /* icon: <PeopleIcon />, */ path: "/patients" },
	{ text: "Doctors", /* icon: <MedicalServicesIcon />, */ path: "/doctors" },
	{ text: "Rooms", /* icon: <MeetingRoomIcon />, */ path: "/rooms" },
	{ text: "Billing", /* icon: <ReceiptIcon />, */ path: "/billing" },
	{ text: "Pathology", /* icon: <BiotechIcon />, */ path: "/pathology" },
	{ text: "Admin", /* icon: <AdminPanelSettingsIcon />, */ path: "/admin" },
];

function Layout() {
	const { signOut } = useAuth();
	const location = useLocation(); // Get current location

	const handleLogout = async () => {
		const { error } = await signOut();
		if (error) {
			console.error("Error logging out:", error.message);
		}
		// No need to navigate, AuthContext listener handles it
	};

	const drawer = (
		<div>
			<Toolbar>
				<Typography variant="h6" noWrap component="div">
					HMIS
				</Typography>
			</Toolbar>
			<Divider />
			<List>
				{navItems.map((item) => (
					<ListItem key={item.text} disablePadding>
						<ListItemButton
							component={RouterLink}
							to={item.path}
							selected={location.pathname === item.path} // Highlight selected item
						>
							{/* <ListItemIcon>
                {item.icon}
              </ListItemIcon> */}
							<ListItemText primary={item.text} />
						</ListItemButton>
					</ListItem>
				))}
			</List>
		</div>
	);

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />
			<AppBar
				position="fixed"
				sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
				<Toolbar>
					<Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
						{/* Find the current page title - simple version */}
						{navItems.find((item) => item.path === location.pathname)?.text ||
							"Hospital Management"}
					</Typography>
					{/* <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}> */}
					<Button color="inherit" onClick={handleLogout}>
						Logout
					</Button>
				</Toolbar>
			</AppBar>
			<Drawer
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					"& .MuiDrawer-paper": {
						width: drawerWidth,
						boxSizing: "border-box",
					},
				}}
				variant="permanent"
				anchor="left">
				{drawer}
			</Drawer>
			<Box
				component="main"
				sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}>
				<Toolbar /> {/* Necessary spacer for content below AppBar */}
				<Outlet /> {/* Child routes will render here */}
			</Box>
		</Box>
	);
}

export default Layout;
