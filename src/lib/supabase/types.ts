export type ProfileRole = "admin" | "membro"
export type ClienteTipo = "pessoa_fisica" | "pessoa_juridica"
export type ClienteOrigem = "indicacao" | "instagram" | "site" | "outro"
export type EstagioFunil = "novo" | "reuniao_agendada" | "contrato_analise" | "fechado"
export type TipoEvento = "casamento" | "aniversario" | "corporativo" | "formatura" | "outro"
export type StatusEvento = "planejamento" | "confirmado" | "em_andamento" | "concluido" | "cancelado"
export type CategoriaFornecedor = "buffet" | "decoracao" | "som_luz" | "fotografia" | "outro"
export type StatusPagamento = "pendente" | "pago" | "atrasado"
export type FormaPagamento = "pix" | "cartao" | "boleto" | "dinheiro" | "transferencia" | "outro"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nome: string
          email: string
          telefone: string | null
          role: ProfileRole
          created_at: string
        }
        Insert: {
          id: string
          nome: string
          email: string
          telefone?: string | null
          role?: ProfileRole
        }
        Update: {
          nome?: string
          email?: string
          telefone?: string | null
          role?: ProfileRole
        }
        Relationships: []
      }
      clientes: {
        Row: {
          id: string
          nome: string
          tipo: ClienteTipo
          email: string | null
          telefone: string | null
          empresa: string | null
          endereco: string | null
          origem: ClienteOrigem | null
          estagio_funil: EstagioFunil
          observacoes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          tipo?: ClienteTipo
          email?: string | null
          telefone?: string | null
          empresa?: string | null
          endereco?: string | null
          origem?: ClienteOrigem | null
          estagio_funil?: EstagioFunil
          observacoes?: string | null
          created_by?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["clientes"]["Insert"]>
        Relationships: []
      }
      eventos: {
        Row: {
          id: string
          cliente_id: string
          nome_evento: string
          tipo_evento: TipoEvento
          data_evento: string | null
          local: string | null
          numero_convidados: number | null
          status: StatusEvento
          orcamento_total: number
          observacoes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cliente_id: string
          nome_evento: string
          tipo_evento?: TipoEvento
          data_evento?: string | null
          local?: string | null
          numero_convidados?: number | null
          status?: StatusEvento
          orcamento_total?: number
          observacoes?: string | null
          created_by?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["eventos"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "eventos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          id: string
          nome: string
          categoria: CategoriaFornecedor
          contato: string | null
          telefone: string | null
          email: string | null
          observacoes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          categoria?: CategoriaFornecedor
          contato?: string | null
          telefone?: string | null
          email?: string | null
          observacoes?: string | null
          created_by?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["fornecedores"]["Insert"]>
        Relationships: []
      }
      evento_fornecedores: {
        Row: {
          id: string
          evento_id: string
          fornecedor_id: string
          valor_contratado: number
          status_pagamento: StatusPagamento
          created_at: string
        }
        Insert: {
          id?: string
          evento_id: string
          fornecedor_id: string
          valor_contratado?: number
          status_pagamento?: StatusPagamento
        }
        Update: Partial<Database["public"]["Tables"]["evento_fornecedores"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "evento_fornecedores_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_itens: {
        Row: {
          id: string
          evento_id: string
          descricao: string
          concluido: boolean
          prazo: string | null
          responsavel: string | null
          created_at: string
        }
        Insert: {
          id?: string
          evento_id: string
          descricao: string
          concluido?: boolean
          prazo?: string | null
          responsavel?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["checklist_itens"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "checklist_itens_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_parcelas: {
        Row: {
          id: string
          evento_id: string
          descricao: string
          valor: number
          data_vencimento: string
          data_pagamento: string | null
          status: StatusPagamento
          forma_pagamento: FormaPagamento | null
          created_at: string
        }
        Insert: {
          id?: string
          evento_id: string
          descricao: string
          valor: number
          data_vencimento: string
          data_pagamento?: string | null
          status?: StatusPagamento
          forma_pagamento?: FormaPagamento | null
        }
        Update: Partial<Database["public"]["Tables"]["financeiro_parcelas"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "financeiro_parcelas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
