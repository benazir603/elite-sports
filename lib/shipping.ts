export type ShippingZone = 'local' | 'tamilnadu' | 'south' | 'north'

const RATES: Record<ShippingZone, { base: number; addlPer500g: number; perKgAbove3kg: number }> = {
  local:     { base: 30,  addlPer500g: 20, perKgAbove3kg: 30 },
  tamilnadu: { base: 50,  addlPer500g: 20, perKgAbove3kg: 40 },
  south:     { base: 60,  addlPer500g: 30, perKgAbove3kg: 50 },
  north:     { base: 150, addlPer500g: 80, perKgAbove3kg: 160 },
}

export const ZONE_LABELS: Record<ShippingZone, string> = {
  local: 'Local (Chennai)',
  tamilnadu: 'Tamil Nadu',
  south: 'South India',
  north: 'North India',
}

const GST_MULTIPLIER = 1.18
const DEFAULT_ITEM_WEIGHT_KG = 1
const SOUTH_STATES = ['kerala', 'andhra pradesh', 'karnataka', 'telangana', 'puducherry', 'pondicherry']

export function getShippingZone(state: string, postcode: string): ShippingZone {
  if (/^600\d{3}$/.test(postcode.trim())) return 'local'
  const s = state.trim().toLowerCase()
  if (s === 'tamil nadu' || s === 'tamilnadu' || s === 'tn') return 'tamilnadu'
  if (SOUTH_STATES.includes(s)) return 'south'
  return 'north'
}

export function calculateShipping(weightKg: number, zone: ShippingZone): number {
  const grams = Math.max(1, weightKg * 1000)
  const { base, addlPer500g, perKgAbove3kg } = RATES[zone]
  let amount = base
  if (grams > 500) {
    amount += addlPer500g * Math.ceil((Math.min(grams, 3000) - 500) / 500)
    if (grams > 3000) {
      amount += perKgAbove3kg * Math.ceil((grams - 3000) / 1000)
    }
  }
  return Math.round(amount * GST_MULTIPLIER)
}

export function itemWeightKg(productWeight: string | number | null | undefined): number {
  const weight = Number(productWeight)
  return Number.isFinite(weight) && weight > 0 ? weight : DEFAULT_ITEM_WEIGHT_KG
}
