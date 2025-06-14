/**
 * Creates a standardized URL slug from input text
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Handles conjunctions properly (e.g., "and" becomes "-and-")
 * - Removes special characters except hyphens
 * - Prevents consecutive hyphens
 * - Trims leading/trailing hyphens
 */
export function createUrlSlug(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      // Replace spaces with hyphens
      .replace(/\s+/g, "-")
      // Remove special characters except hyphens and alphanumeric
      .replace(/[^a-z0-9-]/g, "")
      // Replace multiple consecutive hyphens with single hyphen
      .replace(/-+/g, "-")
      // Remove leading and trailing hyphens
      .replace(/^-+|-+$/g, "")
  )
}

/**
 * Generates a full calculator URL path
 */
export function generateCalculatorUrl(category: string, calculator: string): string {
  const categorySlug = createUrlSlug(category)
  const calculatorSlug = createUrlSlug(calculator)
  return `/calculators/${categorySlug}/${calculatorSlug}`
}

/**
 * Calculator category and calculator definitions with implementation status
 */
export const calculatorCategories = {
  "Construction and Building": [
    { name: "Concrete Slab Calculator", implemented: true },
    { name: "Excavation Volume and Cost Calculator", implemented: true },
    { name: "Wall Framing Calculator", implemented: true },
    { name: "Concrete Footings Calculator", implemented: false },
    { name: "Brick and Block Calculator", implemented: false },
    { name: "Mortar and Grout Calculator", implemented: false },
    { name: "Drywall Sheet Calculator", implemented: false },
    { name: "Insulation Calculator", implemented: false },
    { name: "Roofing Shingles Calculator", implemented: false },
    { name: "Stud Wall Framing Calculator", implemented: false },
  ],
  "Carpentry and Woodworking": [
    { name: "Lumber Cut Optimizer", implemented: true },
    { name: "Lumber Board Foot Calculator", implemented: false },
    { name: "Decking Calculator", implemented: false },
    { name: "Stairs Calculator", implemented: false },
    { name: "Rafter Calculator", implemented: false },
    { name: "Plywood and OSB Calculator", implemented: false },
  ],
  "Landscaping and Outdoor": [
    { name: "Soil and Mulch Calculator", implemented: true },
    { name: "Water Flow (GPM) Calculator", implemented: true },
    { name: "Paver Calculator", implemented: false },
    { name: "Fence Calculator", implemented: false },
    { name: "Grass Seed Calculator", implemented: false },
    { name: "Fertilizer Calculator", implemented: false },
    { name: "Retaining Wall Calculator", implemented: false },
  ],
  "Painting and Finishing": [
    { name: "Paint Coverage Calculator", implemented: false },
    { name: "Wallpaper Calculator", implemented: false },
    { name: "Tile Calculator", implemented: false },
    { name: "Flooring Calculator", implemented: false },
  ],
  "Electrical and Plumbing": [
    { name: "Ohms Law Calculator", implemented: false },
    { name: "Wire Gauge Calculator", implemented: false },
    { name: "Pipe Volume Calculator", implemented: false },
    { name: "Tank Volume Calculator", implemented: false },
  ],
  "Conversions and Math": [
    { name: "Length Converter", implemented: false },
    { name: "Area Converter", implemented: false },
    { name: "Volume Converter", implemented: false },
    { name: "Weight Converter", implemented: false },
    { name: "Temperature Converter", implemented: false },
    { name: "Percentage Calculator", implemented: false },
    { name: "Ratio Calculator", implemented: false },
    { name: "Right Triangle Calculator", implemented: false },
  ],
  "Household Solutions and Mixing": [{ name: "Chemical and Liquid Dilution Calculator", implemented: true }],
}

/**
 * Get only implemented calculators for a category
 */
export function getImplementedCalculators(category: string) {
  const calculators = calculatorCategories[category as keyof typeof calculatorCategories] || []
  return calculators.filter((calc) => calc.implemented)
}

/**
 * Get all implemented calculators across all categories
 */
export function getAllImplementedCalculators() {
  const implemented: Array<{ category: string; calculator: { name: string; implemented: boolean } }> = []

  Object.entries(calculatorCategories).forEach(([category, calculators]) => {
    calculators
      .filter((calc) => calc.implemented)
      .forEach((calculator) => {
        implemented.push({ category, calculator })
      })
  })

  return implemented
}
