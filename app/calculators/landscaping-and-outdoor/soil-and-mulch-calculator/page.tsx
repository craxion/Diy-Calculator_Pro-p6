"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calculator, Info, RotateCcw } from "lucide-react"

export default function SoilMulchCalculatorPage() {
  const [length, setLength] = useState("")
  const [width, setWidth] = useState("")
  const [depth, setDepth] = useState("")
  const [unit, setUnit] = useState("feet")
  const [materialType, setMaterialType] = useState("topsoil")
  const [pricePerYard, setPricePerYard] = useState("")

  const [results, setResults] = useState<{
    volume: number
    bags: number
    totalCost: number
  } | null>(null)

  const materialInfo = {
    topsoil: { name: "Topsoil", bagsPerYard: 13.5 },
    mulch: { name: "Mulch", bagsPerYard: 13.5 },
    compost: { name: "Compost", bagsPerYard: 13.5 },
    sand: { name: "Sand", bagsPerYard: 15 },
    gravel: { name: "Gravel", bagsPerYard: 15 },
  }

  const calculate = () => {
    const l = Number.parseFloat(length)
    const w = Number.parseFloat(width)
    const d = Number.parseFloat(depth)
    const price = Number.parseFloat(pricePerYard) || 0

    if (!l || !w || !d) return

    // Convert to feet if needed
    let lengthFt = l
    let widthFt = w
    let depthFt = d

    if (unit === "inches") {
      lengthFt = l / 12
      widthFt = w / 12
      depthFt = d / 12
    }

    // Calculate volume in cubic feet
    const volumeCubicFeet = lengthFt * widthFt * depthFt

    // Convert to cubic yards
    const volumeCubicYards = volumeCubicFeet / 27

    // Calculate bags needed
    const material = materialInfo[materialType as keyof typeof materialInfo]
    const bags = Math.ceil(volumeCubicYards * material.bagsPerYard)

    // Calculate total cost
    const totalCost = volumeCubicYards * price

    setResults({
      volume: volumeCubicYards,
      bags,
      totalCost,
    })
  }

  const reset = () => {
    setLength("")
    setWidth("")
    setDepth("")
    setPricePerYard("")
    setResults(null)
  }

  return (
    <div className="container py-12 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Soil & Mulch Calculator</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Calculate the amount of soil, mulch, or other landscaping materials needed for your project. Get accurate
            volume and bag count estimates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Project Details</span>
              </CardTitle>
              <CardDescription>Enter your area dimensions and material type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="material">Material Type</Label>
                <Select value={materialType} onValueChange={setMaterialType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="topsoil">Topsoil</SelectItem>
                    <SelectItem value="mulch">Mulch</SelectItem>
                    <SelectItem value="compost">Compost</SelectItem>
                    <SelectItem value="sand">Sand</SelectItem>
                    <SelectItem value="gravel">Gravel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Measurement Unit</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feet">Feet</SelectItem>
                    <SelectItem value="inches">Inches</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Length ({unit})</Label>
                  <Input
                    id="length"
                    type="number"
                    placeholder="0"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width ({unit})</Label>
                  <Input
                    id="width"
                    type="number"
                    placeholder="0"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depth">Depth ({unit})</Label>
                <Input
                  id="depth"
                  type="number"
                  placeholder="3"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price per Cubic Yard (Optional)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="35"
                  value={pricePerYard}
                  onChange={(e) => setPricePerYard(e.target.value)}
                />
              </div>

              <div className="flex space-x-4">
                <Button onClick={calculate} className="flex-1">
                  Calculate
                </Button>
                <Button onClick={reset} variant="outline">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Calculation Results</CardTitle>
              <CardDescription>Material requirements and cost estimates</CardDescription>
            </CardHeader>
            <CardContent>
              {results ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Volume Needed:</span>
                      <Badge>{results.volume.toFixed(2)} cubic yards</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Bags Required:</span>
                      <Badge variant="secondary">{results.bags} bags</Badge>
                    </div>
                  </div>

                  {results.totalCost > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Estimated Cost:</span>
                        <Badge className="text-lg">${results.totalCost.toFixed(2)}</Badge>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter your dimensions and click Calculate to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card>
          <CardHeader>
            <CardTitle>Application Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Recommended Depths:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Topsoil: 2-4 inches</li>
                  <li>• Mulch: 2-3 inches</li>
                  <li>• Compost: 1-2 inches</li>
                  <li>• Sand: 1-2 inches</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Coverage Tips:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Order 10% extra for waste</li>
                  <li>• Consider seasonal settling</li>
                  <li>• Check local delivery minimums</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
