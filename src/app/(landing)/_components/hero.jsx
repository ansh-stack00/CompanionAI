'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">

      {/* Background glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium px-4 py-2 rounded-full mb-8"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Personal Companions
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
        >
          Your AI companion
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            that truly gets you
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Create personalized AI companions with unique personalities. Have meaningful
          conversations, get help with tasks, and build a connection that grows
          smarter with every interaction.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-violet-600 hover:bg-violet-500 text-white shadow-xl shadow-violet-500/25 px-8 h-12 text-base group"
            >
              Start for Free
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-12 px-8 text-base"
            >
              Sign In
            </Button>
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-xs text-zinc-600 mt-6"
        >
          No credit card required · Free to get started
        </motion.p>

        {/* Mock chat UI preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 relative"
        >
          {/* Glow under card */}
          <div className="absolute -inset-4 bg-violet-600/10 rounded-3xl blur-2xl" />

          <div className="relative bg-[#0d0d14] border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto shadow-2xl text-left">
            {/* Window chrome */}
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-zinc-600">MindMate Chat</span>
            </div>

            {/* Fake messages */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-600/80 flex items-center justify-center flex-shrink-0 text-xs font-bold">A</div>
                <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-zinc-300 max-w-xs">
                  Hey! I noticed you've been working late. How's that project going? 🌙
                </div>
              </div>

              <div className="flex gap-3 flex-row-reverse">
                <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0 text-xs">U</div>
                <div className="bg-violet-600/20 border border-violet-500/20 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-zinc-200 max-w-xs">
                  It's going okay, just stressed about the deadline tomorrow
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-600/80 flex items-center justify-center flex-shrink-0 text-xs font-bold">A</div>
                <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-zinc-300 max-w-sm">
                  I remember you mentioned this project last week! Want me to help you create a task list to tackle it tonight? You've got this 💪
                </div>
              </div>

              {/* Typing indicator */}
              <div className="flex gap-3 items-center">
                <div className="w-7 h-7 rounded-full bg-violet-600/80 flex items-center justify-center flex-shrink-0 text-xs font-bold">A</div>
                <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}