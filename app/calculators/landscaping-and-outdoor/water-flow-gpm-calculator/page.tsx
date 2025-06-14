"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Droplet, Timer, Container, HelpCircle, RefreshCw, Lightbulb } from "lucide-react"
import Link from "next/link"
import { createUrlSlug } from "@/lib/utils/url-slug"

type VolumeUnit = "gallons" | "liters"
type TimeUnit = "seconds" | "minutes"

const GALLONS_TO_LITERS = 3.78541
const LITERS_TO_GALLONS = 1 / GALLONS_TO_LITERS

export default function WaterFlowGpmCalculatorPage() {
  const [bucketSize, setBucketSize] = useState<string>("5")
  const [bucketSizeUnit, setBucketSizeUnit] = useState<VolumeUnit>("gallons")
  const [fillTime, setFillTime] = useState<string>("30")
  const [fillTimeUnit, setFillTimeUnit] = useState<TimeUnit>("seconds")
  const [error, setError] = useState<string | null>(null)

  const { gpm, lpm } = useMemo(() => {
    const numBucketSize = Number.parseFloat(bucketSize)
    const numFillTime = Number.parseFloat(fillTime)

    if (isNaN(numBucketSize) || numBucketSize <= 0 || isNaN(numFillTime) || numFillTime <= 0) {
      setError("Please enter valid positive numbers for bucket size and fill time.")
      return { gpm: null, lpm: null }
    }
    setError(null)

    let volumeInGallons: number
    if (bucketSizeUnit === "liters") {
      volumeInGallons = numBucketSize * LITERS_TO_GALLONS
    } else {
      volumeInGallons = numBucketSize
    }

    let timeInSeconds: number
    if (fillTimeUnit === "minutes") {
      timeInSeconds = numFillTime * 60
    } else {
      timeInSeconds = numFillTime
    }

    if (timeInSeconds === 0) {
      setError("Fill time cannot be zero.")
      return { gpm: null, lpm: null }
    }

    const calculatedGpm = (volumeInGallons * 60) / timeInSeconds
    const calculatedLpm = calculatedGpm * GALLONS_TO_LITERS

    return { gpm: calculatedGpm, lpm: calculatedLpm }
  }, [bucketSize, bucketSizeUnit, fillTime, fillTimeUnit])

  const handleReset = () => {
    setBucketSize("5")
    setBucketSizeUnit("gallons")
    setFillTime("30")
    setFillTimeUnit("seconds")
    setError(null)
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-lg mb-4">
          <Droplet className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Water Flow Rate Calculator (GPM/LPM)</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Easily determine your available water flow rate from a spigot or hose – a crucial first step for any
          irrigation planning.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Container className="mr-2 h-6 w-6 text-primary" />
                Calculator Inputs
              </CardTitle>
              <CardDescription>Enter the details from your bucket test to calculate flow rate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <Label htmlFor="bucket-size" className="font-semibold">
                    Bucket/Container Volume
                  </Label>
                  <Input
                    id="bucket-size"
                    type="number"
                    value={bucketSize}
                    onChange={(e) => setBucketSize(e.target.value)}
                    placeholder="e.g., 5"
                    min="0.1"
                    step="0.1"
                  />
                </div>
                <Select value={bucketSizeUnit} onValueChange={(value) => setBucketSizeUnit(value as VolumeUnit)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select volume unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gallons">US Gallons (gal)</SelectItem>
                    <SelectItem value="liters">Liters (L)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <Label htmlFor="fill-time" className="font-semibold">
                    Time to Fill Bucket
                  </Label>
                  <Input
                    id="fill-time"
                    type="number"
                    value={fillTime}
                    onChange={(e) => setFillTime(e.target.value)}
                    placeholder="e.g., 30"
                    min="0.1"
                    step="0.1"
                  />
                </div>
                <Select value={fillTimeUnit} onValueChange={(value) => setFillTimeUnit(value as TimeUnit)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">Seconds (s)</SelectItem>
                    <SelectItem value="minutes">Minutes (min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && (
                <Alert variant="destructive">
                  <HelpCircle className="h-4 w-4" />
                  <AlertTitle>Input Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto">
                <RefreshCw className="mr-2 h-4 w-4" /> Reset Inputs
              </Button>
              {/* Calculation is dynamic, so no explicit calculate button needed unless preferred */}
            </CardFooter>
          </Card>

          {gpm !== null && lpm !== null && !error && (
            <Card className="mt-6 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Droplet className="mr-2 h-6 w-6" />
                  Calculated Flow Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <p className="text-4xl font-bold text-primary">{gpm.toFixed(2)} GPM</p>
                <p className="text-2xl text-muted-foreground">({lpm.toFixed(2)} LPM)</p>
                <p className="text-sm text-muted-foreground pt-2">
                  This is your available water flow rate from the tested source.
                </p>
              </CardContent>
            </Card>
          )}

          <Alert className="mt-8">
            <Lightbulb className="h-4 w-4" />
            <AlertTitle className="font-semibold">Why Your Flow Rate Matters</AlertTitle>
            <AlertDescription>
              Knowing your Gallons Per Minute (GPM) or Liters Per Minute (LPM) is crucial for designing an efficient
              irrigation system. It directly determines:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>How many sprinkler heads or emitters you can run on a single zone without losing performance.</li>
                <li>The maximum size of an irrigation zone you can effectively water.</li>
                <li>The appropriate pipe sizes needed for your system.</li>
              </ul>
              An accurate flow rate measurement helps prevent issues like poor sprinkler coverage, overworked pumps, or
              inefficient watering.
            </AlertDescription>
          </Alert>
        </div>

        <aside className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Timer className="mr-2 h-5 w-5 text-primary" />
                How to Test Your Flow Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <strong>Materials Needed:</strong>
              </p>
              <ul className="list-disc pl-5">
                <li>A bucket or container with a known volume (e.g., 5-gallon bucket).</li>
                <li>A stopwatch or timer (your phone works great).</li>
              </ul>
              <p>
                <strong>Steps:</strong>
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Place your bucket under the spigot or hose you want to test.</li>
                <li>Turn the water on completely.</li>
                <li>Simultaneously start your timer as the water begins to fill the bucket.</li>
                <li>Stop the timer the instant the bucket is full.</li>
                <li>Enter the bucket's volume and the fill time into the calculator above.</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="mr-2 h-5 w-5 text-primary" />
                Tips for Accurate Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Use the spigot closest to your water meter for the most representative reading of your main supply.
                </li>
                <li>
                  Ensure no other water is being used in or outside the house during the test (e.g., dishwasher,
                  showers, other sprinklers).
                </li>
                <li>If testing a hose, ensure it's fully unwound and has no kinks.</li>
                <li>Repeat the test 2-3 times and average the results for better accuracy.</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>

      <section className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-semibold mb-6 text-center">Further Insights & Planning</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Why Knowing GPM is Critical for Irrigation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your GPM dictates the number of sprinkler heads a zone can support. Exceeding this can lead to poor
                coverage and dry spots. Understanding this helps in designing efficient watering zones that match your
                water supply's capacity, ensuring all plants get adequate water without overtaxing your system.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>How Flow Rate Affects Sprinkler Head Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Different sprinkler heads (rotors, sprays, drips) have varying GPM requirements. Matching head types to
                your available flow rate ensures optimal performance and water distribution. For example, high-flow
                rotors might not be suitable for a low GPM system.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>What to Do if Your Flow Rate is Too Low</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If your GPM is lower than desired, you might need to design smaller irrigation zones, use low-flow
                sprinkler heads or drip irrigation, or investigate potential issues like leaks, partially closed valves,
                or undersized supply lines. Sometimes, a booster pump can be considered for specific situations.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Understanding Water Pressure vs. Water Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Pressure (PSI) is the force of water, while flow (GPM) is the volume of water delivered over time. Both
                are vital. High pressure doesn't guarantee high flow. You need adequate pressure to operate sprinklers
                correctly, but enough flow to supply all heads in a zone.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-semibold mb-6 text-center">Related Calculators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Example: Dynamically list some or link statically */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Soil and Mulch Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Estimate materials for your garden beds.</p>
              <Button asChild variant="outline">
                <Link href={`/calculators/landscaping-and-outdoor/${createUrlSlug("Soil and Mulch Calculator")}`}>
                  Use Calculator
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Excavation Volume & Cost Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Calculate excavation needs for projects.</p>
              <Button asChild variant="outline">
                <Link
                  href={`/calculators/construction-and-building/${createUrlSlug("Excavation Volume and Cost Calculator")}`}
                >
                  Use Calculator
                </Link>
              </Button>
            </CardContent>
          </Card>
          {/* Add more relevant links as other calculators are built */}
        </div>
      </section>
    </div>
  )
}
