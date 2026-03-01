import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// api to get all companions for the current user
export async function GET() {
  try {
    const supabase = await createClient();
  
  //   fetcing logged in user 
    const { data: { user } , error: authError } = await supabase.auth.getUser();
  
    if (authError || !user) {
      console.log("Error fetching user:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 500 });
    }
  
  //   fetching companions created by the logged in user 
  
      const { data: companions , error: companionsError } = await supabase
          .from("companions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });
  
      if (companionsError) {
          console.log("Error fetching companions:", companionsError);
          return NextResponse.json({ error: "Failed to fetch companions" }, { status: 500 });
      }
  
      return NextResponse.json({ companions });
  
  } catch (error) {
    console.log("An error occurred while fetching companions:", error)
    return NextResponse.json({ error: error.message }, { status: 500 });
    
  }
}


// api to create a new companion

export async function POST(request) {
    try {

        const supabase = await createClient()

        const { data: { user } , error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.log("Error fetching user:", authError)
            return NextResponse.json({ error: "Unauthorized" }, { status: 500 });
        }

        const body = await request.json();

        const { name , description , system_prompt } = body;
        if(!name || !description || !system_prompt) {
            console.log("Missing required fields: name, description, system_prompt");
            return NextResponse.json({ error: "Missing required fields: name, description, system_prompt" }, { status: 400 });
        }

        const { data: companion , error: companionError } = await supabase
            .from("companions")
            .insert({
                user_id: user.id,
                name,
                description,
                avatar_url:body.avatar_url || null,
                personality_traits: body.personality_traits || null,
                communication_style: body.communication_style || null,
                expertise_area: body.expertise_areas || null,
                system_prompt,
                background_story: body.background_story || null,
                relationship_type: body.relationship_type || null,

            })
            .select()
            .single()

        if(companionError || !companion) {
            console.log("Error creating companion:", companionError)
            return NextResponse.json({ error: "Failed to create companion" }, { status: 500 });
        }

        return NextResponse.json({ companion }, { status: 201 });
        
    } catch (error) {
        console.log("Error creating companion:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}