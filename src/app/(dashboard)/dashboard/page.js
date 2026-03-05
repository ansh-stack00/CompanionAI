'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/header'
import CompanionCard from '@/components/companions/companionCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Bot } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [companions, setCompanions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompanions()
  }, [])

  const fetchCompanions = async () => {
    try {
      const res = await fetch('/api/companions')
      const data = await res.json()
      setCompanions(data.companions || [])
    } catch (error) {
      console.error('Failed to fetch companions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleted = (deletedId) => {
    setCompanions(prev => prev.filter(c => c.id !== deletedId))
  }

  return (
    <div>
      <Header title="Dashboard" />

      <div className="p-6">
        {/* Page title + Create button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Your Companions</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Create and manage your AI companions
            </p>
          </div>
          <Button onClick={() => router.push('/companions/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Companion
          </Button>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && companions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No companions yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Create your first AI companion with a unique personality and start having meaningful conversations.
            </p>
            <Button onClick={() => router.push('/companions/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Companion
            </Button>
          </div>
        )}

        {/* Companion cards grid */}
        {!loading && companions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {companions.map(companion => (
              <CompanionCard
                key={companion.id}
                companion={companion}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}