'use client'
import { useState } from 'react'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/store/useUserStore'
import { Nav } from '@/components/layout/Nav'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { Roadmap, RoadmapNode } from '@/types'
import { Sparkles, CheckCircle2, Lock, Circle, Zap, Calendar } from 'lucide-react'

const GOAL_SUGGESTIONS = [
  '🤖 Become an AI/ML Engineer',
  '🌐 Build full-stack web apps',
  '📊 Become a Data Scientist',
  '🔐 Learn Cybersecurity',
  '🎮 Build mobile apps',
  '🧠 Understand Deep Learning',
  '💹 Learn Finance & Trading algorithms',
  '🚀 Crack FAANG interviews',
]

const STATUS_STYLES = {
  locked:      'bg-bg-surface border-white/8 text-white/25 cursor-not-allowed',
  available:   'bg-bg-elevated border-white/15 text-white cursor-pointer hover:border-brand-purple/50',
  in_progress: 'bg-brand-purple/10 border-brand-purple/40 text-white cursor-pointer',
  completed:   'bg-brand-green/10 border-brand-green/30 text-brand-green cursor-pointer',
}
const TYPE_COLORS = { milestone: 'yellow', topic: 'purple', project: 'orange' } as const

function StatusIcon({ status }: { status: RoadmapNode['status'] }) {
  if (status === 'completed') return <CheckCircle2 size={16} className="text-brand-green shrink-0" />
  if (status === 'in_progress') return <Circle size={16} className="text-brand-purple shrink-0 animate-pulse" />
  if (status === 'locked') return <Lock size={14} className="text-white/20 shrink-0" />
  return <Circle size={16} className="text-white/40 shrink-0" />
}

