"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CATEGORIA_FORNECEDOR_LABELS } from "@/lib/labels"
import { FornecedorDialog } from "@/app/(app)/fornecedores/fornecedor-dialog"
import { deleteFornecedor } from "@/app/(app)/fornecedores/actions"
import type { Database } from "@/lib/supabase/types"

type Fornecedor = Database["public"]["Tables"]["fornecedores"]["Row"]

export function FornecedoresTable({ fornecedores }: { fornecedores: Fornecedor[] }) {
  const router = useRouter()

  async function handleDelete(f: Fornecedor) {
    if (!confirm(`Excluir o fornecedor "${f.nome}"?`)) return
    try {
      await deleteFornecedor(f.id)
      toast.success("Fornecedor excluído")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir fornecedor")
    }
  }

  if (fornecedores.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nenhum fornecedor cadastrado ainda.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Contato</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {fornecedores.map((f) => (
          <TableRow key={f.id}>
            <TableCell className="font-medium">{f.nome}</TableCell>
            <TableCell>
              <Badge variant="secondary">{CATEGORIA_FORNECEDOR_LABELS[f.categoria]}</Badge>
            </TableCell>
            <TableCell>
              <p>{f.contato ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{f.telefone ?? f.email ?? ""}</p>
            </TableCell>
            <TableCell className="flex justify-end gap-1">
              <FornecedorDialog
                fornecedor={f}
                trigger={
                  <Button variant="ghost" size="icon-sm">
                    <Pencil />
                  </Button>
                }
              />
              <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(f)}>
                <Trash2 />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
