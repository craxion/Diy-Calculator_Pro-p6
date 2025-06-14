import Link from "next/link"
import { Calculator } from "lucide-react" // Assuming you might want social icons

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark-grey text-light-grey/80 border-t border-medium-grey/30">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Column 1: Logo and About */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <Calculator className="h-7 w-7 text-primary-green group-hover:animate-pulse" />
              <span className="font-bold text-xl text-brand-white group-hover:text-secondary-green transition-colors">
                DIYCalculatorPro
              </span>
            </Link>
            <p className="text-sm text-medium-grey max-w-xs">
              Empowering your projects with accurate and easy-to-use online calculators for all your DIY and
              professional needs.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-md font-semibold text-brand-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/calculators" className="hover:text-primary-green transition-colors">
                  All Calculators
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-primary-green transition-colors">
                  About Us
                </Link>
              </li>
              {/* Add more links like Blog, FAQ if they exist */}
              <li>
                <Link href="/contact-us" className="hover:text-primary-green transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Social */}
          <div>
            <h3 className="text-md font-semibold text-brand-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="hover:text-primary-green transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-primary-green transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
            {/* Optional: Social Media Links */}
            {/* <div className="mt-6 flex space-x-4">
              <Link href="#" aria-label="GitHub" className="text-light-grey/70 hover:text-primary-green transition-colors"><Github className="h-5 w-5" /></Link>
              <Link href="#" aria-label="Twitter" className="text-light-grey/70 hover:text-primary-green transition-colors"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" aria-label="LinkedIn" className="text-light-grey/70 hover:text-primary-green transition-colors"><Linkedin className="h-5 w-5" /></Link>
            </div> */}
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-medium-grey/30 text-center text-sm text-medium-grey">
          <p>&copy; {currentYear} DIYCalculatorPro. All rights reserved. Plan Smarter, Build Better.</p>
        </div>
      </div>
    </footer>
  )
}
