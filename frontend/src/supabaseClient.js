/** @format */

import { createClient } from "@supabase/supabase-js";

// Read Supabase URL and Anon Key from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Basic check to ensure variables are set
if (!supabaseUrl || !supabaseAnonKey) {
	console.error(
		"Supabase URL or Anon Key is missing. Make sure to set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY environment variables."
	);
	// Optionally throw an error or handle this case appropriately
	// throw new Error('Supabase configuration is missing.');
}

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Optional: Log a message to confirm client creation (remove in production)
console.log("Supabase client initialized.");
