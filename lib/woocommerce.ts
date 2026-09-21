const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL
const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY
const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET

interface WooCommerceProduct {
  id: number
  name: string
  slug: string
  permalink: string
  sku: string
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
  brands?: { id: number; name: string }[]
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

export async function getProductById(id: number): Promise<WooCommerceProduct> {
  const url = buildUrl(`products/${id}`)
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) {
    throw new Error(`WooCommerce product fetch failed: ${res.status}`)
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
  line_items: { product_id: number; quantity: number; variation_id?: number }[]
}

export async function createOrder(payload: WooCommerceOrderPayload): Promise<{ id: number; order_key: string; status: string }> {
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

export async function getCategories(
  params?: Record<string, string | number | undefined>
): Promise<{ id: number; name: string; slug: string; parent: number }[]> {
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

export async function findCustomerByEmail(email: string): Promise<{ id: number; email: string } | null> {
  const url = buildUrl('customers', { email, per_page: 1 })
  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) {
    return null
  }
  const customers: { id: number; email: string }[] = await res.json()
  return customers[0] || null
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
    throw new Error(`WooCommerce create customer failed: ${res.status}`)
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
