/**
 * @fileoverview Supabase client configuration and initialization.
 * @package
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase-types";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

/**
 * Supabase client instance for database operations.
 * Uses environment variables for configuration.
 */
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Helper function to handle Supabase errors consistently.
 * @param error - Error object from Supabase
 * @throws {Error} Formatted error message
 */
export function handleSupabaseError(error: any): never {
  const message = error?.message || "An unknown error occurred";
  throw new Error(`Supabase error: ${message}`);
}
