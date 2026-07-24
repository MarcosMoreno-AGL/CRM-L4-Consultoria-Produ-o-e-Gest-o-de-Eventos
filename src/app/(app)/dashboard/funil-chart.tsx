import { ESTAGIO_FUNIL_LABELS, ESTAGIO_FUNIL_ORDER } from "@/lib/labels"
import type { EstagioFunil } from "@/lib/supabase/types"

// Ordinal single-hue (blue) ramp, light-mode steps ≥ 250 per dataviz palette guidance
const STEPS = ["#86b6ef", "#6da7ec", "#3987e5", "#2a78d6", "#256abf", "#0d366b"]

export function FunilChart({ counts }: { counts: Record<EstagioFunil, number> }) {
  const max = Math.max(1, ...ESTAGIO_FUNIL_ORDER.map((e) => counts[e] ?? 0))

  return (
    <div className="grid gap-2.5">
      {ESTAGIO_FUNIL_ORDER.map((estagio, i) => {
        const value = counts[estagio] ?? 0
        const pct = Math.round((value / max) * 100)
        return (
          <div key={estagio} className="grid grid-cols-[9rem_1fr_2rem] items-center gap-3 text-sm">
            <span className="truncate text-[#52514e]">{ESTAGIO_FUNIL_LABELS[estagio]}</span>
            <div className="h-2 rounded-full bg-[#e1e0d9]">
              <div
                className="h-2 rounded-full transition-[width]"
                style={{ width: `${Math.max(pct, value > 0 ? 4 : 0)}%`, backgroundColor: STEPS[i] }}
              />
            </div>
            <span className="text-right font-medium text-[#0b0b0b] tabular-nums">{value}</span>
          </div>
        )
      })}
    </div>
  )
}
