import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  STATUS_EVENTO_BADGE,
  STATUS_EVENTO_LABELS,
  TIPO_EVENTO_LABELS,
  formatCurrency,
  formatDate,
} from "@/lib/labels"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { EventoActions } from "@/app/(app)/eventos/[id]/evento-actions"
import { Checklist } from "@/app/(app)/eventos/[id]/checklist"
import { FornecedoresEvento } from "@/app/(app)/eventos/[id]/fornecedores-evento"
import { Parcelas } from "@/app/(app)/eventos/[id]/parcelas"

export default async function EventoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: evento },
    { data: clientes },
    { data: checklistItens },
    { data: eventoFornecedores },
    { data: fornecedores },
    { data: parcelas },
  ] = await Promise.all([
    supabase.from("eventos").select("*, clientes(id, nome, telefone, email)").eq("id", id).single(),
    supabase.from("clientes").select("id, nome").order("nome"),
    supabase.from("checklist_itens").select("*").eq("evento_id", id).order("created_at"),
    supabase
      .from("evento_fornecedores")
      .select("*, fornecedores(nome)")
      .eq("evento_id", id)
      .order("created_at"),
    supabase.from("fornecedores").select("id, nome").order("nome"),
    supabase
      .from("financeiro_parcelas")
      .select("*")
      .eq("evento_id", id)
      .order("data_vencimento"),
  ])

  if (!evento) notFound()

  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/eventos" className="hover:underline">
              Eventos
            </Link>{" "}
            / {evento.nome_evento}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{evento.nome_evento}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge className={cn("border-none", STATUS_EVENTO_BADGE[evento.status])}>
              {STATUS_EVENTO_LABELS[evento.status]}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {TIPO_EVENTO_LABELS[evento.tipo_evento]}
            </span>
          </div>
        </div>
        <EventoActions evento={evento} clientes={clientes ?? []} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente</span>
              <Link href={`/clientes/${evento.clientes?.id}`} className="font-medium hover:underline">
                {evento.clientes?.nome ?? "—"}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data</span>
              <span>{formatDate(evento.data_evento)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Local</span>
              <span>{evento.local ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Convidados</span>
              <span>{evento.numero_convidados ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Orçamento</span>
              <span className="font-medium">{formatCurrency(evento.orcamento_total)}</span>
            </div>
            {evento.observacoes && (
              <div>
                <span className="text-muted-foreground">Observações</span>
                <p>{evento.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Checklist eventoId={evento.id} itens={checklistItens ?? []} />
        </div>
      </div>

      <FornecedoresEvento
        eventoId={evento.id}
        vinculados={eventoFornecedores ?? []}
        fornecedores={fornecedores ?? []}
      />

      <Parcelas eventoId={evento.id} parcelas={parcelas ?? []} />
    </div>
  )
}
