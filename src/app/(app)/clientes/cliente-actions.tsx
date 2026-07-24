"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ClienteDialog } from "@/app/(app)/clientes/cliente-dialog"
import { deleteCliente } from "@/app/(app)/clientes/actions"
import type { Database } from "@/lib/supabase/types"

type Cliente = Database["public"]["Tables"]["clientes"]["Row"]

export function ClienteActions({ cliente }: { cliente: Cliente }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Excluir o cliente "${cliente.nome}"? Isso também remove os eventos vinculados.`)) {
      return
    }
    try {
      await deleteCliente(cliente.id)
      toast.success("Cliente excluído")
      router.push("/clientes")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir cliente")
    }
  }

  return (
    <div className="flex gap-2">
      <ClienteDialog
        cliente={cliente}
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
