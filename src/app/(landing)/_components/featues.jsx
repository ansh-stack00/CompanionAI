'use client'

import { motion } from 'framer-motion'
import {
  Brain, MessageCircle, StickyNote,
  History, Palette, ShieldCheck
} from 'lucide-react'

const features = [
  {
    icon: Palette,
    title: 'Deep Personality Customization',
    description: 'Give your companion a name, backstory, communication style, and expertise. Build someone that truly fits your life.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    glow: 'group-hover:shadow-violet-500/10',
  },
  {
    icon: MessageCircle,
    title: 'Natural Conversations',
    description: 'Powered by advanced LLMs, your companion understands context, remembers details, and responds like a real person.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    glow: 'group-hover:shadow-indigo-500/10',
  },
  {
    icon: Brain,
    title: 'Persistent Memory',
    description: "Your companion remembers your preferences, goals, and past conversations. Every chat builds on the last.",
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    glow: 'group-hover:shadow-purple-500/10',
  },
  {
    icon: StickyNote,
    title: 'Built-in Task Assistant',
    description: 'Ask your companion to save notes or create to-dos mid-conversation. They appear instantly in your tasks dashboard.',
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/20',
    glow: 'group-hover:shadow-fuchsia-500/10',
  },
  {
    icon: History,
    title: 'Full Conversation History',
    description: 'Every conversation is saved and searchable. Jump back into any past chat and pick up right where you left off.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    glow: 'group-hover:shadow-blue-500/10',
  },
  {
    icon: ShieldCheck,
    title: 'Private & Secure',
    description: 'Your conversations and data belong to you. Row-level security ensures no one else can ever access your companions.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'group-hover:shadow-emerald-500/10',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function Features() {
  return (
    <section id="features" className="py-28 px-6 relative">

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto relative">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold text-violet-400 tracking-widest uppercase mb-4 block">
            Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Everything your companion needs
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Built from the ground up to feel personal, intelligent, and genuinely useful every single day.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className={`group relative bg-white/[0.03] border ${f.border} rounded-2xl p-6 hover:bg-white/[0.05] transition-all duration-300 hover:shadow-xl ${f.glow}`}
            >
              <div className={`w-10 h-10 ${f.bg} ${f.border} border rounded-xl flex items-center justify-center mb-4`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}