'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useJoinGroup } from '../hooks/useJoinGroup'

interface JoinGroupFormProps {
  userId: string | null
}

export function JoinGroupForm({ userId }: JoinGroupFormProps) {
  const [code, setCode] = useState('')
  const router = useRouter()
  const { mutate, isPending } = useJoinGroup(userId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    mutate(code.trim(), {
      onSuccess: ({ group_id }) => {
        toast.success('그룹에 참여했습니다!')
        router.push(`/groups/${group_id}`)
        setCode('')
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="초대 코드 입력"
        className="max-w-48"
        disabled={!userId}
      />
      <Button type="submit" size="sm" disabled={!code.trim() || !userId || isPending}>
        참여
      </Button>
    </form>
  )
}
