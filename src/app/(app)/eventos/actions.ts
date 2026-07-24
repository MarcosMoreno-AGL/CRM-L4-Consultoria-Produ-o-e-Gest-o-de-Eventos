"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  checklistItemSchema,
  eventoFornecedorSchema,
  eventoSchema,
  parcelaSchema,
  type ChecklistItemFormValues,
  type EventoFormValues,
  type EventoFornecedorFormValues,
  type ParcelaFormValues,
} from "@/lib/schemas"

function cleanEvento(values: EventoFormValues) {
  return {
    ...values,
    data_evento: values.data_evento || null,
    local: values.local || null,
    numero_convidados: values.numero_convidados ?? null,
    observacoes: values.observacoes || null,
  }
}

export async function createEvento(values: EventoFormValues) {
  const parsed = eventoSchema.parse(values)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from("eventos")
    .insert({ ...cleanEvento(parsed), created_by: user?.id })
    .select("id")
    .single()

  if (error) throw new Error(error.message)
  revalidatePath("/eventos")
  revalidatePath(`/clientes/${parsed.cliente_id}`)
  return data.id
}

export async function updateEvento(id: string, values: EventoFormValues) {
  const parsed = eventoSchema.parse(values)
  const supabase = await createClient()
  const { error } = await supabase.from("eventos").update(cleanEvento(parsed)).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/eventos")
  revalidatePath(`/eventos/${id}`)
}

export async function deleteEvento(id: string, clienteId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("eventos").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/eventos")
  revalidatePath(`/clientes/${clienteId}`)
}

// Checklist
export async function addChecklistItem(eventoId: string, values: ChecklistItemFormValues) {
  const parsed = checklistItemSchema.parse(values)
  const supabase = await createClient()
  const { error } = await supabase.from("checklist_itens").insert({
    evento_id: eventoId,
    descricao: parsed.descricao,
    prazo: parsed.prazo || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/eventos/${eventoId}`)
}

export async function toggleChecklistItem(id: string, eventoId: string, concluido: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from("checklist_itens").update({ concluido }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath(`/eventos/${eventoId}`)
}

export async function deleteChecklistItem(id: string, eventoId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("checklist_itens").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath(`/eventos/${eventoId}`)
}

// Fornecedores contratados
export async function addEventoFornecedor(eventoId: string, values: EventoFornecedorFormValues) {
  const parsed = eventoFornecedorSchema.parse(values)
  const supabase = await createClient()
  const { error } = await supabase.from("evento_fornecedores").insert({
    evento_id: eventoId,
    ...parsed,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/eventos/${eventoId}`)
}

export async function updateEventoFornecedorStatus(
  id: string,
  eventoId: string,
  status_pagamento: EventoFornecedorFormValues["status_pagamento"]
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("evento_fornecedores")
    .update({ status_pagamento })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath(`/eventos/${eventoId}`)
}

export async function removeEventoFornecedor(id: string, eventoId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("evento_fornecedores").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath(`/eventos/${eventoId}`)
}

// Parcelas financeiras
export async function addParcela(eventoId: string, values: ParcelaFormValues) {
  const parsed = parcelaSchema.parse(values)
  const supabase = await createClient()
  const { error } = await supabase.from("financeiro_parcelas").insert({
    evento_id: eventoId,
    ...parsed,
    forma_pagamento: parsed.forma_pagamento || null,
    data_pagamento: parsed.status === "pago" ? new Date().toISOString().slice(0, 10) : null,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/eventos/${eventoId}`)
  revalidatePath("/financeiro")
}

export async function updateParcelaStatus(
  id: string,
  eventoId: string,
  status: ParcelaFormValues["status"]
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("financeiro_parcelas")
    .update({
      status,
      data_pagamento: status === "pago" ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath(`/eventos/${eventoId}`)
  revalidatePath("/financeiro")
}

export async function deleteParcela(id: string, eventoId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("financeiro_parcelas").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath(`/eventos/${eventoId}`)
  revalidatePath("/financeiro")
}
