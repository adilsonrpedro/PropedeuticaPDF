import { createClient } from '@supabase/supabase-js';

// Coloque os seus dados reais do Supabase direto aqui dentro das aspas:
const supabaseUrl = "https://qpoyijyqdlrsfzawwgou.supabase.co/rest/v1/";
const supabaseAnonKey = "sb_publishable_UA7GPr8XuyQKem7SpI06ow_7cc84N-F";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
