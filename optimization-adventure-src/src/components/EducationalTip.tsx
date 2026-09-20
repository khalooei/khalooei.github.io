export function EducationalTip({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <span className="text-2xl" aria-hidden="true">
        💡
      </span>
      <p className="text-sm font-medium leading-relaxed text-amber-900">{text}</p>
    </div>
  )
}
