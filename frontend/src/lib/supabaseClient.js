import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wljgiryasomvgmrcanfx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsamdpcnlhc29tdmdtcmNhbmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NDY5MjMsImV4cCI6MjEwNzIyMjkyM30.2mk6Yw5FmmvkmA-YAt9DpZRk-Dmnxq1B2tp6jaVMAF8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
