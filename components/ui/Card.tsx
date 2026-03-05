import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'orange' | 'purple' | 'green' | 'cyan' | 'none'
  hover?: boolean
}

const glows = {
  orange: 'hover:border-brand-orange/40 hover:shadow-glow-orange',
  purple: 'hover:border-brand-purple/40 hover:shadow-glow-purple',
  green:  'hover:border-brand-green/40 hover:shadow-glow-green',
  cyan:   'hover:border-brand-cyan/40 hover:shadow-glow-cyan',
  none:   '',
}

export function Card({ glow = 'none', hover = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-bg-elevated border border-white/[0.07] rounded-2xl p-4 transition-all duration-200',
        hover && 'cursor-pointer hover:-translate-y-1',
        glow !== 'none' && glows[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
