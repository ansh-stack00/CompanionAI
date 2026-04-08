'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import MessageBubble from './messageBubble'
import ChatInput from './chatInput'
import ConversationSidebar from './conversationSidebar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSonner } from 'sonner'
import { ArrowLeft, Bot } from 'lucide-react'

export default function ChatWindow({ companion }) {
  const router = useRouter()
  const { toast } = useSonner()
  const bottomRef = useRef(null)

  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  // Load conversations on mount
  useEffect(() => { loadConversations() }, [companion.id])

  // Auto-scroll on new messages or typing
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const loadConversations = async () => {
    setLoadingConvs(true)
    try {
      const res = await fetch(`/api/conversations?companionId=${companion.id}`)
      const data = await res.json()
      const convs = data.conversations || []
      setConversations(convs)

      if (convs.length > 0) {
        setActiveConversationId(convs[0].id)
        await loadMessages(convs[0].id)
      } else {
        await handleNewConversation()
      }
    } catch {
      toast.error( 'Failed to load conversations')
    } finally {
      setLoadingConvs(false)
    }
  }

  const loadMessages = async (conversationId) => {
    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/conversations/${conversationId}`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch {
      toast.error( 'Failed to load messages')
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleNewConversation = async () => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionId: companion.id }),
      })
      const data = await res.json()
      const newConv = data.conversation
      setConversations(prev => [newConv, ...prev])
      setActiveConversationId(newConv.id)
      setMessages([])
      return newConv.id
    } catch {
      toast.error('Failed to create conversation')
      return null
    }
  }

  const handleSelectConversation = async (convId) => {
    if (convId === activeConversationId || sending) return
    setActiveConversationId(convId)
    await loadMessages(convId)
  }

  const handleDeleteConversation = (deletedId) => {
    const remaining = conversations.filter(c => c.id !== deletedId)
    setConversations(remaining)

    if (activeConversationId === deletedId) {
      if (remaining.length > 0) {
        handleSelectConversation(remaining[0].id)
      } else {
        setMessages([])
        setActiveConversationId(null)
        handleNewConversation()
      }
    }
  }

  const handleSend = async (content) => {
  if (!activeConversationId || sending) return

  // Optimistic user message
  const tempMsg = {
    id: `temp-${Date.now()}`,
    role: 'user',
    content,
    created_at: new Date().toISOString(),
  }
  setMessages(prev => [...prev, tempMsg])
  setSending(true)
  setIsTyping(true)

  // Placeholder for streaming AI response
  const aiMsgId = `ai-${Date.now()}`

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: content,
        conversationId: activeConversationId,
        companionId: companion.id,
      }),
    })

    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.error || 'Failed to send')
    }

    // Hide typing indicator, add empty AI bubble to stream into
    setIsTyping(false)
    setMessages(prev => [...prev, {
      id: aiMsgId,
      role: 'assistant',
      content: '',           // starts empty, tokens fill it in
      created_at: new Date().toISOString(),
    }])

    // Read the SSE stream
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true })

      // Process complete SSE lines from buffer
      const lines = buffer.split('\n')
      // Keep the last incomplete line in buffer
      buffer = lines.pop() || ''

      for (const line of lines) {
        // SSE lines start with "data: "
        if (!line.startsWith('data: ')) continue

        const data = line.slice(6).trim()  // strip "data: "

        // Stream finished
        if (data === '[DONE]') {
          // Refresh sidebar to get updated title
          const convsRes = await fetch(`/api/conversations?companionId=${companion.id}`)
          const convsData = await convsRes.json()
          setConversations(convsData.conversations || [])
          break
        }

        try {
          const parsed = JSON.parse(data)

          if (parsed.error) {
            throw new Error(parsed.error)
          }

          if (parsed.token) {
            // Append token to the AI message bubble in real time
            setMessages(prev => prev.map(msg =>
              msg.id === aiMsgId
                ? { ...msg, content: msg.content + parsed.token }
                : msg
            ))
          }
        } catch (parseErr) {
          // Skip malformed chunks
          console.warn('Stream parse error:', parseErr)
        }
      }
    }

  } catch (error) {
    setIsTyping(false)
    // Remove both the temp user message and empty AI bubble on error
    setMessages(prev => prev.filter(m => m.id !== tempMsg.id && m.id !== aiMsgId))
    toast.error(`Failed to send message: ${error.message}`)
  } finally {
    setSending(false)
  }
}

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Left sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main chat column */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="h-16 border-b border-border flex items-center px-4 gap-3 bg-background flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {companion.avatar_url
              ? <img src={companion.avatar_url} alt={companion.name} className="w-full h-full object-cover" />
              : <Bot className="w-5 h-5 text-primary" />
            }
          </div>

          <div>
            <p className="font-semibold text-sm leading-tight">{companion.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {companion.relationship_type || 'AI Companion'} · {companion.expertise_area || 'General'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {loadingMessages ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`flex gap-3 ${i % 2 !== 0 ? 'flex-row-reverse' : ''}`}>
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  <Skeleton className={`h-12 rounded-2xl ${i % 2 !== 0 ? 'w-48' : 'w-64'}`} />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Empty state */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 overflow-hidden">
                    {companion.avatar_url
                      ? <img src={companion.avatar_url} alt={companion.name} className="w-full h-full object-cover" />
                      : <Bot className="w-8 h-8 text-primary" />
                    }
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Start chatting with {companion.name}</h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    {companion.description || `Say hello to your ${companion.relationship_type || 'AI companion'}!`}
                  </p>
                </div>
              )}

              {/* Message bubbles */}
              {messages.map(msg => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  companionName={companion.name}
                  companionAvatar={companion.avatar_url}
                />
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {companion.avatar_url
                      ? <img src={companion.avatar_url} alt={companion.name} className="w-full h-full object-cover" />
                      : <Bot className="w-4 h-4 text-secondary-foreground" />
                    }
                  </div>
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input bar */}
        <ChatInput onSend={handleSend} disabled={sending || loadingMessages} />
      </div>
    </div>
  )
}