import { type ExcavationFormState, type CalculationResults, soilTypeData, dumpsterSizesYd3 } from "./types"
import { convertToBaseFoot, convertVolume, convertDensityToLbFt3, convertWeight, parseNumericInput } from "./utils"

export function calculateExcavation(formState: ExcavationFormState): CalculationResults {
  try {
    // Parse and convert dimensions to feet
    const lengthFt = convertToBaseFoot(parseNumericInput(formState.length), formState.lengthUnit)
    const widthFt = convertToBaseFoot(parseNumericInput(formState.width), formState.widthUnit)
    const depthFt = convertToBaseFoot(parseNumericInput(formState.depth), formState.depthUnit)
    const diameterFt = convertToBaseFoot(parseNumericInput(formState.diameter), formState.diameterUnit)
    const topWidthFt = convertToBaseFoot(parseNumericInput(formState.topWidth), formState.topWidthUnit)
    let bottomWidthFt = convertToBaseFoot(parseNumericInput(formState.bottomWidth), formState.bottomWidthUnit)

    if (formState.excavationType === "trench" && bottomWidthFt <= 0) {
      bottomWidthFt = topWidthFt // Default to top width if bottom width is 0 or empty
    }

    // Validate dimensions
    if (formState.excavationType === "rectangular" && (lengthFt <= 0 || widthFt <= 0 || depthFt <= 0)) {
      return { error: "Please enter valid positive dimensions for rectangular excavation." } as CalculationResults
    }
    if (formState.excavationType === "circular" && (diameterFt <= 0 || depthFt <= 0)) {
      return { error: "Please enter valid positive dimensions for circular excavation." } as CalculationResults
    }
    if (formState.excavationType === "trench" && (lengthFt <= 0 || topWidthFt <= 0 || depthFt <= 0)) {
      return { error: "Please enter valid positive dimensions for trench excavation." } as CalculationResults
    }

    let originalVolumeFt3 = 0
    switch (formState.excavationType) {
      case "rectangular":
        originalVolumeFt3 = lengthFt * widthFt * depthFt
        break
      case "circular":
        originalVolumeFt3 = Math.PI * Math.pow(diameterFt / 2, 2) * depthFt
        break
      case "trench":
        originalVolumeFt3 = depthFt * lengthFt * ((topWidthFt + bottomWidthFt) / 2)
        break
    }

    if (originalVolumeFt3 <= 0) {
      return { error: "Calculated volume is zero or negative. Please check inputs." } as CalculationResults
    }

    // Soil Properties
    const currentSoil = soilTypeData[formState.soilType] || soilTypeData["Custom"]
    const swellFactor =
      formState.soilType === "Custom"
        ? parseNumericInput(formState.customSwellFactor, 20) / 100
        : currentSoil.swell / 100

    if (swellFactor < 0 || swellFactor > 1) {
      // Percentage validation
      return { error: "Swell factor must be between 0% and 100%." } as CalculationResults
    }

    const densityLbFt3 =
      formState.soilType === "Custom"
        ? convertDensityToLbFt3(parseNumericInput(formState.customSoilDensity, 100), formState.soilDensityUnit)
        : convertDensityToLbFt3(currentSoil.densityLbFt3, "lb/ft3") // Default soil data is in lb/ft3

    const expandedVolumeFt3 = originalVolumeFt3 * (1 + swellFactor)
    const estimatedWeightLbs = originalVolumeFt3 * densityLbFt3

    // Costs
    const disposalCostPerUnit = parseNumericInput(formState.disposalCostPerUnit)
    const truckCapacity = parseNumericInput(formState.truckCapacity, 10) // Default 10 if empty

    const expandedVolumeForDisposal =
      formState.disposalCostUnit === "yd3"
        ? convertVolume(expandedVolumeFt3, "yd3")
        : convertVolume(expandedVolumeFt3, "m3")

    const truckCapacityForDisposal =
      formState.truckCapacityUnit === "yd3" ? truckCapacity : convertVolume(convertVolume(truckCapacity, "m3"), "yd3") // convert truck m3 to yd3 for trips

    const disposalTrips =
      truckCapacityForDisposal > 0 ? Math.ceil(expandedVolumeForDisposal / truckCapacityForDisposal) : 0
    const disposalCost = expandedVolumeForDisposal * disposalCostPerUnit

    const laborRate = parseNumericInput(formState.laborRate)
    const laborHours = parseNumericInput(formState.laborHours)
    const laborCost = laborRate * laborHours

    const equipmentRate = parseNumericInput(formState.equipmentRate)
    const equipmentHours = parseNumericInput(formState.equipmentHours)
    const equipmentCost = equipmentRate * equipmentHours

    const totalCost = disposalCost + laborCost + equipmentCost

    // Dumpster Suggestion
    const expandedVolumeYd3 = convertVolume(expandedVolumeFt3, "yd3")
    let dumpsterSuggestion
    for (const size of dumpsterSizesYd3) {
      if (expandedVolumeYd3 <= size) {
        const remaining = size - expandedVolumeYd3
        dumpsterSuggestion = {
          sizeYd3: size,
          message: `A ${size} cu yd dumpster is recommended. Remaining capacity: ${remaining.toFixed(1)} cu yd.`,
        }
        break
      }
    }
    if (!dumpsterSuggestion && expandedVolumeYd3 > 0) {
      dumpsterSuggestion = {
        sizeYd3: dumpsterSizesYd3[dumpsterSizesYd3.length - 1], // largest
        message: `Expanded volume (${expandedVolumeYd3.toFixed(1)} cu yd) exceeds largest standard dumpster. Multiple or larger dumpsters needed.`,
      }
    }

    return {
      originalVolumeFt3,
      originalVolumeYd3: convertVolume(originalVolumeFt3, "yd3"),
      originalVolumeM3: convertVolume(originalVolumeFt3, "m3"),
      expandedVolumeFt3,
      expandedVolumeYd3: convertVolume(expandedVolumeFt3, "yd3"),
      expandedVolumeM3: convertVolume(expandedVolumeFt3, "m3"),
      estimatedWeightLbs,
      estimatedWeightKg: convertWeight(estimatedWeightLbs, "kg"),
      disposalTrips,
      costs: {
        disposal: disposalCost,
        labor: laborCost,
        equipment: equipmentCost,
        total: totalCost,
      },
      dumpsterSuggestion,
    }
  } catch (e) {
    console.error("Calculation error:", e)
    return { error: "An unexpected error occurred during calculation." } as CalculationResults
  }
}
