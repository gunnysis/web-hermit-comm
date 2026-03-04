import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PostCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16 shimmer-delay-1" />
        </div>
        <Skeleton className="h-5 w-3/4 shimmer-delay-2" />
      </CardHeader>
      <CardContent className="pb-2">
        <Skeleton className="h-4 w-full shimmer-delay-2" />
        <Skeleton className="h-4 w-5/6 mt-1 shimmer-delay-3" />
      </CardContent>
      <CardFooter className="gap-4">
        <Skeleton className="h-4 w-8 shimmer-delay-3" />
        <Skeleton className="h-4 w-8 shimmer-delay-4" />
      </CardFooter>
    </Card>
  )
}
