/** @format */

import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
	return (
		<nav className="navbar">
			<Link to="/" className="nav-brand">
				HMIS
			</Link>
			<ul className="nav-links">
				<li>
					<Link to="/">Dashboard</Link>
				</li>
				<li>
					<Link to="/patients">Patients</Link>
				</li>
				<li>
					<Link to="/doctors">Doctors</Link>
				</li>
				<li>
					<Link to="/rooms">Rooms</Link>
				</li>
				<li>
					<Link to="/billing">Billing</Link>
				</li>
				<li>
					<Link to="/pathology">Pathology</Link>
				</li>
				<li>
					<Link to="/admin">Admin</Link>
				</li>
				<li>
					<Link to="/login">Login</Link>
				</li>
			</ul>
		</nav>
	);
}

export default Navbar;
