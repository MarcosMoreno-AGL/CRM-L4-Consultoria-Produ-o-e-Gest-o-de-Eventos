import { createClient } from "@/lib/supabase/server"
import { ContatosTable } from "@/app/(app)/contatos/contatos-table"

export default async function ContatosPage() {
  const supabase = await createClient()
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nome, email, telefone, empresa, estagio_funil")
    .order("nome", { ascending: true })

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contatos</h1>
        <p className="text-muted-foreground">
          Selecione contatos para enviar e-mail ou WhatsApp em massa.
        </p>
      </div>
      <ContatosTable clientes={clientes ?? []} />
    </div>
  )
}
