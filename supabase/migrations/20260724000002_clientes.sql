create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null default 'pessoa_fisica' check (tipo in ('pessoa_fisica', 'pessoa_juridica')),
  email text,
  telefone text,
  empresa text,
  endereco text,
  origem text check (origem in ('indicacao', 'instagram', 'site', 'outro')),
  estagio_funil text not null default 'novo' check (
    estagio_funil in ('novo', 'contato_feito', 'proposta_enviada', 'negociacao', 'fechado_ganho', 'fechado_perdido')
  ),
  observacoes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clientes_estagio_funil_idx on public.clientes (estagio_funil);

alter table public.clientes enable row level security;

create policy "clientes_select_team" on public.clientes
  for select to authenticated using (true);

create policy "clientes_insert_team" on public.clientes
  for insert to authenticated with check (true);

create policy "clientes_update_team" on public.clientes
  for update to authenticated using (true) with check (true);

create policy "clientes_delete_admin" on public.clientes
  for delete to authenticated using (public.is_admin());

create trigger clientes_set_updated_at
  before update on public.clientes
  for each row execute function public.set_updated_at();
