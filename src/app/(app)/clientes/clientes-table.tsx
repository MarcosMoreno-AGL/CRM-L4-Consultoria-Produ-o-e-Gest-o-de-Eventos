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
import { CLIENTE_TIPO_LABELS, ESTAGIO_FUNIL_LABELS } from "@/lib/labels"
import type { Database } from "@/lib/supabase/types"

type Cliente = Database["public"]["Tables"]["clientes"]["Row"]

export function ClientesTable({ clientes }: { clientes: Cliente[] }) {
  if (clientes.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nenhum cliente cadastrado ainda.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Contato</TableHead>
          <TableHead>Estágio</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clientes.map((cliente) => (
          <TableRow key={cliente.id}>
            <TableCell>
              <Link href={`/clientes/${cliente.id}`} className="font-medium hover:underline">
                {cliente.nome}
              </Link>
              {cliente.empresa && (
                <p className="text-xs text-muted-foreground">{cliente.empresa}</p>
              )}
            </TableCell>
            <TableCell>{CLIENTE_TIPO_LABELS[cliente.tipo]}</TableCell>
            <TableCell>
              <p>{cliente.email ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{cliente.telefone ?? ""}</p>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{ESTAGIO_FUNIL_LABELS[cliente.estagio_funil]}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
