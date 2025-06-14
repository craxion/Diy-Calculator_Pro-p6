import type { RequiredCut, StockLumber, OptimizerSettings, OptimizationResults, StockBoardCutPlan, Unit } from "./types"
import { v4 as uuidv4 } from "uuid"

const BASE_UNIT: Unit = "inches" // All calculations will be done in inches

function convertToUnit(value: number, fromUnit: Unit, toUnit: Unit): number {
  if (fromUnit === toUnit) return value

  const inchesPerUnit: Record<Unit, number> = {
    inches: 1,
    feet: 12,
    cm: 0.393701,
    meters: 39.3701,
    mm: 0.0393701,
  }

  const valueInInches = value * inchesPerUnit[fromUnit]
  return valueInInches / inchesPerUnit[toUnit]
}

function convertToInches(value: number, unit: Unit): number {
  return convertToUnit(value, unit, BASE_UNIT)
}

function convertFromInches(valueInInches: number, targetUnit: Unit): number {
  return convertToUnit(valueInInches, BASE_UNIT, targetUnit)
}

interface ProcessedRequiredCut {
  id: string
  originalId: string
  length: number // in BASE_UNIT
  label: string
  priority: boolean
  grainMatch: boolean
  quantityFulfilled: number
  originalQuantity: number
  originalUnit: Unit
}

interface ProcessedStockBoard {
  id: string // original stock lumber ID
  instanceId: string // unique ID for this board instance
  length: number // in BASE_UNIT
  costPerInch: number
  defectZones: Array<{ start: number; end: number }> // in BASE_UNIT
  originalUnit: Unit
}

