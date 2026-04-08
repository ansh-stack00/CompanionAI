import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/header'
import ConversationTable from '@/components/history/conversationTable'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Load companions for the filter dropdown
  const { data: companions } = await supabase
    .from('companions')
    .select('id, name')
    .eq('user_id', user?.id)
    .order('name')

  return (
    <div>
      <Header title="History" />

      <div className="p-6 max-w-5xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Conversation History</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Search, filter, export and manage all your past conversations
          </p>
        </div>

        <ConversationTable companions={companions || []} />
      </div>
    </div>
  )
}