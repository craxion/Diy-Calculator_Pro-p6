import type { DimensionUnit, DensityUnit } from "./types"

// Conversion factors to a base unit (e.g., feet for length, ft³ for volume)
const FEET_PER_METER = 3.28084
const INCHES_PER_FOOT = 12
const CM_PER_METER = 100

const CUBIC_FEET_PER_CUBIC_METER = Math.pow(FEET_PER_METER, 3)
const CUBIC_FEET_PER_CUBIC_YARD = 27

const KG_PER_LB = 0.453592

export function convertToBaseFoot(value: number, unit: DimensionUnit): number {
  switch (unit) {
    case "ft":
      return value
    case "in":
      return value / INCHES_PER_FOOT
    case "m":
      return value * FEET_PER_METER
    case "cm":
      return (value / CM_PER_METER) * FEET_PER_METER
    default:
      return value
  }
}

export function convertVolume(valueFt3: number, targetUnit: "ft3" | "yd3" | "m3"): number {
  switch (targetUnit) {
    case "ft3":
      return valueFt3
    case "yd3":
      return valueFt3 / CUBIC_FEET_PER_CUBIC_YARD
    case "m3":
      return valueFt3 / CUBIC_FEET_PER_CUBIC_METER
    default:
      return valueFt3
  }
}

export function convertDensityToLbFt3(value: number, unit: DensityUnit): number {
  if (unit === "lb/ft3") {
    return value
  }
  // kg/m³ to lb/ft³
  // 1 kg/m³ = 1 kg / (1 m³) = 0.453592 lb / (35.3147 ft³) approx
  // More accurately: 1 kg/m³ = (1 / KG_PER_LB) lb / ( (1/FEET_PER_METER)^3 ft^3 )
  // 1 kg/m³ = X lb/ft³
  // X = (kg_value / CUBIC_FEET_PER_CUBIC_METER) * (1 / KG_PER_LB) -> this is wrong
  // 1 kg = 2.20462 lbs
  // 1 m^3 = 35.3147 ft^3
  // 1 kg/m^3 = 2.20462 lbs / 35.3147 ft^3 = 0.0624279606 lbs/ft^3
  if (unit === "kg/m3") {
    return value * (KG_PER_LB / Math.pow(1 / FEET_PER_METER, 3)) // kg/m3 * (lb/kg) / (ft3/m3)
    // Simplified: value * 0.06242796
  }
  return value
}

export function convertWeight(valueLb: number, targetUnit: "lbs" | "kg"): number {
  if (targetUnit === "lbs") {
    return valueLb
  }
  if (targetUnit === "kg") {
    return valueLb * KG_PER_LB
  }
  return valueLb
}

export function parseNumericInput(value: string, defaultValue = 0): number {
  const parsed = Number.parseFloat(value)
  return isNaN(parsed) || parsed < 0 ? defaultValue : parsed
}

export function formatNumber(value: number | undefined, decimals = 2): string {
  if (value === undefined || isNaN(value)) return "N/A"
  return value.toFixed(decimals)
}
