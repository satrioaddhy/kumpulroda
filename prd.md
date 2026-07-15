# Product Requirement Document (PRD)
# KumpulRoda — MVP Version

| Atribut | Keterangan |
|---|---|
| **Nama Produk** | KumpulRoda |
| **Versi Dokumen** | 1.0 (MVP) |
| **Status** | Draft — Siap Pengembangan |
| **Tipe Produk** | Progressive Web Application (Web App, Mobile-First) |
| **Platform Target** | Peramban (browser) HP Android & iOS |
| **Kasus Uji Coba Perdana** | Touring Klub Motor ke Bandung |
| **Bahasa Antarmuka** | Bahasa Indonesia |
| **Tanggal** | 14 Juli 2026 |

---

## Daftar Isi

1. [Executive Summary & Goals](#1-executive-summary--goals)
2. [User Persona & Journey](#2-user-persona--journey)
3. [Functional Requirements](#3-functional-requirements)
4. [Technical Specifications](#4-technical-specifications)
5. [UI/UX Wireframe Guidance](#5-uiux-wireframe-guidance)
6. [Risiko & Mitigasi](#6-risiko--mitigasi)
7. [Roadmap Pengembangan](#7-roadmap-pengembangan)
8. [Glosarium & Lampiran](#8-glosarium--lampiran)

---

## 1. Executive Summary & Goals

### 1.1 Ringkasan Produk

**KumpulRoda** adalah aplikasi web instan (*instant web app*) yang berfungsi sebagai pusat komando digital untuk kegiatan touring klub motor. Aplikasi ini menyatukan empat kebutuhan operasional lapangan ke dalam satu tautan tunggal: **manajemen rute**, **rundown acara**, **verifikasi kesiapan motor**, dan **koordinasi lapangan**.

Produk dirancang dengan filosofi **"No Download, No Log-in"** bagi anggota, sehingga cukup diakses melalui satu tautan yang dibagikan di grup, langsung dapat digunakan di pinggir jalan raya menggunakan HP tanpa proses instalasi maupun pendaftaran akun.

### 1.2 Latar Belakang & Problem Statement

Koordinasi touring klub motor di Indonesia saat ini bertumpu pada grup WhatsApp. Praktik ini menimbulkan beberapa masalah operasional:

1. **Informasi terkubur (*information overload*).** Detail penting seperti titik kumpul, rundown, dan tata tertib tenggelam di antara ratusan pesan obrolan, sehingga sulit ditemukan saat dibutuhkan mendadak di lapangan.
2. **Rekapitulasi peserta manual.** Panitia menghitung jumlah motor dan pembonceng secara manual dengan menggulir *chat*, rawan kesalahan dan memakan waktu.
3. **Tidak ada verifikasi kesiapan.** Tidak ada mekanisme standar untuk memastikan setiap motor telah menjalani inspeksi keselamatan sebelum berangkat.
4. **Koordinasi darurat lambat.** Ketika terjadi masalah di jalan, anggota kesulitan menyampaikan lokasi persis secara cepat kepada tim Sweeper atau Mekanik.

### 1.3 Core Value Proposition

> **"No Download, No Log-in"** — Praktis dibuka di pinggir jalan via HP, tanpa instalasi dan tanpa akun.

KumpulRoda menggantikan tumpukan informasi di grup WhatsApp dengan satu sumber kebenaran (*single source of truth*) yang terstruktur, ringan, dan dapat diakses instan oleh seluruh peserta.

### 1.4 Tujuan Produk (Product Goals)

| Kode | Tujuan | Deskripsi |
|---|---|---|
| G-1 | Sentralisasi Informasi | Menyediakan satu pusat informasi acara yang menggantikan pencarian manual di grup obrolan. |
| G-2 | Otomasi Rekapitulasi | Menghasilkan data agregat peserta (jumlah motor, rider, boncenger) secara otomatis dan *real-time*. |
| G-3 | Standardisasi Keselamatan | Mewajibkan inspeksi mandiri kesiapan motor sebelum keberangkatan. |
| G-4 | Kecepatan Koordinasi Lapangan | Mempercepat proses absensi checkpoint dan pelaporan keadaan darurat. |
| G-5 | Nol Hambatan Adopsi | Menghilangkan hambatan instalasi dan pendaftaran akun bagi anggota. |

### 1.5 Success Metrics (KPI)

| Metrik | Target MVP | Cara Ukur |
|---|---|---|
| Tingkat adopsi RSVP | ≥ 80% anggota yang berangkat mengisi RSVP digital | Rasio data RSVP terhadap jumlah peserta aktual |
| Kelengkapan checklist | ≥ 90% peserta berstatus "Ready to Ride" sebelum berangkat | Persentase peserta dengan checklist lengkap |
| Waktu muat halaman | < 3 detik pada jaringan 3G | Lighthouse / uji lapangan |
| Ukuran aset halaman | < 2 MB total per halaman | Audit *network* peramban |
| Keandalan Check-in | ≥ 95% percobaan check-in dalam radius berhasil | Log keberhasilan check-in |

### 1.6 Ruang Lingkup MVP

**Termasuk dalam MVP (In-Scope):**

- Event Dashboard & Info Hub
- Rute Interaktif via Google My Maps + Deep Linking navigasi
- Quick RSVP Instan + Live Counter
- Pre-Ride Bike Checklist
- Geo-Fencing Check-in di Checkpoint
- SOS Emergency Link
- Live Monitor Dashboard Panitia

**Tidak Termasuk dalam MVP (Out-of-Scope):**

- *Live tracking* posisi anggota secara terus-menerus di peta (digantikan oleh Geo-Fencing Check-in).
- Sistem akun/profil permanen untuk anggota.
- Fitur pembayaran/*payment gateway* iuran acara.
- Aplikasi *native* Android/iOS.
- Notifikasi *push* dan *chat* internal.
- Manajemen multi-klub atau multi-organisasi tingkat lanjut.

### 1.7 Asumsi & Batasan

1. Seluruh anggota memiliki HP dengan peramban modern dan koneksi internet (meski intermiten).
2. Anggota bersedia memberikan izin akses lokasi (Geolocation) pada peramban untuk fitur Check-in dan SOS.
3. Panitia memiliki akun untuk mengakses panel admin (satu-satunya peran yang membutuhkan autentikasi).
4. Seluruh komponen infrastruktur berjalan pada **100% Free Tier**, sehingga batas kuota layanan gratis (Supabase, Vercel/Netlify) menjadi batasan kapasitas.
5. Rute dibuat panitia menggunakan Google My Maps dan disematkan (*embed*) ke aplikasi.

---

## 2. User Persona & Journey

### 2.1 User Persona

#### Persona 1 — Panitia / Road Captain (Admin)

| Atribut | Deskripsi |
|---|---|
| **Peran** | Penyelenggara & pemimpin konvoi |
| **Tujuan** | Menyiapkan acara, memantau kesiapan peserta, dan mengoordinasi konvoi di lapangan |
| **Kebutuhan** | Panel yang menampilkan data peserta, kelayakan motor, dan status check-in secara langsung |
| **Titik Frustrasi** | Harus menghitung peserta manual dari *chat*; tidak tahu siapa yang sudah siap berangkat |
| **Kemampuan Teknis** | Menengah; terbiasa membuat rute Google My Maps |

#### Persona 2 — Anggota / Rider (User)

| Atribut | Deskripsi |
|---|---|
| **Peran** | Peserta konvoi |
| **Tujuan** | Mendaftar, memahami rute & rundown, dan menjalani touring dengan aman |
| **Kebutuhan** | Akses informasi cepat tanpa ribet, tombol besar yang mudah ditekan di jalan |
| **Titik Frustrasi** | Malas mengunduh aplikasi baru atau membuat akun hanya untuk satu acara |
| **Konteks Penggunaan** | Menggunakan HP di pinggir jalan, sering memakai **sarung tangan motor tipis**, kadang di **area sinyal minim** |

#### Persona 3 — Tim Sweeper / Mekanik (Responden Darurat)

| Atribut | Deskripsi |
|---|---|
| **Peran** | Penjaga barisan belakang & penanganan masalah teknis |
| **Tujuan** | Menerima laporan darurat lengkap dengan lokasi presisi secepat mungkin |
| **Kebutuhan** | Menerima pesan WhatsApp berisi tautan lokasi yang bisa langsung dibuka |
| **Titik Frustrasi** | Sulit menebak lokasi anggota yang mogok hanya dari deskripsi verbal |

### 2.2 User Journey Map

#### A. Journey Panitia (Fase Persiapan, sebelum hari H)

1. **Login** ke panel admin.
2. **Membuat acara**: mengisi info dasar, susunan pengurus konvoi (Road Captain & Sweeper), rundown, dan tata tertib.
3. **Menyematkan rute** Google My Maps dan menetapkan koordinat tujuan navigasi.
4. **Mengunci koordinat checkpoint** beserta radius (default 200 meter).
5. **Menetapkan kontak darurat** (nomor WhatsApp Mekanik/Sweeper).
6. **Membagikan satu tautan** acara ke grup klub.
7. **Memantau** RSVP, kelayakan motor, dan check-in secara *real-time* melalui Live Monitor.

#### B. Journey Anggota (H-3 hingga Hari H)

1. **Membuka tautan** dari grup WhatsApp (tanpa instalasi/login).
2. **Membaca Info Hub**: rundown, pengurus, tata tertib.
3. **Mengisi Quick RSVP**: nama, nomor WA, tipe motor, status (Solo/Berboncengan).
4. **Menjalankan Pre-Ride Bike Checklist** pada hari H, mencentang seluruh item hingga berstatus **"Ready to Ride"**.
5. **Membuka rute** dan menekan **"Mulai Navigasi"** untuk berpindah ke aplikasi Google Maps.
6. **Melakukan Check-in** saat tiba di rest area/checkpoint (aktif hanya dalam radius).
7. **(Kondisional) Menekan tombol SOS** apabila terjadi keadaan darurat.

---

## 3. Functional Requirements

Setiap fitur diuraikan dengan format standar: **Prioritas**, **User Story**, **Persyaratan Fungsional**, dan **Kriteria Penerimaan (*Acceptance Criteria*)** dalam format *Given–When–Then*.

---

### FR-01 — Event Dashboard & Info Hub

**Prioritas: High**

**User Story:**
> Sebagai anggota, saya ingin melihat seluruh informasi dasar acara dalam satu halaman ringkas, agar saya tidak perlu mencari-cari di dalam obrolan grup.

**Persyaratan Fungsional:**

- FR-01.1 Menampilkan info dasar acara (nama acara, tanggal, waktu, titik kumpul).
- FR-01.2 Menampilkan susunan pengurus konvoi: **Road Captain** dan **Sweeper** beserta perannya.
- FR-01.3 Menyajikan rundown digital dalam bentuk **vertical timeline** (garis waktu vertikal) berisi waktu, judul kegiatan, dan deskripsi.
- FR-01.4 Menampilkan teks **tata tertib konvoi** yang dapat digulir.
- FR-01.5 Halaman bersifat **mobile-first** dan menjadi halaman utama (*landing page*) aplikasi.

**Kriteria Penerimaan:**

- **Given** anggota membuka tautan acara, **when** halaman dimuat, **then** seluruh info dasar, pengurus, rundown, dan tata tertib tampil tanpa perlu login.
- **Given** rundown memiliki banyak entri, **when** anggota menggulir, **then** entri ditampilkan berurutan waktu sebagai *vertical timeline*.

---

### FR-02 — Rute Interaktif via Google My Maps

**Prioritas: High**

**User Story:**
> Sebagai anggota, saya ingin melihat rute resmi dan langsung dapat memulai navigasi di aplikasi peta bawaan HP saya, agar saya tidak tersesat.

**Persyaratan Fungsional:**

- FR-02.1 Menyematkan (*embed*) rute kustom gratis dari **Google My Maps** panitia.
- FR-02.2 Menyediakan tombol **"Mulai Navigasi"** dengan mekanisme **Deep Linking**.
- FR-02.3 Ketika tombol ditekan, aplikasi Google Maps bawaan HP terbuka langsung menuju koordinat tujuan yang telah ditetapkan panitia.
- FR-02.4 Peta yang disematkan harus responsif dan tidak melebihi batas ukuran aset.

**Kriteria Penerimaan:**

- **Given** anggota berada di halaman rute, **when** menekan "Mulai Navigasi", **then** aplikasi Google Maps terbuka pada mode navigasi menuju titik tujuan.
- **Given** anggota tidak memiliki aplikasi Google Maps, **when** menekan tombol, **then** tautan terbuka di versi web Google Maps (*graceful fallback*).

---

### FR-03 — Quick RSVP Instan

**Prioritas: High**

**User Story:**
> Sebagai anggota, saya ingin mendaftar keikutsertaan hanya dengan mengisi formulir singkat tanpa membuat akun, agar prosesnya cepat.

**Persyaratan Fungsional:**

- FR-03.1 Formulir pendaftaran **tanpa pembuatan akun**.
- FR-03.2 Input wajib: **Nama**, **No. WhatsApp**, **Tipe Motor** (contoh: Yamaha Xabre, ADV), **Status** (Solo Rider / Berboncengan).
- FR-03.3 Menyediakan **Live Counter** agregat yang menampilkan: **Total Motor | Total Rider | Total Boncenger**.
- FR-03.4 Live Counter diperbarui **secara instan** tanpa *hard-reload* halaman.
- FR-03.5 Validasi format nomor WhatsApp (numerik, panjang wajar).

**Definisi Agregasi Live Counter:**

| Metrik | Definisi Perhitungan |
|---|---|
| Total Motor | Jumlah seluruh entri RSVP (1 peserta = 1 motor) |
| Total Rider | Jumlah pengendara utama (sama dengan Total Motor) |
| Total Boncenger | Jumlah entri dengan status = "Berboncengan" |
| *(Turunan)* Total Kepala | Total Rider + Total Boncenger |

**Kriteria Penerimaan:**

- **Given** anggota mengisi seluruh field wajib, **when** menekan "Daftar", **then** data tersimpan dan Live Counter bertambah tanpa refresh manual.
- **Given** anggota B mendaftar di HP lain, **when** data tersimpan, **then** Live Counter di HP anggota A ikut terperbarui secara *real-time*.
- **Given** field wajib kosong atau nomor WA tidak valid, **when** menekan "Daftar", **then** sistem menampilkan pesan galat dan menolak pengiriman.

---

### FR-04 — Pre-Ride Bike Checklist

**Prioritas: High**

**User Story:**
> Sebagai anggota, saya ingin memverifikasi kesiapan fisik motor saya melalui daftar periksa terstandar, agar keberangkatan lebih aman.

**Persyaratan Fungsional:**

- FR-04.1 Formulir inspeksi mandiri fisik motor sebelum berangkat.
- FR-04.2 Item wajib dicentang: **Ban**, **Rem**, **Lampu-Lampu**, **Cairan (Oli/Coolant)**, **Surat (SIM/STNK)**.
- FR-04.3 Ketika seluruh item dicentang, status peserta di basis data berubah menjadi **"Ready to Ride"**.
- FR-04.4 Checklist terhubung dengan entri RSVP peserta yang bersangkutan.
- FR-04.5 Status kelayakan tercermin *real-time* pada Live Monitor panitia.

**Kriteria Penerimaan:**

- **Given** anggota telah RSVP, **when** membuka checklist dan mencentang seluruh 5 item, **then** statusnya berubah menjadi "Ready to Ride".
- **Given** ada satu item belum dicentang, **when** anggota mencoba menyelesaikan, **then** status tetap "Belum Siap" dan item yang kurang ditandai.

---

### FR-05 — Geo-Fencing Check-in di Checkpoint

**Prioritas: High** *(Solusi Pengganti Live Tracking)*

**User Story:**
> Sebagai anggota, saya ingin melakukan absensi otomatis saat tiba di rest area, dan sebagai panitia saya ingin memastikan absensi hanya sah bila anggota benar-benar berada di lokasi.

**Persyaratan Fungsional:**

- FR-05.1 Fitur absensi di pos istirahat/rest area menggunakan **Geolocation API** peramban.
- FR-05.2 Menggunakan **rumus Haversine** untuk menghitung jarak antara posisi GPS anggota dan koordinat checkpoint.
- FR-05.3 Tombol **"Check-in"** hanya aktif/dapat ditekan bila posisi anggota berada dalam **radius maksimal 200 meter** dari koordinat checkpoint yang dikunci panitia.
- FR-05.4 Radius checkpoint dapat dikonfigurasi panitia (default 200 m).
- FR-05.5 Data check-in (peserta, checkpoint, waktu, koordinat) tersimpan dan tampil *real-time* di Live Monitor.

**Kriteria Penerimaan:**

- **Given** anggota berada dalam radius 200 m checkpoint, **when** membuka halaman check-in, **then** tombol "Check-in" aktif dan dapat ditekan.
- **Given** anggota berada di luar radius, **when** membuka halaman check-in, **then** tombol nonaktif dengan keterangan jarak saat ini ke checkpoint.
- **Given** anggota menolak izin lokasi, **when** membuka fitur, **then** sistem menampilkan instruksi mengaktifkan izin lokasi.

---

### FR-06 — SOS Emergency Link

**Prioritas: High**

**User Story:**
> Sebagai anggota yang mengalami keadaan darurat, saya ingin mengirim lokasi presisi saya ke tim Sweeper/Mekanik dengan satu tombol, agar pertolongan cepat datang.

**Persyaratan Fungsional:**

- FR-06.1 Tombol darurat **melayang (*floating*)** yang selalu terlihat di seluruh halaman anggota.
- FR-06.2 Ketika ditekan, sistem mengambil **koordinat GPS terkini** pengguna via Geolocation API.
- FR-06.3 Sistem membuka **WhatsApp Deep Link** menuju chat tim Mekanik/Sweeper.
- FR-06.4 Draf teks otomatis berisi tautan lokasi Google Maps (`https://maps.google.com/?q=lat,lng`) posisi darurat pengguna.
- FR-06.5 Menyertakan konfirmasi singkat sebelum membuka WhatsApp untuk mencegah salah pencet.

**Kriteria Penerimaan:**

- **Given** anggota menekan tombol SOS dan menyetujui akses lokasi, **when** koordinat berhasil diambil, **then** WhatsApp terbuka dengan draf teks berisi tautan lokasi terkini.
- **Given** koordinat gagal diambil, **when** anggota menekan SOS, **then** WhatsApp tetap terbuka namun teks menyertakan catatan bahwa lokasi tidak tersedia.

---

### FR-07 — Live Monitor Dashboard Panitia

**Prioritas: Medium**

**User Story:**
> Sebagai panitia, saya ingin satu panel yang memantau logistik, kelayakan motor, dan absensi anggota secara langsung, agar saya dapat mengambil keputusan cepat.

**Persyaratan Fungsional:**

- FR-07.1 Panel admin **khusus panitia** (memerlukan autentikasi).
- FR-07.2 Menampilkan tabel **manifes logistik peserta** (nama, WA, tipe motor, status boncengan).
- FR-07.3 Menampilkan **status kelayakan motor** (Ready to Ride / Belum Siap) per peserta.
- FR-07.4 Menampilkan **status check-in** anggota per checkpoint secara *real-time*.
- FR-07.5 Data diperbarui otomatis tanpa *hard-reload*.

**Kriteria Penerimaan:**

- **Given** panitia login ke panel, **when** seorang anggota menyelesaikan checklist, **then** status kelayakannya berubah di panel tanpa refresh.
- **Given** seorang anggota check-in di checkpoint, **when** data tersimpan, **then** baris check-in muncul *real-time* di panel.
- **Given** pengguna non-panitia mencoba mengakses panel, **when** tidak terautentikasi, **then** akses ditolak.

---

## 4. Technical Specifications

### 4.1 Arsitektur Sistem

Arsitektur bersifat **serverless & realtime-first**, seluruhnya berjalan pada layanan **Free Tier**.

```
┌─────────────────────────────────────────────────────┐
│              KLIEN (Peramban HP Anggota)              │
│  Next.js / Vite + Tailwind CSS  (Mobile-First PWA)    │
│  • Geolocation API   • Haversine (client-side)        │
│  • Deep Link (Google Maps & WhatsApp)                 │
└───────────────┬──────────────────────┬────────────────┘
                │ HTTPS / WebSocket     │ Embed (iframe)
                ▼                       ▼
   ┌────────────────────────┐   ┌────────────────────┐
   │   SUPABASE (Backend)    │   │  Google My Maps     │
   │  • PostgreSQL           │   │  (Embed rute)       │
   │  • Realtime (WebSocket) │   └────────────────────┘
   │  • Row Level Security   │
   │  • Auth (panitia saja)  │
   └────────────────────────┘
                ▲
                │ Deploy
   ┌────────────────────────┐
   │  Vercel / Netlify       │
   │  (Hosting statis + SSR) │
   └────────────────────────┘
```

### 4.2 Tech Stack

| Lapisan | Teknologi | Alasan |
|---|---|---|
| Frontend | **Next.js/React** atau **Vite + React** | Ekosistem matang, mendukung mobile-first & PWA |
| Styling | **Tailwind CSS** | Cepat, ringan, mudah menjaga konsistensi ukuran tombol |
| Backend & DB | **Supabase** (PostgreSQL) | Free tier, SQL relasional, Realtime bawaan |
| Realtime | **Supabase Realtime** (WebSocket) | Pembaruan instan tanpa *hard-reload* |
| Autentikasi | **Supabase Auth** (panitia saja) | Anggota tanpa akun; panitia via magic link/email |
| Peta | **Google My Maps Embed** | Gratis, rute kustom oleh panitia |
| Deep Link | **WhatsApp Deep Link** & **Google Maps URL** | Native, tanpa biaya API |
| Hosting | **Vercel** atau **Netlify** | Free tier, deploy otomatis dari Git |

### 4.3 Skema Basis Data (Supabase / PostgreSQL)

> Catatan: skema di bawah adalah rancangan acuan; developer dapat menyesuaikan tipe data dan indeks sesuai kebutuhan.

**Tabel `events`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | Primary key |
| name | text | Nama acara |
| event_date | timestamptz | Tanggal & waktu acara |
| meeting_point | text | Titik kumpul |
| road_captain | text | Nama Road Captain |
| sweeper | text | Nama Sweeper |
| rules_text | text | Teks tata tertib konvoi |
| map_embed_url | text | URL embed Google My Maps |
| map_destination_lat | double precision | Lintang tujuan navigasi |
| map_destination_lng | double precision | Bujur tujuan navigasi |
| created_at | timestamptz | Waktu dibuat |

**Tabel `rundown_items`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | Primary key |
| event_id | uuid (FK → events.id) | Relasi ke acara |
| time_label | text | Label waktu (mis. "07.00") |
| title | text | Judul kegiatan |
| description | text | Deskripsi |
| sort_order | int | Urutan tampil |

**Tabel `participants`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | Primary key |
| event_id | uuid (FK → events.id) | Relasi ke acara |
| name | text | Nama peserta |
| whatsapp | text | Nomor WhatsApp |
| motor_type | text | Tipe motor |
| ride_status | text | 'solo' \| 'boncengan' |
| bike_ready | boolean | Status "Ready to Ride" (default false) |
| created_at | timestamptz | Waktu daftar |

**Tabel `bike_checklists`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | Primary key |
| participant_id | uuid (FK → participants.id) | Relasi ke peserta |
| tires_ok | boolean | Ban |
| brakes_ok | boolean | Rem |
| lights_ok | boolean | Lampu-lampu |
| fluids_ok | boolean | Cairan (Oli/Coolant) |
| documents_ok | boolean | Surat (SIM/STNK) |
| updated_at | timestamptz | Waktu perbarui |

**Tabel `checkpoints`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | Primary key |
| event_id | uuid (FK → events.id) | Relasi ke acara |
| name | text | Nama checkpoint/rest area |
| latitude | double precision | Lintang checkpoint |
| longitude | double precision | Bujur checkpoint |
| radius_m | int | Radius (default 200) |
| sort_order | int | Urutan |

**Tabel `check_ins`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | Primary key |
| participant_id | uuid (FK → participants.id) | Relasi ke peserta |
| checkpoint_id | uuid (FK → checkpoints.id) | Relasi ke checkpoint |
| latitude | double precision | Lintang saat check-in |
| longitude | double precision | Bujur saat check-in |
| checked_in_at | timestamptz | Waktu check-in |

**Tabel `emergency_contacts`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | Primary key |
| event_id | uuid (FK → events.id) | Relasi ke acara |
| role | text | 'mekanik' \| 'sweeper' |
| name | text | Nama kontak |
| whatsapp | text | Nomor WhatsApp (format internasional, mis. 62812...) |

### 4.4 Realtime & Alur Data

- **Live Counter (FR-03)** dan **Live Monitor (FR-07)** berlangganan (*subscribe*) perubahan tabel `participants`, `bike_checklists`, dan `check_ins` melalui **Supabase Realtime**.
- Setiap `INSERT`/`UPDATE` mengirim *event* melalui WebSocket ke klien yang berlangganan, sehingga UI diperbarui **tanpa hard-reload**.
- Untuk performa, agregasi Live Counter dapat menggunakan **PostgreSQL View** atau perhitungan sisi klien atas data yang dilanggan.

### 4.5 Integrasi Eksternal & Deep Link

**Google Maps Navigasi (FR-02):**
```
https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>
```
Pada perangkat mobile, tautan universal ini otomatis membuka aplikasi Google Maps bila terpasang; bila tidak, terbuka di peramban (*fallback*).

**WhatsApp SOS Deep Link (FR-06):**
```
https://wa.me/<nomor_wa_internasional>?text=<pesan_terenkode_URL>
```
Contoh isi pesan (sebelum *encode*):
```
[SOS KumpulRoda] Butuh bantuan darurat. Lokasi saya: https://maps.google.com/?q=-6.914744,107.609810
```

### 4.6 Rumus Haversine (Geo-Fencing)

Digunakan untuk menghitung jarak antara dua titik koordinat di permukaan bumi.

$$
d = 2r \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\varphi}{2}\right) + \cos\varphi_1 \cdot \cos\varphi_2 \cdot \sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)
$$

Dengan: `r` = radius bumi (± 6.371.000 m), `φ` = lintang (radian), `λ` = bujur (radian).

Implementasi acuan (JavaScript, sisi klien):
```javascript
function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meter
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
// Tombol Check-in aktif bila: haversineMeters(...) <= checkpoint.radius_m
```

> **Rekomendasi keamanan:** perhitungan sisi klien menentukan aktif/tidaknya tombol; validasi ulang di sisi server (Edge Function / RPC PostgreSQL) disarankan untuk mencegah pemalsuan koordinat pada iterasi berikutnya.

### 4.7 Persyaratan Non-Fungsional

| Kode | Aspek | Ketentuan |
|---|---|---|
| NFR-1 | Desain Responsif | **Mobile-first**; tata letak optimal untuk layar HP |
| NFR-2 | Aksesibilitas Sentuh | Tombol aksi minimal **48px × 48px** (ramah sarung tangan motor tipis) |
| NFR-3 | Performa Aset | Total aset per halaman **< 2 MB** (optimasi gambar, *lazy load*, *code splitting*) |
| NFR-4 | Kecepatan Muat | Target < 3 detik pada 3G (area sinyal minim pegunungan) |
| NFR-5 | Realtime | Pembaruan data instan tanpa *hard-reload* |
| NFR-6 | Keamanan Data | **Row Level Security (RLS)** aktif; anggota anonim hanya boleh *insert* & *read* data acara terkait; kolom sensitif panel hanya untuk panitia |
| NFR-7 | Ketahanan Sinyal | *Graceful degradation* saat koneksi lemah; umpan balik status jelas |
| NFR-8 | Kompatibilitas | Peramban modern Android & iOS (Chrome, Safari) |
| NFR-9 | Biaya | **100% Free Tier** untuk seluruh komponen |

### 4.8 Deployment & Lingkungan

- **Repositori:** Git (mis. GitHub) dengan CI/CD otomatis ke Vercel/Netlify.
- **Environment Variables:** `SUPABASE_URL`, `SUPABASE_ANON_KEY` (klien), kunci layanan hanya di sisi server bila diperlukan.
- **Environment:** minimal `Production` dan `Preview` (untuk uji per-*branch*).

---

## 5. UI/UX Wireframe Guidance

### 5.1 Prinsip Desain

1. **Mobile-First & Satu Tangan.** Elemen penting berada dalam jangkauan ibu jari.
2. **Ramah Sarung Tangan.** Semua tombol aksi minimal **48px × 48px** dengan jarak antar-tombol memadai.
3. **Ringan & Cepat.** Aset < 2 MB; hindari animasi berat dan gambar besar.
4. **Kontras Tinggi.** Terbaca di bawah sinar matahari langsung.
5. **Aksi Jelas.** Satu tindakan utama per layar; label eksplisit ("Mulai Navigasi", "Check-in", "Daftar").

### 5.2 Design Tokens (Acuan)

| Token | Nilai Acuan |
|---|---|
| Ukuran tombol minimum | 48px × 48px |
| Radius sudut | 12px (nyaman & modern) |
| Warna aksi utama | Kontras tinggi (mis. oranye/merah untuk SOS) |
| Warna sukses | Hijau (status "Ready to Ride") |
| Tipografi | Sans-serif, ukuran badan teks ≥ 16px |
| Jarak sentuh minimum | ≥ 8px antar elemen interaktif |

### 5.3 Panduan Wireframe per Halaman

#### Halaman 1 — Info Hub (Beranda Anggota)
```
┌───────────────────────────┐
│  [Nama Acara]  [Tanggal]   │
│  Titik Kumpul: ...         │
├───────────────────────────┤
│  Pengurus Konvoi           │
│   • Road Captain: ...      │
│   • Sweeper: ...           │
├───────────────────────────┤
│  RUNDOWN (Vertical Timeline)│
│   ● 07.00 Kumpul & Brief   │
│   │                        │
│   ● 08.00 Berangkat        │
│   │                        │
│   ● 12.00 ISHOMA           │
├───────────────────────────┤
│  Tata Tertib Konvoi ▼      │
├───────────────────────────┤
│ [RSVP] [Rute] [Checklist]  │  ← navigasi tombol besar
└───────────────────────────┘
            (● SOS)             ← tombol floating merah
```

#### Halaman 2 — Rute Interaktif
```
┌───────────────────────────┐
│   [ Google My Maps Embed ] │
│   (peta rute tersemat)     │
│                            │
├───────────────────────────┤
│  ┌──────────────────────┐  │
│  │   ▶ MULAI NAVIGASI    │  │ ← tombol ≥48px, deep link
│  └──────────────────────┘  │
└───────────────────────────┘
```

#### Halaman 3 — Quick RSVP + Live Counter
```
┌───────────────────────────┐
│  LIVE COUNTER              │
│  🏍 Motor: 24 | 👤 Rider: 24│
│  👥 Boncenger: 9           │
├───────────────────────────┤
│  Nama         [__________] │
│  No. WhatsApp [__________] │
│  Tipe Motor   [__________] │
│  Status  ( ) Solo          │
│          ( ) Berboncengan  │
│  ┌──────────────────────┐  │
│  │       DAFTAR          │  │ ← ≥48px
│  └──────────────────────┘  │
└───────────────────────────┘
```

#### Halaman 4 — Pre-Ride Bike Checklist
```
┌───────────────────────────┐
│  CEK KESIAPAN MOTOR        │
│  [✔] Ban                   │
│  [✔] Rem                   │
│  [✔] Lampu-Lampu           │
│  [ ] Cairan (Oli/Coolant)  │
│  [ ] Surat (SIM/STNK)      │
├───────────────────────────┤
│  Status: BELUM SIAP        │
│  (Berubah hijau "READY TO  │
│   RIDE" bila semua ✔)      │
└───────────────────────────┘
```

#### Halaman 5 — Check-in Checkpoint
```
┌───────────────────────────┐
│  Checkpoint: Rest Area KM57│
│  Jarak Anda: 145 m         │
│  ┌──────────────────────┐  │
│  │      CHECK-IN         │  │ ← AKTIF (dlm 200m)
│  └──────────────────────┘  │
│  * Nonaktif & abu-abu bila │
│    di luar radius          │
└───────────────────────────┘
```

#### Halaman 6 — Live Monitor Panitia (Admin)
```
┌────────────────────────────────────────┐
│  DASHBOARD PANITIA          🔒 (login)  │
├──────────┬─────────┬─────────┬──────────┤
│ Nama     │ Motor   │ Kelayakan│ Check-in │
├──────────┼─────────┼─────────┼──────────┤
│ Budi     │ ADV     │ ✔ Ready │ KM57 ✔   │
│ Sari     │ Xabre   │ ✘ Belum │ -        │
│ ...      │ ...     │ ...     │ ...      │
└──────────┴─────────┴─────────┴──────────┘
   (Data diperbarui real-time)
```

### 5.4 Panduan Interaksi & State

- **Loading state:** tampilkan indikator ringan saat data dimuat/dikirim.
- **Empty state:** pesan ramah bila belum ada peserta/check-in.
- **Error state:** pesan jelas untuk izin lokasi ditolak, jaringan gagal, atau input tidak valid.
- **Feedback sukses:** konfirmasi visual (warna hijau/animasi singkat) saat RSVP, checklist selesai, dan check-in berhasil.
- **SOS:** dialog konfirmasi singkat sebelum membuka WhatsApp untuk mencegah salah pencet.

---

## 6. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Sinyal lemah di pegunungan | Halaman gagal dimuat / data tak terkirim | Aset < 2 MB, *caching*, umpan balik status, pertimbangkan PWA offline pada fase lanjut |
| Akurasi GPS peramban rendah | Check-in di luar/dalam radius keliru | Radius default cukup longgar (200 m); tampilkan jarak; validasi server pada iterasi berikutnya |
| Penyalahgunaan akses anonim | Data spam pada tabel `participants` | RLS ketat, *rate limiting*, validasi input |
| Batas kuota Free Tier terlampaui | Layanan berhenti saat acara besar | Pantau kuota Supabase/Vercel; optimasi kueri realtime |
| Anggota menolak izin lokasi | Fitur Check-in & SOS tidak berfungsi | Instruksi jelas cara mengaktifkan izin; SOS tetap kirim WA meski tanpa lokasi |

---

## 7. Roadmap Pengembangan

| Fase | Fokus | Cakupan |
|---|---|---|
| **Fase 1 — MVP (uji coba Bandung)** | Fungsi inti | FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07 |
| **Fase 2 — Penguatan** | Keandalan & keamanan | Validasi Geo-Fencing sisi server, PWA offline, *rate limiting* |
| **Fase 3 — Pengalaman** | Kenyamanan | Notifikasi WA otomatis, ekspor manifes, riwayat acara |
| **Fase 4 — Skala** | Multi-acara/klub | Manajemen banyak acara, peran panitia berjenjang |

---

## 8. Glosarium & Lampiran

| Istilah | Definisi |
|---|---|
| **Road Captain** | Pemimpin di barisan depan konvoi |
| **Sweeper** | Penjaga barisan paling belakang konvoi |
| **RSVP** | Konfirmasi kehadiran peserta |
| **Geo-Fencing** | Pembatasan aksi berdasarkan area geografis (radius) |
| **Haversine** | Rumus jarak antar dua titik koordinat di permukaan bumi |
| **Deep Link** | Tautan yang membuka aplikasi tertentu langsung ke konten spesifik |
| **RLS (Row Level Security)** | Kontrol akses baris data di PostgreSQL/Supabase |
| **PWA** | Progressive Web App, web yang berperilaku seperti aplikasi |
| **Ready to Ride** | Status peserta bila seluruh item checklist tercentang |

---

*Dokumen ini merupakan acuan pengembangan KumpulRoda MVP. Perubahan skema, endpoint, dan detail teknis dapat disesuaikan developer selama tidak mengubah persyaratan fungsional dan non-fungsional yang telah ditetapkan.*