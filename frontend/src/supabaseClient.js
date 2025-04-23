/** @format */

import { createClient } from "@supabase/supabase-js";

// Read Supabase URL and Anon Key from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Basic check to ensure variables are set
if (!supabaseUrl || !supabaseAnonKey) {
	console.error(
		"Supabase URL or Anon Key is missing. Make sure to set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY environment variables."
		//supabase files and keys are located inside the .env file directory.
	);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log("Supabase client initialized.");
