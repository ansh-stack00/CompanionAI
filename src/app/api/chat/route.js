import { groq, openai } from "@/lib/llm/openai";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function buildSystemPrompt(companion , memoryText) {
    return `
    You are ${companion.name}, an AI companion. Never break character.

PERSONALITY:
- Traits: ${companion.personality_traits?.join(', ') || 'friendly, helpful'}
- Communication style: ${companion.communication_style || 'casual'}
- Relationship with user: ${companion.relationship_type || 'friend'}
- Expertise: ${companion.expertise_area || 'general'}

BACKGROUND:
${companion.background_story || 'You are a helpful and friendly AI companion.'}

CUSTOM INSTRUCTIONS:
${companion.system_prompt || 'Be helpful, warm, and engaging.'}

${memoryText ? `WHAT YOU REMEMBER ABOUT THIS USER:\n${memoryText}` : ''}

RULES:
- Always stay in character as ${companion.name}
- Match your communication style: ${companion.communication_style || 'casual'}
- When user asks to save a note, respond AND append exactly: [SAVE_NOTE: title | content]
- When user asks to add a task or todo, respond AND append exactly: [ADD_TODO: task description]
`.trim()
    
}

export async function POST(request) {

    try {
        const supabase = await createClient()
        const { data: {user} , error } = await supabase.auth.getUser()
        if (error || !user) {
            console.log("Unauthorized access" , error)
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        const { message, conversationId, companionId } = await request.json()
        if(!message?.trim()) {
            console.log("Message is required")
            return NextResponse.json({error: "Message is required"}, {status: 400})
        }

        // loading companion details
        const { data: companion, error: companionError } = await supabase
            .from("companions")
            .select("*")
            .eq("id", companionId)
            .eq("user_id", user.id)
            .single()

        if (companionError || !companion) {
            console.log("Error fetching companion details:", companionError)
            return NextResponse.json({error: "Companion not found"}, {status: 404})
        }

        // loading memory
        const { data: memory, error: memoryError } = await supabase
            .from("user_memories")
            .select("memory_text")
            .eq("user_id", user.id)
            .eq("companion_id", companionId)
            .maybeSingle()
        
        // loading last 20 messages of the conversation for context
        const { data: history, error: messagesError } = await supabase
            .from("messages")
            .select("role, content")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true })
            .limit(20)
        
        // saving user message to db
        await supabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'user',
            content: message.trim(),
        })

        const completions = await groq.chat.completions.create({
            model:"llama-3.1-8b-instant",
            messages: [
                {
                    role:"system",
                    content: buildSystemPrompt(companion, memory?.memory_text),
                          
                },
                ...(history || []),
                {
                    role:"user",
                    content: message.trim()
                }
            ],
            max_tokens: 500,
            temperature: 0.7,
            
        })

        const rawResponse = completions.choices[0].message.content

        // Parsing and saving notes and todos if any 
        const noteRegex = rawResponse.match(/\[SAVE_NOTE:\s*(.+?)\s*\|\s*([\s\S]+?)\]/)

        if(noteRegex) {
            await supabase.from('notes').insert({
                user_id: user.id,
                title: noteRegex[1].trim(),
                content: noteRegex[2].trim(),
            }).catch(err => console.error("Error saving note:", err))
        }

        const todoMatch = rawResponse.match(/\[ADD_TODO:\s*([\s\S]+?)\]/)

        if (todoMatch) {
            await supabase.from('todos').insert({
                user_id: user.id,
                task: todoMatch[1].trim(),
            })
        }

        const cleanResponse = rawResponse
        .replace(/\[SAVE_NOTE:[\s\S]*?\]/g, '')
        .replace(/\[ADD_TODO:[\s\S]*?\]/g, '')
        .trim()

        // saving assistant response to db
        await supabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: cleanResponse,
        })

        const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversationId)

        if (count <= 2) {
            const titleRes = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [{
                role: 'user',
                content: `Write a short 4-6 word chat title for this opening message: "${message}". Return only the title, no quotes, no punctuation.`
                }],
                max_tokens: 10,
                temperature: 0.3
            })
      const title = titleRes.choices[0].message.content.trim()
      await supabase
        .from('conversations')
        .update({ title })
        .eq('id', conversationId)
    }

    return NextResponse.json({ message: cleanResponse })
    } catch (error) {
        console.error("Error generating AI response:", error)
        return NextResponse.json({error:error.message }, {status: 500})
    }
}