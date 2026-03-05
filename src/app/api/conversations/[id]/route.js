import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// api to get all message of a conversation

export async function GET( request, { params } ) {
    try {
        const supabase = await createClient()
        const { data: {user} , error } = await supabase.auth.getUser()
        if(error || !user) {
            console.log("Unauthorized access" , error)
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        const { id } = await params
        if(!id){
            console.log("conversation id is required")
            return NextResponse.json({error: "conversation id is required"}, {status: 400})
        }

        const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', id)
            .order('created_at', { ascending: true })

        if (messagesError) {
            console.log("Error fetching messages:", messagesError)
            return NextResponse.json({error: "Failed to fetch messages"}, {status: 500})
        }

        return NextResponse.json({messages})
    } catch (error) {
        console.log("Error in GET /api/conversations/[id]:", error)
        return NextResponse.json({error: error.message || "Internal server error"}, {status: 500})
    }
}

// api to delete a conversation

export async function DELETE( request, { params } ) {
    try {
        const supabase = await createClient()
        const { data: {user} , error } = await supabase.auth.getUser()
        if(error || !user) {
            console.log("Unauthorized access" , error)
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        const { id } = await params
        if(!id){
            console.log("conversation id is required")
            return NextResponse.json({error: "conversation id is required"}, {status: 400})
        }

        const { error: deleteError } = await supabase
            .from('conversations')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (deleteError) {
            console.log("Error deleting conversation:", deleteError)
            return NextResponse.json({error: "Failed to delete conversation"}, {status: 500})
        }

        return NextResponse.json({success: true})
    } catch (error) {
        console.log("Error in DELETE /api/conversations/[id]:", error)
        return NextResponse.json({error: error.message || "Internal server error"}, {status: 500})
    }
}