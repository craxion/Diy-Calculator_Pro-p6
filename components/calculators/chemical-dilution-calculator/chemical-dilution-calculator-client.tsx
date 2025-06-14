"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RefreshCw, Info, Beaker, AlertCircle } from "lucide-react"
import { DilutionSVG } from "./dilution-svg"
import type { ConcentrationUnit, VolumeUnit, KnownVolumeType, DilutionResult } from "./types"
import {
  parseConcentration,
  formatConcentration,
  convertToMl,
  convertFromMl,
  calculateDilution,
  getAlternativeVolumeUnit,
} from "./utils"

const initialConcentrationUnit: ConcentrationUnit = "%"
const initialVolumeUnit: VolumeUnit = "ml"
const initialKnownVolumeType: KnownVolumeType = "finalSolution"

export default function ChemicalDilutionCalculatorClient() {
  const [stockConcentrationStr, setStockConcentrationStr] = useState<string>("")
  const [stockConcentrationUnit, setStockConcentrationUnit] = useState<ConcentrationUnit>(initialConcentrationUnit)
  const [targetConcentrationStr, setTargetConcentrationStr] = useState<string>("")
  const [targetConcentrationUnit, setTargetConcentrationUnit] = useState<ConcentrationUnit>(initialConcentrationUnit)

  const [knownVolumeType, setKnownVolumeType] = useState<KnownVolumeType>(initialKnownVolumeType)
  const [knownVolumeStr, setKnownVolumeStr] = useState<string>("")
  const [knownVolumeUnit, setKnownVolumeUnit] = useState<VolumeUnit>(initialVolumeUnit)

  const [results, setResults] = useState<DilutionResult | null>(null)
  const [error, setError] = useState<string>("")

  const handleCalculation = useCallback(() => {
    setError("")
    setResults(null)

    const stockConc = parseConcentration(stockConcentrationStr, stockConcentrationUnit)
    const targetConc = parseConcentration(targetConcentrationStr, targetConcentrationUnit)
    const knownVol = Number.parseFloat(knownVolumeStr)

    if (isNaN(stockConc) || stockConc < 0) {
      setError("Invalid stock concentration. Please enter a valid number or ratio (e.g., '1:10').")
      return
    }
    if (stockConcentrationUnit === "ppm" && stockConc > 1000000) {
      setError("Stock PPM value is too high (max 1,000,000 for 100%).")
      return
    }
    if (stockConcentrationUnit === "%" && stockConc > 100) {
      setError("Stock percentage cannot exceed 100%.")
      return
    }

    if (isNaN(targetConc) || targetConc < 0) {
      setError("Invalid target concentration. Please enter a valid number or ratio (e.g., '1:10').")
      return
    }
    if (targetConcentrationUnit === "ppm" && targetConc > 1000000) {
      setError("Target PPM value is too high (max 1,000,000 for 100%).")
      return
    }
    if (targetConcentrationUnit === "%" && targetConc > 100) {
      setError("Target percentage cannot exceed 100%.")
      return
    }

    if (isNaN(knownVol) || knownVol <= 0) {
      setError("Invalid volume. Please enter a positive number.")
      return
    }

    if (stockConc === 0 && targetConc > 0) {
      setError("Cannot create a concentration from a 0% stock solution.")
      return
    }
    if (stockConc < targetConc && stockConc !== 0) {
      setError("Target concentration cannot be higher than stock concentration.")
      return
    }
    if (targetConc > stockConc) {
      setError("Target concentration cannot be greater than stock concentration.")
      return
    }
    if (stockConc === targetConc && stockConc !== 0) {
      setError(
        "Stock and target concentrations are the same. No dilution needed, or use 100% concentrate if making a final solution of it.",
      )
      // Provide a specific result for this edge case if desired
      const knownVolumeInMl = convertToMl(knownVol, knownVolumeUnit)
      if (knownVolumeType === "finalSolution") {
        setResults({
          concentrateVolumeMl: knownVolumeInMl,
          diluentVolumeMl: 0,
          totalVolumeMl: knownVolumeInMl,
          finalConcentrationDecimal: stockConc,
        })
      } else {
        // knownVolumeType === 'concentrate'
        setResults({
          concentrateVolumeMl: knownVolumeInMl,
          diluentVolumeMl: 0,
          totalVolumeMl: knownVolumeInMl,
          finalConcentrationDecimal: stockConc,
        })
      }
      return
    }

    const knownVolumeInMl = convertToMl(knownVol, knownVolumeUnit)

    const calculated = calculateDilution(stockConc, targetConc, knownVolumeInMl, knownVolumeType)

    if (typeof calculated === "string") {
      setError(calculated)
    } else {
      setResults(calculated)
    }
  }, [
    stockConcentrationStr,
    stockConcentrationUnit,
    targetConcentrationStr,
    targetConcentrationUnit,
    knownVolumeStr,
    knownVolumeUnit,
    knownVolumeType,
  ])

  useEffect(() => {
    // Auto-calculate if all inputs seem valid enough for a preliminary check
    // This provides dynamic updates but the button is still there for explicit calculation
    if (stockConcentrationStr && targetConcentrationStr && knownVolumeStr) {
      const stockConc = parseConcentration(stockConcentrationStr, stockConcentrationUnit)
      const targetConc = parseConcentration(targetConcentrationStr, targetConcentrationUnit)
      const knownVol = Number.parseFloat(knownVolumeStr)
      if (!isNaN(stockConc) && !isNaN(targetConc) && !isNaN(knownVol) && knownVol > 0) {
        handleCalculation()
      }
    }
  }, [
    stockConcentrationStr,
    stockConcentrationUnit,
    targetConcentrationStr,
    targetConcentrationUnit,
    knownVolumeStr,
    knownVolumeUnit,
    knownVolumeType,
    handleCalculation,
  ])

  const resetForm = () => {
    setStockConcentrationStr("")
    setStockConcentrationUnit(initialConcentrationUnit)
    setTargetConcentrationStr("")
    setTargetConcentrationUnit(initialConcentrationUnit)
    setKnownVolumeType(initialKnownVolumeType)
    setKnownVolumeStr("")
    setKnownVolumeUnit(initialVolumeUnit)
    setResults(null)
    setError("")
  }

  const renderVolume = (volumeMl: number, preferredUnit: VolumeUnit) => {
    const primaryVal = convertFromMl(volumeMl, preferredUnit)
    const altUnit = getAlternativeVolumeUnit(preferredUnit)
    const altVal = convertFromMl(volumeMl, altUnit)
    if (Math.abs(primaryVal) < 0.001 && primaryVal !== 0) {
      // very small number, show more precision or scientific
      return `${volumeMl.toExponential(2)} ml`
    }
    if (
      preferredUnit === altUnit ||
      (Math.abs(primaryVal - altVal) < 0.01 && preferredUnit !== altUnit && volumeMl !== 0)
    ) {
      // if conversion is too close, just show primary
      return `${primaryVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${preferredUnit}`
    }
    return `${primaryVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${preferredUnit} / ${altVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${altUnit}`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <Card className="lg:col-span-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Dilution Parameters</CardTitle>
          <CardDescription>
            Enter the details of your stock solution, desired target solution, and known volumes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stock Concentration */}
          <div className="p-4 border rounded-md bg-slate-50/50">
            <Label htmlFor="stockConcentration" className="text-lg font-semibold text-gray-700">
              1. Original (Stock) Concentration
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-1 h-5 w-5">
                      <Info className="h-4 w-4 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Concentration of your starting liquid (e.g., 10%, 1:5, 500ppm).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <Input
                id="stockConcentration"
                type="text"
                value={stockConcentrationStr}
                onChange={(e) => setStockConcentrationStr(e.target.value)}
                placeholder="e.g., 10 or 1:5 or 500"
              />
              <Select
                value={stockConcentrationUnit}
                onValueChange={(v) => setStockConcentrationUnit(v as ConcentrationUnit)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="%">Percentage (%)</SelectItem>
                  <SelectItem value="ratio">Ratio (e.g., 1:X)</SelectItem>
                  <SelectItem value="ppm">Parts Per Million (ppm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target Concentration */}
          <div className="p-4 border rounded-md bg-slate-50/50">
            <Label htmlFor="targetConcentration" className="text-lg font-semibold text-gray-700">
              2. Desired (Target) Concentration
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-1 h-5 w-5">
                      <Info className="h-4 w-4 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Final concentration you want to achieve.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <Input
                id="targetConcentration"
                type="text"
                value={targetConcentrationStr}
                onChange={(e) => setTargetConcentrationStr(e.target.value)}
                placeholder="e.g., 1 or 1:20 or 50"
              />
              <Select
                value={targetConcentrationUnit}
                onValueChange={(v) => setTargetConcentrationUnit(v as ConcentrationUnit)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="%">Percentage (%)</SelectItem>
                  <SelectItem value="ratio">Ratio (e.g., 1:X)</SelectItem>
                  <SelectItem value="ppm">Parts Per Million (ppm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Known Volume */}
          <div className="p-4 border rounded-md bg-slate-50/50">
            <Label className="text-lg font-semibold text-gray-700 block mb-2">
              3. Known Volume Input
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-1 h-5 w-5">
                      <Info className="h-4 w-4 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Specify what volume you know: the amount of concentrate you have, or the total final solution you
                      want.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select
              value={knownVolumeType}
              onValueChange={(v) => {
                setKnownVolumeType(v as KnownVolumeType)
                setResults(null)
                setError("")
              }}
            >
              <SelectTrigger className="mb-3">
                <SelectValue placeholder="Select known volume type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="finalSolution">I want this much FINAL SOLUTION</SelectItem>
                <SelectItem value="concentrate">I have this much CONCENTRATE</SelectItem>
              </SelectContent>
            </Select>

            <Label htmlFor="knownVolume" className="text-sm font-medium text-gray-600">
              {knownVolumeType === "finalSolution" ? "Desired Final Solution Volume:" : "Available Concentrate Volume:"}
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
              <Input
                id="knownVolume"
                type="number"
                value={knownVolumeStr}
                onChange={(e) => setKnownVolumeStr(e.target.value)}
                placeholder="e.g., 1000 or 1"
                min="0"
              />
              <Select value={knownVolumeUnit} onValueChange={(v) => setKnownVolumeUnit(v as VolumeUnit)}>
                <SelectTrigger>
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ml">Milliliters (ml)</SelectItem>
                  <SelectItem value="l">Liters (l)</SelectItem>
                  <SelectItem value="us_oz">US Fluid Ounces (oz)</SelectItem>
                  <SelectItem value="us_cup">US Cups</SelectItem>
                  <SelectItem value="us_pint">US Pints (pt)</SelectItem>
                  <SelectItem value="us_quart">US Quarts (qt)</SelectItem>
                  <SelectItem value="us_gallon">US Gallons (gal)</SelectItem>
                  <SelectItem value="imp_oz">Imperial Fluid Ounces (oz)</SelectItem>
                  <SelectItem value="imp_pint">Imperial Pints (pt)</SelectItem>
                  <SelectItem value="imp_quart">Imperial Quarts (qt)</SelectItem>
                  <SelectItem value="imp_gallon">Imperial Gallons (gal)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t">
          <Button onClick={handleCalculation} className="w-full sm:w-auto mb-2 sm:mb-0">
            <Beaker className="mr-2 h-4 w-4" /> Calculate Mixture
          </Button>
          <Button onClick={resetForm} variant="outline" className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" /> Reset Inputs
          </Button>
        </CardFooter>
      </Card>

      <div className="lg:col-span-1 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && !error && (
          <Card className="shadow-lg bg-primary-orange/5">
            <CardHeader>
              <CardTitle className="text-xl text-primary-orange flex items-center">
                <Beaker className="mr-2 h-5 w-5" /> Mixture Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Label className="font-semibold text-gray-700">Concentrate to Use:</Label>
                <p className="text-gray-900 text-base">{renderVolume(results.concentrateVolumeMl, knownVolumeUnit)}</p>
              </div>
              <div>
                <Label className="font-semibold text-gray-700">Diluent to Add (e.g., Water):</Label>
                <p className="text-gray-900 text-base">{renderVolume(results.diluentVolumeMl, knownVolumeUnit)}</p>
              </div>
              <div>
                <Label className="font-semibold text-gray-700">Total Final Solution Volume:</Label>
                <p className="text-gray-900 text-base">{renderVolume(results.totalVolumeMl, knownVolumeUnit)}</p>
              </div>
              <div>
                <Label className="font-semibold text-gray-700">Achieved Concentration:</Label>
                <p className="text-gray-900 text-base">
                  {formatConcentration(results.finalConcentrationDecimal, targetConcentrationUnit)}
                  {targetConcentrationUnit !== "%" &&
                    ` (approx. ${(results.finalConcentrationDecimal * 100).toFixed(2)}%)`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Visual Aid</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-2">
            <DilutionSVG
              concentrateProportion={
                results && results.totalVolumeMl > 0 ? results.concentrateVolumeMl / results.totalVolumeMl : 0
              }
              diluentProportion={
                results && results.totalVolumeMl > 0 ? results.diluentVolumeMl / results.totalVolumeMl : 0
              }
            />
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Info className="mr-2 h-4 w-4 text-primary-orange" />
              Mixing Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              For safety and best results, slowly add the <strong>concentrate</strong> to the <strong>diluent</strong>{" "}
              (e.g., chemical to water) while gently stirring, unless product instructions specify otherwise.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
