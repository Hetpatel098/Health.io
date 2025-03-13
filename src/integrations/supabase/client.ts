
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wgtpnzepbgbvwxhlvtji.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndndHBuemVwYmdidnd4aGx2dGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MTE0NzcsImV4cCI6MjA1NzM4NzQ3N30.QGlCL05p9A_NIOCtl3zfAa12hNsGVsAic1xoZtu9dX8";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Add a debug function to report auth status
export const checkAuthStatus = async () => {
  const { data, error } = await supabase.auth.getSession();
  console.log("Current auth status:", data.session ? "Authenticated" : "Not authenticated", error || "");
  return { data, error };
};
