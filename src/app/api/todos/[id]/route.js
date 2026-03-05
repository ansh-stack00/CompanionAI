import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// api to update a todoor toggle completed status
export async function PUT(request, { params }) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        console.log("Unauthorized access attempt")
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    } 

    const body = await request.json()

    // Only update fields that were sent
    const updates = {}
    if (body.task !== undefined) updates.task = body.task.trim()
    if (body.completed !== undefined) updates.completed = body.completed

    const { id } = await params
    if (!id) {
        console.log("Validation error: ID is required")
        return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { data:todo, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
        console.log("Error updating todo:", error)
        return NextResponse.json({ error: "Failed to update todo" }, { status: 500 })
    }

    return NextResponse.json({ todo: todo })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// api to delete a todo
export async function DELETE(_, { params }) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        console.log("Unauthorized access attempt")
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
        console.log("Validation error: ID is required")
        return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
        console.log("Error deleting todo:", error)
        return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}