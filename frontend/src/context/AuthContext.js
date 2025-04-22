/** @format */

import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(true); // Start loading

	useEffect(() => {
		let isMounted = true; // Flag to prevent state updates on unmounted component

		// Check initial session
		supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
			if (isMounted) {
				setSession(initialSession);
				setLoading(false); // Set loading false *after* initial check
			}
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, updatedSession) => {
			if (isMounted) {
				setSession(updatedSession);
				// No need to set loading here, it's handled by initial check
			}
		});

		// Cleanup subscription and set flag on unmount
		return () => {
			isMounted = false;
			subscription?.unsubscribe();
		};
	}, []); // Empty dependency array: run only once on mount

	const value = {
		session,
		user: session?.user ?? null,
		signOut: () => supabase.auth.signOut(),
		loading, // Expose loading state
	};

	// Don't render children until loading is false
	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
};

// Custom hook to use the auth context
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		// Correct check
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
