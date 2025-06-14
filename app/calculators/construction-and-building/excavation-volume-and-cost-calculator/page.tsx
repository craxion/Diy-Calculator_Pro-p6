"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, AlertCircle, Trash2, CalculatorIcon } from "lucide-react"
import type {
  ExcavationFormState,
  CalculationResults,
  ExcavationType,
  DimensionUnit,
  DensityUnit,
  VolumeUnit,
} from "../../../../components/calculators/excavation-calculator/types"
import {
  soilTypeData,
  commonDimensionUnits,
  commonDensityUnits,
  commonVolumeUnits,
} from "../../../../components/calculators/excavation-calculator/types"
import { calculateExcavation } from "../../../../components/calculators/excavation-calculator/calculation-logic"
import ExcavationDiagram from "../../../../components/calculators/excavation-calculator/excavation-diagram"
import { formatNumber, parseNumericInput } from "../../../../components/calculators/excavation-calculator/utils"

const initialFormState: ExcavationFormState = {
  excavationType: "rectangular",
  length: "10",
  lengthUnit: "ft",
  width: "10",
  widthUnit: "ft",
  depth: "2",
  depthUnit: "ft",
  diameter: "5",
  diameterUnit: "ft",
  topWidth: "3",
  topWidthUnit: "ft",
  bottomWidth: "2",
  bottomWidthUnit: "ft",
  soilType: "Loam",
  customSwellFactor: "25", // Default for Loam
  customSoilDensity: soilTypeData["Loam"].densityLbFt3.toString(), // Default for Loam
  soilDensityUnit: "lb/ft3",
  disposalCostPerUnit: "50",
  disposalCostUnit: "yd3",
  truckCapacity: "10",
  truckCapacityUnit: "yd3",
  laborRate: "25",
  laborHours: "8",
  equipmentRate: "75",
  equipmentHours: "4",
}

