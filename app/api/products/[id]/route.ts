import { NextResponse } from 'next/server'
import { getProductById } from '@/lib/woocommerce'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getProductById(Number(params.id))
    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch product' }, { status: 500 })
  }
}
