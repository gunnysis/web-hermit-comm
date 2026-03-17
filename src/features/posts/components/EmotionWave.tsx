'use client'

import { useMemo, useState } from 'react'
import { useEmotionTimeline } from '@/features/my/hooks/useEmotionTimeline'
import { processEmotionTimeline } from '@/lib/utils.generated'
import { EMOTION_COLOR_MAP, EMOTION_EMOJI } from '@/lib/constants'
import { Skeleton } from '@/components/ui/skeleton'

interface EmotionWaveProps {
  days?: number
}

export function EmotionWave({ days = 7 }: EmotionWaveProps) {
  const { data: timeline = [], isLoading } = useEmotionTimeline(days)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const processed = useMemo(() => processEmotionTimeline(timeline), [timeline])
  const { bars, topEmotions, maxTotal, topEmotion } = processed

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">마을의 감정 흐름</h3>
        <div className="flex items-end gap-1.5 h-32">
          {[40, 65, 50, 80, 55, 70, 45].map((h, i) => (
            <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    )
  }

  // Empty state with ghost bars
  if (!bars.length) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">마을의 감정 흐름</h3>
        <div className="relative">
          <div className="flex items-end gap-1.5 h-32">
            {[20, 30, 15, 25, 20, 30, 18].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end h-full">
                <div className="bg-muted/50 rounded-t" style={{ height: `${h}%` }} />
                <span className="text-[9px] text-muted-foreground/40 text-center mt-1">
                  {['월', '화', '수', '목', '금', '토', '일'][i]}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-muted-foreground bg-background/80 px-3 py-1.5 rounded-full">
              아직 이 주의 이야기가 모이고 있어요
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">마을의 감정 흐름</h3>
        <span className="text-[10px] text-muted-foreground">최근 {days}일</span>
      </div>

      {/* Insight */}
      {topEmotion && (
        <p className="text-xs text-muted-foreground">
          이번 주 가장 많이 나눈 감정은 {EMOTION_EMOJI[topEmotion]} <span className="font-medium text-foreground">{topEmotion}</span>이에요
        </p>
      )}

      {/* Chart */}
      <div className="relative">
        <div className="flex items-end gap-1.5 h-32">
          {bars.map((bar, i) => (
            <div
              key={bar.day}
              className="flex-1 flex flex-col justify-end h-full relative"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Bar */}
              <div
                className={`flex flex-col rounded-t overflow-hidden transition-opacity duration-200 ${
                  hoveredIndex !== null && hoveredIndex !== i ? 'opacity-40' : ''
                }`}
                style={{
                  height: `${(bar.total / maxTotal) * 100}%`,
                  minHeight: bar.total > 0 ? 4 : 0,
                  transformOrigin: 'bottom',
                  animation: `growUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 60}ms backwards`,
                }}
              >
                {bar.segments.map((seg, si) => {
                  const colors = EMOTION_COLOR_MAP[seg.emotion]
                  return (
                    <div
                      key={seg.emotion}
                      style={{
                        flex: seg.count,
                        backgroundColor: colors?.gradient[1] ?? '#E7D7FF',
                        borderTop: si > 0 ? '1px solid rgba(255,255,255,0.6)' : undefined,
                      }}
                    />
                  )
                })}
              </div>

              {/* Day label */}
              <span className={`text-[9px] text-center mt-1 transition-colors ${
                bar.isToday ? 'text-foreground font-semibold' : 'text-muted-foreground'
              }`}>
                {bar.weekday}
              </span>
              {bar.isToday && (
                <span className="w-1 h-1 rounded-full bg-foreground mx-auto mt-0.5" />
              )}

              {/* Tooltip */}
              {hoveredIndex === i && bar.total > 0 && (
                <div role="tooltip" aria-label={`${bar.weekday} 감정 분포`} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 bg-popover border shadow-lg rounded-lg px-3 py-2 min-w-[120px] pointer-events-none animate-fade-in">
                  <p className="text-[10px] font-medium mb-1.5">
                    {new Date(bar.day + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}
                  </p>
                  {bar.segments.map((seg) => (
                    <div key={seg.emotion} className="flex items-center justify-between gap-3 text-[10px]">
                      <span className="flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-sm inline-block"
                          style={{ backgroundColor: EMOTION_COLOR_MAP[seg.emotion]?.gradient[1] ?? '#E7D7FF' }}
                        />
                        {EMOTION_EMOJI[seg.emotion]} {seg.emotion}
                      </span>
                      <span className="text-muted-foreground">{seg.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {topEmotions.map((emotion) => {
          const colors = EMOTION_COLOR_MAP[emotion]
          return (
            <span key={emotion} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <span
                className="w-2.5 h-2.5 rounded-sm inline-block"
                style={{ backgroundColor: colors?.gradient[1] ?? '#E7D7FF' }}
              />
              {EMOTION_EMOJI[emotion]} {emotion}
            </span>
          )
        })}
      </div>
    </div>
  )
}
