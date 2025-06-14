"use client"
import { useReducer, useEffect, useCallback, useState, useRef } from "react"
import type React from "react"

import type {
  IrrigationPlannerState,
  IrrigationPlannerAction,
  Point,
  CanvasArea,
  SprinklerHead,
  IrrigationZone,
} from "../types"
import Toolbar from "./toolbar"
import InputPanel from "./input-panel"
import IrrigationCanvas from "./irrigation-canvas"
import ResultsPanel from "./results-panel"
import { Button } from "@/components/ui/button"
import {
  generateId,
  getNextDistinctColor,
  convertLengthToFt,
  angle as calculateAngle,
  worldToScreen,
  distance,
} from "../utils" // Added screenToWorld, distance
import {
  DEFAULT_PLANT_TYPES,
  DEFAULT_SOIL_TYPES,
  DEFAULT_SPRINKLER_HEAD_TYPES,
  DEFAULT_PIPE_FRICTION_DATA,
  COMMON_PIPE_SIZES,
} from "../data/default-data"
import {
  calculateMainLinePressureLoss,
  calculatePressureAtZoneStart,
  calculateZoneGPM as calculateRawZoneGPM,
  calculatePressureRequiredForZone,
  calculateLateralLinePressureLoss,
} from "../logic/hydraulic"
import { validateZone } from "../logic/zoning"
import {
  calculateBaseRunTimeMinutes,
  calculateZonePrecipitationRate,
  getCycleSoakRecommendation,
} from "../logic/scheduling"
import { generateMaterialList as generateRawMaterialList } from "../logic/materials"
import { convertWaterApplicationToIn } from "../utils"

const initialState: IrrigationPlannerState = {
  areas: [],
  placedItems: [],
  zones: [],
  waterSupply: {
    staticPressure: 60,
    pressureUnit: "psi",
    flowRate: 10,
    flowUnit: "gpm",
    mainLinePipeSize: COMMON_PIPE_SIZES[1],
    mainLineLength: 50,
    mainLineLengthUnit: "ft",
  },
  canvasSettings: {
    scale: 0.1, // Real-world units (e.g., feet) per canvas pixel at zoom=1.0. (1px = 0.1ft means 10px = 1ft)
    scaleUnit: "ft", // Default unit for the scale
    gridSpacing: 5, // in world units (e.g. 5 feet)
    snapToGrid: true,
    showGrid: true,
    canvasWidth: 800,
    canvasHeight: 600,
    pan: { x: 50, y: 50 },
    zoom: 1,
  },
  currentTool: "select",
  selectedAreaId: null,
  selectedItemId: null,
  selectedZoneId: null,
  selectedSprinklerTypeId: DEFAULT_SPRINKLER_HEAD_TYPES[0].id,
  isDrawingPolygon: false,
  currentPolygonPoints: [],
  pipeFrictionData: DEFAULT_PIPE_FRICTION_DATA,
  plantTypesData: DEFAULT_PLANT_TYPES,
  soilTypesData: DEFAULT_SOIL_TYPES,
  sprinklerHeadTypesData: DEFAULT_SPRINKLER_HEAD_TYPES,
  results: null,
  userInputPipeLengths: {},
  inchesOfWaterPerApplication: 0.5,
}

