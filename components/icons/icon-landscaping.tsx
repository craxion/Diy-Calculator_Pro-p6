// Placeholder - A simple HomeIcon or Sprout from Lucide can be used
import type React from "react"
export const IconLandscaping: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
    <path d="M17 8V5H7v3" />
    <path d="M7 19v-5" />
    <path d="M17 19v-5" />
  </svg>
)
// This is a more abstract "structure" icon. A HomeIcon or Sprout from lucide-react might be better.
