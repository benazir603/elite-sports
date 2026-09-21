import { NextResponse } from 'next/server'
import { getProductById } from '@/lib/woocommerce'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await getProductById(Number(id))
    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch product' }, { status: 500 })
  }
}
