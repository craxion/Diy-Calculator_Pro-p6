export type Unit = "inches" | "feet" | "cm" | "meters" | "mm"

export interface RequiredCut {
  id: string
  length: string // Store as string to allow empty input
  quantity: string
  unit: Unit
  label: string
  priority: boolean
  grainMatch: boolean
}

export interface DefectZone {
  id: string
  start: string
  end: string
  unit: Unit
}

export interface StockLumber {
  id: string
  length: string
  quantity: string
  unit: Unit
  costPerUnit: string // Cost per primary unit (e.g., per foot or per meter)
  costUnit: "per_foot" | "per_meter"
  defectZones: DefectZone[]
}

export interface OptimizerSettings {
  sawKerf: string
  kerfUnit: Unit
  minOffcutLength: string
  minOffcutUnit: Unit
  optimizationGoal: "minimize_waste" | "minimize_boards" | "prioritize_cuts" | "maximize_offcuts"
}

export interface PlacedCut {
  originalCutId: string
  label: string
  length: number // All internal calculations in a consistent unit (e.g., inches)
  xPosition: number // Position on the stock board
  priority: boolean
  grainMatch: boolean
}

export interface WasteSegment {
  length: number
  xPosition: number
  isUsableOffcut: boolean
}

export interface StockBoardCutPlan {
  stockBoardId: string // Original stock lumber ID
  stockBoardInstanceId: string // Unique ID for this specific instance of the stock board
  originalLength: number // Original length in consistent unit
  cuts: PlacedCut[]
  wasteSegments: WasteSegment[]
  defectZones: Array<{ start: number; end: number }> // In consistent unit
}

export interface OptimizationResults {
  cuttingPlanByBoard: StockBoardCutPlan[]
  totalWasteLength: number
  totalWastePercentage: number
  estimatedWasteCost: number
  stockUtilization: Array<{
    stockId: string
    originalLength: number
    unit: Unit
    quantityUsed: number
    utilizationPercentage: number
  }>
  unaccommodatedPieces: Array<{ label: string; length: number; unit: Unit; quantityRemaining: number }>
  optimalOffcuts: Array<{ length: number; unit: Unit; count: number; boardIds: string[] }>
  totalMaterialCost: number
  calculationTime: number // in ms
}

export const DEFAULT_UNITS: Unit = "inches"
export const COST_UNITS = {
  per_foot: "per foot",
  per_meter: "per meter",
}
export const LENGTH_UNITS: { value: Unit; label: string }[] = [
  { value: "inches", label: "in" },
  { value: "feet", label: "ft" },
  { value: "cm", label: "cm" },
  { value: "meters", label: "m" },
  { value: "mm", label: "mm" },
]
