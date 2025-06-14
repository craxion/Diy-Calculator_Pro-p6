"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ToolbarProps {
  isDrawingPolygon: boolean
  onCalculate: () => void
  onClear: () => void
  onCancelPolygon: () => void
}

const Toolbar: React.FC<ToolbarProps> = ({ isDrawingPolygon, onCalculate, onClear, onCancelPolygon }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2">
        <Button onClick={onCalculate} disabled={isDrawingPolygon}>
          Calculate
        </Button>
        <Button variant="outline" onClick={onClear} disabled={isDrawingPolygon}>
          Clear
        </Button>
        {isDrawingPolygon && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancelPolygon}
            className="border-destructive-red text-destructive-red hover:bg-destructive-red/10"
            title="Cancel current area drawing"
          >
            <X className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Cancel Draw</span>
          </Button>
        )}
      </div>
    </div>
  )
}

export default Toolbar
