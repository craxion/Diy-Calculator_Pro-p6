import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react" // Added AlertCircle for the message
import { getImplementedCalculators, createUrlSlug } from "@/lib/utils/url-slug"
import type { Metadata } from "next"

const categoryName = "Household Solutions and Mixing"
const categorySlug = createUrlSlug(categoryName)

export const metadata: Metadata = {
  title: `${categoryName} Calculators | DIYCalculatorPro`,
  description: `Find tools and calculators for ${categoryName.toLowerCase()}. Plan your household projects with precision.`,
  alternates: {
    canonical: `/calculators/${categorySlug}`,
  },
}

export default function HouseholdSolutionsCategoryPage() {
  const implementedCalculators = getImplementedCalculators(categoryName)

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div className="flex items-center mb-8">
        <Button variant="outline" size="icon" asChild className="mr-4">
          <Link href="/calculators">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to All Calculators</span>
          </Link>
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold text-dark-grey">{categoryName} Calculators</h1>
      </div>

      {implementedCalculators.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {implementedCalculators.map((calculator) => (
            <Card
              key={calculator.name}
              className="bg-brand-white hover:shadow-xl transition-all duration-300 ease-in-out border-light-grey/80 group flex flex-col"
            >
              <CardHeader>
                <CardTitle className="text-xl text-dark-grey group-hover:text-primary-orange transition-colors">
                  {calculator.name}
                </CardTitle>
                <CardDescription className="text-sm text-medium-grey line-clamp-2">
                  {/* Placeholder description - can be enhanced if descriptions are added to calculatorCategories */}
                  Calculate {calculator.name.toLowerCase()} for your household projects.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end">
                <Button asChild className="w-full mt-4 group/button">
                  <Link href={`/calculators/${categorySlug}/${createUrlSlug(calculator.name)}`}>
                    Use Calculator
                    <ArrowLeft className="ml-2 h-4 w-4 transform rotate-180 group-hover/button:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-brand-white border-light-grey/80 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-dark-grey">
              <AlertCircle className="h-6 w-6 mr-3 text-primary-orange" />
              More Tools Coming Soon!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-medium-grey mb-4">
              We're busy developing new calculators for the {categoryName} category. Please check back later for
              exciting new tools to help with your household projects!
            </p>
            <Button asChild variant="outline">
              <Link href="/calculators">Explore Other Calculators</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Placeholder for additional content about the category */}
      <section className="mt-12 py-8 border-t border-light-grey/50">
        <h2 className="text-2xl font-semibold text-dark-grey mb-4">About {categoryName}</h2>
        <p className="text-medium-grey leading-relaxed">
          The {categoryName} category will provide a range of calculators designed to simplify common household tasks
          that involve mixing solutions, calculating dilutions, or determining ingredient ratios. Whether you're working
          on cleaning solutions, garden mixtures, or kitchen recipes, these tools will help you achieve accurate results
          with ease. Stay tuned for upcoming calculators in this section!
        </p>
      </section>
    </div>
  )
}
