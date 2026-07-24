"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EventoDialog } from "@/app/(app)/eventos/evento-dialog"
import { deleteEvento } from "@/app/(app)/eventos/actions"
import type { Database } from "@/lib/supabase/types"

type Evento = Database["public"]["Tables"]["eventos"]["Row"]
type Cliente = Database["public"]["Tables"]["clientes"]["Row"]

export function EventoActions({
  evento,
  clientes,
}: {
  evento: Evento
  clientes: Pick<Cliente, "id" | "nome">[]
}) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Excluir o evento "${evento.nome_evento}"?`)) return
    try {
      await deleteEvento(evento.id, evento.cliente_id)
      toast.success("Evento excluído")
      router.push("/eventos")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir evento")
    }
  }

  return (
    <div className="flex gap-2">
      <EventoDialog
        evento={evento}
        clientes={clientes}
        trigger={
          <Button variant="outline" size="sm">
            <Pencil /> Editar
          </Button>
        }
      />
      <Button variant="outline" size="sm" onClick={handleDelete}>
        <Trash2 /> Excluir
      </Button>
    </div>
  )
}
