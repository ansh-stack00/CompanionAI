import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/header'
import CompanionForm from '@/components/companions/companionForm'
import { notFound } from 'next/navigation'

export default async function EditCompanionPage({ params }) {
  const { id } = await params   

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return notFound()

  const { data: companion, error } = await supabase
    .from('companions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !companion) {
    return notFound()
  }

  return (
    <div>
      <Header title="Edit Companion" />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          Edit {companion.name}
        </h2>

        <CompanionForm initialData={companion} />
      </div>
    </div>
  )
}