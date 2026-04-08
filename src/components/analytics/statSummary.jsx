import { MessageCircle, Send, Inbox, BarChart2 } from 'lucide-react'

const cards = (overview) => [
  {
    label: 'Total Conversations',
    value: overview.totalConversations,
    icon: MessageCircle,
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    label: 'Messages Sent',
    value: overview.totalSent,
    icon: Send,
    color: 'bg-violet-500/10 text-violet-500',
  },
  {
    label: 'Messages Received',
    value: overview.totalReceived,
    icon: Inbox,
    color: 'bg-indigo-500/10 text-indigo-500',
  },
  {
    label: 'Avg. Messages / Chat',
    value: overview.avgLength,
    icon: BarChart2,
    color: 'bg-emerald-500/10 text-emerald-500',
  },
]

export default function StatsSummary({ overview }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards(overview).map(card => (
        <div
          key={card.label}
          className="bg-card border border-border rounded-xl p-5 flex items-center gap-4"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
            <card.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground leading-tight mt-0.5">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}