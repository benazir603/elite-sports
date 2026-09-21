import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'
import AddToCartButton from '@/app/components/AddToCartButton'
import BuyNowButton from '@/app/components/BuyNowButton'
import ProductImageGallery from '@/app/components/ProductImageGallery'
import { getProductById } from '@/lib/woocommerce'

function formatMoney(amount: number) {
  return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProductById(Number(id))

  if (!product) {
    notFound()
  }

  const images = product.images.map((img) => img.src)
  const image = images[0] || `https://placehold.co/600x600/f5f5f5/333333.png?text=${encodeURIComponent(product.name)}`
  const brand = product.categories[0]?.name || 'Elite'
  const price = Number(product.price) || Number(product.regular_price) || 0
  const regularPrice = Number(product.regular_price) || price
  const inStock = product.stock_status === 'instock'
  const discount = regularPrice > price ? regularPrice - price : 0
  const discountPercent = regularPrice > 0 ? Math.round((discount / regularPrice) * 100) : 0

  const cartItem = {
    id: product.id,
    name: product.name,
    brand,
    price,
    image,
  }

  const bullets = product.short_description
    ? product.short_description
        .replace(/<[^>]+>/g, '')
        .split('.')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : []

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 lg:col-span-5">
              <div className="h-[50vh] md:h-[60vh] max-h-[500px]">
                <ProductImageGallery images={images} alt={product.name} />
              </div>
            </div>

            <div className="md:col-span-7 lg:col-span-7">
              <h1 className="text-2xl md:text-3xl font-medium text-gray-900 mb-2">{product.name}</h1>
              <p className="text-sm text-gray-500 mb-4">
                Brand: <span className="text-red-600 capitalize">{brand}</span>
              </p>

              {product.sku && <p className="text-xs text-gray-400 mb-4">SKU: {product.sku}</p>}

              <div className="border-b border-gray-200 pb-4 mb-4">
                {discount > 0 && (
                  <p className="text-sm text-gray-500 mb-1">
                    M.R.P.: <span className="line-through">{formatMoney(regularPrice)}</span>
                  </p>
                )}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900">{formatMoney(price)}</span>
                  {discount > 0 && (
                    <span className="text-sm font-medium text-green-700">Save {formatMoney(discount)} ({discountPercent}%)</span>
                  )}
                </div>
              </div>

              <div className="text-sm mb-6">
                {inStock ? (
                  <span className="text-green-600 font-semibold">In stock</span>
                ) : (
                  <span className="text-red-600 font-semibold">Out of stock</span>
                )}
                {product.stock_quantity !== null && product.stock_quantity !== undefined && (
                  <span className="text-gray-500 ml-2">({product.stock_quantity} units available)</span>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="font-bold text-gray-900 mb-1">FREE Delivery</p>
                <p className="text-sm text-gray-600 mb-2">Order within 2 hours. Eligible for free shipping.</p>
                <p className="text-sm text-gray-600">Sold by <span className="font-medium text-gray-900">Elite Sports</span></p>
                <p className="text-sm text-gray-500 mt-2">7-day easy returns. Secure transaction.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-8 w-full">
                <AddToCartButton
                  product={cartItem}
                  className="w-full sm:flex-1 bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium text-center py-2.5 px-6 rounded shadow-sm border border-[#FCD200]"
                />
                <BuyNowButton
                  product={cartItem}
                  className="w-full sm:flex-1 bg-[#FFA41C] hover:bg-[#FA8900] text-gray-900 font-medium text-center py-2.5 px-6 rounded shadow-sm border border-[#FF8F00]"
                />
              </div>

              {bullets.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">About this item</h2>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1.5">
                    {bullets.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t pt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Product information</h2>
                <table className="w-full text-sm text-left text-gray-600">
                  <tbody>
                    {product.sku && (
                      <tr className="border-b">
                        <th className="py-2 pr-4 font-medium text-gray-900 w-40">SKU</th>
                        <td className="py-2">{product.sku}</td>
                      </tr>
                    )}
                    <tr className="border-b">
                      <th className="py-2 pr-4 font-medium text-gray-900 w-40">Stock Status</th>
                      <td className="py-2">{inStock ? 'In stock' : 'Out of stock'}</td>
                    </tr>
                    {product.weight && (
                      <tr className="border-b">
                        <th className="py-2 pr-4 font-medium text-gray-900 w-40">Weight</th>
                        <td className="py-2">{product.weight} kg</td>
                      </tr>
                    )}
                    {product.dimensions?.length && (
                      <tr className="border-b">
                        <th className="py-2 pr-4 font-medium text-gray-900 w-40">Dimensions</th>
                        <td className="py-2">
                          {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} cm
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {product.description && (
                <div className="mt-8 border-t pt-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Product details</h2>
                  <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
