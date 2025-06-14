"use client"

import React, { useRef, useCallback } from "react"
import type {
  Point,
  CanvasArea,
  SprinklerHead,
  IrrigationZone,
  CanvasSettings,
  InteractionTool,
  SprinklerHeadType,
} from "../types"
import { worldToScreen, screenToWorld, distance } from "../utils"
import { Move } from "lucide-react" // For handles

interface IrrigationCanvasProps {
  areas: CanvasArea[]
  placedItems: SprinklerHead[]
  zones: IrrigationZone[]
  settings: CanvasSettings
  currentTool: InteractionTool
  selectedItemId: string | null
  selectedAreaId: string | null
  isDrawingPolygon: boolean
  currentPolygonPoints: Point[]
  sprinklerHeadTypes: SprinklerHeadType[]
  selectedSprinklerTypeId: string | null
  onCanvasMouseDown: (
    point: Point,
    e: React.MouseEvent<SVGSVGElement>,
    targetType?: string,
    targetId?: string,
    handleType?: string,
  ) => void
  onCanvasMouseMove: (point: Point, e: React.MouseEvent<SVGSVGElement>) => void
  onCanvasMouseUp: (point: Point, e: React.MouseEvent<SVGSVGElement>) => void
  onCanvasWheel: (e: React.WheelEvent<SVGSVGElement>) => void
  // onItemClick: (itemId: string, e: React.MouseEvent) => void // Covered by onCanvasMouseDown
  // onAreaClick: (areaId: string, e: React.MouseEvent) => void // Covered by onCanvasMouseDown
}

const HANDLE_SIZE_PX = 8 // Screen pixels for handles

