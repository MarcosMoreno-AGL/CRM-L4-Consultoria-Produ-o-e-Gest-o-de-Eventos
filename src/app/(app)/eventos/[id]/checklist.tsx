"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/labels"
import { cn } from "@/lib/utils"
import {
  addChecklistItem,
  deleteChecklistItem,
  toggleChecklistItem,
} from "@/app/(app)/eventos/actions"
import type { Database } from "@/lib/supabase/types"

type ChecklistItem = Database["public"]["Tables"]["checklist_itens"]["Row"]

export function Checklist({
  eventoId,
  itens,
}: {
  eventoId: string
  itens: ChecklistItem[]
}) {
  const router = useRouter()
  const [descricao, setDescricao] = React.useState("")
  const [prazo, setPrazo] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!descricao.trim()) return
    setSubmitting(true)
    try {
      await addChecklistItem(eventoId, { descricao, prazo })
      setDescricao("")
      setPrazo("")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao adicionar item")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(item: ChecklistItem) {
    try {
      await toggleChecklistItem(item.id, eventoId, !item.concluido)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar item")
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteChecklistItem(id, eventoId)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover item")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklist</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {itens.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma tarefa cadastrada.</p>
        )}
        {itens.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Checkbox checked={item.concluido} onCheckedChange={() => handleToggle(item)} />
            <div className="flex-1">
              <p className={cn("text-sm", item.concluido && "text-muted-foreground line-through")}>
                {item.descricao}
              </p>
              {item.prazo && (
                <p className="text-xs text-muted-foreground">Prazo: {formatDate(item.prazo)}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleDelete(item.id)}
              aria-label="Remover"
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <form onSubmit={handleAdd} className="flex items-end gap-2 pt-2">
          <div className="flex-1">
            <Input
              placeholder="Nova tarefa"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
          <Input
            type="date"
            className="w-40"
            value={prazo}
            onChange={(e) => setPrazo(e.target.value)}
          />
          <Button type="submit" size="icon" disabled={submitting} aria-label="Adicionar">
            <Plus />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
