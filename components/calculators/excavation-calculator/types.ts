export type ExcavationType = "rectangular" | "trench" | "circular"
export type DimensionUnit = "ft" | "in" | "m" | "cm"
export type DensityUnit = "lb/ft3" | "kg/m3"
export type VolumeUnit = "yd3" | "m3"

export interface ExcavationDimensions {
  length: number
  width: number
  depth: number
  diameter: number
  topWidth: number // For trench
  bottomWidth: number // For trench
  unit: DimensionUnit // A common unit for primary dimensions, or handle individually
  depthUnit: DimensionUnit
  diameterUnit: DimensionUnit
  topWidthUnit: DimensionUnit
  bottomWidthUnit: DimensionUnit
}

export interface SoilProperties {
  type: string // e.g., 'Clay', 'Sand', 'Custom'
  swellFactor: number // Percentage
  density: number
  densityUnit: DensityUnit
}

export interface CostInputs {
  disposalCostPerUnit: number
  disposalCostUnit: VolumeUnit
  truckCapacity: number
  truckCapacityUnit: VolumeUnit
  laborRate: number
  laborHours: number
  equipmentRate: number
  equipmentHours: number
}

export interface CalculationResults {
  originalVolumeFt3: number
  originalVolumeYd3: number
  originalVolumeM3: number
  expandedVolumeFt3: number
  expandedVolumeYd3: number
  expandedVolumeM3: number
  estimatedWeightLbs: number
  estimatedWeightKg: number
  disposalTrips: number
  costs: {
    disposal: number
    labor: number
    equipment: number
    total: number
  }
  dumpsterSuggestion?: {
    sizeYd3: number
    message: string
  }
  error?: string
}

export const soilTypeData: Record<string, { swell: number; densityLbFt3: number; densityKgM3: number }> = {
  "Loose Soil": { swell: 12.5, densityLbFt3: 75, densityKgM3: 1201 }, // approx
  "Sand/Gravel": { swell: 15, densityLbFt3: 95, densityKgM3: 1522 },
  Loam: { swell: 25, densityLbFt3: 85, densityKgM3: 1362 },
  "Compacted Clay": { swell: 35, densityLbFt3: 105, densityKgM3: 1682 },
  "Hard Rock (Blasted)": { swell: 50, densityLbFt3: 165, densityKgM3: 2643 },
  Custom: { swell: 20, densityLbFt3: 100, densityKgM3: 1602 }, // Default for custom
}

export const commonDimensionUnits: DimensionUnit[] = ["ft", "in", "m", "cm"]
export const commonDensityUnits: DensityUnit[] = ["lb/ft3", "kg/m3"]
export const commonVolumeUnits: VolumeUnit[] = ["yd3", "m3"]
export const dumpsterSizesYd3 = [10, 20, 30, 40]

export interface ExcavationFormState {
  excavationType: ExcavationType
  length: string
  lengthUnit: DimensionUnit
  width: string
  widthUnit: DimensionUnit
  depth: string
  depthUnit: DimensionUnit
  diameter: string
  diameterUnit: DimensionUnit
  topWidth: string // For trench
  topWidthUnit: DimensionUnit
  bottomWidth: string // For trench
  bottomWidthUnit: DimensionUnit

  soilType: string
  customSwellFactor: string
  customSoilDensity: string
  soilDensityUnit: DensityUnit

  disposalCostPerUnit: string
  disposalCostUnit: VolumeUnit
  truckCapacity: string
  truckCapacityUnit: VolumeUnit

  laborRate: string
  laborHours: string
  equipmentRate: string
  equipmentHours: string
}
