import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'orange' | 'purple' | 'green' | 'cyan' | 'yellow' | 'red' | 'ghost'
  children: React.ReactNode
  className?: string
}

const variants = {
  orange: 'bg-brand-orange/15 text-brand-orange border-brand-orange/25',
  purple: 'bg-brand-purple/15 text-violet-400 border-brand-purple/25',
  green:  'bg-brand-green/12 text-brand-green border-brand-green/20',
  cyan:   'bg-brand-cyan/12 text-brand-cyan border-brand-cyan/20',
  yellow: 'bg-brand-yellow/12 text-brand-yellow border-brand-yellow/25',
  red:    'bg-brand-red/12 text-brand-red border-brand-red/20',
  ghost:  'bg-white/5 text-white/60 border-white/10',
}

export function Badge({ variant = 'ghost', children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border',
      variants[variant], className
    )}>
      {children}
    </span>
  )
}
