import type {
  Unit,
  FlowUnit,
  PressureUnit,
  Point,
  CanvasSettings,
  SoilAbsorptionRateUnit,
  WaterApplicationUnit,
} from "./types"

export const UNIT_CONVERSIONS = {
  length: {
    ft: 1,
    m: 3.28084,
    in: 1 / 12,
    cm: 0.0328084,
  },
  flow: {
    gpm: 1,
    lpm: 0.264172,
  },
  pressure: {
    psi: 1,
    bar: 14.5038,
  },
  absorptionRate: {
    "in/hr": 1,
    "mm/hr": 1 / 25.4,
  },
  waterApplication: {
    in: 1,
    mm: 1 / 25.4,
  },
}

export function convertLengthToFt(value: number, unit: Unit): number {
  return value * (UNIT_CONVERSIONS.length[unit] || 1)
}
export function convertFtToUnit(value: number, unit: Unit): number {
  return value / (UNIT_CONVERSIONS.length[unit] || 1)
}

export function convertFlowToGPM(value: number, unit: FlowUnit): number {
  return value * (UNIT_CONVERSIONS.flow[unit] || 1)
}
export function convertGPMToUnit(value: number, unit: FlowUnit): number {
  return value / (UNIT_CONVERSIONS.flow[unit] || 1)
}

export function convertPressureToPSI(value: number, unit: PressureUnit): number {
  return value * (UNIT_CONVERSIONS.pressure[unit] || 1)
}
export function convertPSIToUnit(value: number, unit: PressureUnit): number {
  return value / (UNIT_CONVERSIONS.pressure[unit] || 1)
}

export function convertAbsorptionRateToInHr(value: number, unit: SoilAbsorptionRateUnit): number {
  return value * (UNIT_CONVERSIONS.absorptionRate[unit] || 1)
}

export function convertWaterApplicationToIn(value: number, unit: WaterApplicationUnit): number {
  return value * (UNIT_CONVERSIONS.waterApplication[unit] || 1)
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Canvas coordinate transformations - REVISED based on new scale definition
// `settings.scale` is now: Real-world units per canvas pixel (at zoom=1.0)

export function worldToScreen(worldPoint: Point, settings: CanvasSettings): Point {
  const { scale, pan, zoom } = settings
  // 1. Convert world units to base canvas pixels (at zoom=1)
  const baseX = worldPoint.x / scale
  const baseY = worldPoint.y / scale

  // 2. Apply zoom
  const zoomedX = baseX * zoom
  const zoomedY = baseY * zoom

  // 3. Apply pan offset
  const screenX = zoomedX + pan.x
  const screenY = zoomedY + pan.y

  return { x: screenX, y: screenY }
}

export function screenToWorld(screenPoint: Point, settings: CanvasSettings): Point {
  const { scale, pan, zoom } = settings
  // 1. Remove pan offset
  const unpannedX = screenPoint.x - pan.x
  const unpannedY = screenPoint.y - pan.y

  // 2. Remove zoom
  const unzoomedX = unpannedX / zoom
  const unzoomedY = unpannedY / zoom

  // 3. Convert base canvas pixels back to world units
  const worldX = unzoomedX * scale
  const worldY = unzoomedY * scale

  return { x: worldX, y: worldY }
}

// Simple distance utility (works with any consistent coordinate system)
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

// Angle between two points in degrees
export function angle(p1: Point, p2: Point): number {
  const dy = p2.y - p1.y
  const dx = p2.x - p1.x
  let theta = Math.atan2(dy, dx) // radians
  theta *= 180 / Math.PI // degrees
  if (theta < 0) theta = 360 + theta // normalize to 0-360
  return theta
}

const distinctColors = [
  "rgba(255, 99, 132, 0.5)", // Red
  "rgba(54, 162, 235, 0.5)", // Blue
  "rgba(255, 206, 86, 0.5)", // Yellow
  "rgba(75, 192, 192, 0.5)", // Green
  "rgba(153, 102, 255, 0.5)", // Purple
  "rgba(255, 159, 64, 0.5)", // Orange
  "rgba(100, 100, 100, 0.5)", // Grey
  "rgba(200, 100, 50, 0.5)", // Brown
]
let colorIndex = 0

export function getNextDistinctColor(): string {
  const color = distinctColors[colorIndex % distinctColors.length]
  colorIndex++
  return color
}
