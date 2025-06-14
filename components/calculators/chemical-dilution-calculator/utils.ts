import type { ConcentrationUnit, VolumeUnit, KnownVolumeType, DilutionResult } from "./types"

// Conversion factors to mL
const ML_CONVERSION_FACTORS: Record<VolumeUnit, number> = {
  ml: 1,
  l: 1000,
  us_oz: 29.5735,
  us_cup: 236.588, // Standard US cup
  us_pint: 473.176,
  us_quart: 946.353,
  us_gallon: 3785.41,
  imp_oz: 28.4131,
  imp_pint: 568.261,
  imp_quart: 1136.52,
  imp_gallon: 4546.09,
}

export function convertToMl(value: number, unit: VolumeUnit): number {
  return value * (ML_CONVERSION_FACTORS[unit] || 1)
}

export function convertFromMl(valueMl: number, targetUnit: VolumeUnit): number {
  return valueMl / (ML_CONVERSION_FACTORS[targetUnit] || 1)
}

/**
 * Parses concentration string to a decimal value (0-1).
 * For ratio "A:B", it's A / (A+B). If just "X", assumes "1:X".
 */
export function parseConcentration(valueStr: string, unit: ConcentrationUnit): number {
  const num = Number.parseFloat(valueStr) // For % and ppm direct number

  switch (unit) {
    case "%":
      if (isNaN(num)) return Number.NaN
      return num / 100
    case "ppm":
      if (isNaN(num)) return Number.NaN
      return num / 1_000_000
    case "ratio":
      // Handles "A:B", "A to B", or just "X" (implies "1:X")
      const parts = valueStr
        .split(/[:\s+to\s+]/)
        .map((s) => s.trim())
        .filter(Boolean)
      let a: number, b: number
      if (parts.length === 1) {
        // User entered "X", assume 1:X
        a = 1
        b = Number.parseFloat(parts[0])
      } else if (parts.length === 2) {
        a = Number.parseFloat(parts[0])
        b = Number.parseFloat(parts[1])
      } else {
        return Number.NaN // Invalid ratio format
      }
      if (isNaN(a) || isNaN(b) || a + b === 0) return Number.NaN
      return a / (a + b)
    default:
      return Number.NaN
  }
}

/**
 * Formats decimal concentration (0-1) back to string for display.
 */
