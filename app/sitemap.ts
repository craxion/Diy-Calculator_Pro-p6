import type { MetadataRoute } from "next"
import { calculatorCategories, createUrlSlug } from "@/lib/utils/url-slug"
import { getAllImplementedCalculators } from "@/lib/utils/url-slug"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://diycalculatorpro.com"

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/calculators`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ]

  // Add category pages (all categories, even if empty)
  Object.keys(calculatorCategories).forEach((category) => {
    routes.push({
      url: `${baseUrl}/calculators/${createUrlSlug(category)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    })
  })

  // Add only implemented calculator pages
  const implementedCalculators = getAllImplementedCalculators()
  implementedCalculators.forEach(({ category, calculator }) => {
    routes.push({
      url: `${baseUrl}/calculators/${createUrlSlug(category)}/${createUrlSlug(calculator.name)}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    })
  })

  return routes
}
