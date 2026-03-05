'use client'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'purple' | 'green' | 'cyan' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

const variants = {
  primary: 'bg-brand-orange text-white hover:bg-orange-500 shadow-glow-orange/0 hover:shadow-glow-orange',
  purple:  'bg-brand-purple text-white hover:bg-violet-600 shadow-glow-purple/0 hover:shadow-glow-purple',
  green:   'bg-brand-green text-black hover:bg-emerald-400 shadow-glow-green/0 hover:shadow-glow-green',
  cyan:    'bg-brand-cyan text-black hover:bg-sky-400',
  ghost:   'bg-bg-elevated border border-white/10 text-white hover:border-white/20 hover:bg-bg-card',
  danger:  'bg-brand-red text-white hover:bg-red-500',
}
const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-dm',
        variants[variant], sizes[size], className
      )}
      disabled={disabled || loading}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </motion.button>
  )
}
