import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";


export async function GET(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.log("Unauthorized access attempt to conversation history")
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const companionId = searchParams.get('companionId') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = 15
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('conversations')
      .select(`
        id, title, created_at,
        companions ( id, name, avatar_url )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (companionId) query = query.eq('companion_id', companionId)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data: conversations, count, error } = await query
    if (error) {
        console.error("Error fetching conversations", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const ids = conversations?.map(c => c.id)
    let msgCounts = {}

    
    if (ids.length > 0) {
    const { data: msgData } = await supabase
        .from('messages')
        .select('conversation_id')
        .in('conversation_id', ids)

    if (msgData) {
        msgData.forEach(m => {
        msgCounts[m.conversation_id] = (msgCounts[m.conversation_id] || 0) + 1
        })
    }
    }

    const enriched = (conversations || []).map(c => ({
      ...c,
      messageCount: msgCounts[c.id] || 0,
    }))

    return NextResponse.json({
      conversations: enriched,
      total: count || 0,
      page,
      pageSize,
      hasMore: (count || 0) > page * pageSize,
    })
  } catch (error) {
    console.error("Error fetching conversation history", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}