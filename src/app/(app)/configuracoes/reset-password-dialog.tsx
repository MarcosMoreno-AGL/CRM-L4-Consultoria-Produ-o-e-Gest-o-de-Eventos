"use client"

import * as React from "react"
import { toast } from "sonner"
import { KeyRound, Mail, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetMemberPassword } from "@/app/(app)/configuracoes/actions"
import { mailtoLink, whatsappLink } from "@/lib/contact-links"
import type { Database } from "@/lib/supabase/types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

function gerarSenhaSugerida(nome: string) {
  const primeiroNome = nome
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .split(" ")[0]
  const ano = new Date().getFullYear()
  return `${primeiroNome}@${ano}`
}

export function ResetPasswordDialog({ member }: { member: Profile }) {
  const [open, setOpen] = React.useState(false)
  const [password, setPassword] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [done, setDone] = React.useState(false)

  function handleOpenChange(v: boolean) {
    setOpen(v)
    if (v) {
      setPassword(gerarSenhaSugerida(member.nome))
      setDone(false)
    }
  }

  async function handleConfirm() {
    setSaving(true)
    try {
      await resetMemberPassword(member.id, password)
      setDone(true)
      toast.success("Senha redefinida")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao redefinir senha")
    } finally {
      setSaving(false)
    }
  }

  const loginUrl = typeof window !== "undefined" ? `${window.location.origin}/login` : "/login"
  const mensagem = `Olá ${member.nome}! Sua senha de acesso ao CRM da L4 Consultoria foi redefinida.\n\nAcesse: ${loginUrl}\nE-mail: ${member.email}\nNova senha: ${password}\n\nRecomendamos trocar a senha após o primeiro acesso.`

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button variant="ghost" size="icon-sm" onClick={() => handleOpenChange(true)} title="Resetar senha">
        <KeyRound />
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resetar senha de {member.nome}</DialogTitle>
        </DialogHeader>

        {!done ? (
          <>
            <div className="grid gap-2">
              <Label htmlFor="nova-senha">Nova senha</Label>
              <Input id="nova-senha" value={password} onChange={(e) => setPassword(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                Sugestão gerada automaticamente. Edite se quiser antes de confirmar.
              </p>
            </div>
            <DialogFooter>
              <Button disabled={saving || password.length < 8} onClick={handleConfirm}>
                {saving ? "Salvando..." : "Confirmar reset"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Senha redefinida. Envie a nova senha para {member.nome} por um dos canais abaixo.
            </p>
            <div className="flex gap-2">
              {member.telefone && (
                <a
                  href={whatsappLink(member.telefone, mensagem)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400"
                >
                  <MessageCircle className="size-4" /> WhatsApp
                </a>
              )}
              <a
                href={mailtoLink(member.email, "Nova senha de acesso — L4 CRM", mensagem)}
                className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-500/25 dark:text-blue-400"
              >
                <Mail className="size-4" /> E-mail
              </a>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
