import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  resolveStock,
  maxPurchasable,
  findStockIssues,
  clampQuantity,
  stockMessage,
  MAX_ORDER_QUANTITY,
  type StockInfo,
} from './stock.ts'

const baseProduct = {
  id: 1,
  name: 'Yonex Racket',
  type: 'simple',
  status: 'publish',
  price: '1500',
  stock_status: 'instock' as const,
  stock_quantity: 10,
}

const baseVariation = {
  id: 99,
  status: 'publish',
  purchasable: true,
  price: '1600',
  stock_status: 'instock' as const,
  stock_quantity: 4,
}

describe('resolveStock', () => {
  it('reports quantity for an in-stock simple product', () => {
    const stock = resolveStock(baseProduct, null)
    assert.equal(stock.available, 10)
    assert.equal(stock.purchasable, true)
    assert.equal(stock.price, 1500)
  })

  it('returns null availability when stock is unmanaged (null quantity)', () => {
    const stock = resolveStock({ ...baseProduct, stock_quantity: null }, null)
    assert.equal(stock.available, null)
    assert.equal(stock.purchasable, true)
  })

  it('is not purchasable when out of stock', () => {
    const stock = resolveStock({ ...baseProduct, stock_status: 'outofstock', stock_quantity: 0 }, null)
    assert.equal(stock.purchasable, false)
    assert.equal(stock.available, 0)
  })

  it('uses variation-level stock for variable products', () => {
    const stock = resolveStock(
      { ...baseProduct, type: 'variable', stock_quantity: null },
      baseVariation
    )
    assert.equal(stock.available, 4)
    assert.equal(stock.variationId, 99)
    assert.equal(stock.price, 1600)
  })

  it('rejects unpublished or non-purchasable variations', () => {
    assert.equal(resolveStock({ ...baseProduct, type: 'variable' }, { ...baseVariation, purchasable: false }).purchasable, false)
    assert.equal(resolveStock({ ...baseProduct, type: 'variable' }, { ...baseVariation, status: 'private' }).purchasable, false)
  })

  it('rejects a variable product with no variation selected', () => {
    assert.equal(resolveStock({ ...baseProduct, type: 'variable' }, null).purchasable, false)
  })
})

describe('maxPurchasable', () => {
  it('caps at stock quantity', () => {
    assert.equal(maxPurchasable({ available: 5, purchasable: true }), 5)
  })
  it('caps at MAX_ORDER_QUANTITY for untracked stock', () => {
    assert.equal(maxPurchasable({ available: null, purchasable: true }), MAX_ORDER_QUANTITY)
  })
  it('caps at MAX_ORDER_QUANTITY for large stock', () => {
    assert.equal(maxPurchasable({ available: 500, purchasable: true }), MAX_ORDER_QUANTITY)
  })
  it('is zero when not purchasable', () => {
    assert.equal(maxPurchasable({ available: 5, purchasable: false }), 0)
  })
})

describe('findStockIssues', () => {
  const map = (info: Partial<StockInfo>) =>
    new Map([['1:0', { productId: 1, name: 'Yonex Racket', price: 1500, available: 10, purchasable: true, ...info }]])

  it('passes when quantity is within stock', () => {
    assert.equal(findStockIssues([{ productId: 1, quantity: 10 }], map({})).length, 0)
  })

  it('rejects quantity above stock with the exact message', () => {
    const issues = findStockIssues([{ productId: 1, quantity: 11 }], map({}))
    assert.equal(issues.length, 1)
    assert.equal(issues[0].available, 10)
    assert.equal(issues[0].message, 'Only 10 items are available in stock.')
  })

  it('rejects when out of stock', () => {
    const issues = findStockIssues([{ productId: 1, quantity: 1 }], map({ available: 0, purchasable: false }))
    assert.equal(issues[0].message, 'Out of stock')
  })

  it('uses singular wording for one remaining item', () => {
    const issues = findStockIssues([{ productId: 1, quantity: 2 }], map({ available: 1 }))
    assert.equal(issues[0].message, 'Only 1 item is available in stock.')
  })

  it('flags an unknown product as unavailable', () => {
    const issues = findStockIssues([{ productId: 999, quantity: 1 }], map({}))
    assert.equal(issues[0].message, 'This item is no longer available.')
  })

  it('allows untracked stock up to the hard cap', () => {
    const untracked = map({ available: null })
    assert.equal(findStockIssues([{ productId: 1, quantity: 20 }], untracked).length, 0)
    assert.equal(findStockIssues([{ productId: 1, quantity: 21 }], untracked)[0].available, MAX_ORDER_QUANTITY)
  })
})

describe('clampQuantity', () => {
  it('never exceeds the stock max', () => {
    assert.equal(clampQuantity(10, 1, 10), 10)
    assert.equal(clampQuantity(9, 1, 10), 10)
  })
  it('floors at zero (removal)', () => {
    assert.equal(clampQuantity(1, -5, 10), 0)
  })
  it('uses the hard cap when stock is untracked', () => {
    assert.equal(clampQuantity(MAX_ORDER_QUANTITY, 1, null), MAX_ORDER_QUANTITY)
  })
})

describe('stockMessage', () => {
  it('formats the required messages', () => {
    assert.equal(stockMessage(0), 'Out of stock')
    assert.equal(stockMessage(3), 'Only 3 items are available in stock.')
  })
})
