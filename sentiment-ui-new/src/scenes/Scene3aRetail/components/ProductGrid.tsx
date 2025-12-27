import { Product } from '../../../types/product'

interface ProductGridProps {
  products: Product[]
  selectedIndex: number
  onSelectProduct: (index: number) => void
}

// Small product icon based on category
function SmallProductIcon({ category }: { category: string }) {
  const size = 24

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
        <path d="M9 1h6M9 23h6" strokeLinecap="round" />
      </svg>
    ),
    Shoes: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 18h20v2H2zM4 18v-3c0-2 1-4 4-4h2l6-6c2-2 5-1 6 1v12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Accessories: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    Fragrance: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="8" y="9" width="8" height="12" rx="2" />
        <path d="M10 9V6a2 2 0 0 1 4 0v3" strokeLinecap="round" />
      </svg>
    ),
    Jewelry: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
      </svg>
    ),
  }

  return icons[category] || icons.Accessories
}

export function ProductGrid({
  products,
  selectedIndex,
  onSelectProduct,
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {products.map((product, index) => {
        const isSelected = index === selectedIndex

        return (
          <button
            key={product.id}
            onClick={() => onSelectProduct(index)}
            className={`
              relative aspect-square rounded-lg p-2 flex items-center justify-center
              transition-all duration-200 hover-lift stagger-item
              ${isSelected ? 'ring-2 ring-teal-500 ring-offset-2' : ''}
            `}
            style={{
              background: isSelected
                ? 'rgba(20, 184, 166, 0.1)'
                : 'rgba(241, 245, 249, 0.8)',
              border: `1px solid ${
                isSelected ? 'rgba(20, 184, 166, 0.4)' : 'rgba(148, 163, 184, 0.2)'
              }`,
            }}
            title={product.name}
          >
            <div className={`${isSelected ? 'text-teal-600' : 'text-slate-400'}`}>
              <SmallProductIcon category={product.category} />
            </div>

            {/* Selection indicator dot */}
            {isSelected && (
              <div
                className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-teal-500 rounded-full"
                style={{ boxShadow: '0 0 4px rgba(20, 184, 166, 0.5)' }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