function irrigationPlannerReducer(
  state: IrrigationPlannerState,
  action: IrrigationPlannerAction,
): IrrigationPlannerState {
  switch (action.type) {
    case "SET_TOOL":
      return {
        ...state,
        currentTool: action.payload,
        isDrawingPolygon: action.payload === "draw-polygon" ? state.isDrawingPolygon : false,
        // currentPolygonPoints: action.payload === "draw-polygon" ? state.currentPolygonPoints : [], // Keep points if switching away and back
      }
    case "SET_CANVAS_SETTINGS":
      return { ...state, canvasSettings: { ...state.canvasSettings, ...action.payload } }
    case "ADD_AREA":
      return { ...state, areas: [...state.areas, action.payload] }
    case "UPDATE_AREA": {
      const { id, ...update } = action.payload
      return { ...state, areas: state.areas.map((a) => (a.id === id ? { ...a, ...update } : a)) }
    }
    case "DELETE_AREA":
      return {
        ...state,
        areas: state.areas.filter((a) => a.id !== action.payload),
        selectedAreaId: state.selectedAreaId === action.payload ? null : state.selectedAreaId,
      }

    case "START_DRAW_POLYGON": // Should be dispatched when tool is selected and first point is about to be laid
      return { ...state, isDrawingPolygon: true, currentPolygonPoints: [] }
    case "ADD_POLYGON_POINT":
      if (!state.isDrawingPolygon && state.currentTool !== "draw-polygon") return state // Only add if in correct mode/state
      let point = action.payload
      if (state.canvasSettings.snapToGrid && state.canvasSettings.gridSpacing > 0) {
        point = {
          x: Math.round(point.x / state.canvasSettings.gridSpacing) * state.canvasSettings.gridSpacing,
          y: Math.round(point.y / state.canvasSettings.gridSpacing) * state.canvasSettings.gridSpacing,
        }
      }
      return { ...state, currentPolygonPoints: [...state.currentPolygonPoints, point], isDrawingPolygon: true } // Ensure isDrawingPolygon is true
    case "COMPLETE_POLYGON": {
      if (!state.isDrawingPolygon || state.currentPolygonPoints.length < 3)
        return { ...state, isDrawingPolygon: false, currentPolygonPoints: [] } // Reset if not enough points
      const newArea: CanvasArea = {
        id: generateId(),
        name: action.payload.name || `Area ${state.areas.length + 1}`,
        shape: "polygon",
        points: state.currentPolygonPoints,
        plantType: action.payload.plantType || state.plantTypesData[0]?.id,
        sunExposure: action.payload.sunExposure || "full-sun",
        soilType: action.payload.soilType || state.soilTypesData[0]?.id,
        color: action.payload.color || getNextDistinctColor(),
      }
      return {
        ...state,
        areas: [...state.areas, newArea],
        isDrawingPolygon: false,
        currentPolygonPoints: [],
        currentTool: "select",
      }
    }
    case "CANCEL_DRAW_POLYGON":
      return { ...state, isDrawingPolygon: false, currentPolygonPoints: [], currentTool: "select" }

    case "SET_SELECTED_SPRINKLER_TYPE":
      return { ...state, selectedSprinklerTypeId: action.payload }
    case "PLACE_ITEM": {
      const newItem: SprinklerHead = { ...action.payload, id: generateId() }
      if (state.canvasSettings.snapToGrid && state.canvasSettings.gridSpacing > 0) {
        newItem.x = Math.round(newItem.x / state.canvasSettings.gridSpacing) * state.canvasSettings.gridSpacing
        newItem.y = Math.round(newItem.y / state.canvasSettings.gridSpacing) * state.canvasSettings.gridSpacing
      }
      const headType = state.sprinklerHeadTypesData.find((ht) => ht.id === newItem.typeId)
      if (headType) {
        newItem.radius = headType.defaultRadius
        if (headType.type === "rotor" || headType.sprayPattern === "arc") {
          newItem.arcStartAngle = 0
          newItem.arcEndAngle = 90 // Default arc
        }
      }
      return { ...state, placedItems: [...state.placedItems, newItem] }
    }
    case "UPDATE_ITEM": {
      const { id, ...update } = action.payload
      return {
        ...state,
        placedItems: state.placedItems.map((item) => (item.id === id ? { ...item, ...update } : item)),
      }
    }
    case "DELETE_ITEM":
      return {
        ...state,
        placedItems: state.placedItems.filter((item) => item.id !== action.payload),
        selectedItemId: state.selectedItemId === action.payload ? null : state.selectedItemId,
        zones: state.zones.map((zone) => ({
          ...zone,
          itemIds: zone.itemIds.filter((id) => id !== action.payload),
        })),
      }
    case "SET_WATER_SUPPLY":
      return { ...state, waterSupply: { ...state.waterSupply, ...action.payload } }

    case "CREATE_ZONE": {
      const newZone: IrrigationZone = {
        id: generateId(),
        name: action.payload.name,
        itemIds: [],
        totalGPM: 0,
        pressureRequiredPSI: 0,
        color: getNextDistinctColor(),
      }
      return { ...state, zones: [...state.zones, newZone] }
    }
    case "UPDATE_ZONE_NAME":
      return {
        ...state,
        zones: state.zones.map((z) => (z.id === action.payload.id ? { ...z, name: action.payload.name } : z)),
      }
    case "DELETE_ZONE":
      return {
        ...state,
        zones: state.zones.filter((z) => z.id !== action.payload),
        placedItems: state.placedItems.map((item) =>
          item.zoneId === action.payload ? { ...item, zoneId: null } : item,
        ),
        selectedZoneId: state.selectedZoneId === action.payload ? null : state.selectedZoneId,
      }
    case "ASSIGN_ITEMS_TO_ZONE": {
      const { itemIds, zoneId } = action.payload
      return {
        ...state,
        placedItems: state.placedItems.map((item) => (itemIds.includes(item.id) ? { ...item, zoneId } : item)),
        zones: state.zones.map((zone) => {
          let newItemIds = zone.itemIds.filter((id) => !itemIds.includes(id))
          if (zone.id === zoneId) {
            newItemIds = [...new Set([...newItemIds, ...itemIds])]
          }
          return { ...zone, itemIds: newItemIds }
        }),
      }
    }
    case "SET_SELECTED_ITEM":
      return {
        ...state,
        selectedItemId: action.payload,
        selectedAreaId: null,
        currentTool: action.payload ? "select" : state.currentTool,
      }
    case "SET_SELECTED_AREA":
      return {
        ...state,
        selectedAreaId: action.payload,
        selectedItemId: null,
        currentTool: action.payload ? "select" : state.currentTool,
      }
    case "SET_SELECTED_ZONE":
      return { ...state, selectedZoneId: action.payload }

    case "CALCULATE_RESULTS": {
      const warnings: string[] = []
      let overallSystemGPM = 0
      let maxZoneGPMForMainLineCalc = 0
      state.zones.forEach((zone) => {
        const zoneGPM = calculateRawZoneGPM(zone, state.placedItems, state.sprinklerHeadTypesData)
        if (zoneGPM > maxZoneGPMForMainLineCalc) {
          maxZoneGPMForMainLineCalc = zoneGPM
        }
      })
      overallSystemGPM = maxZoneGPMForMainLineCalc

      const mainLinePressureLoss = calculateMainLinePressureLoss(
        state.waterSupply,
        maxZoneGPMForMainLineCalc,
        state.pipeFrictionData,
      )
      const pressureAtManifoldPSI = calculatePressureAtZoneStart(state.waterSupply, mainLinePressureLoss)

      const updatedZones = state.zones.map((zone) => {
        const zoneGPM = calculateRawZoneGPM(zone, state.placedItems, state.sprinklerHeadTypesData)
        const pressureRequiredPSI = calculatePressureRequiredForZone(
          zone,
          state.placedItems,
          state.sprinklerHeadTypesData,
        )
        const userLateralLengthFt = convertLengthToFt(
          state.userInputPipeLengths[zone.id]?.length || 0,
          state.userInputPipeLengths[zone.id]?.unit || "ft",
        )
        const assumedLateralPipeSize = state.waterSupply.mainLinePipeSize.includes("0.75")
          ? "0.75in PVC Sch 40"
          : "1in PVC Sch 40"
        const lateralLossPSI = calculateLateralLinePressureLoss(
          zoneGPM,
          userLateralLengthFt,
          assumedLateralPipeSize,
          state.pipeFrictionData,
        )
        const pressureAtZoneValvesPSI = pressureAtManifoldPSI - lateralLossPSI
        const zoneWarnings = validateZone(
          { ...zone, totalGPM: zoneGPM, pressureRequiredPSI },
          state.placedItems,
          state.sprinklerHeadTypesData,
          pressureAtZoneValvesPSI,
          state.waterSupply,
          state.areas,
          state.plantTypesData,
        )
        warnings.push(...zoneWarnings.map((w) => `Zone "${zone.name}": ${w}`))
        const precipitationRateInHr = calculateZonePrecipitationRate(
          zone,
          state.placedItems,
          state.sprinklerHeadTypesData,
        )
        const inchesToApply = convertWaterApplicationToIn(state.inchesOfWaterPerApplication, "in")
        const baseRunTimeMinutes = calculateBaseRunTimeMinutes(inchesToApply, precipitationRateInHr)
        let primarySoilTypeIdForZone = state.areas[0]?.soilType
        if (state.areas.length > 0) {
          const firstItemId = zone.itemIds[0]
          const firstItem = state.placedItems.find((i) => i.id === firstItemId)
          if (firstItem) {
            const containingArea = state.areas.find((a) => {
              if (a.shape === "polygon" && a.points) {
                let minX = Number.POSITIVE_INFINITY,
                  maxX = Number.NEGATIVE_INFINITY,
                  minY = Number.POSITIVE_INFINITY,
                  maxY = Number.NEGATIVE_INFINITY
                a.points.forEach((p) => {
                  minX = Math.min(minX, p.x)
                  maxX = Math.max(maxX, p.x)
                  minY = Math.min(minY, p.y)
                  maxY = Math.max(maxY, p.y)
                })
                return firstItem.x >= minX && firstItem.x <= maxX && firstItem.y >= minY && firstItem.y <= maxY
              }
              return false
            })
            if (containingArea) primarySoilTypeIdForZone = containingArea.soilType
          }
        }
        const soilType = state.soilTypesData.find((st) => st.id === primarySoilTypeIdForZone)
        const cycleSoak = getCycleSoakRecommendation(baseRunTimeMinutes, soilType, precipitationRateInHr)
        return {
          ...zone,
          totalGPM: zoneGPM,
          pressureRequiredPSI,
          calculatedPressureAtZonePSI: pressureAtZoneValvesPSI,
          suggestedRunTimeMinutes: baseRunTimeMinutes,
          cycleSoakRecommendation: cycleSoak,
        }
      })
      const materialList = generateRawMaterialList(
        state.placedItems,
        state.sprinklerHeadTypesData,
        updatedZones,
        state.waterSupply,
        state.userInputPipeLengths,
      )
      const wateringsPerWeek = 3
      const totalWaterUsageWeekly = updatedZones.reduce((acc, zone) => {
        const runTimeHours = (zone.suggestedRunTimeMinutes || 0) / 60
        return acc + zone.totalGPM * runTimeHours * wateringsPerWeek * 60
      }, 0)
      return {
        ...state,
        zones: updatedZones,
        results: {
          zones: updatedZones,
          totalSystemGPM: overallSystemGPM,
          warnings: [...new Set(warnings)],
          materialList,
          totalWaterUsageWeekly,
        },
      }
    }
    case "SET_RESULTS":
      return { ...state, results: action.payload }
    case "ADD_WARNING":
      return {
        ...state,
        results: state.results
          ? { ...state.results, warnings: [...new Set([...state.results.warnings, action.payload])] }
          : { zones: [], totalSystemGPM: 0, materialList: [], warnings: [action.payload] },
      }
    case "CLEAR_WARNINGS":
      return { ...state, results: state.results ? { ...state.results, warnings: [] } : null }

    case "SET_USER_INPUT_PIPE_LENGTH":
      return {
        ...state,
        userInputPipeLengths: {
          ...state.userInputPipeLengths,
          [action.payload.zoneId]: { length: action.payload.length, unit: action.payload.unit },
        },
      }
    case "SET_INCHES_OF_WATER_PER_APPLICATION":
      return { ...state, inchesOfWaterPerApplication: action.payload }

    case "PAN_CANVAS": // Pan delta is in screen pixels
      return {
        ...state,
        canvasSettings: {
          ...state.canvasSettings,
          pan: { x: state.canvasSettings.pan.x + action.payload.x, y: state.canvasSettings.pan.y + action.payload.y },
        },
      }
    case "ZOOM_CANVAS": {
      // mousePos is screen coordinate
      const { deltaY, mousePos } = action.payload
      const { zoom, pan, scale } = state.canvasSettings // scale is world units per pixel
      const zoomFactor = 0.1
      const newZoom = deltaY < 0 ? zoom * (1 + zoomFactor) : zoom / (1 + zoomFactor)
      const clampedZoom = Math.max(0.05, Math.min(newZoom, 20)) // Wider zoom range

      // World coordinates of mouse position BEFORE zoom
      const worldMouseXBefore = ((mousePos.x - pan.x) / zoom) * scale
      const worldMouseYBefore = ((mousePos.y - pan.y) / zoom) * scale

      // New pan position to keep mouse position fixed in world space
      // (worldMouseXBefore / newScale) * newZoom + newPanX = mousePos.x
      // newPanX = mousePos.x - (worldMouseXBefore / scale) * clampedZoom
      const newPanX = mousePos.x - (worldMouseXBefore / scale) * clampedZoom
      const newPanY = mousePos.y - (worldMouseYBefore / scale) * clampedZoom

      return {
        ...state,
        canvasSettings: { ...state.canvasSettings, zoom: clampedZoom, pan: { x: newPanX, y: newPanY } },
      }
    }
    case "RESET_PLANNER_STATE":
      return {
        ...initialState,
        ...action.payload,
        pipeFrictionData: DEFAULT_PIPE_FRICTION_DATA,
        plantTypesData: DEFAULT_PLANT_TYPES,
        soilTypesData: DEFAULT_SOIL_TYPES,
        sprinklerHeadTypesData: DEFAULT_SPRINKLER_HEAD_TYPES,
      }
    default:
      return state
  }
}

