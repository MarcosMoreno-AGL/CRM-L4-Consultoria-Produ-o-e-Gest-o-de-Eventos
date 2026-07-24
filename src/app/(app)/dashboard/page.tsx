import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ESTAGIO_FUNIL_ORDER,
  STATUS_EVENTO_BADGE,
  STATUS_EVENTO_LABELS,
  formatCurrency,
  formatDate,
} from "@/lib/labels"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { FunilChart } from "@/app/(app)/dashboard/funil-chart"
import type { EstagioFunil } from "@/lib/supabase/types"

function monthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
  return { start, end }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { start, end } = monthRange()
  const today = new Date().toISOString().slice(0, 10)

  const [
    { count: eventosMes },
    { data: parcelasPagasMes },
    { data: parcelasEmAberto },
    { data: clientesFunil },
    { data: proximosEventos },
  ] = await Promise.all([
    supabase
      .from("eventos")
      .select("*", { count: "exact", head: true })
      .gte("data_evento", start)
      .lte("data_evento", end),
    supabase
      .from("financeiro_parcelas")
      .select("valor")
      .eq("status", "pago")
      .gte("data_pagamento", start)
      .lte("data_pagamento", end),
    supabase.from("financeiro_parcelas").select("valor").in("status", ["pendente", "atrasado"]),
    supabase.from("clientes").select("estagio_funil"),
    supabase
      .from("eventos")
      .select("id, nome_evento, data_evento, status, clientes(nome)")
      .gte("data_evento", today)
      .order("data_evento", { ascending: true })
      .limit(5),
  ])

  const receitaMes = (parcelasPagasMes ?? []).reduce((s, p) => s + p.valor, 0)
  const receitaPrevista = (parcelasEmAberto ?? []).reduce((s, p) => s + p.valor, 0)
  const leadsAtivos = (clientesFunil ?? []).filter(
    (c) => c.estagio_funil !== "fechado_ganho" && c.estagio_funil !== "fechado_perdido"
  ).length

  const funilCounts = ESTAGIO_FUNIL_ORDER.reduce(
    (acc, estagio) => {
      acc[estagio] = (clientesFunil ?? []).filter((c) => c.estagio_funil === estagio).length
      return acc
    },
    {} as Record<EstagioFunil, number>
  )

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da L4 Consultoria.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Eventos este mês
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{eventosMes ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recebido este mês
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatCurrency(receitaMes)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              A receber (em aberto)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
            {formatCurrency(receitaPrevista)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads ativos no funil
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{leadsAtivos}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Funil de clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <FunilChart counts={funilCounts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos eventos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {(proximosEventos ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum evento futuro agendado.</p>
            )}
            {proximosEventos?.map((evento) => (
              <Link
                key={evento.id}
                href={`/eventos/${evento.id}`}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{evento.nome_evento}</p>
                  <p className="text-xs text-muted-foreground">
                    {evento.clientes?.nome} · {formatDate(evento.data_evento)}
                  </p>
                </div>
                <Badge className={cn("border-none", STATUS_EVENTO_BADGE[evento.status])}>
                  {STATUS_EVENTO_LABELS[evento.status]}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
