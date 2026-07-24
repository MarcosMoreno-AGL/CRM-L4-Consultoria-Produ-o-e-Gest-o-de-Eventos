import { z } from "zod"

export const clienteSchema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  tipo: z.enum(["pessoa_fisica", "pessoa_juridica"]),
  email: z.union([z.email("E-mail inválido"), z.literal("")]).optional(),
  telefone: z.string().optional(),
  empresa: z.string().optional(),
  endereco: z.string().optional(),
  origem: z.enum(["indicacao", "instagram", "site", "outro"]).optional(),
  observacoes: z.string().optional(),
})
export type ClienteFormValues = z.infer<typeof clienteSchema>

export const eventoSchema = z.object({
  cliente_id: z.uuid("Selecione um cliente"),
  nome_evento: z.string().min(2, "Informe o nome do evento"),
  tipo_evento: z.enum(["casamento", "aniversario", "corporativo", "formatura", "outro"]),
  data_evento: z.string().optional(),
  local: z.string().optional(),
  numero_convidados: z.number().int().nonnegative().optional(),
  status: z.enum(["planejamento", "confirmado", "em_andamento", "concluido", "cancelado"]),
  orcamento_total: z.number().nonnegative(),
  observacoes: z.string().optional(),
})
export type EventoFormValues = z.infer<typeof eventoSchema>

export const fornecedorSchema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  categoria: z.enum(["buffet", "decoracao", "som_luz", "fotografia", "outro"]),
  contato: z.string().optional(),
  telefone: z.string().optional(),
  email: z.union([z.email("E-mail inválido"), z.literal("")]).optional(),
  observacoes: z.string().optional(),
})
export type FornecedorFormValues = z.infer<typeof fornecedorSchema>

export const eventoFornecedorSchema = z.object({
  fornecedor_id: z.uuid("Selecione um fornecedor"),
  valor_contratado: z.number().nonnegative(),
  status_pagamento: z.enum(["pendente", "pago", "atrasado"]),
})
export type EventoFornecedorFormValues = z.infer<typeof eventoFornecedorSchema>

export const checklistItemSchema = z.object({
  descricao: z.string().min(2, "Informe a tarefa"),
  prazo: z.string().optional(),
})
export type ChecklistItemFormValues = z.infer<typeof checklistItemSchema>

export const parcelaSchema = z.object({
  descricao: z.string().min(2, "Informe a descrição"),
  valor: z.number().positive("Informe um valor"),
  data_vencimento: z.string().min(1, "Informe a data de vencimento"),
  status: z.enum(["pendente", "pago", "atrasado"]),
  forma_pagamento: z
    .enum(["pix", "cartao", "boleto", "dinheiro", "transferencia", "outro"])
    .optional(),
})
export type ParcelaFormValues = z.infer<typeof parcelaSchema>
