import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/notes?search=xxx
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.log('Unauthorized access attempt to /api/notes')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    } 
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let query = supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    const { data, error } = await query
    if (error) {
        console.error('Error fetching notes:', error)
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
    }

    return NextResponse.json({ notes: data })
  } catch (error) {
    console.error('Unexpected error in GET /api/notes:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/notes
export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user){
        console.log('Unauthorized access attempt to POST /api/notes')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    } 

    const { title, content } = await request.json()

    if (!content?.trim()) {
        console.log('Validation error: Content is required')
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: session.user.id,
        title: title?.trim() || null,
        content: content.trim(),
      })
      .select()
      .single()

    if(error || !data) {
        console.error('Error creating note:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ note: data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/notes:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}