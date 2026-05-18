'use client'

import { useEffect, useState } from 'react'
import { isPromotionActive } from '@/lib/utils'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface CountdownTimerProps {
  /** Дата начала акции */
  startsAt: string | Date
  /** Дата окончания акции */
  endsAt: string | Date
  /** CSS-класс для обёртки */
  className?: string
}

function calculateTimeLeft(endsAt: Date): TimeLeft | null {
  const diff = endsAt.getTime() - Date.now()
  if (diff <= 0) return null

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * CountdownTimer — клиентский компонент таймера обратного отсчёта.
 *
 * Отображает дни/часы/минуты/секунды до окончания акции.
 * Скрывается, если акция завершилась или ещё не началась
 * (использует `isPromotionActive` из utils.ts).
 *
 * Требования: 14.3, 14.4, 14.5
 */
export function CountdownTimer({ startsAt, endsAt, className }: CountdownTimerProps) {
  const startDate = startsAt instanceof Date ? startsAt : new Date(startsAt)
  const endDate = endsAt instanceof Date ? endsAt : new Date(endsAt)

  const [now, setNow] = useState<Date>(() => new Date())
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    calculateTimeLeft(endDate),
  )

  useEffect(() => {
    const interval = setInterval(() => {
      const currentDate = new Date()
      setNow(currentDate)
      setTimeLeft(calculateTimeLeft(endDate))
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate.getTime()])

  // Используем isPromotionActive для проверки активности акции (Req 14.3, 14.4)
  const active = isPromotionActive({ startsAt: startDate, endsAt: endDate }, now)

  // Акция не активна или завершилась — не рендерим таймер
  if (!active || !timeLeft) return null

  const units = [
    { label: 'дн', value: timeLeft.days },
    { label: 'ч', value: timeLeft.hours },
    { label: 'мин', value: timeLeft.minutes },
    { label: 'сек', value: timeLeft.seconds },
  ]

  return (
    <div
      className={className}
      aria-label={`До конца акции: ${timeLeft.days} дней ${timeLeft.hours} часов ${timeLeft.minutes} минут`}
      role="timer"
    >
      <div className="flex items-center gap-2">
        {units.map(({ label, value }, idx) => (
          <span key={label} className="flex items-center gap-1">
            <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-md bg-primary/10 px-2 py-1 text-sm font-bold tabular-nums text-primary">
              {pad(value)}
            </span>
            <span className="text-xs text-muted-foreground">{label}</span>
            {idx < units.length - 1 && (
              <span className="text-muted-foreground" aria-hidden="true">
                :
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
