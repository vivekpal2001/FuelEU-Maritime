export interface ComplianceResult {
  shipId: string
  year: number
  cbGco2eq: number
  energyInScope: number
  targetIntensity: number
  actualIntensity: number
}

export interface AdjustedComplianceResult extends ComplianceResult {
  bankedAmount: number
  appliedAmount: number
  adjustedCbGco2eq: number
}
