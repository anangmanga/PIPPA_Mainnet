"use client"

export function MovingTicker({ text = "$PIPPA ART NOW LIVE" }: { text?: string }) {
  const items = Array.from({ length: 50 }).map((_, i) => (
    <span key={`ticker-${i}`} className="shrink-0 px-8 py-2 text-white font-bold text-sm uppercase inline-flex items-center whitespace-nowrap">
      {text}
    </span>
  ))

  return (
    <div className="w-full bg-gradient-to-r from-pink-500 via-orange-500 to-pink-500 overflow-hidden relative h-10">
      <div className="flex animate-scroll" style={{ width: 'max-content' }}>
        {items}
        {items}
      </div>
    </div>
  )
}

