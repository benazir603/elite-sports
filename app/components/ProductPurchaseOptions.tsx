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
  colourOptions?: string[]
  galleryImages?: string[]
}

function formatMoney(amount: number) {
  return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function attributeKey(attribute: { id: number; name: string }) {
  return attribute.id ? String(attribute.id) : attribute.name.toLowerCase()
}

function isColourAttribute(attribute: WooCommerceAttribute) {
  const name = attribute.name.toLowerCase()
  return name === 'color' || name === 'colour'
}

function isSizeAttribute(attribute: WooCommerceAttribute) {
  return attribute.name.toLowerCase().includes('size')
}

function searchableWords(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((word) => word.length > 2)
}

export default function ProductPurchaseOptions({ product, attributes, variations, colourOptions, galleryImages = [] }: ProductPurchaseOptionsProps) {
  const { addToCart } = useCart()
  const router = useRouter()
  const variationAttributes = attributes.filter((attribute) => attribute.variation)
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const colourAttribute = variationAttributes.find(isColourAttribute)
    if (!colourAttribute) return {}
    const firstAvailable = variations.find(
      (variation) => variation.purchasable && variation.status === 'publish' && variation.stock_status === 'instock'
    )
    const colour = firstAvailable?.attributes.find((attribute) => /colou?r/i.test(attribute.name))?.option
    return colour ? { [attributeKey(colourAttribute)]: colour } : {}
  })
  const [fulfilment, setFulfilment] = useState<'delivery' | 'pickup'>('delivery')
  const fulfilmentHydrated = useRef(false)

  useEffect(() => {
    if (!fulfilmentHydrated.current) {
      fulfilmentHydrated.current = true
      if (window.localStorage.getItem('elite-fulfilment') === 'pickup') {
        const frame = window.requestAnimationFrame(() => setFulfilment('pickup'))
        return () => window.cancelAnimationFrame(frame)
      }
    }
    window.localStorage.setItem('elite-fulfilment', fulfilment)
  }, [fulfilment])
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

  const previewVariation = useMemo(() => {
    const selectedEntries = Object.entries(selections).filter(([, value]) => Boolean(value))
    if (selectedEntries.length === 0) return undefined
    return selectedVariation || variations.find((variation) =>
      variation.attributes.every((attribute) => {
        const selected = selections[attributeKey(attribute)]
        return !selected || !attribute.option || selected.toLowerCase() === attribute.option.toLowerCase()
      })
    )
  }, [selectedVariation, selections, variations])

  const previewImages = useMemo(() => {
    const primary = previewVariation?.image?.src
    if (!previewVariation || !primary) return []
    const colour = previewVariation.attributes.find((attribute) => /colou?r/i.test(attribute.name))?.option
    if (!colour) return [primary]

    const selectedWords = searchableWords(colour)
    const otherOnlyWords = variationAttributes
      .find(isColourAttribute)?.options
      .filter((option) => option !== colour)
      .flatMap(searchableWords)
      .filter((word) => !selectedWords.includes(word)) || []
    const matchingGallery = galleryImages.filter((src) => {
      const file = decodeURIComponent(src.split('/').pop() || '').toLowerCase()
      return selectedWords.some((word) => file.includes(word)) && !otherOnlyWords.some((word) => file.includes(word))
    })
    return Array.from(new Set([primary, ...matchingGallery]))
  }, [galleryImages, previewVariation, variationAttributes])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('elite:variation-images', {
      detail: previewImages,
    }))
  }, [previewImages])

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

      {colourOptions && colourOptions.length > 0 && (
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-900">
            Colour: <span className="font-normal">{colourOptions.join(', ')}</span>
          </p>
        </div>
      )}

      {variationAttributes.map((attribute) => (
        <fieldset key={attributeKey(attribute)} className="mb-5">
          <legend className="w-full flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-900">
              {isColourAttribute(attribute)
                ? `Colour: ${selections[attributeKey(attribute)] || 'Select colour'}`
                : `Select ${attribute.name}`}
            </span>
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
              const optionImage = colour
                ? variations.find((variation) =>
                    variation.attributes.some((variationAttribute) =>
                      /colou?r/i.test(variationAttribute.name) && variationAttribute.option.toLowerCase() === option.toLowerCase()
                    ) && variation.image?.src
                  )?.image?.src
                : undefined
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
                    ? `h-16 w-16 overflow-hidden rounded-lg border-2 bg-white p-1 transition ${selected ? 'border-red-600 ring-2 ring-red-100' : 'border-gray-200 hover:border-red-500'} disabled:cursor-not-allowed disabled:opacity-40`
                    : `rounded-lg border px-4 py-2 text-sm font-medium transition ${selected ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-300 bg-white text-gray-800 hover:border-red-500'} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {colour && optionImage ? (
                    <img src={optionImage} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <span className={available ? '' : 'line-through'}>{option}</span>
                  )}
                  {!available && <span className="sr-only">Out of stock</span>}
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}

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

      <div ref={mainCtaRef} className="flex flex-col sm:flex-row gap-3 mb-4 w-full">
        <button type="button" disabled={needsSelection || !inStock} onClick={() => purchase(false)} className="w-full sm:flex-1 bg-black hover:bg-red-600 text-white font-medium text-center py-2.5 px-6 rounded-full shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50">
          Add to Cart
        </button>
        <button type="button" disabled={needsSelection || !inStock} onClick={() => purchase(true)} className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white font-medium text-center py-2.5 px-6 rounded-full shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50">
          Buy Now
        </button>
      </div>

      {/* Delivery / pickup options */}
      <fieldset className="mb-8">
        <legend className="sr-only">Choose delivery method</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition ${fulfilment === 'delivery' ? 'border-red-600 bg-red-50 ring-1 ring-red-200' : 'border-gray-300 bg-white hover:border-red-500'}`}>
            <input
              type="radio"
              name="fulfilment"
              value="delivery"
              checked={fulfilment === 'delivery'}
              onChange={() => setFulfilment('delivery')}
              className="mt-0.5 accent-red-600"
            />
            <span>
              <span className="block text-sm font-semibold text-gray-900">Home Delivery</span>
              <span className="block text-xs text-gray-500 mt-0.5">Shipped across India</span>
            </span>
          </label>
          <label className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition ${fulfilment === 'pickup' ? 'border-red-600 bg-red-50 ring-1 ring-red-200' : 'border-gray-300 bg-white hover:border-red-500'}`}>
            <input
              type="radio"
              name="fulfilment"
              value="pickup"
              checked={fulfilment === 'pickup'}
              onChange={() => setFulfilment('pickup')}
              className="mt-0.5 accent-red-600"
            />
            <span>
              <span className="block text-sm font-semibold text-gray-900">Customer Pickup</span>
              <span className="block text-xs text-gray-500 mt-0.5">Collect from our Chennai store</span>
            </span>
          </label>
        </div>
      </fieldset>

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
