import type { PlantTypeData, SoilTypeData, SprinklerHeadType, PipeFrictionLossData } from "../types"
import { SprayCanIcon as Spray, Droplet, Wind, Leaf, Sun, CloudSun, CloudDrizzle } from "lucide-react"

export const DEFAULT_PLANT_TYPES: PlantTypeData[] = [
  { id: "lawn-turf", name: "Lawn / Turf", waterNeeds: "medium" },
  { id: "shrubs-groundcover", name: "Shrubs / Groundcover", waterNeeds: "medium" },
  { id: "flowers-perennials", name: "Flowers / Perennials", waterNeeds: "high" },
  { id: "trees", name: "Trees (Established)", waterNeeds: "low" },
  { id: "vegetables", name: "Vegetables", waterNeeds: "high" },
  { id: "native-drought-tolerant", name: "Native / Drought Tolerant", waterNeeds: "low" },
]

export const DEFAULT_SOIL_TYPES: SoilTypeData[] = [
  {
    id: "sandy",
    name: "Sandy Soil",
    absorptionRate: 1.0,
    absorptionRateUnit: "in/hr",
    typicalSwellFactor: 15,
    typicalDensity: 95,
    color: "rgba(240, 230, 140, 0.3)",
  }, // Khaki
  {
    id: "loamy",
    name: "Loamy Soil",
    absorptionRate: 0.5,
    absorptionRateUnit: "in/hr",
    typicalSwellFactor: 25,
    typicalDensity: 85,
    color: "rgba(139, 69, 19, 0.3)",
  }, // SaddleBrown
  {
    id: "clay",
    name: "Clay Soil",
    absorptionRate: 0.2,
    absorptionRateUnit: "in/hr",
    typicalSwellFactor: 35,
    typicalDensity: 105,
    color: "rgba(160, 82, 45, 0.3)",
  }, // Sienna
  {
    id: "rocky",
    name: "Rocky Soil",
    absorptionRate: 0.75,
    absorptionRateUnit: "in/hr",
    typicalSwellFactor: 50,
    typicalDensity: 165,
    color: "rgba(128, 128, 128, 0.3)",
  }, // Grey
]

export const DEFAULT_SPRINKLER_HEAD_TYPES: SprinklerHeadType[] = [
  {
    id: "spray-fixed-8ft",
    name: "Pop-up Spray (8ft Fixed)",
    type: "spray",
    defaultGPM: 1.0,
    defaultRadius: 8,
    defaultPressurePSI: 30,
    sprayPattern: "circle",
    precipitationRate: 1.5,
    icon: Spray,
  },
  {
    id: "spray-adj-10ft",
    name: "Pop-up Spray (10ft Adj.)",
    type: "spray",
    defaultGPM: 1.5,
    defaultRadius: 10,
    defaultPressurePSI: 30,
    sprayPattern: "arc",
    precipitationRate: 1.5,
    icon: Spray,
  },
  {
    id: "spray-adj-12ft",
    name: "Pop-up Spray (12ft Adj.)",
    type: "spray",
    defaultGPM: 2.0,
    defaultRadius: 12,
    defaultPressurePSI: 30,
    sprayPattern: "arc",
    precipitationRate: 1.6,
    icon: Spray,
  },
  {
    id: "spray-adj-15ft",
    name: "Pop-up Spray (15ft Adj.)",
    type: "spray",
    defaultGPM: 3.0,
    defaultRadius: 15,
    defaultPressurePSI: 30,
    sprayPattern: "arc",
    precipitationRate: 1.7,
    icon: Spray,
  },
  {
    id: "rotor-25ft",
    name: "Rotor (20-30ft)",
    type: "rotor",
    defaultGPM: 2.5,
    defaultRadius: 25,
    defaultPressurePSI: 45,
    sprayPattern: "arc",
    precipitationRate: 0.5,
    icon: Wind,
  },
  {
    id: "rotor-35ft",
    name: "Rotor (30-40ft)",
    type: "rotor",
    defaultGPM: 4.0,
    defaultRadius: 35,
    defaultPressurePSI: 50,
    sprayPattern: "arc",
    precipitationRate: 0.4,
    icon: Wind,
  },
  {
    id: "drip-emitter-1gph",
    name: "Drip Emitter (1 GPH)",
    type: "drip-emitter",
    defaultGPM: 1 / 60,
    defaultRadius: 0.5,
    defaultPressurePSI: 20,
    sprayPattern: "circle",
    icon: Droplet,
  },
  {
    id: "drip-emitter-2gph",
    name: "Drip Emitter (2 GPH)",
    type: "drip-emitter",
    defaultGPM: 2 / 60,
    defaultRadius: 0.5,
    defaultPressurePSI: 20,
    sprayPattern: "circle",
    icon: Droplet,
  },
  {
    id: "bubbler-adj",
    name: "Bubbler (Adjustable)",
    type: "bubbler",
    defaultGPM: 1.0,
    defaultRadius: 1,
    defaultPressurePSI: 20,
    sprayPattern: "circle",
    icon: CloudDrizzle,
  },
]

