'use client'

import { useState } from 'react'
import { ChevronDown, Calculator as CalculatorIcon, AlertCircle, ArrowRight } from 'lucide-react'
import { useCalculator } from './useCalculator'
import type { CalculatorMatrix } from './types'

interface CalculatorProps {
  /** Матрица калькулятора, загруженная на сервере */
  matrix: CalculatorMatrix
  /** CSS-класс для обёртки */
  className?: string
}

/**
 * Calculator — клиентский компонент онлайн-калькулятора стоимости ремонта.
 *
 * Позволяет посетителю выбрать тип устройства и неисправность,
 * после чего отображает диапазон примерной стоимости без перезагрузки страницы.
 * При незаполненных обязательных полях показывает подсказку.
 * После расчёта отображает кнопку «Записаться на ремонт» с предзаполненными данными.
 *
 * Требования: 6.1, 6.2, 6.4, 6.5
 */
export function Calculator({ matrix, className }: CalculatorProps) {
  const {
    selectedDeviceTypeId,
    selectedFaultTypeId,
    result,
    deviceTypes,
    availableFaults,
    selectedDeviceType,
    showHint,
    handleDeviceTypeChange,
    handleFaultTypeChange,
    reset,
  } = useCalculator(matrix)

  const [hintVisible, setHintVisible] = useState(false)

  // Обработчик кнопки «Рассчитать» — показывает подсказку, если поля не заполнены
  const handleCalculate = () => {
    if (!selectedDeviceTypeId || !selectedFaultTypeId) {
      setHintVisible(true)
    }
  }

  // Скрываем подсказку при выборе значений
  const onDeviceChange = (id: string) => {
    setHintVisible(false)
    handleDeviceTypeChange(id)
  }

  const onFaultChange = (id: string) => {
    setHintVisible(false)
    handleFaultTypeChange(id)
  }

  // Формируем предзаполненные данные для формы записи
  const bookingParams = result
    ? new URLSearchParams({
        device: selectedDeviceType?.label ?? '',
        fault: availableFaults.find((f) => f.id === selectedFaultTypeId)?.label ?? '',
      }).toString()
    : ''

  const bookingHref = result ? `/contacts?${bookingParams}` : '#'

  const missingDevice = !selectedDeviceTypeId
  const missingFault = selectedDeviceTypeId && !selectedFaultTypeId

  return (
    <section
      className={className}
      aria-labelledby="calculator-heading"
    >
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {/* Заголовок */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <CalculatorIcon className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2
              id="calculator-heading"
              className="text-xl font-bold text-foreground sm:text-2xl"
            >
              Калькулятор стоимости
            </h2>
            <p className="text-sm text-muted-foreground">
              Узнайте примерную стоимость ремонта онлайн
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Шаг 1: Выбор типа устройства */}
          <div>
            <label
              htmlFor="calculator-device-type"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Тип устройства{' '}
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </label>
            <div className="relative">
              <select
                id="calculator-device-type"
                value={selectedDeviceTypeId ?? ''}
                onChange={(e) => onDeviceChange(e.target.value)}
                aria-required="true"
                aria-invalid={hintVisible && missingDevice ? 'true' : 'false'}
                aria-describedby={
                  hintVisible && missingDevice ? 'calculator-device-hint' : undefined
                }
                className="w-full appearance-none rounded-lg border border-input bg-background py-2.5 pl-3 pr-10 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive"
              >
                <option value="" disabled>
                  — Выберите тип устройства —
                </option>
                {deviceTypes.map((dt) => (
                  <option key={dt.id} value={dt.id}>
                    {dt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            {hintVisible && missingDevice && (
              <p
                id="calculator-device-hint"
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive"
              >
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                Пожалуйста, выберите тип устройства
              </p>
            )}
          </div>

          {/* Шаг 2: Выбор неисправности */}
          <div>
            <label
              htmlFor="calculator-fault-type"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Тип неисправности{' '}
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </label>
            <div className="relative">
              <select
                id="calculator-fault-type"
                value={selectedFaultTypeId ?? ''}
                onChange={(e) => onFaultChange(e.target.value)}
                disabled={!selectedDeviceTypeId || availableFaults.length === 0}
                aria-required="true"
                aria-invalid={hintVisible && !!missingFault ? 'true' : 'false'}
                aria-describedby={
                  hintVisible && missingFault ? 'calculator-fault-hint' : undefined
                }
                className="w-full appearance-none rounded-lg border border-input bg-background py-2.5 pl-3 pr-10 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive"
              >
                <option value="" disabled>
                  {!selectedDeviceTypeId
                    ? '— Сначала выберите устройство —'
                    : '— Выберите неисправность —'}
                </option>
                {availableFaults.map((fault) => (
                  <option key={fault.id} value={fault.id}>
                    {fault.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            {hintVisible && missingFault && (
              <p
                id="calculator-fault-hint"
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive"
              >
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                Пожалуйста, выберите тип неисправности
              </p>
            )}
          </div>

          {/* Кнопка «Рассчитать» — показывается только если результат ещё не получен */}
          {!result && (
            <button
              type="button"
              onClick={handleCalculate}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Рассчитать стоимость
            </button>
          )}

          {/* Результат расчёта */}
          {result && (
            <div
              role="status"
              aria-live="polite"
              aria-label={`Стоимость ремонта: от ${result.minPrice.toLocaleString('ru-RU')} до ${result.maxPrice.toLocaleString('ru-RU')} рублей`}
              className="rounded-xl border border-primary/20 bg-primary/5 p-5"
            >
              <p className="mb-1 text-sm font-medium text-muted-foreground">
                Примерная стоимость ремонта
              </p>
              <p className="text-3xl font-bold text-primary">
                {result.minPrice.toLocaleString('ru-RU')}
                {' '}—{' '}
                {result.maxPrice.toLocaleString('ru-RU')} ₽
              </p>
              {result.disclaimer && (
                <p className="mt-2 text-xs text-muted-foreground">{result.disclaimer}</p>
              )}

              {/* Кнопки действий */}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                {/* Кнопка «Записаться на ремонт» с предзаполненными данными (Req 6.4) */}
                <a
                  href={bookingHref}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={`Записаться на ремонт: ${selectedDeviceType?.label ?? ''}, ${availableFaults.find((f) => f.id === selectedFaultTypeId)?.label ?? ''}`}
                >
                  Записаться на ремонт
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>

                {/* Кнопка сброса */}
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex flex-1 items-center justify-center rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:flex-none"
                >
                  Рассчитать снова
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
