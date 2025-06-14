"use client"

import { useState } from "react"
import type {
  WaterSupply,
  CanvasArea,
  SprinklerHeadType,
  PlantTypeData,
  SoilTypeData,
  IrrigationZone,
  Unit,
  FlowUnit,
  PressureUnit,
  InteractionTool,
  CanvasSettings,
} from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { generateId, getNextDistinctColor } from "../utils"
import { PlusCircle, Trash2, SunMedium, Leaf, Sprout, TreeDeciduous, CircleDotDashed } from "lucide-react"

interface InputPanelProps {
  waterSupply: WaterSupply
  onWaterSupplyChange: (update: Partial<WaterSupply>) => void
  areas: CanvasArea[]
  onAddArea: (area: CanvasArea) => void
  onUpdateArea: (area: Partial<CanvasArea> & { id: string }) => void
  onDeleteArea: (areaId: string) => void
  sprinklerHeadTypes: SprinklerHeadType[]
  selectedSprinklerTypeId: string | null
  onSelectSprinklerType: (typeId: string | null) => void
  plantTypes: PlantTypeData[]
  soilTypes: SoilTypeData[]
  zones: IrrigationZone[]
  onCreateZone: (name: string) => void
  onAssignItemsToZone: (itemIds: string[], zoneId: string | null) => void // For future use with item selection
  currentTool: InteractionTool
  onSetTool: (tool: InteractionTool) => void
  userInputPipeLengths: Record<string, { length: number; unit: Unit }>
  onSetUserInputPipeLength: (zoneId: string, length: number, unit: Unit) => void
  inchesOfWaterPerApplication: number
  onSetInchesOfWaterPerApplication: (value: number) => void
  commonPipeSizes: string[]
  canvasSettings: CanvasSettings
  onCanvasSettingsChange: (update: Partial<CanvasSettings>) => void
}

const unitOptions: Unit[] = ["ft", "m", "in"]
const flowUnitOptions: FlowUnit[] = ["gpm", "lpm"]
const pressureUnitOptions: PressureUnit[] = ["psi", "bar"]

const plantIcons = {
  "Lawn / Turf": Sprout,
  "Shrubs / Groundcover": Leaf,
  "Flowers / Perennials": SunMedium, // Placeholder, needs better icon
  "Trees (Established)": TreeDeciduous,
  Vegetables: Sprout, // Placeholder
  "Native / Drought Tolerant": Leaf, // Placeholder
}

