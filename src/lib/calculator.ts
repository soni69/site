/**
 * Calculator module — pure function for repair cost estimation.
 *
 * The calculator works against a CalculatorMatrix that mirrors the
 * `calculator-matrix` Payload CMS Global (see design.md).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** A single fault entry inside a device type row. */
export interface CalculatorFault {
  id: string
  label: string
  minPrice: number
  maxPrice: number
}

/** A device type row in the calculator matrix. */
export interface CalculatorDeviceType {
  id: string
  label: string
  faults: CalculatorFault[]
}

/**
 * The full calculator matrix as stored in the CMS Global `calculator-matrix`.
 * Passed directly to `calculateRepairCost` — no network calls inside the function.
 */
export interface CalculatorMatrix {
  deviceTypes: CalculatorDeviceType[]
  disclaimer: string
}

/**
 * Input parameters for the calculator.
 * Both fields are required for a valid calculation.
 * Passing `null`, `undefined`, or an empty string for either field
 * causes `calculateRepairCost` to return `null`.
 */
export interface CalculatorParams {
  deviceTypeId: string | null | undefined
  faultTypeId: string | null | undefined
}

/**
 * Successful calculation result.
 * `minPrice` and `maxPrice` are always positive integers (in RUB).
 * `minPrice <= maxPrice` is guaranteed by the function.
 */
export interface CalculatorResult {
  minPrice: number
  maxPrice: number
  currency: 'RUB'
  disclaimer: string
}

// ─── Implementation ───────────────────────────────────────────────────────────

/**
 * Calculate the estimated repair cost for a given device type and fault type.
 *
 * @param matrix  - The calculator matrix loaded from the CMS.
 * @param params  - The user-selected device type and fault type IDs.
 * @returns A `CalculatorResult` when both IDs are valid and found in the matrix,
 *          or `null` when any required parameter is missing / not found.
 *
 * @example
 * ```ts
 * const result = calculateRepairCost(matrix, {
 *   deviceTypeId: 'smartphone',
 *   faultTypeId:  'screen',
 * });
 * // result: { minPrice: 2000, maxPrice: 8000, currency: 'RUB', disclaimer: '...' }
 * ```
 */
export function calculateRepairCost(
  matrix: CalculatorMatrix,
  params: CalculatorParams,
): CalculatorResult | null {
  const { deviceTypeId, faultTypeId } = params

  // Requirement 6.5 — return null for missing / empty required parameters
  if (!deviceTypeId || !faultTypeId) {
    return null
  }

  // Find the device type row
  const deviceType = matrix.deviceTypes.find((dt) => dt.id === deviceTypeId)
  if (!deviceType) {
    return null
  }

  // Find the fault entry within that device type
  const fault = deviceType.faults.find((f) => f.id === faultTypeId)
  if (!fault) {
    return null
  }

  // Requirement 6.1 — return a valid price range
  return {
    minPrice: fault.minPrice,
    maxPrice: fault.maxPrice,
    currency: 'RUB',
    disclaimer: matrix.disclaimer,
  }
}
