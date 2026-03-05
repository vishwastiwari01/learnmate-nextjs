'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/store/useUserStore'
import { Button } from './Button'
import { X } from 'lucide-react'

const MODELS = [
  { value: 'meta-llama/llama-3.1-8b-instruct', label: '🦙 Llama 3.1 8B', desc: 'Free & Fast — same as app.py' },
  { value: 'meta-llama/llama-3.3-70b-instruct', label: '🦙 Llama 3.3 70B', desc: 'Smarter answers (free tier)' },
  { value: 'deepseek/deepseek-chat-v3-0324:free', label: '🧠 DeepSeek V3', desc: 'Best reasoning (free)' },
  { value: 'google/gemma-3-27b-it', label: '💎 Gemma 3 27B', desc: "Google's model (free)" },
  { value: 'mistralai/mistral-7b-instruct', label: '⚡ Mistral 7B', desc: 'Ultra fast (free)' },
]

export function ApiKeyModal({ onClose }: { onClose: () => void }) {
  const { apiKey, aiModel, setApiKey, setAIModel } = useUserStore()
  const [key, setKey] = useState(apiKey)
  const [model, setModel] = useState(aiModel)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    if (!key.trim()) return
    setApiKey(key.trim())
    setAIModel(model)
    setSaved(true)
    setTimeout(onClose, 1000)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && apiKey && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-bg-elevated border border-white/10 rounded-2xl p-6 max-w-md w-full"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-3xl mb-1">🔑</div>
              <h2 className="font-sora font-extrabold text-xl">Connect LearnMate AI</h2>
              <p className="text-white/50 text-sm mt-1">Same key as your <code className="text-brand-cyan text-xs">app.py</code></p>
            </div>
            {apiKey && (
              <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
                <X size={20} />
              </button>
            )}
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest block mb-1.5">OpenRouter API Key</label>
              <input
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full bg-bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-white/20 outline-none focus:border-brand-orange/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest block mb-1.5">AI Model</label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full bg-bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-purple/50 transition-colors cursor-pointer"
              >
                {MODELS.map(m => (
                  <option key={m.value} value={m.value}>{m.label} — {m.desc}</option>
                ))}
              </select>
            </div>
          </div>

          <Button variant="primary" className="w-full mb-3" onClick={handleSave} loading={saved}>
            {saved ? '✅ Saved!' : '⚡ Activate AI →'}
          </Button>

          <div className="bg-brand-green/8 border border-brand-green/20 rounded-xl p-3">
            <div className="text-xs font-bold text-brand-green mb-1">✅ You already have this key!</div>
            <div className="text-xs text-white/40">It's the <code className="text-brand-cyan">OPENROUTER_API_KEY</code> from your Streamlit app secrets.</div>
          </div>

          <p className="text-center text-xs text-white/25 mt-3">
            No key? Get one free at{' '}
            <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-brand-cyan hover:underline">
              openrouter.ai/keys
            </a>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
