"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  FORMA_PAGAMENTO_LABELS,
  STATUS_PAGAMENTO_BADGE,
  STATUS_PAGAMENTO_LABELS,
  formatCurrency,
  formatDate,
} from "@/lib/labels"
import { cn } from "@/lib/utils"
import { parcelaSchema, type ParcelaFormValues } from "@/lib/schemas"
import { addParcela, deleteParcela, updateParcelaStatus } from "@/app/(app)/eventos/actions"
import type { Database, StatusPagamento } from "@/lib/supabase/types"

type Parcela = Database["public"]["Tables"]["financeiro_parcelas"]["Row"]

export function Parcelas({ eventoId, parcelas }: { eventoId: string; parcelas: Parcela[] }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  const form = useForm<ParcelaFormValues>({
    resolver: zodResolver(parcelaSchema),
    defaultValues: { descricao: "", valor: 0, data_vencimento: "", status: "pendente" },
  })

  async function onSubmit(values: ParcelaFormValues) {
    try {
      await addParcela(eventoId, values)
      toast.success("Parcela adicionada")
      form.reset()
      setOpen(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao adicionar parcela")
    }
  }

  async function handleStatusChange(id: string, status: StatusPagamento) {
    try {
      await updateParcelaStatus(id, eventoId, status)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar status")
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteParcela(id, eventoId)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover parcela")
    }
  }

  const total = parcelas.reduce((sum, p) => sum + p.valor, 0)
  const recebido = parcelas.filter((p) => p.status === "pago").reduce((sum, p) => sum + p.valor, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Financeiro</CardTitle>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(recebido)} recebido de {formatCurrency(total)}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus /> Nova parcela
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova parcela</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex.: Sinal, 2ª parcela..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="valor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor (R$)</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="data_vencimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vencimento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(STATUS_PAGAMENTO_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
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
                    name="forma_pagamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forma</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(FORMA_PAGAMENTO_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
        {parcelas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma parcela cadastrada.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {parcelas.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.descricao}</TableCell>
                  <TableCell>{formatCurrency(p.valor)}</TableCell>
                  <TableCell>{formatDate(p.data_vencimento)}</TableCell>
                  <TableCell>
                    <Select
                      value={p.status}
                      onValueChange={(value) => handleStatusChange(p.id, value as StatusPagamento)}
                    >
                      <SelectTrigger size="sm" className="w-32">
                        <Badge className={cn("border-none", STATUS_PAGAMENTO_BADGE[p.status])}>
                          {STATUS_PAGAMENTO_LABELS[p.status]}
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
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(p.id)}>
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
