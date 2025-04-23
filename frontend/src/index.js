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
		mode: "light", // Keep light mode
		primary: {
			main: "#1e88e5", // Slightly lighter blue
		},
		secondary: {
			main: "#e91e63", // Slightly different pink/magenta
		},
		background: {
			default: "#f5f5f5", // Slightly darker grey background for more contrast
			paper: "#ffffff",
		},
		text: {
			primary: "rgba(0, 0, 0, 0.87)",
			secondary: "rgba(0, 0, 0, 0.6)",
		},
	},
	typography: {
		fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
		h4: {
			fontWeight: 600, // Make h4 bolder for titles
		},
		h5: {
			fontWeight: 500,
		},
		body1: {
			fontSize: "1rem",
		},
	},
	shape: {
		borderRadius: 8, // Add a subtle border radius to components like Card, Paper
	},
	components: {
		// Example: Customize Button appearance
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none", // Prevent uppercase buttons
					padding: "8px 16px",
				},
				containedPrimary: {
					boxShadow: "0 3px 5px 2px rgba(30, 136, 229, .3)", // Add subtle shadow
				},
			},
		},
		// Example: Customize Card appearance
		MuiCard: {
			styleOverrides: {
				root: {
					boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)", // Softer shadow
				},
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					boxShadow: "none", // Remove AppBar shadow for a flatter look if desired
					borderBottom: "1px solid rgba(0, 0, 0, 0.12)", // Add a subtle border instead
				},
			},
		},
	},
	// You can add more theme customizations here (spacing, component overrides, etc.)
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	// Wrap everything with ThemeProvider AND AuthProvider
	<ThemeProvider theme={theme}>
		<AuthProvider>
			<CssBaseline />
			<App />
		</AuthProvider>
	</ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
