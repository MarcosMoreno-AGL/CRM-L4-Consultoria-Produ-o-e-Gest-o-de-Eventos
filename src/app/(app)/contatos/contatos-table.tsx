"use client"

import * as React from "react"
import { Mail, MessageCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ESTAGIO_FUNIL_LABELS } from "@/lib/labels"
import { whatsappLink } from "@/lib/contact-links"
import { sendBulkEmail } from "@/app/(app)/contatos/actions"
import type { Database } from "@/lib/supabase/types"

type Contato = Pick<
  Database["public"]["Tables"]["clientes"]["Row"],
  "id" | "nome" | "email" | "telefone" | "empresa" | "estagio_funil"
>

export function ContatosTable({ clientes }: { clientes: Contato[] }) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [emailOpen, setEmailOpen] = React.useState(false)
  const [whatsappOpen, setWhatsappOpen] = React.useState(false)

  const allSelected = clientes.length > 0 && selected.size === clientes.length

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(clientes.map((c) => c.id)))
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selecionados = clientes.filter((c) => selected.has(c.id))

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={selected.size === 0}
          onClick={() => setEmailOpen(true)}
        >
          <Mail /> Enviar e-mail ({selected.size})
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={selected.size === 0}
          onClick={() => setWhatsappOpen(true)}
        >
          <MessageCircle /> Enviar WhatsApp ({selected.size})
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            </TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Estágio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell>
                <Checkbox
                  checked={selected.has(cliente.id)}
                  onCheckedChange={() => toggleOne(cliente.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{cliente.nome}</TableCell>
              <TableCell>{cliente.empresa ?? "—"}</TableCell>
              <TableCell>{cliente.email ?? "—"}</TableCell>
              <TableCell>{cliente.telefone ?? "—"}</TableCell>
              <TableCell>{ESTAGIO_FUNIL_LABELS[cliente.estagio_funil]}</TableCell>
            </TableRow>
          ))}
          {clientes.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Nenhum contato cadastrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <EmailDialog open={emailOpen} onOpenChange={setEmailOpen} contatos={selecionados} />
      <WhatsappDialog open={whatsappOpen} onOpenChange={setWhatsappOpen} contatos={selecionados} />
    </div>
  )
}

function EmailDialog({
  open,
  onOpenChange,
  contatos,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  contatos: Contato[]
}) {
  const [assunto, setAssunto] = React.useState("")
  const [corpo, setCorpo] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const comEmail = contatos.filter((c) => c.email)

  async function handleSend() {
    setSending(true)
    try {
      const result = await sendBulkEmail(
        contatos.map((c) => c.id),
        assunto,
        corpo
      )
      toast.success(`${result.enviados} e-mail(s) enviado(s)${result.falhas ? `, ${result.falhas} falha(s)` : ""}`)
      onOpenChange(false)
      setAssunto("")
      setCorpo("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar e-mails")
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar e-mail em massa</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {comEmail.length} de {contatos.length} contato(s) selecionado(s) têm e-mail cadastrado. Use{" "}
          <code>{"{{nome}}"}</code> no corpo para personalizar.
        </p>
        <div className="grid gap-3">
          <Input placeholder="Assunto" value={assunto} onChange={(e) => setAssunto(e.target.value)} />
          <Textarea
            placeholder="Mensagem..."
            rows={6}
            value={corpo}
            onChange={(e) => setCorpo(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            disabled={sending || !assunto || !corpo || comEmail.length === 0}
            onClick={handleSend}
          >
            {sending ? "Enviando..." : `Enviar para ${comEmail.length}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function WhatsappDialog({
  open,
  onOpenChange,
  contatos,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  contatos: Contato[]
}) {
  const [mensagem, setMensagem] = React.useState("")
  const [started, setStarted] = React.useState(false)
  const [index, setIndex] = React.useState(0)
  const comTelefone = contatos.filter((c) => c.telefone)
  const atual = comTelefone[index]

  function reset() {
    setStarted(false)
    setIndex(0)
    setMensagem("")
  }

  function abrirAtual() {
    if (!atual?.telefone) return
    const texto = mensagem.replace(/\{\{nome\}\}/g, atual.nome)
    window.open(whatsappLink(atual.telefone, texto), "_blank", "noopener,noreferrer")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) reset()
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar WhatsApp em massa</DialogTitle>
        </DialogHeader>

        {!started ? (
          <>
            <p className="text-sm text-muted-foreground">
              {comTelefone.length} de {contatos.length} contato(s) selecionado(s) têm telefone cadastrado. Cada
              contato abre uma conversa no WhatsApp Web/App — um envio por vez, você confirma o envio em cada
              conversa.
            </p>
            <Textarea
              placeholder="Mensagem... use {{nome}} para personalizar"
              rows={5}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
            />
            <DialogFooter>
              <Button disabled={!mensagem || comTelefone.length === 0} onClick={() => setStarted(true)}>
                Iniciar envio
              </Button>
            </DialogFooter>
          </>
        ) : index < comTelefone.length ? (
          <>
            <p className="text-sm">
              Contato {index + 1} de {comTelefone.length}: <span className="font-medium">{atual.nome}</span> ·{" "}
              {atual.telefone}
            </p>
            <DialogFooter className="gap-2 sm:justify-between">
              <Button variant="outline" onClick={() => setIndex((i) => i + 1)}>
                Pular
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={abrirAtual}>
                  Abrir WhatsApp
                </Button>
                <Button onClick={() => setIndex((i) => i + 1)}>Próximo contato</Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Envio finalizado para todos os contatos selecionados.</p>
            <DialogFooter>
              <Button
                onClick={() => {
                  onOpenChange(false)
                  reset()
                }}
              >
                Fechar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
