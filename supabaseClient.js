import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yqbziqiypamgaydcjehc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || '';
if (!supabaseKey) throw new Error('Supabase Key is missing');

export const supabase = createClient(supabaseUrl, supabaseKey);
