'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useDebouncedCallback } from 'use-debounce'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import ExportMenu from './exportMenu'
import { toast } from 'sonner'
import { Search, Trash2, MessageCircle, Bot, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ConversationTable({ companions }) {
  const router = useRouter()

  const [conversations, setConversations] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [companionFilter, setCompanionFilter] = useState('all')
  const [page, setPage] = useState(1)

  const fetchHistory = useCallback(async (s, cf, p) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: p })
      if (s) params.set('search', s)
      if (cf && cf !== 'all') params.set('companionId', cf)

      const res = await fetch(`/api/history?${params}`)
      const data = await res.json()
      setConversations(data.conversations || [])
      setTotal(data.total || 0)
    } catch {
      toast.error( 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHistory(search, companionFilter, page) }, [page])

  // Reset to page 1 when filters change
  const debouncedSearch = useDebouncedCallback((val) => {
    setPage(1)
    fetchHistory(val, companionFilter, 1)
  }, 400)

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    debouncedSearch(e.target.value)
  }

  const handleFilterChange = (val) => {
    setCompanionFilter(val)
    setPage(1)
    fetchHistory(search, val, 1)
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setConversations(prev => prev.filter(c => c.id !== id))
      setTotal(prev => prev - 1)
      toast.success('Conversation deleted' )
    } catch {
      toast.error('Failed to delete conversation')
    }
  }

  const totalPages = Math.ceil(total / 15)

  return (
    <div className="space-y-4">

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        <Select value={companionFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All companions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All companions</SelectItem>
            {companions.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-muted-foreground">
          {total} conversation{total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border">
              <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center
                        border border-dashed border-border rounded-xl">
          <MessageCircle className="w-8 h-8 text-muted-foreground/20 mb-3" />
          <p className="text-sm font-medium mb-1">
            {search || companionFilter !== 'all' ? 'No results found' : 'No conversations yet'}
          </p>
          <p className="text-xs text-muted-foreground">
            {search ? `No conversations match "${search}"` : 'Start chatting with a companion'}
          </p>
        </div>
      )}

      {/* Conversation rows */}
      {!loading && conversations.length > 0 && (
        <div className="space-y-2">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className="flex items-center gap-4 p-4 bg-card border border-border
                         rounded-xl hover:border-primary/30 hover:bg-accent/30
                         transition-all group"
            >
              {/* Companion avatar */}
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center
                              justify-center flex-shrink-0 overflow-hidden">
                {conv.companions?.avatar_url ? (
                  <img src={conv.companions.avatar_url} alt={conv.companions.name}
                       className="w-full h-full object-cover" />
                ) : (
                  <Bot className="w-4 h-4 text-primary" />
                )}
              </div>

              {/* Title + meta */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => router.push(`/chat/${conv.companions?.id}`)}
              >
                <p className="text-sm font-medium truncate group-hover:text-primary
                               transition-colors">
                  {conv.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {conv.companions?.name} · {format(new Date(conv.created_at), 'MMM d, yyyy · h:mm a')}
                </p>
              </div>

              {/* Message count badge */}
              <Badge variant="secondary" className="text-xs flex-shrink-0 hidden sm:flex gap-1">
                <MessageCircle className="w-3 h-3" />
                {conv.messageCount}
              </Badge>

              {/* Export */}
              <div className="flex-shrink-0">
                <ExportMenu conversation={conv} />
              </div>

              {/* Delete */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon"
                          className="h-8 w-8 flex-shrink-0 opacity-0
                                     group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      All messages will be permanently deleted. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(conv.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
            <Button
              variant="outline" size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages || loading}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}