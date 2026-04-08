'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Download, FileText, FileJson, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { jsPDF } from 'jspdf'

async function fetchMessages(conversationId) {
  const res = await fetch(`/api/conversations/${conversationId}`)
  const data = await res.json()
  return data.messages || []
}

export default function ExportMenu({ conversation }) {
  const [exporting, setExporting] = useState(false)

  const filename = `${conversation.title || 'conversation'}-${format(new Date(conversation.created_at), 'yyyy-MM-dd')}`
    .replace(/[^a-z0-9-]/gi, '_')
    .toLowerCase()

  const triggerDownload = (blob, name) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportTXT = async () => {
    setExporting(true)
    try {
      const messages = await fetchMessages(conversation.id)
      const header = [
        `Conversation: ${conversation.title}`,
        `Companion: ${conversation.companions?.name || 'Unknown'}`,
        `Date: ${format(new Date(conversation.created_at), 'PPP')}`,
        `Messages: ${messages.length}`,
        '─'.repeat(50),
        '',
      ].join('\n')

      const body = messages.map(m => {
        const role = m.role === 'user' ? 'You' : conversation.companions?.name || 'Companion'
        const time = format(new Date(m.created_at), 'h:mm a')
        return `[${time}] ${role}:\n${m.content}\n`
      }).join('\n')

      const blob = new Blob([header + body], { type: 'text/plain;charset=utf-8' })
      triggerDownload(blob, `${filename}.txt`)
      toast.success( 'Exported as TXT' )
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const exportJSON = async () => {
    setExporting(true)
    try {
      const messages = await fetchMessages(conversation.id)
      const payload = {
        conversation: {
          id: conversation.id,
          title: conversation.title,
          companion: conversation.companions?.name,
          created_at: conversation.created_at,
        },
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.created_at,
        })),
        exported_at: new Date().toISOString(),
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      triggerDownload(blob, `${filename}.json`)
      toast.success('Exported as JSON')
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const exportPDF = async () => {
    setExporting(true)
    try {
      const messages = await fetchMessages(conversation.id)
      const doc = new jsPDF({ unit: 'mm', format: 'a4' })
      const pageW = doc.internal.pageSize.getWidth()
      const margin = 20
      const maxW = pageW - margin * 2
      let y = margin

      const addPageIfNeeded = (height = 10) => {
        if (y + height > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage()
          y = margin
        }
      }

      // Header
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(conversation.title || 'Conversation', margin, y)
      y += 8

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(120)
      doc.text(
        `${conversation.companions?.name || 'Companion'} · ${format(new Date(conversation.created_at), 'PPP')} · ${messages.length} messages`,
        margin, y
      )
      y += 6

      // Divider
      doc.setDrawColor(220)
      doc.line(margin, y, pageW - margin, y)
      y += 8

      // Messages
      doc.setTextColor(0)
      messages.forEach(msg => {
        const isUser = msg.role === 'user'
        const role = isUser ? 'You' : (conversation.companions?.name || 'Companion')
        const time = format(new Date(msg.created_at), 'h:mm a')

        // Role + time label
        addPageIfNeeded(12)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(isUser ? 79 : 109, isUser ? 70 : 40, isUser ? 229 : 217)
        doc.text(`${role}  ·  ${time}`, margin, y)
        y += 5

        // Message content — wrap long lines
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(30)
        doc.setFontSize(10)
        const lines = doc.splitTextToSize(msg.content, maxW)
        lines.forEach(line => {
          addPageIfNeeded(6)
          doc.text(line, margin, y)
          y += 5.5
        })
        y += 4
      })

      doc.save(`${filename}.pdf`)
      toast.success('Exported as PDF')
    } catch (err) {
      console.error(err)
      toast.error('PDF export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting}>
          {exporting
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Download className="w-3.5 h-3.5" />
          }
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Export conversation
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportTXT} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4" />
          Export as TXT
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportJSON} className="gap-2 cursor-pointer">
          <FileJson className="w-4 h-4" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPDF} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4 text-red-500" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}