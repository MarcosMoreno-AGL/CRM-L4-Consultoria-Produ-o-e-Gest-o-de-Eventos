import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CLIENTE_ORIGEM_LABELS,
  CLIENTE_TIPO_LABELS,
  ESTAGIO_FUNIL_LABELS,
  STATUS_EVENTO_BADGE,
  STATUS_EVENTO_LABELS,
  formatCurrency,
  formatDate,
} from "@/lib/labels"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { ClienteActions } from "@/app/(app)/clientes/cliente-actions"
import { EventoDialog } from "@/app/(app)/eventos/evento-dialog"

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: cliente }, { data: eventos }, { data: clientes }] = await Promise.all([
    supabase.from("clientes").select("*").eq("id", id).single(),
    supabase
      .from("eventos")
      .select("*")
      .eq("cliente_id", id)
      .order("data_evento", { ascending: false }),
    supabase.from("clientes").select("id, nome").order("nome"),
  ])

  if (!cliente) notFound()

  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/clientes" className="hover:underline">
              Clientes
            </Link>{" "}
            / {cliente.nome}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{cliente.nome}</h1>
          <Badge variant="secondary" className="mt-1">
            {ESTAGIO_FUNIL_LABELS[cliente.estagio_funil]}
          </Badge>
        </div>
        <ClienteActions cliente={cliente} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <div className="flex justify-between md:max-w-sm">
            <span className="text-muted-foreground">Tipo</span>
            <span>{CLIENTE_TIPO_LABELS[cliente.tipo]}</span>
          </div>
          <div className="flex justify-between md:max-w-sm">
            <span className="text-muted-foreground">Origem</span>
            <span>{cliente.origem ? CLIENTE_ORIGEM_LABELS[cliente.origem] : "—"}</span>
          </div>
          <div className="flex justify-between md:max-w-sm">
            <span className="text-muted-foreground">E-mail</span>
            <span>{cliente.email ?? "—"}</span>
          </div>
          <div className="flex justify-between md:max-w-sm">
            <span className="text-muted-foreground">Telefone</span>
            <span>{cliente.telefone ?? "—"}</span>
          </div>
          <div className="flex justify-between md:max-w-sm">
            <span className="text-muted-foreground">Empresa</span>
            <span>{cliente.empresa ?? "—"}</span>
          </div>
          <div className="flex justify-between md:max-w-sm">
            <span className="text-muted-foreground">Endereço</span>
            <span>{cliente.endereco ?? "—"}</span>
          </div>
          {cliente.observacoes && (
            <div className="md:col-span-2">
              <span className="text-muted-foreground">Observações</span>
              <p>{cliente.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Eventos</CardTitle>
          <EventoDialog clientes={clientes ?? []} defaultClienteId={cliente.id} />
        </CardHeader>
        <CardContent className="grid gap-2">
          {(eventos ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum evento cadastrado.</p>
          )}
          {eventos?.map((evento) => (
            <Link
              key={evento.id}
              href={`/eventos/${evento.id}`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
            >
              <div>
                <p className="font-medium">{evento.nome_evento}</p>
                <p className="text-xs text-muted-foreground">{formatDate(evento.data_evento)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">{formatCurrency(evento.orcamento_total)}</span>
                <Badge className={cn("border-none", STATUS_EVENTO_BADGE[evento.status])}>
                  {STATUS_EVENTO_LABELS[evento.status]}
                </Badge>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
