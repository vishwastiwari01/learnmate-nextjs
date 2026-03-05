import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function genRoomCode(): string {
  return Math.random().toString(36).substr(2, 6).toUpperCase()
}

export function xpToLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export function levelToXP(level: number): number {
  return Math.pow(level - 1, 2) * 100
}

export function xpProgress(xp: number): { level: number; current: number; needed: number; percent: number } {
  const level = xpToLevel(xp)
  const current = xp - levelToXP(level)
  const needed = levelToXP(level + 1) - levelToXP(level)
  return { level, current, needed, percent: Math.round((current / needed) * 100) }
}

export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
  return xp.toString()
}

export const AVATARS = ['🦊','🦁','🐯','🐼','🦅','🦋','🐬','🦄','🐉','🦉','🦚','🦀']

export const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'History', 'English', 'Computer Science',
  'Economics', 'Data Structures & Algorithms',
  'Machine Learning', 'Web Development',
]

export const BOT_PLAYERS = [
  { name: 'Priya S.', avatar: '🦁' },
  { name: 'Rahul M.', avatar: '🐯' },
  { name: 'Sneha K.', avatar: '🐼' },
  { name: 'Dev R.',   avatar: '🦅' },
]

export const PREBUILT_COURSES = [
  {
    id: 'ai-basics',
    title: 'AI & Machine Learning Fundamentals',
    description: 'From zero to building your first ML model. Understand how AI thinks, learns, and makes decisions.',
    emoji: '🤖',
    category: 'Artificial Intelligence',
    difficulty: 'beginner' as const,
    estimatedHours: 12,
    tags: ['AI', 'ML', 'Python', 'Beginner'],
    isPrebuilt: true,
    modules: [],
  },
  {
    id: 'build-chatbot',
    title: 'Build Your Own Chatbot',
    description: 'Use LLMs and APIs to build a working chatbot. Deploy it. Show your friends.',
    emoji: '💬',
    category: 'Generative AI',
    difficulty: 'intermediate' as const,
    estimatedHours: 8,
    tags: ['LLM', 'API', 'Chatbot', 'Python'],
    isPrebuilt: true,
    modules: [],
  },
  {
    id: 'web-dev',
    title: 'Web Development with HTML, CSS & JS',
    description: 'Build real websites from scratch. Learn the fundamentals that power the entire internet.',
    emoji: '🌐',
    category: 'Web Development',
    difficulty: 'beginner' as const,
    estimatedHours: 15,
    tags: ['HTML', 'CSS', 'JavaScript', 'Beginner'],
    isPrebuilt: true,
    modules: [],
  },
  {
    id: 'train-slm',
    title: 'Train a Small Language Model',
    description: 'Understand transformers, tokenization, and train your own miniature language model from scratch.',
    emoji: '🧠',
    category: 'Deep Learning',
    difficulty: 'advanced' as const,
    estimatedHours: 20,
    tags: ['LLM', 'PyTorch', 'NLP', 'Advanced'],
    isPrebuilt: true,
    modules: [],
  },
  {
    id: 'data-science',
    title: 'Data Science & Visualization',
    description: 'Pandas, NumPy, Matplotlib — analyze real datasets and tell stories with data.',
    emoji: '📊',
    category: 'Data Science',
    difficulty: 'intermediate' as const,
    estimatedHours: 10,
    tags: ['Python', 'Pandas', 'Data', 'Analysis'],
    isPrebuilt: true,
    modules: [],
  },
  {
    id: 'computer-vision',
    title: 'Computer Vision with OpenCV',
    description: 'Teach computers to see. Face detection, object recognition, and image classification.',
    emoji: '👁️',
    category: 'Computer Vision',
    difficulty: 'intermediate' as const,
    estimatedHours: 14,
    tags: ['CV', 'OpenCV', 'Python', 'Neural Networks'],
    isPrebuilt: true,
    modules: [],
  },
]
