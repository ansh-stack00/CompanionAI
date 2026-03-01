import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// api to get a single companion by id

export async function GET( _ , context) {
    try {
        const supabase = await createClient();

        const { data: { user } , error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.log("Error fetching user:", authError);
            return NextResponse.json({ error: "Unauthorized" }, { status: 500 });
        }

        const { id } = await context.params;
        if(!id) {
            console.log("Missing companion ID in request parameters");
            return NextResponse.json({ error: "Missing companion ID in request parameters" }, { status: 400 });
        }

        const { data: companion, error } = await supabase
            .from("companions")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if(!companion) {
            console.log("Companion not found");
            return NextResponse.json({ error: "Companion not found" }, { status: 404 });
        }

        if (error) {
            console.log("Companion not found or error:", error);
            return NextResponse.json({ error: "Failed to fetch companion" }, { status: 500 });
        }

        return NextResponse.json({ companion });
    } catch (error) {
        console.log("Error fetching companion:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// api to update a companion by id
export async function PUT(request, context) {
    try {
        const supabase = await createClient();

        const { data: { user } , error: authError } = await supabase.auth.getUser();
        if (authError || !user) { 
            console.log("Error fetching user:", authError);
            return NextResponse.json({ error: "Unauthorized" }, { status: 500 });
        }

        const { id } = await context.params;
        if(!id) {
            console.log("Missing companion ID in request parameters");
            return NextResponse.json({ error: "Missing companion ID in request parameters" }, { status: 400 });
        }

        const body = await request.json();

        const { data : updatedCompanion, error } = await supabase
            .from('companions')
            .update({
                name: body.name,
                description: body.description,
                avatar_url: body.avatar_url,
                personality_traits: body.personality_traits,
                communication_style: body.communication_style,
                expertise_area: body.expertise_area,
                system_prompt: body.system_prompt,
                background_story: body.background_story,
                relationship_type: body.relationship_type,
            })
            .eq('id', id)
            .eq('user_id', user.id) 
            .select()
            .single()
        
        if (error || !updatedCompanion) {
            console.log("Error updating companion:", error);
            return NextResponse.json({ error: "Failed to update companion" }, { status: 500 });
        }

        return NextResponse.json({ companion: updatedCompanion });

    } catch (error) {
        console.log("Error updating companion:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// api to delete a companion 

export async function DELETE( _ , context) {
    try {
        const supabase = await createClient();

        const { data: { user } , error: authError } = await supabase.auth.getUser();
        if (authError || !user) { 
            console.log("Error fetching user:", authError);
            return NextResponse.json({ error: "Unauthorized" }, { status: 500 });
        }

        const { id } = await context.params;
        if(!id) {
            console.log("Missing companion ID in request parameters");
            return NextResponse.json({ error: "Missing companion ID in request parameters" }, { status: 400 });
        }

        const {  error } = await supabase
            .from('companions')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)
        
        if (error) {
            console.log("Error deleting companion:", error);
            return NextResponse.json({ error: "Failed to delete companion" }, { status: 500 });
        }

        return NextResponse.json({ success: true } , { status: 200 });

    } catch (error) {
        console.log("Error deleting companion:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}