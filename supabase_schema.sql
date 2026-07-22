-- =========================================================================
-- KUMPULRODA DATABASE SCHEMA & SEED DATA
-- Jalankan skrip ini di SQL Editor di dashboard Supabase Anda.
-- =========================================================================

-- Hapus tabel lama jika ada (opsional, untuk clean setup)
drop table if exists check_ins cascade;
drop table if exists bike_checklists cascade;
drop table if exists participants cascade;
drop table if exists emergency_contacts cascade;
drop table if exists checkpoints cascade;
drop table if exists rundown_items cascade;
drop table if exists events cascade;

-- 1. TABEL EVENTS
create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date timestamptz not null,
  meeting_point text not null,
  road_captain text not null,
  sweeper text not null,
  rules_text text[] not null,
  map_embed_url text not null,
  map_destination_lat double precision not null,
  map_destination_lng double precision not null,
  contacts jsonb default '{"mekanik": {"name": "Pak Eko (Mekanik)", "whatsapp": "6281234567890"}, "sweeper": {"name": "Dani (Sweeper)", "whatsapp": "6281298765432"}}'::jsonb,
  created_at timestamptz default now()
);

-- 2. TABEL RUNDOWN ITEMS
create table rundown_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  time_label text not null,
  title text not null,
  description text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- 3. TABEL CHECKPOINTS
create table checkpoints (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  radius_m integer default 200 not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- 4. TABEL EMERGENCY CONTACTS
create table emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  role text check (role in ('mekanik', 'sweeper')) not null,
  name text not null,
  whatsapp text not null,
  created_at timestamptz default now()
);

-- 5. TABEL PARTICIPANTS
create table participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  name text not null,
  whatsapp text not null,
  motor_type text not null,
  ride_status text check (ride_status in ('solo', 'boncengan')) default 'solo' not null,
  bike_ready boolean default false not null,
  latitude double precision,
  longitude double precision,
  last_seen_at timestamptz,
  sos_active boolean default false not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- 6. TABEL BIKE CHECKLISTS
create table bike_checklists (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade not null unique,
  tires_ok boolean default false not null,
  brakes_ok boolean default false not null,
  lights_ok boolean default false not null,
  fluids_ok boolean default false not null,
  documents_ok boolean default false not null,
  updated_at timestamptz default now()
);

-- 7. TABEL CHECK-INS
create table check_ins (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade not null,
  checkpoint_id uuid references checkpoints(id) on delete cascade not null,
  latitude double precision not null,
  longitude double precision not null,
  checked_in_at timestamptz default now(),
  unique (participant_id, checkpoint_id) -- Mencegah check-in ganda di checkpoint yang sama
);

