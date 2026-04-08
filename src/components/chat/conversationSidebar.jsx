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
    <div className="w-74 border-r border-border bg-card flex flex-col h-full flex-shrink-0">

      {/* New Chat button */}
      <div className="p-3 border-b border-border">
        <Button onClick={onNewConversation} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

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
                  'flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors w-full',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-accent text-foreground'
                )}
              >
                {/* Icon */}
                <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0 opacity-50" />

                {/* Text block + delete button all inside here */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate leading-tight">
                    {conv.title}
                  </p>
                  {preview && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {preview}
                    </p>
                  )}

                  {/* Bottom row — date on left, delete on right */}
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(conv.created_at), 'MMM d')}
                    </p>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded hover:bg-destructive/10 flex-shrink-0"
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
                            All messages will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={e => e.stopPropagation()}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={e => {
                              e.stopPropagation()
                              handleDelete(conv.id)
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

              </div>
            )
          })}

        </div>
      </ScrollArea>
    </div>
  )
}