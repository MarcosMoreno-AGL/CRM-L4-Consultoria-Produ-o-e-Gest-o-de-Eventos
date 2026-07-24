import { createClient } from "@/lib/supabase/server"
import { EventoDialog } from "@/app/(app)/eventos/evento-dialog"
import { EventosTable } from "@/app/(app)/eventos/eventos-table"

export default async function EventosPage() {
  const supabase = await createClient()
  const [{ data: eventos }, { data: clientes }] = await Promise.all([
    supabase
      .from("eventos")
      .select("*, clientes(nome)")
      .order("data_evento", { ascending: true, nullsFirst: false }),
    supabase.from("clientes").select("id, nome").order("nome"),
  ])

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground">Todos os eventos em andamento e planejados.</p>
        </div>
        <EventoDialog clientes={clientes ?? []} />
      </div>
      <EventosTable eventos={eventos ?? []} />
    </div>
  )
}
