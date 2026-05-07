# SingleShot

Landing page szkoleń strzeleckich. Frontend statyczny (Astro), treści w
headless CMS (Payload 3 + Postgres).

## Layout repo

```
cms/                 Payload 3 (Next.js 16) — admin pod /admin, REST/GraphQL pod /api
web/                 Astro 5 — buduje statyczny HTML z treści Payloada
SingleShot.html      oryginalny prototyp, zostaje jako wzorzec
videos/  uploads/    media (symlinkowane do web/public)
logo.svg             logo (symlinkowane do web/public)
```

## Pierwsze uruchomienie

```bash
# z roota repo
pnpm install               # zależności root (concurrently)
cd cms && pnpm install     # zależności Payload (jeśli nie zrobione)
cd ../web && pnpm install  # zależności Astro (jeśli nie zrobione)
cd ..

pnpm seed                  # zasiewa bazę treściami z SingleShot.html
pnpm dev                   # startuje CMS i frontend razem
```

Po starcie:

- **Panel CMS:** http://localhost:3000/admin
  - Pierwsze wejście: poprosi o utworzenie konta admina (e-mail + hasło)
- **Frontend (Astro):** http://localhost:4321
- **REST API:** http://localhost:3000/api/{collection|globals/slug}

## Jak edytować treści

1. Otwórz panel: http://localhost:3000/admin
2. Wybierz sekcję z menu po lewej:
   - **Globals** — Hero, About, Wireframe, Green Tactics, Contact, Site Settings
   - **Collections** — Trainings, Pricing Cards, Principles, Opinions
3. Edytuj pola
4. Kliknij **Live Preview** (ikona u góry edytora) — frontend renderuje się
   w iframe z aktualnymi zmianami; po każdej edycji pola podgląd
   automatycznie odświeża się
5. Kliknij **Save** — zmiany lądują w bazie

W dev mode Astro re-fetchuje dane z Payloada przy każdym przeładowaniu
strony, więc zmiany widać natychmiast bez rebuildu.

## Skrypty (root)

```bash
pnpm dev          # CMS + frontend razem (concurrently)
pnpm dev:cms      # tylko Payload
pnpm dev:web      # tylko Astro
pnpm seed         # re-seed bazy z domyślnymi treściami (uwaga: nadpisuje)
pnpm build:cms    # build produkcyjny Payloada
pnpm build:web    # build produkcyjny Astro → web/dist/
pnpm stop         # ubija wszystkie dev serwery
```

## Konfiguracja środowiska

**`cms/.env`:**

```
DATABASE_URI=postgres://user:pass@host:5432/dbname
PAYLOAD_SECRET=long-random-string
FRONTEND_URL=http://localhost:4321
```

**`web/.env`:**

```
PAYLOAD_URL=http://localhost:3000
```

W produkcji ustawiamy `FRONTEND_URL` na publiczny adres frontu, a
`PAYLOAD_URL` na publiczny adres CMS-u.

## Auto-rebuild po edycji w produkcji

Każda zmiana w kolekcji (Trainings, Pricing Cards, Principles, Opinions)
i w globalu (Hero, About, Wireframe, Green Tactics, Contact, Site
Settings) wywołuje hook `afterChange`, który po 2 s debounce'a strzela
jednym POST-em w `REBUILD_WEBHOOK_URL`. Wiele edycji w tym oknie składa
się w jeden rebuild.

Ustaw `cms/.env`:

```bash
REBUILD_WEBHOOK_URL=https://...
REBUILD_WEBHOOK_METHOD=POST                  # default
REBUILD_WEBHOOK_AUTH=Bearer <token>          # optional
REBUILD_WEBHOOK_BODY={"event_type":"rebuild"} # optional
```

Konkretne integracje:

- **Vercel Deploy Hook**
  Project → Settings → Git → Deploy Hooks → Create.
  ```
  REBUILD_WEBHOOK_URL=https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy
  ```
- **Netlify Build Hook**
  Site settings → Build & deploy → Build hooks → Add build hook.
  ```
  REBUILD_WEBHOOK_URL=https://api.netlify.com/build_hooks/zzz
  ```
- **Cloudflare Pages Deploy Hook**
  Pages → Project → Settings → Builds & deployments → Deploy hooks.
  ```
  REBUILD_WEBHOOK_URL=https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/aaa
  ```
- **GitHub Actions `repository_dispatch`**
  ```
  REBUILD_WEBHOOK_URL=https://api.github.com/repos/<owner>/<repo>/dispatches
  REBUILD_WEBHOOK_AUTH=Bearer <github-pat-with-repo-scope>
  REBUILD_WEBHOOK_BODY={"event_type":"payload-content-changed"}
  ```
  Następnie w `.github/workflows/rebuild.yml`:
  ```yaml
  on:
    repository_dispatch:
      types: [payload-content-changed]
  ```

W dev zostaw zmienną nieustawioną — Astro re-fetchuje Payloada na każde
przeładowanie strony, więc rebuild jest niepotrzebny.

## Dev → prod, pokrótce

- Schema (kolekcje, pola, walidacje, hooki) jedzie przez git i deploy.
  Migracje generuje się przez `pnpm payload migrate:create`, commituje plik
  SQL i na prodzie odpala `pnpm payload migrate`.
- Treści (rekordy w bazie) edytuje się bezpośrednio na produkcji przez
  panel — nie wozimy ich z deva.
- Media: w prodzie podpinamy `@payloadcms/storage-s3` (lub R2/Cloudinary),
  bo lokalny dysk hostingu jest efemeryczny.
- Frontend Astro buduje się na CI z `PAYLOAD_URL` ustawionym na publiczny
  adres CMS-a. Auto-rebuild po zmianie treści — patrz sekcja wyżej.

## Co działa, co jeszcze do zrobienia

Działa: pełny layout z `SingleShot.html` z treścią z Payloada (5 szkoleń,
6 kart cennika, 5 zasad, hero, about, wireframe, green tactics, contact,
nawigacja). Animacje scroll/scrub video bez zmian. Live Preview w panelu.

Do zrobienia: upload mediów do panelu (teraz video idą przez symlink z
`videos/`), sekcja opinii w UI, adapter SMTP, webhook do auto-rebuildu,
plugin storage-s3 do prod.
