const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL
const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY
const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET

export interface WooCommerceAttribute {
  id: number
  name: string
  slug: string
  position: number
  visible: boolean
  variation: boolean
  options: string[]
}

export interface WooCommerceVariation {
  id: number
  status: string
  purchasable: boolean
  price: string
  regular_price: string
  sale_price: string
  stock_status: string
  stock_quantity: number | null
  image: { id: number; src: string; alt: string } | null
  attributes: { id: number; name: string; option: string }[]
}

export interface WooCommerceProduct {
  id: number
  name: string
  slug: string
  permalink: string
  sku: string
  type: string
  price: string
  regular_price: string
  sale_price: string
  status: string
  stock_status: string
  stock_quantity: number | null
  description: string
  short_description: string
  weight: string
  dimensions: { length: string; width: string; height: string }
  images: { id: number; src: string; alt: string }[]
  categories: { id: number; name: string; slug: string }[]
  attributes: WooCommerceAttribute[]
  variations: number[]
  brands?: { id: number; name: string }[]
}

export function getProductBrand(product: WooCommerceProduct): string | undefined {
  const taxonomyBrand = product.brands?.find((brand) => brand.name.trim())?.name.trim()
  if (taxonomyBrand) return taxonomyBrand

  const brandAttribute = product.attributes?.find((attribute) => {
    const name = attribute.name.trim().toLowerCase()
    const slug = attribute.slug?.trim().toLowerCase()
    return name === 'brand' || name === 'manufacturer' || slug === 'pa_brand' || slug === 'brand'
  })

  return brandAttribute?.options.find((option) => option.trim())?.trim() || undefined
}

function getAuthParams() {
  if (!WOOCOMMERCE_CONSUMER_KEY || !WOOCOMMERCE_CONSUMER_SECRET) {
    return ''
  }
  return `consumer_key=${encodeURIComponent(WOOCOMMERCE_CONSUMER_KEY)}&consumer_secret=${encodeURIComponent(WOOCOMMERCE_CONSUMER_SECRET)}`;
}

function buildUrl(endpoint: string, params?: Record<string, string | number | undefined>) {
  if (!WOOCOMMERCE_URL) {
    throw new Error('WOOCOMMERCE_URL is not set')
  }
  const baseUrl = WOOCOMMERCE_URL.replace(/\/$/, '')
  const url = new URL(`${baseUrl}/wp-json/wc/v3/${endpoint}`)
  if (WOOCOMMERCE_CONSUMER_KEY && WOOCOMMERCE_CONSUMER_SECRET) {
    url.searchParams.append('consumer_key', WOOCOMMERCE_CONSUMER_KEY)
    url.searchParams.append('consumer_secret', WOOCOMMERCE_CONSUMER_SECRET)
  }
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value))
      }
    })
  }
  return url.toString()
}

export async function getProducts(params?: Record<string, string | number | undefined>): Promise<WooCommerceProduct[]> {
  const url = buildUrl('products', { per_page: 100, ...params })
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) {
    throw new Error(`WooCommerce products fetch failed: ${res.status}`)
  }
  return res.json()
}

export async function getAllProducts(): Promise<WooCommerceProduct[]> {
  const products: WooCommerceProduct[] = []
  for (let page = 1; page <= 10; page += 1) {
    const batch = await getProducts({ per_page: 100, page })
    products.push(...batch)
    if (batch.length < 100) break
  }
  return products
}

export async function getProductById(id: number, fresh = false): Promise<WooCommerceProduct> {
  const url = buildUrl(`products/${id}`)
  const res = await fetch(url, fresh ? { cache: 'no-store' } : { next: { revalidate: 60 } })
  if (!res.ok) {
    throw new Error(`WooCommerce product fetch failed: ${res.status}`)
  }
  return res.json()
}

export async function getProductVariations(productId: number): Promise<WooCommerceVariation[]> {
  const url = buildUrl(`products/${productId}/variations`, { per_page: 100 })
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) {
    throw new Error(`WooCommerce variations fetch failed: ${res.status}`)
  }
  return res.json()
}

export async function getProductVariation(productId: number, variationId: number): Promise<WooCommerceVariation> {
  const url = buildUrl(`products/${productId}/variations/${variationId}`)
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`WooCommerce variation fetch failed: ${res.status}`)
  }
  return res.json()
}

export async function getProductsByCategorySlug(slug: string): Promise<WooCommerceProduct[]> {
  const products = await getProducts({ per_page: 100 })
  return products.filter((product) =>
    product.categories.some((category) => category.slug === slug)
  )
}

interface BillingShipping {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  state: string
  postcode: string
  country: string
  email?: string
  phone?: string
}

export interface WooCommerceOrderPayload {
  payment_method: string
  payment_method_title: string
  set_paid: boolean
  customer_id: number
  billing: BillingShipping
  shipping: BillingShipping
  line_items: { product_id: number; quantity: number; variation_id?: number; subtotal?: string; total?: string }[]
  meta_data?: { key: string; value: string }[]
}

export async function createOrder(payload: WooCommerceOrderPayload): Promise<{ id: number; order_key: string; status: string; total: string }> {
  const url = buildUrl('orders')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`WooCommerce create order failed: ${res.status}`)
  }
  return res.json()
}

export interface WooCommerceCategory {
  id: number
  name: string
  slug: string
  parent: number
  count?: number
}

