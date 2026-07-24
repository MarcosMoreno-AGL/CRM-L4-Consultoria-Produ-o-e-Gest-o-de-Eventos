create table public.eventos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  nome_evento text not null,
  tipo_evento text not null default 'outro' check (
    tipo_evento in ('casamento', 'aniversario', 'corporativo', 'formatura', 'outro')
  ),
  data_evento date,
  local text,
  numero_convidados integer,
  status text not null default 'planejamento' check (
    status in ('planejamento', 'confirmado', 'em_andamento', 'concluido', 'cancelado')
  ),
  orcamento_total numeric(12, 2) not null default 0,
  observacoes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index eventos_cliente_id_idx on public.eventos (cliente_id);
create index eventos_data_evento_idx on public.eventos (data_evento);
create index eventos_status_idx on public.eventos (status);

alter table public.eventos enable row level security;

create policy "eventos_select_team" on public.eventos
  for select to authenticated using (true);

create policy "eventos_insert_team" on public.eventos
  for insert to authenticated with check (true);

create policy "eventos_update_team" on public.eventos
  for update to authenticated using (true) with check (true);

create policy "eventos_delete_admin" on public.eventos
  for delete to authenticated using (public.is_admin());

create trigger eventos_set_updated_at
  before update on public.eventos
  for each row execute function public.set_updated_at();
