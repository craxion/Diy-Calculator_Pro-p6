import type { Unit } from "./types"

export function convertToUnit(value: number, fromUnit: Unit, toUnit: Unit): number {
  if (fromUnit === toUnit) return value

  const inchesPerUnit: Record<Unit, number> = {
    inches: 1,
    feet: 12,
    cm: 0.393701,
    meters: 39.3701,
    mm: 0.0393701,
  }

  const valueInInches = value * inchesPerUnit[fromUnit]
  return valueInInches / inchesPerUnit[toUnit]
}

export function convertToInches(value: number, unit: Unit): number {
  return convertToUnit(value, unit, "inches")
}