export default function ExcavationCalculatorPage() {
  const [formState, setFormState] = useState<ExcavationFormState>(initialFormState)
  const [results, setResults] = useState<CalculationResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: keyof ExcavationFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }))
    if (name === "soilType" && value !== "Custom") {
      const selectedSoil = soilTypeData[value]
      if (selectedSoil) {
        setFormState((prev) => ({
          ...prev,
          customSwellFactor: selectedSoil.swell.toString(),
          customSoilDensity:
            prev.soilDensityUnit === "lb/ft3"
              ? selectedSoil.densityLbFt3.toString()
              : selectedSoil.densityKgM3.toString(),
        }))
      }
    }
    if (name === "soilDensityUnit" && formState.soilType !== "Custom") {
      const selectedSoil = soilTypeData[formState.soilType]
      if (selectedSoil) {
        setFormState((prev) => ({
          ...prev,
          customSoilDensity:
            value === "lb/ft3" ? selectedSoil.densityLbFt3.toString() : selectedSoil.densityKgM3.toString(),
        }))
      }
    }
  }

  const performCalculation = useCallback(() => {
    setIsLoading(true)
    setError(null)
    // Basic client-side validation before sending to calculation logic
    if (
      formState.excavationType === "rectangular" &&
      (parseNumericInput(formState.length) <= 0 ||
        parseNumericInput(formState.width) <= 0 ||
        parseNumericInput(formState.depth) <= 0)
    ) {
      setError("Rectangular dimensions must be positive values.")
      setIsLoading(false)
      setResults(null)
      return
    }
    if (
      formState.excavationType === "circular" &&
      (parseNumericInput(formState.diameter) <= 0 || parseNumericInput(formState.depth) <= 0)
    ) {
      setError("Circular dimensions must be positive values.")
      setIsLoading(false)
      setResults(null)
      return
    }
    // Add more specific validations as needed

    const calcResults = calculateExcavation(formState)
    if (calcResults.error) {
      setError(calcResults.error)
      setResults(null)
    } else {
      setResults(calcResults)
    }
    setIsLoading(false)
  }, [formState])

  useEffect(() => {
    // To avoid initial calculation with empty/default values before user interaction,
    // you might add a check here, or rely on the calculate button primarily.
    // For now, let's keep it simple and calculate on formState change.
    performCalculation()
  }, [formState, performCalculation]) // Changed dependency here

  const handleReset = () => {
    setFormState(initialFormState)
    setResults(null)
    setError(null)
  }

  const renderDimensionInputs = () => {
    switch (formState.excavationType) {
      case "rectangular":
        return (
          <>
            <DimensionInputRow
              name="length"
              label="Length"
              value={formState.length}
              unit={formState.lengthUnit}
              onChange={handleInputChange}
              onUnitChange={(val) => handleSelectChange("lengthUnit", val)}
            />
            <DimensionInputRow
              name="width"
              label="Width"
              value={formState.width}
              unit={formState.widthUnit}
              onChange={handleInputChange}
              onUnitChange={(val) => handleSelectChange("widthUnit", val)}
            />
            <DimensionInputRow
              name="depth"
              label="Depth"
              value={formState.depth}
              unit={formState.depthUnit}
              onChange={handleInputChange}
              onUnitChange={(val) => handleSelectChange("depthUnit", val)}
            />
          </>
        )
      case "circular":
        return (
          <>
            <DimensionInputRow
              name="diameter"
              label="Diameter"
              value={formState.diameter}
              unit={formState.diameterUnit}
              onChange={handleInputChange}
              onUnitChange={(val) => handleSelectChange("diameterUnit", val)}
            />
            <DimensionInputRow
              name="depth"
              label="Depth"
              value={formState.depth}
              unit={formState.depthUnit}
              onChange={handleInputChange}
              onUnitChange={(val) => handleSelectChange("depthUnit", val)}
            />
          </>
        )
      case "trench":
        return (
          <>
            <DimensionInputRow
              name="length"
              label="Length"
              value={formState.length}
              unit={formState.lengthUnit}
              onChange={handleInputChange}
              onUnitChange={(val) => handleSelectChange("lengthUnit", val)}
            />
            <DimensionInputRow
              name="topWidth"
              label="Top Width"
              value={formState.topWidth}
              unit={formState.topWidthUnit}
              onChange={handleInputChange}
              onUnitChange={(val) => handleSelectChange("topWidthUnit", val)}
            />
            <DimensionInputRow
              name="bottomWidth"
              label="Bottom Width (0 or empty for straight sides)"
              value={formState.bottomWidth}
              unit={formState.bottomWidthUnit}
              onChange={handleInputChange}
              onUnitChange={(val) => handleSelectChange("bottomWidthUnit", val)}
            />
            <DimensionInputRow
              name="depth"
              label="Depth"
              value={formState.depth}
              unit={formState.depthUnit}
              onChange={handleInputChange}
              onUnitChange={(val) => handleSelectChange("depthUnit", val)}
            />
          </>
        )
      default:
        return null
    }
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Excavation Volume & Cost Calculator</h1>
          <p className="text-muted-foreground md:text-lg">
            Estimate excavation volume, material weight, and project costs accurately.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Excavation Details
                  <TooltipInfo text="Select excavation type and enter dimensions." />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="excavationType">Excavation Type</Label>
                  <Select
                    name="excavationType"
                    value={formState.excavationType}
                    onValueChange={(val) => handleSelectChange("excavationType", val as ExcavationType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rectangular">Rectangular Area / Slab</SelectItem>
                      <SelectItem value="trench">Trench</SelectItem>
                      <SelectItem value="circular">Circular Hole / Pier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {renderDimensionInputs()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Soil & Swell Properties
                  <TooltipInfo text="Define soil characteristics for accurate volume and weight estimation." />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="soilType">Soil Type</Label>
                    <Select
                      name="soilType"
                      value={formState.soilType}
                      onValueChange={(val) => handleSelectChange("soilType", val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(soilTypeData).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="customSwellFactor">Swell Factor (%)</Label>
                    <Input
                      name="customSwellFactor"
                      type="number"
                      value={formState.customSwellFactor}
                      onChange={handleInputChange}
                      placeholder="e.g., 25"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Typical: Loose Soil (10-15%), Sand/Gravel (10-20%), Loam (20-30%), Clay (30-40%), Rock (40-60%)
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customSoilDensity">Soil Density</Label>
                    <Input
                      name="customSoilDensity"
                      type="number"
                      value={formState.customSoilDensity}
                      onChange={handleInputChange}
                      placeholder="e.g., 100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="soilDensityUnit">Density Unit</Label>
                    <Select
                      name="soilDensityUnit"
                      value={formState.soilDensityUnit}
                      onValueChange={(val) => handleSelectChange("soilDensityUnit", val as DensityUnit)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {commonDensityUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Cost Inputs
                  <TooltipInfo text="Enter costs for disposal, labor, and equipment to estimate total project expenses." />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-semibold text-md">Disposal Costs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="disposalCostPerUnit">Cost per Unit</Label>
                    <Input
                      name="disposalCostPerUnit"
                      type="number"
                      value={formState.disposalCostPerUnit}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Select
                      name="disposalCostUnit"
                      value={formState.disposalCostUnit}
                      onValueChange={(val) => handleSelectChange("disposalCostUnit", val as VolumeUnit)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {commonVolumeUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="truckCapacity">Avg. Truck Capacity</Label>
                    <Input
                      name="truckCapacity"
                      type="number"
                      value={formState.truckCapacity}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Select
                      name="truckCapacityUnit"
                      value={formState.truckCapacityUnit}
                      onValueChange={(val) => handleSelectChange("truckCapacityUnit", val as VolumeUnit)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {commonVolumeUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <h3 className="font-semibold text-md">Labor Costs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="laborRate">Hourly Rate ($)</Label>
                    <Input name="laborRate" type="number" value={formState.laborRate} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="laborHours">Est. Hours</Label>
                    <Input name="laborHours" type="number" value={formState.laborHours} onChange={handleInputChange} />
                  </div>
                </div>
                <h3 className="font-semibold text-md">Equipment Costs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="equipmentRate">Hourly Rate ($)</Label>
                    <Input
                      name="equipmentRate"
                      type="number"
                      value={formState.equipmentRate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="equipmentHours">Est. Hours</Label>
                    <Input
                      name="equipmentHours"
                      type="number"
                      value={formState.equipmentHours}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex space-x-4">
              <Button onClick={performCalculation} disabled={isLoading} className="w-full md:w-auto">
                <CalculatorIcon className="mr-2 h-4 w-4" /> {isLoading ? "Calculating..." : "Calculate"}
              </Button>
              <Button onClick={handleReset} variant="outline" className="w-full md:w-auto">
                <Trash2 className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>
          </div>

          {/* Results Column / Diagram */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visual Aid</CardTitle>
              </CardHeader>
              <CardContent>
                <ExcavationDiagram
                  type={formState.excavationType}
                  lengthStr={formState.length}
                  widthStr={formState.width}
                  depthStr={formState.depth}
                  diameterStr={formState.diameter}
                  topWidthStr={formState.topWidth}
                  bottomWidthStr={formState.bottomWidth}
                  unit={formState.lengthUnit} // Pass a primary unit, or individual units
                  depthUnit={formState.depthUnit}
                  diameterUnit={formState.diameterUnit}
                  topWidthUnit={formState.topWidthUnit}
                  bottomWidthUnit={formState.bottomWidthUnit}
                />
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Calculating results...</AlertDescription>
              </Alert>
            )}

            {results && !error && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    Results Summary
                    <TooltipInfo text="Summary of calculated volumes, weight, and costs." />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ResultItem
                    label="Original Excavated Volume"
                    value={`${formatNumber(results.originalVolumeFt3)} ft³ / ${formatNumber(results.originalVolumeYd3)} yd³ / ${formatNumber(results.originalVolumeM3)} m³`}
                  />
                  <ResultItem
                    label="Expanded (Loose) Volume"
                    value={`${formatNumber(results.expandedVolumeFt3)} ft³ / ${formatNumber(results.expandedVolumeYd3)} yd³ / ${formatNumber(results.expandedVolumeM3)} m³`}
                    tooltip="Volume after soil is dug and expands (swell factor applied)."
                  />
                  <ResultItem
                    label="Estimated Material Weight"
                    value={`${formatNumber(results.estimatedWeightLbs)} lbs / ${formatNumber(results.estimatedWeightKg)} kg`}
                  />
                  <ResultItem label="Estimated Disposal Trips" value={formatNumber(results.disposalTrips, 0)} />
                  {results.dumpsterSuggestion && (
                    <ResultItem label="Dumpster Suggestion" value={results.dumpsterSuggestion.message} />
                  )}

                  <h3 className="font-semibold text-md pt-2 border-t">Cost Breakdown</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Disposal Cost</TableCell>
                        <TableCell className="text-right">${formatNumber(results.costs.disposal)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Labor Cost</TableCell>
                        <TableCell className="text-right">${formatNumber(results.costs.labor)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Equipment Cost</TableCell>
                        <TableCell className="text-right">${formatNumber(results.costs.equipment)}</TableCell>
                      </TableRow>
                      <TableRow className="font-bold">
                        <TableCell>Grand Total</TableCell>
                        <TableCell className="text-right">${formatNumber(results.costs.total)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Supporting Content Sections */}
        <div className="space-y-6 pt-8">
          <SupportingContentCard title="How to Use This Calculator">
            <p>1. Select the shape of your excavation (Rectangular, Trench, or Circular).</p>
            <p>2. Enter the required dimensions for your chosen shape, selecting the appropriate units for each.</p>
            <p>
              3. Choose your soil type or enter custom swell factor and density values. Swell factor accounts for how
              much soil expands when dug. Density helps estimate weight.
            </p>
            <p>4. Input your estimated costs for material disposal, labor, and equipment rental.</p>
            <p>
              5. Review the dynamically updated results, including volumes, weight, disposal needs, and a detailed cost
              breakdown.
            </p>
          </SupportingContentCard>
          <SupportingContentCard title="What is Excavation?">
            <p>
              Excavation is the process of moving earth, rock, or other materials with tools, equipment, or explosives.
              It includes earthwork, trenching, wall shafts, tunneling, and underground. It's a fundamental part of many
              construction projects, from laying foundations and installing utilities to landscaping and road building.
            </p>
          </SupportingContentCard>
          <SupportingContentCard title="Understanding Soil Swell and Its Impact">
            <p>
              Soil swell, also known as bulking, refers to the increase in volume of soil when it is excavated from its
              natural, compacted state. This happens because the digging process loosens the soil particles and
              introduces air voids. The swell factor, expressed as a percentage, quantifies this increase. For example,
              a swell factor of 25% means 1 cubic yard of soil in the ground will become 1.25 cubic yards once
              excavated.
            </p>
            <p>Understanding swell is crucial for: </p>
            <ul className="list-disc list-inside ml-4">
              <li>Accurately estimating the amount of material to be hauled away.</li>
              <li>Sizing dumpsters or trucks correctly for disposal.</li>
              <li>Budgeting for disposal costs, as these are often based on loose volume.</li>
            </ul>
            <p>
              Different soil types have different swell factors. Clay soils tend to swell more than sandy or gravelly
              soils.
            </p>
          </SupportingContentCard>
          <SupportingContentCard title="Key Factors Affecting Excavation Cost">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Volume of Material:</strong> The primary driver – more soil means more work, more disposal.
              </li>
              <li>
                <strong>Soil Type:</strong> Rocky or hard clay soils are more difficult and time-consuming to excavate
                than loose soil or sand, potentially requiring specialized equipment.
              </li>
              <li>
                <strong>Site Accessibility:</strong> Tight spaces or difficult terrain can slow down work and
                necessitate smaller, less efficient equipment.
              </li>
              <li>
                <strong>Depth of Excavation:</strong> Deeper excavations may require shoring or benching for safety,
                adding to time and cost.
              </li>
              <li>
                <strong>Equipment Needed:</strong> The type and size of excavation equipment (e.g., mini-excavator,
                backhoe, bulldozer) impact rental rates and efficiency.
              </li>
              <li>
                <strong>Disposal Fees:</strong> Costs to transport and dump excavated material at a landfill or
                processing site can be significant. Distance to disposal site matters.
              </li>
              <li>
                <strong>Labor Rates:</strong> Skilled operator and laborer wages vary by region.
              </li>
              <li>
                <strong>Utility Locates & Permits:</strong> Time and fees associated with identifying and working around
                underground utilities, and obtaining necessary permits.
              </li>
              <li>
                <strong>Water Table:</strong> Excavating in areas with a high water table may require dewatering
                efforts.
              </li>
            </ul>
          </SupportingContentCard>
          <SupportingContentCard title="Excavation Safety Best Practices">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Call Before You Dig:</strong> Always contact your local utility locating service (e.g., 811 in
                the US) a few days before starting any excavation to have underground utilities marked. Hitting a
                utility line can be dangerous and costly.
              </li>
              <li>
                <strong>Trench Safety:</strong> For trenches 5 feet (1.5 meters) deep or greater, protective systems
                like shoring, sloping, or trench boxes are generally required to prevent cave-ins. Never enter an
                unprotected trench.
              </li>
              <li>
                <strong>Inspect Excavations Daily:</strong> Check for signs of instability, water seepage, or other
                hazards before each work shift and after rainstorms.
              </li>
              <li>
                <strong>Keep Heavy Equipment Away from Edges:</strong> Position machinery and spoil piles (excavated
                soil) at least 2 feet (0.6 meters) from the edge of excavations to prevent collapse.
              </li>
              <li>
                <strong>Provide Safe Access/Egress:</strong> Ladders, stairs, or ramps should be provided in trenches 4
                feet (1.2 meters) or deeper, and located within 25 feet (7.6 meters) of workers.
              </li>
              <li>
                <strong>Wear Appropriate PPE:</strong> Hard hats, high-visibility clothing, steel-toed boots, and gloves
                are essential. Respiratory protection may be needed in dusty conditions.
              </li>
              <li>
                <strong>Be Aware of Underground Structures:</strong> Besides utilities, be mindful of foundations,
                septic tanks, or other buried structures.
              </li>
              <li>
                <strong>Emergency Plan:</strong> Know what to do in case of an emergency, including rescue procedures
                and emergency contact numbers.
              </li>
            </ul>
          </SupportingContentCard>
          {/* Add more supporting content cards as needed */}
        </div>
      </div>
    </TooltipProvider>
  )
}

// Helper component for consistent input rows
interface DimensionInputRowProps {
  name: keyof ExcavationFormState
  label: string
  value: string
  unit: DimensionUnit
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUnitChange: (value: string) => void
  tooltip?: string
}

const DimensionInputRow: React.FC<DimensionInputRowProps> = ({
  name,
  label,
  value,
  unit,
  onChange,
  onUnitChange,
  tooltip,
}) => (
  <div className="grid grid-cols-2 gap-2 items-end">
    <div>
      <Label htmlFor={name as string} className="flex items-center">
        {label}
        {tooltip && <TooltipInfo text={tooltip} />}
      </Label>
      <Input name={name as string} type="number" value={value} onChange={onChange} placeholder="0" />
    </div>
    <div>
      <Label htmlFor={`${name as string}Unit`}>Unit</Label>
      <Select name={`${name as string}Unit`} value={unit} onValueChange={onUnitChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {commonDimensionUnits.map((u) => (
            <SelectItem key={u} value={u}>
              {u}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
)

// Helper component for consistent result items
interface ResultItemProps {
  label: string
  value: string | number
  tooltip?: string
}
const ResultItem: React.FC<ResultItemProps> = ({ label, value, tooltip }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-sm text-muted-foreground flex items-center">
      {label}
      {tooltip && <TooltipInfo text={tooltip} />}
    </span>
    <span className="font-semibold">{value}</span>
  </div>
)

// Helper component for info tooltips
const TooltipInfo: React.FC<{ text: string }> = ({ text }) => (
  <Tooltip delayDuration={100}>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 p-0">
        <Info className="h-4 w-4 text-muted-foreground" />
      </Button>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs">
      <p>{text}</p>
    </TooltipContent>
  </Tooltip>
)

// Helper for supporting content cards
const SupportingContentCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-xl md:text-2xl">{title}</CardTitle>
    </CardHeader>
    <CardContent className="prose prose-sm md:prose-base max-w-none dark:prose-invert">{children}</CardContent>
  </Card>
)
