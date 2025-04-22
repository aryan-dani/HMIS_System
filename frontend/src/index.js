/** @format */

import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles"; // Import ThemeProvider and createTheme
import CssBaseline from "@mui/material/CssBaseline";
// import './index.css'; // Keep this commented out
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider

// Create a custom theme
const theme = createTheme({
	palette: {
		mode: "light", // Or 'dark'
		primary: {
			main: "#1976d2", // Example primary color (MUI default blue)
		},
		secondary: {
			main: "#dc004e", // Example secondary color
		},
		background: {
			default: "#f4f6f8", // Light grey background
			paper: "#ffffff", // White background for Paper components
		},
	},
	typography: {
		fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
		h5: {
			fontWeight: 500, // Make h5 slightly bolder
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
