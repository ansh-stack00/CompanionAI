'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Plus, Trash2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

export default function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}) {

  const [deleting, setDeleting] = useState(null)

  const handleDelete = async (convId) => {
    setDeleting(convId)
    try {
      const res = await fetch(`/api/conversations/${convId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      onDeleteConversation(convId)
      toast.success('Conversation deleted')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-full flex-shrink-0">

      {/* New Chat button */}
      <div className="p-3 border-b border-border">
        <Button onClick={onNewConversation} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* List */}
      <ScrollArea className="flex-1 overflow-x-hidden">
        <div className="p-2 space-y-1">
          {conversations.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8 px-3">
              No conversations yet. Say hello!
            </p>
          )}

          {conversations.map(conv => {
            const preview = conv.messages?.[0]?.content
            const isActive = conv.id === activeConversationId

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  'group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-accent text-foreground'
                )}
              >
                <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate leading-tight">{conv.title}</p>
                  {preview && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{preview}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(conv.created_at), 'MMM d')}
                  </p>
                </div>

                {/* Delete — visible on hover */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1"
                      onClick={e => e.stopPropagation()}
                      disabled={deleting === conv.id}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
                      <AlertDialogDescription>
                        All messages in this conversation will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={e => e.stopPropagation()}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={e => { e.stopPropagation(); handleDelete(conv.id) }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}