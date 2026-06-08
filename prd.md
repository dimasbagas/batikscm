Anda adalah Software Architect Senior, Product Manager Senior, Blockchain Engineer Senior, UI/UX Designer Senior, dan Fullstack Engineer Senior. Tugas Anda adalah merancang dan membangun aplikasi production-ready bernama **BatikChain Indonesia**, sebuah platform sertifikasi dan verifikasi keaslian produk batik berbasis blockchain yang terinspirasi dari penelitian mengenai penggunaan blockchain, NFT ERC-721, smart contract, dan QR Code untuk mencegah pemalsuan produk batik serta meningkatkan kepercayaan konsumen.

Buat aplikasi ini secara lengkap mulai dari perencanaan arsitektur, database, backend, frontend, mobile app, smart contract, deployment, keamanan, hingga dokumentasi teknis. Jangan menggunakan mock data, placeholder, dummy implementation, atau fitur setengah jadi. Semua fitur harus siap production deployment.

# VISI PRODUK

BatikChain Indonesia adalah platform nasional yang memungkinkan UMKM batik mendaftarkan produk mereka ke blockchain sehingga setiap produk memiliki identitas digital unik yang dapat diverifikasi oleh konsumen melalui QR Code.

Setiap produk yang terdaftar akan memiliki:

* Unique Product ID
* Blockchain Record
* NFT Certificate ERC-721
* Metadata Hash
* QR Verification
* Digital Certificate PDF
* Ownership History
* Verification Log

Tujuan utama:

* Mengurangi pemalsuan batik
* Meningkatkan kepercayaan konsumen
* Melindungi hak UMKM
* Mendukung digitalisasi industri kreatif Indonesia
* Menyediakan sistem sertifikasi yang murah dan transparan

# TARGET PLATFORM

Bangun sistem multi-platform:

1. Web Application
2. Android Application
3. Admin Dashboard
4. Public Verification Portal
5. Blockchain Smart Contract Layer
6. REST API
7. Future-ready untuk mobile iOS

# USER ROLES

## Visitor

Dapat:

* Scan QR Code
* Verifikasi produk
* Melihat sertifikat
* Melihat informasi produk

Tidak dapat:

* Menambah produk
* Mengubah data

## UMKM Owner

Dapat:

* Registrasi akun
* Login
* Mengelola profil UMKM
* Menambahkan produk
* Upload foto produk
* Melihat sertifikat
* Download QR Code
* Download PDF Certificate
* Melihat statistik produk

## Verificator

Dapat:

* Memverifikasi produk
* Menolak produk
* Memberikan catatan verifikasi
* Audit data produk

## Super Admin

Dapat:

* Mengelola seluruh pengguna
* Mengelola seluruh UMKM
* Mengelola sertifikat
* Mengelola blockchain configuration
* Mengelola analytics nasional
* Audit seluruh aktivitas

# FITUR UTAMA

## Authentication System

Implementasikan:

* Email Login
* Google Login
* JWT Authentication
* Refresh Token
* Password Reset
* Email Verification
* Session Management
* Role Based Access Control (RBAC)

Data registrasi:

* Nama Lengkap
* Nama UMKM
* Email
* Nomor HP
* Alamat
* Kota
* Provinsi
* NIK
* Password

## UMKM Management

Fitur:

* Profil UMKM
* Logo UMKM
* Deskripsi UMKM
* Alamat
* Lokasi Maps
* Dokumen Legalitas
* Status Verifikasi

## Product Registration

Form produk:

* Nama Produk
* Nama Batik
* Kategori
* Motif
* Daerah Asal
* Deskripsi
* Tanggal Produksi
* Foto Produk
* Foto Detail Motif
* Harga
* Stok
* Status Produk

Saat submit:

1. Generate Product ID
2. Generate Metadata JSON
3. Generate Metadata Hash SHA256
4. Upload metadata ke storage
5. Simpan hash ke blockchain
6. Mint NFT Certificate
7. Generate QR Code

## NFT Certificate

Gunakan ERC-721.

Metadata NFT harus berisi:

* Product ID
* Product Name
* Producer
* Origin
* Production Date
* Image URL
* Metadata Hash
* Certification Date

Simpan:

* Token ID
* Contract Address
* Transaction Hash

## QR Verification

Generate QR Code yang berisi:

* Product ID
* Certificate ID
* Verification URL

Contoh URL:

https://batikchain.id/verify/{productId}

QR harus bisa:

* Download PNG
* Download SVG
* Print Label

## Public Verification Portal

Halaman publik:

/verify/:productId

Menampilkan:

* Status Asli atau Tidak Valid
* Foto Produk
* Nama Produk
* Nama UMKM
* Daerah Asal
* Metadata Hash
* NFT Certificate
* Blockchain Transaction
* Verification History

