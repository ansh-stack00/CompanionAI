import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const supabase = await createClient()
        const { data : { user } , error } = await supabase.auth.getUser()
    
        if(error || !user) {
            console.log("Unauthorized access" , error)
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }
    
        const userId = user.id
        // fetching all conversations with companion details
    
        const { data: conversations } = await supabase
            .from('conversations')
            .select(`
                id, title, created_at,
                companions ( id, name, avatar_url )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: true })
    
        if(!conversations?.length) {
            console.log("No conversations found for user", userId)
            return NextResponse.json({ conversations: [] })
        }
    
        const conversationIds = conversations.map(c => c.id)
    
        // fetching all message 
        const { data:messages } = await supabase
            .from('messages')
            .select('conversation_id, role, created_at')
            .in('conversation_id',conversationIds)
    
        const totalConversations = conversations.length
        const totalMessages = messages?.length || 0
        const totalSent = messages?.filter(m => m.role === 'user').length || 0
        const totalReceived = messages?.filter(m => m.role === 'assistant').length || 0
    
        const msgPerConversation = conversationIds.map(id => messages?.filter(m => m.conversation_id === id).length || 0)
    
        const avgLength = totalMessages > 0 ? Math.round(msgPerConversation.reduce((a, b) => a + b, 0) / totalConversations) : 0
    
        // Conversation frequency — group by date (last 30 days)
        const last30 = Array.from({ length: 30 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (29 - i))
          return d.toISOString().split('T')[0]
        })
    
        const convByDate = {}
        conversations.forEach(c => {
          const date = c.created_at.split('T')[0]
          convByDate[date] = (convByDate[date] || 0) + 1
        })
    
        const frequencyData = last30.map(date => ({
          date,
          conversations: convByDate[date] || 0,
          // short label for chart x-axis
          label: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        }))
    
    
        const companionMap = {}
        conversations.forEach(conv => {
          const cid = conv.companions?.id
          if (!cid) return
          if (!companionMap[cid]) {
            companionMap[cid] = {
              id: cid,
              name: conv.companions.name,
              avatar_url: conv.companions.avatar_url,
              conversations: 0,
              messages: 0,
            }
          }
          companionMap[cid].conversations += 1
          companionMap[cid].messages += messages?.filter(
            m => m.conversation_id === conv.id
          ).length || 0
        })
    
        const companionMetrics = Object.values(companionMap).sort((a, b) => b.conversations - a.conversations)
        const mostActive = companionMetrics[0] || null

        return NextResponse.json({
            overview: {
                totalConversations,
                totalMessages,
                totalSent,
                totalReceived,
                avgLength,
            },
            frequencyData,
            companionMetrics,
            mostActive,
        })
    } catch (error) {
        console.error("Error fetching analytics data", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}