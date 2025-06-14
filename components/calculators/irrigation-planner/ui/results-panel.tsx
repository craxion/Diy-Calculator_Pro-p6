import type { IrrigationResults, CycleSoakRecommendation } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, CheckCircle2, Droplet, DollarSign, ListChecks, Clock } from "lucide-react"

interface ResultsPanelProps {
  results: IrrigationResults | null
  isLoading: boolean
}

const formatNumber = (num: number | undefined, digits = 1) => num?.toFixed(digits) || "N/A"

const renderCycleSoak = (cs: CycleSoakRecommendation | undefined) => {
  if (!cs) return null
  return (
    <div className="text-xs mt-1 p-2 bg-sky-50 border border-sky-200 rounded">
      <p className="font-semibold text-sky-700">Cycle & Soak Suggested:</p>
      <p>{cs.reason}</p>
      <p>
        Run: {cs.runMinutesPerCycle} min, Soak: {cs.soakMinutesBetweenCycles} min, Cycles: {cs.numberOfCycles}.
      </p>
      <p>Total Water Time: {cs.totalRunTimeMinutes.toFixed(0)} min.</p>
    </div>
  )
}

export default function ResultsPanel({ results, isLoading }: ResultsPanelProps) {
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg text-medium-grey animate-pulse">Calculating optimal plan...</p>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg text-medium-grey">Design your irrigation plan to see results here.</p>
        <Droplet className="w-16 h-16 mx-auto text-primary-orange/30 mt-4" />
      </div>
    )
  }

  return (
    <ScrollArea className="h-full p-1 md:p-3 border-l border-medium-grey/50">
      <div className="space-y-6">
        {results.warnings && results.warnings.length > 0 && (
          <Card className="border-destructive-red/50 bg-destructive-red/5">
            <CardHeader className="p-3">
              <CardTitle className="text-lg text-destructive-red flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" /> Design Warnings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 text-sm">
              <ul className="list-disc list-inside space-y-1 text-destructive-red/90">
                {results.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {results.warnings.length === 0 && (
          <Alert className="border-green-500/50 bg-green-500/5">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-700">Design Looks Good!</AlertTitle>
            <AlertDescription className="text-green-600/90">
              No immediate issues found with your current zone configurations based on flow and pressure. Review details
              below.
            </AlertDescription>
          </Alert>
        )}

        {/* Zones Summary */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-xl flex items-center">
              <ListChecks className="w-6 h-6 mr-2 text-primary-orange" /> Zones Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs px-2 py-1">Zone</TableHead>
                  <TableHead className="text-xs px-2 py-1">GPM</TableHead>
                  <TableHead className="text-xs px-2 py-1">Pressure (Req/Avail)</TableHead>
                  <TableHead className="text-xs px-2 py-1">Items</TableHead>
                  <TableHead className="text-xs px-2 py-1">Run Time (min)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.zones.map((zone) => (
                  <TableRow key={zone.id}>
                    <TableCell
                      className="text-xs px-2 py-1 font-medium"
                      style={{ color: zone.color?.replace("0.5", "1.0") || "inherit" }}
                    >
                      {zone.name}
                    </TableCell>
                    <TableCell className="text-xs px-2 py-1">{formatNumber(zone.totalGPM)}</TableCell>
                    <TableCell className="text-xs px-2 py-1">
                      {formatNumber(zone.pressureRequiredPSI, 0)} / {formatNumber(zone.calculatedPressureAtZonePSI, 0)}{" "}
                      PSI
                    </TableCell>
                    <TableCell className="text-xs px-2 py-1">{zone.itemIds.length}</TableCell>
                    <TableCell className="text-xs px-2 py-1">
                      {formatNumber(zone.suggestedRunTimeMinutes, 0)}
                      {renderCycleSoak(zone.cycleSoakRecommendation)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Water Budget */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-xl flex items-center">
              <Clock className="w-6 h-6 mr-2 text-primary-orange" /> Estimated Water Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Total System GPM (Max Concurrent):</span>
              <span className="font-semibold">{formatNumber(results.totalSystemGPM)} GPM</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Est. Weekly Usage:</span>
              <span className="font-semibold">{formatNumber(results.totalWaterUsageWeekly, 0)} Gallons</span>
            </div>
            <p className="text-xs text-medium-grey mt-2">
              Note: Weekly usage is an estimate based on typical run times. Actual usage will vary.
            </p>
          </CardContent>
        </Card>

        {/* Material List */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-xl flex items-center">
              <ListChecks className="w-6 h-6 mr-2 text-primary-orange" /> Bill of Materials (Estimated)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs px-2 py-1">Item</TableHead>
                  <TableHead className="text-xs px-2 py-1 text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.materialList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs px-2 py-1">{item.name}</TableCell>
                    <TableCell className="text-xs px-2 py-1 text-right">
                      {item.quantity} {item.unit || ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Cost Estimation (Optional) */}
        {results.estimatedTotalCost !== undefined && (
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-xl flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-primary-orange" /> Estimated Project Cost
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-center text-primary-orange">
                ${formatNumber(results.estimatedTotalCost, 2)}
              </p>
              <p className="text-xs text-medium-grey text-center mt-1">This is an estimate. Actual costs may vary.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  )
}