Jika hash tidak cocok:

Tampilkan:

"Produk Tidak Terverifikasi atau Diduga Palsu"

## Digital Certificate

Generate PDF profesional berisi:

* Logo BatikChain
* Nomor Sertifikat
* Nama Produk
* Nama UMKM
* QR Code
* Blockchain Hash
* NFT Token ID
* Tanggal Sertifikasi
* Tanda tangan digital

Dapat diunduh PDF.

## Ownership History

Simpan histori:

* Produk dibuat
* Produk diverifikasi
* Produk diperbarui
* Produk berpindah pemilik

Semua histori dapat diaudit.

## Analytics Dashboard

Untuk UMKM:

* Total Produk
* Total Sertifikat
* Total Scan
* Produk Terpopuler
* Produk Terverifikasi

Untuk Admin:

* Total UMKM
* Total Produk
* Total Sertifikat
* Total Verifikasi
* Statistik Provinsi
* Statistik Aktivitas

# BLOCKCHAIN REQUIREMENT

Gunakan:

* Solidity
* OpenZeppelin
* ERC-721
* Polygon Amoy Testnet untuk development
* Polygon Mainnet untuk production

Smart Contract harus memiliki:

registerProduct()
mintCertificate()
verifyProduct()
transferOwnership()
getProduct()
getCertificate()

Gunakan contract upgradeable pattern.

# DATABASE DESIGN

Buat schema PostgreSQL menggunakan Prisma ORM.

Minimal tabel:

users
roles
permissions
smes
products
product_images
certificates
nft_tokens
verification_logs
ownership_history
audit_logs
notifications
settings

Definisikan seluruh relasi secara lengkap.

# BACKEND REQUIREMENT

Gunakan:

* NestJS
* TypeScript
* Prisma ORM
* PostgreSQL
* Redis
* BullMQ

Pattern:

* Clean Architecture
* Repository Pattern
* Service Layer
* DTO Validation
* Modular Structure

Implementasikan:

* JWT Auth
* RBAC
* Rate Limiting
* Audit Logging
* API Versioning
* Swagger Documentation

# FRONTEND REQUIREMENT

Gunakan:

* Next.js 15
* TypeScript
* TailwindCSS
* Shadcn UI
* TanStack Query
* React Hook Form
* Zod

Fitur:

* Responsive
* Dark Mode
* Dashboard
* Product Management
* Certificate Management
* Analytics
* Public Verification Page

# MOBILE APP REQUIREMENT

Gunakan:

* React Native Expo
* Expo Router
* TypeScript

Fitur:

* Login
* Dashboard
* Registrasi Produk
* QR Scanner
* Verifikasi Produk
* Notifikasi
* Profile UMKM

# STORAGE

Gunakan:

* Cloudflare R2

Untuk:

* Foto Produk
* Metadata NFT
* PDF Certificate
* QR Code

# SECURITY REQUIREMENT

Implementasikan:

* JWT Access Token
* Refresh Token Rotation
* Password Hashing Argon2
* HTTPS Only
* CSRF Protection
* XSS Protection
* SQL Injection Protection
* Rate Limiting
* File Validation
* Audit Trail
* Secure Headers

# PERFORMANCE REQUIREMENT

Target:

* API Response < 500ms
* QR Verification < 2 detik
* Dashboard Load < 3 detik
* Uptime 99.9%

# DEPLOYMENT REQUIREMENT

Frontend:

* Vercel

Backend:

* Railway atau VPS Docker

Database:

* PostgreSQL Managed

Storage:

* Cloudflare R2

Blockchain:

* Polygon

Containerization:

* Docker
* Docker Compose

CI/CD:

* GitHub Actions

# DELIVERABLE YANG HARUS DIHASILKAN

Buat secara lengkap:

1. Product Requirement Document (PRD)
2. Software Requirement Specification (SRS)
3. System Architecture Diagram
4. Database ERD
5. Prisma Schema
6. Smart Contract Solidity
7. Backend Folder Structure
8. Frontend Folder Structure
9. Mobile Folder Structure
10. REST API Specification
11. Swagger Documentation
12. Authentication Flow
13. QR Verification Flow
14. NFT Minting Flow
15. Ownership Transfer Flow
16. UI/UX Wireframe Description
17. Admin Dashboard Design
18. Deployment Architecture
19. Docker Configuration
20. CI/CD Pipeline
21. Testing Strategy
22. Security Checklist
23. Production Readiness Checklist

Kerjakan sebagai proyek enterprise-grade yang siap digunakan oleh ribuan UMKM batik di Indonesia dan dapat dikembangkan menjadi platform sertifikasi produk budaya nasional berbasis blockchain.
