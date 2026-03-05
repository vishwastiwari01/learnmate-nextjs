'use client'
import { useState, useRef } from 'react'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { Nav } from '@/components/layout/Nav'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Play, Lightbulb, RotateCcw, ChevronRight, ChevronDown, Lock, CheckCircle2 } from 'lucide-react'

type Level = 'blocks' | 'fill' | 'real'
type Lang = 'python' | 'javascript' | 'c' | 'cpp' | 'java'

// ── LANGUAGES ──────────────────────────────────────────
const LANGUAGES: { id: Lang; name: string; emoji: string; color: string }[] = [
  { id: 'python',     name: 'Python',     emoji: '🐍', color: '#3776AB' },
  { id: 'javascript', name: 'JavaScript', emoji: '⚡', color: '#F7DF1E' },
  { id: 'java',       name: 'Java',       emoji: '☕', color: '#ED8B00' },
  { id: 'c',          name: 'C',          emoji: '🔵', color: '#555555' },
  { id: 'cpp',        name: 'C++',        emoji: '🟦', color: '#00599C' },
]

// ── TOPICS per language ────────────────────────────────
const TOPICS: Record<Lang, { id: string; label: string; emoji: string }[]> = {
  python: [
    { id: 'basics',     label: 'Basics & Print',    emoji: '📝' },
    { id: 'variables',  label: 'Variables & Types',  emoji: '📦' },
    { id: 'loops',      label: 'Loops',              emoji: '🔁' },
    { id: 'functions',  label: 'Functions',          emoji: '⚙️' },
    { id: 'lists',      label: 'Lists & Arrays',     emoji: '📋' },
    { id: 'dicts',      label: 'Dictionaries',       emoji: '📚' },
    { id: 'oop',        label: 'OOP & Classes',      emoji: '🏗️' },
    { id: 'libraries',  label: 'Libraries (numpy etc)', emoji: '📦' },
  ],
  javascript: [
    { id: 'basics',     label: 'Variables & Output', emoji: '📝' },
    { id: 'loops',      label: 'Loops',              emoji: '🔁' },
    { id: 'functions',  label: 'Functions & Arrow',  emoji: '⚙️' },
    { id: 'arrays',     label: 'Arrays & Methods',   emoji: '📋' },
    { id: 'dom',        label: 'DOM Manipulation',   emoji: '🌐' },
    { id: 'async',      label: 'Async / Promises',   emoji: '⏳' },
  ],
  java: [
    { id: 'basics',     label: 'Hello World & I/O',  emoji: '📝' },
    { id: 'variables',  label: 'Variables & Types',  emoji: '📦' },
    { id: 'loops',      label: 'Loops',              emoji: '🔁' },
    { id: 'methods',    label: 'Methods',            emoji: '⚙️' },
    { id: 'oop',        label: 'Classes & Objects',  emoji: '🏗️' },
  ],
  c: [
    { id: 'basics',     label: 'Hello World',        emoji: '📝' },
    { id: 'variables',  label: 'Variables & Types',  emoji: '📦' },
    { id: 'loops',      label: 'Loops',              emoji: '🔁' },
    { id: 'functions',  label: 'Functions',          emoji: '⚙️' },
    { id: 'pointers',   label: 'Pointers',           emoji: '👆' },
  ],
  cpp: [
    { id: 'basics',     label: 'Hello World',        emoji: '📝' },
    { id: 'loops',      label: 'Loops',              emoji: '🔁' },
    { id: 'functions',  label: 'Functions',          emoji: '⚙️' },
    { id: 'oop',        label: 'Classes & OOP',      emoji: '🏗️' },
    { id: 'stl',        label: 'STL Containers',     emoji: '📦' },
  ],
}

// ── CHALLENGES ─────────────────────────────────────────
interface Challenge {
  id: string; title: string; desc: string; xp: number; difficulty: 'easy'|'medium'|'hard'
  level: Level
  // blocks
  blocks?: { id: string; color: string; text: string; type: string }[]
  solution_blocks?: string[]
  // fill
  template?: string; blanks?: string[]
  // real
  starter?: string; checkFn?: (code: string) => boolean; expected?: string
  hint: string
}

