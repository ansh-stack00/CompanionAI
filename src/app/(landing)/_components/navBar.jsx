'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-[#050508]/90 backdrop-blur-md border-b border-white/5 py-3'
        : 'bg-transparent py-5'
    )}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
            <Brain className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">MindMate</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
            {
                navLinks.map((link) => (
                    <a
                    key={link.href}
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                    {link.label}
                    </a>
                ))
            }
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              Sign in
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25">
              Get Started Free
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-zinc-400 hover:text-white"
          onClick={() => setMobileOpen(v => !v)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0f] border-t border-white/5 px-6 py-4 space-y-3">
          {navLinks.map(link => (
            <a
            
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-zinc-400 hover:text-white py-1.5"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full text-zinc-400">Sign in</Button>
            </Link>
            <Link href="/signup" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full bg-violet-600 hover:bg-violet-500">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}