export default function InputPanel({
  waterSupply,
  onWaterSupplyChange,
  areas,
  onAddArea,
  onUpdateArea,
  onDeleteArea,
  sprinklerHeadTypes,
  selectedSprinklerTypeId,
  onSelectSprinklerType,
  plantTypes,
  soilTypes,
  zones,
  onCreateZone,
  currentTool,
  onSetTool,
  userInputPipeLengths,
  onSetUserInputPipeLength,
  inchesOfWaterPerApplication,
  onSetInchesOfWaterPerApplication,
  commonPipeSizes,
  canvasSettings,
  onCanvasSettingsChange,
}: InputPanelProps) {
  const [newAreaName, setNewAreaName] = useState("")
  const [newZoneName, setNewZoneName] = useState("")

  const handleAddSimpleArea = () => {
    // For simplicity, simple areas are not directly drawn but used for non-visual planning
    // Or, they could be added to the canvas as fixed shapes if drawing tool is 'select'
    const newArea: CanvasArea = {
      id: generateId(),
      name: newAreaName || `Area ${areas.length + 1}`,
      shape: "rectangle", // Default, user can change if more types are added here
      x: 0,
      y: 0,
      width: 50,
      height: 30, // Default dimensions in current scale unit
      plantType: plantTypes[0]?.id || "",
      sunExposure: "full-sun",
      soilType: soilTypes[0]?.id || "",
      color: getNextDistinctColor(),
    }
    onAddArea(newArea)
    setNewAreaName("")
  }

  const handleCreateZone = () => {
    if (newZoneName.trim()) {
      onCreateZone(newZoneName.trim())
      setNewZoneName("")
    }
  }

  return (
    <ScrollArea className="h-full p-1 md:p-3 border-r border-medium-grey/50">
      <div className="space-y-6">
        <Accordion type="multiple" defaultValue={["item-areas", "item-supply", "item-sprinklers"]} className="w-full">
          {/* Property Areas */}
          <AccordionItem value="item-areas">
            <AccordionTrigger className="text-lg font-semibold text-primary-orange hover:no-underline">
              Property Areas
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-3">
              <p className="text-sm text-medium-grey mb-2">
                Define the areas to be irrigated. Use the 'Draw Area' tool on the canvas for custom shapes.
              </p>
              {areas.map((area) => (
                <Card key={area.id} className="bg-brand-white/50">
                  <CardHeader className="p-3">
                    <div className="flex justify-between items-center">
                      <Input
                        value={area.name}
                        onChange={(e) => onUpdateArea({ id: area.id, name: e.target.value })}
                        className="text-md font-semibold border-0 focus-visible:ring-1 focus-visible:ring-primary-orange p-1 h-auto"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteArea(area.id)}
                        className="text-destructive-red hover:text-destructive-red/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor={`area-plant-${area.id}`} className="text-xs">
                          Plant Type
                        </Label>
                        <Select
                          value={area.plantType}
                          onValueChange={(value) => onUpdateArea({ id: area.id, plantType: value })}
                        >
                          <SelectTrigger id={`area-plant-${area.id}`} className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {plantTypes.map((pt) => (
                              <SelectItem key={pt.id} value={pt.id} className="text-xs">
                                {pt.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`area-soil-${area.id}`} className="text-xs">
                          Soil Type
                        </Label>
                        <Select
                          value={area.soilType}
                          onValueChange={(value) => onUpdateArea({ id: area.id, soilType: value })}
                        >
                          <SelectTrigger id={`area-soil-${area.id}`} className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {soilTypes.map((st) => (
                              <SelectItem key={st.id} value={st.id} className="text-xs">
                                {st.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {/* Add sun exposure, simple dimensions if needed for non-drawn areas */}
                  </CardContent>
                </Card>
              ))}
              <Button
                onClick={() => onSetTool("draw-polygon")}
                variant="outline"
                className="w-full border-primary-orange text-primary-orange hover:bg-primary-orange/10 mt-2"
              >
                <PlusCircle className="w-4 h-4 mr-2" /> Add New Area (Draw on Canvas)
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Water Supply */}
          <AccordionItem value="item-supply">
            <AccordionTrigger className="text-lg font-semibold text-primary-orange hover:no-underline">
              Water Supply
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <Label htmlFor="static-pressure">Static Pressure</Label>
                  <Input
                    id="static-pressure"
                    type="number"
                    value={waterSupply.staticPressure}
                    onChange={(e) => onWaterSupplyChange({ staticPressure: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <Select
                  value={waterSupply.pressureUnit}
                  onValueChange={(value) => onWaterSupplyChange({ pressureUnit: value as PressureUnit })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pressureUnitOptions.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <Label htmlFor="flow-rate">Flow Rate</Label>
                  <Input
                    id="flow-rate"
                    type="number"
                    value={waterSupply.flowRate}
                    onChange={(e) => onWaterSupplyChange({ flowRate: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <Select
                  value={waterSupply.flowUnit}
                  onValueChange={(value) => onWaterSupplyChange({ flowUnit: value as FlowUnit })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {flowUnitOptions.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="main-line-size">Main Line Pipe Size</Label>
                <Select
                  value={waterSupply.mainLinePipeSize}
                  onValueChange={(value) => onWaterSupplyChange({ mainLinePipeSize: value })}
                >
                  <SelectTrigger id="main-line-size">
                    <SelectValue placeholder="Select pipe size" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonPipeSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <Label htmlFor="main-line-length">Main Line Length</Label>
                  <Input
                    id="main-line-length"
                    type="number"
                    value={waterSupply.mainLineLength}
                    onChange={(e) => onWaterSupplyChange({ mainLineLength: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <Select
                  value={waterSupply.mainLineLengthUnit}
                  onValueChange={(value) => onWaterSupplyChange({ mainLineLengthUnit: value as Unit })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Sprinkler Palette */}
          <AccordionItem value="item-sprinklers">
            <AccordionTrigger className="text-lg font-semibold text-primary-orange hover:no-underline">
              Sprinkler Palette
            </AccordionTrigger>
            <AccordionContent className="space-y-1 pt-3">
              <p className="text-sm text-medium-grey mb-2">
                Select a sprinkler type, then click on the canvas to place it.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sprinklerHeadTypes.map((head) => {
                  const Icon = head.icon || CircleDotDashed
                  return (
                    <Button
                      key={head.id}
                      variant={selectedSprinklerTypeId === head.id ? "default" : "outline"}
                      onClick={() => {
                        onSelectSprinklerType(head.id)
                        onSetTool("place-sprinkler")
                      }}
                      className={`h-auto p-2 text-left justify-start w-full ${selectedSprinklerTypeId === head.id ? "bg-primary-orange text-brand-white hover:bg-primary-orange/90" : "border-medium-grey/70 hover:bg-primary-orange/10"}`}
                    >
                      <Icon className="w-5 h-5 mr-2 text-primary-orange opacity-80" />
                      <div>
                        <span className="font-medium text-xs block">{head.name}</span>
                        <span className="text-xs text-medium-grey/90 block">
                          {head.type} - {head.defaultGPM.toFixed(2)} GPM @ {head.defaultRadius}ft
                        </span>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Zone Management */}
          <AccordionItem value="item-zones">
            <AccordionTrigger className="text-lg font-semibold text-primary-orange hover:no-underline">
              Zone Management
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-3">
              <div className="flex gap-2">
                <Input
                  placeholder="New zone name"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="flex-grow"
                />
                <Button
                  onClick={handleCreateZone}
                  className="bg-primary-orange text-brand-white hover:bg-primary-orange/90"
                >
                  <PlusCircle className="w-4 h-4 mr-2" /> Create Zone
                </Button>
              </div>
              {zones.length > 0 && (
                <p className="text-sm text-medium-grey mt-2">
                  Assign selected items on canvas to a zone using the 'Assign to Zone' tool.
                </p>
              )}
              {zones.map((zone) => (
                <Card key={zone.id} className="bg-brand-white/50 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold" style={{ color: zone.color || "inherit" }}>
                      {zone.name}
                    </span>
                    <span className="text-xs text-medium-grey">{zone.itemIds.length} items</span>
                  </div>
                  <div>
                    <Label htmlFor={`pipe-length-${zone.id}`} className="text-xs">
                      Est. Lateral Pipe Length for {zone.name}
                    </Label>
                    <div className="flex gap-2 items-end">
                      <Input
                        id={`pipe-length-${zone.id}`}
                        type="number"
                        value={userInputPipeLengths[zone.id]?.length || ""}
                        onChange={(e) =>
                          onSetUserInputPipeLength(
                            zone.id,
                            Number.parseFloat(e.target.value) || 0,
                            userInputPipeLengths[zone.id]?.unit || "ft",
                          )
                        }
                        placeholder="Length"
                        className="h-8 text-xs"
                      />
                      <Select
                        value={userInputPipeLengths[zone.id]?.unit || "ft"}
                        onValueChange={(val) =>
                          onSetUserInputPipeLength(zone.id, userInputPipeLengths[zone.id]?.length || 0, val as Unit)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {unitOptions.map((u) => (
                            <SelectItem key={u} value={u} className="text-xs">
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* General Settings */}
          <AccordionItem value="item-general-settings">
            <AccordionTrigger className="text-lg font-semibold text-primary-orange hover:no-underline">
              Watering Settings
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-3">
              <div>
                <Label htmlFor="inches-per-app">Inches of Water per Application</Label>
                <Input
                  id="inches-per-app"
                  type="number"
                  step="0.1"
                  value={inchesOfWaterPerApplication}
                  onChange={(e) => onSetInchesOfWaterPerApplication(Number.parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-medium-grey mt-1">
                  How much water you want to apply each time you irrigate (e.g., 0.5 inches).
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          {/* Canvas Settings */}
          <AccordionItem value="item-canvas-settings">
            <AccordionTrigger className="text-lg font-semibold text-primary-orange hover:no-underline">
              Canvas Settings
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-3">
              <div>
                <Label htmlFor="canvas-scale-value">Scale: 1 Pixel =</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="canvas-scale-value"
                    type="number"
                    value={canvasSettings.scale}
                    onChange={(e) => onCanvasSettingsChange({ scale: Number.parseFloat(e.target.value) || 0.1 })}
                    step="0.01"
                    className="w-24"
                  />
                  <Select
                    value={canvasSettings.scaleUnit}
                    onValueChange={(value) => onCanvasSettingsChange({ scaleUnit: value as Unit })}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map(
                        (
                          u, // Ensure unitOptions is defined or passed
                        ) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-medium-grey mt-1">
                  Define how many real-world units one canvas pixel represents (at 1x zoom).
                </p>
              </div>
              <div>
                <Label htmlFor="grid-spacing">Grid Spacing ({canvasSettings.scaleUnit})</Label>
                <Input
                  id="grid-spacing"
                  type="number"
                  value={canvasSettings.gridSpacing}
                  onChange={(e) => onCanvasSettingsChange({ gridSpacing: Number.parseFloat(e.target.value) || 1 })}
                  step="1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  id="show-grid"
                  checked={canvasSettings.showGrid}
                  onChange={(e) => onCanvasSettingsChange({ showGrid: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="show-grid">Show Grid</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  id="snap-to-grid"
                  checked={canvasSettings.snapToGrid}
                  onChange={(e) => onCanvasSettingsChange({ snapToGrid: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="snap-to-grid">Snap to Grid</Label>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ScrollArea>
  )
}
