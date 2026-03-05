'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/store/useUserStore'
import { useArenaStore } from '@/store/useArenaStore'
import { Nav } from '@/components/layout/Nav'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { genRoomCode, BOT_PLAYERS } from '@/lib/utils'
import type { Question, Player, GameType } from '@/types'

const SUBJECTS = ['Physics','Chemistry','Mathematics','Biology','History','Computer Science','Economics','English']
const GAME_TYPES: { type: GameType; emoji: string; name: string; desc: string }[] = [
  { type: 'summit',    emoji: '🏔️', name: 'Summit Rush',   desc: 'Race climbers to the peak. Answer fast, climb faster!' },
  { type: 'tugofwar',  emoji: '🪢', name: 'Tug of War',    desc: 'Pull the rope with every correct answer. Teams battle!' },
  { type: 'surfer',    emoji: '🏄', name: 'Wave Surfer',   desc: 'Catch waves with right answers, wipe out on wrong ones!' },
]

type Phase = 'select' | 'lobby' | 'playing' | 'over'

function makeBots(count = 3): Player[] {
  return BOT_PLAYERS.slice(0, count).map((b, i) => ({
    id: `bot-${i}`, name: b.name, avatar: b.avatar,
    energy: 0, score: 0, isHost: false, isBot: true,
    team: i % 2 === 0 ? 'red' : 'blue' as 'red' | 'blue',
  }))
}