export async function getCategories(
  params?: Record<string, string | number | undefined>
): Promise<WooCommerceCategory[]> {
  const url = buildUrl('products/categories', { per_page: 100, ...params })
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) {
    throw new Error(`WooCommerce categories fetch failed: ${res.status}`)
  }
  return res.json()
}

export async function createCategory(
  name: string,
  slug?: string,
  parent?: number
): Promise<{ id: number; name: string; slug: string }> {
  const url = buildUrl('products/categories')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      parent,
    }),
  })
  if (!res.ok) {
    throw new Error(`WooCommerce create category failed: ${res.status}`)
  }
  return res.json()
}

export async function updateCategory(
  id: number,
  payload: { name?: string; slug?: string; parent?: number }
): Promise<{ id: number; name: string }> {
  const url = buildUrl(`products/categories/${id}`)
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`WooCommerce update category failed: ${res.status}`)
  }
  return res.json()
}

export async function createProduct(payload: {
  name: string
  type: 'simple'
  regular_price: string
  categories?: { id: number }[]
  status: 'publish' | 'draft'
}): Promise<{ id: number; name: string }> {
  const url = buildUrl('products')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`WooCommerce create product failed: ${res.status}`)
  }
  return res.json()
}

export async function updateProduct(
  id: number,
  payload: Record<string, unknown>
): Promise<WooCommerceProduct> {
  const url = buildUrl(`products/${id}`)
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`WooCommerce update product failed: ${res.status} ${body}`)
  }
  return res.json()
}

export async function findCustomerByEmail(email: string): Promise<{ id: number; email: string; username?: string } | null> {
  const lowerEmail = email.toLowerCase()

  // Try direct email filter first
  try {
    const url = buildUrl('customers', { email: lowerEmail, per_page: 10 })
    const res = await fetch(url, { next: { revalidate: 0 } })
    if (res.ok) {
      const customers: { id: number; email: string; username?: string }[] = await res.json()
      const match = customers.find((c) => c.email.toLowerCase() === lowerEmail)
      if (match) return match
    }
  } catch {
    // ignore
  }

  // Fallback: search by email
  try {
    const url = buildUrl('customers', { search: lowerEmail, role: 'all', per_page: 10 })
    const res = await fetch(url, { next: { revalidate: 0 } })
    if (res.ok) {
      const customers: { id: number; email: string; username?: string }[] = await res.json()
      const match = customers.find((c) => c.email.toLowerCase() === lowerEmail)
      if (match) return match
    }
  } catch {
    // ignore
  }

  return null
}

export async function getCustomerById(id: number): Promise<{
  id: number
  email: string
  first_name: string
  last_name: string
  billing: BillingShipping
  shipping: BillingShipping
} | null> {
  const url = buildUrl(`customers/${id}`)
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error(`WooCommerce customer fetch failed: ${res.status}`)
  }
  return res.json()
}

export function sanitizeWooUsername(emailPrefix: string, suffix: string) {
  return `${emailPrefix}-${suffix}`
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createCustomer(payload: {
  email: string
  first_name: string
  last_name: string
  password: string
  username?: string
}): Promise<{ id: number; email: string }> {
  const url = buildUrl('customers')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, role: 'customer' }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`WooCommerce create customer failed: ${res.status} ${text}`)
  }
  return res.json()
}

export async function updateCustomer(
  customerId: number,
  payload: { billing?: Partial<BillingShipping>; shipping?: Partial<BillingShipping>; first_name?: string; last_name?: string }
): Promise<{ id: number; email: string }> {
  const url = buildUrl(`customers/${customerId}`)
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`WooCommerce update customer failed: ${res.status} ${text}`)
  }
  return res.json()
}

export async function updateCustomerPassword(customerId: number, password: string): Promise<{ id: number; email: string }> {
  const url = buildUrl(`customers/${customerId}`)
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`WooCommerce update customer failed: ${res.status} ${text}`)
  }
  return res.json()
}

export interface WooCommerceOrder {
  id: number
  status: string
  total: string
  date_created: string
  line_items: { name: string; quantity: number; total: string }[]
  billing?: { email: string; first_name?: string; last_name?: string; phone?: string }
  shipping?: { first_name?: string; last_name?: string; address_1?: string; address_2?: string; city?: string; state?: string; postcode?: string; country?: string }
  meta_data?: { id?: number; key: string; value: string }[]
}

export async function getOrdersByCustomer(customerId: number): Promise<WooCommerceOrder[]> {
  const url = buildUrl('orders', { customer: customerId, per_page: 100 })
  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) {
    throw new Error(`WooCommerce orders fetch failed: ${res.status}`)
  }
  return res.json()
}

export async function getOrderById(id: number): Promise<WooCommerceOrder | null> {
  const url = buildUrl(`orders/${id}`)
  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) {
    if (res.status === 404) {
      return null
    }
    throw new Error(`WooCommerce order fetch failed: ${res.status}`)
  }
  return res.json()
}

export async function updateOrder(
  id: number,
  payload: Partial<WooCommerceOrderPayload> & { status?: string; set_paid?: boolean; meta_data?: { key: string; value: string }[] }
): Promise<WooCommerceOrder> {
  const url = buildUrl(`orders/${id}`)
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`WooCommerce update order failed: ${res.status}`)
  }
  return res.json()
}
