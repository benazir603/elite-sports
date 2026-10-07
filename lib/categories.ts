export interface SubCategory {
  name: string
  slug: string
  /** WooCommerce category slugs that should be treated as this subcategory.
   *  Covers the duplicated `parent-slug` / `parent-slug-parent` patterns. */
  wooSlugs: string[]
}

function sub(parent: string, slug: string, name: string, wooSlugs?: string[]): SubCategory {
  return { name, slug, wooSlugs: wooSlugs ?? [slug, `${parent}-${slug}`, `${parent}-${slug}-${parent}`] }
}

export const PARENT_CATEGORY_SLUGS = [
  'badminton',
  'cricket',
  'tennis',
  'pickleball',
  'shoes',
  'squash',
  'swimming',
  'other-sports',
  'apparels',
  'accessories',
  'sports-equipments',
] as const

export const SUBCATEGORIES: Record<string, SubCategory[]> = {
  badminton: [
    sub('badminton', 'rackets', 'Rackets', ['badminton-racket', 'badminton-racket-badminton', 'racket', 'rackets']),
    sub('badminton', 'shuttlecocks', 'Shuttlecocks', ['badminton-cork', 'badminton-cork-badminton', 'shuttlecock', 'shuttlecocks', 'cork']),
    sub('badminton', 'strings', 'Strings & Gutting', ['badminton-string', 'badminton-string-badminton', 'string', 'strings']),
    sub('badminton', 'grips', 'Grips', ['badminton-grip', 'badminton-grip-badminton', 'grip', 'grips']),
    sub('badminton', 'shoes', 'Shoes', ['badminton-shoe', 'badminton-shoe-badminton', 'shoe', 'shoes']),
    sub('badminton', 'kit-bags', 'Kit Bags', ['badminton-kit-bag', 'badminton-kit-bag-badminton', 'kit-bag']),
    sub('badminton', 'sweat-bands', 'Sweat Bands', ['badminton-sweat-band', 'badminton-sweat-band-badminton', 'sweat-band']),
  ],
  cricket: [
    sub('cricket', 'bats', 'Bats', ['cricket-bat', 'cricket-bats', 'bat', 'bats', 'tennis-cricket']),
    sub('cricket', 'balls', 'Balls', ['cricket-ball', 'cr-ball', 'ball', 'balls', 'wind-ball']),
    sub('cricket', 'batting-gloves', 'Batting Gloves', ['cricket-batting-gloves', 'batting-gloves', 'gloves']),
    sub('cricket', 'pads', 'Pads', ['cricket-pads', 'pad', 'pads']),
    sub('cricket', 'helmets', 'Helmets', ['cricket-helmet', 'helmet', 'helmets']),
    sub('cricket', 'guards', 'Guards', ['cricket-guards', 'abdominal-guard', 'guard', 'guards']),
    sub('cricket', 'accessories', 'Accessories', ['cricket-accessories', 'cricket-accessory']),
  ],
  football: [
    sub('football', 'footballs', 'Footballs', ['football', 'foodball', 'footballs', 'f-ball']),
    sub('football', 'studs', 'Studs', ['football-studs', 'studs', 'stud']),
    sub('football', 'shin-guards', 'Shin Guards', ['football-shin-guards', 'shin-guard', 'shin-guards']),
    sub('football', 'goalkeeper-gloves', 'Goalkeeper Gloves', ['football-goalkeeper-gloves', 'goalkeeper-gloves']),
    sub('football', 'accessories', 'Accessories', ['f-ball-accessories', 'football-accessories']),
  ],
  basketball: [
    sub('basketball', 'balls', 'Balls', ['basketball', 'baskatball', 'basketball-balls']),
    sub('basketball', 'accessories', 'Accessories', ['basketball-accessories']),
  ],
  'carrom-chess': [
    sub('carrom-chess', 'carrom-boards', 'Carrom Boards', ['carrom', 'carrom-board', 'carrom-boards']),
    sub('carrom-chess', 'coins-strikers', 'Coins & Strikers', ['carrom-coins', 'carrom-coin', 'striker', 'strikers']),
    sub('carrom-chess', 'chess-boards', 'Chess Boards', ['chess', 'chess-board', 'chess-boards']),
  ],
  'table-tennis': [
    sub('table-tennis', 'bats', 'Bats', ['table-tennis-bat', 'table-tennis-bats', 'tt-bat']),
    sub('table-tennis', 'balls', 'Balls', ['table-tennis-ball', 'table-tennis-balls', 'tt-ball']),
    sub('table-tennis', 'rubbers', 'Rubbers', ['table-tennis-rubber', 'table-tennis-rubbers', 'tt-rubber']),
    sub('table-tennis', 'accessories', 'Accessories', ['table-tennis-accessories', 'tt-accessories']),
  ],
  fitness: [
    sub('fitness', 'dumbbells', 'Dumbbells', ['dumbells', 'dumbbells', 'fitness-dumbbells']),
    sub('fitness', 'kettlebells', 'Kettlebells', ['kettlebell', 'kettlebells', 'fitness-kettlebells']),
    sub('fitness', 'resistance-bands', 'Resistance Bands', ['resistance-band', 'resistance-bands', 'fitness-resistance-bands']),
    sub('fitness', 'yoga-mats', 'Yoga Mats', ['yoga-mat', 'yoga-mats', 'fitness-yoga-mats']),
    sub('fitness', 'skipping-ropes', 'Skipping Ropes', ['skipping', 'skipping-rope', 'skipping-ropes', 'fitness-skipping-ropes']),
    sub('fitness', 'accessories', 'Fitness Accessories', ['fitness-accessories', 'fitness-gym', 'gym-equipments', 'gym-bag']),
  ],
  volleyball: [
    sub('volleyball', 'balls', 'Balls', ['volley-ball', 'volleyball', 'volleyball-balls']),
    sub('volleyball', 'nets', 'Nets', ['volleyball-net', 'volleyball-nets', 'volley-ball-net']),
    sub('volleyball', 'accessories', 'Accessories', ['volleyball-accessories', 'volley-ball-accessories']),
  ],
  'sports-footwear-apparel': [
    sub('sports-footwear-apparel', 'non-marking-shoes', 'Non-Marking Shoes', ['non-marking-shoes', 'sports-footwear-apparel-non-marking-shoes']),
    sub('sports-footwear-apparel', 'running-shoes', 'Running Shoes', ['running-shoes', 'running', 'shoe', 'sports-footwear-apparel-running-shoes']),
    sub('sports-footwear-apparel', 'sportswear', 'Sportswear', ['sportswear', 'clothing', 'sports-footwear-apparel-sportswear']),
    sub('sports-footwear-apparel', 'gym-wear', 'Gym Wear', ['gym-wear', 'sports-footwear-apparel-gym-wear']),
  ],
  swimming: [
    sub('swimming', 'costumes', 'Costumes', ['swimming-costume', 'swimming-costumes', 'swimming']),
    sub('swimming', 'caps', 'Caps', ['swimming-cap', 'swimming-caps', 'cap']),
    sub('swimming', 'goggles', 'Goggles', ['swimming-goggle', 'swimming-goggles', 'goggles']),
    sub('swimming', 'accessories', 'Accessories', ['swimming-accessories']),
  ],
  'other-items': [
    sub('other-items', 'trophies-medals', 'Sports Trophies & Medals', ['shields-and-trophies', 'trophies', 'medals', 'other-items-trophies-medals']),
    sub('other-items', 'school-sports', 'School Sports Equipment', ['school-sports-equipment', 'other-items-school-sports']),
    sub('other-items', 'accessories', 'Sports Accessories', ['sports-accessories', 'other-items-accessories']),
  ],
}

export function findSubCategory(parentSlug: string, subSlug: string): SubCategory | undefined {
  return SUBCATEGORIES[parentSlug]?.find((s) => s.slug === subSlug)
}
