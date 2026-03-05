'use client'
import { useState } from 'react'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/store/useUserStore'
import { Nav } from '@/components/layout/Nav'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PREBUILT_COURSES } from '@/lib/utils'
import type { Course } from '@/types'
import { Sparkles, Search, Clock, Zap } from 'lucide-react'

const CATEGORIES = ['All', 'Artificial Intelligence', 'Web Development', 'Data Science', 'Deep Learning', 'Computer Vision']
const DIFF_COLORS = { beginner: 'green', intermediate: 'yellow', advanced: 'red' } as const

export default function CoursesPage() {
  const { user } = useUserStore()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [generating, setGenerating] = useState(false)
  const [genTopic, setGenTopic] = useState('')
  const [generatedCourses, setGeneratedCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [error, setError] = useState('')

  const filtered = PREBUILT_COURSES.filter(c =>
    (category === 'All' || c.category === category) &&
    (search === '' || c.title.toLowerCase().includes(search.toLowerCase()) || c.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  )

  async function generateCourse() {
    if (!genTopic.trim()) return
    setGenerating(true); setError('')
    try {
      const r = await fetch('/api/courses/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: genTopic, difficulty: 'beginner', userContext: user ? `${user.studyingWhat}, interested in ${user.interests.join(', ')}` : '' })
      })
      const data = await r.json()
      if (data.course) {
        setGeneratedCourses(c => [data.course, ...c])
        setGenTopic('')
      } else setError(data.error || 'Generation failed')
    } catch { setError('Connection error. Check API key.') }
    setGenerating(false)
  }

  if (selectedCourse) return <CourseDetail course={selectedCourse} onBack={() => setSelectedCourse(null)} />

  return (
    <div className="min-h-screen bg-bg-base">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8 page-enter">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
          <div>
            <h1 className="font-sora font-extrabold text-3xl mb-1">📚 Courses</h1>
            <p className="text-white/40 text-sm">AI & Emerging Tech for everyone — pre-built or auto-generated on any topic.</p>
          </div>
        </div>

        {/* AI COURSE GENERATOR */}
        <Card className="mb-8 border-brand-purple/20 bg-gradient-to-r from-brand-purple/8 to-brand-cyan/5">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-2xl">✨</div>
            <div>
              <div className="font-sora font-bold text-base">Generate a Course on Anything</div>
              <div className="text-white/40 text-xs mt-0.5">AI builds a complete curriculum with modules, lessons, quizzes and projects — instantly.</div>
            </div>
          </div>
          <div className="flex gap-2">
            <input value={genTopic} onChange={e => setGenTopic(e.target.value)} onKeyDown={e => e.key==='Enter'&&generateCourse()}
              placeholder='e.g. "Build a recommendation system", "Blockchain basics", "React + Next.js"'
              className="flex-1 bg-bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-brand-purple/50 transition-colors" />
            <Button variant="purple" onClick={generateCourse} loading={generating}><Sparkles size={14} /> Generate</Button>
          </div>
          {error && <p className="text-brand-red text-xs mt-2">{error}</p>}
        </Card>

        {/* GENERATED COURSES */}
        {generatedCourses.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-[11px] font-bold text-white/25 uppercase tracking-widest">AI-Generated Courses</div>
              <Badge variant="purple"><Sparkles size={10} /> New</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedCourses.map(c => <CourseCard key={c.id} course={c} onClick={() => setSelectedCourse(c)} />)}
            </div>
          </div>
        )}

        {/* SEARCH + FILTER */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..."
              className="w-full bg-bg-elevated border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-brand-purple/50" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${category===cat?'bg-brand-purple text-white border-transparent':'text-white/40 border-white/10 hover:border-white/25'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* PREBUILT COURSES */}
        <div className="text-[11px] font-bold text-white/25 uppercase tracking-widest mb-3">Featured Courses</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}>
                <CourseCard course={c} onClick={() => setSelectedCourse(c)} />
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-white/30">
              <div className="text-4xl mb-3">🔍</div>
              <div>No courses found. Try generating one above!</div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function CourseCard({ course, onClick }: { course: Course; onClick: () => void }) {
  return (
    <Card hover glow={DIFF_COLORS[course.difficulty] === 'green' ? 'green' : DIFF_COLORS[course.difficulty] === 'yellow' ? 'orange' : 'purple'} className="course-card flex flex-col h-full cursor-pointer" onClick={onClick}>
      <div className="text-3xl mb-3">{course.emoji}</div>
      <div className="font-sora font-bold text-sm mb-1">{course.title}</div>
      <div className="text-white/40 text-xs leading-relaxed flex-1 mb-3">{course.description}</div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {course.tags.slice(0,3).map(t => <Badge key={t} variant="ghost">{t}</Badge>)}
      </div>
      <div className="flex items-center justify-between text-xs text-white/30">
        <span className="flex items-center gap-1"><Clock size={11}/>{course.estimatedHours}h</span>
        <Badge variant={DIFF_COLORS[course.difficulty]}>{course.difficulty}</Badge>
        {!course.isPrebuilt && <Badge variant="purple"><Sparkles size={10}/> AI</Badge>}
      </div>
    </Card>
  )
}

function CourseDetail({ course, onBack }: { course: Course; onBack: () => void }) {
  const [activeModule, setActiveModule] = useState(0)

  const lessonTypeIcon = (t: string) => ({ concept:'📖', quiz:'⚡', code:'💻', project:'🚀' }[t] ?? '📖')

  return (
    <div className="min-h-screen bg-bg-base">
      <Nav />
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8 page-enter">
        <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">← Back to Courses</button>

        {/* COURSE HERO */}
        <div className="mb-8">
          <div className="text-5xl mb-4">{course.emoji}</div>
          <h1 className="font-sora font-extrabold text-2xl md:text-3xl mb-2">{course.title}</h1>
          <p className="text-white/50 mb-4">{course.description}</p>
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant={DIFF_COLORS[course.difficulty]}>{course.difficulty}</Badge>
            <span className="flex items-center gap-1 text-xs text-white/30"><Clock size={12}/>{course.estimatedHours}h estimated</span>
            <span className="flex items-center gap-1 text-xs text-white/30"><Zap size={12}/>{(course.modules || []).reduce((acc,m)=>acc+m.lessons.length,0)} lessons</span>
            {!course.isPrebuilt && <Badge variant="purple"><Sparkles size={10}/> AI Generated</Badge>}
          </div>
        </div>

        {/* MODULES */}
        {course.modules && course.modules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              {course.modules.map((m, i) => (
                <button key={m.id} onClick={() => setActiveModule(i)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${activeModule===i?'bg-brand-purple/15 border-brand-purple/40':'bg-bg-elevated border-white/10 hover:border-white/20'}`}>
                  <div className="font-bold text-sm">{m.title}</div>
                  <div className="text-xs text-white/30 mt-0.5">{m.lessons.length} lessons</div>
                </button>
              ))}
            </div>
            <div className="md:col-span-2">
              {course.modules[activeModule] && (
                <Card>
                  <h3 className="font-sora font-bold text-base mb-1">{course.modules[activeModule].title}</h3>
                  <p className="text-white/40 text-xs mb-4">{course.modules[activeModule].description}</p>
                  <div className="space-y-2">
                    {course.modules[activeModule].lessons.map((l, i) => (
                      <div key={l.id} className="flex items-center gap-3 px-3 py-2.5 bg-bg-surface rounded-xl border border-white/8">
                        <span className="text-lg">{lessonTypeIcon(l.type)}</span>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">{l.title}</div>
                          <div className="text-xs text-white/30">{l.type} · {l.duration}min</div>
                        </div>
                        <Badge variant="yellow">+{l.xpReward}XP</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="text-4xl mb-4">🚀</div>
            <div className="font-sora font-bold text-lg mb-2">Course content is being prepared</div>
            <p className="text-white/40 text-sm mb-4">Use the AI Tutor to start learning this topic right now while the course is being built.</p>
            <Button variant="cyan" onClick={() => {}}>Open AI Tutor →</Button>
          </Card>
        )}
      </main>
    </div>
  )
}
