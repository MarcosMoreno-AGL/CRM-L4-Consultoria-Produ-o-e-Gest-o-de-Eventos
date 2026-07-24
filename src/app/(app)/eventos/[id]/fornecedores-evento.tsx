"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { STATUS_PAGAMENTO_BADGE, STATUS_PAGAMENTO_LABELS, formatCurrency } from "@/lib/labels"
import { cn } from "@/lib/utils"
import { eventoFornecedorSchema, type EventoFornecedorFormValues } from "@/lib/schemas"
import {
  addEventoFornecedor,
  removeEventoFornecedor,
  updateEventoFornecedorStatus,
} from "@/app/(app)/eventos/actions"
import type { Database, StatusPagamento } from "@/lib/supabase/types"

type Fornecedor = Database["public"]["Tables"]["fornecedores"]["Row"]
type EventoFornecedor = Database["public"]["Tables"]["evento_fornecedores"]["Row"] & {
  fornecedores: { nome: string } | null
}

export function FornecedoresEvento({
  eventoId,
  vinculados,
  fornecedores,
}: {
  eventoId: string
  vinculados: EventoFornecedor[]
  fornecedores: Pick<Fornecedor, "id" | "nome">[]
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  const form = useForm<EventoFornecedorFormValues>({
    resolver: zodResolver(eventoFornecedorSchema),
    defaultValues: { fornecedor_id: "", valor_contratado: 0, status_pagamento: "pendente" },
  })

  async function onSubmit(values: EventoFornecedorFormValues) {
    try {
      await addEventoFornecedor(eventoId, values)
      toast.success("Fornecedor adicionado")
      form.reset()
      setOpen(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao adicionar fornecedor")
    }
  }

  async function handleStatusChange(id: string, status: StatusPagamento) {
    try {
      await updateEventoFornecedorStatus(id, eventoId, status)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar status")
    }
  }

  async function handleRemove(id: string) {
    try {
      await removeEventoFornecedor(id, eventoId)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover fornecedor")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fornecedores</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus /> Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar fornecedor ao evento</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="fornecedor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornecedor</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fornecedores.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valor_contratado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor contratado (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    Adicionar
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {vinculados.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum fornecedor vinculado.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {vinculados.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.fornecedores?.nome ?? "—"}</TableCell>
                  <TableCell>{formatCurrency(v.valor_contratado)}</TableCell>
                  <TableCell>
                    <Select
                      value={v.status_pagamento}
                      onValueChange={(value) => handleStatusChange(v.id, value as StatusPagamento)}
                    >
                      <SelectTrigger size="sm" className="w-36">
                        <Badge className={cn("border-none", STATUS_PAGAMENTO_BADGE[v.status_pagamento])}>
                          {STATUS_PAGAMENTO_LABELS[v.status_pagamento]}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_PAGAMENTO_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleRemove(v.id)}>
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