const CHALLENGES: Record<Lang, Record<string, Challenge[]>> = {
  python: {
    basics: [
      { id:'py-b1', title:'Your First Print', desc:'Make Python print "Hello, LearnMate!" to the screen.',
        xp:40, difficulty:'easy', level:'blocks',
        blocks:[
          {id:'print',color:'#7C3AED',text:'print()',type:'fn'},
          {id:'str',color:'#00D68F',text:'"Hello, LearnMate!"',type:'val'},
        ],
        solution_blocks:['print','str'],
        hint:'The print function outputs text. Put the string inside the parentheses.' },
      { id:'py-b2', title:'Repeat a Message', desc:'Print "Python is fun!" exactly 3 times using a loop.',
        xp:60, difficulty:'easy', level:'fill',
        template:'for i in range(___):\n    print(___)',
        blanks:['3','"Python is fun!"'],
        hint:'range(n) generates numbers from 0 to n-1. The print goes inside the loop.' },
      { id:'py-b3', title:'Sum Calculator', desc:'Write a function add(a, b) that returns the sum of two numbers.',
        xp:80, difficulty:'easy', level:'real',
        starter:'def add(a, b):\n    # Return the sum\n    pass\n\nprint(add(3, 5))  # Should print 8\nprint(add(10, 20)) # Should print 30',
        checkFn:(c)=>c.includes('return') && (c.includes('a + b') || c.includes('a+b')),
        expected:'8\n30',
        hint:'Use the return statement. The result is a + b.' },
    ],
    loops: [
      { id:'py-l1', title:'Count to 10', desc:'Use a for loop to print numbers 1 to 10.',
        xp:50, difficulty:'easy', level:'fill',
        template:'for i in range(___, ___):\n    print(___)',
        blanks:['1','11','i'],
        hint:'range(start, stop) goes from start up to (but not including) stop.' },
      { id:'py-l2', title:'FizzBuzz Classic', desc:'Print 1-20. For multiples of 3 print "Fizz", multiples of 5 print "Buzz", both print "FizzBuzz".',
        xp:100, difficulty:'medium', level:'real',
        starter:'for i in range(1, 21):\n    # Your logic here\n    pass',
        checkFn:(c)=>c.includes('FizzBuzz')&&c.includes('Fizz')&&c.includes('Buzz')&&c.includes('%'),
        expected:'1 2 Fizz 4 Buzz...',
        hint:'Check divisible by 15 (both 3 and 5) FIRST, then check 3, then 5, then else.' },
      { id:'py-l3', title:'Sum of List', desc:'Write code to find the sum of all numbers in: nums = [4, 7, 2, 9, 1, 5, 8]',
        xp:80, difficulty:'easy', level:'real',
        starter:'nums = [4, 7, 2, 9, 1, 5, 8]\ntotal = 0\n# Add each number to total\n\nprint(total)  # Should print 36',
        checkFn:(c)=>c.includes('36')||(c.includes('for')&&c.includes('total')),
        expected:'36',
        hint:'Loop through nums and add each item to total. Or use the built-in sum() function!' },
    ],
    functions: [
      { id:'py-f1', title:'Factorial Function', desc:'Write a function factorial(n) that returns n! (n factorial). factorial(5) should return 120.',
        xp:120, difficulty:'medium', level:'real',
        starter:'def factorial(n):\n    # Your code here\n    pass\n\nprint(factorial(5))  # 120\nprint(factorial(0))  # 1\nprint(factorial(3))  # 6',
        checkFn:(c)=>c.includes('return')&&(c.includes('factorial(n-1)')||c.includes('range')||c.includes('*=')),
        expected:'120\n1\n6',
        hint:'Either use recursion: return n * factorial(n-1), or use a loop with a running product.' },
      { id:'py-f2', title:'Fibonacci', desc:'Write fibonacci(n) returning the nth Fibonacci number. fibonacci(10) = 55.',
        xp:150, difficulty:'hard', level:'real',
        starter:'def fibonacci(n):\n    pass\n\nprint(fibonacci(10))  # 55\nprint(fibonacci(7))   # 13',
        checkFn:(c)=>c.includes('return')&&c.length>50,
        expected:'55\n13',
        hint:'Track two previous values. Start with a=0, b=1, then a,b = b, a+b in a loop.' },
    ],
    lists: [
      { id:'py-li1', title:'List Operations', desc:'Complete the code to add 99 to the list, remove 3, then sort it.',
        xp:90, difficulty:'medium', level:'fill',
        template:'nums = [5, 3, 8, 1, 9, 2]\nnums.___(99)\nnums.___(3)\nnums.___()\nprint(nums)',
        blanks:['append','remove','sort'],
        hint:'Lists have append(), remove(), and sort() methods.' },
    ],
    oop: [
      { id:'py-o1', title:'Build a Dog Class', desc:'Create a Dog class with name and breed attributes, and a bark() method that returns "Woof! I am {name}".',
        xp:160, difficulty:'hard', level:'real',
        starter:'class Dog:\n    def __init__(self, name, breed):\n        # Store name and breed\n        pass\n    \n    def bark(self):\n        # Return the bark message\n        pass\n\ndog = Dog("Buddy", "Labrador")\nprint(dog.bark())  # Woof! I am Buddy',
        checkFn:(c)=>c.includes('class Dog')&&c.includes('__init__')&&c.includes('self.name')&&c.includes('def bark'),
        expected:'Woof! I am Buddy',
        hint:'Use self.name = name in __init__. In bark(), return f"Woof! I am {self.name}"' },
    ],
    dicts: [],
    libraries: [],
  },
  javascript: {
    basics: [
      { id:'js-b1', title:'Console Log', desc:'Print "Hello from JavaScript!" to the console.',
        xp:40, difficulty:'easy', level:'fill',
        template:'___.log(___)',
        blanks:['console','"Hello from JavaScript!"'],
        hint:'JavaScript uses console.log() to print output.' },
      { id:'js-b2', title:'Variables', desc:'Declare a let variable called name, assign your name, then log "Hello, {name}!"',
        xp:60, difficulty:'easy', level:'real',
        starter:'// Declare a variable and log a greeting\n',
        checkFn:(c)=>c.includes('let')||c.includes('const'),
        expected:'Hello, [your name]!',
        hint:'Use let name = "your name". Template literals: `Hello, ${name}!`' },
    ],
    loops: [
      { id:'js-l1', title:'For Loop 1–10', desc:'Use a for loop to log numbers 1 to 10.',
        xp:60, difficulty:'easy', level:'fill',
        template:'for (let i = ___; i <= ___; i++) {\n    console.log(i);\n}',
        blanks:['1','10'],
        hint:'Start at 1, loop while i is less than or equal to 10, increment with i++.' },
    ],
    functions: [
      { id:'js-f1', title:'Arrow Function', desc:'Write an arrow function multiply(a, b) that returns a * b.',
        xp:80, difficulty:'easy', level:'real',
        starter:'const multiply = (a, b) => {\n    // return a * b\n};\n\nconsole.log(multiply(4, 5)); // 20',
        checkFn:(c)=>c.includes('return')&&c.includes('*'),
        expected:'20',
        hint:'Arrow functions: const fn = (params) => { return value; }' },
    ],
    arrays: [], dom: [], async: [],
  },
  java: {
    basics: [
      { id:'java-b1', title:'Hello World', desc:'Complete the Java Hello World program.',
        xp:40, difficulty:'easy', level:'fill',
        template:'public class Main {\n    public static void ___(String[] args) {\n        System.out.___(___"Hello, Java!");\n    }\n}',
        blanks:['main','println',''],
        hint:'The main method is the entry point. System.out.println() prints with a newline.' },
    ],
    loops: [
      { id:'java-l1', title:'Print 1 to 5', desc:'Use a for loop to print 1 through 5.',
        xp:60, difficulty:'easy', level:'real',
        starter:'public class Main {\n    public static void main(String[] args) {\n        // for loop here\n    }\n}',
        checkFn:(c)=>c.includes('for')&&c.includes('println'),
        expected:'1\n2\n3\n4\n5',
        hint:'for (int i = 1; i <= 5; i++) { System.out.println(i); }' },
    ],
    variables: [], methods: [], oop: [],
  },
  c: {
    basics: [
      { id:'c-b1', title:'Hello World', desc:'Complete the classic C Hello World.',
        xp:40, difficulty:'easy', level:'fill',
        template:'#include <___>\n\nint main() {\n    ___(___"Hello, World!\\n");\n    return 0;\n}',
        blanks:['stdio.h','printf',''],
        hint:'#include <stdio.h> gives you printf(). Use printf("text\\n") to print.' },
    ],
    loops: [
      { id:'c-l1', title:'Sum 1 to N', desc:'Write a C program to print the sum of 1 to 10.',
        xp:80, difficulty:'medium', level:'real',
        starter:'#include <stdio.h>\n\nint main() {\n    int sum = 0;\n    // for loop to add 1 to 10\n    \n    printf("%d\\n", sum); // Should print 55\n    return 0;\n}',
        checkFn:(c)=>c.includes('for')&&c.includes('sum'),
        expected:'55',
        hint:'for(int i=1; i<=10; i++) { sum += i; }' },
    ],
    variables: [], functions: [], pointers: [],
  },
  cpp: {
    basics: [
      { id:'cpp-b1', title:'Hello World', desc:'Complete the C++ Hello World.',
        xp:40, difficulty:'easy', level:'fill',
        template:'#include <___>\nusing namespace std;\n\nint main() {\n    ___ << "Hello, C++!" << ___;\n    return 0;\n}',
        blanks:['iostream','cout','endl'],
        hint:'#include <iostream> and use cout << "text" << endl;' },
    ],
    loops: [], functions: [], oop: [], stl: [],
  },
}

