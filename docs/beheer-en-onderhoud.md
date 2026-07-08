# Beheer & onderhoud

## Deployment-runbook (Railway)
1. Werk lokaal; commit incl. nieuwe `prisma/migrations/`.
2. Push naar `main` → Railway bouwt automatisch.
3. Pre-deploy command draait `npx prisma migrate deploy` (faalt de migratie → deploy stopt,
   oude versie blijft live).
4. Healthcheck `/api/health` moet 200 geven vóór traffic-switch.

### railway.json (voorbeeld)
```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "preDeployCommand": "npx prisma migrate deploy",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 120,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Environment variables
- `DATABASE_URL` → reference-variabele naar Postgres-plugin (`${{ Postgres.DATABASE_URL }}`),
  met `?sslmode=require`.
- `AUTH_SECRET` (genereer: `openssl rand -base64 32`), `AUTH_TRUST_HOST=true`.
- `SUBSIDIESCAN_TOKEN` (gedeeld geheim voor publiek endpoint).
- `.env.example` bijhouden; nooit echte secrets committen.

## Backups
- Gebruik Railway's ingebouwde database-backups (dagelijks) **of** een backup-service naar
  S3/GCS (cron, bv. dagelijks 03:00 UTC), met retentiebeleid.
- **Test herstel** periodiek (een ongeteste backup is waardeloos).

## Seed opnieuw draaien
`npx prisma db seed` (command staat in `prisma.config.ts`: `tsx prisma/seed.ts`).
Seed is idempotent: eerst `deleteMany` per bibliotheektabel, dan opnieuw invoeren.

## Hoe voer ik een wijziging door?
1. Schemawijziging → `schema.prisma` aanpassen → `npx prisma migrate dev --name <naam>`.
2. Nieuwe/gewijzigde UI → component + Server Action + Zod-validator.
3. Architectuurkeuze → nieuwe ADR in `docs/adr/`.
4. Fasewijziging → betreffende `docs/fase-*.md` bijwerken (DoD blijft leidend).
5. Commit + push → deploy.

## Troubleshooting
| Symptoom | Oorzaak | Oplossing |
|----------|---------|-----------|
| "too many connections" | geen singleton | `lib/prisma.ts` singleton gebruiken |
| Login faalt in prod | `AUTH_SECRET` mist | var zetten in Railway |
| Healthcheck faalt | app luistert niet op `PORT` | luister op `process.env.PORT`; sta `healthcheck.railway.app` toe |
| PNG-export leeg | externe images cross-origin | assets same-origin hosten |
| Migratie faalt bij deploy | destructieve wijziging | backup terugzetten; forward-fix migratie |

## Migratiepad weg van Railway (optioneel)
Render/Fly ondersteunen dezelfde build/start + healthcheck-path; `DATABASE_URL` direct zetten
en `pg_restore` van backup. Zie ADR-0006.
