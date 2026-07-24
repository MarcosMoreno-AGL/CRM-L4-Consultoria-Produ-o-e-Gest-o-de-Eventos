"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { STATUS_EVENTO_BADGE, STATUS_EVENTO_LABELS, TIPO_EVENTO_LABELS, formatCurrency, formatDate } from "@/lib/labels"
import { cn } from "@/lib/utils"
import type { Database } from "@/lib/supabase/types"

type Evento = Database["public"]["Tables"]["eventos"]["Row"] & {
  clientes: { nome: string } | null
}

export function EventosTable({ eventos }: { eventos: Evento[] }) {
  if (eventos.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nenhum evento cadastrado ainda.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Evento</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Orçamento</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {eventos.map((evento) => (
          <TableRow key={evento.id}>
            <TableCell>
              <Link href={`/eventos/${evento.id}`} className="font-medium hover:underline">
                {evento.nome_evento}
              </Link>
            </TableCell>
            <TableCell>{evento.clientes?.nome ?? "—"}</TableCell>
            <TableCell>{TIPO_EVENTO_LABELS[evento.tipo_evento]}</TableCell>
            <TableCell>{formatDate(evento.data_evento)}</TableCell>
            <TableCell>{formatCurrency(evento.orcamento_total)}</TableCell>
            <TableCell>
              <Badge className={cn("border-none", STATUS_EVENTO_BADGE[evento.status])}>
                {STATUS_EVENTO_LABELS[evento.status]}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
