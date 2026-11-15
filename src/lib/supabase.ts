import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tnvdcxuoqsiugqcucgzh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRudmRjeHVvcXNpdWdxY3VjZ3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3MjA2MjcsImV4cCI6MjExMDI5NjYyN30.aXALt3L_nypoxlv56TIfWWOGj3a73RIdyjgppODYVBU';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRudmRjeHVvcXNpdWdxY3VjZ3poIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDcyMDYyNywiZXhwIjoyMTEwMjk2NjI3fQ.hUpUpiizhXOCVpQTPw2lw0KuEAIyVSx1AMtjRJ-51gU';

// Public Supabase client for client-side interactions
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin Supabase client using Service Role for server-side API routes & admin sync
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

