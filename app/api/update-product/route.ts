import { NextResponse } from 'next/server'
import { getProducts, updateProduct } from '@/lib/woocommerce'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, name, short_description, description, ...rest } = body

    let productId: number | undefined

    if (id) {
      productId = Number(id)
    } else if (name) {
      const products = await getProducts({ per_page: 100, search: name })
      const found = products.find((p) => p.name === name)
      if (!found) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      productId = found.id
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product id or name required' }, { status: 400 })
    }

    const payload: Record<string, unknown> = { ...rest }
    if (short_description !== undefined) payload.short_description = short_description
    if (description !== undefined) payload.description = description

    const updated = await updateProduct(productId, payload)
    return NextResponse.json({ success: true, product: { id: updated.id, name: updated.name } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
