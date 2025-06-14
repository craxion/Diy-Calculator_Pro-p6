import Link from "next/link"
import { ArrowLeft, AlertCircle, Info, Beaker } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Metadata } from "next"
import { createUrlSlug } from "@/lib/utils/url-slug"

// Import client component for calculator logic
import ChemicalDilutionCalculatorClient from "@/components/calculators/chemical-dilution-calculator/chemical-dilution-calculator-client"

const calculatorName = "Chemical and Liquid Dilution Calculator"
const categoryName = "Household Solutions and Mixing"
const categorySlug = createUrlSlug(categoryName)
const calculatorSlug = createUrlSlug(calculatorName)

export const metadata: Metadata = {
  title: `${calculatorName} | ${categoryName} | DIYCalculatorPro`,
  description: `Accurately calculate dilutions for chemicals and liquids. Ideal for household, garden, and workshop applications. Ensure precise mixtures every time.`,
  alternates: {
    canonical: `/calculators/${categorySlug}/${calculatorSlug}`,
  },
}

export default function ChemicalDilutionPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <Button variant="outline" size="icon" asChild className="mr-4">
            <Link href={`/calculators/${categorySlug}`}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to {categoryName}</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-dark-grey">{calculatorName}</h1>
            <p className="text-sm text-medium-grey">
              Part of{" "}
              <Link href={`/calculators/${categorySlug}`} className="text-primary-orange hover:underline">
                {categoryName}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <ChemicalDilutionCalculatorClient />

      {/* Value-Added Content Sections */}
      <div className="space-y-8 mt-12 pt-8 border-t">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2 text-primary-orange" />
              How to Use This Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-medium-grey">
            <p>
              This calculator helps you determine the correct amounts of concentrate and diluent (like water) to achieve
              a desired solution concentration.
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                <strong>Original (Stock) Concentration:</strong> Enter the concentration of your starting liquid. You
                can specify this as a percentage (e.g., 10%), a ratio (e.g., 1:5, meaning 1 part concentrate to 5 parts
                diluent for a total of 6 parts), or in Parts Per Million (PPM).
              </li>
              <li>
                <strong>Desired (Target) Concentration:</strong> Enter the final concentration you want to achieve for
                your mixed solution, using the same unit types.
              </li>
              <li>
                <strong>Known Volume Type:</strong> Select whether you know the amount of concentrate you have, or the
                total amount of final solution you want to make.
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>
                    If "I have this much CONCENTRATE": Enter the volume of your stock concentrate. The calculator will
                    tell you how much diluent to add.
                  </li>
                  <li>
                    If "I want this much FINAL SOLUTION": Enter the total volume of the mixed solution you need. The
                    calculator will tell you how much concentrate and diluent to mix.
                  </li>
                </ul>
              </li>
              <li>Enter the relevant volume and select its unit.</li>
              <li>Click "Calculate Mixture" or observe the results update dynamically.</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Beaker className="h-5 w-5 mr-2 text-primary-orange" />
              Why Accurate Dilution Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-medium-grey">
            <p>Precise dilution is crucial for several reasons:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Effectiveness:</strong> Many products are designed to work best at a specific concentration. Too
                weak, and it might not work; too strong, and it could be harmful or wasteful.
              </li>
              <li>
                <strong>Safety:</strong> Incorrectly concentrated chemicals can be dangerous to handle, damaging to
                surfaces, or harmful to plants and people.
              </li>
              <li>
                <strong>Cost-Saving:</strong> Using the correct amount of concentrate prevents waste and ensures you get
                the most out of your products.
              </li>
              <li>
                <strong>Environmental Responsibility:</strong> Avoiding overly concentrated solutions helps minimize
                environmental impact.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2 text-primary-orange" />
              Understanding Concentration: Percentages, Ratios, and PPM
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-medium-grey">
            <p>
              <strong>Percentage (%):</strong> Represents parts per hundred. For example, a 10% solution means 10 parts
              solute (active ingredient) per 100 parts of solution.
            </p>
            <p>
              <strong>Ratio (e.g., 1:10):</strong> Describes the proportion of one substance to another. A 1:10 ratio
              means 1 part of the first substance for every 10 parts of the second substance. When used for dilution,
              this often means 1 part concentrate to X parts diluent. Our calculator interprets a ratio like "1:X" as 1
              part concentrate in a total of (1+X) parts solution. For example, 1:9 means 1 part concentrate and 9 parts
              diluent, resulting in a 10% solution if the diluent is pure.
            </p>
            <p>
              <strong>Parts Per Million (PPM):</strong> Used for very low concentrations. 1 PPM means 1 part solute per
              1,000,000 parts of solution. (1 PPM = 0.0001%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              Safety Tips for Mixing Chemicals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-medium-grey">
            <ul className="list-disc list-inside space-y-1">
              <li>Always read and follow the manufacturer's instructions on the product label.</li>
              <li>Work in a well-ventilated area.</li>
              <li>
                Wear appropriate Personal Protective Equipment (PPE) such as gloves, eye protection, and sometimes a
                mask.
              </li>
              <li>
                <strong>
                  Always add concentrate to diluent (e.g., add chemical to water), not the other way around,
                </strong>{" "}
                especially for strong acids or bases, to avoid splashing and excessive heat generation.
              </li>
              <li>Mix thoroughly but gently to avoid splashing.</li>
              <li>
                Never mix different chemicals unless specifically instructed by the manufacturer, as this can create
                dangerous reactions.
              </li>
              <li>Label your diluted solutions clearly with the contents and date.</li>
              <li>Store chemicals safely and out of reach of children and pets.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Beaker className="h-5 w-5 mr-2 text-primary-orange" />
              Common Household Dilution Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-medium-grey">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Cleaning Solutions:</strong> Diluting concentrated all-purpose cleaners, disinfectants (like
                bleach), or floor cleaners.
              </li>
              <li>
                <strong>Gardening:</strong> Mixing plant foods, fertilizers, pesticides, or herbicides according to
                label directions.
              </li>
              <li>
                <strong>Automotive:</strong> Diluting car wash soap or windshield washer fluid concentrate.
              </li>
              <li>
                <strong>Pet Care:</strong> Preparing diluted pet shampoos or disinfectants for cleaning pet areas.
              </li>
            </ul>
            <p className="mt-2">
              <em>Always refer to the product label for specific dilution ratios for your intended use.</em>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Calculators</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <Link
                  href="/calculators/painting-and-finishing/paint-coverage-calculator"
                  className="text-primary-orange hover:underline"
                >
                  Paint Coverage Calculator
                </Link>
              </li>
              <li>
                <Link
                  href="/calculators/landscaping-and-outdoor/fertilizer-calculator"
                  className="text-primary-orange hover:underline"
                >
                  Fertilizer Calculator
                </Link>{" "}
                (if available)
              </li>
              <li>
                <Link
                  href="/calculators/landscaping-and-outdoor/water-flow-gpm-calculator"
                  className="text-primary-orange hover:underline"
                >
                  Water Flow (GPM) Calculator
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
