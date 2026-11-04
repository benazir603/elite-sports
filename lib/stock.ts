import type { WooCommerceProduct, WooCommerceVariation } from './woocommerce'

/** Hard cap per line regardless of stock, to keep orders sane. */
export const MAX_ORDER_QUANTITY = 20

export interface StockInfo {
  productId: number
  variationId?: number
  name: string
  price: number
  /** `null` means WooCommerce is not tracking a quantity for this item (sold while "In stock"). */
  available: number | null
  purchasable: boolean
}

export interface StockLine {
  productId: number
  variationId?: number
  quantity: number
}

export interface StockIssue {
  key: string
  name: string
  requested: number
  available: number
  message: string
}

export function stockKey(item: { productId: number; variationId?: number }) {
  return `${item.productId}:${item.variationId || 0}`
}

export function stockMessage(available: number) {
  if (available <= 0) return 'Out of stock'
  return `Only ${available} ${available === 1 ? 'item is' : 'items are'} available in stock.`
}

type ProductStock = Pick<WooCommerceProduct, 'id' | 'name' | 'type' | 'status' | 'price' | 'stock_status' | 'stock_quantity'>
type VariationStock = Pick<WooCommerceVariation, 'id' | 'status' | 'purchasable' | 'price' | 'stock_status' | 'stock_quantity'>

/** Derives purchasability and available quantity from WooCommerce product/variation data. */
export function resolveStock(product: ProductStock, variation: VariationStock | null): StockInfo {
  const price = Number(variation?.price ?? product.price)
  const stockStatus = variation?.stock_status ?? product.stock_status
  const purchasable =
    product.status === 'publish' &&
    stockStatus === 'instock' &&
    (!variation || (variation.status === 'publish' && variation.purchasable)) &&
    (product.type !== 'variable' || Boolean(variation)) &&
    Number.isFinite(price) &&
    price > 0

  const quantity = variation?.stock_quantity ?? product.stock_quantity
  const available = !purchasable ? 0 : quantity === null || quantity === undefined ? null : Math.max(0, quantity)

  return {
    productId: product.id,
    variationId: variation?.id,
    name: product.name,
    price,
    available,
    purchasable,
  }
}

/** Maximum quantity a customer may hold in the cart for this item. */
export function maxPurchasable(info: Pick<StockInfo, 'available' | 'purchasable'>) {
  if (!info.purchasable) return 0
  return info.available === null ? MAX_ORDER_QUANTITY : Math.min(info.available, MAX_ORDER_QUANTITY)
}

/** Validates requested quantities against stock. Returns one issue per failing line. */
export function findStockIssues(
  lines: StockLine[],
  stock: Map<string, StockInfo>
): StockIssue[] {
  const issues: StockIssue[] = []
  for (const line of lines) {
    const key = stockKey(line)
    const info = stock.get(key)
    if (!info) {
      issues.push({ key, name: 'Item', requested: line.quantity, available: 0, message: 'This item is no longer available.' })
      continue
    }
    const max = maxPurchasable(info)
    if (line.quantity > max) {
      issues.push({ key, name: info.name, requested: line.quantity, available: max, message: stockMessage(max) })
    }
  }
  return issues
}

/** Clamps a cart quantity change to [0, max]. `max === null` means untracked stock. */
export function clampQuantity(current: number, change: number, max: number | null) {
  const next = current + change
  const ceiling = max === null ? MAX_ORDER_QUANTITY : max
  return Math.max(0, Math.min(next, ceiling))
}
