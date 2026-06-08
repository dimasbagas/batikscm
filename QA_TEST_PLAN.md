# Manual QA Test Plan — BatikChain Indonesia

## Prerequisites
- Backend running: `cd backend && npx prisma migrate dev && npm run start:dev`
- Frontend running: `npm run dev`
- Smart contract: `cd contracts && npx hardhat test`

---

## 1. Authentication

### 1.1 Register
- [ ] Buka `/register`, isi semua field
- [ ] Submit dengan password < 8 karakter → harus error
- [ ] Submit dengan password tanpa huruf besar → harus error
- [ ] Submit dengan password valid → sukses, redirect ke dashboard
- [ ] Register dengan email yang sama → harus error "Email sudah terdaftar"

### 1.2 Login
- [ ] Login dengan email tidak terdaftar → error
- [ ] Login dengan password salah → error
- [ ] Login dengan benar → redirect ke dashboard
- [ ] Coba login 6 kali dalam 1 menit → rate limited (429)

### 1.3 Forgot Password
- [ ] Buka `/forgot-password`, isi email terdaftar → success message
- [ ] Cek console backend: "Email sent to" (token tidak muncul di log)

### 1.4 Logout
- [ ] Klik logout → redirect ke `/login`, token terhapus

---

## 2. UMKM Dashboard

### 2.1 Dashboard Page (`/dashboard`)
- [ ] Stat cards muncul: Total Products, Certificates, Scans, Verified
- [ ] Recent products list muncul

### 2.2 Products (`/dashboard/products`)
- [ ] List produk muncul dengan status badges
- [ ] Search produk berfungsi

### 2.3 New Product (`/dashboard/products/new`)
- [ ] Upload file non-gambar → error format
- [ ] Upload file > 5MB → error ukuran
- [ ] Upload file JPG/PNG/WebP → sukses, preview muncul
- [ ] Submit tanpa isi → error validasi
- [ ] Submit lengkap → sukses, redirect ke products

### 2.4 Certificates (`/dashboard/certificates`)
- [ ] List sertifikat muncul
- [ ] Tombol Print bekerja (dialog print)
- [ ] Tombol Download menghasilkan PNG

### 2.5 Settings (`/dashboard/settings`)
- [ ] Form profil terisi dengan data user
- [ ] Simpan perubahan → sukses

---

## 3. Admin

### 3.1 Admin Dashboard (`/dashboard/admin`)
- [ ] User non-admin coba akses langsung → redirect ke `/dashboard`

### 3.2 User Management (`/dashboard/admin/users`)
- [ ] List semua user muncul
- [ ] Bisa ganti role user
- [ ] Ganti role ke admin → muncul (via dropdown)

### 3.3 Admin Products (`/dashboard/admin/products`)
- [ ] Semua produk dari semua UMKM muncul

---

## 4. Public Pages

### 4.1 Verify Page (`/verify/:tokenId`)
- [ ] Buka `/verify/BC-2026-001` (tokenId valid) → info produk muncul
- [ ] Buka `/verify/INVALID` → "Produk Tidak Terverifikasi"

### 4.2 Landing Page (`/`)
- [ ] Hero section, fitur, tentang

---

## 5. Google OAuth
- [ ] Klik "Masuk dengan Google" → redirect ke Google login
- [ ] Setelah login Google → callback, redirect ke dashboard

---

## 6. Security

### 6.1 Rate Limiting
- [ ] Pukul `/api/v1/auth/login` 6x dalam 1 menit → 429 Too Many Requests

### 6.2 JWT
- [ ] Hapus token dari localStorage, akses `/dashboard` → redirect ke login
- [ ] Coba akses API dengan token palsu → 401

### 6.3 Authorization
- [ ] User UMKM coba `PATCH /users/{admin-id}` → 403 Forbidden
- [ ] User UMKM coba `POST /certificates/mint/{id}` → 403 Forbidden
- [ ] User non-admin coba `GET /users` → 403 Forbidden

### 6.4 Swagger
- [ ] Set `NODE_ENV=production`, akses `/api/docs` → tidak ditemukan (404)

---

## 7. Smart Contract
- [ ] Jalankan `npx hardhat test` → 19/19 passing

---

## 8. Docker
- [ ] `docker compose build` → sukses
- [ ] `docker compose up -d` → semua service running
- [ ] `curl localhost/api/v1/health` → `{"status":"ok"}`
