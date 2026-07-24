import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClienteDialog } from "@/app/(app)/clientes/cliente-dialog"
import { KanbanBoard } from "@/app/(app)/clientes/kanban-board"
import { ClientesTable } from "@/app/(app)/clientes/clientes-table"

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Funil de vendas e cadastro de clientes.</p>
        </div>
        <ClienteDialog />
      </div>

      <Tabs defaultValue="funil">
        <TabsList>
          <TabsTrigger value="funil">Funil</TabsTrigger>
          <TabsTrigger value="lista">Lista</TabsTrigger>
        </TabsList>
        <TabsContent value="funil">
          <KanbanBoard clientes={clientes ?? []} />
        </TabsContent>
        <TabsContent value="lista">
          <ClientesTable clientes={clientes ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
