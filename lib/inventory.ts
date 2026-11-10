import { getOrders, getProductById, getProductVariation, getProductVariations, updateOrder, type WooCommerceOrder } from './woocommerce'
import { getRazorpayOrder } from './razorpay'
import { resolveStock, stockKey, type StockInfo, type StockLine } from './stock'

/** How long an unpaid reservation (on-hold order) is kept before its stock is released. */
export const RESERVATION_MINUTES = 60

/** Reads live (uncached) stock for one product or variation straight from WooCommerce. */
export async function fetchStock(productId: number, variationId?: number): Promise<StockInfo> {
  const product = await getProductById(productId, true)
  if (variationId) {
    if (!product.variations?.includes(variationId)) {
      return { productId, variationId, name: product.name, price: 0, available: 0, purchasable: false }
    }
    return resolveStock(product, await getProductVariation(productId, variationId))
  }
  // Variable product without a chosen variation: resolve to the first
  // purchasable in-stock variation so grids can offer a plain "Add to Cart".
  if (product.type === 'variable') {
    const variations = await getProductVariations(productId)
    const fallback = variations.find(
      (variation) => variation.status === 'publish' && variation.purchasable && variation.stock_status === 'instock'
    )
    if (fallback) return resolveStock(product, fallback)
  }
  return resolveStock(product, null)
}

export async function fetchStockMap(lines: Pick<StockLine, 'productId' | 'variationId'>[]) {
  const unique = new Map(lines.map((line) => [stockKey(line), line]))
  const entries = await Promise.all(
    [...unique.values()].map(async (line) => [stockKey(line), await fetchStock(line.productId, line.variationId)] as const)
  )
  return new Map<string, StockInfo>(entries)
}

export function getOrderMeta(order: Pick<WooCommerceOrder, 'meta_data'>, key: string) {
  return order.meta_data?.find((item) => item.key === key)?.value
}

/** True when the order is one of our unpaid Razorpay reservations that can safely be released. */
export async function isReleasableReservation(order: WooCommerceOrder) {
  if (order.status !== 'on-hold' || !getOrderMeta(order, '_elite_payment_owner') || getOrderMeta(order, '_razorpay_payment_id')) {
    return false
  }
  const razorpayOrderId = getOrderMeta(order, '_razorpay_order_id')
  if (!razorpayOrderId) return true
  const razorpayOrder = await getRazorpayOrder(razorpayOrderId)
  return !razorpayOrder.amount_paid
}

/** Cancels the order, which makes WooCommerce restore its reserved stock. */
export async function releaseReservation(orderId: number) {
  await updateOrder(orderId, { status: 'cancelled' })
}

/**
 * Cancels abandoned reservations older than RESERVATION_MINUTES so their stock
 * becomes available again. Best-effort: failures are logged, never thrown.
 */
export async function releaseStaleReservations() {
  try {
    const before = new Date(Date.now() - RESERVATION_MINUTES * 60_000).toISOString()
    const stale = await getOrders({ status: 'on-hold', before, per_page: 25 })
    for (const order of stale) {
      if (await isReleasableReservation(order)) {
        await releaseReservation(order.id)
      }
    }
  } catch (error) {
    console.error('Could not release stale stock reservations:', error)
  }
}