const IrrigationCanvas: React.FC<IrrigationCanvasProps> = ({
  areas,
  placedItems,
  zones,
  settings,
  currentTool,
  selectedItemId,
  selectedAreaId,
  isDrawingPolygon,
  currentPolygonPoints,
  sprinklerHeadTypes,
  selectedSprinklerTypeId,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onCanvasWheel,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [mousePosition, setMousePosition] = React.useState<Point | null>(null)

  const getCanvasCoordinates = useCallback(
    (e: React.MouseEvent<SVGSVGElement> | React.WheelEvent<SVGSVGElement>): Point => {
      if (!svgRef.current) return { x: 0, y: 0 }
      const svgRect = svgRef.current.getBoundingClientRect()
      const screenPoint: Point = {
        x: e.clientX - svgRect.left,
        y: e.clientY - svgRect.top,
      }
      return screenToWorld(screenPoint, settings)
    },
    [settings],
  )

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const worldPoint = getCanvasCoordinates(e)
    let targetType: string | undefined
    let targetId: string | undefined
    let handleType: string | undefined

    // Check if clicking on a handle of the selected item
    if (selectedItemId) {
      const item = placedItems.find((it) => it.id === selectedItemId)
      const headType = item ? sprinklerHeadTypes.find((ht) => ht.id === item.typeId) : null
      if (item && headType && (headType.type === "rotor" || headType.sprayPattern === "arc")) {
        const itemScreenPos = worldToScreen({ x: item.x, y: item.y }, settings)
        const itemScreenRadius = (item.radius / settings.scale) * settings.zoom
        const clickScreenPos = {
          x: e.clientX - (svgRef.current?.getBoundingClientRect().left || 0),
          y: e.clientY - (svgRef.current?.getBoundingClientRect().top || 0),
        }

        const arcStart = item.arcStartAngle ?? 0
        const arcEnd = item.arcEndAngle ?? (headType.sprayPattern === "circle" ? 360 : 90) // Default arc for non-circle

        const startHandleScreenPos = {
          x: itemScreenPos.x + itemScreenRadius * Math.cos((arcStart * Math.PI) / 180),
          y: itemScreenPos.y + itemScreenRadius * Math.sin((arcStart * Math.PI) / 180),
        }
        const endHandleScreenPos = {
          x: itemScreenPos.x + itemScreenRadius * Math.cos((arcEnd * Math.PI) / 180),
          y: itemScreenPos.y + itemScreenRadius * Math.sin((arcEnd * Math.PI) / 180),
        }

        if (distance(clickScreenPos, startHandleScreenPos) < HANDLE_SIZE_PX + 2) {
          targetType = "item-handle"
          targetId = item.id
          handleType = "arc-start"
        } else if (distance(clickScreenPos, endHandleScreenPos) < HANDLE_SIZE_PX + 2) {
          targetType = "item-handle"
          targetId = item.id
          handleType = "arc-end"
        }
      }
    }

    if (!targetType) {
      // If not clicking a handle, check for item or area
      const clickedItem = placedItems.find((item) => {
        const itemScreenPos = worldToScreen({ x: item.x, y: item.y }, settings)
        const clickScreenPos = {
          x: e.clientX - (svgRef.current?.getBoundingClientRect().left || 0),
          y: e.clientY - (svgRef.current?.getBoundingClientRect().top || 0),
        }
        return distance(itemScreenPos, clickScreenPos) < (HANDLE_SIZE_PX + 2) / settings.zoom // Click radius in screen pixels
      })

      if (clickedItem) {
        targetType = "item"
        targetId = clickedItem.id
      } else {
        // TODO: Add area click detection if needed for selection
      }
    }

    onCanvasMouseDown(worldPoint, e, targetType, targetId, handleType)
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const worldPoint = getCanvasCoordinates(e)
    setMousePosition(worldPoint)
    onCanvasMouseMove(worldPoint, e)
  }

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    const worldPoint = getCanvasCoordinates(e)
    onCanvasMouseUp(worldPoint, e)
  }

  const handleMouseLeave = () => {
    setMousePosition(null)
  }

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    onCanvasWheel(e) // Pass the raw event
  }

  const renderGrid = () => {
    if (!settings.showGrid || settings.gridSpacing <= 0 || settings.scale <= 0) return null
    const lines = []
    const { canvasWidth, canvasHeight, pan, zoom, gridSpacing } = settings

    const topLeftWorld = screenToWorld({ x: 0, y: 0 }, settings)
    const bottomRightWorld = screenToWorld({ x: canvasWidth, y: canvasHeight }, settings)

    const startX = Math.floor(topLeftWorld.x / gridSpacing) * gridSpacing
    const endX = Math.ceil(bottomRightWorld.x / gridSpacing) * gridSpacing
    const startY = Math.floor(topLeftWorld.y / gridSpacing) * gridSpacing
    const endY = Math.ceil(bottomRightWorld.y / gridSpacing) * gridSpacing

    for (let x = startX; x <= endX; x += gridSpacing) {
      const p1Screen = worldToScreen({ x, y: startY }, settings)
      const p2Screen = worldToScreen({ x, y: endY }, settings)
      lines.push(
        <line
          key={`v-${x}`}
          x1={p1Screen.x}
          y1={p1Screen.y}
          x2={p2Screen.x}
          y2={p2Screen.y}
          stroke="#E5E7EB"
          strokeWidth={0.5}
          opacity={0.7}
        />,
      )
    }
    for (let y = startY; y <= endY; y += gridSpacing) {
      const p1Screen = worldToScreen({ x: startX, y }, settings)
      const p2Screen = worldToScreen({ x: endX, y }, settings)
      lines.push(
        <line
          key={`h-${y}`}
          x1={p1Screen.x}
          y1={p1Screen.y}
          x2={p2Screen.x}
          y2={p2Screen.y}
          stroke="#E5E7EB"
          strokeWidth={0.5}
          opacity={0.7}
        />,
      )
    }
    return <g id="grid">{lines}</g>
  }

  const renderAreas = () => {
    return areas.map((area) => {
      const screenPoints = area.points?.map((p) => worldToScreen(p, settings))
      const pathData =
        screenPoints?.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
        (screenPoints && screenPoints.length > 2 ? " Z" : "")
      let areaShape
      if (area.shape === "polygon" && pathData) {
        areaShape = (
          <path
            d={pathData}
            fill={area.color || "rgba(150,200,250,0.3)"}
            stroke={selectedAreaId === area.id ? "var(--primary-orange)" : area.color || "rgba(100,150,200,0.7)"}
            strokeWidth={selectedAreaId === area.id ? 2 : 1}
          />
        )
      } else if (
        area.shape === "rectangle" &&
        area.x !== undefined &&
        area.y !== undefined &&
        area.width &&
        area.height
      ) {
        const topLeftScreen = worldToScreen({ x: area.x, y: area.y }, settings)
        const bottomRightScreen = worldToScreen({ x: area.x + area.width, y: area.y + area.height }, settings)
        const screenWidth = bottomRightScreen.x - topLeftScreen.x
        const screenHeight = bottomRightScreen.y - topLeftScreen.y
        areaShape = (
          <rect
            x={topLeftScreen.x}
            y={topLeftScreen.y}
            width={screenWidth}
            height={screenHeight}
            fill={area.color || "rgba(150,200,250,0.3)"}
            stroke={selectedAreaId === area.id ? "var(--primary-orange)" : area.color || "rgba(100,150,200,0.7)"}
            strokeWidth={selectedAreaId === area.id ? 2 : 1}
          />
        )
      }

      return (
        <g
          key={area.id}
          onClick={(e) => {
            e.stopPropagation()
            onCanvasMouseDown(getCanvasCoordinates(e), e, "area", area.id)
          }}
          className="cursor-pointer"
        >
          {areaShape}
          {screenPoints && screenPoints.length > 0 && (
            <text
              x={screenPoints[0].x + 5}
              y={screenPoints[0].y + 15}
              fontSize={10}
              fill="#333"
              style={{ pointerEvents: "none" }}
            >
              {area.name}
            </text>
          )}
          {selectedAreaId === area.id &&
            area.shape === "polygon" &&
            screenPoints?.map((p, index) => (
              <circle
                key={`vertex-${area.id}-${index}`}
                cx={p.x}
                cy={p.y}
                r={4}
                fill="var(--primary-orange)"
                stroke="#fff"
                strokeWidth={1}
                className="cursor-grab"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  onCanvasMouseDown(getCanvasCoordinates(e), e, "area-vertex", area.id, index.toString())
                }}
              />
            ))}
        </g>
      )
    })
  }

  const renderCurrentPolygon = () => {
    if (!isDrawingPolygon || currentPolygonPoints.length === 0) return null
    const screenPoints = currentPolygonPoints.map((p) => worldToScreen(p, settings))
    let pathData = screenPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
    if (mousePosition && screenPoints.length > 0) {
      const mouseScreenPos = worldToScreen(mousePosition, settings)
      pathData += ` L ${mouseScreenPos.x} ${mouseScreenPos.y}`
    }
    return (
      <>
        <path d={pathData} stroke="var(--primary-orange)" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
        {screenPoints.map((p, i) => (
          <circle key={`curr-vertex-${i}`} cx={p.x} cy={p.y} r={3} fill="var(--primary-orange)" />
        ))}
        {currentPolygonPoints.length > 2 &&
          mousePosition &&
          distance(worldToScreen(mousePosition, settings), screenPoints[0]) < 10 && (
            <circle
              cx={screenPoints[0].x}
              cy={screenPoints[0].y}
              r={6}
              fill="var(--primary-orange)"
              fillOpacity="0.5"
            />
          )}
      </>
    )
  }

  const renderPlacedItems = () => {
    return placedItems.map((item) => {
      const headTypeDetails = sprinklerHeadTypes.find((ht) => ht.id === item.typeId)
      if (!headTypeDetails) return null

      const screenPos = worldToScreen({ x: item.x, y: item.y }, settings)
      const itemScreenRadius = (item.radius / settings.scale) * settings.zoom // item.radius is in world units

      const zone = zones.find((z) => z.id === item.zoneId)
      const itemBaseColor = zone?.color ? zone.color.replace("0.5", "1.0") : "var(--medium-grey)"
      const itemSelectedColor = "var(--primary-orange)"
      const finalItemColor = selectedItemId === item.id ? itemSelectedColor : itemBaseColor

      let sprayPatternElement
      const sprayOpacity = 0.3
      const sprayFillColor = zone?.color || "rgba(0,100,255,0.2)"
      const sprayStrokeColor = zone?.color ? zone.color.replace("0.5", "0.8") : "rgba(0,100,255,0.4)"

      if (
        headTypeDetails.type === "rotor" ||
        (headTypeDetails.type === "spray" && headTypeDetails.sprayPattern === "arc")
      ) {
        const arcStart = item.arcStartAngle ?? 0
        const arcEnd = item.arcEndAngle ?? (headTypeDetails.sprayPattern === "circle" ? 360 : 90)
        const largeArcFlag = (arcEnd - arcStart + 360) % 360 > 180 ? 1 : 0

        const startPoint = {
          x: screenPos.x + itemScreenRadius * Math.cos((arcStart * Math.PI) / 180),
          y: screenPos.y + itemScreenRadius * Math.sin((arcStart * Math.PI) / 180),
        }
        const endPoint = {
          x: screenPos.x + itemScreenRadius * Math.cos((arcEnd * Math.PI) / 180),
          y: screenPos.y + itemScreenRadius * Math.sin((arcEnd * Math.PI) / 180),
        }
        const pathD = `M ${screenPos.x} ${screenPos.y} L ${startPoint.x} ${startPoint.y} A ${itemScreenRadius} ${itemScreenRadius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y} Z`
        sprayPatternElement = (
          <path
            d={pathD}
            fill={sprayFillColor}
            stroke={sprayStrokeColor}
            strokeWidth={0.5}
            style={{ opacity: sprayOpacity, pointerEvents: "none" }}
          />
        )
      } else if (headTypeDetails.type !== "drip-emitter") {
        sprayPatternElement = (
          <circle
            cx={screenPos.x}
            cy={screenPos.y}
            r={itemScreenRadius}
            fill={sprayFillColor}
            stroke={sprayStrokeColor}
            strokeWidth={0.5}
            style={{ opacity: sprayOpacity, pointerEvents: "none" }}
          />
        )
      }

      // Rotation Handles
      let rotationHandles = null
      if (selectedItemId === item.id && (headTypeDetails.type === "rotor" || headTypeDetails.sprayPattern === "arc")) {
        const arcStart = item.arcStartAngle ?? 0
        const arcEnd = item.arcEndAngle ?? 90

        const startHandleScreenPos = {
          x: screenPos.x + itemScreenRadius * Math.cos((arcStart * Math.PI) / 180),
          y: screenPos.y + itemScreenRadius * Math.sin((arcStart * Math.PI) / 180),
        }
        const endHandleScreenPos = {
          x: screenPos.x + itemScreenRadius * Math.cos((arcEnd * Math.PI) / 180),
          y: screenPos.y + itemScreenRadius * Math.sin((arcEnd * Math.PI) / 180),
        }

        rotationHandles = (
          <>
            <circle
              cx={startHandleScreenPos.x}
              cy={startHandleScreenPos.y}
              r={HANDLE_SIZE_PX / settings.zoom}
              fill="var(--primary-orange)"
              stroke="#fff"
              strokeWidth={1 / settings.zoom}
              className="cursor-grab"
              onMouseDown={(e) => {
                e.stopPropagation()
                onCanvasMouseDown(getCanvasCoordinates(e), e, "item-handle", item.id, "arc-start")
              }}
            />
            <circle
              cx={endHandleScreenPos.x}
              cy={endHandleScreenPos.y}
              r={HANDLE_SIZE_PX / settings.zoom}
              fill="var(--primary-orange)"
              stroke="#fff"
              strokeWidth={1 / settings.zoom}
              className="cursor-grab"
              onMouseDown={(e) => {
                e.stopPropagation()
                onCanvasMouseDown(getCanvasCoordinates(e), e, "item-handle", item.id, "arc-end")
              }}
            />
            {/* Line from center to handles for clarity */}
            <line
              x1={screenPos.x}
              y1={screenPos.y}
              x2={startHandleScreenPos.x}
              y2={startHandleScreenPos.y}
              stroke="var(--primary-orange)"
              strokeWidth={1 / settings.zoom}
              strokeDasharray={`2 ${1 / settings.zoom}`}
            />
            <line
              x1={screenPos.x}
              y1={screenPos.y}
              x2={endHandleScreenPos.x}
              y2={endHandleScreenPos.y}
              stroke="var(--primary-orange)"
              strokeWidth={1 / settings.zoom}
              strokeDasharray={`2 ${1 / settings.zoom}`}
            />
          </>
        )
      }

      const HeadIcon = headTypeDetails.icon || Move // Default to Move icon

      return (
        <g
          key={item.id}
          className="cursor-pointer"
          onMouseDown={(e) => {
            e.stopPropagation()
            onCanvasMouseDown(getCanvasCoordinates(e), e, "item", item.id)
          }}
        >
          {sprayPatternElement}
          <HeadIcon
            x={screenPos.x - 5 / settings.zoom / settings.scale} // Adjust icon size based on zoom
            y={screenPos.y - 5 / settings.zoom / settings.scale}
            width={10 / settings.zoom / settings.scale}
            height={10 / settings.zoom / settings.scale}
            color={finalItemColor}
            strokeWidth={1 / settings.zoom}
          />
          {/* Fallback circle if icon doesn't render well or for small items */}
          {!headTypeDetails.icon && (
            <circle
              cx={screenPos.x}
              cy={screenPos.y}
              r={5 / settings.zoom}
              fill={finalItemColor}
              stroke="#fff"
              strokeWidth={1 / settings.zoom}
            />
          )}
          {rotationHandles}
        </g>
      )
    })
  }

  const renderPlacementPreview = () => {
    if (currentTool !== "place-sprinkler" || !selectedSprinklerTypeId || !mousePosition) return null
    const headTypeDetails = sprinklerHeadTypes.find((ht) => ht.id === selectedSprinklerTypeId)
    if (!headTypeDetails) return null

    const screenPos = worldToScreen(mousePosition, settings)
    const itemScreenRadius = (headTypeDetails.defaultRadius / settings.scale) * settings.zoom

    return (
      <g style={{ pointerEvents: "none", opacity: 0.7 }}>
        {headTypeDetails.type === "rotor" ||
        (headTypeDetails.type === "spray" && headTypeDetails.sprayPattern === "arc") ? (
          <path
            d={`M ${screenPos.x} ${screenPos.y} L ${screenPos.x + itemScreenRadius} ${screenPos.y} A ${itemScreenRadius} ${itemScreenRadius} 0 1 1 ${screenPos.x + itemScreenRadius * Math.cos(2 * Math.PI * 0.9999)} ${screenPos.y + itemScreenRadius * Math.sin(2 * Math.PI * 0.9999)} Z`}
            fill="rgba(0,100,255,0.3)"
          />
        ) : (
          <circle cx={screenPos.x} cy={screenPos.y} r={itemScreenRadius} fill="rgba(0,100,255,0.3)" />
        )}
        <circle cx={screenPos.x} cy={screenPos.y} r={5 / settings.zoom} fill="var(--primary-orange)" />
      </g>
    )
  }

  const getCursorStyle = () => {
    // More specific cursor based on what's under mouse if needed, for now tool based
    if (currentTool === "pan" && svgRef.current?.classList.contains("grabbing")) return "grabbing"
    switch (currentTool) {
      case "draw-polygon":
        return "crosshair"
      case "place-sprinkler":
        return "copy"
      case "pan":
        return "grab"
      case "select":
        return "default" // Will be overridden by specific element cursors like 'grab' for handles
      default:
        return "default"
    }
  }

  return (
    <div className="w-full h-full bg-brand-white border border-medium-grey/50 rounded-md overflow-hidden relative shadow-lg">
      <svg
        ref={svgRef}
        width={settings.canvasWidth}
        height={settings.canvasHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        style={{ cursor: getCursorStyle() }}
      >
        {renderGrid()}
        <g id="areas-group">{renderAreas()}</g>
        <g id="items-group">{renderPlacedItems()}</g>
        {renderCurrentPolygon()}
        {renderPlacementPreview()}
      </svg>
      {mousePosition && (
        <div className="absolute bottom-1 left-1 bg-dark-grey/70 text-brand-white text-xs p-1 rounded pointer-events-none">
          X: {mousePosition.x.toFixed(2)} {settings.scaleUnit}, Y: {mousePosition.y.toFixed(2)} {settings.scaleUnit} |
          Zoom: {settings.zoom.toFixed(2)}x
        </div>
      )}
    </div>
  )
}

export default IrrigationCanvas
