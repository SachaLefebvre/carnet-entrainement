import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_KEY as string | undefined;

/** null quand l'app tourne sans base de données : les données restent alors sur l'appareil. */
export const supabase = url && key ? createClient(url, key) : null;
