"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { ProfileRole } from "@/lib/supabase/types"

const inviteSchema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  email: z.email("E-mail inválido"),
  telefone: z.string().optional(),
  password: z.string().min(8, "Mínimo de 8 caracteres"),
  role: z.enum(["admin", "membro"]),
})
export type InviteFormValues = z.infer<typeof inviteSchema>

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Mínimo de 8 caracteres")
    .regex(/[A-Za-z]/, "Inclua ao menos uma letra")
    .regex(/[0-9]/, "Inclua ao menos um número"),
})

async function assertAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") throw new Error("Apenas administradores podem gerenciar a equipe")
}

export async function inviteMember(values: InviteFormValues) {
  await assertAdmin()
  const parsed = inviteSchema.parse(values)

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.email,
    password: parsed.password,
    email_confirm: true,
    user_metadata: { nome: parsed.nome, telefone: parsed.telefone, role: parsed.role },
  })
  if (error) throw new Error(error.message)

  // Trigger creates the profile row; make sure role/nome/telefone match in case metadata coalesce differs
  await admin
    .from("profiles")
    .update({ nome: parsed.nome, telefone: parsed.telefone, role: parsed.role })
    .eq("id", data.user.id)

  revalidatePath("/configuracoes")
}

export async function resetMemberPassword(id: string, password: string) {
  await assertAdmin()
  const parsed = resetPasswordSchema.parse({ password })

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(id, { password: parsed.password })
  if (error) throw new Error(error.message)
}

export async function updateMemberRole(id: string, role: ProfileRole) {
  await assertAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from("profiles").update({ role }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/configuracoes")
}

export async function removeMember(id: string) {
  await assertAdmin()
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) throw new Error(error.message)
  revalidatePath("/configuracoes")
}
