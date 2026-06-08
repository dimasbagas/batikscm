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
