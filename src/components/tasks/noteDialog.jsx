'use client'

import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export default function NoteDialog({ open, onClose, onSave, initialData = null }) {
  const isEditing = !!initialData
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setContent(initialData.content || '')
    } else {
      setTitle('')
      setContent('')
    }
  }, [initialData, open])

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    await onSave({ title, content })
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Note' : 'New Note'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="note-title">Title <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              id="note-title"
              placeholder="Note title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-content">Content *</Label>
            <Textarea
              id="note-content"
              placeholder="Write your note here..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!content.trim() || saving}>
            {saving
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isEditing ? 'Saving...' : 'Creating...'}</>
              : isEditing ? 'Save Changes' : 'Create Note'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}