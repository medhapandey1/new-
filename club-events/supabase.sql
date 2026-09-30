create table events (id uuid primary key default gen_random_uuid(), name text not null, category text not null, date timestamp not null, venue text not null, description text not null, featured boolean default false);
create table registrations (id uuid primary key default gen_random_uuid(), event_id uuid references events(id) on delete cascade, name text, email text, college text, year text, phone text, created_at timestamptz default now(), unique (event_id, email));
alter table events enable row level security; alter table registrations enable row level security;
create policy "public all events" on events for all using (true) with check (true);
create policy "public all regs" on registrations for all using (true) with check (true);
