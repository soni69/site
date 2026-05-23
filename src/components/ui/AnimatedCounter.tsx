'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  /** Конечное значение счётчика */
  target: number
  /** Продолжительность анимации в миллисекундах (по умолчанию 2000) */
  duration?: number
  /** Суффикс после числа (например «+» или «%») */
  suffix?: string
  /** Префикс перед числом */
  prefix?: string
  /** CSS-класс для обёртки */
  className?: string
}

/**
 * AnimatedCounter — счётчик с анимацией при появлении в viewport.
 *
 * Использует Intersection Observer для запуска анимации только тогда,
 * когда элемент становится видимым. Анимация выполняется один раз.
 *
 * Требования: 10.3
 */
export function AnimatedCounter({
  target,
  duration = 2000,
  suffix = '',
  prefix = '',
  className,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          observer.disconnect()

          // Запускаем анимацию счётчика
          const startTime = performance.now()
          const startValue = 0

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Функция плавности: easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3)
            const currentValue = Math.round(startValue + (target - startValue) * eased)

            setCount(currentValue)

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      {
        threshold: 0.3,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [target, duration, hasAnimated])

  return (
    <span ref={ref} className={className} aria-live="polite" aria-atomic="true">
      {prefix}
      {count.toLocaleString('ru-RU')}
      {suffix}
    </span>
  )
}
