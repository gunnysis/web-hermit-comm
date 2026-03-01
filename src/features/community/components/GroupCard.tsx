import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Group } from '@/types/database'

interface GroupCardProps {
  group: Group
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="font-medium">{group.name}</p>
            {group.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">{group.description}</p>
            )}
          </div>
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        </CardContent>
      </Card>
    </Link>
  )
}
