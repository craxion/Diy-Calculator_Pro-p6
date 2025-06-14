import type { IrrigationZone, SprinklerHead, SprinklerHeadType, SoilTypeData, CycleSoakRecommendation } from "../types"
import { convertAbsorptionRateToInHr } from "../utils"

// Calculate average precipitation rate for a zone in inches per hour
export function calculateZonePrecipitationRate(
  zone: IrrigationZone,
  placedItems: SprinklerHead[],
  sprinklerHeadTypes: SprinklerHeadType[],
): number {
  // This is a highly simplified calculation.
  // True precipitation rate depends on head spacing, pattern overlap, and pressure.
  // For now, we'll average the default precipitation rates of the heads in the zone.
  // A more accurate method would use formulas like: (96.25 * Total GPM of Zone) / Area of Zone (sq ft)
  // But calculating "Area of Zone" from placed heads is complex.

  let totalPR = 0
  let count = 0
  zone.itemIds.forEach((itemId) => {
    const item = placedItems.find((p) => p.id === itemId)
    if (item) {
      const headType = sprinklerHeadTypes.find((ht) => ht.id === item.typeId)
      if (headType && headType.precipitationRate) {
        totalPR += headType.precipitationRate
        count++
      }
    }
  })
  return count > 0 ? totalPR / count : 0.5 // Default to 0.5 in/hr if no data
}

export function calculateBaseRunTimeMinutes(
  inchesOfWaterToApply: number, // User input for desired water application
  precipitationRateInHr: number, // Calculated for the zone
): number {
  if (precipitationRateInHr <= 0) return 0
  const hoursToRun = inchesOfWaterToApply / precipitationRateInHr
  return hoursToRun * 60 // Convert to minutes
}

export function getCycleSoakRecommendation(
  baseRunTimeMinutes: number,
  soilType: SoilTypeData | undefined,
  precipitationRateInHr: number, // of the sprinklers
): CycleSoakRecommendation | null {
  if (!soilType || baseRunTimeMinutes <= 0) return null

  const soilAbsorptionRateInHr = convertAbsorptionRateToInHr(soilType.absorptionRate, soilType.absorptionRateUnit)

  // Max runtime per cycle before runoff (simplified: time it takes to apply water up to soil's absorption capacity for a short period)
  // A common rule: Max run time (minutes) = (Soil Intake Rate (in/hr) * 60) / Sprinkler PR (in/hr)
  // This formula is often cited but needs careful application.
  // Let's use a simpler heuristic: if PR > Soil Absorption, runoff is likely.
  // Max water depth before runoff for one cycle (e.g. 0.25 inches for clay, 0.5 for loam)

  let maxSingleApplicationDepth = 0.5 // inches, for loamy as a default
  if (soilType.id === "clay") maxSingleApplicationDepth = 0.2
  if (soilType.id === "sandy") maxSingleApplicationDepth = 0.75 // Sandy soil absorbs quickly

  const maxRunTimePerCycleMinutes = calculateBaseRunTimeMinutes(maxSingleApplicationDepth, precipitationRateInHr)

  if (baseRunTimeMinutes <= maxRunTimePerCycleMinutes * 1.1) {
    // Allow slight exceeding before recommending C&S
    return null // No cycle/soak needed
  }

  // Recommend cycle/soak
  const numberOfCycles = Math.ceil(baseRunTimeMinutes / maxRunTimePerCycleMinutes)
  const runMinutesPerCycle = Math.ceil(baseRunTimeMinutes / numberOfCycles) // Distribute total time evenly

  // Soak time: often recommended 2x-3x the run time per cycle, or at least 30-60 mins
  const soakMinutesBetweenCycles = Math.max(30, runMinutesPerCycle * 1.5)

  return {
    runMinutesPerCycle,
    soakMinutesBetweenCycles,
    numberOfCycles,
    totalRunTimeMinutes: baseRunTimeMinutes, // This is the original total needed
    reason: `Runoff likely on ${soilType.name} with continuous ${baseRunTimeMinutes.toFixed(0)} min run. Sprinkler PR (${precipitationRateInHr.toFixed(1)} in/hr) may exceed soil intake (${soilAbsorptionRateInHr.toFixed(1)} in/hr).`,
  }
}
