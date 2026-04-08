import { groq } from "@/lib/llm/openai";
import { createClient } from "@/lib/supabase/server";

function buildSystemPrompt(companion, memoryText) {
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

async function updateMemory(supabase, groq, userId, companionId, conversationId) {
  try {
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!recentMessages || recentMessages.length === 0) return

    // Loading existing memory 
    const { data: existingMemory } = await supabase
      .from('user_memories')
      .select('memory_text')
      .eq('user_id', userId)
      .eq('companion_id', companionId)
      .maybeSingle()

    const memoryPrompt = `
You are a memory extraction assistant. Based on this conversation, extract key facts about the USER (not the AI).

${existingMemory?.memory_text
  ? `EXISTING MEMORY (keep what's still relevant, update if contradicted):\n${existingMemory.memory_text}\n`
  : ''
}

RECENT CONVERSATION:
${recentMessages.reverse().map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')}

Extract and return a concise bullet-point summary of facts about the user. Include:
- Name (if mentioned)
- Interests and hobbies
- Goals or plans
- Emotional state or personality traits observed
- Any important life events or context mentioned
- Preferences and dislikes

Return ONLY the bullet points, nothing else. If nothing meaningful to remember, return "No significant facts yet."
`.trim()

    const memoryRes = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: memoryPrompt }],
      max_tokens: 300,
      temperature: 0.3,
    })

    const newMemory = memoryRes.choices[0].message.content.trim()

    if (newMemory && newMemory !== 'No significant facts yet.') {
      await supabase
        .from('user_memories')
        .upsert({
          user_id: userId,
          companion_id: companionId,
          memory_text: newMemory,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,companion_id'
        })

      console.log(`Memory updated for user ${userId} with companion ${companionId}`)
    }
  } catch (memErr) {
    console.error('Memory update error:', memErr)
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const { message, conversationId, companionId } = await request.json()
    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400 })
    }

    const { data: companion, error: companionError } = await supabase
      .from('companions')
      .select('*')
      .eq('id', companionId)
      .eq('user_id', user.id)
      .single()

    if (companionError || !companion) {
      return new Response(JSON.stringify({ error: 'Companion not found' }), { status: 404 })
    }

    const { data: memory } = await supabase
      .from('user_memories')
      .select('memory_text')
      .eq('user_id', user.id)
      .eq('companion_id', companionId)
      .maybeSingle()

    // Load last 20 messages for short-term conversation context
    const { data: history } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20)

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: message.trim(),
    })

    const groqStream = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(companion, memory?.memory_text),
        },
        ...(history || []),
        { role: 'user', content: message.trim() },
      ],
      max_tokens: 500,
      temperature: 0.7,
      stream: true,
    })

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let fullResponse = ''

        try {
          // Stream tokens to browser one by one
          for await (const chunk of groqStream) {
            const token = chunk.choices[0]?.delta?.content || ''
            if (token) {
              fullResponse += token
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`))
            }
          }

        const noteMatch = fullResponse.match(/\[SAVE_NOTE:\s*(.+?)\s*\|\s*([\s\S]+?)\]/)
          if (noteMatch) {
            await supabase.from('notes').insert({
              user_id: user.id,
              title: noteMatch[1].trim(),
              content: noteMatch[2].trim(),
            })
          }

        
        const todoMatch = fullResponse.match(/\[ADD_TODO:\s*([\s\S]+?)\]/)
          if (todoMatch) {
            await supabase.from('todos').insert({
              user_id: user.id,
              task: todoMatch[1].trim(),
            })
          }

          
          const cleanResponse = fullResponse
            .replace(/\[SAVE_NOTE:[\s\S]*?\]/g, '')
            .replace(/\[ADD_TODO:[\s\S]*?\]/g, '')
            .trim()

          await supabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: cleanResponse,
          })

          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversationId)

          //  Auto generating a conversation title on first exchange 
          if (count <= 2) {
            try {
              const titleRes = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [{
                  role: 'user',
                  content: `Write a short 4-6 word chat title for this opening message: "${message}". Return only the title, no quotes, no punctuation.`
                }],
                max_tokens: 10,
                temperature: 0.3,
              })
              const title = titleRes.choices[0].message.content.trim()
              await supabase
                .from('conversations')
                .update({ title })
                .eq('id', conversationId)
            } catch (titleErr) {
              console.error('Title generation error:', titleErr)
            }
          }

          if (count > 0 && count % 10 === 0) {
            await updateMemory(supabase, groq, user.id, companionId, conversationId)
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))

        } catch (err) {
          console.error('Streaming error:', err)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`)
          )
        } finally {
          controller.close()
        }
      },
    })
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}