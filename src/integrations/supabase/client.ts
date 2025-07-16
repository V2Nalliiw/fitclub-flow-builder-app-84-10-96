
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://oilnybhaboefqyhjrmvl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pbG55YmhhYm9lZnF5aGpybXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzQ2NzksImV4cCI6MjA2NjQ1MDY3OX0.QzSb4EzbVXh3UmWhHiMNP9fsctIJv2Uqg2Bia6ntZAY';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
