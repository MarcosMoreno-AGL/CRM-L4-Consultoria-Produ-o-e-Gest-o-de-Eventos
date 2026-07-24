"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { fornecedorSchema, type FornecedorFormValues } from "@/lib/schemas"

function clean(values: FornecedorFormValues) {
  return {
    ...values,
    contato: values.contato || null,
    telefone: values.telefone || null,
    email: values.email || null,
    observacoes: values.observacoes || null,
  }
}

export async function createFornecedor(values: FornecedorFormValues) {
  const parsed = fornecedorSchema.parse(values)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase
    .from("fornecedores")
    .insert({ ...clean(parsed), created_by: user?.id })

  if (error) throw new Error(error.message)
  revalidatePath("/fornecedores")
}

export async function updateFornecedor(id: string, values: FornecedorFormValues) {
  const parsed = fornecedorSchema.parse(values)
  const supabase = await createClient()
  const { error } = await supabase.from("fornecedores").update(clean(parsed)).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/fornecedores")
}

export async function deleteFornecedor(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("fornecedores").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/fornecedores")
}
