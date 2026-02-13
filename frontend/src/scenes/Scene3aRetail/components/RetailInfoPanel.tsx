export function RetailInfoPanel() {
  return (
    <div className="space-y-3">
      {/* Section title */}
      <h3 className="text-xl font-semibold text-slate-800">Retail</h3>

      {/* Description */}
      <p className="text-sm text-slate-600 leading-relaxed">
        AI can interpret reactions to products to improve store design and engagement.
      </p>

      {/* Instruction */}
      <p className="text-sm text-slate-500">
        <span className="font-medium text-slate-700">Tap through the different products</span>{' '}
        to reveal preferences.
      </p>
    </div>
  )
}
