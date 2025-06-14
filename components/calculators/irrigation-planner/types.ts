import type { SVGProps, JSX } from "react"

export type Unit = "ft" | "m" | "in" | "cm"
export type FlowUnit = "gpm" | "lpm"
export type PressureUnit = "psi" | "bar"
export type SoilAbsorptionRateUnit = "in/hr" | "mm/hr"
export type WaterApplicationUnit = "in" | "mm"

export interface Point {
  x: number
  y: number
}

export interface CanvasArea {
  id: string
  name: string
  shape: "rectangle" | "circle" | "polygon"
  points?: Point[] // For polygons
  x?: number // For rectangle/circle center or top-left
  y?: number // For rectangle/circle center or top-left
  width?: number // For rectangle
  height?: number // For rectangle
  radius?: number // For circle
  plantType: string // Key from PlantTypeData
  sunExposure: "full-sun" | "partial-sun" | "partial-shade" | "full-shade"
  soilType: string // Key from SoilTypeData
  color?: string // For visual representation
}

export interface SprinklerHead {
  id: string // Unique ID for this instance of a head
  typeId: string // Key from SprinklerHeadData
  x: number // Position on canvas
  y: number // Position on canvas
  radius: number // Effective radius, can be adjusted from default
  arcStartAngle?: number // For rotors/arcs, 0-360
  arcEndAngle?: number // For rotors/arcs, 0-360
  rotation?: number // Overall rotation of the head in degrees (0-360)
  pressureAtHead?: number // Calculated PSI at this specific head
  flowRate?: number // Calculated GPM for this head at its pressure
  zoneId?: string | null
}

export interface IrrigationZone {
  id: string
  name: string
  itemIds: string[] // IDs of SprinklerHeads in this zone
  totalGPM: number
  pressureRequiredPSI: number // Min pressure required by heads in zone
  calculatedPressureAtZonePSI?: number // Pressure available at the start of this zone's laterals
  suggestedRunTimeMinutes?: number
  cycleSoakRecommendation?: CycleSoakRecommendation
  plantTypes: string[] // List of plant types in this zone
  color?: string // For visual representation
}

export interface CycleSoakRecommendation {
  runMinutesPerCycle: number
  soakMinutesBetweenCycles: number
  numberOfCycles: number
  totalRunTimeMinutes: number
  reason?: string
}

export interface WaterSupply {
  staticPressure: number
  pressureUnit: PressureUnit
  flowRate: number
  flowUnit: FlowUnit
  mainLinePipeSize: string // e.g., "0.75in", "1in"
  mainLineLength: number
  mainLineLengthUnit: Unit
}

export interface CanvasSettings {
  scale: number // Real-world units per canvas pixel at zoom = 1.0 (e.g., 0.1 means 1px = 0.1ft)
  scaleUnit: Unit // The real-world unit for the scale (e.g., 'ft', 'm')
  gridSpacing: number // In ground units
  snapToGrid: boolean
  showGrid: boolean
  canvasWidth: number // in pixels
  canvasHeight: number // in pixels
  pan: Point
  zoom: number
}

export type InteractionTool = "select" | "draw-polygon" | "place-sprinkler" | "pan" | "assign-zone"

export interface PlantTypeData {
  id: string
  name: string
  waterNeeds: "low" | "medium" | "high" // Inches or mm per week/application
  rootDepth?: number // Optional, for advanced calculations
}

export interface SoilTypeData {
  id: string
  name: string
  absorptionRate: number // e.g., inches/hour
  absorptionRateUnit: SoilAbsorptionRateUnit
  typicalSwellFactor?: number // Percentage
  typicalDensity?: number // lbs/ft³ or kg/m³
  color?: string // For visual representation on map if areas have soil types
}

export interface SprinklerHeadType {
  id: string
  name: string
  type: "spray" | "rotor" | "drip-emitter" | "bubbler"
  defaultGPM: number // At nominal pressure
  defaultRadius: number // At nominal pressure, in feet or meters
  defaultPressurePSI: number // Nominal operating pressure
  sprayPattern: "circle" | "arc" | "strip" | "square" // For sprays
  precipitationRate?: number // inches/hour at nominal spacing/pressure
  imageUrl?: string // For palette
  icon?: (props: SVGProps<SVGSVGElement>) => JSX.Element
}

