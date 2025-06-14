"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Trash2,
  PlusCircle,
  Settings2,
  LayoutGrid,
  AlertTriangle,
  Download,
  Printer,
  Scissors,
  Ruler,
  BarChart3,
  ListChecks,
  Sparkles,
  Loader2,
  Info,
} from "lucide-react"

import type {
  RequiredCut,
  StockLumber,
  OptimizerSettings,
  OptimizationResults,
  Unit,
  DefectZone,
  StockBoardCutPlan,
} from "@/components/calculators/lumber-cut-optimizer/types"
import { DEFAULT_UNITS, COST_UNITS, LENGTH_UNITS } from "@/components/calculators/lumber-cut-optimizer/types"
import { optimizeLumberCuts } from "@/components/calculators/lumber-cut-optimizer/optimizer-logic"
import { convertToUnit, convertToInches } from "@/components/calculators/lumber-cut-optimizer/utils" // Importing missing functions

// SVG Diagram Component
const StockBoardDiagram = ({
  plan,
  kerf,
  minOffcutLength,
  displayUnit,
}: { plan: StockBoardCutPlan; kerf: number; minOffcutLength: number; displayUnit: Unit }) => {
  const boardHeight = 60
  const labelHeight = 15
  const totalBoardLengthPx = 800 // Max width for the diagram container

  const convertToDisplayUnit = (valueInches: number) => {
    const inchesPerUnit: Record<Unit, number> = { inches: 1, feet: 12, cm: 0.393701, meters: 39.3701, mm: 0.0393701 }
    return valueInches / inchesPerUnit[displayUnit]
  }

  const scaleFactor = totalBoardLengthPx / plan.originalLength

  return (
    <div className="mb-4 p-2 border rounded-md overflow-x-auto bg-gray-50">
      <p className="text-sm font-medium mb-1">
        Stock Board (Original: {convertToDisplayUnit(plan.originalLength).toFixed(1)} {displayUnit})
      </p>
      <svg width={totalBoardLengthPx + 20} height={boardHeight + labelHeight * 2} className="min-w-full">
        {/* Board Outline */}
        <rect
          x="10"
          y={labelHeight}
          width={plan.originalLength * scaleFactor}
          height={boardHeight}
          fill="#f0e6d2"
          stroke="#a08c6d"
          strokeWidth="1"
        />

        {/* Defect Zones */}
        {plan.defectZones.map((defect, idx) => (
          <g key={`defect-${idx}`}>
            <rect
              x={10 + defect.start * scaleFactor}
              y={labelHeight}
              width={(defect.end - defect.start) * scaleFactor}
              height={boardHeight}
              fill="rgba(255, 0, 0, 0.3)"
              stroke="red"
              strokeDasharray="2 2"
            />
            <text
              x={10 + (defect.start + (defect.end - defect.start) / 2) * scaleFactor}
              y={labelHeight - 2}
              fontSize="10"
              textAnchor="middle"
              fill="red"
            >
              Defect
            </text>
          </g>
        ))}

        {/* Placed Cuts */}
        {plan.cuts.map((cut, idx) => (
          <g key={`cut-${idx}`}>
            <rect
              x={10 + cut.xPosition * scaleFactor}
              y={labelHeight}
              width={cut.length * scaleFactor}
              height={boardHeight}
              fill="#a3bfb0"
              stroke="#4a785f"
              strokeWidth="1"
            />
            <text
              x={10 + (cut.xPosition + cut.length / 2) * scaleFactor}
              y={labelHeight + boardHeight / 2 + 4}
              fontSize="10"
              textAnchor="middle"
              fill="#2b4035"
            >
              {cut.label} ({convertToDisplayUnit(cut.length).toFixed(1)}
              {displayUnit})
            </text>
            {/* Kerf after cut if not last piece */}
            {idx < plan.cuts.length - 1 && kerf > 0 && (
              <rect
                x={10 + (cut.xPosition + cut.length) * scaleFactor}
                y={labelHeight}
                width={kerf * scaleFactor}
                height={boardHeight}
                fill="#777"
                opacity="0.5"
              />
            )}
          </g>
        ))}

        {/* Waste Segments */}
        {plan.wasteSegments.map((waste, idx) => (
          <g key={`waste-${idx}`}>
            <rect
              x={10 + waste.xPosition * scaleFactor}
              y={labelHeight}
              width={waste.length * scaleFactor}
              height={boardHeight}
              fill={waste.isUsableOffcut ? "#d1e6dc" : "#d3c0a8"}
              stroke="#a08c6d"
              strokeWidth="0.5"
              strokeDasharray={waste.isUsableOffcut ? "none" : "2 2"}
            />
            <text
              x={10 + (waste.xPosition + waste.length / 2) * scaleFactor}
              y={labelHeight + boardHeight / 2 + 4}
              fontSize="9"
              textAnchor="middle"
              fill="#5c4e3a"
            >
              {waste.isUsableOffcut
                ? `Offcut: ${convertToDisplayUnit(waste.length).toFixed(1)}${displayUnit}`
                : `Waste: ${convertToDisplayUnit(waste.length).toFixed(1)}${displayUnit}`}
            </text>
          </g>
        ))}
        {/* Ruler Ticks */}
        {Array.from({ length: Math.floor(convertToDisplayUnit(plan.originalLength)) + 1 }).map((_, i) => {
          const posInches = convertToUnit(i, displayUnit, "inches")
          if (posInches > plan.originalLength) return null
          const xPos = 10 + posInches * scaleFactor
          const isMajorTick =
            i % (displayUnit === "feet" ? 1 : displayUnit === "meters" ? 1 : displayUnit === "cm" ? 10 : 5) === 0
          return (
            <g key={`tick-${i}`}>
              <line
                x1={xPos}
                y1={labelHeight + boardHeight}
                x2={xPos}
                y2={labelHeight + boardHeight + (isMajorTick ? 8 : 4)}
                stroke="#555"
                strokeWidth="0.5"
              />
              {isMajorTick && (
                <text x={xPos} y={labelHeight + boardHeight + 18} fontSize="8" textAnchor="middle">
                  {i}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function LumberCutOptimizerPage() {
  const [requiredCuts, setRequiredCuts] = useState<RequiredCut[]>([
    { id: uuidv4(), length: "48", quantity: "2", unit: "inches", label: "Shelf", priority: false, grainMatch: false },
    { id: uuidv4(), length: "24", quantity: "4", unit: "inches", label: "Support", priority: false, grainMatch: false },
  ])
  const [stockLumber, setStockLumber] = useState<StockLumber[]>([
    {
      id: uuidv4(),
      length: "96",
      quantity: "1",
      unit: "inches",
      costPerUnit: "10",
      costUnit: "per_foot",
      defectZones: [],
    },
  ])
  const [settings, setSettings] = useState<OptimizerSettings>({
    sawKerf: "0.125",
    kerfUnit: "inches",
    minOffcutLength: "6",
    minOffcutUnit: "inches",
    optimizationGoal: "minimize_waste",
  })
  const [results, setResults] = useState<OptimizationResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = <T, K extends keyof T>(
    index: number,
    field: K,
    value: T[K],
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    items: T[],
  ) => {
    const newItems = [...items]
    newItems[index][field] = value
    setter(newItems)
  }

  const handleDefectChange = (
    stockIndex: number,
    defectIndex: number,
    field: keyof DefectZone,
    value: string | Unit,
  ) => {
    const newStockLumber = [...stockLumber]
    ;(newStockLumber[stockIndex].defectZones[defectIndex] as any)[field] = value
    setStockLumber(newStockLumber)
  }

  const addItem = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, defaultItem: T) => {
    setter((prev) => [...prev, { ...defaultItem, id: uuidv4() }])
  }

  const removeItem = <T extends { id: string }>(
    index: number,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    items: T[],
  ) => {
    setter(items.filter((_, i) => i !== index))
  }

  const addDefectZone = (stockIndex: number) => {
    const newStockLumber = [...stockLumber]
    newStockLumber[stockIndex].defectZones.push({ id: uuidv4(), start: "", end: "", unit: DEFAULT_UNITS })
    setStockLumber(newStockLumber)
  }

  const removeDefectZone = (stockIndex: number, defectIndex: number) => {
    const newStockLumber = [...stockLumber]
    newStockLumber[stockIndex].defectZones.splice(defectIndex, 1)
    setStockLumber(newStockLumber)
  }

  const runOptimizer = useCallback(() => {
    setError(null)
    setIsLoading(true)
    // Basic validation
    if (
      requiredCuts.some(
        (c) => !c.length || !c.quantity || Number.parseFloat(c.length) <= 0 || Number.parseInt(c.quantity) <= 0,
      )
    ) {
      setError("Please ensure all required cuts have valid lengths and quantities greater than zero.")
      setIsLoading(false)
      setResults(null)
      return
    }
    if (
      stockLumber.some(
        (s) => !s.length || !s.quantity || Number.parseFloat(s.length) <= 0 || Number.parseInt(s.quantity) <= 0,
      )
    ) {
      setError("Please ensure all stock lumber has valid lengths and quantities greater than zero.")
      setIsLoading(false)
      setResults(null)
      return
    }
    if (!settings.sawKerf || Number.parseFloat(settings.sawKerf) < 0) {
      setError("Saw kerf must be a non-negative value.")
      setIsLoading(false)
      setResults(null)
      return
    }
    if (!settings.minOffcutLength || Number.parseFloat(settings.minOffcutLength) < 0) {
      setError("Minimum usable offcut length must be a non-negative value.")
      setIsLoading(false)
      setResults(null)
      return
    }

    // Use setTimeout to allow UI to update before potentially long calculation
    setTimeout(() => {
      try {
        const optResults = optimizeLumberCuts(requiredCuts, stockLumber, settings)
        setResults(optResults)
      } catch (e: any) {
        setError(`Optimization failed: ${e.message}`)
        setResults(null)
      } finally {
        setIsLoading(false)
      }
    }, 50) // Small delay
  }, [requiredCuts, stockLumber, settings])

  // Auto-run optimizer on input change (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (requiredCuts.length > 0 && stockLumber.length > 0) {
        // Only run if inputs are somewhat valid to avoid spamming errors during typing
        if (!requiredCuts.some((c) => !c.length || !c.quantity) && !stockLumber.some((s) => !s.length || !s.quantity)) {
          runOptimizer()
        }
      } else {
        setResults(null) // Clear results if inputs are empty
      }
    }, 1000) // Debounce time
    return () => clearTimeout(handler)
  }, [requiredCuts, stockLumber, settings, runOptimizer])

  const handleDownloadPdf = () => {
    alert("PDF Download functionality to be implemented using html2canvas and jspdf.")
    // Placeholder for actual implementation
    // const input = document.getElementById('results-section'); // Ensure your results section has this ID
    // if (input) {
    //   html2canvas(input).then((canvas) => {
    //     const imgData = canvas.toDataURL('image/png');
    //     const pdf = new jsPDF();
    //     const imgProps= pdf.getImageProperties(imgData);
    //     const pdfWidth = pdf.internal.pageSize.getWidth();
    //     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    //     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    //     pdf.save("lumber-cut-plan.pdf");
    //   });
    // }
  }

  const handlePrint = () => {
    alert(
      "Print functionality to be implemented. This would typically involve preparing a print-friendly version of the results.",
    )
    // window.print(); // This will print the whole page, might need a dedicated print view
  }

  return (
    <TooltipProvider>
      <div className="container py-12 max-w-7xl">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Scissors className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">Lumber Cut Optimizer</h1>
            </div>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
              Minimize waste, save money, and plan your cuts efficiently. Input your required pieces and available stock
              to get an optimized cutting plan.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Inputs Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Required Cuts Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Ruler className="mr-2 h-5 w-5" />
                    Required Cuts
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="max-w-xs">
                          Define the specific pieces of lumber you need for your project. Specify each piece's length,
                          quantity, and optional details like labels, priority, and grain matching.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {requiredCuts.map((cut, index) => (
                    <div key={cut.id} className="p-3 border rounded-md space-y-3 bg-muted/20">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">
                          Cut #{index + 1} {cut.label && `(${cut.label})`}
                        </Label>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index, setRequiredCuts, requiredCuts)}
                          className="h-7 w-7"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Length"
                          type="number"
                          value={cut.length}
                          onChange={(e) =>
                            handleInputChange(index, "length", e.target.value, setRequiredCuts, requiredCuts)
                          }
                        />
                        <Select
                          value={cut.unit}
                          onValueChange={(val) =>
                            handleInputChange(index, "unit", val as Unit, setRequiredCuts, requiredCuts)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LENGTH_UNITS.map((u) => (
                              <SelectItem key={u.value} value={u.value}>
                                {u.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        placeholder="Quantity"
                        type="number"
                        value={cut.quantity}
                        onChange={(e) =>
                          handleInputChange(index, "quantity", e.target.value, setRequiredCuts, requiredCuts)
                        }
                      />
                      <Input
                        placeholder="Label (Optional)"
                        value={cut.label}
                        onChange={(e) =>
                          handleInputChange(index, "label", e.target.value, setRequiredCuts, requiredCuts)
                        }
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`priority-${cut.id}`}
                          checked={cut.priority}
                          onCheckedChange={(checked) =>
                            handleInputChange(index, "priority", !!checked, setRequiredCuts, requiredCuts)
                          }
                        />
                        <Label htmlFor={`priority-${cut.id}`} className="text-xs">
                          High Priority
                        </Label>
                        <Checkbox
                          id={`grain-${cut.id}`}
                          checked={cut.grainMatch}
                          onCheckedChange={(checked) =>
                            handleInputChange(index, "grainMatch", !!checked, setRequiredCuts, requiredCuts)
                          }
                        />
                        <Label htmlFor={`grain-${cut.id}`} className="text-xs">
                          Grain Match
                        </Label>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() =>
                      addItem(setRequiredCuts, {
                        id: uuidv4(),
                        length: "",
                        quantity: "1",
                        unit: DEFAULT_UNITS,
                        label: "",
                        priority: false,
                        grainMatch: false,
                      })
                    }
                    className="w-full"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Required Cut
                  </Button>
                </CardContent>
              </Card>

              {/* Stock Lumber Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LayoutGrid className="mr-2 h-5 w-5" />
                    Stock Lumber
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="max-w-xs">
                          Input the details of the raw lumber boards you have available for cutting. Include their full
                          lengths, quantities, costs, and any specific defect areas to avoid.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stockLumber.map((stock, stockIndex) => (
                    <div key={stock.id} className="p-3 border rounded-md space-y-3 bg-muted/20">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Stock #{stockIndex + 1}</Label>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(stockIndex, setStockLumber, stockLumber)}
                          className="h-7 w-7"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Length"
                          type="number"
                          value={stock.length}
                          onChange={(e) =>
                            handleInputChange(stockIndex, "length", e.target.value, setStockLumber, stockLumber)
                          }
                        />
                        <Select
                          value={stock.unit}
                          onValueChange={(val) =>
                            handleInputChange(stockIndex, "unit", val as Unit, setStockLumber, stockLumber)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LENGTH_UNITS.map((u) => (
                              <SelectItem key={u.value} value={u.value}>
                                {u.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        placeholder="Quantity"
                        type="number"
                        value={stock.quantity}
                        onChange={(e) =>
                          handleInputChange(stockIndex, "quantity", e.target.value, setStockLumber, stockLumber)
                        }
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Cost"
                          type="number"
                          value={stock.costPerUnit}
                          onChange={(e) =>
                            handleInputChange(stockIndex, "costPerUnit", e.target.value, setStockLumber, stockLumber)
                          }
                        />
                        <Select
                          value={stock.costUnit}
                          onValueChange={(val) =>
                            handleInputChange(
                              stockIndex,
                              "costUnit",
                              val as "per_foot" | "per_meter",
                              setStockLumber,
                              stockLumber,
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="per_foot">{COST_UNITS.per_foot}</SelectItem>
                            <SelectItem value="per_meter">{COST_UNITS.per_meter}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Defect Zones */}
                      <div className="space-y-2 pt-2">
                        <Label className="text-xs font-medium">Defect Zones</Label>
                        {stock.defectZones.map((defect, defectIndex) => (
                          <div key={defect.id} className="grid grid-cols-3 gap-1 items-center">
                            <Input
                              placeholder="Start"
                              type="number"
                              value={defect.start}
                              onChange={(e) => handleDefectChange(stockIndex, defectIndex, "start", e.target.value)}
                              className="text-xs p-1"
                            />
                            <Input
                              placeholder="End"
                              type="number"
                              value={defect.end}
                              onChange={(e) => handleDefectChange(stockIndex, defectIndex, "end", e.target.value)}
                              className="text-xs p-1"
                            />
                            <div className="flex items-center">
                              <Select
                                value={defect.unit}
                                onValueChange={(val) =>
                                  handleDefectChange(stockIndex, defectIndex, "unit", val as Unit)
                                }
                              >
                                <SelectTrigger className="text-xs p-1 h-7">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {LENGTH_UNITS.map((u) => (
                                    <SelectItem key={u.value} value={u.value}>
                                      {u.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeDefectZone(stockIndex, defectIndex)}
                                className="h-6 w-6 ml-1"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addDefectZone(stockIndex)}
                          className="w-full text-xs"
                        >
                          <PlusCircle className="mr-1 h-3 w-3" /> Add Defect Zone
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() =>
                      addItem(setStockLumber, {
                        id: uuidv4(),
                        length: "",
                        quantity: "1",
                        unit: DEFAULT_UNITS,
                        costPerUnit: "",
                        costUnit: "per_foot",
                        defectZones: [],
                      })
                    }
                    className="w-full"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Stock Lumber
                  </Button>
                </CardContent>
              </Card>

              {/* Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings2 className="mr-2 h-5 w-5" />
                    Optimizer Settings
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="max-w-xs">
                          Configure the cutting algorithm's behavior. Adjust parameters like your saw blade thickness
                          and the minimum length for a leftover piece to be considered usable.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sawKerf">Saw Kerf</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="sawKerf"
                        type="number"
                        step="0.001"
                        value={settings.sawKerf}
                        onChange={(e) => setSettings((s) => ({ ...s, sawKerf: e.target.value }))}
                      />
                      <Select
                        value={settings.kerfUnit}
                        onValueChange={(val) => setSettings((s) => ({ ...s, kerfUnit: val as Unit }))}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LENGTH_UNITS.map((u) => (
                            <SelectItem key={u.value} value={u.value}>
                              {u.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="minOffcutLength">Minimum Usable Offcut Length</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="minOffcutLength"
                        type="number"
                        value={settings.minOffcutLength}
                        onChange={(e) => setSettings((s) => ({ ...s, minOffcutLength: e.target.value }))}
                      />
                      <Select
                        value={settings.minOffcutUnit}
                        onValueChange={(val) => setSettings((s) => ({ ...s, minOffcutUnit: val as Unit }))}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LENGTH_UNITS.map((u) => (
                            <SelectItem key={u.value} value={u.value}>
                              {u.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Optimization Goal - Future Enhancement
                <div>
                  <Label htmlFor="optimizationGoal">Optimization Goal</Label>
                  <Select id="optimizationGoal" value={settings.optimizationGoal} onValueChange={(val) => setSettings(s => ({ ...s, optimizationGoal: val as OptimizerSettings['optimizationGoal'] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimize_waste">Minimize Waste</SelectItem>
                      <SelectItem value="minimize_boards">Minimize Boards Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                */}
                </CardContent>
              </Card>
              <Button onClick={runOptimizer} size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                Optimize Cuts
              </Button>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-2 space-y-6" id="results-section">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {!results && !isLoading && !error && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Scissors className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      Input your cuts and stock, then click "Optimize Cuts" to see your cutting plan.
                    </p>
                  </CardContent>
                </Card>
              )}
              {isLoading && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Loader2 className="h-16 w-16 mx-auto mb-6 text-primary animate-spin" />
                    <p className="text-muted-foreground">Optimizing your cuts, please wait...</p>
                    <p className="text-xs text-muted-foreground mt-2">(This may take a moment for complex plans)</p>
                  </CardContent>
                </Card>
              )}

              {results && (
                <>
                  {results.unaccommodatedPieces.length > 0 && (
                    <Alert variant="warning">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Not All Pieces Accommodated!</AlertTitle>
                      <AlertDescription>
                        The following pieces could not be cut from the available stock:
                        <ul className="list-disc pl-5 mt-2">
                          {results.unaccommodatedPieces.map((p, i) => (
                            <li key={i}>
                              {p.quantityRemaining}x {p.label} ({p.length.toFixed(1)} {p.unit})
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-xs">
                          Suggestions: Add more stock, adjust cut lengths, or check defect zones.
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Optimization Summary
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="max-w-xs">
                              View the optimized cutting diagrams for each stock board, along with detailed summaries of
                              material utilization, total waste, and estimated costs.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </CardTitle>
                      <CardDescription>Calculation completed in {results.calculationTime}ms.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="p-3 bg-muted/30 rounded-md">
                        <div className="font-semibold text-primary">
                          {results.totalWasteLength.toFixed(1)} {settings.minOffcutUnit}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Unusable Waste</div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-md">
                        <div className="font-semibold text-primary">{results.totalWastePercentage.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">Waste Percentage</div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-md">
                        <div className="font-semibold text-primary">${results.estimatedWasteCost.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">Est. Waste Cost</div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-md">
                        <div className="font-semibold text-primary">${results.totalMaterialCost.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">Total Material Cost</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <LayoutGrid className="mr-2 h-5 w-5" />
                        Cutting Plan per Stock Board
                        {/* Tooltip already present on "Optimization Summary", which covers this area. 
                            If a separate tooltip is desired here, it can be added similarly. 
                            For now, assuming the summary tooltip covers the general results area. */}
                      </CardTitle>
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" variant="outline" onClick={handleDownloadPdf}>
                          <Download className="mr-1 h-4 w-4" /> PDF
                        </Button>
                        <Button size="sm" variant="outline" onClick={handlePrint}>
                          <Printer className="mr-1 h-4 w-4" /> Print
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {results.cuttingPlanByBoard.length === 0 && (
                        <p className="text-muted-foreground text-sm">
                          No cuts were made. Check stock or unaccommodated pieces.
                        </p>
                      )}
                      {results.cuttingPlanByBoard.map((plan, index) => (
                        <StockBoardDiagram
                          key={plan.stockBoardInstanceId}
                          plan={plan}
                          kerf={
                            Number.parseFloat(settings.sawKerf) > 0
                              ? convertToInches(Number.parseFloat(settings.sawKerf), settings.kerfUnit)
                              : 0
                          }
                          minOffcutLength={convertToInches(
                            Number.parseFloat(settings.minOffcutLength),
                            settings.minOffcutUnit,
                          )}
                          displayUnit={settings.minOffcutUnit} // Or a dedicated display unit setting
                        />
                      ))}
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <ListChecks className="mr-2 h-5 w-5" />
                          Stock Utilization
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Stock Length</TableHead>
                              <TableHead>Qty Used</TableHead>
                              <TableHead>Utilization</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.stockUtilization.map((s) => (
                              <TableRow key={s.stockId + s.originalLength}>
                                <TableCell>
                                  {s.originalLength.toFixed(1)} {s.unit}
                                </TableCell>
                                <TableCell>{s.quantityUsed}</TableCell>
                                <TableCell>{s.utilizationPercentage.toFixed(1)}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Sparkles className="mr-2 h-5 w-5" />
                          Optimal Offcuts
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {results.optimalOffcuts.length === 0 && (
                          <p className="text-muted-foreground text-sm">No usable offcuts generated.</p>
                        )}
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Length</TableHead>
                              <TableHead>Quantity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.optimalOffcuts.map((offcut, i) => (
                              <TableRow key={i}>
                                <TableCell>
                                  {offcut.length.toFixed(1)} {offcut.unit}
                                </TableCell>
                                <TableCell>{offcut.count}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Value Added Content Sections */}
          <div className="space-y-12 pt-8 border-t">
            <section id="instructions">
              <h2 className="text-2xl font-semibold mb-3">How to Use the Lumber Cut Optimizer</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  This tool helps you get the most out of your lumber by planning cuts efficiently. Follow these steps:
                </p>
                <ol>
                  <li>
                    <strong>Enter Required Cuts:</strong> For each piece you need, specify its length, the quantity, and
                    the unit of measurement. You can also add an optional label (e.g., "Table Leg") for easier
                    identification. Mark critical pieces as "High Priority" to ensure they are planned first. Enable
                    "Grain Match" if the orientation of the piece on the stock matters.
                  </li>
                  <li>
                    <strong>Define Stock Lumber:</strong> List all the lumber boards you have available. For each type
                    of stock, enter its length, quantity, unit, and optionally, its cost per foot or meter.
                  </li>
                  <li>
                    <strong>Mark Defect Zones (Optional):</strong> For each stock board, you can specify areas that
                    should not be cut due_to knots, cracks, or other defects. Enter the start and end position of each
                    defect zone. The optimizer will work around these areas.
                  </li>
                  <li>
                    <strong>Configure Settings:</strong>
                    <ul>
                      <li>
                        <strong>Saw Kerf:</strong> Enter the thickness of your saw blade. This amount will be lost for
                        each cut.
                      </li>
                      <li>
                        <strong>Minimum Usable Offcut Length:</strong> Specify the shortest piece of leftover wood you
                        consider usable. Anything shorter will be classified as waste.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Optimize Cuts:</strong> Click the "Optimize Cuts" button (or wait for automatic update). The
                    tool will calculate the most efficient way to cut your required pieces from your available stock.
                  </li>
                  <li>
                    <strong>Review Results:</strong>
                    <ul>
                      <li>
                        <strong>Cutting Plan:</strong> Visual diagrams show how each stock board is cut.
                      </li>
                      <li>
                        <strong>Summary:</strong> Check total waste, material utilization, and estimated costs.
                      </li>
                      <li>
                        <strong>Unaccommodated Pieces:</strong> If any pieces couldn't be cut, they'll be listed here
                        with suggestions.
                      </li>
                      <li>
                        <strong>Optimal Offcuts:</strong> A list of usable leftover pieces you can save for future
                        projects.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Download/Print:</strong> Use the buttons to get a PDF or print your cutting plan.
                  </li>
                </ol>
              </div>
            </section>
            <section id="principles">
              <h2 className="text-2xl font-semibold mb-3">Optimization Principles Explained</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  This Lumber Cut Optimizer uses a sophisticated algorithm based on the "First Fit Decreasing" (FFD)
                  heuristic, a common approach to solving the 1D cutting stock problem. Here's a simplified explanation:
                </p>
                <ul>
                  <li>
                    <strong>Sorting Cuts:</strong> Required cuts are first sorted. High-priority cuts come first, then
                    longer cuts are prioritized over shorter ones. This helps ensure that larger, often more critical,
                    pieces find space.
                  </li>
                  <li>
                    <strong>Placing Cuts on Stock:</strong> The algorithm iterates through your available stock boards.
                    For each board, it tries to fit the sorted required cuts one by one. It looks for the first
                    available space (segment) on the board where a cut (plus saw kerf) will fit.
                  </li>
                  <li>
                    <strong>Defect Avoidance:</strong> If you've marked defect zones, the algorithm treats these areas
                    as unusable, effectively splitting a stock board into multiple usable segments.
                  </li>
                  <li>
                    <strong>Minimizing Waste:</strong> By placing larger pieces first and then trying to fit smaller
                    pieces into the remaining gaps (offcuts), the algorithm aims to reduce the amount of unusable
                    leftover material.
                  </li>
                  <li>
                    <strong>Iterative Refinement:</strong> While not a perfect mathematical optimization (which is
                    computationally very expensive), this heuristic approach provides very good, practical solutions
                    quickly, suitable for real-time use in a web browser. It's designed to give you a plan that
                    significantly reduces waste compared to manual planning.
                  </li>
                </ul>
                <p>
                  The goal is to maximize the utilization of each stock board, reduce the number of new boards you might
                  need to buy, and minimize the environmental impact by wasting less wood.
                </p>
              </div>
            </section>
            {/* Placeholder for Troubleshooting and FAQs */}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
