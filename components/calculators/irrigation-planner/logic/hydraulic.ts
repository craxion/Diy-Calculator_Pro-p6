import type { WaterSupply, IrrigationZone, SprinklerHead, PipeFrictionLossData, SprinklerHeadType } from "../types"
import { convertLengthToFt, convertPressureToPSI } from "../utils"

// Find PSI loss for a given GPM in a specific pipe size
export function getPsiLossPer100ft(gpm: number, pipeSizeData: PipeFrictionLossData["data"]): number {
  if (!pipeSizeData || pipeSizeData.length === 0) return 0

  // Find the two points that bracket the gpm
  let lowerBound = pipeSizeData[0]
  let upperBound = pipeSizeData[pipeSizeData.length - 1]

  if (gpm <= lowerBound.gpm) return lowerBound.psiLossPer100ft
  if (gpm >= upperBound.gpm) return upperBound.psiLossPer100ft // Or extrapolate, but for simplicity, cap

  for (let i = 0; i < pipeSizeData.length - 1; i++) {
    if (pipeSizeData[i].gpm <= gpm && pipeSizeData[i + 1].gpm >= gpm) {
      lowerBound = pipeSizeData[i]
      upperBound = pipeSizeData[i + 1]
      break
    }
  }

  // Linear interpolation
  const gpmRange = upperBound.gpm - lowerBound.gpm
  const psiLossRange = upperBound.psiLossPer100ft - lowerBound.psiLossPer100ft

  if (gpmRange === 0) return lowerBound.psiLossPer100ft // Avoid division by zero

  const slope = psiLossRange / gpmRange
  return lowerBound.psiLossPer100ft + slope * (gpm - lowerBound.gpm)
}

export function calculateMainLinePressureLoss(
  waterSupply: WaterSupply,
  totalSystemGPM: number, // GPM flowing through the main line
  pipeFrictionDataTable: PipeFrictionLossData[],
): number {
  const mainLinePipeSize = waterSupply.mainLinePipeSize // e.g. "1in PVC Sch 40"
  const mainLineLengthFt = convertLengthToFt(waterSupply.mainLineLength, waterSupply.mainLineLengthUnit)

  const selectedPipeData = pipeFrictionDataTable.find((p) => p.pipeSize === mainLinePipeSize)
  if (!selectedPipeData) {
    console.warn(`Friction data not found for pipe size: ${mainLinePipeSize}`)
    return 0 // Or throw error, or a high default loss
  }

  const psiLoss100ft = getPsiLossPer100ft(totalSystemGPM, selectedPipeData.data)
  return (psiLoss100ft * mainLineLengthFt) / 100
}

export function calculatePressureAtZoneStart(waterSupply: WaterSupply, mainLinePressureLossPSI: number): number {
  const sourcePressurePSI = convertPressureToPSI(waterSupply.staticPressure, waterSupply.pressureUnit)
  return sourcePressurePSI - mainLinePressureLossPSI
}

export function calculateZoneGPM(
  zone: IrrigationZone,
  placedItems: SprinklerHead[],
  sprinklerHeadTypes: SprinklerHeadType[],
): number {
  let totalGPM = 0
  zone.itemIds.forEach((itemId) => {
    const item = placedItems.find((p) => p.id === itemId)
    if (item) {
      const headType = sprinklerHeadTypes.find((ht) => ht.id === item.typeId)
      // TODO: Adjust GPM based on actual pressure at head if available, for now use default
      totalGPM += headType?.defaultGPM || 0
    }
  })
  return totalGPM
}

// This is a simplified calculation. Real-world scenarios are more complex.
// It assumes all heads in a zone experience roughly the same pressure at the start of the lateral.
// More advanced: calculate pressure at each head considering lateral friction loss.
export function calculatePressureRequiredForZone(
  zone: IrrigationZone,
  placedItems: SprinklerHead[],
  sprinklerHeadTypes: SprinklerHeadType[],
): number {
  let maxPressureRequired = 0
  zone.itemIds.forEach((itemId) => {
    const item = placedItems.find((p) => p.id === itemId)
    if (item) {
      const headType = sprinklerHeadTypes.find((ht) => ht.id === item.typeId)
      if (headType && headType.defaultPressurePSI > maxPressureRequired) {
        maxPressureRequired = headType.defaultPressurePSI
      }
    }
  })
  return maxPressureRequired
}

// Placeholder for more complex lateral line loss calculation
export function calculateLateralLinePressureLoss(
  zoneGPM: number,
  lateralPipeLengthFt: number, // User input for total lateral length in this zone
  lateralPipeSize: string, // Could be a setting per zone or assumed
  pipeFrictionDataTable: PipeFrictionLossData[],
): number {
  if (lateralPipeLengthFt <= 0) return 0

  // Assume lateral pipe size, e.g., 0.75in or 1in, or make it a user setting per zone
  const assumedLateralPipeKey = lateralPipeSize || "0.75in PVC Sch 40"
  const selectedPipeData = pipeFrictionDataTable.find((p) => p.pipeSize === assumedLateralPipeKey)

  if (!selectedPipeData) {
    console.warn(`Friction data not found for lateral pipe size: ${assumedLateralPipeKey}`)
    return 5 // Default high-ish loss if data missing
  }

  // This is a simplification: actual loss depends on flow distribution.
  // A common rule of thumb is to take about 50-60% of the total flow for the longest run,
  // or use a factor for average loss. For simplicity, using total zone GPM for the whole length.
  // This will overestimate loss but is safer.
  const psiLoss100ft = getPsiLossPer100ft(zoneGPM, selectedPipeData.data)

  // Another simplification: the "length" for friction loss in laterals is complex.
  // Using user's total lateral length. A more accurate method would be length to critical head.
  // Also, often a "multiple outlet factor" (e.g., F=0.35-0.55) is applied to this loss.
  // For now, a direct calculation, which will be conservative (overestimate loss).
  const rawLoss = (psiLoss100ft * lateralPipeLengthFt) / 100
  return rawLoss * 0.55 // Apply a general multiple outlet factor
}
