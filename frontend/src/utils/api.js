/** @format */

// API configuration with Axios
import axios from "axios";

// Set base URL based on environment
const baseURL =
	process.env.NODE_ENV === "production"
		? "https://your-backend-name.onrender.com/api" // Replace with your actual Render URL
		: "http://localhost:5001/api";

const api = axios.create({
	baseURL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add request interceptor to include auth token for every request
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers["x-auth-token"] = token;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			// Token expired or invalid
			localStorage.removeItem("token");
			window.location = "/login";
		}
		return Promise.reject(error);
	}
);

export default api;
