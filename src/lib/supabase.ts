import { createClient } from '@supabase/supabase-js';

// Cole as suas credenciais reais aqui dentro das aspas:
const supabaseUrl = "https://qpoyijyqdlrsfzawwgou.supabase.co";
const supabaseAnonKey = "sb_publishable_UA7GPr8XuyQKem7SpI06ow_7cc84N-F";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
