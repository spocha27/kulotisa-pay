# KulotisaPay

A mobile-first BNPL (Buy Now Pay Later) platform for Botswana.
Built for AGWANE Capital Inc.

## Stack
- **Backend**: Node.js + TypeScript + Express
- **Frontend**: React (PWA — merchant dashboard)
- **Database**: PostgreSQL 15
- **Cache/Queue**: Redis
- **Infra**: Docker Compose (dev), Railway (prod)

## Quick Start (Codespaces / Local Docker)

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/kulotisa-pay.git
cd kulotisa-pay

# 2. Start all services
docker compose up --build

# 3. API running at:   http://localhost:4000
#    Dashboard at:     http://localhost:3000
#    DB at:            localhost:5432
```

## Environment Variables

Copy `.env.example` to `.env` in `/backend` and fill in values.

## API Docs

Import `docs/kulotisa.postman_collection.json` into Postman.

## Project Structure

```
kulotisa-pay/
├── backend/          Express API (TypeScript)
│   └── src/
│       ├── routes/       API route definitions
│       ├── controllers/  Request handlers
│       ├── services/     Business logic
│       ├── models/       DB query functions
│       ├── middleware/   Auth, validation, error handling
│       └── types/        TypeScript interfaces
├── frontend/         React merchant dashboard
├── database/         SQL schema + seed data
└── docker-compose.yml
```

## Key API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | User registration |
| POST | /api/auth/login | Login, returns JWT |
| POST | /api/onboarding/kyc | Submit KYC documents |
| GET  | /api/eligibility/:userId | Check credit limit |
| POST | /api/transactions | Create BNPL transaction |
| GET  | /api/transactions/:id | Get transaction + instalments |
| POST | /api/merchants/register | Merchant onboarding |
| GET  | /api/merchants/:id/dashboard | Merchant dashboard data |
| GET  | /api/admin/queue | Manual review queue |

## Compliance Notes

- All loan decisions are audit-logged
- KYC documents stored encrypted (S3 in prod)
- NBFIRA compliance stubs marked with `// COMPLIANCE:`
- Credit bureau reporting stubs marked with `// TRANSUNION:`