export function formatConcentration(decimalValue: number, unit: ConcentrationUnit): string {
  if (isNaN(decimalValue)) return "N/A"
  switch (unit) {
    case "%":
      return `${(decimalValue * 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 })}%`
    case "ppm":
      return `${(decimalValue * 1_000_000).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ppm`
    case "ratio":
      if (decimalValue === 0) return "0 (Pure Diluent)"
      if (decimalValue === 1) return "1 (Pure Concentrate)"
      if (decimalValue > 0 && decimalValue < 1) {
        // To express as 1:X, where X = (1/decimalValue) - 1
        const x = 1 / decimalValue - 1
        return `1 : ${x.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
      }
      return "N/A" // Should not happen for valid decimalValue between 0 and 1
    default:
      return "N/A"
  }
}

export function calculateDilution(
  stockConcentrationDecimal: number, // C1 (0-1)
  targetConcentrationDecimal: number, // C2 (0-1)
  knownVolumeInMl: number, // V1 or V2 depending on type
  knownVolumeType: KnownVolumeType,
): DilutionResult | string {
  if (stockConcentrationDecimal < 0 || stockConcentrationDecimal > 1) return "Stock concentration out of bounds."
  if (targetConcentrationDecimal < 0 || targetConcentrationDecimal > 1) return "Target concentration out of bounds."
  if (knownVolumeInMl <= 0) return "Volume must be positive."

  if (stockConcentrationDecimal === 0 && targetConcentrationDecimal > 0) {
    return "Cannot achieve a target concentration from a 0% stock solution."
  }
  if (targetConcentrationDecimal > stockConcentrationDecimal && stockConcentrationDecimal !== 0) {
    return "Target concentration cannot be greater than stock concentration."
  }
  if (stockConcentrationDecimal === 0 && targetConcentrationDecimal === 0) {
    // Diluting nothing with nothing or making pure diluent
    if (knownVolumeType === "finalSolution") {
      return {
        concentrateVolumeMl: 0,
        diluentVolumeMl: knownVolumeInMl,
        totalVolumeMl: knownVolumeInMl,
        finalConcentrationDecimal: 0,
      }
    } else {
      // knownVolumeType === 'concentrate' (means 0 concentrate)
      return {
        concentrateVolumeMl: 0, // you have 0 "concentrate"
        diluentVolumeMl: 0, // you add 0 diluent to your 0 concentrate
        totalVolumeMl: 0, // you end up with 0
        finalConcentrationDecimal: 0,
      }
    }
  }

  let concentrateVolumeMl: number
  let diluentVolumeMl: number
  let totalVolumeMl: number

  // C1V1 = C2V2  (C = concentration, V = volume)
  // C1 = stockConcentrationDecimal
  // V1 = concentrateVolumeMl
  // C2 = targetConcentrationDecimal
  // V2 = totalVolumeMl

  if (knownVolumeType === "finalSolution") {
    totalVolumeMl = knownVolumeInMl // This is V2
    if (stockConcentrationDecimal === 0) {
      // Making pure diluent from 0% stock
      concentrateVolumeMl = 0
    } else {
      concentrateVolumeMl = (targetConcentrationDecimal * totalVolumeMl) / stockConcentrationDecimal // V1 = (C2 * V2) / C1
    }
    if (concentrateVolumeMl > totalVolumeMl && Math.abs(concentrateVolumeMl - totalVolumeMl) > 1e-9) {
      // Check for floating point issues
      // This can happen if targetConc > stockConc, already checked, but also if stockConc is very small
      return "Calculation error: Required concentrate exceeds total volume. Check concentrations."
    }
    diluentVolumeMl = totalVolumeMl - concentrateVolumeMl
  } else {
    // knownVolumeType === "concentrate"
    concentrateVolumeMl = knownVolumeInMl // This is V1
    if (targetConcentrationDecimal === 0) {
      // Diluting to 0% (pure diluent)
      totalVolumeMl = concentrateVolumeMl // Effectively, you just have concentrate, and it's considered the "total" if you add no diluent to change its concentration for a 0% target. Or, infinite diluent. This case is tricky.
      // Let's assume if target is 0%, you want to know how much diluent to add to make the concentrate itself 0%, which is impossible if concentrate > 0.
      // If stock is also 0%, then it's fine.
      if (stockConcentrationDecimal > 0) {
        // This implies you want to add infinite diluent. Let's cap it or provide a message.
        // For practical purposes, if target is 0, and stock is >0, it means you just need diluent.
        // The question is how much. If you have X concentrate, and want 0% final, you need to add infinite water.
        // This scenario should probably be handled by saying "use pure diluent instead".
        // Or, if the goal is to make the *existing concentrate* part of a 0% solution of a certain volume, that's different.
        // Let's assume for now that if target is 0%, the concentrate needed is 0.
        // This means if user has concentrate, and wants 0% target, they should just use diluent.
        // This case is better handled by the initial error checks.
        // If we reach here, it means stockConc > 0 and targetConc = 0.
        // This implies the user wants to know how much diluent to add to their existing concentrate to make the *overall mixture* 0% active ingredient.
        // This is only possible if the concentrate itself becomes negligible.
        // Let's assume this means they want to make a solution that is effectively pure diluent.
        // The amount of concentrate they *have* is fixed.
        // V2 = (C1 * V1) / C2. If C2 is 0, V2 is infinite.
        // This is an edge case. Let's return an error or specific instruction.
        return "To achieve a 0% target concentration with a non-0% stock, you would theoretically need infinite diluent. Consider using pure diluent instead for your needs."
      } else {
        // stockConc is 0, targetConc is 0
        totalVolumeMl = concentrateVolumeMl // you have 0% concentrate, total is just that volume
      }
    } else {
      totalVolumeMl = (stockConcentrationDecimal * concentrateVolumeMl) / targetConcentrationDecimal // V2 = (C1 * V1) / C2
    }
    diluentVolumeMl = totalVolumeMl - concentrateVolumeMl
  }

  if (concentrateVolumeMl < -1e-9 || diluentVolumeMl < -1e-9) {
    // Check for small negative due to precision
    return "Calculation error resulted in negative volume. Please check inputs. Target concentration might be too high for the given stock."
  }
  // Clamp small negative numbers to 0
  concentrateVolumeMl = Math.max(0, concentrateVolumeMl)
  diluentVolumeMl = Math.max(0, diluentVolumeMl)
  totalVolumeMl = concentrateVolumeMl + diluentVolumeMl // Recalculate total based on potentially clamped values

  // Recalculate final concentration to account for any rounding or clamping
  const finalConcentrationDecimal =
    totalVolumeMl > 1e-9 ? (stockConcentrationDecimal * concentrateVolumeMl) / totalVolumeMl : 0

  return {
    concentrateVolumeMl,
    diluentVolumeMl,
    totalVolumeMl,
    finalConcentrationDecimal: finalConcentrationDecimal,
  }
}

export function getAlternativeVolumeUnit(unit: VolumeUnit): VolumeUnit {
  if (unit.startsWith("us_")) {
    if (unit === "us_gallon") return "l"
    if (unit === "us_quart") return "ml"
    if (unit === "us_pint") return "ml"
    if (unit === "us_cup") return "ml"
    if (unit === "us_oz") return "ml"
  }
  if (unit.startsWith("imp_")) {
    if (unit === "imp_gallon") return "l"
    if (unit === "imp_oz") return "ml"
  }
  if (unit === "l") return "us_gallon"
  if (unit === "ml") return "us_oz"
  return unit // fallback to same unit if no simple alternative
}