export function optimizeLumberCuts(
  requiredCutsInput: RequiredCut[],
  stockLumberInput: StockLumber[],
  settings: OptimizerSettings,
): OptimizationResults {
  const startTime = performance.now()

  const sawKerf = convertToInches(Number.parseFloat(settings.sawKerf) || 0, settings.kerfUnit)
  const minOffcutLength = convertToInches(Number.parseFloat(settings.minOffcutLength) || 0, settings.minOffcutUnit)

  // 1. Preprocess inputs
  const processedCuts: ProcessedRequiredCut[] = []
  requiredCutsInput.forEach((cut) => {
    const length = convertToInches(Number.parseFloat(cut.length) || 0, cut.unit)
    const quantity = Number.parseInt(cut.quantity) || 0
    if (length > 0 && quantity > 0) {
      for (let i = 0; i < quantity; i++) {
        // Expand quantities for easier processing
        processedCuts.push({
          id: uuidv4(),
          originalId: cut.id,
          length,
          label: cut.label || `Cut ${length}${BASE_UNIT}`,
          priority: cut.priority,
          grainMatch: cut.grainMatch, // Note: Grain matching logic is complex and not fully implemented in this heuristic
          quantityFulfilled: 0, // This will be updated if we track original cut items
          originalQuantity: quantity,
          originalUnit: cut.unit,
        })
      }
    }
  })

  // Sort cuts: High priority first, then by length descending
  processedCuts.sort((a, b) => {
    if (a.priority && !b.priority) return -1
    if (!a.priority && b.priority) return 1
    return b.length - a.length // FFD (First Fit Decreasing)
  })

  const processedStock: ProcessedStockBoard[] = []
  stockLumberInput.forEach((stock) => {
    const length = convertToInches(Number.parseFloat(stock.length) || 0, stock.unit)
    const quantity = Number.parseInt(stock.quantity) || 0
    const cost = Number.parseFloat(stock.costPerUnit) || 0
    let costPerInch = 0
    if (cost > 0 && length > 0) {
      const lengthInCostUnit =
        stock.costUnit === "per_foot" ? convertFromInches(length, "feet") : convertFromInches(length, "meters")
      costPerInch = (cost / lengthInCostUnit) * (stock.costUnit === "per_foot" ? 1 / 12 : 1 / 39.3701)
    }

    const defects = stock.defectZones
      .map((d) => ({
        start: convertToInches(Number.parseFloat(d.start) || 0, d.unit),
        end: convertToInches(Number.parseFloat(d.end) || 0, d.unit),
      }))
      .filter((d) => d.end > d.start && d.start < length && d.end > 0) // Basic validation
      .sort((a, b) => a.start - b.start)

    if (length > 0 && quantity > 0) {
      for (let i = 0; i < quantity; i++) {
        processedStock.push({
          id: stock.id,
          instanceId: uuidv4(),
          length,
          costPerInch,
          defectZones: defects,
          originalUnit: stock.unit,
        })
      }
    }
  })

  // 2. Perform cutting optimization (Greedy First Fit Decreasing approach)
  const cuttingPlanByBoard: StockBoardCutPlan[] = []
  const cutsToPlace = [...processedCuts] // A mutable list of cuts still needing placement

  for (const board of processedStock) {
    const boardPlan: StockBoardCutPlan = {
      stockBoardId: board.id,
      stockBoardInstanceId: board.instanceId,
      originalLength: board.length,
      cuts: [],
      wasteSegments: [],
      defectZones: board.defectZones,
    }

    // Manage available segments on the board
    let availableSegments = [{ start: 0, end: board.length }]

    // Account for defect zones by splitting available segments
    board.defectZones.forEach((defect) => {
      const newSegments = []
      for (const segment of availableSegments) {
        // Defect is before segment
        if (defect.end <= segment.start) {
          newSegments.push(segment)
        }
        // Defect is after segment
        else if (defect.start >= segment.end) {
          newSegments.push(segment)
        }
        // Defect is within segment
        else {
          if (defect.start > segment.start) {
            newSegments.push({ start: segment.start, end: defect.start })
          }
          if (defect.end < segment.end) {
            newSegments.push({ start: defect.end, end: segment.end })
          }
        }
      }
      availableSegments = newSegments.filter((s) => s.end - s.start > 0)
    })

    availableSegments.sort((a, b) => a.end - a.start - (b.end - b.start)) // Smallest segment first for fitting

    for (let i = cutsToPlace.length - 1; i >= 0; i--) {
      const cut = cutsToPlace[i]
      let placed = false

      for (let j = 0; j < availableSegments.length; j++) {
        const segment = availableSegments[j]
        const segmentLength = segment.end - segment.start

        if (segmentLength >= cut.length) {
          // Place cut at the start of the segment
          boardPlan.cuts.push({
            originalCutId: cut.originalId,
            label: cut.label,
            length: cut.length,
            xPosition: segment.start,
            priority: cut.priority,
            grainMatch: cut.grainMatch,
          })

          // Update segment or create new ones
          const remainingLengthAfterCut = segmentLength - cut.length
          availableSegments.splice(j, 1) // Remove old segment

          if (remainingLengthAfterCut >= sawKerf) {
            const lengthAfterKerf = remainingLengthAfterCut - sawKerf
            if (lengthAfterKerf > 0) {
              availableSegments.push({ start: segment.start + cut.length + sawKerf, end: segment.end })
            }
          }

          cutsToPlace.splice(i, 1) // Remove placed cut
          placed = true
          availableSegments.sort((a, b) => a.end - a.start - (b.end - b.start)) // Re-sort
          break // Move to next cut
        }
      }
    }

    // Consolidate cuts and identify waste/offcuts for this board
    boardPlan.cuts.sort((a, b) => a.xPosition - b.xPosition)
    let currentPos = 0
    board.defectZones.forEach((defect) => {
      // Add defects as "pre-determined waste"
      if (defect.start > currentPos) {
        boardPlan.wasteSegments.push({
          length: defect.start - currentPos,
          xPosition: currentPos,
          isUsableOffcut: false,
        }) // Waste before defect
      }
      boardPlan.wasteSegments.push({
        length: defect.end - defect.start,
        xPosition: defect.start,
        isUsableOffcut: false,
      }) // The defect itself
      currentPos = defect.end
    })

    boardPlan.cuts.forEach((cut) => {
      if (cut.xPosition > currentPos) {
        const wasteLength = cut.xPosition - currentPos
        boardPlan.wasteSegments.push({
          length: wasteLength,
          xPosition: currentPos,
          isUsableOffcut: wasteLength >= minOffcutLength,
        })
      }
      currentPos = cut.xPosition + cut.length
      if (sawKerf > 0 && boardPlan.cuts.indexOf(cut) < boardPlan.cuts.length - 1) {
        // Add kerf as waste if not last cut
        boardPlan.wasteSegments.push({ length: sawKerf, xPosition: currentPos, isUsableOffcut: false })
        currentPos += sawKerf
      }
    })

    if (currentPos < board.length) {
      const finalWasteLength = board.length - currentPos
      boardPlan.wasteSegments.push({
        length: finalWasteLength,
        xPosition: currentPos,
        isUsableOffcut: finalWasteLength >= minOffcutLength,
      })
    }

    // Filter out zero-length waste segments that might occur due to defects
    boardPlan.wasteSegments = boardPlan.wasteSegments.filter((w) => w.length > 0.001) // Use a small epsilon

    if (boardPlan.cuts.length > 0 || board.defectZones.length > 0) {
      // Only add boards that were used or had defects
      cuttingPlanByBoard.push(boardPlan)
    }
  }

  // 3. Calculate summaries
  let totalWasteLength = 0
  let totalStockLengthUsed = 0
  let totalMaterialCost = 0
  const optimalOffcutsMap = new Map<number, { count: number; boardIds: string[]; unit: Unit }>()

  cuttingPlanByBoard.forEach((plan) => {
    totalStockLengthUsed += plan.originalLength
    totalMaterialCost +=
      processedStock.find((s) => s.instanceId === plan.stockBoardInstanceId)!.costPerInch * plan.originalLength
    plan.wasteSegments.forEach((waste) => {
      if (!waste.isUsableOffcut) {
        totalWasteLength += waste.length
      } else {
        const offcutLengthKey = Math.round(waste.length * 100) / 100 // Group similar offcuts
        const existing = optimalOffcutsMap.get(offcutLengthKey) || { count: 0, boardIds: [], unit: BASE_UNIT }
        existing.count++
        existing.boardIds.push(plan.stockBoardInstanceId)
        optimalOffcutsMap.set(offcutLengthKey, existing)
      }
    })
  })

  const optimalOffcuts = Array.from(optimalOffcutsMap.entries())
    .map(([length, data]) => ({
      length: length, // Already in BASE_UNIT
      unit: data.unit,
      count: data.count,
      boardIds: data.boardIds,
    }))
    .sort((a, b) => b.length - a.length)

  const totalLengthOfAllStock = processedStock.reduce((sum, board) => sum + board.length, 0)
  const totalWastePercentage = totalLengthOfAllStock > 0 ? (totalWasteLength / totalLengthOfAllStock) * 100 : 0
  const estimatedWasteCost = totalWasteLength * (processedStock[0]?.costPerInch || 0) // Approximate cost

  const unaccommodatedPiecesAggregated: OptimizationResults["unaccommodatedPieces"] = []
  const unaccommodatedMap = new Map<string, { label: string; length: number; unit: Unit; quantityRemaining: number }>()

  cutsToPlace.forEach((cut) => {
    const key = `${cut.label}-${cut.length}-${cut.originalUnit}`
    if (unaccommodatedMap.has(key)) {
      unaccommodatedMap.get(key)!.quantityRemaining++
    } else {
      unaccommodatedMap.set(key, {
        label: cut.label,
        length: convertFromInches(cut.length, cut.originalUnit), // Convert back to original unit for display
        unit: cut.originalUnit,
        quantityRemaining: 1,
      })
    }
  })
  unaccommodatedMap.forEach((value) => unaccommodatedPiecesAggregated.push(value))

  // Stock Utilization (Simplified for now)
  const stockUtilization: OptimizationResults["stockUtilization"] = []
  const usedStockCounts = new Map<string, number>()
  cuttingPlanByBoard.forEach((plan) => {
    usedStockCounts.set(plan.stockBoardId, (usedStockCounts.get(plan.stockBoardId) || 0) + 1)
  })

  stockLumberInput.forEach((stockDef) => {
    const originalStockLength = convertToInches(Number.parseFloat(stockDef.length) || 0, stockDef.unit)
    const numUsed = usedStockCounts.get(stockDef.id) || 0
    if (numUsed > 0) {
      let totalCutLengthOnUsedBoards = 0
      cuttingPlanByBoard
        .filter((p) => p.stockBoardId === stockDef.id)
        .forEach((p) => {
          totalCutLengthOnUsedBoards += p.cuts.reduce((sum, c) => sum + c.length, 0)
        })
      const utilizationPercentage =
        originalStockLength * numUsed > 0 ? (totalCutLengthOnUsedBoards / (originalStockLength * numUsed)) * 100 : 0
      stockUtilization.push({
        stockId: stockDef.id,
        originalLength: Number.parseFloat(stockDef.length) || 0,
        unit: stockDef.unit,
        quantityUsed: numUsed,
        utilizationPercentage: Number.parseFloat(utilizationPercentage.toFixed(1)),
      })
    }
  })

  const endTime = performance.now()

  return {
    cuttingPlanByBoard,
    totalWasteLength: convertFromInches(totalWasteLength, settings.minOffcutUnit), // Display in user's offcut unit preference
    totalWastePercentage: Number.parseFloat(totalWastePercentage.toFixed(1)),
    estimatedWasteCost: Number.parseFloat(estimatedWasteCost.toFixed(2)),
    stockUtilization,
    unaccommodatedPieces: unaccommodatedPiecesAggregated,
    optimalOffcuts: optimalOffcuts.map((off) => ({
      ...off,
      length: convertFromInches(off.length, settings.minOffcutUnit),
    })),
    totalMaterialCost: Number.parseFloat(totalMaterialCost.toFixed(2)),
    calculationTime: Number.parseFloat((endTime - startTime).toFixed(0)),
  }
}
