'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/header'
import StatsSummary from '@/components/analytics/statSummary'
import FrequencyChart from '@/components/analytics/frequencyChart'
import CompanionMetrics from '@/components/analytics/companionMetrics'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart2 } from 'lucide-react'

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <Header title="Analytics" />

      <div className="p-6 space-y-6 max-w-6xl">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Your conversation insights and companion activity
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3.5 w-28" />
                </div>
              ))}
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        )}

        {/* Empty state */}
        {!loading && data?.empty && (
          <div className="flex flex-col items-center justify-center
                          py-24 text-center border border-dashed
                          border-border rounded-2xl">
            <BarChart2 className="w-10 h-10 text-muted-foreground/20 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No data yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Start chatting with your companions and come back here
              to see your conversation insights.
            </p>
          </div>
        )}

        {/* Analytics content */}
        {!loading && !data?.empty && data?.overview && (
          <div className="space-y-6">
            <StatsSummary overview={data.overview} />
            <FrequencyChart data={data.frequencyData} />
            <CompanionMetrics
              companions={data.companionMetrics}
              mostActive={data.mostActive}
            />
          </div>
        )}
      </div>
    </div>
  )
}