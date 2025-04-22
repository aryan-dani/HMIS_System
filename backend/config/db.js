/** @format */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Initialize Supabase client
const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_ANON_KEY
);

// Test connection
const connectDB = async () => {
	try {
		// Attempt to get the client instance - this implicitly checks connectivity
		if (!supabase) {
			throw new Error("Supabase client initialization failed.");
		}

		// Optional: You could perform a very lightweight query if needed,
		// but often just initializing the client is sufficient.
		// Example: await supabase.rpc('echo', { message: 'hello' });

		console.log(`Supabase Connected: ${process.env.SUPABASE_URL}`);
		return supabase;
	} catch (err) {
		console.error(`Error connecting to Supabase: ${err.message}`);
		process.exit(1); // Exit with failure
	}
};

module.exports = { connectDB, supabase };
