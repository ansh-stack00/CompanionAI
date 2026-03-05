import Header from '@/components/layout/header'
import CompanionForm from '@/components/companions/companionForm'

export default function NewCompanionPage() {
  return (
    <div>
      <Header title="Create Companion" />
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Create a New Companion</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Customize your AI companion's personality and behavior
          </p>
        </div>
        <CompanionForm />
      </div>
    </div>
  )
}