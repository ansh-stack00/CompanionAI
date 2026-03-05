import { Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export default function MessageBubble({ message, companionName, companionAvatar }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3 mb-4', isUser ? 'flex-row-reverse' : 'flex-row')}>

      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden',
        isUser ? 'bg-primary' : 'bg-secondary'
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : companionAvatar ? (
          <img src={companionAvatar} alt={companionName} className="w-full h-full object-cover" />
        ) : (
          <Bot className="w-4 h-4 text-secondary-foreground" />
        )}
      </div>

      {/* Bubble + timestamp */}
      <div className={cn('flex flex-col max-w-[75%]', isUser ? 'items-end' : 'items-start')}>
        <div className={cn(
          'px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-muted text-foreground rounded-tl-sm'
        )}>
          {message.content}
        </div>
        {message.created_at && (
          <span className="text-xs text-muted-foreground mt-1 px-1">
            {format(new Date(message.created_at), 'h:mm a')}
          </span>
        )}
      </div>
    </div>
  )
}