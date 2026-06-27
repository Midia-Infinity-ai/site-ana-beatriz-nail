# Ana Beatriz | Nail Artistry

Site profissional da nail designer Ana Beatriz: uma landing editorial de luxo
(PT-BR) com um painel administrativo e um provador virtual de unhas por IA.

## Stack

- **Front-end:** React 18 + TypeScript + Vite + Tailwind CSS
- **Design:** sistema editorial "L'Atelier d'Artiste" (Pearl White / Onyx /
  Deep Burgundy / Antique Gold; EB Garamond + Montserrat; cantos retos)
- **Back-end:** Fastify + SQLite (better-sqlite3) + JWT (login do painel)
- **Painel:** `/admin` para gerenciar reservas, textos, capas, serviços,
  rastreamento e métricas de visitas
- **IA:** provador virtual "Espelho do Futuro" — o visitante envia a foto da
  mão, escolhe um estilo e recebe uma prévia ultra-realista das unhas, gerada
  via OpenRouter + Gemini (`gemini-2.5-flash-image`)

## Estrutura

```
src/                 Front-end
  components/         Header (menu overlay), Footer, Layout, Seo, ...
  components/sections Hero, Criadora, Sensorial, Services, BeforeAfter,
                      AiMirror (provador), ContactSection
  content/           Camada de conteúdo (ContentProvider + API)
  pages/             Home, PrivacyPolicy (LGPD), NotFound
  admin/             Painel administrativo
server/              Back-end Fastify + SQLite (API + serve o SPA em produção)
public/img/          Imagens (enviadas pelo painel "Capas"/"Mídia")
```

A camada de conteúdo é desacoplada: a página lê de `ContentProvider`, que inicia
com os dados embarcados (primeira pintura instantânea) e sobrescreve com os dados
ao vivo da API quando disponível.

## Desenvolvimento

```bash
# 1) Back-end (API em http://localhost:3000)
cd server && npm install && npm run dev

# 2) Front-end (http://localhost:5173, faz proxy de /api para :3000)
npm install && npm run dev
```

Login padrão de desenvolvimento do painel: `admin@anabeatriznail.com.br` /
`anabeatriz123` (defina `OWNER_EMAIL`/`OWNER_PASSWORD`/`JWT_SECRET` para qualquer
ambiente real). Painel: http://localhost:5173/admin

## Build

```bash
npm run build                # front-end -> dist/
cd server && npm run build   # back-end -> server/dist/
```

## Provador virtual (Espelho do Futuro)

A seção "Espelho do Futuro" na home permite à cliente enviar uma foto da mão
(galeria ou câmera), escolher um estilo e gerar uma prévia das unhas. O modelo de
imagem repinta apenas as unhas, mantendo a mão real, e a prévia é exibida só para
a visitante (a foto não é publicada). Requer `OPENROUTER_API_KEY`; sem ela, o
recurso responde como "em configuração". Há limite mensal (`AI_MONTHLY_LIMIT`,
padrão 200) e rate-limit por IP.

## Deploy (EasyPanel)

Um único container Node serve a API e o SPA (com fallback de SPA), via o
`Dockerfile` multi-stage na raiz.

1. Crie um app no EasyPanel a partir do **Dockerfile**.
2. **Volume persistente** montado em `/data` (guarda `ana-beatriz.db` e uploads).
3. **Porta:** `3000`. Health check: `/api/health`.
4. **Variáveis de ambiente** (veja `server/.env.example`): `OWNER_EMAIL`,
   `OWNER_PASSWORD` (ou `OWNER_PASSWORD_HASH`), `JWT_SECRET`,
   `NODE_ENV=production`, `PUBLIC_URL`. Para o provador: `OPENROUTER_API_KEY`.
5. Domínio + HTTPS pelo próprio EasyPanel. Após o HTTPS, defina `COOKIE_SECURE=true`.

Backups = copiar o conteúdo do volume `/data`.

## Idioma

A interface e a copy estão em português (PT-BR).
