'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    q: 'Is MindMate free to use?',
    a: 'Yes! MindMate is completely free to get started. Create your account, build your first companion, and start chatting right away with no credit card required.',
  },
  {
    q: 'How is MindMate different from ChatGPT?',
    a: 'Unlike generic AI chatbots, MindMate lets you create companions with custom personalities, backstories, and communication styles. Your companion remembers you across sessions and adapts to your preferences over time — it feels personal, not generic.',
  },
  {
    q: 'Can I create multiple companions?',
    a: 'Absolutely. You can create as many companions as you want — a focused study buddy, a motivational coach, a casual friend, or a creative writing partner. Each one has its own personality and memory.',
  },
  {
    q: 'Does my companion actually remember past conversations?',
    a: 'Yes. MindMate uses a persistent memory system that summarizes and stores what your companion learns about you. Over time, your companion builds a richer understanding of your preferences, goals, and interests.',
  },
  {
    q: 'Is my data private?',
    a: 'Your data is protected with row-level security — only you can access your companions and conversations. We never share or sell your personal data.',
  },
  {
    q: 'Can my companion help with tasks?',
    a: 'Yes! Ask your companion to save a note or add a task mid-conversation and it will appear instantly in your Tasks dashboard. It\'s a seamless way to capture ideas without breaking your flow.',
  },
]

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div
      className={`border rounded-xl overflow-hidden transition-colors duration-200 ${
        isOpen ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/5 bg-white/[0.02] hover:border-white/10'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-medium text-sm text-white">{faq.q}</span>
        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
          isOpen ? 'bg-violet-500/20 text-violet-400' : 'bg-white/5 text-zinc-500'
        }`}>
          {isOpen
            ? <Minus className="w-3 h-3" />
            : <Plus className="w-3 h-3" />
          }
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="px-6 pb-5 text-sm text-zinc-400 leading-relaxed">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="py-28 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-semibold text-violet-400 tracking-widest uppercase mb-4 block">
            FAQ
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Questions answered
          </h2>
          <p className="text-zinc-400 text-lg">
            Everything you need to know before getting started.
          </p>
        </motion.div>

        {/* FAQ items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3"
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}