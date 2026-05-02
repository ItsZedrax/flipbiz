# FlipBiz

PWA Next.js 14 pour gérer un business d'achat-revente partagé : sneakers, cartes
de collection, montres, streetwear. Suivi articles → achats → ventes → profit
& ROI en temps réel, traçabilité complète (qui a acheté/vendu/modifié), mode
clair/sombre, analytics et export.

> **État actuel : étape 1 / 7 — Fondations** ✅
> Auth, schéma DB, RLS, seed, thème, layouts. Le dashboard et les écrans
> métier arrivent dans les étapes suivantes.

---

## Stack

| Domaine                  | Choix |
|--------------------------|-------|
| Framework                | Next.js 14 (App Router, RSC, TypeScript strict) |
| Styles                   | Tailwind CSS 3 + composants shadcn-style |
| DB / Auth / Storage      | Supabase (PostgreSQL + RLS + Storage) |
| Server state             | TanStack Query v5 |
| Client state             | Zustand |
| Forms                    | React Hook Form + Zod |
| Tables                   | TanStack Table v8 *(étape 3+)* |
| Charts                   | Recharts *(étape 2+)* |
| Animations               | Framer Motion |
| Icons                    | lucide-react |
| Theme                    | next-themes |
| Toasts                   | sonner |

---

## Prérequis

- **Node.js ≥ 20** (testé avec Node 25)
- **pnpm ≥ 9**
- Un compte **Supabase Cloud** gratuit ([supabase.com](https://supabase.com))

> ℹ️ Pas besoin de Docker : la stack tourne 100 % contre Supabase Cloud.
> Le dossier `supabase/migrations/` est compatible avec la CLI Supabase si tu
> en installes une plus tard.

---

## Setup en 5 minutes

### 1. Cloner & installer

```bash
git clone <repo-url> flipbiz
cd flipbiz
pnpm install
```

### 2. Créer le projet Supabase

1. Va sur [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Note le **mot de passe DB** (utile plus tard pour la CLI)
3. Une fois prêt, ouvre **Settings → API** et copie :
   - `Project URL`
   - `anon public` key
   - `service_role` key *(reveal & copy — usage backend uniquement)*

### 3. Configurer `.env.local`

```bash
cp .env.local.example .env.local
```

Édite `.env.local` et colle les 3 valeurs ci-dessus.

### 4. Appliquer le schéma

Dans le dashboard Supabase → **SQL Editor → New query**, copie-colle dans
l'ordre **chacun** des 4 fichiers et exécute :

1. `supabase/migrations/20260430000001_init_schema.sql`
2. `supabase/migrations/20260430000002_rls_policies.sql`
3. `supabase/migrations/20260430000003_views_and_functions.sql`
4. `supabase/migrations/20260430000004_storage_buckets.sql`

> Tu peux aussi installer la [Supabase CLI](https://supabase.com/docs/guides/cli)
> et faire : `supabase link --project-ref XXXX && supabase db push`.

### 5. Seed des données de démo (optionnel mais recommandé)

```bash
pnpm db:seed
```

Crée 3 utilisateurs (`alex@`, `mehdi@`, `sarah@flipbiz.local` / mot de passe
`flipbiz123`), 20 articles, ~20 transactions et 8 dépenses.

### 6. Lancer l'app

```bash
pnpm dev
```

→ [http://localhost:3000](http://localhost:3000)

Connecte-toi avec un des comptes de démo, ou crée le tien via `/signup`.

---

## Scripts disponibles

| Commande         | Action |
|------------------|--------|
| `pnpm dev`       | Serveur de dev avec hot-reload |
| `pnpm build`     | Build de production |
| `pnpm start`     | Lance le build de production |
| `pnpm lint`      | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:seed`   | Re-seede la base avec données de démo (idempotent) |

---

## Architecture

```
.
├── app/
│   ├── (auth)/                # routes publiques : /login, /signup
│   ├── (app)/                 # routes protégées : /, /profile, /articles, …
│   ├── auth/callback/         # callback Supabase OAuth / magic link
│   └── layout.tsx             # providers + fonts
├── components/
│   ├── ui/                    # primitives shadcn-style (Button, Input, …)
│   ├── auth/                  # LoginForm, SignupForm, ProfileForm, ColorPicker
│   ├── layout/                # SiteLogo, ThemeToggle, UserAvatar, UserMenu
│   └── providers.tsx          # Theme + QueryClient + Toaster
├── lib/
│   ├── supabase/              # client, server, middleware, admin helpers
│   ├── validations/           # schémas Zod
│   ├── utils.ts               # cn(), formatCurrency(), getInitials()
│   └── constants.ts           # couleurs, labels FR, plateformes
├── types/
│   ├── database.ts            # types miroir du schéma Postgres
│   └── domain.ts              # types métier composés
├── supabase/
│   ├── migrations/            # 4 fichiers SQL versionnés
│   └── seed.ts                # script de seed (TypeScript, tsx)
├── middleware.ts              # rafraîchit la session + protège les routes
└── …
```

---

## Sécurité

- **RLS activée** sur toutes les tables. Toutes les politiques sont dans
  `supabase/migrations/20260430000002_rls_policies.sql`. Lecture pour
  authentifiés, mutations pour authentifiés (sauf `profiles.update` restreint
  à soi-même).
- **Validation Zod** côté client (et à reproduire côté API quand on en
  ajoute) — voir `lib/validations/`.
- **Triggers d'audit** : chaque INSERT/UPDATE/DELETE sur `articles`,
  `purchases`, `sales`, `expenses` est tracé dans `audit_log` avec l'`auth.uid()`.
- **`SUPABASE_SERVICE_ROLE_KEY`** : ne jamais l'exposer côté client. Utilisée
  uniquement par `pnpm db:seed`.

---

## Déploiement (Vercel + Supabase Cloud)

1. Push ton code sur GitHub
2. Sur [vercel.com](https://vercel.com), **Import Project** → sélectionne le repo
3. Variables d'environnement Vercel :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - *(pas besoin de la service role key en runtime)*
4. Deploy.

Vercel détecte automatiquement Next.js 14 et configure le build.

---

## Roadmap des étapes restantes

| Étape | Contenu |
|------:|---------|
| 2 | Layout principal (sidebar/bottom nav) + Dashboard avec 6 graphiques + alertes |
| 3 | Articles : liste/grille, fiche, formulaire dynamique par catégorie, upload photos |
| 4 | Achats + Ventes : forms dédiés, factures, calcul auto frais |
| 5 | Stock (aging) + Analytics (par user/cat/plateforme + scatter ROI) |
| 6 | Export Excel/PDF + Dépenses + Settings |
| 7 | PWA (manifest, service worker, icônes) + polish final |
