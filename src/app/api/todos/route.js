import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {

        const supabase = await createClient()
        const { data: {user}, error:authError }  = await supabase.auth.getUser()
        if(authError || !user) {
            console.log("Unauthorized access attempt")
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const filter = searchParams.get("filter") || "all"

        let query = supabase
            .from("todos")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
        
        if (filter === "active") query = query.eq("completed", false)
        if (filter === "completed") query = query.eq("completed", true)

        const { data:todos, error } = await query

        if(!todos){
            console.log("No todos found for user:", user.id)
            return NextResponse.json({ error: "No todos found" }, { status: 404 })
        }
        if (error) {
            console.log("Error fetching todos:", error)
            return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 })
        }

        return NextResponse.json(todos)

    } catch (error) {
        console.log("Unexpected error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
        
    }
}

// api to create a new todo

export async function POST(request) {
    try {

        const supabase = await createClient()
        const { data: {user}, error:authError }  = await supabase.auth.getUser()
        if(authError || !user) {
            console.log("Unauthorized access attempt")
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { title } = await request.json()
         if (!task?.trim()) {
            console.log("Validation error: Task is required")
            return NextResponse.json({ error: 'Task is required' }, { status: 400 })
        }

        const { data: todo, error } = await supabase
            .from("todos")
            .insert([
                {
                    user_id: user.id,
                    title,
                    completed: false
                }
            ])
            .select()
            .single()

        if (error || !todo) {
            console.log("Error creating todo:", error)
            return NextResponse.json({ error: "Failed to create todo" }, { status: 500 })
        }

        return NextResponse.json({ todo } , { status: 201 })

    } catch (error) {
        console.log("Unexpected error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}