export default function RoadmapPage() {
  const { user } = useUserStore()
  const [goal, setGoal] = useState('')
  const [generating, setGenerating] = useState(false)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [error, setError] = useState('')
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null)
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, RoadmapNode['status']>>({})

  async function generateRoadmap() {
    if (!goal.trim()) return
    setGenerating(true); setError('')
    try {
      const r = await fetch('/api/roadmap/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, userContext: user ? `${user.studyingWhat}, interested in ${user.interests.join(', ')}` : 'motivated learner' })
      })
      const data = await r.json()
      if (data.roadmap) {
        setRoadmap(data.roadmap)
        const statuses: Record<string, RoadmapNode['status']> = {}
        data.roadmap.nodes.forEach((n: RoadmapNode) => { statuses[n.id] = n.status })
        setNodeStatuses(statuses)
      } else setError(data.error || 'Failed to generate roadmap')
    } catch { setError('Connection error. Check API key in settings ⚙️') }
    setGenerating(false)
  }

  function toggleNode(node: RoadmapNode) {
    const status = nodeStatuses[node.id]
    if (status === 'locked') return
    setSelectedNode(node)
    if (status === 'available') {
      setNodeStatuses(s => ({ ...s, [node.id]: 'in_progress' }))
    } else if (status === 'in_progress') {
      setNodeStatuses(s => {
        const next = { ...s, [node.id]: 'completed' as const }
        node.dependencies // unlock dependents
        if (roadmap) {
          roadmap.nodes.forEach(n => {
            if (n.dependencies.includes(node.id) && n.dependencies.every(dep => next[dep] === 'completed')) {
              next[n.id] = 'available'
            }
          })
        }
        return next
      })
    }
  }

  const completedCount = Object.values(nodeStatuses).filter(s => s === 'completed').length
  const totalCount = Object.keys(nodeStatuses).length
  const percent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="min-h-screen bg-bg-base">
      <Nav />
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8 page-enter">
        <div className="mb-8">
          <h1 className="font-sora font-extrabold text-3xl mb-1">🗺️ AI Roadmap Maker</h1>
          <p className="text-white/40 text-sm">Tell the AI your goal. Get a complete, step-by-step learning path built for you.</p>
        </div>

        {/* GOAL INPUT */}
        {!roadmap && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <Card className="border-brand-purple/20 mb-6">
              <div className="font-sora font-bold text-base mb-3">What do you want to achieve?</div>
              <textarea value={goal} onChange={e => setGoal(e.target.value)}
                placeholder='e.g. "I want to become an AI Engineer", "Learn to build web apps", "Crack FAANG in 6 months"'
                rows={3}
                className="w-full bg-bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-brand-purple/50 resize-none transition-colors mb-3" />
              <Button variant="purple" size="lg" className="w-full" onClick={generateRoadmap} loading={generating}>
                <Sparkles size={16} /> Generate My Roadmap →
              </Button>
              {error && <p className="text-brand-red text-xs mt-2 text-center">{error}</p>}
            </Card>

            <div className="text-[11px] font-bold text-white/25 uppercase tracking-widest mb-3">Popular Goals</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {GOAL_SUGGESTIONS.map(g => (
                <button key={g} onClick={() => setGoal(g.slice(2))}
                  className="text-left text-xs font-semibold px-3 py-2.5 rounded-xl bg-bg-elevated border border-white/10 text-white/50 hover:border-brand-purple/40 hover:text-white transition-all">
                  {g}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ROADMAP DISPLAY */}
        {roadmap && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
            {/* HEADER */}
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h2 className="font-sora font-extrabold text-xl mb-1">{roadmap.title}</h2>
                <p className="text-white/40 text-sm">Goal: {roadmap.goal}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-sora font-extrabold text-2xl text-brand-yellow">{percent}%</div>
                  <div className="text-xs text-white/30">{completedCount}/{totalCount} done</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setRoadmap(null); setGoal('') }}>New Roadmap</Button>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden mb-8">
              <motion.div initial={{ width:0 }} animate={{ width:`${percent}%` }} transition={{ duration:0.8 }}
                className="h-full bg-gradient-to-r from-brand-purple to-brand-cyan rounded-full" />
            </div>

            {/* NODES */}
            <div className="relative">
              {/* Connector lines SVG */}
              <div className="space-y-3">
                {roadmap.nodes.map((node, i) => {
                  const status = nodeStatuses[node.id] || node.status
                  return (
                    <motion.div key={node.id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.05 }}>
                      <div
                        onClick={() => toggleNode({ ...node, status })}
                        className={`flex items-start gap-4 px-4 py-4 rounded-2xl border transition-all ${STATUS_STYLES[status]}`}
                        style={{ marginLeft: node.type === 'topic' ? '1.5rem' : node.type === 'project' ? '3rem' : '0' }}
                      >
                        {/* CONNECTOR */}
                        {i > 0 && (
                          <div className="absolute left-4 -top-3 w-px h-3 bg-white/10" style={{ marginLeft: node.type === 'topic' ? '1.5rem' : '0' }} />
                        )}

                        <StatusIcon status={status} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-sora font-bold text-sm">{node.title}</span>
                            <Badge variant={TYPE_COLORS[node.type]}>{node.type}</Badge>
                            {status === 'in_progress' && <Badge variant="purple">In Progress</Badge>}
                          </div>
                          <p className="text-xs text-white/40 leading-relaxed">{node.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-xs text-brand-yellow font-bold"><Zap size={11}/>{node.xpReward}</div>
                          <div className="flex items-center gap-1 text-xs text-white/25 mt-1"><Calendar size={11}/>{node.estimatedDays}d</div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* SELECTED NODE DETAIL */}
            <AnimatePresence>
              {selectedNode && (
                <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
                  className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-40">
                  <Card className="border-brand-purple/30 shadow-xl shadow-black/50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={TYPE_COLORS[selectedNode.type]}>{selectedNode.type}</Badge>
                      <button onClick={() => setSelectedNode(null)} className="text-white/30 hover:text-white text-lg">×</button>
                    </div>
                    <div className="font-sora font-bold mb-1">{selectedNode.title}</div>
                    <p className="text-xs text-white/50 mb-3">{selectedNode.description}</p>
                    <div className="flex gap-2 text-xs text-white/30 mb-3">
                      <span className="flex gap-1 items-center"><Calendar size={11}/>{selectedNode.estimatedDays} days</span>
                      <span className="flex gap-1 items-center"><Zap size={11}/>{selectedNode.xpReward} XP</span>
                    </div>
                    <Button variant="purple" size="sm" className="w-full" onClick={() => setSelectedNode(null)}>
                      {nodeStatuses[selectedNode.id] === 'in_progress' ? 'Mark Complete ✓' : 'Start Learning →'}
                    </Button>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  )
}
