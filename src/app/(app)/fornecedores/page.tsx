import { createClient } from "@/lib/supabase/server"
import { FornecedorDialog } from "@/app/(app)/fornecedores/fornecedor-dialog"
import { FornecedoresTable } from "@/app/(app)/fornecedores/fornecedores-table"

export default async function FornecedoresPage() {
  const supabase = await createClient()
  const { data: fornecedores } = await supabase
    .from("fornecedores")
    .select("*")
    .order("nome")

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fornecedores</h1>
          <p className="text-muted-foreground">Parceiros e prestadores de serviço.</p>
        </div>
        <FornecedorDialog />
      </div>
      <FornecedoresTable fornecedores={fornecedores ?? []} />
    </div>
  )
}
