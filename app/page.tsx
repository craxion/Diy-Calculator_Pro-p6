import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  Hammer,
  HomeIcon,
  Paintbrush,
  Ruler,
  Wrench,
  Search,
  ArrowRight,
  CheckCircle,
  TrendingUp,
} from "lucide-react" // Updated Home to HomeIcon
import { calculatorCategories, createUrlSlug } from "@/lib/utils/url-slug"
import { AnimatedOnScroll } from "@/components/animated-on-scroll" // Import animation component

// Placeholder Icons for categories - replace with actual SVG components if available
const categoryPlaceHolderIcons = {
  "Construction and Building": Hammer,
  "Carpentry and Woodworking": Wrench,
  "Landscaping and Outdoor": HomeIcon, // Changed from Home to HomeIcon
  "Painting and Finishing": Paintbrush,
  "Electrical and Plumbing": Wrench, // Placeholder, consider specific icon like Zap or Plug
  "Conversions and Math": Ruler,
}

const featuredCalculators = Object.values(calculatorCategories)
  .flat()
  .filter((calc) => calc.implemented && calc.featured) // Assuming a 'featured' flag in calculatorCategories
  .slice(0, 4) // Show up to 4 featured calculators

// If no 'featured' flag, fallback to first few implemented ones
if (featuredCalculators.length === 0) {
  const allImplemented = Object.values(calculatorCategories)
    .flat()
    .filter((calc) => calc.implemented)
  featuredCalculators.push(...allImplemented.slice(0, 4))
}

