# COCKPIT — Sistema de Reentrada

## Deploy Direto (sem rodar local)

### 1. Banco de dados (~5 min)

- Abre o **Supabase** → **SQL Editor**
- Cola o conteúdo do `supabase-schema.sql` → **Run**
- Confirma que as 5 tabelas apareceram (projects, sessions, decisions, blockers, tasks)
- Vai em **Settings > API** e copia:
  - `Project URL` (https://xxx.supabase.co)
  - `anon public key` (eyJ...)

### 2. GitHub (~3 min)

- Cria um repositório novo no GitHub (ex: `cockpit`)
- Descompacta o zip, entra na pasta `cockpit-app`
- Push:

```bash
cd cockpit-app
git init
git add .
git commit -m "cockpit v1"
git branch -M main
git remote add origin https://github.com/SEU-USER/cockpit.git
git push -u origin main
```

### 3. Vercel (~3 min)

- Vai em [vercel.com/new](https://vercel.com/new)
- Importa o repositório `cockpit` do GitHub
- Framework: **Next.js** (detecta automaticamente)
- Antes de clicar Deploy, vai em **Environment Variables** e adiciona:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://xxx.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJ... |
| `NEXT_PUBLIC_ANTHROPIC_API_KEY` | sk-ant-... (opcional, pra importação com IA) |

- Clica **Deploy**
- Pronto. URL tipo `cockpit-xxx.vercel.app`

### 4. (Opcional) Domínio customizado

Na Vercel > Settings > Domains, adiciona `cockpit.seudominio.com`.

---

## Estrutura

```
cockpit-app/
├── app/
│   ├── globals.css
│   ├── layout.js
│   └── page.js          ← carrega dados do Supabase
├── components/
│   └── Cockpit.jsx      ← UI completa
├── lib/
│   ├── supabase.js      ← cliente Supabase
│   └── db.js            ← operações de banco
├── supabase-schema.sql   ← SQL pra criar tabelas
├── .env.local.example
├── .gitignore
├── jsconfig.json
├── next.config.js
└── package.json
```
