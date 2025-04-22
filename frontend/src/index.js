/** @format */

import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles"; // Import ThemeProvider and createTheme
import CssBaseline from "@mui/material/CssBaseline";
// import './index.css'; // Keep this commented out
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// Create a default theme
const theme = createTheme();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	// Wrap everything with ThemeProvider
	<ThemeProvider theme={theme}>
		{/* CssBaseline should be inside ThemeProvider */}
		<CssBaseline />
		<App />
	</ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
