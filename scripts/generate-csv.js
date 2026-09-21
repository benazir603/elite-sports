const fs = require('fs')
const path = require('path')

const rows = JSON.parse(fs.readFileSync('catalog.json', 'utf8'))

function normalizeName(name) {
  return (name || '').trim().replace(/\s+/g, ' ')
}

function generateSku(name) {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

function escapeCsv(value) {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

const headers = [
  'ID',
  'Type',
  'SKU',
  'Name',
  'Published',
  'Short description',
  'Description',
  'Regular price',
  'Sale price',
  'Categories',
  'Images',
  'Stock',
  'Manage stock',
  'Backorders',
  'Tax status',
  'Tax class',
]

const lines = [headers.join(',')]

for (const row of rows) {
  const name = normalizeName(row['Item Name'])
  const category = normalizeName(row.Catageroy)
  const type = normalizeName(row.Type)

  if (!name || !category) continue

  const sku = generateSku(name)
  const categoryPath = type ? `${category} > ${type}` : category
  const shortDesc = `${name} - high-quality ${type ? type : 'product'} in the ${category} category.`
  const description = `${name} is a premium ${type ? type : 'product'} designed for ${category} training and matches. Ideal for athletes and sports enthusiasts.`
  const imageText = encodeURIComponent(name.slice(0, 30))
  const imageUrl = `https://placehold.co/600x600/f5f5f5/333333?text=${imageText}`

  const values = [
    '', // ID
    'simple',
    sku,
    name,
    '1',
    shortDesc,
    description,
    '999', // dummy price
    '', // sale price
    categoryPath,
    imageUrl,
    '10', // stock
    'yes',
    'no',
    'taxable',
    'standard',
  ]

  lines.push(values.map(escapeCsv).join(','))
}

fs.writeFileSync('woocommerce-products.csv', lines.join('\n'), 'utf8')
console.log(`Generated ${lines.length - 1} products in woocommerce-products.csv`)
