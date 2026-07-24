create table public.fornecedores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text not null default 'outro' check (
    categoria in ('buffet', 'decoracao', 'som_luz', 'fotografia', 'outro')
  ),
  contato text,
  telefone text,
  email text,
  observacoes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fornecedores enable row level security;

create policy "fornecedores_select_team" on public.fornecedores
  for select to authenticated using (true);

create policy "fornecedores_insert_team" on public.fornecedores
  for insert to authenticated with check (true);

create policy "fornecedores_update_team" on public.fornecedores
  for update to authenticated using (true) with check (true);

create policy "fornecedores_delete_admin" on public.fornecedores
  for delete to authenticated using (public.is_admin());

create trigger fornecedores_set_updated_at
  before update on public.fornecedores
  for each row execute function public.set_updated_at();

-- Junction: fornecedores contratados por evento
create table public.evento_fornecedores (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  fornecedor_id uuid not null references public.fornecedores (id) on delete cascade,
  valor_contratado numeric(12, 2) not null default 0,
  status_pagamento text not null default 'pendente' check (
    status_pagamento in ('pendente', 'pago', 'atrasado')
  ),
  created_at timestamptz not null default now(),
  unique (evento_id, fornecedor_id)
);

create index evento_fornecedores_evento_id_idx on public.evento_fornecedores (evento_id);

alter table public.evento_fornecedores enable row level security;

create policy "evento_fornecedores_select_team" on public.evento_fornecedores
  for select to authenticated using (true);

create policy "evento_fornecedores_insert_team" on public.evento_fornecedores
  for insert to authenticated with check (true);

create policy "evento_fornecedores_update_team" on public.evento_fornecedores
  for update to authenticated using (true) with check (true);

create policy "evento_fornecedores_delete_team" on public.evento_fornecedores
  for delete to authenticated using (true);
