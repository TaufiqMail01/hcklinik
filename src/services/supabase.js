import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://xdaagipakmugcqixpfvl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkYWFnaXBha211Z2NxaXhwZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5MDc4MTMsImV4cCI6MjExMDQ4MzgxM30.iwPKqHhNk4yVHjJICrwGRosSKgWz5NTsm3i7VUpahvc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);