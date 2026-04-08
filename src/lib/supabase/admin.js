import dotenv from "dotenv";
dotenv.config({
    path: ".env.local"
});

import { createClient } from "@supabase/supabase-js"

console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)

export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        }
    }
)