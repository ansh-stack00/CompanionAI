"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// api to login a user 

export async function login( formdata ) {

    const supabase = await createClient();

    const email = formdata.get("email");
    const password = formdata.get("password")

    const { error } = await supabase.auth.signInWithPassword({
        email , 
        password
    })

    if( error ) {
        console.log(error);
        return { error: error.message}
    }

    redirect("/");

}

export async function register(formdata) {

    const supabase = await createClient();

    const email = formdata.get("email")
    const password = formdata.get("password")

    const { error } = await supabase.auth.signUp({
        email,
        password
    })

    if (error) {
        console.error("Registration error:", error.message);
        return { error: error.message };
    }

    redirect("/login");
}

export async function logout() {
    const supabase = await createClient();
    
    await supabase.auth.signOut();
    redirect("/login");
}