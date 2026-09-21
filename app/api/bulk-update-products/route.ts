import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getProducts, updateProduct } from '@/lib/woocommerce'

function parseLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (c === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += c
    }
  }

  fields.push(current)
  return fields
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim())
  const header = parseLine(lines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i])
    const row: Record<string, string> = {}
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = values[j] ?? ''
    }
    rows.push(row)
  }

  return rows
}

export async function POST() {
  try {
    const filePath = path.join(process.cwd(), 'woocommerce-products.csv')
    const text = await fs.readFile(filePath, 'utf-8')
    const rows = parseCsv(text)

    const products = []
    let page = 1
    while (true) {
      const batch = await getProducts({ per_page: 100, page })
      products.push(...batch)
      if (batch.length < 100) break
      page++
    }

    const bySku: Record<string, { id: number; name: string }> = {}
    const byName: Record<string, { id: number; name: string }> = {}
    for (const product of products as { id: number; name: string; sku: string }[]) {
      if (product.sku) bySku[product.sku] = product
      if (product.name) byName[product.name] = product
    }

    const results = { updated: 0, notFound: 0, errors: [] as string[] }

    for (const row of rows) {
      const match = bySku[row.SKU] || byName[row.Name]
      if (!match) {
        results.notFound++
        continue
      }

      const payload: Record<string, unknown> = {}

      if (row['Short description']) payload.short_description = row['Short description']
      if (row['Description']) payload.description = row['Description']
      if (row['Images']) {
        const images = row['Images']
          .split(',')
          .map((src) => ({ src: src.trim() }))
          .filter((img) => img.src)
        payload.images = images
      }

      if (row['Tags']) {
        const tags = row['Tags']
          .replace(/^"|"$/g, '')
          .split(',')
          .map((name) => ({ name: name.trim() }))
          .filter((tag) => tag.name)
        payload.tags = tags
      }

      if (Object.keys(payload).length === 0) continue

      try {
        await updateProduct(match.id, payload)
        results.updated++
      } catch (error: any) {
        results.errors.push(`${row.Name}: ${error.message}`)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Bulk update failed' }, { status: 500 })
  }
}
