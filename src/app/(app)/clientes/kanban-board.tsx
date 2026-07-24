"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { ESTAGIO_FUNIL_LABELS, ESTAGIO_FUNIL_ORDER } from "@/lib/labels"
import { updateEstagioFunil } from "@/app/(app)/clientes/actions"
import type { Database, EstagioFunil } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

type Cliente = Database["public"]["Tables"]["clientes"]["Row"]

export function KanbanBoard({ clientes }: { clientes: Cliente[] }) {
  const router = useRouter()
  const [dragId, setDragId] = React.useState<string | null>(null)
  const [overStage, setOverStage] = React.useState<EstagioFunil | null>(null)
  const [items, setItems] = React.useState(clientes)
  const [prevClientes, setPrevClientes] = React.useState(clientes)

  if (clientes !== prevClientes) {
    setPrevClientes(clientes)
    setItems(clientes)
  }

  async function handleDrop(estagio: EstagioFunil) {
    setOverStage(null)
    if (!dragId) return
    const cliente = items.find((c) => c.id === dragId)
    if (!cliente || cliente.estagio_funil === estagio) return

    setItems((prev) =>
      prev.map((c) => (c.id === dragId ? { ...c, estagio_funil: estagio } : c))
    )
    try {
      await updateEstagioFunil(dragId, estagio)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao mover cliente")
      setItems(clientes)
    }
  }

  return (
    <div className="grid grid-flow-col auto-cols-[minmax(240px,1fr)] gap-4 overflow-x-auto pb-2">
      {ESTAGIO_FUNIL_ORDER.map((estagio) => {
        const stageItems = items.filter((c) => c.estagio_funil === estagio)
        return (
          <div
            key={estagio}
            onDragOver={(e) => {
              e.preventDefault()
              setOverStage(estagio)
            }}
            onDragLeave={() => setOverStage((s) => (s === estagio ? null : s))}
            onDrop={() => handleDrop(estagio)}
            className={cn(
              "flex min-h-[200px] flex-col gap-2 rounded-lg border bg-muted/30 p-2 transition-colors",
              overStage === estagio && "border-brand bg-brand/5"
            )}
          >
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-sm font-medium">{ESTAGIO_FUNIL_LABELS[estagio]}</span>
              <span className="text-xs text-muted-foreground">{stageItems.length}</span>
            </div>
            {stageItems.map((cliente) => (
              <Card
                key={cliente.id}
                draggable
                onDragStart={() => setDragId(cliente.id)}
                onDragEnd={() => setDragId(null)}
                className="cursor-grab gap-1 p-3 active:cursor-grabbing"
              >
                <Link href={`/clientes/${cliente.id}`} className="font-medium hover:underline">
                  {cliente.nome}
                </Link>
                {cliente.empresa && (
                  <p className="text-xs text-muted-foreground">{cliente.empresa}</p>
                )}
              </Card>
            ))}
          </div>
        )
      })}
    </div>
  )
}
