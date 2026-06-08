# Changelog

## [1.0.0] - 2026-06-08

### Added
- **Frontend**: React + Vite + TypeScript + TailwindCSS
  - Landing page, Login, Register, Verify page
  - UMKM Dashboard (stats, products, certificates, settings)
  - Admin Dashboard (users, products management)
  - QR Code generation & PDF certificate download
  - JWT auth context with Axios interceptor
- **Backend**: NestJS + Prisma + TypeScript
  - Auth module (register, login, JWT + refresh token, Argon2)
  - Products module (CRUD, SHA256 hash, token ID)
  - Certificates module (mint, QR generation)
  - Verification module (hash comparison + logging)
  - Dashboard module (UMKM stats, admin national stats)
  - Metadata module (ERC-721 tokenURI)
  - Users module (management, role editing)
  - RBAC with RolesGuard + custom decorator
  - Swagger documentation at /api/docs
- **Smart Contract**: Solidity + Hardhat + OpenZeppelin
  - BatikNFT.sol — ERC-721 with URI Storage, Pausable, Ownable
  - Product registration, certificate minting, verification
  - Ownership history, certificate revocation, hash deduplication
  - 16 comprehensive tests (Chai + ethers)
- **Mobile**: Flutter + Dart + Provider
  - Auth screens (login, register)
  - Dashboard shell with bottom navigation
  - Product list, detail, add product
  - QR scanner + verification result
- **Deployment**: Docker + Docker Compose
  - Frontend multi-stage Dockerfile (nginx)
  - Backend multi-stage Dockerfile (prisma + node)
  - PostgreSQL 16 service
  - Nginx reverse proxy to backend

### Fixed
- Backend .env SQLite URL → PostgreSQL env var substitution
- Nginx: added security headers, gzip, caching, rate limiting
- Docker Compose: added Redis service, container names, healthchecks

## [1.3.0] - 2026-06-08

### Security (HIGH)
- **JWT secret validation**: startup crash if JWT_SECRET not set or uses default value
- **Google OAuth token leak**: tokens now set as httpOnly cookies instead of URL params
- **Authorization fix**: UsersController requires ADMIN/VERIFICATOR for listing, ownership check for update
- **Certificate minting**: restricted to ADMIN/VERIFICATOR role only
- **Swagger docs**: disabled in production (NODE_ENV=production)
- **CSP enabled**: strict Content Security Policy via Helmet
- **Rate limiting**: per-endpoint limits on auth (login: 5/min, register/forgot: 3/min)
- **`.env` added to `.gitignore`**: prevents secret leakage to version control
- **File upload**: Content-Type set on R2 objects, magic byte via ParseFilePipe

### Security (MEDIUM)
- **Password policy**: minimum 8 chars + uppercase + lowercase + number
- **Reset token logging**: masked email instead of full reset link
- **Source maps**: disabled in production Vite build
- **Admin routes**: client-side `<RequireRole role="admin">` wrapper
- **Product controller**: non-404 errors no longer swallowed

## [1.2.1] - 2026-06-08

### Fixed
- **Bug: product status always 'rejected'**: mapProduct mapped 'CERTIFIED' instead of 'VERIFIED'
- **Bug: Google OAuth token key mismatch**: LoginPage used 'token' instead of 'auth_token' in localStorage
- **Bug: hardcoded API URL**: http.ts baseURL now uses VITE_API_URL env var
- **Bug: VerifyPage can't find by tokenId**: products controller now falls back to findByTokenId
- **Bug: tautology in verification service**: simplified `isValid || !isValid` to remove redundant check
- **Bug: 401 redirect on public pages**: http interceptor skips redirect for /verify, /login, etc.
- **Bug: data URL stored instead of R2 URL**: NewProductPage now uploads to R2 first before submit
- **Bug: mintCertificate API mismatch**: updated to handle 202 queue response (returns jobId)
- **TypeScript config**: added tsconfig.json for frontend with skipLibCheck

## [1.2.0] - 2026-06-08

### Added
- **Google OAuth login**: passport-google-oauth20 strategy, auto-create user
  - GET /auth/google and /auth/google/callback
  - "Masuk dengan Google" button on LoginPage
- **Password reset**: forgot-password + reset-password endpoints
  - crypto token generation, 1-hour expiry, Argon2 re-hashing
  - ForgotPasswordPage UI at /forgot-password
- **User schema**: added resetToken and resetTokenExp fields

## [1.1.0] - 2026-06-08

### Added
- **BullMQ queue system**: async certificate minting via Redis queue
  - CertificateQueueService: addMintJob with retry (3 attempts, exponential backoff)
  - CertificateProcessor: WorkerHost processing mint jobs
  - POST /certificates/mint returns 202 Accepted with jobId
- **Cloudflare R2 storage**: S3-compatible file upload
  - R2Service: upload to products folder, getSignedUrl
  - POST /products/upload with 5MB max, jpeg/png/webp validation
- **Rate limiting**: 60 requests/minute global via @nestjs/throttler
- **Helmet security headers**: CSP, XSS, frameguard, etc.
- **CI/CD**: GitHub Actions workflows (CI build+test, CD deploy via SSH)
- **Health endpoint**: GET /api/v1/health for Docker healthcheck
- **Backend .env**: Redis, JWT refresh secret, R2 env vars with defaults
