import { redirect } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { InviteDialog } from "@/app/(app)/configuracoes/invite-dialog"
import { MembersTable } from "@/app/(app)/configuracoes/members-table"

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (currentProfile?.role !== "admin") {
    redirect("/dashboard")
  }

  const { data: members } = await supabase.from("profiles").select("*").order("created_at")

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Gerencie os membros da equipe.</p>
        </div>
        <InviteDialog />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <MembersTable members={members ?? []} currentUserId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}
