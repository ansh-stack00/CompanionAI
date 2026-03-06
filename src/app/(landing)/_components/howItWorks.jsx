'use client'

import { motion } from 'framer-motion'
import { UserPlus, Palette, MessageCircle } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create your account',
    description: 'Sign up for free in seconds. No credit card, no commitments. Just you and your new companion.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    connector: 'from-violet-500/30 to-indigo-500/30',
  },
  {
    number: '02',
    icon: Palette,
    title: 'Design your companion',
    description: "Give them a name, personality traits, communication style, and a backstory. Make them uniquely yours.",
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    connector: 'from-indigo-500/30 to-purple-500/30',
  },
  {
    number: '03',
    icon: MessageCircle,
    title: 'Start chatting',
    description: 'Open a conversation and experience AI that remembers you, adapts to you, and genuinely helps you.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    connector: null,
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-semibold text-violet-400 tracking-widest uppercase mb-4 block">
            How it works
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Up and running in minutes
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Three simple steps to your perfect AI companion.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">

          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-px bg-gradient-to-r from-violet-500/20 via-indigo-500/20 to-purple-500/20" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Icon circle */}
              <div className={`relative w-16 h-16 ${step.bg} border ${step.border} rounded-2xl flex items-center justify-center mb-6 z-10`}>
                <step.icon className={`w-7 h-7 ${step.color}`} />
                {/* Step number badge */}
                <span className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-[#050508] border border-white/10 text-[10px] font-bold text-zinc-400 flex items-center justify-center">
                  {i + 1}
                </span>
              </div>

              <h3 className="font-semibold text-lg text-white mb-3">{step.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}