/** @format */

import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./context/AuthContext";

// Define a more refined theme
const theme = createTheme({
	palette: {
		mode: "light", // Or 'dark'
		primary: {
			main: "#1976d2", // Standard MUI blue
			light: "#42a5f5",
			dark: "#1565c0",
		},
		secondary: {
			main: "#dc004e", // Standard MUI pink
			light: "#ff4081",
			dark: "#9a0036",
		},
		background: {
			default: "#f4f6f8", // Lighter grey background
			paper: "#ffffff",
		},
		text: {
			primary: "rgba(0, 0, 0, 0.87)",
			secondary: "rgba(0, 0, 0, 0.6)",
			disabled: "rgba(0, 0, 0, 0.38)",
		},
		error: {
			main: "#d32f2f",
		},
		warning: {
			main: "#ed6c02",
		},
		info: {
			main: "#0288d1",
		},
		success: {
			main: "#2e7d32",
		},
	},
	typography: {
		fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
		h1: { fontWeight: 700, fontSize: "2.5rem" },
		h2: { fontWeight: 600, fontSize: "2rem" },
		h3: { fontWeight: 600, fontSize: "1.75rem" },
		h4: { fontWeight: 600, fontSize: "1.5rem" }, // Title for pages
		h5: { fontWeight: 500, fontSize: "1.25rem" },
		h6: { fontWeight: 500, fontSize: "1.1rem" },
		body1: { fontSize: "1rem" },
		body2: { fontSize: "0.875rem" },
		button: {
			textTransform: "none", // Keep button text case as defined
			fontWeight: 500,
		},
	},
	shape: {
		borderRadius: 8, // Consistent border radius
	},
	components: {
		MuiAppBar: {
			styleOverrides: {
				root: {
					boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)", // Softer shadow
					// backgroundColor: '#ffffff', // Optional: White AppBar
					// color: 'rgba(0, 0, 0, 0.87)', // Optional: Dark text on white AppBar
				},
			},
		},
		MuiDrawer: {
			styleOverrides: {
				paper: {
					borderRight: "none", // Remove border if AppBar has shadow/border
					backgroundColor: "#ffffff", // Ensure drawer background is white
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					padding: "8px 20px", // Slightly more padding
				},
				containedPrimary: {
					"&:hover": {
						boxShadow: "0 2px 8px rgba(25, 118, 210, 0.4)", // Enhance hover shadow
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					boxShadow: "0 2px 10px rgba(0,0,0,0.08)", // Consistent card shadow
					transition: "box-shadow 0.3s ease-in-out",
					"&:hover": {
						boxShadow: "0 4px 20px rgba(0,0,0,0.12)", // Enhance hover shadow
					},
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					// Default paper styles if needed, often covered by Card
				},
				elevation1: {
					boxShadow: "0 1px 3px rgba(0,0,0,0.1)", // Softer default elevation
				},
			},
		},
		MuiTableCell: {
			styleOverrides: {
				head: {
					fontWeight: 600,
					backgroundColor: "#f4f6f8", // Light grey header
					color: "rgba(0, 0, 0, 0.6)",
				},
				body: {
					color: "rgba(0, 0, 0, 0.87)",
				},
			},
		},
		MuiTableRow: {
			styleOverrides: {
				root: {
					"&:nth-of-type(odd)": {
						// backgroundColor: '#fafafa', // Optional: Zebra striping
					},
					"&:hover": {
						backgroundColor: "rgba(0, 0, 0, 0.04)", // Subtle hover effect
					},
				},
			},
		},
		MuiDialogTitle: {
			styleOverrides: {
				root: {
					fontWeight: 600,
					padding: "16px 24px",
				},
			},
		},
		MuiDialogContent: {
			styleOverrides: {
				root: {
					padding: "20px 24px",
				},
			},
		},
		MuiDialogActions: {
			styleOverrides: {
				root: {
					padding: "16px 24px",
				},
			},
		},
		MuiTextField: {
			defaultProps: {
				variant: "outlined", // Default to outlined variant
				margin: "dense",
			},
		},
		MuiFormControl: {
			defaultProps: {
				variant: "outlined", // Default to outlined variant
				margin: "dense",
			},
		},
		MuiSelect: {
			defaultProps: {
				variant: "outlined", // Default to outlined variant
				margin: "dense",
			},
		},
		MuiAutocomplete: {
			styleOverrides: {
				inputRoot: {
					// Ensure Autocomplete padding matches TextField
					paddingTop: "9px !important", // Adjust if needed based on TextField variant
					paddingBottom: "9px !important",
				},
			},
		},
	},
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	// Wrap everything with ThemeProvider AND AuthProvider
	<ThemeProvider theme={theme}>
		<AuthProvider>
			<CssBaseline /> {/* Apply baseline styles and background color */}
			<App />
		</AuthProvider>
	</ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
