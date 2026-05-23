'use client'

import { useState, useMemo } from 'react'
import { calculateRepairCost } from '@/lib/calculator'
import type { CalculatorMatrix, CalculatorResult, CalculatorDeviceType, CalculatorFault } from './types'

export interface UseCalculatorReturn {
  /** Выбранный тип устройства (id) */
  selectedDeviceTypeId: string | null
  /** Выбранный тип неисправности (id) */
  selectedFaultTypeId: string | null
  /** Результат расчёта (null — если параметры не выбраны или не найдены) */
  result: CalculatorResult | null
  /** Список типов устройств из матрицы */
  deviceTypes: CalculatorDeviceType[]
  /** Список неисправностей для выбранного типа устройства */
  availableFaults: CalculatorFault[]
  /** Выбранный тип устройства (объект) */
  selectedDeviceType: CalculatorDeviceType | null
  /** Показывать ли подсказку о незаполненных полях */
  showHint: boolean
  /** Обработчик выбора типа устройства */
  handleDeviceTypeChange: (id: string) => void
  /** Обработчик выбора неисправности */
  handleFaultTypeChange: (id: string) => void
  /** Сбросить выбор */
  reset: () => void
}

/**
 * useCalculator — хук с логикой онлайн-калькулятора стоимости ремонта.
 *
 * Управляет выбором типа устройства и неисправности,
 * вызывает `calculateRepairCost` и возвращает результат.
 * Требования: 6.1, 6.2, 6.4, 6.5
 */
export function useCalculator(matrix: CalculatorMatrix): UseCalculatorReturn {
  const [selectedDeviceTypeId, setSelectedDeviceTypeId] = useState<string | null>(null)
  const [selectedFaultTypeId, setSelectedFaultTypeId] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)

  const deviceTypes = matrix.deviceTypes

  const selectedDeviceType = useMemo(
    () => deviceTypes.find((dt) => dt.id === selectedDeviceTypeId) ?? null,
    [deviceTypes, selectedDeviceTypeId],
  )

  const availableFaults = useMemo(
    () => selectedDeviceType?.faults ?? [],
    [selectedDeviceType],
  )

  const result = useMemo(() => {
    return calculateRepairCost(matrix, {
      deviceTypeId: selectedDeviceTypeId,
      faultTypeId: selectedFaultTypeId,
    })
  }, [matrix, selectedDeviceTypeId, selectedFaultTypeId])

  const handleDeviceTypeChange = (id: string) => {
    setSelectedDeviceTypeId(id)
    // При смене типа устройства сбрасываем выбранную неисправность
    setSelectedFaultTypeId(null)
    setShowHint(false)
  }

  const handleFaultTypeChange = (id: string) => {
    setSelectedFaultTypeId(id)
    setShowHint(false)
  }

  const reset = () => {
    setSelectedDeviceTypeId(null)
    setSelectedFaultTypeId(null)
    setShowHint(false)
  }

  return {
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
  }
}
