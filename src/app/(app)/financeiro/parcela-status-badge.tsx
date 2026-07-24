import { Badge } from "@/components/ui/badge"
import { STATUS_PAGAMENTO_BADGE, STATUS_PAGAMENTO_LABELS } from "@/lib/labels"
import { cn } from "@/lib/utils"
import type { StatusPagamento } from "@/lib/supabase/types"

export function ParcelaStatusBadge({
  status,
  vencida,
}: {
  status: StatusPagamento
  vencida: boolean
}) {
  const effective = vencida && status === "pendente" ? "atrasado" : status
  return (
    <Badge className={cn("border-none", STATUS_PAGAMENTO_BADGE[effective])}>
      {STATUS_PAGAMENTO_LABELS[effective]}
    </Badge>
  )
}
