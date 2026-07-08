# ADR-0006 - Railway hosting + auto-deploy
Status: Aanvaard · 2026-07-07
## Beslissing
Railway; auto-deploy vanaf `main`. `railway.json`: pre-deploy `npx prisma migrate deploy`;
healthcheck `/api/health`. PostgreSQL via plugin; dagelijkse backup.
## Reden
Zero-config Postgres, git-push-deploy, healthcheck = zero-downtime.
## Gevolgen
+ Minimale ops. − Vendor-afhankelijk (migratiepad naar Render/Fly gedocumenteerd in beheerdoc).