export default function CodingPage() {
  const { profile } = useAuthStore()
  const [lang, setLang] = useState<Lang>('python')
  const [topic, setTopic] = useState<string>('basics')
  const [level, setLevel] = useState<Level>('blocks')
  const [challengeIdx, setChallengeIdx] = useState(0)
  const [solved, setSolved] = useState<Set<string>>(new Set())
  const [showHint, setShowHint] = useState(false)
  const [aiHint, setAiHint] = useState('')
  const [loadingHint, setLoadingHint] = useState(false)
  const [result, setResult] = useState<{pass:boolean;msg:string}|null>(null)
  const [blockOrder, setBlockOrder] = useState<string[]>([])
  const [fillAnswers, setFillAnswers] = useState<string[]>([])
  const [code, setCode] = useState('')
  const [topicOpen, setTopicOpen] = useState(false)

  const currentLang = LANGUAGES.find(l=>l.id===lang)!
  const topics = TOPICS[lang]
  const challenges = CHALLENGES[lang]?.[topic] || []
  const challenge = challenges[challengeIdx]

  function selectTopic(t: string) {
    setTopic(t); setChallengeIdx(0); setResult(null); setShowHint(false); setAiHint(''); setBlockOrder([]); setFillAnswers([]); setCode(''); setTopicOpen(false)
    const chs = CHALLENGES[lang]?.[t] || []
    if(chs.length>0) { setLevel(chs[0].level); setCode(chs[0].starter||'') }
  }

  function selectChallenge(idx: number) {
    setChallengeIdx(idx); setResult(null); setShowHint(false); setAiHint(''); setBlockOrder([]); setFillAnswers([])
    const ch = challenges[idx]
    if(ch) { setLevel(ch.level); setCode(ch.starter||'') }
  }

  function selectLang(l: Lang) {
    setLang(l); const firstTopic=TOPICS[l][0].id; setTopic(firstTopic)
    setChallengeIdx(0); setResult(null); setCode(''); setBlockOrder([]); setFillAnswers([])
    const chs=CHALLENGES[l]?.[firstTopic]||[]
    if(chs.length>0) { setLevel(chs[0].level); setCode(chs[0].starter||'') }
  }

  function check() {
    if(!challenge) return
    let pass = false
    if(challenge.level==='blocks') {
      pass = JSON.stringify(blockOrder)===JSON.stringify(challenge.solution_blocks)
    } else if(challenge.level==='fill') {
      pass = fillAnswers.every((a,i)=>a.trim()===(challenge.blanks||[])[i])
    } else {
      pass = challenge.checkFn ? challenge.checkFn(code) : code.length > 30
    }
    if(pass) {
      setSolved(s=>new Set([...s,challenge.id]))
      setResult({pass:true,msg:`✅ Correct! +${challenge.xp} XP! ${solved.has(challenge.id)?'(already counted)':''}`})
    } else {
      setResult({pass:false,msg:'❌ Not quite right. Check your code carefully!'})
    }
  }

  async function getAIHint() {
    if(!challenge) return
    setLoadingHint(true); setAiHint('')
    try {
      const r=await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          messages:[{role:'user',content:`Give a 1-2 sentence nudge (NOT the solution) for this coding challenge in ${currentLang.name}: "${challenge.title}" — ${challenge.desc}${challenge.level==='real'?'\n\nStudent code:\n'+code:''}`}],
          subject:`${currentLang.name} programming`, mode:'chat'
        })})
      const data=await r.json()
      setAiHint(data.content||challenge.hint)
    } catch { setAiHint(challenge.hint) }
    setLoadingHint(false)
  }

  const LEVEL_TABS: {key:Level;label:string;emoji:string}[] = [
    {key:'blocks',label:'Block Coding',emoji:'🟩'},
    {key:'fill',  label:'Fill Blanks', emoji:'🟨'},
    {key:'real',  label:'Real Code',   emoji:'🟥'},
  ]

  const topicChallenges = challenges

  return (
    <AuthGuard>
    <div className="min-h-screen bg-bg-base">
      <Nav/>
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8 page-enter">
        <div className="mb-6">
          <h1 className="font-sora font-extrabold text-3xl mb-1">💻 Coding Lab</h1>
          <p className="text-white/40 text-sm">Block coding → fill blanks → real code. Pick your language and topic.</p>
        </div>

        {/* LANGUAGE SELECTOR */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {LANGUAGES.map(l=>(
            <button key={l.id} onClick={()=>selectLang(l.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all ${lang===l.id?'text-white border-transparent':'bg-bg-elevated border-white/10 text-white/50 hover:border-white/25'}`}
              style={lang===l.id?{background:`${l.color}25`,borderColor:`${l.color}60`,color:l.color}:{}}>
              <span>{l.emoji}</span> {l.name}
              <span className="text-[10px] font-bold opacity-50">{Object.values(CHALLENGES[l.id]||{}).flat().filter(c=>solved.has(c.id)).length}/{Object.values(CHALLENGES[l.id]||{}).flat().length}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* TOPIC SIDEBAR */}
          <div className="lg:col-span-1">
            <Card className="p-2">
              <div className="text-[10px] font-bold text-white/25 uppercase tracking-widest px-2 mb-2">{currentLang.emoji} {currentLang.name} Topics</div>
              <div className="space-y-0.5">
                {TOPICS[lang].map(t=>{
                  const chs=CHALLENGES[lang]?.[t.id]||[]
                  const solved_count=chs.filter(c=>solved.has(c.id)).length
                  return(
                    <button key={t.id} onClick={()=>selectTopic(t.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${topic===t.id?'bg-brand-purple/20 text-white border border-brand-purple/30':'text-white/45 hover:text-white hover:bg-bg-elevated'}`}>
                      <span>{t.emoji}</span>
                      <span className="flex-1">{t.label}</span>
                      {chs.length>0&&<span className={`text-[10px] font-bold ${solved_count===chs.length&&chs.length>0?'text-brand-green':'text-white/25'}`}>{solved_count}/{chs.length}</span>}
                      {chs.length===0&&<Lock size={10} className="text-white/15"/>}
                    </button>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-3 space-y-4">
            {topicChallenges.length===0 ? (
              <Card className="text-center py-12">
                <div className="text-4xl mb-3">🚧</div>
                <div className="font-sora font-bold text-lg mb-2">Coming Soon!</div>
                <p className="text-white/40 text-sm">More {currentLang.name} challenges are being added. Try another topic!</p>
              </Card>
            ) : (
              <>
                {/* CHALLENGE LIST */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {topicChallenges.map((ch,i)=>(
                    <button key={ch.id} onClick={()=>selectChallenge(i)}
                      className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${challengeIdx===i?'bg-brand-purple/20 border-brand-purple/40 text-white':'bg-bg-elevated border-white/10 text-white/45 hover:border-white/25'}`}>
                      {solved.has(ch.id)?<CheckCircle2 size={12} className="text-brand-green"/>:<span className={`w-2 h-2 rounded-full ${ch.difficulty==='easy'?'bg-brand-green':ch.difficulty==='medium'?'bg-brand-yellow':'bg-brand-red'}`}/>}
                      {ch.title}
                    </button>
                  ))}
                </div>

                {challenge && (
                  <>
                    {/* LEVEL SELECTOR */}
                    <div className="flex gap-2">
                      {LEVEL_TABS.map(t=>(
                        challenge.level===t.key || (
                          <button key={t.key}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold opacity-30 cursor-not-allowed bg-bg-elevated border-white/8 text-white/30"
                            disabled title="Not available for this challenge">
                            {t.emoji} {t.label}
                          </button>
                        )
                      ))}
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                        challenge.level==='blocks'?'bg-brand-green/15 border-brand-green/40 text-brand-green':
                        challenge.level==='fill'?'bg-brand-yellow/15 border-brand-yellow/35 text-brand-yellow':
                        'bg-brand-red/12 border-brand-red/30 text-brand-red'}`}>
                        {LEVEL_TABS.find(t=>t.key===challenge.level)?.emoji} {LEVEL_TABS.find(t=>t.key===challenge.level)?.label}
                      </div>
                      <Badge variant={challenge.difficulty==='easy'?'green':challenge.difficulty==='medium'?'yellow':'red'} className="ml-auto">{challenge.difficulty}</Badge>
                      <Badge variant="yellow">+{challenge.xp} XP</Badge>
                      {solved.has(challenge.id)&&<Badge variant="green">✓ Solved</Badge>}
                    </div>

                    {/* CHALLENGE PANEL */}
                    <Card>
                      <div className="font-sora font-bold text-base mb-1">{challenge.title}</div>
                      <p className="text-white/50 text-sm leading-relaxed mb-4">{challenge.desc}</p>

                      {/* BLOCK CODING */}
                      {challenge.level==='blocks'&&challenge.blocks&&(
                        <BlockEditor blocks={challenge.blocks} solution={challenge.solution_blocks||[]} blockOrder={blockOrder} setBlockOrder={setBlockOrder}/>
                      )}

                      {/* FILL IN BLANK */}
                      {challenge.level==='fill'&&challenge.template&&(
                        <FillEditor template={challenge.template} blanks={challenge.blanks||[]} answers={fillAnswers} setAnswers={setFillAnswers} lang={lang}/>
                      )}

                      {/* REAL CODE */}
                      {challenge.level==='real'&&(
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-bold text-white/25 uppercase tracking-widest">Your Code ({currentLang.name})</div>
                            {challenge.expected&&<div className="text-xs text-white/30">Expected: <code className="text-brand-cyan">{challenge.expected}</code></div>}
                          </div>
                          <textarea value={code} onChange={e=>setCode(e.target.value)} spellCheck={false}
                            className="w-full bg-[#0D1117] border border-white/10 rounded-xl p-4 font-mono text-sm text-[#C9D1D9] outline-none focus:border-brand-purple/40 resize-none transition-colors leading-relaxed"
                            rows={10}/>
                        </div>
                      )}
                    </Card>

                    {/* CONTROLS */}
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="green" onClick={check}><Play size={14}/> Run & Check</Button>
                      <Button variant="ghost" onClick={()=>{setShowHint(h=>!h);setAiHint('')}}>
                        <Lightbulb size={14}/> {showHint?'Hide':'Hint'}
                      </Button>
                      <Button variant="ghost" onClick={getAIHint} loading={loadingHint}>🤖 AI Hint</Button>
                      <Button variant="ghost" size="sm" onClick={()=>{setResult(null);setBlockOrder([]);setFillAnswers([]);setCode(challenge.starter||'');setShowHint(false);setAiHint('')}}>
                        <RotateCcw size={13}/> Reset
                      </Button>
                    </div>

                    <AnimatePresence>
                      {showHint&&<motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                        className="p-3 bg-brand-yellow/8 border border-brand-yellow/20 rounded-xl text-sm text-brand-yellow">
                        💡 {challenge.hint}
                      </motion.div>}
                      {aiHint&&<motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
                        className="p-3 bg-brand-cyan/8 border border-brand-cyan/18 rounded-xl text-sm text-brand-cyan">
                        🤖 {aiHint}
                      </motion.div>}
                      {result&&<motion.div initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}}
                        className={`p-3 rounded-xl text-sm font-medium ${result.pass?'bg-brand-green/10 border border-brand-green/20 text-brand-green':'bg-brand-red/10 border border-brand-red/18 text-brand-red'}`}>
                        {result.msg}
                        {result.pass&&challengeIdx<topicChallenges.length-1&&(
                          <button onClick={()=>selectChallenge(challengeIdx+1)} className="ml-3 text-xs font-bold underline">Next Challenge →</button>
                        )}
                      </motion.div>}
                    </AnimatePresence>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* PROGRESS */}
        <Card className="mt-6">
          <div className="text-[11px] font-bold text-white/25 uppercase tracking-widest mb-3">Your Progress</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {LANGUAGES.map(l=>{
              const total=Object.values(CHALLENGES[l.id]||{}).flat().length
              const done=Object.values(CHALLENGES[l.id]||{}).flat().filter(c=>solved.has(c.id)).length
              return(
                <div key={l.id} className="text-center">
                  <div className="text-2xl mb-1">{l.emoji}</div>
                  <div className="text-xs font-bold text-white/60">{l.name}</div>
                  <div className={`text-sm font-extrabold ${done===total&&total>0?'text-brand-green':'text-brand-yellow'}`}>{done}/{total}</div>
                  <div className="w-full h-1 bg-white/8 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-brand-purple rounded-full" style={{width:total>0?`${done/total*100}%`:'0%'}}/>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </main>
    </div>
    </AuthGuard>
  )
}

// ── BLOCK EDITOR ───────────────────────────────────────
function BlockEditor({blocks,solution,blockOrder,setBlockOrder}:{
  blocks:{id:string;color:string;text:string;type:string}[];
  solution:string[]; blockOrder:string[]; setBlockOrder:(o:string[])=>void
}) {
  const [available,setAvailable]=useState(blocks.map(b=>b.id))
  function addBlock(id:string){ if(blockOrder.includes(id)) return; setBlockOrder([...blockOrder,id]); setAvailable(a=>a.filter(x=>x!==id)) }
  function removeBlock(id:string){ setBlockOrder(blockOrder.filter(x=>x!==id)); setAvailable(a=>[...a,id]) }
  const getB=(id:string)=>blocks.find(b=>b.id===id)!
  return(
    <div className="space-y-4">
      <div>
        <div className="text-xs font-bold text-white/25 uppercase tracking-widest mb-2">Available Blocks</div>
        <div className="flex flex-wrap gap-2 min-h-[44px] p-3 bg-bg-surface rounded-xl border border-white/8">
          {available.map(id=>{const b=getB(id);return(
            <button key={id} onClick={()=>addBlock(id)}
              className="px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer transition-all hover:scale-105 active:scale-95"
              style={{background:`${b.color}22`,border:`1.5px solid ${b.color}55`,color:b.color}}>
              {b.text}
            </button>
          )})}
          {available.length===0&&<span className="text-xs text-white/20 p-1">All blocks placed!</span>}
        </div>
      </div>
      <div>
        <div className="text-xs font-bold text-white/25 uppercase tracking-widest mb-2">Your Program (click to remove)</div>
        <div className="min-h-[100px] p-3 bg-bg-surface rounded-xl border-2 border-dashed border-white/12 space-y-1.5">
          {blockOrder.map((id,i)=>{const b=getB(id);return(
            <motion.div key={id+i} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
              onClick={()=>removeBlock(id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:opacity-60 transition-all"
              style={{background:`${b.color}18`,border:`1.5px solid ${b.color}45`,marginLeft:b.type==='action'&&i>0?'1.5rem':0}}>
              <span className="font-mono text-xs text-white/25">{i+1}</span>
              <span className="font-bold text-sm" style={{color:b.color}}>{b.text}</span>
            </motion.div>
          )})}
          {blockOrder.length===0&&<div className="text-center py-4 text-xs text-white/20">Click blocks above to build your program</div>}
        </div>
      </div>
    </div>
  )
}

// ── FILL EDITOR ────────────────────────────────────────
function FillEditor({template,blanks,answers,setAnswers,lang}:{
  template:string;blanks:string[];answers:string[];setAnswers:(a:string[])=>void;lang:Lang
}) {
  const lines=template.split('\n')
  let bi=0
  return(
    <div className="bg-[#0D1117] rounded-xl p-4 font-mono text-sm leading-loose border border-white/8">
      {lines.map((line,li)=>{
        const parts=line.split('___')
        return(
          <div key={li} className="flex flex-wrap items-baseline">
            {parts.map((part,pi)=>{
              const idx=bi
              if(pi<parts.length-1) bi++
              return(
                <span key={pi}>
                  <span className="text-[#C9D1D9]" dangerouslySetInnerHTML={{__html:part.replace(/ /g,'&nbsp;')}}/>
                  {pi<parts.length-1&&(
                    <input value={answers[idx]||''} onChange={e=>{const a=[...answers];a[idx]=e.target.value;setAnswers(a)}}
                      className="inline-block bg-brand-cyan/10 border border-brand-cyan/40 rounded px-1.5 py-0.5 text-brand-cyan outline-none focus:border-brand-cyan mx-0.5 font-mono text-xs"
                      style={{width:Math.max(40,(answers[idx]?.length||3)*9)+'px',minWidth:'40px'}}/>
                  )}
                </span>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
