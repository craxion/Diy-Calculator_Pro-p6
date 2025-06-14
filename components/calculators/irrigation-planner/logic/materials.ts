import type { IrrigationZone, SprinklerHead, SprinklerHeadType, MaterialItem, WaterSupply, Unit } from "../types"
import { convertLengthToFt } from "../utils"

export function generateMaterialList(
  placedItems: SprinklerHead[],
  sprinklerHeadTypes: SprinklerHeadType[],
  zones: IrrigationZone[],
  waterSupply: WaterSupply,
  userInputPipeLengths: Record<string, { length: number; unit: Unit }>, // zoneId -> { length, unit } for laterals
): MaterialItem[] {
  const materialList: MaterialItem[] = []
  const headCounts: Record<string, number> = {}

  // Count sprinkler heads
  placedItems.forEach((item) => {
    headCounts[item.typeId] = (headCounts[item.typeId] || 0) + 1
  })

  Object.entries(headCounts).forEach(([typeId, quantity]) => {
    const headType = sprinklerHeadTypes.find((ht) => ht.id === typeId)
    if (headType) {
      materialList.push({
        id: typeId,
        name: headType.name,
        quantity,
        unit: "pcs",
      })
    }
  })

  // Main line pipe
  if (waterSupply.mainLineLength > 0) {
    materialList.push({
      id: "main-line-pipe",
      name: `Main Line Pipe (${waterSupply.mainLinePipeSize || "Specify Size"})`,
      quantity: waterSupply.mainLineLength,
      unit: waterSupply.mainLineLengthUnit,
    })
  }

  // Lateral line pipes (sum from user inputs per zone)
  let totalLateralLengthFt = 0
  const lateralPipesByZone: Record<string, number> = {} // To show per zone if needed later

  Object.entries(userInputPipeLengths).forEach(([zoneId, { length, unit }]) => {
    const lengthFt = convertLengthToFt(length, unit)
    totalLateralLengthFt += lengthFt
    lateralPipesByZone[zoneId] = lengthFt
  })

  if (totalLateralLengthFt > 0) {
    materialList.push({
      id: "lateral-pipe",
      name: "Lateral Pipe (Total Estimated)", // User specifies size implicitly or per zone
      quantity: Number.parseFloat(totalLateralLengthFt.toFixed(1)), // Sum of user inputs
      unit: "ft", // Standardized to feet for summary
    })
  }

  // Valves (one per zone, typically)
  if (zones.length > 0) {
    materialList.push({
      id: "zone-valves",
      name: 'Zone Valves (e.g., 1" Anti-Siphon)', // Generic name
      quantity: zones.length,
      unit: "pcs",
    })
  }

  // Controller (one for the system)
  if (zones.length > 0) {
    materialList.push({
      id: "irrigation-controller",
      name: `Irrigation Controller (${zones.length} Zone Capacity)`,
      quantity: 1,
      unit: "pcs",
    })
  }

  // TODO: Add fittings, wire, valve box, etc. (would require more assumptions or inputs)
  // For now, this is a basic list.

  return materialList
}
