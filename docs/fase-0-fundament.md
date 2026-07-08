# Fase 0 - Fundament

## Doel
Werkende, ingelogde, lege applicatie live op Railway, in de huisstijl.

## Scope
**In:** repo-setup, Next.js+Prisma+Tailwind, Railway+PostgreSQL, login, huisstijl-layout
met donkere zijbalk, leeg dashboard, healthcheck-endpoint.
**Uit:** alle domeinfunctionaliteit (komt Fase 1+).

## User stories
- **US-0.1** - *Als Lotte wil ik kunnen inloggen met e-mail + wachtwoord, zodat alleen ik
  bij de app kan.*
  - Gegeven een geldig account, wanneer ik correcte gegevens invul, dan kom ik op /dashboard.
  - Gegeven foute gegevens, dan blijf ik op /login met een foutmelding.
  - Onbeschermde toegang tot /dashboard (uitgelogd) leidt naar /login.
- **US-0.2** - *Als Lotte wil ik de navigatiestructuur zien, zodat de app voelt als één geheel.*
  - Donkere zijbalk toont 8 items; actief item is gemarkeerd.
- **US-0.3** - *Als Lotte wil ik een leeg dashboard op de live URL zien, zodat ik weet dat
  deploy + database werken.*

## Schermen/routes
- `/login` (publiek), `/dashboard` (leeg, welkomsttekst), zijbalk-layout in `(app)/layout.tsx`.

## API-endpoints
- `POST /api/auth/[...nextauth]` (Auth.js), `GET /api/health` → `{status:"ok"}` (200).

## Databasewijzigingen
- Model `User` (zie datamodel). Migratie `0000_init_user`.

## Technische aanpak
- `create-next-app` (TypeScript, App Router). Prisma init + singleton `lib/prisma.ts`.
- Auth.js v5 Credentials: `authorize()` zoekt user, vergelijkt bcrypt-hash; JWT-sessie.
- `railway.json` met pre-deploy `npx prisma migrate deploy`; healthcheck path `/api/health`.
- `.env.example` met `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`.

## Definition of Done (testbaar)
- [ ] Inloggen lukt op de **live Railway-URL**.
- [ ] Leeg dashboard zichtbaar na login; uitgelogd → redirect naar /login.
- [ ] `/api/health` geeft 200; Railway-deploy wordt pas live ná healthcheck.
- [ ] `prisma migrate deploy` draait automatisch bij deploy.

## Testplan
- Handmatig: login happy/faal-pad; directe URL-toegang uitgelogd.
- Deploy-rooktest: push naar main → deploy groen → live login.

## Risico's
- Prisma connectieleak bij hot-reload → singleton verplicht.
- `AUTH_SECRET` ontbreekt in prod → login faalt: opnemen in Railway-variabelen.