export interface PipeFrictionLossData {
  pipeSize: string // e.g., "0.75in PVC Sch 40"
  data: Array<{ gpm: number; psiLossPer100ft: number }>
}

export interface MaterialItem {
  id: string
  name: string
  quantity: number
  unit?: string
  costPerUnit?: number
  totalCost?: number
}

export interface IrrigationResults {
  zones: IrrigationZone[]
  totalSystemGPM: number
  totalWaterUsageWeekly?: number // Gallons or Liters
  materialList: MaterialItem[]
  estimatedTotalCost?: number
  warnings: string[]
}

export interface IrrigationPlannerState {
  areas: CanvasArea[]
  placedItems: SprinklerHead[]
  zones: IrrigationZone[]
  waterSupply: WaterSupply
  canvasSettings: CanvasSettings
  currentTool: InteractionTool
  selectedAreaId?: string | null
  selectedItemId?: string | null
  selectedZoneId?: string | null
  selectedSprinklerTypeId?: string | null
  isDrawingPolygon: boolean
  currentPolygonPoints: Point[]
  pipeFrictionData: PipeFrictionLossData[]
  plantTypesData: PlantTypeData[]
  soilTypesData: SoilTypeData[]
  sprinklerHeadTypesData: SprinklerHeadType[]
  results: IrrigationResults | null
  userInputPipeLengths: Record<string, { length: number; unit: Unit }> // zoneId -> { length, unit }
  inchesOfWaterPerApplication: number // User input, e.g., 0.5 inches
}

export type IrrigationPlannerAction =
  | { type: "SET_TOOL"; payload: InteractionTool }
  | { type: "SET_CANVAS_SETTINGS"; payload: Partial<CanvasSettings> }
  | { type: "ADD_AREA"; payload: CanvasArea }
  | { type: "UPDATE_AREA"; payload: Partial<CanvasArea> & { id: string } }
  | { type: "DELETE_AREA"; payload: string }
  | { type: "START_DRAW_POLYGON" }
  | { type: "ADD_POLYGON_POINT"; payload: Point }
  | { type: "COMPLETE_POLYGON"; payload: Omit<CanvasArea, "id" | "points" | "shape"> }
  | { type: "CANCEL_DRAW_POLYGON" }
  | { type: "SET_SELECTED_SPRINKLER_TYPE"; payload: string | null }
  | { type: "PLACE_ITEM"; payload: Omit<SprinklerHead, "id"> }
  | { type: "UPDATE_ITEM"; payload: Partial<SprinklerHead> & { id: string } }
  | { type: "DELETE_ITEM"; payload: string }
  | { type: "SET_WATER_SUPPLY"; payload: Partial<WaterSupply> }
  | { type: "CREATE_ZONE"; payload: { name: string } }
  | { type: "UPDATE_ZONE_NAME"; payload: { id: string; name: string } }
  | { type: "DELETE_ZONE"; payload: string }
  | { type: "ASSIGN_ITEMS_TO_ZONE"; payload: { itemIds: string[]; zoneId: string | null } }
  | { type: "SET_SELECTED_ITEM"; payload: string | null }
  | { type: "SET_SELECTED_AREA"; payload: string | null }
  | { type: "SET_SELECTED_ZONE"; payload: string | null }
  | { type: "CALCULATE_RESULTS" }
  | { type: "SET_RESULTS"; payload: IrrigationResults | null }
  | { type: "ADD_WARNING"; payload: string }
  | { type: "CLEAR_WARNINGS" }
  | { type: "SET_USER_INPUT_PIPE_LENGTH"; payload: { zoneId: string; length: number; unit: Unit } }
  | { type: "SET_INCHES_OF_WATER_PER_APPLICATION"; payload: number }
  | { type: "PAN_CANVAS"; payload: Point }
  | { type: "ZOOM_CANVAS"; payload: { deltaY: number; mousePos: Point } }
  | { type: "RESET_PLANNER_STATE"; payload?: Partial<IrrigationPlannerState> }