// Simplified friction loss data for PVC Schedule 40 Pipe
// PSI Loss per 100 feet
export const DEFAULT_PIPE_FRICTION_DATA: PipeFrictionLossData[] = [
  {
    pipeSize: "0.75in PVC Sch 40",
    data: [
      { gpm: 2, psiLossPer100ft: 1.1 },
      { gpm: 3, psiLossPer100ft: 2.3 },
      { gpm: 4, psiLossPer100ft: 3.9 },
      { gpm: 5, psiLossPer100ft: 5.9 },
      { gpm: 6, psiLossPer100ft: 8.3 },
      { gpm: 7, psiLossPer100ft: 11.0 },
      { gpm: 8, psiLossPer100ft: 14.2 },
    ],
  },
  {
    pipeSize: "1in PVC Sch 40",
    data: [
      { gpm: 5, psiLossPer100ft: 2.1 },
      { gpm: 6, psiLossPer100ft: 2.9 },
      { gpm: 7, psiLossPer100ft: 3.9 },
      { gpm: 8, psiLossPer100ft: 5.0 },
      { gpm: 9, psiLossPer100ft: 6.2 },
      { gpm: 10, psiLossPer100ft: 7.5 },
      { gpm: 12, psiLossPer100ft: 10.5 },
      { gpm: 14, psiLossPer100ft: 14.0 },
    ],
  },
  {
    pipeSize: "1.25in PVC Sch 40",
    data: [
      { gpm: 10, psiLossPer100ft: 2.8 },
      { gpm: 12, psiLossPer100ft: 3.9 },
      { gpm: 14, psiLossPer100ft: 5.2 },
      { gpm: 16, psiLossPer100ft: 6.7 },
      { gpm: 18, psiLossPer100ft: 8.3 },
      { gpm: 20, psiLossPer100ft: 10.1 },
    ],
  },
  {
    pipeSize: "1.5in PVC Sch 40",
    data: [
      { gpm: 15, psiLossPer100ft: 2.8 },
      { gpm: 20, psiLossPer100ft: 4.8 },
      { gpm: 25, psiLossPer100ft: 7.2 },
      { gpm: 30, psiLossPer100ft: 10.1 },
      { gpm: 35, psiLossPer100ft: 13.5 },
    ],
  },
  {
    pipeSize: "2in PVC Sch 40",
    data: [
      { gpm: 25, psiLossPer100ft: 2.5 },
      { gpm: 30, psiLossPer100ft: 3.5 },
      { gpm: 35, psiLossPer100ft: 4.7 },
      { gpm: 40, psiLossPer100ft: 6.0 },
      { gpm: 50, psiLossPer100ft: 9.0 },
    ],
  },
]

export const COMMON_PIPE_SIZES = DEFAULT_PIPE_FRICTION_DATA.map((p) => p.pipeSize)

export const SUN_EXPOSURE_OPTIONS = [
  { id: "full-sun", name: "Full Sun (6+ hrs direct sun)", icon: Sun },
  { id: "partial-sun", name: "Partial Sun (4-6 hrs direct sun)", icon: CloudSun },
  { id: "partial-shade", name: "Partial Shade (2-4 hrs direct sun)", icon: CloudSun }, // Could use a different icon if available
  { id: "full-shade", name: "Full Shade (<2 hrs direct sun)", icon: Leaf }, // Or Cloud
]

export const DUMMY_RESULTS_DATA = {
  zones: [
    {
      id: "zone1",
      name: "Front Lawn",
      itemIds: ["head1", "head2"],
      totalGPM: 5,
      pressureRequiredPSI: 30,
      calculatedPressureAtZonePSI: 45,
      suggestedRunTimeMinutes: 20,
      plantTypes: ["Lawn / Turf"],
      color: "rgba(75, 192, 192, 0.5)",
    },
    {
      id: "zone2",
      name: "Flower Bed East",
      itemIds: ["drip1"],
      totalGPM: 1,
      pressureRequiredPSI: 20,
      calculatedPressureAtZonePSI: 48,
      suggestedRunTimeMinutes: 45,
      plantTypes: ["Flowers / Perennials"],
      color: "rgba(255, 99, 132, 0.5)",
    },
  ],
  totalSystemGPM: 6, // Example, sum of concurrent zones or max zone
  totalWaterUsageWeekly: 1200, // Gallons
  materialList: [
    { id: "spray-adj-15ft", name: "Pop-up Spray (15ft Adj.)", quantity: 2, unit: "pcs" },
    { id: "drip-emitter-1gph", name: "Drip Emitter (1 GPH)", quantity: 1, unit: "pcs" },
    { id: "pipe-1in", name: "1in PVC Pipe", quantity: 150, unit: "ft" },
    { id: "valve-1in", name: "1in Zone Valve", quantity: 2, unit: "pcs" },
  ],
  estimatedTotalCost: 250.75,
  warnings: [
    "Warning: Zone 'Front Lawn' has plants with mixed water needs (placeholder).",
    "Warning: Potential runoff in 'Flower Bed East' due to soil type and run time. Consider cycle & soak.",
  ],
}