export default function HomePage() {
  return (
    <div className="space-y-12 md:space-y-20">
      {/* Hero Section */}
      <AnimatedOnScroll animationType="fade-in">
        <section className="py-16 md:py-24 bg-gradient-to-br from-light-grey via-brand-white to-secondary-orange/10">
          <div className="container text-center space-y-6 md:space-y-8">
            <Badge
              variant="outline"
              className="border-primary-orange/50 text-primary-orange bg-primary-orange/10 py-1 px-3 text-sm"
            >
              New & Improved Calculators!
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-dark-grey">
              Plan Smarter, <span className="text-primary-orange">Build Better</span>
            </h1>
            <p className="text-lg md:text-xl text-medium-grey max-w-3xl mx-auto">
              Your ultimate toolkit for accurate project estimation. Save time, reduce waste, and tackle any DIY or
              professional project with confidence using our expert calculators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto pt-4">
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-medium-grey" />
                <Input
                  type="search"
                  placeholder="Search calculators (e.g., concrete, paint)"
                  className="pl-12 pr-4 py-3 w-full text-md rounded-md border-medium-grey/70 focus:ring-primary-orange focus:border-primary-orange"
                />
              </div>
              <Button size="lg" className="w-full sm:w-auto text-md px-8 py-3 group">
                Find Calculator <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>
      </AnimatedOnScroll>

      {/* Calculator Categories */}
      <section className="py-12 md:py-16 container">
        <AnimatedOnScroll animationType="slide-up-fade">
          <div className="text-center space-y-3 mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-grey">Explore by Category</h2>
            <p className="text-md md:text-lg text-medium-grey max-w-2xl mx-auto">
              Find the perfect tool for your needs, organized for easy browsing.
            </p>
          </div>
        </AnimatedOnScroll>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {Object.entries(calculatorCategories).map(([category, calculators]) => {
            const implementedCalculators = calculators.filter((calc) => calc.implemented)
            const IconComponent =
              categoryPlaceHolderIcons[category as keyof typeof categoryPlaceHolderIcons] || Calculator

            return (
              <AnimatedOnScroll animationType="slide-up-fade" key={category} className="h-full">
                <Card className="bg-brand-white hover:shadow-xl transition-all duration-300 ease-in-out border-light-grey/80 group h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-3 bg-primary-orange/10 rounded-lg group-hover:bg-primary-orange/20 transition-colors">
                        <IconComponent className="h-7 w-7 text-primary-orange" />
                      </div>
                      <CardTitle className="text-xl text-dark-grey group-hover:text-primary-orange transition-colors">
                        {category}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-sm text-medium-grey line-clamp-2">
                      {implementedCalculators.length > 0
                        ? `${implementedCalculators.length} tools for ${category.toLowerCase()}`
                        : "Calculators coming soon!"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {implementedCalculators.length > 0 && (
                      <ul className="space-y-1.5 text-sm mb-4">
                        {implementedCalculators.slice(0, 3).map((calc) => (
                          <li key={calc.name} className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-primary-orange/70 mr-2 flex-shrink-0" />
                            <span className="text-medium-grey">{calc.name.replace(" Calculator", "")}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                  <div className="p-6 pt-0 mt-auto">
                    {" "}
                    {/* Footer of card */}
                    <Button
                      asChild
                      className="w-full group/button"
                      variant={implementedCalculators.length > 0 ? "default" : "outline"}
                    >
                      <Link href={`/calculators/${createUrlSlug(category)}`}>
                        {implementedCalculators.length > 0 ? "View Tools" : "Explore Category"}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/button:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </AnimatedOnScroll>
            )
          })}
        </div>
      </section>

      {/* Featured Calculators - Conditional Rendering */}
      {featuredCalculators.length > 0 && (
        <section className="py-12 md:py-16 bg-light-grey/50">
          <div className="container">
            <AnimatedOnScroll animationType="slide-up-fade">
              <div className="text-center space-y-3 mb-10 md:mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-dark-grey">Popular Calculators</h2>
                <p className="text-md md:text-lg text-medium-grey">
                  Jumpstart your project with these frequently used tools.
                </p>
              </div>
            </AnimatedOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {featuredCalculators.map((calc) => {
                // Find category for the featured calculator
                const categoryName =
                  Object.keys(calculatorCategories).find((cat) =>
                    calculatorCategories[cat].some((c) => c.name === calc.name),
                  ) || ""

                return (
                  <AnimatedOnScroll animationType="slide-up-fade" key={calc.name} className="h-full">
                    <Card className="bg-brand-white hover:shadow-xl transition-all duration-300 ease-in-out border-light-grey/80 group h-full flex flex-col">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-dark-grey group-hover:text-primary-orange transition-colors">
                          {calc.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-medium-grey uppercase tracking-wider">
                          {categoryName}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        {/* Optional: Add a brief description of the calculator if available in data */}
                        <p className="text-sm text-medium-grey mb-4 line-clamp-2">
                          Quickly estimate materials for your {calc.name.toLowerCase().replace(" calculator", "")}.
                        </p>
                      </CardContent>
                      <div className="p-6 pt-0 mt-auto">
                        <Button asChild variant="outline" className="w-full group/button">
                          <Link href={`/calculators/${createUrlSlug(categoryName)}/${createUrlSlug(calc.name)}`}>
                            Use Calculator
                            <ArrowRight className="ml-2 h-4 w-4 group-hover/button:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  </AnimatedOnScroll>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="py-12 md:py-16 container">
        <AnimatedOnScroll animationType="slide-up-fade">
          <div className="text-center space-y-3 mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-grey">Why Choose DIYCalculatorPro?</h2>
            <p className="text-md md:text-lg text-medium-grey">
              Precision, ease, and expert insights for every project.
            </p>
          </div>
        </AnimatedOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {[
            {
              icon: CheckCircle,
              title: "Unmatched Accuracy",
              description:
                "Industry-standard formulas ensure precise results you can trust for all your project needs.",
            },
            {
              icon: TrendingUp,
              title: "Professional Grade Tools",
              description: "Built for DIYers and pros alike, with comprehensive estimation and planning features.",
            },
            {
              icon: Calculator,
              title: "Intuitive & Easy to Use",
              description: "Clean interfaces make complex calculations simple, accessible, and even enjoyable.",
            },
          ].map((feature, index) => (
            <AnimatedOnScroll animationType="slide-up-fade" key={index} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="text-center p-6 bg-brand-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-light-grey/80">
                <div className="p-4 bg-primary-orange/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4 ring-4 ring-primary-orange/20">
                  <feature.icon className="h-8 w-8 text-primary-orange" />
                </div>
                <h3 className="text-xl font-semibold text-dark-grey mb-2">{feature.title}</h3>
                <p className="text-medium-grey text-sm">{feature.description}</p>
              </div>
            </AnimatedOnScroll>
          ))}
        </div>
      </section>
    </div>
  )
}
