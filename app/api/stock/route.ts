import { NextRequest, NextResponse } from 'next/server'
import { fetchStockMap } from '@/lib/inventory'
import { maxPurchasable, stockKey, stockMessage, type StockLine } from '@/lib/stock'

const MAX_ITEMS = 50

function parseItems(value: unknown): Pick<StockLine, 'productId' | 'variationId'>[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_ITEMS) return null
  const items: Pick<StockLine, 'productId' | 'variationId'>[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') return null
    const input = item as Record<string, unknown>
    const productId = Number(input.id)
    const variationId = input.variationId ? Number(input.variationId) : undefined
    if (!Number.isSafeInteger(productId) || productId <= 0) return null
    if (variationId !== undefined && (!Number.isSafeInteger(variationId) || variationId <= 0)) return null
    items.push({ productId, variationId })
  }
  return items
}

/** Live stock for cart items, read directly from WooCommerce (never cached). */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const items = parseItems(body.items)
    if (!items) return NextResponse.json({ error: 'Invalid items' }, { status: 400 })

    const stock = await fetchStockMap(items)
    return NextResponse.json({
      items: [...stock.values()].map((info) => {
        const max = maxPurchasable(info)
        return {
          key: stockKey(info),
          name: info.name,
          price: info.price,
          available: info.available,
          max,
          purchasable: info.purchasable,
          variationId: info.variationId,
          variation: info.variationAttributes,
          message: max === 0 ? stockMessage(0) : undefined,
        }
      }),
    })
  } catch (error) {
    console.error('[API /stock] error:', error)
    return NextResponse.json({ error: 'Could not check stock' }, { status: 502 })
  }
}
