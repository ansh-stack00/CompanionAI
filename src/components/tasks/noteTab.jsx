'use client'

import { useState, useEffect, useCallback } from 'react'
import NoteCard from './noteCard'
import NoteDialog from './noteDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Plus, Search, StickyNote } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'

export default function NotesTab() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)

  const fetchNotes = useCallback(async (searchTerm = '') => {
    try {
      const url = searchTerm
        ? `/api/notes?search=${encodeURIComponent(searchTerm)}`
        : '/api/notes'
      const res = await fetch(url)
      const data = await res.json()
      setNotes(data.notes || [])
    } catch {
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  // use debounce for search input to avoid too many requests while typing
  const debouncedSearch = useDebouncedCallback((value) => {
    fetchNotes(value)
  }, 400)

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    debouncedSearch(e.target.value)
  }

  const openCreate = () => {
    setEditingNote(null)
    setDialogOpen(true)
  }

  const openEdit = (note) => {
    setEditingNote(note)
    setDialogOpen(true)
  }

  const handleSave = async ({ title, content }) => {
    try {
      const url = editingNote ? `/api/notes/${editingNote.id}` : '/api/notes'
      const method = editingNote ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (editingNote) {
        setNotes(prev => prev.map(n => n.id === editingNote.id ? data.note : n))
        toast.success( 'Note updated' )
      } else {
        setNotes(prev => [data.note, ...prev])
        toast.success( 'Note created')
      }

      setDialogOpen(false)
      setEditingNote(null)
    } catch (error) {
      toast.error(`Failed to save note: ${error.message}`)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setNotes(prev => prev.filter(n => n.id !== id))
      toast.success('Note deleted')
    } catch {
      toast.error('Failed to delete note')
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border p-5 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && notes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <StickyNote className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-1">
            {search ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-muted-foreground text-sm mb-5">
            {search
              ? `No notes match "${search}"`
              : 'Create your first note or ask your companion to save one for you.'
            }
          </p>
          {!search && (
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Note
            </Button>
          )}
        </div>
      )}

      {/* Notes grid */}
      {!loading && notes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create/Edit dialog */}
      <NoteDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingNote(null) }}
        onSave={handleSave}
        initialData={editingNote}
      />
    </div>
  )
}