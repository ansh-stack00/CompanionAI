'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from "sonner"
import { MessageCircle, Pencil, Trash2, Bot } from 'lucide-react'

export default function CompanionCard({ companion, onDeleted }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/companions/${companion.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')

      toast.success(`${companion.name} deleted`)
      onDeleted(companion.id)
    } catch (error) {
      toast.error(`Failed to delete: ${error.message}`)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardContent className="pt-6 flex-1">
        {/* Avatar + Name */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {companion.avatar_url ? (
              <img src={companion.avatar_url} alt={companion.name} className="w-full h-full object-cover" />
            ) : (
              <Bot className="w-6 h-6 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-base leading-tight">{companion.name}</h3>
            {companion.relationship_type && (
              <p className="text-xs text-muted-foreground capitalize">{companion.relationship_type}</p>
            )}
          </div>
        </div>

        {/* Description */}
        {companion.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {companion.description}
          </p>
        )}

        {/* Personality Traits */}
        {companion.personality_traits?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {companion.personality_traits.slice(0, 3).map(trait => (
              <Badge key={trait} variant="secondary" className="text-xs">
                {trait}
              </Badge>
            ))}
            {companion.personality_traits.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{companion.personality_traits.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        {/* Chat button — will link to chat page on Day 2 */}
        <Button
          className="flex-1"
          onClick={() => router.push(`/chat/${companion.id}`)}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat
        </Button>

        {/* Edit */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/companions/${companion.id}/edit`)}
        >
          <Pencil className="w-4 h-4" />
        </Button>

        {/* Delete */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="icon" disabled={deleting}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {companion.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this companion and all their conversations. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}