-- =========================================================================
-- TRIGGER OTOMATIS UNTUK MEMBUAT BIKE_CHECKLIST SAAT PESERTA MENDAFTAR (RSVP)
-- =========================================================================
create or replace function public.handle_new_participant()
returns trigger as $$
begin
  insert into public.bike_checklists (participant_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_participant_created
  after insert on public.participants
  for each row execute function public.handle_new_participant();

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- =========================================================================

-- Aktifkan RLS di semua tabel
alter table events enable row level security;
alter table rundown_items enable row level security;
alter table checkpoints enable row level security;
alter table emergency_contacts enable row level security;
alter table participants enable row level security;
alter table bike_checklists enable row level security;
alter table check_ins enable row level security;

-- Kebijakan untuk tabel PUBLIK / READ-ONLY untuk anggota
create policy "Events are readable by everyone" on events for select using (true);
create policy "Rundown items are readable by everyone" on rundown_items for select using (true);
create policy "Checkpoints are readable by everyone" on checkpoints for select using (true);
create policy "Emergency contacts are readable by everyone" on emergency_contacts for select using (true);

-- Kebijakan untuk tabel PARTICIPANTS (Semua orang bisa daftar dan baca, admin bebas kelola)
create policy "Participants are readable by everyone" on participants for select using (true);
create policy "Anyone can insert a participant" on participants for insert with check (true);
create policy "Anyone can update their participant record" on participants for update using (true);
create policy "Anyone can delete their participant record" on participants for delete using (true);

-- Kebijakan untuk tabel BIKE_CHECKLISTS (Setiap peserta bisa baca dan update checklistnya sendiri/anonim)
create policy "Checklists are readable by everyone" on bike_checklists for select using (true);
create policy "Anyone can insert checklists" on bike_checklists for insert with check (true);
create policy "Anyone can update checklists" on bike_checklists for update using (true);
create policy "Only admin can delete checklists" on bike_checklists for delete using (auth.role() = 'authenticated');

-- Kebijakan untuk tabel CHECK_INS (Semua orang bisa baca dan check-in)
create policy "Check-ins are readable by everyone" on check_ins for select using (true);
create policy "Anyone can check-in" on check_ins for insert with check (true);
create policy "Only admin can delete check-ins" on check_ins for delete using (auth.role() = 'authenticated');

-- Kebijakan penuh untuk ADMIN (authenticated user) di tabel master data
create policy "Admin has full control on events" on events using (auth.role() = 'authenticated');
create policy "Admin has full control on rundown" on rundown_items using (auth.role() = 'authenticated');
create policy "Admin has full control on checkpoints" on checkpoints using (auth.role() = 'authenticated');
create policy "Admin has full control on emergency contacts" on emergency_contacts using (auth.role() = 'authenticated');

-- =========================================================================
-- AKTIFKAN SUPABASE REALTIME UNTUK TABEL YANG DIBUTUHKAN
-- =========================================================================
begin;
  -- Hapus publikasi jika ada, lalu buat ulang
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table bike_checklists;
alter publication supabase_realtime add table check_ins;

-- =========================================================================
-- SEED DATA AWAL (DEFAULT TOURING BANDUNG)
-- =========================================================================

-- 1. Insert Event Utama
insert into events (id, name, event_date, meeting_point, road_captain, sweeper, rules_text, map_embed_url, map_destination_lat, map_destination_lng)
values (
  '11111111-1111-1111-1111-111111111111',
  'Bandung Rideout: KumpulRoda Klub Motor',
  '2026-07-18 06:00:00+07',
  'SPBU Pertamina Pasti Pas, MT Haryono Jakarta',
  'Roni (Honda ADV 160)',
  'Dani (Vespa Sprint 150)',
  array[
    'Wajib menggunakan helm Fullface/Halfface ber-SNI.',
    'Dilarang mendahului Road Captain (RC) dalam kondisi apa pun.',
    'Menjaga jarak aman minimal 3-5 meter dengan motor di depan.',
    'Nyalakan lampu utama (headlight) sepanjang jalan untuk keselamatan.',
    'Gunakan isyarat tangan (hand signal) standar kelompok konvoi.',
    'Jika terjadi kendala darurat, segera tepikan motor dan tekan tombol SOS.'
  ],
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1014169.6468798369!2d107.03975765!3d-6.818361099999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e63982460773%3A0x146ad5022e43965!2sGedung%20Sate!5e0!3m2!1sid!2sid!4v1720970000000!5m2!1sid!2sid',
  -6.902481,
  107.618784
);

-- 2. Insert Rundown
insert into rundown_items (event_id, time_label, title, description, sort_order) values
('11111111-1111-1111-1111-111111111111', '06.00', 'Kumpul & Briefing', 'SPBU Pertamina Pasti Pas, MT Haryono Jakarta', 1),
('11111111-1111-1111-1111-111111111111', '06.30', 'Keberangkatan (Departure)', 'Konvoi dipimpin oleh Road Captain menuju KM 57', 2),
('11111111-1111-1111-1111-111111111111', '08.00', 'Checkpoint 1 (Rest Area KM 57)', 'Istirahat, isi bahan bakar, dan verifikasi check-in', 3),
('11111111-1111-1111-1111-111111111111', '08.30', 'Perjalanan Sesi 2', 'Melanjutkan perjalanan via Purwakarta ke Padalarang', 4),
('11111111-1111-1111-1111-111111111111', '10.30', 'Checkpoint 2 (Kopi Nurul Padalarang)', 'Coffee break & regroup barisan konvoi', 5),
('11111111-1111-1111-1111-111111111111', '12.00', 'Finish & Lunch (Gedung Sate)', 'Tiba di destinasi Bandung, foto bersama, & makan siang', 6);

-- 3. Insert Checkpoints
insert into checkpoints (id, event_id, name, latitude, longitude, radius_m, sort_order) values
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Checkpoint 1: Rest Area KM 57 Cikampek', -6.377668, 107.299596, 200, 1),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Checkpoint 2: Kopi Nurul Padalarang', -6.840248, 107.472132, 200, 2);

