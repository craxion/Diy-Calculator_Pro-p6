"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, Info, RotateCcw, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react"

// Unit conversion functions
const convertToFeet = (value: number, unit: string): number => {
  switch (unit) {
    case "inches":
      return value / 12
    case "meters":
      return value * 3.28084
    case "cm":
      return value / 30.48
    default:
      return value // feet
  }
}

const convertFromCubicFeet = (cubicFeet: number, targetUnit: string): number => {
  switch (targetUnit) {
    case "cubic-yards":
      return cubicFeet / 27
    case "cubic-meters":
      return cubicFeet / 35.3147
    default:
      return cubicFeet
  }
}

export default function ConcreteSlabCalculatorPage() {
  // Input states
  const [length, setLength] = useState("")
  const [width, setWidth] = useState("")
  const [thickness, setThickness] = useState("")
  const [lengthUnit, setLengthUnit] = useState("feet")
  const [widthUnit, setWidthUnit] = useState("feet")
  const [thicknessUnit, setThicknessUnit] = useState("inches")
  const [wasteFactor, setWasteFactor] = useState("10")
  const [pricePerYard, setPricePerYard] = useState("")
  const [customBagYield, setCustomBagYield] = useState("")
  const [useCustomYield, setUseCustomYield] = useState(false)

  // Results state
  const [results, setResults] = useState<{
    volumeCubicFeet: number
    volumeCubicYards: number
    volumeCubicMeters: number
    volumeWithWaste: number
    bags60lb: number
    bags80lb: number
    bagsCustom: number
    totalCost: number
    isValid: boolean
  } | null>(null)

  // Default bag yields (cubic feet per bag)
  const defaultYields = {
    "60lb": 0.45,
    "80lb": 0.6,
  }

  // Real-time calculation
  useEffect(() => {
    calculateConcrete()
  }, [
    length,
    width,
    thickness,
    lengthUnit,
    widthUnit,
    thicknessUnit,
    wasteFactor,
    pricePerYard,
    customBagYield,
    useCustomYield,
  ])

  const calculateConcrete = () => {
    const l = Number.parseFloat(length)
    const w = Number.parseFloat(width)
    const t = Number.parseFloat(thickness)
    const waste = Number.parseFloat(wasteFactor) / 100
    const price = Number.parseFloat(pricePerYard) || 0
    const customYield = Number.parseFloat(customBagYield) || 0

    if (!l || !w || !t || l <= 0 || w <= 0 || t <= 0) {
      setResults(null)
      return
    }

    // Convert all dimensions to feet
    const lengthFt = convertToFeet(l, lengthUnit)
    const widthFt = convertToFeet(w, widthUnit)
    const thicknessFt = convertToFeet(t, thicknessUnit)

    // Calculate volume in cubic feet
    const volumeCubicFeet = lengthFt * widthFt * thicknessFt
    const volumeCubicYards = convertFromCubicFeet(volumeCubicFeet, "cubic-yards")
    const volumeCubicMeters = convertFromCubicFeet(volumeCubicFeet, "cubic-meters")

    // Add waste factor
    const volumeWithWaste = volumeCubicYards * (1 + waste)

    // Calculate bags needed
    const bags60lb = Math.ceil((volumeCubicFeet * (1 + waste)) / defaultYields["60lb"])
    const bags80lb = Math.ceil((volumeCubicFeet * (1 + waste)) / defaultYields["80lb"])
    const bagsCustom = useCustomYield && customYield > 0 ? Math.ceil((volumeCubicFeet * (1 + waste)) / customYield) : 0

    // Calculate total cost
    const totalCost = volumeWithWaste * price

    setResults({
      volumeCubicFeet,
      volumeCubicYards,
      volumeCubicMeters,
      volumeWithWaste,
      bags60lb,
      bags80lb,
      bagsCustom,
      totalCost,
      isValid: true,
    })
  }

  const reset = () => {
    setLength("")
    setWidth("")
    setThickness("")
    setLengthUnit("feet")
    setWidthUnit("feet")
    setThicknessUnit("inches")
    setWasteFactor("10")
    setPricePerYard("")
    setCustomBagYield("")
    setUseCustomYield(false)
    setResults(null)
  }

  // Simple SVG Diagram Component
  const SlabDiagram = () => (
    <div className="bg-muted/30 p-6 rounded-lg">
      <h4 className="font-semibold mb-4 text-center">Slab Dimensions</h4>
      <svg viewBox="0 0 300 200" className="w-full max-w-sm mx-auto">
        {/* Main rectangle */}
        <rect x="50" y="60" width="200" height="80" fill="none" stroke="currentColor" strokeWidth="2" />

        {/* Length arrow and label */}
        <line
          x1="50"
          y1="45"
          x2="250"
          y2="45"
          stroke="currentColor"
          strokeWidth="1"
          markerEnd="url(#arrowhead)"
          markerStart="url(#arrowhead)"
        />
        <text x="150" y="35" textAnchor="middle" className="text-sm font-medium">
          Length
        </text>

        {/* Width arrow and label */}
        <line
          x1="35"
          y1="60"
          x2="35"
          y2="140"
          stroke="currentColor"
          strokeWidth="1"
          markerEnd="url(#arrowhead)"
          markerStart="url(#arrowhead)"
        />
        <text x="20" y="105" textAnchor="middle" className="text-sm font-medium" transform="rotate(-90 20 105)">
          Width
        </text>

        {/* Thickness indicator */}
        <line x1="260" y1="60" x2="275" y2="45" stroke="currentColor" strokeWidth="1" />
        <line x1="260" y1="140" x2="275" y2="155" stroke="currentColor" strokeWidth="1" />
        <line
          x1="275"
          y1="45"
          x2="275"
          y2="155"
          stroke="currentColor"
          strokeWidth="1"
          markerEnd="url(#arrowhead)"
          markerStart="url(#arrowhead)"
        />
        <text x="285" y="105" textAnchor="start" className="text-sm font-medium" transform="rotate(-90 285 105)">
          Thickness
        </text>

        {/* Arrow markers */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
          </marker>
        </defs>
      </svg>
    </div>
  )

  return (
    <div className="container py-12 max-w-6xl">
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Professional Concrete Slab Calculator</h1>
          </div>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            Calculate precise concrete requirements for your slab project with our industry-leading calculator. Get
            accurate volume estimates, bag counts, and cost projections with advanced customization options.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5" />
                  <span>Slab Dimensions</span>
                </CardTitle>
                <CardDescription>Enter your concrete slab measurements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <SlabDiagram />
                  </div>

                  <div className="space-y-4">
                    {/* Length Input */}
                    <div className="space-y-2">
                      <Label htmlFor="length">Length</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="length"
                          type="number"
                          placeholder="0"
                          value={length}
                          onChange={(e) => setLength(e.target.value)}
                          className="flex-1"
                        />
                        <Select value={lengthUnit} onValueChange={setLengthUnit}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="feet">ft</SelectItem>
                            <SelectItem value="inches">in</SelectItem>
                            <SelectItem value="meters">m</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Width Input */}
                    <div className="space-y-2">
                      <Label htmlFor="width">Width</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="width"
                          type="number"
                          placeholder="0"
                          value={width}
                          onChange={(e) => setWidth(e.target.value)}
                          className="flex-1"
                        />
                        <Select value={widthUnit} onValueChange={setWidthUnit}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="feet">ft</SelectItem>
                            <SelectItem value="inches">in</SelectItem>
                            <SelectItem value="meters">m</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Thickness Input */}
                    <div className="space-y-2">
                      <Label htmlFor="thickness">Thickness</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="thickness"
                          type="number"
                          placeholder="4"
                          value={thickness}
                          onChange={(e) => setThickness(e.target.value)}
                          className="flex-1"
                        />
                        <Select value={thicknessUnit} onValueChange={setThicknessUnit}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inches">in</SelectItem>
                            <SelectItem value="cm">cm</SelectItem>
                            <SelectItem value="feet">ft</SelectItem>
                            <SelectItem value="meters">m</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Options</CardTitle>
                <CardDescription>Customize your calculation parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="waste">Waste Factor (%)</Label>
                    <Select value={wasteFactor} onValueChange={setWasteFactor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5% - Experienced</SelectItem>
                        <SelectItem value="10">10% - Standard</SelectItem>
                        <SelectItem value="15">15% - Extra Safety</SelectItem>
                        <SelectItem value="20">20% - Complex Shape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Cubic Yard ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="150"
                      value={pricePerYard}
                      onChange={(e) => setPricePerYard(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="customYield"
                      checked={useCustomYield}
                      onChange={(e) => setUseCustomYield(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="customYield">Use Custom Bag Yield</Label>
                  </div>

                  {useCustomYield && (
                    <div className="space-y-2">
                      <Label htmlFor="customBagYield">Custom Bag Yield (cubic feet per bag)</Label>
                      <Input
                        id="customBagYield"
                        type="number"
                        step="0.01"
                        placeholder="0.6"
                        value={customBagYield}
                        onChange={(e) => setCustomBagYield(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Default yields: 60lb bags = 0.45 ft³, 80lb bags = 0.6 ft³
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button onClick={calculateConcrete} className="flex-1">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Concrete
                  </Button>
                  <Button onClick={reset} variant="outline">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Calculation Results</span>
                </CardTitle>
                <CardDescription>Material requirements and cost estimates</CardDescription>
              </CardHeader>
              <CardContent>
                {results?.isValid ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{results.volumeWithWaste.toFixed(2)} yd³</div>
                        <div className="text-sm text-muted-foreground">Total concrete needed (with waste)</div>
                      </div>

                      <Tabs defaultValue="volume" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="volume">Volume</TabsTrigger>
                          <TabsTrigger value="bags">Bags</TabsTrigger>
                          <TabsTrigger value="cost">Cost</TabsTrigger>
                        </TabsList>

                        <TabsContent value="volume" className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Base Volume:</span>
                              <span className="text-sm font-medium">{results.volumeCubicYards.toFixed(2)} yd³</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Cubic Feet:</span>
                              <span className="text-sm font-medium">{results.volumeCubicFeet.toFixed(1)} ft³</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Cubic Meters:</span>
                              <span className="text-sm font-medium">{results.volumeCubicMeters.toFixed(2)} m³</span>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="bags" className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">60lb Bags:</span>
                              <Badge variant="outline">{results.bags60lb} bags</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">80lb Bags:</span>
                              <Badge variant="outline">{results.bags80lb} bags</Badge>
                            </div>
                            {useCustomYield && results.bagsCustom > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Custom Bags:</span>
                                <Badge>{results.bagsCustom} bags</Badge>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="cost" className="space-y-3">
                          {results.totalCost > 0 ? (
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-xl font-bold text-green-700">${results.totalCost.toFixed(2)}</div>
                              <div className="text-sm text-green-600">Estimated total cost</div>
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground py-4">
                              <p className="text-sm">Enter price per cubic yard to see cost estimate</p>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>

                    {/* Material Summary */}
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Material Summary:</strong> You need {results.volumeWithWaste.toFixed(2)} cubic yards of
                        concrete, which equals approximately {results.bags80lb} 80lb bags or {results.bags60lb} 60lb
                        bags.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter your slab dimensions to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related Calculators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href="/calculators/construction-and-building"
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">All Construction Calculators</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comprehensive Supporting Content */}
        <div className="space-y-12">
          <Separator />

          {/* What is a Concrete Slab */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold">What is a Concrete Slab?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">
                A concrete slab is a flat, horizontal structural element made of reinforced concrete that serves as a
                foundation, floor, or surface for various construction projects. These versatile building components are
                typically poured in place and can range from simple residential applications like patios and driveways
                to complex commercial and industrial flooring systems. Concrete slabs distribute loads evenly across the
                ground and provide a durable, long-lasting surface that can withstand heavy traffic, weather conditions,
                and structural stresses. The thickness and reinforcement requirements vary depending on the intended
                use, soil conditions, and local building codes.
              </p>
            </div>
          </section>

          {/* Common Uses */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold">Common Uses for Concrete Slabs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Residential Applications</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      <strong>Patios and Outdoor Living Spaces:</strong> Create durable entertainment areas that
                      withstand weather and heavy use
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      <strong>Driveways:</strong> Provide stable, long-lasting vehicle access with minimal maintenance
                      requirements
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      <strong>Garage Floors:</strong> Offer chemical-resistant surfaces that handle automotive fluids
                      and heavy equipment
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      <strong>Basement Floors:</strong> Create moisture-resistant foundations that prevent water
                      infiltration
                    </span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Commercial & Utility Applications</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      <strong>Shed and Workshop Foundations:</strong> Provide level, stable bases for storage and work
                      buildings
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      <strong>Sidewalks and Walkways:</strong> Create safe, accessible pedestrian pathways with ADA
                      compliance
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      <strong>Pool Decks:</strong> Form slip-resistant surfaces around swimming pools and water features
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      <strong>Equipment Pads:</strong> Support HVAC units, generators, and other heavy mechanical
                      equipment
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cost Factors */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold">Key Factors Affecting Concrete Slab Cost</h2>
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Understanding the various factors that influence concrete slab costs helps you budget accurately and
                make informed decisions about your project. Material costs typically represent 40-60% of the total
                project expense, while labor, equipment, and site preparation make up the remainder. Regional variations
                in material availability, local labor rates, and seasonal demand can significantly impact pricing.
                Additionally, project complexity, accessibility, and timeline requirements all play crucial roles in
                determining final costs.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Material Factors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Concrete strength requirements (PSI)</li>
                      <li>• Reinforcement needs (rebar, mesh)</li>
                      <li>• Special additives or admixtures</li>
                      <li>• Delivery distance and accessibility</li>
                      <li>• Quantity discounts for larger orders</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Design Factors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Slab thickness and dimensions</li>
                      <li>• Shape complexity and curves</li>
                      <li>• Surface finish requirements</li>
                      <li>• Decorative elements or stamping</li>
                      <li>• Integrated utilities or drains</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Site Factors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Excavation and grading needs</li>
                      <li>• Soil conditions and preparation</li>
                      <li>• Access for concrete trucks</li>
                      <li>• Existing utilities or obstacles</li>
                      <li>• Weather and seasonal timing</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Pouring Tips */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold">Professional Tips for Pouring a Concrete Slab</h2>
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Successful concrete slab installation requires careful planning, proper preparation, and attention to
                detail throughout the entire process. From initial site evaluation to final curing, each step impacts
                the long-term performance and durability of your slab. Professional contractors emphasize that proper
                preparation prevents most common concrete problems, including cracking, settling, and surface defects.
                Following established best practices ensures your investment delivers decades of reliable service with
                minimal maintenance requirements.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Site Preparation Excellence</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Excavate to proper depth:</strong> Remove all organic material, roots, and debris to
                          create a stable base that won't settle or shift over time.
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Compact the subgrade:</strong> Use mechanical compaction to achieve 95% density,
                          preventing future settling and ensuring uniform support.
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Install proper base material:</strong> Add 4-6 inches of compacted gravel or crushed
                          stone for drainage and additional stability.
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Check for level and grade:</strong> Ensure proper slope for drainage while maintaining
                          structural requirements and aesthetic appeal.
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Mixing and Placement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Order the right mix design:</strong> Specify appropriate PSI strength, slump, and air
                          entrainment for your climate and application.
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Plan for continuous pour:</strong> Coordinate delivery timing to avoid cold joints and
                          ensure uniform strength throughout the slab.
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Use proper consolidation:</strong> Vibrate or screed thoroughly to eliminate air
                          pockets and achieve maximum density and strength.
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Time your finishing:</strong> Wait for proper bleed water evaporation before floating
                          and troweling to prevent surface defects.
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Safety Precautions */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold">Essential Safety Precautions When Working with Concrete</h2>
            <div className="space-y-6">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Important:</strong> Concrete contains caustic materials that can cause severe chemical burns.
                  Always prioritize safety and consider hiring professionals for large or complex projects.
                </AlertDescription>
              </Alert>

              <p className="text-lg text-muted-foreground leading-relaxed">
                Working with concrete involves several serious safety hazards that require proper preparation and
                protective equipment. Fresh concrete is highly alkaline with a pH of 12-13, making it extremely caustic
                to skin and eyes. The physical demands of concrete work, combined with time-sensitive curing
                requirements, create additional risks for injury. Professional safety protocols have been developed
                through decades of industry experience and should be followed rigorously by both DIY enthusiasts and
                experienced contractors to prevent accidents and long-term health issues.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-red-700">Personal Protective Equipment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Eye protection:</strong> Wear safety glasses or goggles to prevent concrete splashes
                          and dust from causing serious eye injuries or chemical burns.
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Skin protection:</strong> Use waterproof gloves, long sleeves, and pants to prevent
                          direct contact with caustic concrete materials.
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Respiratory protection:</strong> Wear dust masks when mixing dry concrete or working
                          in dusty conditions to prevent silica inhalation.
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Proper footwear:</strong> Use waterproof boots with good traction to prevent slips and
                          protect feet from concrete contact.
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-700">Work Site Safety</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start space-x-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Emergency preparedness:</strong> Keep clean water readily available for immediate
                          flushing of skin or eyes exposed to concrete.
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Tool maintenance:</strong> Clean all tools immediately after use to prevent concrete
                          buildup and maintain safe working conditions.
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Weather awareness:</strong> Avoid concrete work in extreme temperatures, high winds,
                          or precipitation that could compromise safety or quality.
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Team communication:</strong> Establish clear signals and responsibilities when working
                          with multiple people to coordinate safely.
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
