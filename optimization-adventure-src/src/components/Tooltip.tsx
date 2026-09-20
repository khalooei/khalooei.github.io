import { useState, type ReactNode } from 'react'

export function Tooltip({ term, definition, children }: { term: string; definition: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-block">
      <button
        type="button"
        className="focus-ring cursor-help rounded-sm border-b-2 border-dotted border-brand-400 font-semibold text-brand-700"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onBlur={() => setOpen(false)}
        aria-expanded={open}
      >
        {children}
      </button>
      {open && (
        <span
          role="tooltip"
          className="card-surface absolute start-0 top-full z-50 mt-2 w-56 rounded-xl p-3 text-xs leading-relaxed text-slate-700 shadow-xl"
        >
          <strong className="mb-1 block text-brand-700">{term}</strong>
          {definition}
        </span>
      )}
    </span>
  )
}
