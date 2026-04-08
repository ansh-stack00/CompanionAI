'use client'

import { useRouter } from 'next/navigation'
import { Bot, MessageCircle, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function CompanionMetrics({ companions, mostActive }) {
  const router = useRouter()

  if (!companions?.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold mb-4">Companion Breakdown</h3>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Bot className="w-8 h-8 text-muted-foreground/20 mb-2" />
          <p className="text-sm text-muted-foreground">No data yet</p>
        </div>
      </div>
    )
  }

  // Find max conversations for progress bar scaling
  const maxConvs = Math.max(...companions.map(c => c.conversations))

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold">Companion Breakdown</h3>
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Most active callout */}
      {mostActive && (
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/10
                        rounded-lg p-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center
                          justify-center overflow-hidden flex-shrink-0">
            {mostActive.avatar_url ? (
              <img src={mostActive.avatar_url} alt={mostActive.name}
                   className="w-full h-full object-cover" />
            ) : (
              <Bot className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Most active companion</p>
            <p className="text-sm font-semibold truncate">{mostActive.name}</p>
          </div>
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            {mostActive.conversations} chats
          </Badge>
        </div>
      )}

      {/* Per-companion rows */}
      <div className="space-y-4">
        {companions.map((companion, i) => (
          <div key={companion.id}>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center
                              justify-center overflow-hidden flex-shrink-0">
                {companion.avatar_url ? (
                  <img src={companion.avatar_url} alt={companion.name}
                       className="w-full h-full object-cover" />
                ) : (
                  <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>
              <span className="text-sm font-medium flex-1 truncate">{companion.name}</span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {companion.conversations} conv · {companion.messages} msg
              </span>
            </div>

            {/* Progress bar */}
            <div className="ml-10 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${maxConvs > 0 ? (companion.conversations / maxConvs) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}