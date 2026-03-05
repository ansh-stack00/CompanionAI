import { CreateClient } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// api to fetch conversation by companion 
export async function GET(request) {

    try {
        const supabase = await createClient()
        const { data: {user} , error } = await supabase.auth.getUser()
        if(error || !user) {
            console.log("Unauthorized access" , error)
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        const { searchParams } = new URL(request.url)
        const companionId = searchParams.get("companionId")
        if(!companionId){
            console.log("companionId is required")
            return NextResponse.json({error: "companionId is required"}, {status: 400})
        }

        let query = supabase
            .from('conversations')
            .select(`*, messages ( content, role, created_at )`)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .order('created_at', { referencedTable: 'messages', ascending: true })
            .limit(1, { referencedTable: 'messages' })

        if (companionId) query = query.eq('companion_id', companionId)
        const { data: conversations, error: conversationsError } = await query
        
        if (conversationsError) {
            console.log("Error fetching conversations:", conversationsError)
            return NextResponse.json({error: "Failed to fetch conversations"}, {status: 500})
        }

        return NextResponse.json({conversations})
    } catch (error) {
        console.log("Error in GET /api/conversations:", error)
        return NextResponse.json({error: error.message || "Internal server error"}, {status: 500})
    }
}

// api to create conversation 
export async function POST(request) {
    try {

        const supabase = await createClient()
        const { data: {user} , error } = await supabase.auth.getUser()
        if (error || !user) {
            console.log("Unauthorized access" , error)
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        const { companionId } = await request.json()
        if (!companionId) {
            console.log("companionId is required")
            return NextResponse.json({error: "companionId is required"}, {status: 400})
        }

        const { data: conversation, error: conversationError } = await supabase
            .from('conversations')
            .insert({
                user_id: user.id,
                companion_id: companionId,
                title: 'New Conversation',
            })
            .select()
            .single()
        if (conversationError) {
            console.log("Error creating conversation:", conversationError)
            return NextResponse.json({error: "Failed to create conversation"}, {status: 500})
        }

        return NextResponse.json({conversation}, {status: 201})
        
        
    } catch (error) {
        console.log("Error in POST /api/conversations:", error)
        return NextResponse.json({error: error.message || "Internal server error"}, {status: 500})
    }
}