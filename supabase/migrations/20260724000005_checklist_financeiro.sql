create table public.checklist_itens (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  descricao text not null,
  concluido boolean not null default false,
  prazo date,
  responsavel uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index checklist_itens_evento_id_idx on public.checklist_itens (evento_id);

alter table public.checklist_itens enable row level security;

create policy "checklist_itens_select_team" on public.checklist_itens
  for select to authenticated using (true);

create policy "checklist_itens_insert_team" on public.checklist_itens
  for insert to authenticated with check (true);

create policy "checklist_itens_update_team" on public.checklist_itens
  for update to authenticated using (true) with check (true);

create policy "checklist_itens_delete_team" on public.checklist_itens
  for delete to authenticated using (true);

create table public.financeiro_parcelas (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  descricao text not null,
  valor numeric(12, 2) not null,
  data_vencimento date not null,
  data_pagamento date,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'atrasado')),
  forma_pagamento text check (forma_pagamento in ('pix', 'cartao', 'boleto', 'dinheiro', 'transferencia', 'outro')),
  created_at timestamptz not null default now()
);

create index financeiro_parcelas_evento_id_idx on public.financeiro_parcelas (evento_id);
create index financeiro_parcelas_status_idx on public.financeiro_parcelas (status);
create index financeiro_parcelas_data_vencimento_idx on public.financeiro_parcelas (data_vencimento);

alter table public.financeiro_parcelas enable row level security;

create policy "financeiro_parcelas_select_team" on public.financeiro_parcelas
  for select to authenticated using (true);

create policy "financeiro_parcelas_insert_team" on public.financeiro_parcelas
  for insert to authenticated with check (true);

create policy "financeiro_parcelas_update_team" on public.financeiro_parcelas
  for update to authenticated using (true) with check (true);

create policy "financeiro_parcelas_delete_team" on public.financeiro_parcelas
  for delete to authenticated using (true);
