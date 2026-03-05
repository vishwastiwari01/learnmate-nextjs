'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { useUserStore } from '@/store/useUserStore'
import { Nav } from '@/components/layout/Nav'
import { Badge } from '@/components/ui/Badge'
import {
  SendHorizontal, Mic, MicOff, Zap, RotateCcw,
  Paperclip, Image as ImageIcon, X, Volume2, VolumeX,
  ChevronDown, Plus
} from 'lucide-react'
import type { Question } from '@/types'

interface Msg {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  attachments?: { type: 'text' | 'image'; name: string; content: string }[]
  visualUrl?: string
  isQuiz?: boolean
  quizQuestions?: Question[]
}

interface Conversation { id: string; title: string; messages: Msg[] }

const FREE_MODELS = [
  { id: 'meta-llama/llama-3.1-8b-instruct',        label: 'Llama 3.1 8B',  tag: 'Fast'   },
  { id: 'meta-llama/llama-3.3-70b-instruct',       label: 'Llama 3.3 70B', tag: 'Smart'  },
  { id: 'deepseek/deepseek-chat-v3-0324:free',     label: 'DeepSeek V3',   tag: 'Best'   },
  { id: 'google/gemma-3-27b-it',                   label: 'Gemma 3 27B',   tag: 'Google' },
  { id: 'mistralai/mistral-7b-instruct',           label: 'Mistral 7B',    tag: 'Tiny'   },
  { id: 'qwen/qwen3-8b:free',                      label: 'Qwen3 8B',      tag: 'New'    },
]

const SUGGESTIONS = [
  '🌌 Why does the sky look blue?',
  '⚡ Explain Newton\'s 3rd Law',
  '🤖 How does machine learning work?',
  '🧬 What is DNA replication?',
  '📊 Explain derivatives in calculus',
  '💻 What is recursion?',
  '🌊 How do waves work?',
  '🧪 How does photosynthesis work?',
]

function genId() { return Math.random().toString(36).substr(2,9) }

