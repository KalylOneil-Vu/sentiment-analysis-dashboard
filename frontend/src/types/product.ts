export interface Product {
  id: string
  name: string
  category: string
  image: string // URL or placeholder
  baseMatchScore: number // Base score for simulation (0-100)
}

export interface MatchResult {
  score: number // 0-100
  label: string
  isLikelyToPurchase: boolean
}

// Mock products for the retail demo
export const PRODUCTS: Product[] = [
  {
    id: 'bag-woven',
    name: 'Woven Leather Tote',
    category: 'Bags',
    image: '/products/bag-woven.jpg',
    baseMatchScore: 33,
  },
  {
    id: 'bag-black',
    name: 'Classic Black Handbag',
    category: 'Bags',
    image: '/products/bag-black.jpg',
    baseMatchScore: 65,
  },
  {
    id: 'watch-gold',
    name: 'Gold Chronograph',
    category: 'Watches',
    image: '/products/watch-gold.jpg',
    baseMatchScore: 78,
  },
  {
    id: 'shoes-heels',
    name: 'Designer Heels',
    category: 'Shoes',
    image: '/products/shoes-heels.jpg',
    baseMatchScore: 45,
  },
  {
    id: 'sunglasses',
    name: 'Aviator Sunglasses',
    category: 'Accessories',
    image: '/products/sunglasses.jpg',
    baseMatchScore: 82,
  },
  {
    id: 'perfume',
    name: 'Luxury Perfume',
    category: 'Fragrance',
    image: '/products/perfume.jpg',
    baseMatchScore: 55,
  },
  {
    id: 'jewelry-ring',
    name: 'Diamond Ring',
    category: 'Jewelry',
    image: '/products/ring.jpg',
    baseMatchScore: 70,
  },
  {
    id: 'scarf',
    name: 'Silk Scarf',
    category: 'Accessories',
    image: '/products/scarf.jpg',
    baseMatchScore: 40,
  },
  {
    id: 'wallet',
    name: 'Leather Wallet',
    category: 'Accessories',
    image: '/products/wallet.jpg',
    baseMatchScore: 88,
  },
  {
    id: 'hat',
    name: 'Fedora Hat',
    category: 'Accessories',
    image: '/products/hat.jpg',
    baseMatchScore: 35,
  },
  {
    id: 'belt',
    name: 'Designer Belt',
    category: 'Accessories',
    image: '/products/belt.jpg',
    baseMatchScore: 60,
  },
  {
    id: 'earrings',
    name: 'Pearl Earrings',
    category: 'Jewelry',
    image: '/products/earrings.jpg',
    baseMatchScore: 72,
  },
]

export function getMatchLabel(score: number): MatchResult {
  if (score >= 70) {
    return {
      score,
      label: 'Customer is likely to purchase.',
      isLikelyToPurchase: true,
    }
  } else if (score >= 50) {
    return {
      score,
      label: 'Customer shows moderate interest.',
      isLikelyToPurchase: false,
    }
  } else {
    return {
      score,
      label: 'Customer is unlikely to purchase.',
      isLikelyToPurchase: false,
    }
  }
}
