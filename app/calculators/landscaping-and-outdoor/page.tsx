import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Calculator } from "lucide-react"
import { calculatorCategories, createUrlSlug } from "@/lib/utils/url-slug"

export default function LandscapingCalculatorsPage() {
  const implementedCalculators = calculatorCategories["Landscaping and Outdoor"].filter((calc) => calc.implemented)

  return (
    <div className="container py-12 space-y-12">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Home className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Landscaping & Outdoor Calculators</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Professional landscaping calculators for garden planning, material estimation, and outdoor project
          calculations. Perfect for landscapers, gardeners, and outdoor enthusiasts.
        </p>
        <Badge variant="secondary" className="text-sm">
          {implementedCalculators.length > 0
            ? `${implementedCalculators.length} Calculators Available`
            : "More calculators coming soon!"}
        </Badge>
      </div>

      {implementedCalculators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {implementedCalculators.map((calculator) => (
            <Card key={calculator.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <span>{calculator.name}</span>
                </CardTitle>
                <CardDescription>
                  Calculate materials and costs for {calculator.name.toLowerCase().replace(" calculator", "")} projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={`/calculators/landscaping-and-outdoor/${createUrlSlug(calculator.name)}`}>
                    Use Calculator
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <Home className="h-16 w-16 mx-auto mb-6 opacity-50" />
          <h2 className="text-2xl font-bold mb-4">More Calculators Coming Soon!</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            We're developing new landscaping calculators to help with your outdoor projects. Check back soon for paver,
            fence, and grass seed calculators!
          </p>
          <Button asChild variant="outline">
            <Link href="/calculators">View All Categories</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
