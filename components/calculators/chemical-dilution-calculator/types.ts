export type ConcentrationUnit = "%" | "ratio" | "ppm"

export type VolumeUnit =
  | "ml"
  | "l"
  | "us_oz"
  | "us_cup"
  | "us_pint"
  | "us_quart"
  | "us_gallon"
  | "imp_oz"
  | "imp_pint"
  | "imp_quart"
  | "imp_gallon"

export type KnownVolumeType = "concentrate" | "finalSolution"

export interface DilutionInput {
  stockConcentration: number // as decimal, e.g., 0.1 for 10%
  targetConcentration: number // as decimal
  knownVolume: number // in mL
  knownVolumeType: KnownVolumeType
}

export interface DilutionResult {
  concentrateVolumeMl: number
  diluentVolumeMl: number
  totalVolumeMl: number
  finalConcentrationDecimal: number // Actual final concentration achieved
}