-- 4. Insert Emergency Contacts
insert into emergency_contacts (event_id, role, name, whatsapp) values
('11111111-1111-1111-1111-111111111111', 'mekanik', 'Pak Eko (Mekanik)', '6281234567890'),
('11111111-1111-1111-1111-111111111111', 'sweeper', 'Dani (Sweeper)', '6281298765432');

-- 5. Insert Seed Participants
insert into participants (id, event_id, name, whatsapp, motor_type, ride_status, bike_ready) values
('10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Budi Hartono', '628111111111', 'Honda ADV 160', 'solo', true),
('10000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Sari Wulandari', '628122222222', 'Yamaha Xabre', 'boncengan', false),
('10000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Rian Hidayat', '628133333333', 'Kawasaki Ninja 250', 'solo', true),
('10000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Agus Setiawan', '628144444444', 'Yamaha NMax', 'boncengan', true),
('10000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Denny Pratama', '628155555555', 'Honda PCX 160', 'solo', false);

-- 6. Seed Checklist detail untuk peserta yang sudah Ready (yang di-seed true, kita buat checklistnya true)
update bike_checklists set tires_ok = true, brakes_ok = true, lights_ok = true, fluids_ok = true, documents_ok = true
where participant_id in (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004'
);

-- 7. Seed Check-in awal untuk Budi dan Rian di CP 1 (KM 57)
insert into check_ins (participant_id, checkpoint_id, latitude, longitude, checked_in_at) values
('10000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', -6.3774, 107.2994, now() - interval '8 hours'),
('10000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', -6.3775, 107.2995, now() - interval '8 hours' - interval '7 minutes');

-- =========================================================================
-- STORAGE BUCKET: AVATARS
-- Jalankan kode di bawah ini jika Supabase Storage Anda sudah aktif
-- =========================================================================

-- Membuat bucket 'avatars' (public)
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- RLS untuk tabel storage.objects (Bucket Avatars)
create policy "Avatar images are publicly accessible." 
on storage.objects for select using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." 
on storage.objects for insert with check (bucket_id = 'avatars');

create policy "Anyone can update their avatar." 
on storage.objects for update using (bucket_id = 'avatars');

create policy "Anyone can delete their avatar." 
on storage.objects for delete using (bucket_id = 'avatars');

-- =========================================================================
-- 8. TABEL EVENT EXPENSES (KAS & PENGELUARAN TOURING)
-- =========================================================================
create table if not exists event_expenses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  title text not null,
  amount double precision not null,
  category text default 'umum' not null,
  spent_by text,
  created_at timestamptz default now()
);

-- RLS untuk event_expenses
alter table event_expenses enable row level security;
create policy "Event expenses are readable by everyone" on event_expenses for select using (true);
create policy "Anyone can insert event expenses" on event_expenses for insert with check (true);
create policy "Anyone can update event expenses" on event_expenses for update using (true);
create policy "Only admin can delete event expenses" on event_expenses for delete using (auth.role() = 'authenticated');

-- Aktifkan Realtime untuk event_expenses
alter publication supabase_realtime add table event_expenses;

-- Seed Data Pengeluaran Awal (Demo Bandung Rideout)
insert into event_expenses (event_id, title, amount, category, spent_by) values
('11111111-1111-1111-1111-111111111111', 'Makan Siang Bersama (Gedung Sate)', 350000, 'makan', 'Pak Eko (Bendahara)'),
('11111111-1111-1111-1111-111111111111', 'Bensin Emergency Rian (Ninja 250)', 75000, 'bensin', 'Dani (Sweeper)'),
('11111111-1111-1111-1111-111111111111', 'Parkir Rombongan & Retribusi KM 57', 40000, 'parkir', 'Roni (RC)');

