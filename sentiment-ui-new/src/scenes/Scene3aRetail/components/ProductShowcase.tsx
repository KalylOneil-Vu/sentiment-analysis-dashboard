import { Product } from '../../../types/product'

interface ProductShowcaseProps {
  product: Product
}

// Product icon/placeholder based on category
function ProductIcon({ category, size = 64 }: { category: string; size?: number }) {
  const icons: Record<string, JSX.Element> = {
    Bags: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 6h12l1 14H5L6 6z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 6V4a3 3 0 0 1 6 0v2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Watches: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="6" />
        <path d="M12 9v3l2 2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 1h6M9 23h6M12 1v4M12 19v4" strokeLinecap="round" />
      </svg>
    ),
    Shoes: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 18h20v2H2zM4 18v-3c0-2 1-4 4-4h2l6-6c2-2 5-1 6 1v12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Accessories: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Fragrance: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="7" y="8" width="10" height="14" rx="2" />
        <path d="M9 8V5a3 3 0 0 1 6 0v3" strokeLinecap="round" />
        <path d="M10 2h4" strokeLinecap="round" />
      </svg>
    ),
    Jewelry: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l3 6h6l-5 4 2 7-6-4-6 4 2-7-5-4h6l3-6z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  }

  return (
    <div className="text-slate-400">
      {icons[category] || icons.Accessories}
    </div>
  )
}

export function ProductShowcase({ product }: ProductShowcaseProps) {
  return (
    <div
      className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, rgba(241, 245, 249, 0.9) 0%, rgba(226, 232, 240, 0.9) 100%)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        minHeight: '140px',
      }}
    >
      {/* Product icon placeholder */}
      <ProductIcon category={product.category} size={72} />

      {/* Product name overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-900/60 to-transparent">
        <p className="text-white text-sm font-medium truncate">{product.name}</p>
        <p className="text-white/70 text-xs">{product.category}</p>
      </div>
    </div>
  )
}
