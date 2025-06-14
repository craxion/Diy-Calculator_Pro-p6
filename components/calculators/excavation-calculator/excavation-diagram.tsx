"use client"
import type React from "react"
import type { ExcavationType, DimensionUnit } from "./types"
import { convertToBaseFoot } from "./utils"

interface ExcavationDiagramProps {
  type: ExcavationType
  lengthStr: string
  widthStr: string
  depthStr: string
  diameterStr: string
  topWidthStr?: string // For trench
  bottomWidthStr?: string // For trench
  unit: DimensionUnit // Assuming a common unit for simplicity in diagram, or pass individual units
  depthUnit: DimensionUnit
  diameterUnit: DimensionUnit
  topWidthUnit?: DimensionUnit
  bottomWidthUnit?: DimensionUnit
}

const ExcavationDiagram: React.FC<ExcavationDiagramProps> = ({
  type,
  lengthStr,
  widthStr,
  depthStr,
  diameterStr,
  topWidthStr = "0",
  bottomWidthStr = "0",
  unit: commonUnit, // This might need to be more granular if units differ wildly
  depthUnit,
  diameterUnit,
  topWidthUnit = commonUnit,
  bottomWidthUnit = commonUnit,
}) => {
  const length = convertToBaseFoot(Number.parseFloat(lengthStr) || 0, commonUnit)
  const width = convertToBaseFoot(Number.parseFloat(widthStr) || 0, commonUnit)
  const depth = convertToBaseFoot(Number.parseFloat(depthStr) || 0, depthUnit)
  const diameter = convertToBaseFoot(Number.parseFloat(diameterStr) || 0, diameterUnit)
  const topWidth = convertToBaseFoot(Number.parseFloat(topWidthStr) || 0, topWidthUnit)
  let bottomWidth = convertToBaseFoot(Number.parseFloat(bottomWidthStr) || 0, bottomWidthUnit)

  if (type === "trench" && bottomWidth <= 0) {
    bottomWidth = topWidth
  }

  const viewBoxWidth = 200
  const viewBoxHeight = 150
  const padding = 20

  let diagramElements: React.ReactNode

  // Basic scaling - could be more sophisticated
  const maxDim = Math.max(length, width, diameter, topWidth, depth, 1) // Avoid division by zero
  const scaleFactor = Math.min((viewBoxWidth - 2 * padding) / maxDim, (viewBoxHeight - 2 * padding) / maxDim, 20)

  switch (type) {
    case "rectangular":
      const rectW = Math.max(5, width * scaleFactor)
      const rectL = Math.max(5, length * scaleFactor) // Represent depth/length in perspective
      const rectD = Math.max(5, (depth * scaleFactor) / 2) // Visual cue for depth

      diagramElements = (
        <g transform={`translate(${viewBoxWidth / 2}, ${viewBoxHeight / 2})`}>
          {/* Simple 3D-like representation */}
          <polygon
            points={`${-rectL / 2},${-rectW / 2 - rectD / 2} ${rectL / 2},${-rectW / 2 - rectD / 2} ${rectL / 2 + rectD},${-rectW / 2 + rectD / 2} ${-rectL / 2 + rectD},${-rectW / 2 + rectD / 2}`}
            fill="#e0e0e0"
            stroke="#333"
          />
          <polygon
            points={`${-rectL / 2},${-rectW / 2 - rectD / 2} ${-rectL / 2 + rectD},${-rectW / 2 + rectD / 2} ${-rectL / 2 + rectD},${rectW / 2 + rectD / 2} ${-rectL / 2},${rectW / 2 - rectD / 2}`}
            fill="#d0d0d0"
            stroke="#333"
          />
          <polygon
            points={`${rectL / 2},${-rectW / 2 - rectD / 2} ${rectL / 2 + rectD},${-rectW / 2 + rectD / 2} ${rectL / 2 + rectD},${rectW / 2 + rectD / 2} ${rectL / 2},${rectW / 2 - rectD / 2}`}
            fill="#c0c0c0"
            stroke="#333"
          />
          <rect
            x={-rectL / 2}
            y={-rectW / 2 - rectD / 2}
            width={rectL}
            height={rectW}
            fill="rgba(135, 206, 250, 0.7)"
            stroke="#333"
            strokeWidth="1"
          />

          <text
            x={0}
            y={-rectW / 2 - rectD / 2 - 5}
            textAnchor="middle"
            fontSize="10"
          >{`L: ${lengthStr} ${commonUnit}`}</text>
          <text
            x={-rectL / 2 - 15}
            y={0}
            dominantBaseline="middle"
            textAnchor="end"
            fontSize="10"
            transform={`rotate(-90, ${-rectL / 2 - 15}, 0)`}
          >{`W: ${widthStr} ${commonUnit}`}</text>
          <text
            x={rectL / 2 + rectD / 2 + 5}
            y={rectW / 2}
            dominantBaseline="middle"
            fontSize="10"
          >{`D: ${depthStr} ${depthUnit}`}</text>
        </g>
      )
      break
    case "circular":
      const radius = Math.max(5, (diameter / 2) * scaleFactor)
      const circD = Math.max(5, (depth * scaleFactor) / 3)
      diagramElements = (
        <g transform={`translate(${viewBoxWidth / 2}, ${viewBoxHeight / 2})`}>
          <ellipse cx={0} cy={circD} rx={radius} ry={radius / 3} fill="#d0d0d0" stroke="#333" />
          <rect x={-radius} y={-circD} width={radius * 2} height={circD * 2} fill="rgba(135, 206, 250, 0.0)" />{" "}
          {/* Invisible container for text */}
          <ellipse cx={0} cy={-circD} rx={radius} ry={radius / 3} fill="rgba(135, 206, 250, 0.7)" stroke="#333" />
          <line x1={-radius} y1={-circD} x2={-radius} y2={circD} stroke="#333" />
          <line x1={radius} y1={-circD} x2={radius} y2={circD} stroke="#333" />
          <text
            x={0}
            y={-circD - radius / 3 - 5}
            textAnchor="middle"
            fontSize="10"
          >{`Dia: ${diameterStr} ${diameterUnit}`}</text>
          <text x={radius + 5} y={0} dominantBaseline="middle" fontSize="10">{`D: ${depthStr} ${depthUnit}`}</text>
        </g>
      )
      break
    case "trench":
      const trenchL = Math.max(5, length * scaleFactor)
      const trenchTopW = Math.max(5, topWidth * scaleFactor)
      const trenchBottomW = Math.max(5, bottomWidth * scaleFactor)
      const trenchD = Math.max(5, (depth * scaleFactor) / 2) // Visual cue for depth

      // Points for trapezoidal prism (simplified 2D representation)
      const x1 = -trenchL / 2 // top left
      const x2 = trenchL / 2 // top right
      const y_top_front = -trenchTopW / 2 - trenchD / 2
      const y_bottom_front = -trenchBottomW / 2 - trenchD / 2

      const y_top_back = -trenchTopW / 2 + trenchD / 2
      const y_bottom_back = -trenchBottomW / 2 + trenchD / 2

      diagramElements = (
        <g transform={`translate(${viewBoxWidth / 2}, ${viewBoxHeight / 2})`}>
          {/* Front Face (trapezoid) */}
          <polygon
            points={`${x1},${y_top_front} ${x2},${y_top_front} ${x2},${y_bottom_front + (trenchTopW - trenchBottomW) / 2} ${x1},${y_bottom_front + (trenchTopW - trenchBottomW) / 2}`}
            fill="rgba(135, 206, 250, 0.7)"
            stroke="#333"
          />
          {/* Top Surface */}
          <polygon
            points={`${x1},${y_top_front} ${x2},${y_top_front} ${x2 + trenchD},${y_top_back} ${x1 + trenchD},${y_top_back}`}
            fill="#e0e0e0"
            stroke="#333"
          />
          {/* Side Surface */}
          <polygon
            points={`${x2},${y_top_front} ${x2 + trenchD},${y_top_back} ${x2 + trenchD},${y_bottom_back + (trenchTopW - trenchBottomW) / 2} ${x2},${y_bottom_front + (trenchTopW - trenchBottomW) / 2}`}
            fill="#d0d0d0"
            stroke="#333"
          />

          <text x={0} y={y_top_front - 5} textAnchor="middle" fontSize="10">{`L: ${lengthStr} ${commonUnit}`}</text>
          <text
            x={x1 - 5}
            y={y_top_front + trenchTopW / 4}
            dominantBaseline="middle"
            textAnchor="end"
            fontSize="10"
            transform={`rotate(-90 ${x1 - 5} ${y_top_front + trenchTopW / 4})`}
          >{`Top W: ${topWidthStr} ${topWidthUnit}`}</text>
          {bottomWidth > 0 && bottomWidth !== topWidth && (
            <text
              x={x1 - 5}
              y={y_bottom_front + (trenchTopW - trenchBottomW) / 2 + trenchBottomW / 4}
              dominantBaseline="middle"
              textAnchor="end"
              fontSize="10"
              transform={`rotate(-90 ${x1 - 5} ${y_bottom_front + (trenchTopW - trenchBottomW) / 2 + trenchBottomW / 4})`}
            >{`Bot W: ${bottomWidthStr} ${bottomWidthUnit}`}</text>
          )}
          <text
            x={x2 + trenchD / 2 + 5}
            y={y_top_back - trenchTopW / 2 + trenchD / 2}
            dominantBaseline="middle"
            fontSize="10"
          >{`D: ${depthStr} ${depthUnit}`}</text>
        </g>
      )
      break
    default:
      diagramElements = <text>Select excavation type</text>
  }

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      className="w-full h-auto border rounded-md bg-gray-50"
      preserveAspectRatio="xMidYMid meet"
    >
      {diagramElements}
    </svg>
  )
}

export default ExcavationDiagram
