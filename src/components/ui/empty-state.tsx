'use client'

import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, children, className }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className ?? ''}`}>
      {Icon && <Icon size={40} className="text-muted-foreground/40 mb-3" />}
      <p className="text-muted-foreground font-medium">{title}</p>
      {description && <p className="text-sm text-muted-foreground/70 mt-1">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
