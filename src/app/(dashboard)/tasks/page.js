import Header from '@/components/layout/header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import NotesTab from '@/components/tasks/noteTab'
import TodosTab from '@/components/tasks/todosTab'
import { StickyNote, CheckSquare } from 'lucide-react'

export default function TasksPage() {
  return (
    <div>
      <Header title="Tasks" />

      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Notes & To-Dos</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your notes and tasks — or ask your companion to create them for you
          </p>
        </div>

        <Tabs defaultValue="notes">
          <TabsList className="mb-6">
            <TabsTrigger value="notes" className="gap-2">
              <StickyNote className="w-4 h-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="todos" className="gap-2">
              <CheckSquare className="w-4 h-4" />
              To-Dos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes">
            <NotesTab />
          </TabsContent>

          <TabsContent value="todos">
            <TodosTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}