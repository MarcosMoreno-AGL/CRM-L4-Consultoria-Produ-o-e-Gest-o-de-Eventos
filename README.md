# L4 CRM

CRM da L4 Consultoria de Eventos — gestão de clientes (funil de vendas), eventos, fornecedores e financeiro.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Supabase](https://supabase.com) (Postgres + Auth + Row Level Security)
- Tailwind CSS + [shadcn/ui](https://ui.shadcn.com)
- React Hook Form + Zod

## Configuração

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env.local` e preencha com as credenciais do seu projeto Supabase (Project Settings → API Keys).
3. Rode as migrations em `supabase/migrations/` no SQL Editor do Supabase (na ordem dos arquivos).
4. Crie o primeiro usuário admin em Authentication → Users no painel do Supabase e defina `role = 'admin'` na tabela `profiles`.
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Estrutura

- `src/app/(app)` — páginas autenticadas (dashboard, clientes, eventos, fornecedores, financeiro, configurações)
- `src/app/login` — autenticação
- `src/lib/supabase` — clients Supabase (browser, server, admin) e tipos do banco
- `src/lib/schemas.ts` — validação de formulários (Zod)
- `supabase/migrations` — schema SQL e políticas de RLS
