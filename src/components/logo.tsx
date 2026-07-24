import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-baseline gap-1 font-bold tracking-tight", className)}>
      <span className="bg-gradient-to-b from-neutral-300 via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
        L4
      </span>
      <span className="text-[0.55em] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Consultoria
      </span>
    </span>
  )
}