export default function IrrigationPlannerClient() {
  const [state, dispatch] = useReducer(irrigationPlannerReducer, initialState)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const svgRefDirect = useRef<SVGSVGElement>(null) // For direct SVG manipulation if needed

  // Interaction state for dragging, etc.
  const [interactionState, setInteractionState] = useState<{
    type: null | "pan" | "drag-item" | "drag-area-vertex" | "rotate-item-handle"
    itemId?: string
    areaId?: string
    vertexIndex?: number
    handleType?: "arc-start" | "arc-end"
    dragStartPointScreen: Point // Screen coords
    dragStartPointWorld: Point // World coords
    originalPan?: Point // For panning
    originalItemPos?: Point // For item dragging
    originalVertexPos?: Point // For vertex dragging
    originalArcAngles?: { start: number; end: number } // For arc rotation
  } | null>(null)

  useEffect(() => {
    setIsClient(true)
    const updateCanvasSize = () => {
      if (canvasContainerRef.current) {
        dispatch({
          type: "SET_CANVAS_SETTINGS",
          payload: {
            canvasWidth: canvasContainerRef.current.offsetWidth,
            canvasHeight: canvasContainerRef.current.offsetHeight,
          },
        })
      }
    }
    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)
    return () => window.removeEventListener("resize", updateCanvasSize)
  }, [])

  const handleCalculateResults = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      dispatch({ type: "CALCULATE_RESULTS" })
      setIsLoading(false)
    }, 50)
  }, [])

  const handleCanvasMouseDown = useCallback(
    (
      worldPoint: Point,
      e: React.MouseEvent<SVGSVGElement>,
      targetType?: string,
      targetId?: string,
      handleTypeStr?: string,
    ) => {
      e.preventDefault()
      const dragStartPointScreen = { x: e.clientX, y: e.clientY }

      if (e.buttons === 2 || e.buttons === 4 || state.currentTool === "pan") {
        // Right/Middle mouse for pan or Pan tool
        setInteractionState({
          type: "pan",
          dragStartPointScreen,
          dragStartPointWorld: worldPoint,
          originalPan: state.canvasSettings.pan,
        })
        if (svgRefDirect.current) svgRefDirect.current.classList.add("grabbing")
      } else if (state.currentTool === "draw-polygon") {
        if (!state.isDrawingPolygon) {
          dispatch({ type: "START_DRAW_POLYGON" }) // Initialize points array
          dispatch({ type: "ADD_POLYGON_POINT", payload: worldPoint })
        } else {
          if (state.currentPolygonPoints.length > 2) {
            const firstPointScreen = worldToScreen(state.currentPolygonPoints[0], state.canvasSettings)
            const clickScreenForClose = {
              x: e.clientX - (e.currentTarget.getBoundingClientRect()?.left || 0),
              y: e.clientY - (e.currentTarget.getBoundingClientRect()?.top || 0),
            }
            if (distance(clickScreenForClose, firstPointScreen) < 15 / state.canvasSettings.zoom) {
              // Adjusted tolerance
              dispatch({ type: "COMPLETE_POLYGON", payload: { name: `Area ${state.areas.length + 1}` } })
              return
            }
          }
          dispatch({ type: "ADD_POLYGON_POINT", payload: worldPoint })
        }
      } else if (state.currentTool === "place-sprinkler" && state.selectedSprinklerTypeId) {
        dispatch({
          type: "PLACE_ITEM",
          payload: { typeId: state.selectedSprinklerTypeId, x: worldPoint.x, y: worldPoint.y, radius: 0 },
        })
      } else if (state.currentTool === "select") {
        if (targetType === "item-handle" && targetId && handleTypeStr) {
          const item = state.placedItems.find((it) => it.id === targetId)
          if (item) {
            setInteractionState({
              type: "rotate-item-handle",
              itemId: targetId,
              handleType: handleTypeStr as "arc-start" | "arc-end",
              dragStartPointScreen,
              dragStartPointWorld: worldPoint,
              originalArcAngles: { start: item.arcStartAngle ?? 0, end: item.arcEndAngle ?? 90 },
            })
            dispatch({ type: "SET_SELECTED_ITEM", payload: targetId })
          }
        } else if (targetType === "item" && targetId) {
          const item = state.placedItems.find((it) => it.id === targetId)
          if (item) {
            setInteractionState({
              type: "drag-item",
              itemId: targetId,
              dragStartPointScreen,
              dragStartPointWorld: worldPoint,
              originalItemPos: { x: item.x, y: item.y },
            })
            dispatch({ type: "SET_SELECTED_ITEM", payload: targetId })
          }
        } else if (targetType === "area-vertex" && targetId && handleTypeStr) {
          // handleTypeStr is vertexIndex here
          const area = state.areas.find((a) => a.id === targetId)
          const vertexIndex = Number.parseInt(handleTypeStr, 10)
          if (area && area.points && area.points[vertexIndex]) {
            setInteractionState({
              type: "drag-area-vertex",
              areaId: targetId,
              vertexIndex,
              dragStartPointScreen,
              dragStartPointWorld: worldPoint,
              originalVertexPos: area.points[vertexIndex],
            })
            dispatch({ type: "SET_SELECTED_AREA", payload: targetId })
          }
        } else if (targetType === "area" && targetId) {
          dispatch({ type: "SET_SELECTED_AREA", payload: targetId })
          // Potentially allow dragging whole areas later
        } else {
          // Clicked on empty space
          dispatch({ type: "SET_SELECTED_ITEM", payload: null })
          dispatch({ type: "SET_SELECTED_AREA", payload: null })
        }
      }
    },
    [state, dispatch], // state includes all sub-properties like currentTool, canvasSettings etc.
  )

  const handleCanvasMouseMove = useCallback(
    (worldPoint: Point, e: React.MouseEvent<SVGSVGElement>) => {
      if (!interactionState) return
      e.preventDefault()
      const currentScreenPoint = { x: e.clientX, y: e.clientY }

      if (interactionState.type === "pan" && interactionState.originalPan) {
        const dx = currentScreenPoint.x - interactionState.dragStartPointScreen.x
        const dy = currentScreenPoint.y - interactionState.dragStartPointScreen.y
        dispatch({ type: "PAN_CANVAS", payload: { x: dx, y: dy } })
        // Update dragStartPoint for continuous panning relative to new pan
        setInteractionState((prev) =>
          prev
            ? {
                ...prev,
                dragStartPointScreen: currentScreenPoint,
                originalPan: { x: prev.originalPan!.x + dx, y: prev.originalPan!.y + dy },
              }
            : null,
        )
      } else if (interactionState.type === "drag-item" && interactionState.itemId && interactionState.originalItemPos) {
        const dxWorld = worldPoint.x - interactionState.dragStartPointWorld.x
        const dyWorld = worldPoint.y - interactionState.dragStartPointWorld.y
        let newX = interactionState.originalItemPos.x + dxWorld
        let newY = interactionState.originalItemPos.y + dyWorld
        if (state.canvasSettings.snapToGrid && state.canvasSettings.gridSpacing > 0) {
          newX = Math.round(newX / state.canvasSettings.gridSpacing) * state.canvasSettings.gridSpacing
          newY = Math.round(newY / state.canvasSettings.gridSpacing) * state.canvasSettings.gridSpacing
        }
        dispatch({ type: "UPDATE_ITEM", payload: { id: interactionState.itemId, x: newX, y: newY } })
      } else if (
        interactionState.type === "drag-area-vertex" &&
        interactionState.areaId &&
        interactionState.originalVertexPos &&
        interactionState.vertexIndex !== undefined
      ) {
        const area = state.areas.find((a) => a.id === interactionState.areaId)
        if (area && area.points) {
          const dxWorld = worldPoint.x - interactionState.dragStartPointWorld.x
          const dyWorld = worldPoint.y - interactionState.dragStartPointWorld.y
          const newPoint = {
            x: interactionState.originalVertexPos.x + dxWorld,
            y: interactionState.originalVertexPos.y + dyWorld,
          }
          if (state.canvasSettings.snapToGrid && state.canvasSettings.gridSpacing > 0) {
            newPoint.x = Math.round(newPoint.x / state.canvasSettings.gridSpacing) * state.canvasSettings.gridSpacing
            newPoint.y = Math.round(newPoint.y / state.canvasSettings.gridSpacing) * state.canvasSettings.gridSpacing
          }
          const updatedPoints = [...area.points]
          updatedPoints[interactionState.vertexIndex] = newPoint
          dispatch({ type: "UPDATE_AREA", payload: { id: interactionState.areaId, points: updatedPoints } })
        }
      } else if (
        interactionState.type === "rotate-item-handle" &&
        interactionState.itemId &&
        interactionState.originalArcAngles
      ) {
        const item = state.placedItems.find((it) => it.id === interactionState.itemId)
        if (item) {
          const itemScreenPos = worldToScreen({ x: item.x, y: item.y }, state.canvasSettings)
          const currentMouseScreenPos = {
            x: e.clientX - (e.currentTarget.getBoundingClientRect()?.left || 0),
            y: e.clientY - (e.currentTarget.getBoundingClientRect()?.top || 0),
          }
          const newAngle = calculateAngle(itemScreenPos, currentMouseScreenPos) // Angle from item center to mouse

          let { start, end } = interactionState.originalArcAngles
          if (interactionState.handleType === "arc-start") {
            start = newAngle
          } else {
            // arc-end
            end = newAngle
          }
          // Normalize angles and ensure start < end for typical representation, or handle wrap-around
          // For now, just update directly. Add normalization if needed.
          dispatch({
            type: "UPDATE_ITEM",
            payload: { id: interactionState.itemId, arcStartAngle: start, arcEndAngle: end },
          })
        }
      }
    },
    [interactionState, state.canvasSettings, state.areas, state.placedItems, dispatch],
  )

  const handleCanvasMouseUp = useCallback(
    (worldPoint: Point, e: React.MouseEvent<SVGSVGElement>) => {
      if (interactionState?.type === "pan" && svgRefDirect.current) {
        svgRefDirect.current.classList.remove("grabbing")
      }
      setInteractionState(null)
      // Other logic from previous mouseup if needed
      if (state.currentTool === "assign-zone" && state.selectedItemId && state.selectedZoneId) {
        dispatch({
          type: "ASSIGN_ITEMS_TO_ZONE",
          payload: { itemIds: [state.selectedItemId], zoneId: state.selectedZoneId },
        })
      }
    },
    [state.currentTool, state.selectedItemId, state.selectedZoneId, dispatch, interactionState],
  )

  const handleCanvasWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault()
      const svgRect = e.currentTarget.getBoundingClientRect()
      const mousePos = { x: e.clientX - svgRect.left, y: e.clientY - svgRect.top } // Screen coordinates of mouse
      dispatch({ type: "ZOOM_CANVAS", payload: { deltaY: e.deltaY, mousePos } })
    },
    [dispatch],
  )

  const handleCompletePolygon = useCallback(() => {
    dispatch({ type: "COMPLETE_POLYGON", payload: { name: `Area ${state.areas.length + 1}` } })
  }, [dispatch, state.areas.length])

  const handleDeleteSelected = useCallback(() => {
    if (state.selectedItemId) {
      dispatch({ type: "DELETE_ITEM", payload: state.selectedItemId })
    } else if (state.selectedAreaId) {
      dispatch({ type: "DELETE_AREA", payload: state.selectedAreaId })
    }
  }, [state.selectedItemId, state.selectedAreaId, dispatch])

  if (!isClient) {
    return <div className="p-8 text-center text-medium-grey">Loading Planner Interface...</div>
  }

  return (
    <div className="flex flex-col md:flex-row gap-0 md:gap-4 h-[calc(100vh-180px)] md:h-[calc(100vh-200px)] max-h-[900px] min-h-[600px]">
      <div className="w-full md:w-[300px] lg:w-[380px] flex-shrink-0 overflow-y-auto">
        <InputPanel
          waterSupply={state.waterSupply}
          onWaterSupplyChange={(update) => dispatch({ type: "SET_WATER_SUPPLY", payload: update })}
          areas={state.areas}
          onAddArea={(area) => dispatch({ type: "ADD_AREA", payload: area })}
          onUpdateArea={(areaUpdate) => dispatch({ type: "UPDATE_AREA", payload: areaUpdate })}
          onDeleteArea={(id) => dispatch({ type: "DELETE_AREA", payload: id })}
          sprinklerHeadTypes={state.sprinklerHeadTypesData}
          selectedSprinklerTypeId={state.selectedSprinklerTypeId}
          onSelectSprinklerType={(id) => dispatch({ type: "SET_SELECTED_SPRINKLER_TYPE", payload: id })}
          plantTypes={state.plantTypesData}
          soilTypes={state.soilTypesData}
          zones={state.zones}
          onCreateZone={(name) => dispatch({ type: "CREATE_ZONE", payload: { name } })}
          onAssignItemsToZone={(itemIds, zoneId) =>
            dispatch({ type: "ASSIGN_ITEMS_TO_ZONE", payload: { itemIds, zoneId } })
          }
          currentTool={state.currentTool}
          onSetTool={(tool) => dispatch({ type: "SET_TOOL", payload: tool })}
          userInputPipeLengths={state.userInputPipeLengths}
          onSetUserInputPipeLength={(zoneId, length, unit) =>
            dispatch({ type: "SET_USER_INPUT_PIPE_LENGTH", payload: { zoneId, length, unit } })
          }
          inchesOfWaterPerApplication={state.inchesOfWaterPerApplication}
          onSetInchesOfWaterPerApplication={(val) =>
            dispatch({ type: "SET_INCHES_OF_WATER_PER_APPLICATION", payload: val })
          }
          commonPipeSizes={COMMON_PIPE_SIZES}
          canvasSettings={state.canvasSettings}
          onCanvasSettingsChange={(settingsUpdate) =>
            dispatch({ type: "SET_CANVAS_SETTINGS", payload: settingsUpdate })
          }
        />
      </div>

      <div className="flex-grow flex flex-col min-w-0 h-full mt-4 md:mt-0">
        <Toolbar
          currentTool={state.currentTool}
          onSetTool={(tool) => dispatch({ type: "SET_TOOL", payload: tool })}
          canCompletePolygon={state.isDrawingPolygon && state.currentPolygonPoints.length >= 3}
          onCompletePolygon={handleCompletePolygon}
          onCancelPolygon={() => dispatch({ type: "CANCEL_DRAW_POLYGON" })}
          onDeleteSelected={handleDeleteSelected}
          selectedItemId={state.selectedItemId}
          selectedAreaId={state.selectedAreaId}
        />
        <div
          ref={canvasContainerRef}
          className="flex-grow relative border border-medium-grey/30 rounded-md bg-brand-white shadow-inner overflow-hidden"
        >
          {isClient && canvasContainerRef.current && (
            <IrrigationCanvas
              areas={state.areas}
              placedItems={state.placedItems}
              zones={state.zones}
              settings={state.canvasSettings}
              currentTool={state.currentTool}
              selectedItemId={state.selectedItemId}
              selectedAreaId={state.selectedAreaId}
              isDrawingPolygon={state.isDrawingPolygon}
              currentPolygonPoints={state.currentPolygonPoints}
              sprinklerHeadTypes={state.sprinklerHeadTypesData}
              selectedSprinklerTypeId={state.selectedSprinklerTypeId}
              onCanvasMouseDown={handleCanvasMouseDown}
              onCanvasMouseMove={handleCanvasMouseMove}
              onCanvasMouseUp={handleCanvasMouseUp}
              onCanvasWheel={handleCanvasWheel}
            />
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          <Button
            onClick={handleCalculateResults}
            className="bg-primary-orange text-brand-white hover:bg-primary-orange/90 px-6 py-3 text-base"
          >
            Calculate Plan & See Results
          </Button>
          <Button
            onClick={() => dispatch({ type: "RESET_PLANNER_STATE" })}
            variant="outline"
            className="px-6 py-3 text-base"
          >
            Reset Planner
          </Button>
        </div>
      </div>

      <div className="w-full md:w-[300px] lg:w-[380px] flex-shrink-0 overflow-y-auto mt-4 md:mt-0">
        <ResultsPanel results={state.results} isLoading={isLoading} />
      </div>
    </div>
  )
}
