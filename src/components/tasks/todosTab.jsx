'use client'

import { useState, useEffect, useRef } from 'react'
import TodoItem from './todoItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { CheckSquare, Plus } from 'lucide-react'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

export default function TodosTab() {
  const inputRef = useRef(null)
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [newTask, setNewTask] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => { fetchTodos(filter) }, [filter])

  const fetchTodos = async (currentFilter = 'all') => {
    try {
      const res = await fetch(`/api/todos?filter=${currentFilter}`)
      const data = await res.json()
      setTodos(data.todos || [])
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTodo = async () => {
    if (!newTask.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: newTask.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Add to list if it matches current filter
      if (filter !== 'completed') {
        setTodos(prev => [data.todo, ...prev])
      }
      setNewTask('')
      toast.success('Task added')
      inputRef.current?.focus()
    } catch (error) {
      toast.error('Failed to add task')
    } finally {
      setAdding(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddTodo()
  }

  const handleToggle = async (id, completed) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed } : t))

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      })
      if (!res.ok) throw new Error()

      // Re-fetch to apply filter correctly
      await fetchTodos(filter)
    } catch {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t))
      toast.error('Failed to update task')
    }
  }

  const handleEdit = async (id, task) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTodos(prev => prev.map(t => t.id === id ? data.todo : t))
      toast.success('Task updated' )
    } catch (error) {
      toast.error(`failed to update task: ${error.message}`)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setTodos(prev => prev.filter(t => t.id !== id))
      toast.success( 'Task deleted')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  // Stats for the counter badges
  const activeCount = todos.filter(t => !t.completed).length
  const completedCount = todos.filter(t => t.completed).length

  return (
    <div className="max-w-2xl">

      {/* Add task input */}
      <div className="flex gap-2 mb-6">
        <Input
          ref={inputRef}
          placeholder="Add a new task... (press Enter)"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={adding}
        />
        <Button onClick={handleAddTodo} disabled={!newTask.trim() || adding}>
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-muted p-1 rounded-lg w-fit">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.label}
            {f.value === 'active' && activeCount > 0 && (
              <span className="ml-1.5 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                {activeCount}
              </span>
            )}
            {f.value === 'completed' && completedCount > 0 && (
              <span className="ml-1.5 text-xs bg-muted-foreground/20 rounded-full px-1.5 py-0.5">
                {completedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && todos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CheckSquare className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-1">
            {filter === 'completed' ? 'No completed tasks' :
             filter === 'active' ? 'No active tasks' : 'No tasks yet'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {filter === 'all'
              ? 'Add a task above or ask your companion to add one for you.'
              : `Switch to "All" to see all your tasks.`
            }
          </p>
        </div>
      )}

      {/* Todo list */}
      {!loading && todos.length > 0 && (
        <div className="space-y-2">
          {todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Clear completed button */}
      {completedCount > 0 && filter !== 'active' && (
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={async () => {
              const completed = todos.filter(t => t.completed)
              await Promise.all(completed.map(t =>
                fetch(`/api/todos/${t.id}`, { method: 'DELETE' })
              ))
              setTodos(prev => prev.filter(t => !t.completed))
              toast.success( `Cleared ${completed.length} completed tasks`)
            }}
          >
            Clear {completedCount} completed
          </Button>
        </div>
      )}
    </div>
  )
}