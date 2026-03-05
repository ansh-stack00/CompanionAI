import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// api to update a note 
export async function PUT(request, { params }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user){
        console.log('Unauthorized access attempt to PUT /api/notes/[id]')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    } 

    const { title, content } = await request.json()
    
    if (!content?.trim()) {
        console.log('Validation error: Content is required for updating note')
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const { id } = await params
    if (!id) {
        console.log('Validation error: Note ID is required for updating note')
        return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('notes')
      .update({ title: title?.trim() || null, content: content.trim() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !data) {
        console.error(`Error updating note with id ${params.id}:`, error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ note: data })
  } catch (error) {
    console.error('Unexpected error in PUT /api/notes/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// api to delete a note by id
export async function DELETE(_, { params }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user){
        console.log('Unauthorized access attempt to DELETE /api/notes/[id]')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
        console.log('Validation error: Note ID is required for deleting note')
        return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error ){
        console.error(`Error deleting note with id ${id}:`, error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/notes/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}