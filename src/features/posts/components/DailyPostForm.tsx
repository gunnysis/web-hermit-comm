'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { ALLOWED_EMOTIONS, EMOTION_EMOJI, EMOTION_COLOR_MAP, DAILY_CONFIG, SHARED_PALETTE } from '@/lib/constants'
import { ActivityTagSelector } from './ActivityTagSelector'
import { useCreateDaily, useUpdateDaily } from '@/features/my/hooks/useCreateDaily'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface DailyPostFormProps {
  mode?: 'create' | 'edit'
  initialData?: { id: number; emotions: string[]; activities: string[]; content: string }
}

export function DailyPostForm({ mode = 'create', initialData }: DailyPostFormProps) {
  const router = useRouter()
  const [emotions, setEmotions] = useState<string[]>(initialData?.emotions ?? [])
  const [activities, setActivities] = useState<string[]>(initialData?.activities ?? [])
  const [note, setNote] = useState(initialData?.content ?? '')
  const [showSuccess, setShowSuccess] = useState(false)
  const queryClient = useQueryClient()
  const { mutate: createDaily, isPending: isCreating } = useCreateDaily()
  const { mutate: updateDaily, isPending: isUpdating } = useUpdateDaily()
  const isPending = isCreating || isUpdating

  const toggleEmotion = (emotion: string) => {
    if (emotions.includes(emotion)) {
      setEmotions(emotions.filter((e) => e !== emotion))
    } else if (emotions.length < DAILY_CONFIG.MAX_EMOTIONS) {
      setEmotions([...emotions, emotion])
    }
  }

  const handleSubmit = () => {
    if (emotions.length === 0) return
    if (mode === 'edit' && initialData) {
      updateDaily(
        { postId: initialData.id, emotions, activities, content: note },
        {
          onSuccess: () => {
            toast.success('수정했어요')
            router.push(`/post/${initialData.id}`)
          },
          onError: () => alert('수정에 실패했습니다. 잠시 후 다시 시도해주세요.'),
        },
      )
    } else {
      createDaily(
        { emotions, activities, content: note },
        {
          onSuccess: () => {
            setShowSuccess(true)
            const summary = queryClient.getQueryData<{ post_count?: number }>(['activitySummary'])
            const isFirst = !summary || (summary.post_count ?? 0) <= 1
            setTimeout(() => {
              toast.success(isFirst ? '🌱 첫 하루를 나눴어요' : '오늘의 하루를 나눴어요')
              router.push('/')
            }, 600)
          },
          onError: (err: Error & { code?: string }) => {
            if (err.code === 'P0002') {
              alert('오늘은 이미 나눴어요. 하루에 한 번만 나눌 수 있어요.')
            } else {
              alert('잠시 후 다시 시도해주세요.')
            }
          },
        },
      )
    }
  }

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="max-w-lg mx-auto flex flex-col items-center justify-center py-20"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          className="text-5xl mb-4"
        >
          ✨
        </motion.span>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-bold"
        >
          기록 완료!
        </motion.p>
      </motion.div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-lg font-bold">{mode === 'edit' ? '오늘의 하루 수정' : '오늘의 하루'}</h2>

      {/* 감정 선택 */}
      <div>
        <p className="text-sm font-medium mb-2">오늘 기분이 어때요?</p>
        <div className="flex flex-wrap gap-2">
          {ALLOWED_EMOTIONS.map((emotion, index) => {
            const isActive = emotions.includes(emotion)
            const colors = EMOTION_COLOR_MAP[emotion]
            return (
              <motion.button
                key={emotion}
                type="button"
                onClick={() => toggleEmotion(emotion)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: isActive ? 1.05 : 1,
                  backgroundColor: isActive ? (colors?.gradient[0] ?? '#E7D7FF') : 'var(--muted)',
                }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  opacity: { delay: index * 0.02 },
                  scale: { type: 'spring', stiffness: 300, damping: 25 },
                }}
                className={`rounded-full px-3 py-1.5 text-xs ${isActive ? 'font-semibold' : ''}`}
                aria-label={`감정: ${emotion}`}
                role="checkbox"
                aria-checked={isActive}
              >
                {EMOTION_EMOJI[emotion]} {emotion}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* 활동 태그 */}
      <ActivityTagSelector selected={activities} onSelect={setActivities} />

      {/* 한마디 */}
      <div>
        <p className="text-sm mb-2 text-muted-foreground">한마디 남기기 <span className="text-muted-foreground/60">(선택)</span></p>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={DAILY_CONFIG.MAX_NOTE_LENGTH}
          placeholder="오늘 하루는..."
          className="resize-none h-20"
        />
        <p className="text-right text-xs text-muted-foreground mt-1">
          {note.length}/{DAILY_CONFIG.MAX_NOTE_LENGTH}
        </p>
      </div>

      {/* 나누기 / 수정 */}
      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleSubmit}
          disabled={isPending || emotions.length === 0}
          className="w-full"
          style={{
            backgroundColor: emotions.length > 0 ? SHARED_PALETTE.happy[500] : undefined,
            color: emotions.length > 0 ? '#1c1917' : undefined,
          }}
        >
          {isPending
            ? (mode === 'edit' ? '수정 중...' : '나누는 중...')
            : (mode === 'edit' ? '수정하기' : '나누기')}
        </Button>
      </motion.div>
    </div>
  )
}
