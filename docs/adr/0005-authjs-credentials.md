# ADR-0005 - Auth.js v5 met Credentials (één gebruiker)
Status: Aanvaard · 2026-07-07
## Beslissing
Auth.js v5, Credentials-provider, JWT-sessie, bcrypt-hash. Env met `AUTH_`-prefix,
`AUTH_SECRET` verplicht, `AUTH_TRUST_HOST=true` achter Railway-proxy.
## Reden
Simpel, geen OAuth nodig voor één gebruiker.
## Gevolgen
+ Weinig config. − Zelf wachtwoord-reset regelen (handmatig via seed/instellingen).
