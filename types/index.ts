// ── USER ──────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  avatar: string          // emoji
  xp: number
  level: number
  streak: number
  studyingWhat: string    // "Class 10 student", "Engineering CSE", "Self learner" etc.
  interests: string[]     // ["AI", "Web Dev", "Math"]
  createdAt: string
}

// ── ONBOARDING ────────────────────────────────────
export interface OnboardingData {
  name: string
  studyingWhat: string
  interests: string[]
  avatar: string
}

// ── ARENA / GAMES ─────────────────────────────────
export type GameType = 'summit' | 'tugofwar' | 'surfer'

export interface Room {
  id: string
  code: string
  hostName: string
  subject: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  gameType: GameType
  status: 'lobby' | 'playing' | 'finished'
  players: Player[]
  questions: Question[]
  currentQ: number
  createdAt: string
}

export interface Player {
  id: string
  name: string
  avatar: string
  energy: number
  score: number
  isHost: boolean
  isBot?: boolean
  team?: 'red' | 'blue'
}

export interface Question {
  id: string
  question: string
  options: { A: string; B: string; C: string; D: string }
  answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
  subject: string
  difficulty: string
}

// ── LEARN (AI Tutor) ─────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface LearnSession {
  id: string
  subject: string
  messages: ChatMessage[]
  quizzes: Question[]
  createdAt: string
}

// ── CODING LAB ────────────────────────────────────
export type CodingLevel = 'blocks' | 'fill' | 'real'

export interface CodeBlock {
  id: string
  type: 'keyword' | 'string' | 'number' | 'operator' | 'blank'
  label: string
  color: string
}

export interface CodingChallenge {
  id: string
  title: string
  description: string
  level: CodingLevel
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  blocks?: CodeBlock[]
  template?: string
  solution: string
  hint: string
  xpReward: number
  subject: string
}

// ── COURSES ───────────────────────────────────────
export interface Course {
  id: string
  title: string
  description: string
  emoji: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedHours: number
  modules: CourseModule[]
  isPrebuilt: boolean
  tags: string[]
}

export interface CourseModule {
  id: string
  title: string
  description: string
  lessons: Lesson[]
  isCompleted?: boolean
}

export interface Lesson {
  id: string
  title: string
  type: 'concept' | 'quiz' | 'code' | 'project'
  content?: string
  duration: number          // minutes
  isCompleted?: boolean
  xpReward: number
}

// ── ROADMAP ───────────────────────────────────────
export interface RoadmapNode {
  id: string
  title: string
  description: string
  type: 'milestone' | 'topic' | 'project'
  status: 'locked' | 'available' | 'in_progress' | 'completed'
  dependencies: string[]
  estimatedDays: number
  xpReward: number
  courseId?: string
}

export interface Roadmap {
  id: string
  title: string
  goal: string
  nodes: RoadmapNode[]
  userId: string
  createdAt: string
  completionPercent: number
}

// ── API RESPONSES ─────────────────────────────────
export interface AIResponse {
  content: string
  error?: string
}

export interface QuizGenerateResponse {
  questions: Question[]
  error?: string
}

export interface CourseGenerateResponse {
  course: Course
  error?: string
}

export interface RoadmapGenerateResponse {
  roadmap: Roadmap
  error?: string
}
