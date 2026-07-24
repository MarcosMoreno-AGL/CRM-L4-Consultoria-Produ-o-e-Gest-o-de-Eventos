import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/labels"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { ParcelaStatusBadge } from "@/app/(app)/financeiro/parcela-status-badge"

const PERIODOS = [
  { value: "todas", label: "Todo o período" },
  { value: "mes", label: "Este mês" },
  { value: "30dias", label: "Próximos 30 dias" },
] as const

const STATUS_FILTROS = [
  { value: "todas", label: "Todas" },
  { value: "pendente", label: "Pendentes" },
  { value: "atrasado", label: "Atrasadas" },
  { value: "pago", label: "Pagas" },
] as const

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; periodo?: string }>
}) {
  const { status = "todas", periodo = "todas" } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("financeiro_parcelas")
    .select("*, eventos(nome_evento, cliente_id, clientes(nome))")
    .order("data_vencimento")

  const today = todayISO()
  if (periodo === "mes") {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
    query = query.gte("data_vencimento", start).lte("data_vencimento", end)
  } else if (periodo === "30dias") {
    const end = new Date()
    end.setDate(end.getDate() + 30)
    query = query.gte("data_vencimento", today).lte("data_vencimento", end.toISOString().slice(0, 10))
  }

  const { data: parcelas } = await query

  const withVencida = (parcelas ?? []).map((p) => ({
    ...p,
    vencida: p.status === "pendente" && p.data_vencimento < today,
  }))

  const filtradas = withVencida.filter((p) => {
    if (status === "todas") return true
    if (status === "atrasado") return p.vencida || p.status === "atrasado"
    if (status === "pendente") return p.status === "pendente" && !p.vencida
    return p.status === status
  })

  const totalRecebido = withVencida.filter((p) => p.status === "pago").reduce((s, p) => s + p.valor, 0)
  const totalPendente = withVencida
    .filter((p) => p.status === "pendente" && !p.vencida)
    .reduce((s, p) => s + p.valor, 0)
  const totalAtrasado = withVencida
    .filter((p) => p.vencida || p.status === "atrasado")
    .reduce((s, p) => s + p.valor, 0)

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground">Parcelas de todos os eventos.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recebido</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalRecebido)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendente</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
            {formatCurrency(totalPendente)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atrasado</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-red-600 dark:text-red-400">
            {formatCurrency(totalAtrasado)}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-lg border p-1">
          {STATUS_FILTROS.map((f) => (
            <Link
              key={f.value}
              href={`/financeiro?status=${f.value}&periodo=${periodo}`}
              className={cn(
                "rounded-md px-3 py-1 text-sm",
                status === f.value ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <div className="flex gap-1 rounded-lg border p-1">
          {PERIODOS.map((p) => (
            <Link
              key={p.value}
              href={`/financeiro?status=${status}&periodo=${p.value}`}
              className={cn(
                "rounded-md px-3 py-1 text-sm",
                periodo === p.value ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {filtradas.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma parcela encontrada para esse filtro.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/eventos/${p.evento_id}`} className="font-medium hover:underline">
                        {p.eventos?.nome_evento ?? "—"}
                      </Link>
                    </TableCell>
                    <TableCell>{p.eventos?.clientes?.nome ?? "—"}</TableCell>
                    <TableCell>{p.descricao}</TableCell>
                    <TableCell>{formatCurrency(p.valor)}</TableCell>
                    <TableCell>{formatDate(p.data_vencimento)}</TableCell>
                    <TableCell>
                      <ParcelaStatusBadge status={p.status} vencida={p.vencida} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
