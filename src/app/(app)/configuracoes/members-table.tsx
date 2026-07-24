"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { removeMember, updateMemberRole } from "@/app/(app)/configuracoes/actions"
import type { Database, ProfileRole } from "@/lib/supabase/types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export function MembersTable({ members, currentUserId }: { members: Profile[]; currentUserId: string }) {
  const router = useRouter()

  async function handleRoleChange(id: string, role: ProfileRole) {
    try {
      await updateMemberRole(id, role)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar perfil")
    }
  }

  async function handleRemove(member: Profile) {
    if (!confirm(`Remover o acesso de "${member.nome}"?`)) return
    try {
      await removeMember(member.id)
      toast.success("Membro removido")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover membro")
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Perfil</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell className="font-medium">{member.nome}</TableCell>
            <TableCell>{member.email}</TableCell>
            <TableCell>
              <Select
                value={member.role}
                onValueChange={(value) => handleRoleChange(member.id, value as ProfileRole)}
                disabled={member.id === currentUserId}
              >
                <SelectTrigger size="sm" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="membro">Membro</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              {member.id !== currentUserId && (
                <Button variant="ghost" size="icon-sm" onClick={() => handleRemove(member)}>
                  <Trash2 />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
