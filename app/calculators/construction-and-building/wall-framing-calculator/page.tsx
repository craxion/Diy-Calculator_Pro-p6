import type { Metadata } from "next"
import WallFramingCalculator from "@/components/calculators/wall-framing-calculator"

export const metadata: Metadata = {
  title: "Wall Framing Calculator | DIY Calculator Pro",
  description:
    "Calculate materials needed for wall framing projects. Get accurate lumber counts, cut lists, and cost estimates for studs, plates, and headers.",
  keywords:
    "wall framing calculator, stud calculator, lumber calculator, construction materials, framing lumber, building calculator",
}

export default function WallFramingCalculatorPage() {
  return <WallFramingCalculator />
}
