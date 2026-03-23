-- COCKPIT — Execute no SQL Editor do Supabase

create table public.projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  star text,
  status text not null default 'active' check (status in ('active','parked','done')),
  color text default '#f5c842',
  priority integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  start_time timestamptz not null default now(),
  end_time timestamptz,
  what_did text,
  next_step text,
  mood integer check (mood between 1 and 5),
  duration_minutes integer default 0,
  created_at timestamptz default now()
);

create table public.decisions (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  decided text,
  reason text,
  status text default 'active',
  decided_at date default current_date,
  created_at timestamptz default now()
);

create table public.blockers (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  description text not null,
  blocker_type text default 'técnico',
  resolved boolean default false,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending','active','done')),
  priority text not null default 'medium' check (priority in ('urgent','high','medium','low')),
  category text,
  sort_order integer default 0,
  created_at timestamptz default now(),
  completed_at timestamptz
);

create index idx_sessions_project on public.sessions(project_id);
create index idx_tasks_project on public.tasks(project_id);
create index idx_decisions_project on public.decisions(project_id);
create index idx_blockers_project on public.blockers(project_id);

alter table public.projects enable row level security;
alter table public.sessions enable row level security;
alter table public.decisions enable row level security;
alter table public.blockers enable row level security;
alter table public.tasks enable row level security;

create policy "allow_all" on public.projects for all using (true) with check (true);
create policy "allow_all" on public.sessions for all using (true) with check (true);
create policy "allow_all" on public.decisions for all using (true) with check (true);
create policy "allow_all" on public.blockers for all using (true) with check (true);
create policy "allow_all" on public.tasks for all using (true) with check (true);

create or replace function public.handle_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
create trigger projects_updated_at before update on public.projects for each row execute function public.handle_updated_at();

insert into public.projects (name,description,star,status,color,priority) values
  ('Rutin','Coach de estudos via WhatsApp para concurseiros','Renda recorrente que me sustenta sem depender de cliente.','active','#f5c842',1),
  ('Sistemas Sob Medida','Desenvolvimento web para negócios locais da Baixada Santista','Independência financeira construída no meu território.','active','#3af0a2',2),
  ('Método Invisível','Ebook de fotos profissionais com IA','Produto digital passivo que vende enquanto durmo.','parked','#6ea8ff',null);
