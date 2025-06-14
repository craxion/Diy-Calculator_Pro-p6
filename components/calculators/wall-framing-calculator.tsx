"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X, Plus } from "lucide-react"

interface Opening {
  id: string
  type: "door" | "window"
  width: string
  height: string
  headerSize: string
}

interface WallFramingResults {
  bottomPlate: number
  topPlate: number
  commonStuds: number
  additionalStuds: number
  studLength: number
  headerMaterial: { feet: number; size: string }
  crippleStuds: number
  totalLumber: number
  estimatedCost: number | null
}

export default function WallFramingCalculator() {
  // Input states
  const [wallLengthFt, setWallLengthFt] = useState("")
  const [wallLengthIn, setWallLengthIn] = useState("")
  const [wallHeightFt, setWallHeightFt] = useState("")
  const [wallHeightIn, setWallHeightIn] = useState("")
  const [lumberSize, setLumberSize] = useState("2x4")
  const [studSpacing, setStudSpacing] = useState("16")
  const [wallConfig, setWallConfig] = useState("straight")
  const [topPlates, setTopPlates] = useState("double")
  const [pricePerBoard, setPricePerBoard] = useState("")

  const [openings, setOpenings] = useState<Opening[]>([])
  const [results, setResults] = useState<WallFramingResults | null>(null)

  const addOpening = (type: "door" | "window") => {
    const newOpening: Opening = {
      id: Date.now().toString(),
      type,
      width: "",
      height: "",
      headerSize: "2x8",
    }
    setOpenings([...openings, newOpening])
  }

  const removeOpening = (id: string) => {
    setOpenings(openings.filter((opening) => opening.id !== id))
  }

  const updateOpening = (id: string, field: keyof Opening, value: string) => {
    setOpenings(openings.map((opening) => (opening.id === id ? { ...opening, [field]: value } : opening)))
  }

  const calculateMaterials = () => {
    // Convert wall dimensions to inches
    const wallLengthTotal = (Number.parseInt(wallLengthFt) || 0) * 12 + (Number.parseInt(wallLengthIn) || 0)
    const wallHeightTotal = (Number.parseInt(wallHeightFt) || 0) * 12 + (Number.parseInt(wallHeightIn) || 0)

    if (wallLengthTotal <= 0 || wallHeightTotal <= 0) return

    // Calculate number of studs needed
    const studSpacingNum = Number.parseInt(studSpacing)
    const numberOfStuds = Math.floor(wallLengthTotal / studSpacingNum) + 1

    // Add corner/end studs based on configuration
    let additionalStuds = 0
    switch (wallConfig) {
      case "straight":
        additionalStuds = 2 // End studs
        break
      case "corner":
        additionalStuds = 3 // One corner connection
        break
      case "intersection":
        additionalStuds = 4 // T-intersection
        break
    }

    // Calculate opening requirements
    let headerFeet = 0
    let crippleStuds = 0

    openings.forEach((opening) => {
      const width = Number.parseInt(opening.width) || 0
      const height = Number.parseInt(opening.height) || 0

      if (width > 0) {
        headerFeet += Math.ceil(width / 12)
        // Add king studs and jack studs for each opening
        additionalStuds += 4

        // Estimate cripple studs (rough calculation)
        if (height < wallHeightTotal - 12) {
          crippleStuds += Math.ceil(width / studSpacingNum)
        }
      }
    })

    // Calculate plates
    const plateLengthFt = Math.ceil(wallLengthTotal / 12)
    const bottomPlate = plateLengthFt
    const topPlate = topPlates === "double" ? plateLengthFt * 2 : plateLengthFt

    // Calculate stud length (wall height minus plates)
    const studLength = wallHeightTotal - (topPlates === "double" ? 4.5 : 3)

    // Total lumber calculation
    const totalLumber = bottomPlate + topPlate + numberOfStuds + additionalStuds + crippleStuds

    // Cost calculation
    const price = Number.parseFloat(pricePerBoard)
    const estimatedCost = price > 0 ? totalLumber * price : null

    const calculatedResults: WallFramingResults = {
      bottomPlate,
      topPlate,
      commonStuds: numberOfStuds,
      additionalStuds: additionalStuds + crippleStuds,
      studLength,
      headerMaterial: { feet: headerFeet, size: openings[0]?.headerSize || "2x8" },
      crippleStuds,
      totalLumber,
      estimatedCost,
    }

    setResults(calculatedResults)
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Wall Framing Calculator</h1>
            <p className="text-gray-600">Calculate materials needed for wall framing projects</p>
          </div>

          {/* Card 1: Wall Dimensions & Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Wall Dimensions & Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium">Wall Length</Label>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="0"
                      value={wallLengthFt}
                      onChange={(e) => setWallLengthFt(e.target.value)}
                    />
                    <Label className="text-sm text-gray-500 mt-1">feet</Label>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="0"
                      value={wallLengthIn}
                      onChange={(e) => setWallLengthIn(e.target.value)}
                    />
                    <Label className="text-sm text-gray-500 mt-1">inches</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Wall Height</Label>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="0"
                      value={wallHeightFt}
                      onChange={(e) => setWallHeightFt(e.target.value)}
                    />
                    <Label className="text-sm text-gray-500 mt-1">feet</Label>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="0"
                      value={wallHeightIn}
                      onChange={(e) => setWallHeightIn(e.target.value)}
                    />
                    <Label className="text-sm text-gray-500 mt-1">inches</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Lumber Size</Label>
                <Select value={lumberSize} onValueChange={setLumberSize}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2x4">2x4</SelectItem>
                    <SelectItem value="2x6">2x6</SelectItem>
                    <SelectItem value="2x8">2x8</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">Stud Spacing</Label>
                <RadioGroup value={studSpacing} onValueChange={setStudSpacing} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="16" id="16" />
                    <Label htmlFor="16">16 inches</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="24" id="24" />
                    <Label htmlFor="24">24 inches</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Openings */}
          <Card>
            <CardHeader>
              <CardTitle>Add Openings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => addOpening("door")} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Door
                </Button>
                <Button variant="outline" onClick={() => addOpening("window")} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Window
                </Button>
              </div>

              {openings.map((opening, index) => (
                <Card key={opening.id} className="border-2 border-dashed">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <Label className="font-medium capitalize">
                        {opening.type} {index + 1}
                      </Label>
                      <Button variant="ghost" size="sm" onClick={() => removeOpening(opening.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm">Width (in)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={opening.width}
                          onChange={(e) => updateOpening(opening.id, "width", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Height (in)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={opening.height}
                          onChange={(e) => updateOpening(opening.id, "height", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <Label className="text-sm">Header Size</Label>
                      <Select
                        value={opening.headerSize}
                        onValueChange={(value) => updateOpening(opening.id, "headerSize", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2x6">2x6</SelectItem>
                          <SelectItem value="2x8">2x8</SelectItem>
                          <SelectItem value="2x10">2x10</SelectItem>
                          <SelectItem value="2x12">2x12</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Card 3: Advanced Options */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium">Wall Configuration</Label>
                <Select value={wallConfig} onValueChange={setWallConfig}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="straight">Straight Wall (Ends Only)</SelectItem>
                    <SelectItem value="corner">Connects to One Corner</SelectItem>
                    <SelectItem value="intersection">Has a T-Intersection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">Top Plates</Label>
                <RadioGroup value={topPlates} onValueChange={setTopPlates} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">Single Top Plate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="double" id="double" />
                    <Label htmlFor="double">Double Top Plate</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Cost Estimation */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Estimation (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-base font-medium">Price Per Board</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={pricePerBoard}
                    onChange={(e) => setPricePerBoard(e.target.value)}
                    className="pl-8"
                    step="0.01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculate Button */}
          <Button
            onClick={calculateMaterials}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
          >
            Calculate Materials
          </Button>
        </div>

        {/* Results Section */}
        <div className="lg:sticky lg:top-4 lg:h-fit">
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle>Materials Shopping List</CardTitle>
            </CardHeader>
            <CardContent>
              {!results ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <p className="text-lg mb-2">Your detailed materials list will appear here after you calculate.</p>
                    <p className="text-sm">
                      Enter your wall dimensions and click "Calculate Materials" to get started.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Framing Lumber */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Framing Lumber</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Bottom Plate:</span>
                        <span className="font-medium">{results.bottomPlate} boards</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Top Plate(s):</span>
                        <span className="font-medium">{results.topPlate} boards</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Common Studs:</span>
                        <span className="font-medium">{results.commonStuds} studs</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Additional Studs:</span>
                        <span className="font-medium">{results.additionalStuds} studs</span>
                      </div>
                    </div>
                  </div>

                  {/* Cut List & Special Materials */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Cut List & Special Materials</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Stud Length:</strong> Cut main studs to {results.studLength.toFixed(1)} inches.
                      </p>
                      {results.headerMaterial.feet > 0 && (
                        <p>
                          <strong>Header Material:</strong> Total of {results.headerMaterial.feet} ft of{" "}
                          {results.headerMaterial.size} lumber needed.
                        </p>
                      )}
                      {results.crippleStuds > 0 && (
                        <p>
                          <strong>Cripple Studs:</strong> You will need approx. {results.crippleStuds} cripple studs.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-lg mb-3">Summary</h3>
                    <div className="space-y-2">
                      <p className="font-medium text-lg">
                        <strong>Total Lumber:</strong> Purchase a minimum of {results.totalLumber} {lumberSize} boards.
                      </p>
                      {results.estimatedCost && (
                        <p className="font-medium text-lg text-green-600">
                          <strong>Estimated Total:</strong> ${results.estimatedCost.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Disclaimers */}
                  <div className="border-t pt-4 text-xs text-gray-600 space-y-1">
                    <p>
                      • This estimate does not include a waste factor. We recommend adding 10-15% to your final
                      purchase.
                    </p>
                    <p>• Always consult local building codes for specific framing requirements.</p>
                    <p>• Nails/fasteners are not included in this list.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