function md(text: string): string {
  return text
    .replace(/```(\w*)\n?([\s\S]*?)```/g,'<pre class="bg-[#0D1117] rounded-xl p-3 my-2 overflow-x-auto text-xs font-mono text-[#C9D1D9] leading-relaxed"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g,'<code class="bg-white/10 rounded px-1 py-0.5 text-xs font-mono text-brand-cyan">$1</code>')
    .replace(/\*\*(.*?)\*\*/g,'<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g,'<em>$1</em>')
    .replace(/^#{1,3} (.+)$/gm,'<div class="font-sora font-bold text-base mt-3 mb-1 text-white">$1</div>')
    .replace(/^• (.+)$/gm,'<div class="flex gap-2 my-1 text-white/80"><span class="text-brand-cyan shrink-0">•</span><span>$1</span></div>')
    .replace(/\n\n/g,'<div class="my-2"></div>')
    .replace(/\n/g,'<br/>')
}

export default function LearnPage() {
  const { profile } = useAuthStore()
  const { apiKey, aiModel, setAIModel } = useUserStore()
  const [convos, setConvos] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string|null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [atts, setAtts] = useState<{type:'text'|'image';name:string;content:string}[]>([])
  const [showModels, setShowModels] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, (string|null)[]>>({})
  const [quizDone, setQuizDone] = useState<Record<string,boolean>>({})
  const [quizIdx, setQuizIdx] = useState<Record<string,number>>({})
  const chatEndRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLInputElement>(null)
  const recRef = useRef<any>(null)

  const active = convos.find(c=>c.id===activeId)
  const msgs = active?.messages || []
  const selectedModel = FREE_MODELS.find(m=>m.id===aiModel) || FREE_MODELS[0]

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:'smooth'}) },[msgs,loading])

  function newChat() {
    const id = genId()
    setConvos(p=>[{id,title:'New Chat',messages:[]}, ...p])
    setActiveId(id)
    setInput(''); setAtts([])
  }

  useEffect(()=>{ if(convos.length===0) newChat() },[])

  function addMsg(msg: Msg) {
    setConvos(prev=>prev.map(c=>{
      if(c.id!==activeId) return c
      const messages=[...c.messages,msg]
      const title = c.title==='New Chat' && msg.role==='user' ? msg.content.slice(0,40)+'…' : c.title
      return {...c,messages,title}
    }))
  }

  async function send(text?: string) {
    const msg=(text||input).trim()
    if((!msg&&atts.length===0)||loading) return
    if(!activeId) return
    setInput(''); if(taRef.current) taRef.current.style.height='auto'

    const userMsg:Msg={id:genId(),role:'user',content:msg,timestamp:Date.now(),
      attachments:atts.length?[...atts]:undefined}
    addMsg(userMsg); setAtts([]); setLoading(true)

    let fullContent=msg
    if(atts.length) {
      const txtAtts=atts.filter(a=>a.type==='text')
      if(txtAtts.length) fullContent+='\n\n[User uploaded notes/content:]\n'+txtAtts.map(a=>`--- ${a.name} ---\n${a.content}`).join('\n\n')
    }

    const history=(active?.messages||[]).slice(-12).map(m=>({role:m.role,content:m.content}))
    history.push({role:'user',content:fullContent})

    try {
      const r=await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({messages:history,subject:'anything',mode:'chat',
          userContext:profile?`${profile.studying_what}, interests: ${profile.interests.join(', ')}`:'',
          model:aiModel})})
      const data=await r.json()
      addMsg({id:genId(),role:'assistant',content:data.content||'⚠️ '+(data.error||'Error. Check API key ⚙️'),timestamp:Date.now()})
    } catch {
      addMsg({id:genId(),role:'assistant',content:'❌ Connection error. Check OpenRouter key in Settings ⚙️',timestamp:Date.now()})
    }
    setLoading(false)
  }

  async function genQuiz() {
    if(loading||!activeId) return
    setLoading(true)
    const topic=msgs.slice(-4).map(m=>m.content).join(' ').slice(0,200)||'general knowledge'
    try {
      const r=await fetch('/api/quiz/generate',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({subject:topic,difficulty:'intermediate',count:5})})
      const data=await r.json()
      if(data.questions?.length) {
        const qid=genId()
        addMsg({id:qid,role:'assistant',content:'🎯 Quiz time! Answer all 5 questions — I\'ll give you your score and feedback at the end.',
          timestamp:Date.now(),isQuiz:true,quizQuestions:data.questions})
        setQuizAnswers(p=>({...p,[qid]:new Array(data.questions.length).fill(null)}))
        setQuizIdx(p=>({...p,[qid]:0}))
      }
    } catch {}
    setLoading(false)
  }

  async function genVisualize(prompt: string) {
    if(loading||!activeId) return
    setLoading(true)
    try {
      const r=await fetch('/api/ai/visualize',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({prompt,style:'educational diagram'})})
      const data=await r.json()
      if(data.imageUrl) addMsg({id:genId(),role:'assistant',
        content:`🎨 Visual: **${prompt.slice(0,60)}**`,timestamp:Date.now(),visualUrl:data.imageUrl})
    } catch {}
    setLoading(false)
  }

  function toggleVoice() {
    if(isListening){ recRef.current?.stop(); setIsListening(false); return }
    const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition
    if(!SR){ alert('Use Chrome for voice input'); return }
    const r=new SR(); r.continuous=false; r.interimResults=true; r.lang='en-IN'
    r.onresult=(e:any)=>setInput(Array.from(e.results).map((r:any)=>r[0].transcript).join(''))
    r.onend=()=>setIsListening(false)
    r.start(); recRef.current=r; setIsListening(true)
  }

  function speakMsg(text: string) {
    if(isSpeaking){ window.speechSynthesis.cancel(); setIsSpeaking(false); return }
    const clean=text.replace(/<[^>]+>/g,'').replace(/[*#`]/g,'').slice(0,600)
    const u=new SpeechSynthesisUtterance(clean); u.rate=0.9; u.lang='en-IN'
    u.onend=()=>setIsSpeaking(false); window.speechSynthesis.speak(u); setIsSpeaking(true)
  }

  function handleFile(e:React.ChangeEvent<HTMLInputElement>) {
    const f=e.target.files?.[0]; if(!f) return
    new FileReader().onload=ev=>setAtts(p=>[...p,{type:'text',name:f.name,content:(ev.target?.result as string).slice(0,8000)}])
    const r=new FileReader(); r.onload=ev=>setAtts(p=>[...p,{type:'text',name:f.name,content:(ev.target?.result as string).slice(0,8000)}]); r.readAsText(f); e.target.value=''
  }

  function handleImg(e:React.ChangeEvent<HTMLInputElement>) {
    const f=e.target.files?.[0]; if(!f) return
    const r=new FileReader(); r.onload=ev=>{
      setAtts(p=>[...p,{type:'image',name:f.name,content:ev.target?.result as string}])
      setInput(v=>v||'Explain this image and teach me about it')
    }; r.readAsDataURL(f); e.target.value=''
  }

  function handlePaste(e:React.ClipboardEvent) {
    const img=Array.from(e.clipboardData.items).find(i=>i.type.startsWith('image/'))
    if(img){ e.preventDefault(); const b=img.getAsFile(); if(!b) return
      const r=new FileReader(); r.onload=ev=>{
        setAtts(p=>[...p,{type:'image',name:'pasted.png',content:ev.target?.result as string}])
        setInput(v=>v||'Explain this image and teach me about it')
      }; r.readAsDataURL(b) }
  }

  function answerQuiz(msgId:string,qIdx:number,choice:string,qs:Question[]) {
    const prev=quizAnswers[msgId]||new Array(qs.length).fill(null)
    const next=[...prev]; next[qIdx]=choice
    setQuizAnswers(p=>({...p,[msgId]:next}))
    if(next[qIdx+1]===undefined||qIdx===qs.length-1) {
      if(next.every(a=>a!==null)) {
        const score=next.filter((a,i)=>a===qs[i].answer).length
        setQuizDone(p=>({...p,[msgId]:true}))
        const wrong=qs.map((q,i)=>({q,chosen:next[i],correct:q.answer})).filter(x=>x.chosen!==x.correct)
        setTimeout(()=>{
          const lines=[
            `🎯 Quiz complete! You scored **${score}/${qs.length}** (${Math.round(score/qs.length*100)}%)`,
            score===qs.length?'\n\n🏆 **Perfect score! Incredible work!**':
            score>=qs.length*0.7?'\n\n👏 **Great job!** Here\'s what to review:':
            '\n\n📚 **Keep practicing!** Focus on these:',
            ...wrong.map(w=>`\n• ~~Your answer: ${w.chosen}~~ → **Correct: ${w.correct}** — ${w.q.explanation}`),
            `\n\n💡 **Tip:** ${wrong.length===0?'You\'ve mastered this! Try asking me harder questions.':
              `Understanding *why* ${wrong.length} answer${wrong.length>1?'s were':'was'} wrong is more important than the score. Want me to explain any of them?`}`
          ]
          addMsg({id:genId(),role:'assistant',content:lines.join(''),timestamp:Date.now()})
        },400)
      }
    } else {
      setTimeout(()=>setQuizIdx(p=>({...p,[msgId]:(p[msgId]||0)+1})),800)
    }
  }

  return (
    <AuthGuard>
    <div className="min-h-screen bg-bg-base flex flex-col" style={{height:'100dvh'}}>
      <Nav/>
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <aside className="hidden md:flex flex-col w-52 border-r border-white/[0.07] overflow-y-auto shrink-0">
          <div className="p-3 space-y-1">
            <button onClick={newChat} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-brand-purple/12 border border-brand-purple/25 text-sm font-bold text-violet-300 hover:bg-brand-purple/20 transition-all mb-2">
              <Plus size={14}/> New Chat
            </button>
            {convos.map(c=>(
              <button key={c.id} onClick={()=>setActiveId(c.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all truncate ${c.id===activeId?'bg-brand-purple/20 text-white':'text-white/35 hover:text-white hover:bg-bg-elevated'}`}>
                💬 {c.title}
              </button>
            ))}
          </div>
          <div className="mt-auto p-3 border-t border-white/[0.07] space-y-1">
            <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Quick Actions</div>
            <button onClick={genQuiz} className="w-full flex items-center gap-2 text-xs font-semibold text-white/40 hover:text-brand-yellow px-2 py-1.5 rounded-lg hover:bg-bg-elevated transition-all">
              <Zap size={12}/> Quiz me on this
            </button>
            <button onClick={()=>{const t=msgs.slice(-2).find(m=>m.role==='assistant')?.content.replace(/<[^>]+>/g,'').slice(0,60)||'current topic'; genVisualize(t)}}
              className="w-full flex items-center gap-2 text-xs font-semibold text-white/40 hover:text-brand-cyan px-2 py-1.5 rounded-lg hover:bg-bg-elevated transition-all">
              <ImageIcon size={12}/> Visualize topic
            </button>
            <button onClick={()=>setConvos(p=>p.map(c=>c.id===activeId?{...c,messages:[]}:c))}
              className="w-full flex items-center gap-2 text-xs font-semibold text-white/40 hover:text-brand-red/60 px-2 py-1.5 rounded-lg hover:bg-bg-elevated transition-all">
              <RotateCcw size={12}/> Clear chat
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.07] shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-purple to-brand-cyan flex items-center justify-center text-xs">⚡</div>
              <span className="font-sora font-bold text-sm truncate max-w-[180px]">{active?.title||'AI Tutor'}</span>
              {!apiKey && <Badge variant="orange" className="text-[10px] hidden sm:flex">⚠️ Add API Key</Badge>}
            </div>
            <div className="flex items-center gap-1.5">
              {/* MODEL PICKER */}
              <div className="relative">
                <button onClick={()=>setShowModels(s=>!s)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-bg-elevated border border-white/10 text-xs font-semibold text-white/50 hover:text-white transition-all">
                  <span className="max-w-[72px] truncate">{selectedModel.label}</span>
                  <ChevronDown size={11}/>
                </button>
                <AnimatePresence>
                  {showModels&&(
                    <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}
                      className="absolute right-0 top-full mt-1 bg-bg-elevated border border-white/15 rounded-xl p-1 z-50 w-52 shadow-xl">
                      {FREE_MODELS.map(m=>(
                        <button key={m.id} onClick={()=>{setAIModel(m.id);setShowModels(false)}}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${aiModel===m.id?'bg-brand-purple/20 text-white':'text-white/45 hover:text-white hover:bg-white/5'}`}>
                          <span>{m.label}</span>
                          <Badge variant={m.tag==='Best'?'green':m.tag==='Smart'?'purple':m.tag==='New'?'cyan':'ghost'} className="text-[9px]">{m.tag}</Badge>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button onClick={genQuiz} title="Quiz me" className="p-1.5 rounded-lg text-white/35 hover:text-brand-yellow hover:bg-brand-yellow/10 transition-all"><Zap size={15}/></button>
              <button onClick={()=>{const t=msgs.slice(-2).find(m=>m.role==='assistant')?.content.replace(/<[^>]+>/g,'').slice(0,60)||'topic'; genVisualize(t)}}
                title="Visualize" className="p-1.5 rounded-lg text-white/35 hover:text-brand-cyan hover:bg-brand-cyan/10 transition-all"><ImageIcon size={15}/></button>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {msgs.length===0&&(
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col items-center justify-center min-h-[55vh] text-center px-4">
                <div className="text-5xl mb-4">🧠</div>
                <h2 className="font-sora font-extrabold text-xl mb-2">Ask me anything!</h2>
                <p className="text-white/35 text-sm mb-1 max-w-md">Chat freely · Upload notes or files · Paste images · Ask for diagrams · Get quizzed</p>
                <p className="text-white/20 text-xs mb-6">No subject limits — physics, history, coding, AI, math, anything</p>
                <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                  {SUGGESTIONS.map(s=>(
                    <button key={s} onClick={()=>send(s.slice(2))}
                      className="text-left text-xs font-semibold px-3 py-2.5 rounded-xl border border-white/8 bg-bg-elevated text-white/40 hover:border-brand-purple/35 hover:text-white transition-all">
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {msgs.map(m=>(
              <motion.div key={m.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                className={`flex gap-3 ${m.role==='user'?'flex-row-reverse max-w-[85%] ml-auto':'max-w-[92%]'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5 ${m.role==='user'?'bg-bg-elevated border border-white/15':'bg-gradient-to-br from-brand-purple to-brand-cyan'}`}>
                  {m.role==='user'?(profile?.avatar||'👤'):'⚡'}
                </div>
                <div className="flex-1 min-w-0">
                  {m.attachments?.map((a,i)=>(
                    <div key={i} className="mb-2">
                      {a.type==='image'
                        ?<img src={a.content} alt={a.name} className="max-w-xs rounded-xl border border-white/10 max-h-48 object-cover"/>
                        :<div className="inline-flex items-center gap-2 px-3 py-1.5 bg-bg-elevated border border-white/10 rounded-xl text-xs text-white/50">
                          <Paperclip size={11}/>{a.name}
                        </div>}
                    </div>
                  ))}

                  {!m.isQuiz&&(
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed group relative
                      ${m.role==='user'?'bg-brand-purple text-white rounded-tr-md':'bg-bg-elevated border border-white/8 text-white/85 rounded-tl-md'}`}>
                      {m.role==='assistant'
                        ?<span dangerouslySetInnerHTML={{__html:md(m.content)}}/>
                        :m.content}
                      {m.role==='assistant'&&(
                        <div className="flex gap-1.5 mt-2 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={()=>speakMsg(m.content)} className="flex items-center gap-1 text-[11px] text-white/30 hover:text-brand-cyan transition-colors">
                            {isSpeaking?<VolumeX size={11}/>:<Volume2 size={11}/>} {isSpeaking?'Stop':'Read aloud'}
                          </button>
                          <span className="text-white/15">·</span>
                          <button onClick={()=>genVisualize(m.content.replace(/<[^>]+>/g,'').slice(0,60))} className="flex items-center gap-1 text-[11px] text-white/30 hover:text-brand-purple transition-colors">
                            <ImageIcon size={11}/> Visualize
                          </button>
                          <span className="text-white/15">·</span>
                          <button onClick={()=>navigator.clipboard.writeText(m.content.replace(/<[^>]+>/g,''))} className="text-[11px] text-white/30 hover:text-white transition-colors">Copy</button>
                        </div>
                      )}
                    </div>
                  )}

                  {m.visualUrl&&(
                    <div className="mt-2">
                      <img src={m.visualUrl} alt="visualization" className="rounded-2xl border border-white/10 max-w-full"
                        onError={e=>{(e.target as HTMLImageElement).parentElement!.innerHTML='<div class="text-xs text-white/25 p-2">⚠️ Visualization loading... (free AI image service may be slow)</div>'}}/>
                      <div className="text-[10px] text-white/20 mt-1">🎨 Free AI visualization · Pollinations.ai</div>
                    </div>
                  )}

                  {m.isQuiz&&m.quizQuestions&&(
                    <QuizCard msgId={m.id} qs={m.quizQuestions}
                      answers={quizAnswers[m.id]||new Array(m.quizQuestions.length).fill(null)}
                      done={quizDone[m.id]||false}
                      currentIdx={quizIdx[m.id]||0}
                      onAnswer={(qi,ch)=>answerQuiz(m.id,qi,ch,m.quizQuestions!)}/>
                  )}
                </div>
              </motion.div>
            ))}

            {loading&&(
              <div className="flex gap-3 max-w-[90%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-cyan flex items-center justify-center text-sm shrink-0">⚡</div>
                <div className="px-4 py-3 rounded-2xl bg-bg-elevated border border-white/8 flex items-center gap-1.5">
                  {[0,1,2].map(i=><span key={i} className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}
                </div>
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>

          {/* INPUT BAR */}
          <div className="border-t border-white/[0.07] p-3 pb-20 md:pb-3 shrink-0">
            {atts.length>0&&(
              <div className="flex flex-wrap gap-2 mb-2">
                {atts.map((a,i)=>(
                  <div key={i} className="flex items-center gap-1.5 bg-bg-elevated border border-white/12 rounded-lg px-2 py-1 text-xs">
                    {a.type==='image'?<img src={a.content} className="w-5 h-5 rounded object-cover" alt=""/>:<Paperclip size={11} className="text-brand-cyan"/>}
                    <span className="text-white/55 max-w-[90px] truncate">{a.name}</span>
                    <button onClick={()=>setAtts(p=>p.filter((_,j)=>j!==i))} className="text-white/25 hover:text-white ml-0.5"><X size={11}/></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 items-end bg-bg-elevated border border-white/10 rounded-2xl px-3 py-2 focus-within:border-brand-purple/40 transition-colors">
              <div className="flex gap-0.5 shrink-0">
                <input ref={fileRef} type="file" accept=".txt,.md,.py,.js,.ts,.csv,.json" onChange={handleFile} className="hidden"/>
                <input ref={imgRef} type="file" accept="image/*" onChange={handleImg} className="hidden"/>
                <button onClick={()=>fileRef.current?.click()} className="p-1.5 text-white/25 hover:text-brand-cyan transition-colors" title="Attach notes/file"><Paperclip size={15}/></button>
                <button onClick={()=>imgRef.current?.click()} className="p-1.5 text-white/25 hover:text-brand-purple transition-colors" title="Attach image"><ImageIcon size={15}/></button>
              </div>
              <textarea ref={taRef} value={input}
                onChange={e=>{setInput(e.target.value);e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,160)+'px'}}
                onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}
                onPaste={handlePaste}
                placeholder="Ask anything · paste notes · upload images · Shift+Enter for new line"
                rows={1} className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none resize-none" style={{maxHeight:160}}/>
              <div className="flex gap-1 shrink-0">
                <button onClick={toggleVoice} title="Voice input"
                  className={`p-1.5 rounded-lg transition-all ${isListening?'text-brand-red bg-brand-red/15 animate-pulse':'text-white/25 hover:text-brand-orange'}`}>
                  {isListening?<MicOff size={15}/>:<Mic size={15}/>}
                </button>
                <button onClick={()=>send()} disabled={loading||(!input.trim()&&atts.length===0)}
                  className="p-1.5 rounded-lg bg-brand-cyan text-black disabled:opacity-30 hover:bg-sky-300 transition-all">
                  <SendHorizontal size={15}/>
                </button>
              </div>
            </div>
            <div className="flex justify-between mt-1 px-1">
              <span className="text-[10px] text-white/18">Paste images · Attach files · Voice · Free AI</span>
              <span className="text-[10px] text-white/18">{selectedModel.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  )
}

function QuizCard({msgId,qs,answers,done,currentIdx,onAnswer}:{
  msgId:string; qs:Question[]; answers:(string|null)[]; done:boolean; currentIdx:number;
  onAnswer:(qi:number,choice:string)=>void
}) {
  const q=qs[currentIdx]
  const curAns=answers[currentIdx]
  const answered=curAns!==null
  const score=answers.filter((a,i)=>a===qs[i]?.answer).length

  if(!q) return null

  return(
    <div className="bg-bg-surface border border-brand-purple/20 rounded-2xl p-4 mt-1.5">
      {!done?(
        <>
          <div className="flex items-center justify-between mb-3">
            <Badge variant="purple">Q{currentIdx+1}/{qs.length}</Badge>
            <div className="flex gap-1">
              {qs.map((_,i)=>(
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${answers[i]===null?'bg-white/12':answers[i]===qs[i].answer?'bg-brand-green':'bg-brand-red'}`}/>
              ))}
            </div>
          </div>
          <div className="font-sora font-bold text-sm mb-3 leading-snug">{q.question}</div>
          <div className="space-y-2 mb-2">
            {(['A','B','C','D'] as const).map(k=>{
              const isCorrect=k===q.answer; const isChosen=curAns===k
              return(
                <button key={k} onClick={()=>!answered&&onAnswer(currentIdx,k)} disabled={answered}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-all flex gap-2.5 items-start ${
                    answered&&isCorrect?'bg-brand-green/12 border-brand-green text-brand-green':
                    answered&&isChosen&&!isCorrect?'bg-brand-red/12 border-brand-red text-brand-red':
                    answered?'opacity-35 bg-bg-elevated border-white/6':
                    'bg-bg-elevated border-white/10 hover:border-brand-purple/45 hover:bg-brand-purple/5'}`}>
                  <span className="font-mono text-xs shrink-0 mt-0.5 opacity-40">{k}</span>
                  <span className="flex-1">{q.options[k]}</span>
                  {answered&&isCorrect&&<span className="ml-auto shrink-0">✅</span>}
                  {answered&&isChosen&&!isCorrect&&<span className="ml-auto shrink-0">❌</span>}
                </button>
              )
            })}
          </div>
          {answered&&(
            <div className={`text-xs px-3 py-2 rounded-xl ${curAns===q.answer?'bg-brand-green/8 text-brand-green border border-brand-green/15':'bg-brand-red/8 text-brand-red/75 border border-brand-red/12'}`}>
              {curAns===q.answer?'✅ Correct! ':'❌ Wrong. '}{q.explanation}
            </div>
          )}
        </>
      ):(
        <div className="text-center py-3">
          <div className="text-4xl mb-2">{score===qs.length?'🏆':score>=qs.length*0.7?'🌟':'📚'}</div>
          <div className="font-sora font-extrabold text-2xl text-brand-yellow mb-1">{score}/{qs.length}</div>
          <div className="text-sm text-white/45 mb-4">{Math.round(score/qs.length*100)}% · {score===qs.length?'Perfect!':score>=qs.length*0.7?'Great job!':'Keep going!'}</div>
          <div className="space-y-1 text-left">
            {qs.map((q,i)=>(
              <div key={i} className={`flex items-start gap-2 text-xs px-2 py-1.5 rounded-lg ${answers[i]===q.answer?'text-brand-green/80':'text-brand-red/60'}`}>
                <span className="shrink-0 mt-0.5">{answers[i]===q.answer?'✅':'❌'}</span>
                <span className="line-clamp-2">{q.question.slice(0,70)}{q.question.length>70?'…':''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
