"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { clienteSchema, type ClienteFormValues } from "@/lib/schemas"
import type { EstagioFunil } from "@/lib/supabase/types"

function clean(values: ClienteFormValues) {
  return {
    ...values,
    email: values.email || null,
    telefone: values.telefone || null,
    empresa: values.empresa || null,
    endereco: values.endereco || null,
    origem: values.origem || null,
    observacoes: values.observacoes || null,
  }
}

export async function createCliente(values: ClienteFormValues) {
  const parsed = clienteSchema.parse(values)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from("clientes")
    .insert({ ...clean(parsed), created_by: user?.id })
    .select("id")
    .single()

  if (error) throw new Error(error.message)

  revalidatePath("/clientes")
  return data.id
}

export async function updateCliente(id: string, values: ClienteFormValues) {
  const parsed = clienteSchema.parse(values)
  const supabase = await createClient()

  const { error } = await supabase.from("clientes").update(clean(parsed)).eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath("/clientes")
  revalidatePath(`/clientes/${id}`)
}

export async function updateEstagioFunil(id: string, estagio_funil: EstagioFunil) {
  const supabase = await createClient()
  const { error } = await supabase.from("clientes").update({ estagio_funil }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/clientes")
}

export async function deleteCliente(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("clientes").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/clientes")
}
