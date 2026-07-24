"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MessageCircle, Mail } from "lucide-react"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import {
  ESTAGIO_FUNIL_COLUMN_STYLE,
  ESTAGIO_FUNIL_HEADER_STYLE,
  ESTAGIO_FUNIL_LABELS,
  ESTAGIO_FUNIL_ORDER,
} from "@/lib/labels"
import { updateEstagioFunil } from "@/app/(app)/clientes/actions"
import type { Database, EstagioFunil } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"
import { mailtoLink, whatsappLink } from "@/lib/contact-links"

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
              "flex min-h-[200px] flex-col gap-2 rounded-lg border p-2 transition-colors",
              ESTAGIO_FUNIL_COLUMN_STYLE[estagio],
              overStage === estagio && "ring-2 ring-brand"
            )}
          >
            <div className="flex items-center justify-between px-1 pb-1">
              <span className={cn("text-sm font-semibold", ESTAGIO_FUNIL_HEADER_STYLE[estagio])}>
                {ESTAGIO_FUNIL_LABELS[estagio]}
              </span>
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
                {cliente.telefone && (
                  <p className="text-xs text-muted-foreground">{cliente.telefone}</p>
                )}
                {(cliente.telefone || cliente.email) && (
                  <div className="mt-1 flex items-center gap-2">
                    {cliente.telefone && (
                      <a
                        href={whatsappLink(
                          cliente.telefone,
                          `Olá ${cliente.nome}, aqui é da L4 Consultoria de Eventos!`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400"
                        title="Conversar no WhatsApp"
                      >
                        <MessageCircle className="size-3.5" />
                        WhatsApp
                      </a>
                    )}
                    {cliente.email && (
                      <a
                        href={mailtoLink(cliente.email, `L4 Consultoria de Eventos — ${cliente.nome}`)}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-500/25 dark:text-blue-400"
                        title="Enviar e-mail"
                      >
                        <Mail className="size-3.5" />
                        E-mail
                      </a>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )
      })}
    </div>
  )
}
