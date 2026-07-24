import type {
  CategoriaFornecedor,
  ClienteOrigem,
  ClienteTipo,
  EstagioFunil,
  FormaPagamento,
  StatusEvento,
  StatusPagamento,
  TipoEvento,
} from "@/lib/supabase/types"

export const ESTAGIO_FUNIL_LABELS: Record<EstagioFunil, string> = {
  novo: "Novo",
  contato_feito: "Contato feito",
  proposta_enviada: "Proposta enviada",
  negociacao: "Negociação",
  fechado_ganho: "Fechado (ganho)",
  fechado_perdido: "Fechado (perdido)",
}

export const ESTAGIO_FUNIL_ORDER: EstagioFunil[] = [
  "novo",
  "contato_feito",
  "proposta_enviada",
  "negociacao",
  "fechado_ganho",
  "fechado_perdido",
]

export const CLIENTE_TIPO_LABELS: Record<ClienteTipo, string> = {
  pessoa_fisica: "Pessoa física",
  pessoa_juridica: "Pessoa jurídica",
}

export const CLIENTE_ORIGEM_LABELS: Record<ClienteOrigem, string> = {
  indicacao: "Indicação",
  instagram: "Instagram",
  site: "Site",
  outro: "Outro",
}

export const TIPO_EVENTO_LABELS: Record<TipoEvento, string> = {
  casamento: "Casamento",
  aniversario: "Aniversário",
  corporativo: "Corporativo",
  formatura: "Formatura",
  outro: "Outro",
}

export const STATUS_EVENTO_LABELS: Record<StatusEvento, string> = {
  planejamento: "Planejamento",
  confirmado: "Confirmado",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
}

export const CATEGORIA_FORNECEDOR_LABELS: Record<CategoriaFornecedor, string> = {
  buffet: "Buffet",
  decoracao: "Decoração",
  som_luz: "Som e luz",
  fotografia: "Fotografia",
  outro: "Outro",
}

export const STATUS_PAGAMENTO_LABELS: Record<StatusPagamento, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
}

export const FORMA_PAGAMENTO_LABELS: Record<FormaPagamento, string> = {
  pix: "Pix",
  cartao: "Cartão",
  boleto: "Boleto",
  dinheiro: "Dinheiro",
  transferencia: "Transferência",
  outro: "Outro",
}

export const STATUS_EVENTO_BADGE: Record<StatusEvento, string> = {
  planejamento: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  confirmado: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  em_andamento: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  concluido: "bg-neutral-500/15 text-neutral-600 dark:text-neutral-400",
  cancelado: "bg-red-500/15 text-red-600 dark:text-red-400",
}

export const STATUS_PAGAMENTO_BADGE: Record<StatusPagamento, string> = {
  pendente: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  pago: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  atrasado: "bg-red-500/15 text-red-600 dark:text-red-400",
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

export function formatDate(value: string | null) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T00:00:00`))
}
