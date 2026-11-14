export type ShippingZone = 'local' | 'tamilnadu' | 'south' | 'north'

export const ZONE_LABELS: Record<ShippingZone, string> = {
  local: 'Local (Chennai)',
  tamilnadu: 'Tamil Nadu',
  south: 'South India',
  north: 'North India',
}

const DEFAULT_ITEM_WEIGHT_KG = 1
const SOUTH_STATES = ['kerala', 'andhra pradesh', 'karnataka', 'telangana', 'puducherry', 'pondicherry']

export function getShippingZone(state: string, postcode: string): ShippingZone {
  if (/^600\d{3}$/.test(postcode.trim())) return 'local'
  const s = state.trim().toLowerCase()
  if (s === 'tamil nadu' || s === 'tamilnadu' || s === 'tn') return 'tamilnadu'
  if (SOUTH_STATES.includes(s)) return 'south'
  return 'north'
}

export const COURIER_CHARGE = 60
export const PACKAGING_CHARGE = 50
export const FLAT_SHIPPING_TOTAL = COURIER_CHARGE + PACKAGING_CHARGE

/** Flat delivery charge: courier ₹60 + packaging ₹50 = ₹110. */
export function calculateShipping(): { courier: number; packaging: number; total: number } {
  return { courier: COURIER_CHARGE, packaging: PACKAGING_CHARGE, total: FLAT_SHIPPING_TOTAL }
}

export function itemWeightKg(productWeight: string | number | null | undefined): number {
  const weight = Number(productWeight)
  return Number.isFinite(weight) && weight > 0 ? weight : DEFAULT_ITEM_WEIGHT_KG
}
