'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

export default function NoteCard({ note, onEdit, onDelete }) {
  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardContent className="pt-5 flex-1">
        {note.title && (
          <h3 className="font-semibold text-sm mb-2 leading-tight">{note.title}</h3>
        )}
        <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-5 leading-relaxed">
          {note.content}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-0 pb-4 px-5">
        <span className="text-xs text-muted-foreground">
          {format(new Date(note.updated_at), 'MMM d, yyyy')}
        </span>

        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(note)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(note.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  )
}