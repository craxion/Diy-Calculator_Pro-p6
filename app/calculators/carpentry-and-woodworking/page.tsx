import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wrench, Calculator } from "lucide-react" // Using Wrench as per categoryIcons
import { createUrlSlug, getImplementedCalculators } from "@/lib/utils/url-slug"

export default function CarpentryWoodworkingCalculatorsPage() {
  const categoryName = "Carpentry and Woodworking"
  const implementedCalculators = getImplementedCalculators(categoryName)

  return (
    <div className="container py-12 space-y-12">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Wrench className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">{categoryName} Calculators</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Precision tools for all your carpentry and woodworking projects. From lumber estimation to complex joinery,
          plan accurately and build with confidence.
        </p>
        <Badge variant="secondary" className="text-sm">
          {implementedCalculators.length > 0
            ? `${implementedCalculators.length} Calculator${implementedCalculators.length === 1 ? "" : "s"} Available`
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
                  Optimize and calculate for your {calculator.name.toLowerCase().replace(" calculator", "")} needs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={`/calculators/${createUrlSlug(categoryName)}/${createUrlSlug(calculator.name)}`}>
                    Use Calculator
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <Wrench className="h-16 w-16 mx-auto mb-6 opacity-50" />
          <h2 className="text-2xl font-bold mb-4">More Calculators Coming Soon!</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            We're crafting new tools for the {categoryName} category. Stay tuned for calculators covering board feet,
            decking, stairs, and more!
          </p>
          <Button asChild variant="outline">
            <Link href="/calculators">View All Categories</Link>
          </Button>
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">Woodworking Wisdom</h2>
        <p className="text-muted-foreground">
          Measure twice, cut once! Our calculators help you get the measurements right the first time, saving you time,
          money, and materials.
        </p>
        <Button asChild variant="outline">
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  )
}
