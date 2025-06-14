import type { IrrigationZone, SprinklerHead, PlantTypeData, WaterSupply, CanvasArea, SprinklerHeadType } from "../types"
import { calculateZoneGPM, calculatePressureRequiredForZone } from "./hydraulic"

export function validateZone(
  zone: IrrigationZone,
  placedItems: SprinklerHead[],
  sprinklerHeadTypes: SprinklerHeadType[],
  pressureAtZoneStartPSI: number,
  waterSupply: WaterSupply,
  areas: CanvasArea[],
  plantTypesData: PlantTypeData[],
): string[] {
  const warnings: string[] = []

  const zoneGPM = calculateZoneGPM(zone, placedItems, sprinklerHeadTypes)
  const minPressureRequiredPSI = calculatePressureRequiredForZone(zone, placedItems, sprinklerHeadTypes)

  // Check Flow
  if (zoneGPM > waterSupply.flowRate) {
    // Assuming waterSupply.flowRate is already in GPM
    warnings.push(
      `Zone "${zone.name}" GPM (${zoneGPM.toFixed(1)}) exceeds available supply (${waterSupply.flowRate.toFixed(1)} GPM).`,
    )
  }

  // Check Pressure
  if (minPressureRequiredPSI > pressureAtZoneStartPSI) {
    warnings.push(
      `Zone "${zone.name}" requires ${minPressureRequiredPSI.toFixed(0)} PSI, but only ${pressureAtZoneStartPSI.toFixed(0)} PSI is available at zone start (after main line loss).`,
    )
  }

  // Check Hydrozoning (simplified)
  const plantTypeIdsInZone = new Set<string>()
  zone.itemIds.forEach((itemId) => {
    const item = placedItems.find((p) => p.id === itemId)
    if (item) {
      // Find which area this item is in (this is a simplification, item might cover multiple areas)
      // For now, let's assume an item is primarily associated with one area based on its coords
      // This needs a more robust point-in-polygon check or area assignment to items
      const itemArea = areas.find((area) => {
        if (!area.points || area.points.length === 0) return false // Simplification: only check polygon areas
        // Basic bounding box check for now
        if (area.shape === "polygon" && area.points) {
          let minX = Number.POSITIVE_INFINITY,
            maxX = Number.NEGATIVE_INFINITY,
            minY = Number.POSITIVE_INFINITY,
            maxY = Number.NEGATIVE_INFINITY
          area.points.forEach((p) => {
            minX = Math.min(minX, p.x)
            maxX = Math.max(maxX, p.x)
            minY = Math.min(minY, p.y)
            maxY = Math.max(maxY, p.y)
          })
          return item.x >= minX && item.x <= maxX && item.y >= minY && item.y <= maxY
        }
        return false
      })
      if (itemArea) {
        plantTypeIdsInZone.add(itemArea.plantType)
      }
    }
  })

  if (plantTypeIdsInZone.size > 1) {
    const waterNeedsInZone = new Set<PlantTypeData["waterNeeds"]>()
    plantTypeIdsInZone.forEach((ptId) => {
      const plantType = plantTypesData.find((ptd) => ptd.id === ptId)
      if (plantType) {
        waterNeedsInZone.add(plantType.waterNeeds)
      }
    })
    if (waterNeedsInZone.size > 1) {
      warnings.push(
        `Zone "${zone.name}" contains plants with mixed water needs (${Array.from(waterNeedsInZone).join(", ")}). Consider separating them for better efficiency.`,
      )
    }
  }

  return warnings
}