export default function ArenaPage() {
  const { user } = useUserStore()
  const { room, setRoom, gamePhase, setGamePhase, myEnergy, addEnergy } = useArenaStore()

  const [phase, setPhase] = useState<Phase>('select')
  const [tab, setTab] = useState<'join' | 'create'>('join')
  const [gameType, setGameType] = useState<GameType>('summit')
  const [subject, setSubject] = useState('Physics')
  const [difficulty, setDifficulty] = useState<'beginner'|'intermediate'|'advanced'>('intermediate')
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState(user?.name ?? '')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [timer, setTimer] = useState(20)
  const [players, setPlayers] = useState<Player[]>([])
  const [myScore, setMyScore] = useState(0)
  const [botScores, setBotScores] = useState<number[]>([0, 0, 0])
  const [feedback, setFeedback] = useState<{correct: boolean; text: string} | null>(null)
  const [winner, setWinner] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const botRef = useRef<NodeJS.Timeout[]>([])
  // Refs track live scores (avoids stale closure in endGame/nextQuestion)
  const myScoreRef = useRef(0)
  const botScoresRef = useRef([0,0,0])

  const myPlayer: Player = {
    id: 'me', name: playerName || user?.name || 'You',
    avatar: user?.avatar ?? '🦊', energy: myEnergy, score: myScore,
    isHost: true, team: 'blue',
  }

  function createRoom() {
    const code = genRoomCode()
    setRoomCode(code)
    setPlayers([myPlayer, ...makeBots()])
    setPhase('lobby')
  }

  function joinRoom() {
    if (roomCode.length < 4) return
    setPlayers([myPlayer, ...makeBots()])
    setPhase('lobby')
  }

  async function startGame() {
    setPhase('playing')
    myScoreRef.current = 0; botScoresRef.current = [0,0,0]
    setCurrentQ(0); setMyScore(0); setBotScores([0,0,0])
    try {
      const r = await fetch('/api/quiz/generate', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ subject, difficulty, count: 5 })
      })
      const data = await r.json()
      setQuestions(data.questions || [])
    } catch {
      setQuestions(FALLBACK)
    }
  }

  const nextQuestion = useCallback(() => {
    setFeedback(null); setAnswered(false); setTimer(20)
    if (currentQ + 1 >= (questions.length || 5)) {
      endGame(); return
    }
    setCurrentQ(q => q + 1)
  }, [currentQ, questions.length])

  function endGame() {
    clearTimers()
    const live = myScoreRef.current
    const liveBots = botScoresRef.current
    const allScores = [live, ...liveBots]
    const maxScore = Math.max(...allScores)
    if (live === maxScore) setWinner(myPlayer.name)
    else {
      const botIdx = liveBots.indexOf(maxScore)
      setWinner(players[botIdx + 1]?.name ?? 'Bot')
    }
    setPhase('over')
  }

  function clearTimers() {
    if (timerRef.current) clearInterval(timerRef.current)
    botRef.current.forEach(clearTimeout)
    botRef.current = []
  }

  function answerQuestion(choice: string) {
    if (answered || !questions[currentQ]) return
    setAnswered(true); clearTimers()
    const q = questions[currentQ]
    const correct = choice === q.answer
    if (correct) {
      const gain = 20 + timer
      myScoreRef.current += gain; addEnergy(gain); setMyScore(myScoreRef.current)
      setFeedback({ correct: true, text: `+${gain} pts — ${q.explanation}` })
    } else {
      setFeedback({ correct: false, text: `Correct: ${q.answer} — ${q.explanation}` })
    }
    setTimeout(nextQuestion, 2500)
  }

  // Timer effect
  useEffect(() => {
    if (phase !== 'playing' || answered || questions.length === 0) return
    clearTimers()
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearTimers(); if (!answered) { setAnswered(true); setFeedback({ correct: false, text: "Time's up!" }); setTimeout(nextQuestion, 1500) } return 0 }
        return t - 1
      })
    }, 1000)
    // Bot answers
    botRef.current = botScores.map((_, i) => setTimeout(() => {
      const correct = Math.random() < 0.55
      if (correct) { botScoresRef.current[i] += 25; setBotScores([...botScoresRef.current]) }
    }, 4000 + Math.random() * 10000))
    return clearTimers
  }, [phase, currentQ, answered, questions.length])

  const q = questions[currentQ]
  const totalPlayers = [{ name: myPlayer.name, score: myScore, avatar: myPlayer.avatar }, ...BOT_PLAYERS.slice(0,3).map((b,i) => ({ name: b.name, score: botScores[i], avatar: b.avatar }))]
  const sorted = [...totalPlayers].sort((a,b) => b.score - a.score)

  return (
    <div className="min-h-screen bg-bg-base">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-8 page-enter">
        <AnimatePresence mode="wait">

          {/* ── GAME SELECT ── */}
          {phase === 'select' && (
            <motion.div key="select" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-30 }}>
              <div className="text-center mb-8">
                <h1 className="font-sora font-extrabold text-3xl mb-2">⚔️ Battle <span className="grad-orange">Arena</span></h1>
                <p className="text-white/40">Answer faster. Climb higher. Win together.</p>
              </div>

              {/* TABS */}
              <div className="flex bg-bg-elevated border border-white/10 rounded-2xl p-1 mb-6 max-w-xs mx-auto">
                {(['join','create'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all capitalize ${tab===t ? 'bg-brand-purple text-white' : 'text-white/40'}`}>{t === 'join' ? '🔑 Join Room' : '➕ Create Room'}</button>
                ))}
              </div>

              <div className="max-w-md mx-auto space-y-4">
                {tab === 'join' ? (
                  <>
                    <input value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} maxLength={6}
                      placeholder="ROOM CODE" className="w-full bg-bg-elevated border-2 border-white/10 rounded-2xl px-6 py-4 font-mono text-2xl text-center text-white tracking-[0.4em] placeholder-white/20 outline-none focus:border-brand-purple/60 uppercase transition-colors" />
                    <input value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Your nickname"
                      className="w-full bg-bg-elevated border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-brand-purple/50 transition-colors" />
                    <Button variant="purple" size="lg" className="w-full" onClick={joinRoom}>Enter Arena →</Button>
                  </>
                ) : (
                  <>
                    {/* GAME TYPE */}
                    <div>
                      <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Choose Mini-Game</div>
                      <div className="space-y-2">
                        {GAME_TYPES.map(g => (
                          <button key={g.type} onClick={() => setGameType(g.type)}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${gameType===g.type ? 'bg-brand-purple/15 border-brand-purple/50' : 'bg-bg-elevated border-white/10 hover:border-white/20'}`}>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{g.emoji}</span>
                              <div>
                                <div className="font-bold text-sm">{g.name}</div>
                                <div className="text-xs text-white/40">{g.desc}</div>
                              </div>
                              {gameType===g.type && <Badge variant="purple" className="ml-auto">Selected</Badge>}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-bg-elevated border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none">
                      {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <select value={difficulty} onChange={e => setDifficulty(e.target.value as typeof difficulty)} className="w-full bg-bg-elevated border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none">
                      <option value="beginner">🟢 Beginner</option>
                      <option value="intermediate">🟡 Intermediate</option>
                      <option value="advanced">🔴 Advanced</option>
                    </select>
                    <input value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Your name / Teacher name"
                      className="w-full bg-bg-elevated border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-brand-purple/50 transition-colors" />
                    <Button variant="primary" size="lg" className="w-full" onClick={createRoom}>Create Room →</Button>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* ── LOBBY ── */}
          {phase === 'lobby' && (
            <motion.div key="lobby" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }}>
              <div className="max-w-xl mx-auto">
                <Card className="text-center mb-6">
                  <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Share this code</div>
                  <div className="font-mono font-extrabold text-5xl text-brand-yellow tracking-[0.5em] mb-3">{roomCode}</div>
                  <Button variant="ghost" size="sm" onClick={() => {navigator.clipboard.writeText(roomCode)}}>📋 Copy Code</Button>
                </Card>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {players.map((p, i) => (
                    <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border ${p.id === 'me' ? 'bg-brand-purple/10 border-brand-purple/30' : 'bg-bg-elevated border-white/10'}`}>
                      <div className="text-2xl">{p.avatar}</div>
                      <div>
                        <div className="font-bold text-sm">{p.name} {p.id==='me' && <span className="text-brand-purple">(You)</span>}</div>
                        <div className="text-xs text-brand-green">● Ready</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <div className="text-xs text-white/30 mb-1">Game: <span className="text-white/60">{GAME_TYPES.find(g=>g.type===gameType)?.name}</span> · Subject: <span className="text-white/60">{subject}</span></div>
                  <div className="flex gap-3 justify-center mt-4">
                    <Button variant="primary" size="lg" onClick={startGame}>⚡ Start Game</Button>
                    <Button variant="ghost" onClick={() => setPhase('select')}>← Back</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── PLAYING ── */}
          {phase === 'playing' && q && (
            <motion.div key="playing" initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* QUIZ PANEL */}
                <div className="lg:col-span-3 space-y-4">
                  {/* HEADER */}
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-white/40">Q {currentQ+1}/{questions.length}</div>
                    <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-200 ${timer <= 5 ? 'bg-brand-red' : 'bg-gradient-to-r from-brand-green to-brand-cyan'}`}
                        style={{ width: `${(timer/20)*100}%` }} />
                    </div>
                    <div className={`font-sora font-extrabold text-xl min-w-[2rem] text-right ${timer<=5?'text-brand-red':'text-white'}`}>{timer}</div>
                  </div>

                  <Card>
                    <div className="font-sora font-bold text-base leading-snug mb-4">{q.question}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(['A','B','C','D'] as const).map(k => (
                        <motion.button key={k} onClick={() => answerQuestion(k)} disabled={answered}
                          whileHover={{ scale: answered ? 1 : 1.02 }} whileTap={{ scale: 0.97 }}
                          className={`text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex gap-3 items-start ${
                            answered && k === q.answer ? 'bg-brand-green/15 border-brand-green text-brand-green' :
                            answered && feedback && !feedback.correct && k !== q.answer ? 'opacity-40 border-white/10 bg-bg-elevated' :
                            'bg-bg-elevated border-white/10 hover:border-brand-purple/50 disabled:cursor-default'
                          }`}>
                          <span className="font-mono text-xs text-white/30 mt-0.5 shrink-0">{k}</span>
                          <span>{q.options[k]}</span>
                        </motion.button>
                      ))}
                    </div>
                    <AnimatePresence>
                      {feedback && (
                        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className={`mt-4 p-3 rounded-xl text-sm font-medium ${feedback.correct ? 'bg-brand-green/10 border border-brand-green/25 text-brand-green' : 'bg-brand-red/10 border border-brand-red/20 text-brand-red'}`}>
                          {feedback.correct ? '✅' : '❌'} {feedback.text}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                  <div className="flex items-center justify-between">
                    <Badge variant="orange">⚡ My Points: {myScore}</Badge>
                    <span className="text-xs text-white/30">Subject: {subject}</span>
                  </div>
                </div>

                {/* GAME VISUALIZATION */}
                <div className="lg:col-span-2">
                  {gameType === 'summit' && <SummitGame players={totalPlayers} myScore={myScore} />}
                  {gameType === 'tugofwar' && <TugOfWarGame myScore={myScore} botScore={Math.max(...botScores)} />}
                  {gameType === 'surfer' && <SurferGame players={totalPlayers} myScore={myScore} />}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── GAME OVER ── */}
          {phase === 'over' && (
            <motion.div key="over" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }} className="text-center max-w-md mx-auto">
              <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', delay:0.2 }} className="text-7xl mb-4">👑</motion.div>
              <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Winner</div>
              <div className="font-sora font-extrabold text-3xl text-brand-yellow mb-1">{winner}</div>

              <div className="flex items-end justify-center gap-4 my-8">
                {sorted.slice(0,3).map((p,i) => {
                  const heights = [60, 80, 44]
                  const order = [1, 0, 2]
                  const colors = ['bg-white/10','bg-brand-yellow/20','bg-white/5']
                  const rankColors = ['text-white/60','text-brand-yellow','text-amber-600']
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div className="text-2xl mb-1">{p.avatar}</div>
                      <div className="text-xs font-bold mb-2 max-w-[70px] truncate">{p.name}</div>
                      <div className={`w-20 rounded-t-xl flex items-center justify-center font-sora font-extrabold text-xl ${colors[order[i]]} ${rankColors[order[i]]}`} style={{ height: heights[order[i]] }}>
                        {order[i]+1}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-2 mb-8">
                {sorted.map((p,i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2 bg-bg-elevated rounded-xl border border-white/8">
                    <span className="text-sm font-bold text-white/30">#{i+1}</span>
                    <span className="text-lg">{p.avatar}</span>
                    <span className="flex-1 text-sm font-semibold">{p.name}</span>
                    <span className="text-sm font-bold text-brand-yellow">{p.score} pts</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="primary" onClick={() => { setPhase('select'); setMyScore(0); setBotScores([0,0,0]) }}>⚔️ Play Again</Button>
                <Button variant="ghost" onClick={() => { /* router.push('/dashboard') */ setPhase('select') }}>🏠 Dashboard</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

/* ════════════════════════════════════
   MINI GAME 1: SUMMIT RUSH
   (Canvas-based climbing race)
   ════════════════════════════════════ */
function SummitGame({ players, myScore }: { players: {name:string;score:number;avatar:string}[]; myScore: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const maxScore = 200

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio
    const H = canvas.height = 320 * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    const w = canvas.offsetWidth, h = 320

    ctx.clearRect(0,0,w,h)

    // SKY gradient
    const sky = ctx.createLinearGradient(0,0,0,h)
    sky.addColorStop(0,'#050010'); sky.addColorStop(1,'#0a0a1a')
    ctx.fillStyle = sky; ctx.fillRect(0,0,w,h)

    // Stars
    for(let i=0;i<60;i++){
      ctx.fillStyle=`rgba(255,255,255,${0.2+Math.random()*0.5})`
      ctx.beginPath(); ctx.arc(Math.random()*w,Math.random()*h*0.7,Math.random()*1.2,0,Math.PI*2); ctx.fill()
    }

    // Mountain
    ctx.fillStyle='rgba(0,214,143,0.05)'
    ctx.beginPath(); ctx.moveTo(w/2,20); ctx.lineTo(0,h); ctx.lineTo(w,h); ctx.closePath(); ctx.fill()
    ctx.strokeStyle='rgba(0,214,143,0.15)'; ctx.lineWidth=1; ctx.stroke()

    // Dashed path
    ctx.setLineDash([4,4]); ctx.strokeStyle='rgba(0,214,143,0.12)'; ctx.lineWidth=1
    ctx.beginPath(); ctx.moveTo(w/2,24); ctx.lineTo(w/2,h); ctx.stroke()
    ctx.setLineDash([])

    // Peak flag
    ctx.font='18px serif'; ctx.textAlign='center'; ctx.fillText('🏆',w/2,24)

    // Climbers
    const positions = [0.18, 0.38, 0.58, 0.76]
    players.forEach((p, i) => {
      const x = w * positions[i]
      const pct = Math.min(p.score / maxScore, 1)
      const y = h - 30 - pct * (h - 80)
      ctx.font='22px serif'; ctx.textAlign='center'; ctx.fillText(p.avatar, x, y)
      ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.beginPath()
      ctx.roundRect(x-22,y+4,44,14,3); ctx.fill()
      ctx.fillStyle=i===0?'#7C3AED':'rgba(255,255,255,0.7)'
      ctx.font='bold 8px DM Sans'; ctx.textAlign='center'; ctx.fillText(p.name.slice(0,8),x,y+14)
    })
  }, [players, myScore])

  return (
    <div className="bg-bg-elevated border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-3 py-2 border-b border-white/8 text-xs font-bold text-white/40">🏔️ Summit Rush — Live</div>
      <canvas ref={canvasRef} className="w-full" style={{ height: 320 }} />
      <div className="p-3 space-y-1">
        {[...players].sort((a,b)=>b.score-a.score).map((p,i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="text-white/30 font-bold w-4">#{i+1}</span>
            <span>{p.avatar}</span>
            <span className={`flex-1 font-semibold ${i===0?'text-brand-yellow':'text-white/60'}`}>{p.name}</span>
            <span className="font-bold text-brand-orange">{p.score}⚡</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   MINI GAME 2: TUG OF WAR
   ════════════════════════════════════ */
function TugOfWarGame({ myScore, botScore }: { myScore: number; botScore: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const total = myScore + botScore || 1
  const myPct = myScore / total

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio
    const H = canvas.height = 200 * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    const w = canvas.offsetWidth, h = 200

    ctx.clearRect(0,0,w,h)
    const bg = ctx.createLinearGradient(0,0,0,h)
    bg.addColorStop(0,'#0a0a15'); bg.addColorStop(1,'#050510')
    ctx.fillStyle=bg; ctx.fillRect(0,0,w,h)

    // Ground
    ctx.fillStyle='rgba(255,255,255,0.04)'; ctx.fillRect(0,h-30,w,30)
    ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=1
    ctx.beginPath(); ctx.moveTo(0,h-30); ctx.lineTo(w,h-30); ctx.stroke()

    // Center line
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.setLineDash([4,3])
    ctx.beginPath(); ctx.moveTo(w/2,0); ctx.lineTo(w/2,h-30); ctx.stroke()
    ctx.setLineDash([])

    // Rope
    const ropeY = h/2 - 10
    const anchorX = w/2 + (myPct - 0.5) * (w * 0.5)
    const ropeGrad = ctx.createLinearGradient(0,0,w,0)
    ropeGrad.addColorStop(0,'#7C3AED'); ropeGrad.addColorStop(0.5,'#c0c0c0'); ropeGrad.addColorStop(1,'#FF4757')
    ctx.strokeStyle=ropeGrad; ctx.lineWidth=6; ctx.lineCap='round'
    // Wavy rope
    ctx.beginPath(); ctx.moveTo(20,ropeY)
    for(let x=20;x<w-20;x+=8){
      const wave = Math.sin((x/w)*Math.PI*6 + Date.now()/200)*3
      ctx.lineTo(x,ropeY+wave)
    }
    ctx.stroke()

    // Center knot
    ctx.fillStyle='#F5C542'
    ctx.beginPath(); ctx.arc(anchorX,ropeY,8,0,Math.PI*2); ctx.fill()
    ctx.fillStyle='rgba(245,197,66,0.3)'
    ctx.beginPath(); ctx.arc(anchorX,ropeY,14,0,Math.PI*2); ctx.fill()

    // Team labels
    ctx.fillStyle='rgba(124,58,237,0.8)'; ctx.fillRect(2,ropeY-26,70,22); ctx.beginPath()
    ctx.fillStyle='white'; ctx.font='bold 10px DM Sans'; ctx.textAlign='left'; ctx.fillText('🫵 YOUR TEAM',6,ropeY-11)
    ctx.fillStyle='rgba(255,71,87,0.8)'; ctx.fillRect(w-72,ropeY-26,70,22)
    ctx.fillStyle='white'; ctx.font='bold 10px DM Sans'; ctx.textAlign='right'; ctx.fillText('BOTS 🤖',w-6,ropeY-11)

    // Pullers (stick figures simplified as emoji)
    const blueX = Math.max(30, anchorX - 40)
    const redX = Math.min(w-30, anchorX + 40)
    ctx.font='28px serif'; ctx.textAlign='center'
    ctx.fillText('🧑',blueX,ropeY+10)
    ctx.fillText('🤖',redX,ropeY+10)

    // Score bars
    ctx.fillStyle='rgba(124,58,237,0.25)'; ctx.fillRect(2,h-28,myPct*(w-4),24)
    ctx.fillStyle='rgba(255,71,87,0.25)'; ctx.fillRect(2+myPct*(w-4),h-28,(1-myPct)*(w-4),24)
    ctx.fillStyle='white'; ctx.font='bold 11px DM Sans'
    ctx.textAlign='left'; ctx.fillText(`${myScore} pts`,8,h-12)
    ctx.textAlign='right'; ctx.fillText(`${botScore} pts`,w-8,h-12)
  })

  return (
    <div className="bg-bg-elevated border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-3 py-2 border-b border-white/8 text-xs font-bold text-white/40">🪢 Tug of War — Live</div>
      <canvas ref={canvasRef} className="w-full" style={{ height: 200 }} />
      <div className="p-3 grid grid-cols-2 gap-2 text-center text-xs">
        <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-xl p-2">
          <div className="font-bold text-brand-purple">Your Team</div>
          <div className="font-sora font-extrabold text-lg text-white">{myScore}</div>
        </div>
        <div className="bg-brand-red/10 border border-brand-red/20 rounded-xl p-2">
          <div className="font-bold text-brand-red">Bots</div>
          <div className="font-sora font-extrabold text-lg text-white">{botScore}</div>
        </div>
      </div>
      <div className="px-3 pb-3 text-center text-xs text-white/30">
        {myScore > botScore ? '🔵 You\'re winning! Keep going!' : myScore === botScore ? '⚖️ Dead even!' : '🔴 Bots are ahead! Answer correctly!'}
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   MINI GAME 3: WAVE SURFER
   ════════════════════════════════════ */
function SurferGame({ players, myScore }: { players: {name:string;score:number;avatar:string}[]; myScore: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)
  const animRef = useRef<number>()
  const maxScore = 200

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    function draw() {
      const W = canvas.offsetWidth, H = 260
      canvas.width = W * window.devicePixelRatio
      canvas.height = H * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      frameRef.current++
      const t = frameRef.current / 60

      ctx.clearRect(0,0,W,H)
      const bg = ctx.createLinearGradient(0,0,0,H)
      bg.addColorStop(0,'#001020'); bg.addColorStop(1,'#001832')
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)

      // Ocean layers
      for(let layer=0;layer<3;layer++){
        const waveY = H*0.45 + layer*25
        const amp = 12-layer*3, freq = 0.02-layer*0.004, speed = 1-layer*0.2
        ctx.beginPath(); ctx.moveTo(0,waveY)
        for(let x=0;x<=W;x+=4){
          const y = waveY + Math.sin(x*freq + t*speed*2)*amp + Math.sin(x*0.008+t*0.5)*6
          ctx.lineTo(x,y)
        }
        ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath()
        ctx.fillStyle=`rgba(0,${80+layer*20},${160-layer*20},${0.6-layer*0.15})`;ctx.fill()
      }

      // Sun/moon reflection
      const refGrad = ctx.createLinearGradient(W*0.3,0,W*0.7,H*0.5)
      refGrad.addColorStop(0,'rgba(245,197,66,0.08)'); refGrad.addColorStop(1,'transparent')
      ctx.fillStyle=refGrad; ctx.fillRect(0,0,W,H)

      // Surfers
      const positions = [0.15, 0.38, 0.62, 0.85]
      players.forEach((p,i) => {
        const x = W * positions[i]
        const pct = Math.min(p.score/maxScore,1)
        const waveTop = H*0.45 + Math.sin(x*0.02+t*2)*12
        const surfY = waveTop - 20 - pct*40 + Math.sin(t*2+i)*4
        ctx.font='20px serif'; ctx.textAlign='center'; ctx.fillText(p.avatar,x,surfY)
        // Speed trail
        if(p.score > 0){
          ctx.strokeStyle=i===0?'rgba(124,58,237,0.6)':'rgba(255,255,255,0.2)'
          ctx.lineWidth=2; ctx.setLineDash([3,4])
          ctx.beginPath(); ctx.moveTo(x-5,surfY+5); ctx.lineTo(x-25,surfY+8+Math.random()*3); ctx.stroke()
          ctx.setLineDash([])
        }
        // Name tag
        ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.beginPath()
        ctx.roundRect(x-20,surfY+8,40,12,3); ctx.fill()
        ctx.fillStyle=i===0?'#7C3AED':'rgba(255,255,255,0.7)'
        ctx.font='bold 7px DM Sans'; ctx.textAlign='center'; ctx.fillText(p.name.slice(0,7),x,surfY+17)
      })

      // Shore line
      ctx.fillStyle='rgba(255,200,100,0.15)'
      ctx.fillRect(0,H-15,W,15)

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if(animRef.current) cancelAnimationFrame(animRef.current) }
  }, [players, myScore])

  return (
    <div className="bg-bg-elevated border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-3 py-2 border-b border-white/8 text-xs font-bold text-white/40">🏄 Wave Surfer — Live</div>
      <canvas ref={canvasRef} className="w-full" style={{ height: 260 }} />
      <div className="p-3 space-y-1">
        {[...players].sort((a,b)=>b.score-a.score).slice(0,4).map((p,i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="text-white/30 font-bold w-4">#{i+1}</span>
            <span>{p.avatar}</span>
            <span className="flex-1 font-semibold text-white/60">{p.name}</span>
            <span className="font-bold text-brand-cyan">{p.score}pts</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const FALLBACK: Question[] = [
  { id:'1', question:"What is Newton's Second Law?", options:{A:'F=ma',B:'E=mc²',C:'v=u+at',D:'P=mv'}, answer:'A', explanation:'Force = mass × acceleration', subject:'Physics', difficulty:'intermediate' },
  { id:'2', question:'What is the SI unit of current?', options:{A:'Volt',B:'Watt',C:'Ampere',D:'Ohm'}, answer:'C', explanation:'Ampere is the SI unit of current', subject:'Physics', difficulty:'intermediate' },
  { id:'3', question:'Which is a vector quantity?', options:{A:'Mass',B:'Speed',C:'Temperature',D:'Velocity'}, answer:'D', explanation:'Velocity has direction', subject:'Physics', difficulty:'intermediate' },
  { id:'4', question:'Speed of light in vacuum?', options:{A:'3×10⁶ m/s',B:'3×10⁸ m/s',C:'3×10¹⁰ m/s',D:'3×10⁴ m/s'}, answer:'B', explanation:'~3×10⁸ m/s', subject:'Physics', difficulty:'intermediate' },
  { id:'5', question:"Newton's 3rd Law:", options:{A:'Every action has equal opposite reaction',B:'F=ma',C:'Inertia',D:'Momentum'}, answer:'A', explanation:'Action-reaction pairs', subject:'Physics', difficulty:'intermediate' },
]
