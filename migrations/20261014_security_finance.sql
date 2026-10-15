-- =========================================================================
-- MIGRASI 2026-10-14: KEAMANAN ADMIN, KAS, & REALTIME
-- Aman dijalankan berulang kali (idempotent) dan TIDAK menghapus data.
--
-- Cara menjalankan (pilih salah satu):
--   a) Tempel seluruh isi file ini di Supabase Dashboard -> SQL Editor -> Run
--   b) node setup_db.js migrations/20261014_security_finance.sql
--
-- SETELAH MENJALANKAN: daftarkan email admin (lihat langkah 6 di bawah).
-- =========================================================================

-- 1. DAFTAR ADMIN (ALLOWLIST)
-- Sebelumnya semua user yang login dianggap admin. Sekarang hanya email
-- yang terdaftar di tabel ini yang punya hak admin.
create table if not exists public.admins (
  email text primary key,
  created_at timestamptz default now()
);

alter table public.admins enable row level security;
-- Tidak ada policy: tabel ini tidak bisa dibaca/diubah dari client.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- 2. GANTI POLICY ADMIN LAMA (auth.role() = 'authenticated') -> is_admin()
drop policy if exists "Admin has full control on events" on events;
create policy "Admin has full control on events" on events
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin has full control on rundown" on rundown_items;
create policy "Admin has full control on rundown" on rundown_items
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin has full control on checkpoints" on checkpoints;
create policy "Admin has full control on checkpoints" on checkpoints
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin has full control on emergency contacts" on emergency_contacts;
create policy "Admin has full control on emergency contacts" on emergency_contacts
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Only admin can delete checklists" on bike_checklists;
create policy "Only admin can delete checklists" on bike_checklists
  for delete using (public.is_admin());

drop policy if exists "Only admin can delete check-ins" on check_ins;
create policy "Only admin can delete check-ins" on check_ins
  for delete using (public.is_admin());

-- 3. BUKU KAS: HANYA ADMIN YANG BOLEH MENULIS
-- Sebelumnya siapa pun bisa insert/update pengeluaran (buku kas bisa dipalsukan).
drop policy if exists "Anyone can insert event expenses" on event_expenses;
drop policy if exists "Anyone can update event expenses" on event_expenses;
drop policy if exists "Only admin can delete event expenses" on event_expenses;
drop policy if exists "Admin can insert event expenses" on event_expenses;
drop policy if exists "Admin can update event expenses" on event_expenses;

create policy "Admin can insert event expenses" on event_expenses
  for insert with check (public.is_admin());
create policy "Admin can update event expenses" on event_expenses
  for update using (public.is_admin()) with check (public.is_admin());
create policy "Only admin can delete event expenses" on event_expenses
  for delete using (public.is_admin());

-- 4. PENGATURAN IURAN, REKENING, & QRIS DISIMPAN DI DATABASE
-- Sebelumnya hanya tersimpan di localStorage browser admin, sehingga peserta
-- selalu melihat rekening contoh.
alter table events add column if not exists finance_config jsonb not null default '{}'::jsonb;

-- 4b. STATUS IURAN PESERTA (LUNAS / BELUM)
-- Memungkinkan bendahara/admin menandai peserta yang sudah membayar iuran
alter table public.participants add column if not exists is_paid boolean not null default false;

drop policy if exists "Admin can update participants" on participants;
create policy "Admin can update participants" on participants
  for update using (public.is_admin()) with check (public.is_admin());

-- 5. REALTIME UNTUK SEMUA TABEL YANG DIPANTAU APLIKASI
do $$
declare
  t text;
begin
  foreach t in array array['participants', 'bike_checklists', 'check_ins', 'events', 'checkpoints', 'rundown_items', 'event_expenses']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- 6. DAFTARKAN EMAIL ADMIN
-- Ganti email di bawah dengan email akun admin di Supabase Auth, hapus tanda "--", lalu jalankan:
-- insert into public.admins (email) values ('admin@contoh.com') on conflict do nothing;
