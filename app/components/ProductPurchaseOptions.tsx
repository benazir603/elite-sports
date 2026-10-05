'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { WooCommerceAttribute, WooCommerceVariation } from '@/lib/woocommerce'
import { trackEvent } from '@/lib/analytics'
import { useCart } from './CartProvider'

interface ProductPurchaseOptionsProps {
  product: {
    id: number
    name: string
    brand: string
    price: number
    regularPrice: number
    image: string
    inStock: boolean
    stockQuantity: number | null
  }
  attributes: WooCommerceAttribute[]
  variations: WooCommerceVariation[]
}

function formatMoney(amount: number) {
  return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function attributeKey(attribute: { id: number; name: string }) {
  return attribute.id ? String(attribute.id) : attribute.name.toLowerCase()
}

const colourValues: Record<string, string> = {
  black: '#000000',
  blue: '#2563eb',
  brown: '#92400e',
  gold: '#d4af37',
  gray: '#6b7280',
  green: '#16a34a',
  grey: '#6b7280',
  navy: '#172554',
  'navy blue': '#172554',
  orange: '#f97316',
  pink: '#ec4899',
  purple: '#9333ea',
  red: '#dc2626',
  silver: '#c0c0c0',
  white: '#ffffff',
  yellow: '#facc15',
}

function isColourAttribute(attribute: WooCommerceAttribute) {
  const name = attribute.name.toLowerCase()
  return name === 'color' || name === 'colour'
}

function isSizeAttribute(attribute: WooCommerceAttribute) {
  return attribute.name.toLowerCase().includes('size')
}

function colourValue(option: string) {
  return colourValues[option.trim().toLowerCase()] || option.trim().toLowerCase()
}

export default function ProductPurchaseOptions({ product, attributes, variations }: ProductPurchaseOptionsProps) {
  const { addToCart } = useCart()
  const router = useRouter()
  const variationAttributes = attributes.filter((attribute) => attribute.variation)
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [mainCtaVisible, setMainCtaVisible] = useState(true)
  const mainCtaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = mainCtaRef.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => setMainCtaVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const selectedVariation = useMemo(() => {
    if (variationAttributes.length === 0) return undefined
    if (variationAttributes.some((attribute) => !selections[attributeKey(attribute)])) return undefined
    return variations.find((variation) =>
      variation.attributes.every((attribute) => {
        const selected = selections[attributeKey(attribute)]
        return !attribute.option || selected?.toLowerCase() === attribute.option.toLowerCase()
      })
    )
  }, [selections, variationAttributes, variations])

  const price = selectedVariation ? Number(selectedVariation.price) : product.price
  const regularPrice = selectedVariation ? Number(selectedVariation.regular_price) || price : product.regularPrice
  const inStock = selectedVariation
    ? selectedVariation.purchasable && selectedVariation.status === 'publish' && selectedVariation.stock_status === 'instock'
    : variationAttributes.length === 0 && product.inStock
  const stockQuantity = selectedVariation ? selectedVariation.stock_quantity : product.stockQuantity
  const image = selectedVariation?.image?.src || product.image
  const discount = regularPrice > price ? regularPrice - price : 0
  const discountPercent = regularPrice > 0 ? Math.round((discount / regularPrice) * 100) : 0
  const needsSelection = variationAttributes.length > 0 && !selectedVariation

  function optionAvailable(attribute: WooCommerceAttribute, option: string) {
    const nextSelections = { ...selections, [attributeKey(attribute)]: option }
    return variations.some((variation) => {
      if (!variation.purchasable || variation.status !== 'publish' || variation.stock_status !== 'instock') return false
      return variation.attributes.every((variationAttribute) => {
        const selected = nextSelections[attributeKey(variationAttribute)]
        return !selected || !variationAttribute.option || selected.toLowerCase() === variationAttribute.option.toLowerCase()
      })
    })
  }

  function selectedCartItem() {
    if (needsSelection || !inStock || !Number.isFinite(price) || price <= 0) return null
    const variation = variationAttributes.reduce<Record<string, string>>((values, attribute) => {
      values[attribute.name] = selections[attributeKey(attribute)]
      return values
    }, {})
    return {
      id: product.id,
      variationId: selectedVariation?.id,
      variation: selectedVariation ? variation : undefined,
      name: product.name,
      brand: product.brand,
      price,
      image,
    }
  }

  function purchase(buyNow: boolean) {
    const item = selectedCartItem()
    if (!item) return
    addToCart(item)
    if (buyNow) {
      trackEvent('begin_checkout', { value: item.price, currency: 'INR' })
      router.push('/checkout')
    }
  }

  const selectionSummary = variationAttributes
    .map((attribute) => selections[attributeKey(attribute)])
    .filter(Boolean)
    .join(' / ')

  return (
    <>
      <div className="border-b border-gray-200 pb-4 mb-4">
        {discount > 0 && <p className="text-sm text-gray-500 mb-1">M.R.P.: <span className="line-through">{formatMoney(regularPrice)}</span></p>}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900">{formatMoney(price)}</span>
          {discount > 0 && <span className="text-sm font-medium text-green-700">Save {formatMoney(discount)} ({discountPercent}%)</span>}
        </div>
      </div>

      {variationAttributes.map((attribute) => (
        <fieldset key={attributeKey(attribute)} className="mb-5">
          <legend className="w-full flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-900">Select {attribute.name}</span>
            {isSizeAttribute(attribute) && (
              <Link href="/size-guide" className="text-xs font-semibold text-red-600 hover:underline">
                Size guide
              </Link>
            )}
          </legend>
          <div className="flex flex-wrap gap-2">
            {attribute.options.map((option) => {
              const selected = selections[attributeKey(attribute)] === option
              const available = optionAvailable(attribute, option)
              const colour = isColourAttribute(attribute)
              return (
                <button
                  key={option}
                  type="button"
                  disabled={!available}
                  aria-pressed={selected}
                  aria-label={`${attribute.name}: ${option}${available ? '' : ' (unavailable)'}`}
                  title={option}
                  onClick={() => setSelections((current) => ({ ...current, [attributeKey(attribute)]: option }))}
                  className={colour
                    ? `flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${selected ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-200' : 'border-gray-300 bg-white text-gray-800 hover:border-red-500'} disabled:cursor-not-allowed disabled:opacity-40`
                    : `rounded-lg border px-4 py-2 text-sm font-medium transition ${selected ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-300 bg-white text-gray-800 hover:border-red-500'} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {colour && (
                    <span
                      aria-hidden="true"
                      className="h-6 w-6 rounded-full border border-gray-300 shadow-sm"
                      style={{ backgroundColor: colourValue(option) }}
                    />
                  )}
                  {!colour && <span className={available ? '' : 'line-through'}>{option}</span>}
                  {!colour && !available && <span className="sr-only">Out of stock</span>}
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}

      {selectedVariation?.image?.src && selectedVariation.image.src !== product.image && (
        <img src={selectedVariation.image.src} alt={`${product.name} selected variation`} className="mb-4 h-28 w-28 rounded-lg border border-gray-200 object-contain" />
      )}

      <div className="text-sm mb-6">
        {needsSelection ? (
          <span className="text-amber-700 font-semibold">Select all options to check availability</span>
        ) : inStock ? (
          <span className="text-green-600 font-semibold">In stock</span>
        ) : (
          <span className="text-red-600 font-semibold">Out of stock</span>
        )}
        {!needsSelection && stockQuantity !== null && <span className="text-gray-500 ml-2">({stockQuantity} units available)</span>}
      </div>

      <div ref={mainCtaRef} className="flex flex-col sm:flex-row gap-3 mb-8 w-full">
        <button type="button" disabled={needsSelection || !inStock} onClick={() => purchase(false)} className="w-full sm:flex-1 bg-black hover:bg-red-600 text-white font-medium text-center py-2.5 px-6 rounded-full shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50">
          Add to Cart
        </button>
        <button type="button" disabled={needsSelection || !inStock} onClick={() => purchase(true)} className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white font-medium text-center py-2.5 px-6 rounded-full shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50">
          Buy Now
        </button>
      </div>

      {/* Sticky mobile add-to-cart bar */}
      {!mainCtaVisible && (
        <div className="fixed inset-x-0 bottom-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.12)] pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="font-bold text-gray-900 leading-tight">{formatMoney(price)}</p>
              <p className="text-xs text-gray-500 truncate">
                {needsSelection ? 'Select options' : selectionSummary || (inStock ? 'In stock' : 'Out of stock')}
              </p>
            </div>
            <button
              type="button"
              disabled={needsSelection || !inStock}
              onClick={() => (needsSelection ? undefined : purchase(false))}
              className="flex-shrink-0 bg-black hover:bg-red-600 text-white text-sm font-bold uppercase tracking-wide py-2.5 px-6 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {needsSelection ? 'Select Size' : 'Add to Cart'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
