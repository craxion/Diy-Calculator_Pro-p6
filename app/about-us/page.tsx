import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calculator, Users, Target, Lightbulb, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us | DIYCalculatorPro - Your Trusted Source for Project Calculators",
  description:
    "Learn about DIYCalculatorPro's mission to provide accurate, easy-to-use calculators for DIY, home improvement, and construction professionals. Plan smarter, build better.",
}

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About DIYCalculatorPro: Empowering Your Projects
          </h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Our Story */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Lightbulb className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                At DIYCalculatorPro, we believe that every DIY project, no matter how big or small, deserves precise
                planning and accurate execution. Our journey began with a simple frustration: the lack of reliable,
                easy-to-use online tools that truly catered to the specific needs of home renovators, contractors, and
                passionate DIYers. We envisioned a platform where complex calculations wouldn't be a barrier, but a
                stepping stone to success.
              </p>
            </CardContent>
          </Card>

          {/* Mission & Vision */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Target className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Our Mission & Vision</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our mission is to empower individuals and professionals alike by providing a comprehensive suite of
                accurate, intuitive, and feature-rich online calculators. We aim to simplify material estimation, cost
                planning, and design calculations, helping you save time, reduce waste, and build with confidence. We
                envision a world where precise project planning is accessible to everyone.
              </p>
            </CardContent>
          </Card>

          {/* What Makes Us Different */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Calculator className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">What Makes Us Different</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                What sets DIYCalculatorPro apart is our unwavering commitment to accuracy, user experience, and
                practical utility. We go beyond basic formulas, incorporating industry-standard practices, detailed
                inputs, and comprehensive outputs. Our calculators are designed not just to give you a number, but to
                provide actionable insights that help you plan smarter, reduce costly mistakes, and ultimately achieve
                better project outcomes.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We are constantly refining our tools and adding new ones, guided by user feedback and the evolving needs
                of the DIY and construction community.
              </p>
            </CardContent>
          </Card>

          {/* Who We Serve */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Who We Serve</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Whether you're a seasoned contractor planning a large-scale build, a homeowner tackling a weekend
                renovation, a landscaper estimating materials, or a hobbyist woodworker, DIYCalculatorPro is built for
                you. Our tools cater to a wide range of trades and projects, from calculating concrete for a foundation
                to estimating paint for a room, ensuring you have the right numbers at your fingertips.
              </p>
            </CardContent>
          </Card>

          {/* Looking Ahead */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <ArrowRight className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Looking Ahead</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                The journey of DIYCalculatorPro is one of continuous growth. We are dedicated to expanding our
                calculator library, enhancing existing features, and staying at the forefront of digital tools for
                project planning. Your success is our inspiration, and we're excited to grow with you.
              </p>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Start Your Next Project?</h2>
              <p className="text-xl mb-8 opacity-90">
                Explore our extensive range of calculators today and start planning your next project with precision.
                Have a suggestion or need assistance? We'd love to hear from you.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="text-blue-600 hover:text-blue-700">
                  <Link href="/calculators">
                    <Calculator className="mr-2 h-5 w-5" />
                    Explore All Calculators
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Links */}
          <div className="text-center pt-8">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <Link href="/privacy-policy" className="hover:text-blue-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-blue-600 transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-blue-600 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
