"use server"

import { Resend } from "resend"

import { createClient } from "@/lib/supabase/server"

export async function sendBulkEmail(clienteIds: string[], assunto: string, corpo: string) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY não configurada")
  }
  if (clienteIds.length === 0) throw new Error("Selecione ao menos um contato")

  const supabase = await createClient()
  const { data: clientes, error } = await supabase
    .from("clientes")
    .select("id, nome, email")
    .in("id", clienteIds)
  if (error) throw new Error(error.message)

  const destinatarios = (clientes ?? []).filter(
    (c): c is typeof c & { email: string } => !!c.email
  )
  if (destinatarios.length === 0) throw new Error("Nenhum contato selecionado tem e-mail cadastrado")

  const resend = new Resend(process.env.RESEND_API_KEY)
  const corpoHtml = corpo.replace(/\n/g, "<br/>")

  const resultados = await Promise.allSettled(
    destinatarios.map((cliente) =>
      resend.emails.send({
        from: "L4 Consultoria de Eventos <onboarding@resend.dev>",
        to: cliente.email,
        subject: assunto,
        html: corpoHtml.replace(/\{\{nome\}\}/g, cliente.nome),
      })
    )
  )

  const falhas = resultados.filter((r) => r.status === "rejected").length
  return { enviados: resultados.length - falhas, falhas, total: destinatarios.length }
}
