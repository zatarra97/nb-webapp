# nb-webapp

SPA React per NB — sito pubblico bilingue IT/EN + backoffice admin.

## Stack

- **React 18** + **TypeScript** + **Vite 6**.
- **Routing**: `react-router-dom` v7 (BrowserRouter).
- **UI**: Tailwind CSS v4 (`@tailwindcss/vite`) + **Flowbite React** (richiede `flowbite-react patch` in postinstall). FontAwesome per icone.
- **Form**: `react-hook-form` + `@hookform/resolvers`.
- **Rich text**: TipTap (`@tiptap/react`, `@tiptap/starter-kit`) per editor nei content blocks e descrizioni.
- **i18n**: `react-i18next` + `i18next-browser-languagedetector`, locales in `src/i18n/locales/{it,en}.json`.
- **Auth client**: `amazon-cognito-identity-js` (no Amplify).
- **HTTP**: `axios` con client autenticato e silent refresh.
- **Notifiche**: `react-toastify`.
- **SEO**: `react-helmet-async`.

## Comandi

```
npm run dev       # Vite dev server (default porta 5173, ma backend CORS è su 5175 — verificare .env / CORS)
npm run build     # Vite build → build/
npm run preview
npm run lint      # ESLint 9 flat config
```

Output build: `build/` (non `dist/`, configurato in `vite.config.js`).

## Layout

```
src/
├── main.tsx              Entry; carica i18n e App
├── App.tsx               Router, ProtectedRoute, check sessione Cognito al mount
├── App.css
├── Components/           Componenti condivisi riusabili
│   ├── AdminLayout.tsx   Wrapper backoffice (sidebar + header)
│   ├── PublicLayout.tsx  Wrapper pagine pubbliche (header/footer, switch lingua)
│   ├── Input.tsx, Select.tsx, Table.tsx
│   ├── ConfirmDialog.tsx ConfirmDialogProvider + useConfirmDialog (Promise-based)
│   ├── CookieBanner.tsx  Banner consenso cookie
├── Pages/
│   ├── Home/, About/, Eventi/, Gallery/, Discografia/, Contacts/, Press/    Pubbliche
│   ├── Legal/PrivacyPolicy.tsx, CookiePolicy.tsx                             Conformità GDPR/Garante
│   ├── Auth/Login.tsx
│   ├── Newsletter/Conferma.tsx, Disiscrizione.tsx
│   └── Backoffice/       Una cartella per entità, pattern List + Detail
│       ├── Events/, Press/, PhotoAlbums/, MusicAlbums/, ContentBlocks/, Newsletter/
├── Images/
├── constants/index.ts    USER_ROLES, LOCAL_STORAGE_KEYS, resolveRole, DEFAULT_ADMIN_ROUTE
├── i18n/
│   ├── index.ts          Init i18next
│   └── locales/it.json, en.json
└── services/
    ├── cognito.ts        userPool singleton + cognitoService (signIn, getSession, signOut, getTokenPayload)
    ├── api-utility.ts    apiClient axios + silent refresh + helper CRUD
    ├── consent.ts        Stato consenso cookie (GDPR/Garante) con versioning + scadenza 6 mesi
    └── analytics.ts      Loader Google Analytics 4 gated dal consenso (Consent Mode v2)
```

## Compliance privacy (GDPR + Garante)

- **`/privacy-policy`** e **`/cookie-policy`** sono pagine statiche in `Pages/Legal/` con versione IT e EN inline (conditional su `i18n.language`).
- Il contenuto è testo giuridico con **placeholder `[INSERIRE ...]`** per CF, indirizzo e email privacy del Titolare: **vanno compilati prima del deploy in produzione**.
- **`CookieBanner`** è montato in `App.tsx` fuori dalle Routes, sempre visibile se non c'è consenso valido. Tre azioni: *Accetta tutti*, *Rifiuta tutti*, *Personalizza* (con checkbox granulari). Il banner non ha X di chiusura: il Garante richiede una scelta esplicita.
- **`services/consent.ts`** gestisce il consenso con versioning (`CONSENT_POLICY_VERSION`) + scadenza 6 mesi. **Incrementare la versione** ogni volta che la Cookie Policy cambia sostanzialmente (es. nuove categorie o nuovi strumenti di tracciamento): ciò invalida i consensi esistenti e fa ricomparire il banner.
- **`services/analytics.ts`** carica GA4 **solo** dopo consenso (blocco preventivo). Usa Consent Mode v2 (`ad_storage`, `analytics_storage` su denied di default, update a runtime). `trackPageView(path)` è richiamato su change route in `App.tsx`.
- Il footer di `PublicLayout.tsx` linka le pagine legali e contiene il bottone *Gestisci cookie* che riapre il banner (utility `openCookiePreferences()` — custom event `nb-open-cookie-preferences`).
- Se si aggiunge un nuovo cookie o embed di terze parti (YouTube, Spotify, ecc.), aggiornare la tabella cookie in `CookiePolicy.tsx` e incrementare `CONSENT_POLICY_VERSION`.

## Auth flow

1. `App.tsx` al mount chiama `userPool.getCurrentUser().getSession()`. Se valida, estrae `cognito:groups` dal `idToken`, risolve il ruolo via `resolveRole()`, salva token in `localStorage` e setta `isAuthenticated`.
2. **Timeout 3s** sul `getSession` per evitare di bloccare il render in caso di rete lenta.
3. `ProtectedRoute` redirige a `/admin/login` salvando l'URL in `RETURN_URL`; mostra uno spinner finché `isCheckingAuth`.
4. `apiClient` (axios) inietta `Authorization: Bearer <idToken>` da `LOCAL_STORAGE_KEYS.ID_TOKEN` o `ACCESS_TOKEN`.
5. Su **401**: `silentTokenRefresh()` rinegozia dal Cognito User via refresh token. Se fallisce, `sessionExpired()` pulisce localStorage e redirige al login.

**Non riscrivere la chiave di storage** — usare sempre `LOCAL_STORAGE_KEYS.*` da `constants/`.

## Chiamate API

Usare **sempre** gli helper in `services/api-utility.ts`, non chiamare axios diretto:

- `getPublicList(entity)` / `getPublicItem(entity, id)` — endpoint senza auth.
- `adminGetList(entity)` / `adminGetItem(entity, id)` / `adminCreate` / `adminUpdate` / `adminDelete` / `adminPatch` / `adminPostAction(path, data)` — con auth.
- `getUploadUrl(folder, filename, contentType)` → `{ uploadUrl, publicUrl, s3Path }`, poi `uploadToS3(uploadUrl, file)` per PUT diretto su S3.
- `deleteMedia(url)` per cancellare un oggetto S3 caricato.

`BACKEND_URL` viene da `VITE_BACKEND_URL`. `S3_BASE_URL` è costruito da `VITE_S3_MEDIA_BUCKET` + `VITE_S3_REGION`.

## Routing

Struttura in `App.tsx`:

- **Pubbliche**: `/`, `/about`, `/eventi`, `/gallery`, `/gallery/:albumId`, `/discografia`, `/contacts`, `/newsletter/conferma`, `/newsletter/disiscrizione`.
- **Login**: `/admin/login` (redirect a `DEFAULT_ADMIN_ROUTE` se già loggato).
- **Admin** (tutte avvolte in `ProtectedRoute` + `AdminLayout`):
  `/admin/eventi`, `/admin/eventi/:id`, `/admin/press`, `/admin/press/:id`, `/admin/gallery`, `/admin/gallery/:albumId`, `/admin/discografia`, `/admin/discografia/:id`, `/admin/contenuti`, `/admin/contenuti/:id`, `/admin/newsletter`.
- Fallback `*` → `/`.

Aggiungere `document.body.className` toggle `admin-mode` su `/admin/*` per differenziare stili se necessario (già presente in `AppContent`).

## i18n

- Stringhe UI esclusivamente in `src/i18n/locales/{it,en}.json`. Non hardcodare testo in componenti — usare `useTranslation()` + `t("chiave")`.
- Contenuti dinamici dal DB hanno già i campi `descrizioneIT`/`descrizioneEN` ecc.: selezionare in base a `i18n.language`.
- Lingua di default: auto-detect browser, fallback `it`.

## Convenzioni pagine backoffice

Ogni entità ha **due componenti** (`<Entità>.tsx` = lista + modale/inline create, `<Entità>Detail.tsx` = edit). Pattern consolidato:

1. `adminGetList("<entità>")` al mount, popolare stato tabella.
2. Table da `Components/Table.tsx`; azioni CRUD via toolbar.
3. Detail usa `react-hook-form` + `adminGetItem` al mount (per edit) o form vuoto (per create).
4. Upload immagine: `getUploadUrl` → `uploadToS3` → salva `s3Path` nel form.
5. On submit: `adminCreate` o `adminUpdate` + `toast.success` + `navigate` indietro.

Rispettare questa struttura quando si aggiunge una nuova entità.

## Conferme di eliminazione

**Mai usare `window.confirm()`** nel backoffice — la native dialog non è brandizzata e non supporta descrizioni ricche. Usare invece `useConfirmDialog()` da `Components/ConfirmDialog.tsx`:

```tsx
const confirm = useConfirmDialog();
const ok = await confirm({
  title: "Eliminare l'album?",
  description: <>Stai per eliminare <strong>"{x.nome}"</strong> e le sue <strong>{n}</strong> immagini.</>,
  confirmLabel: 'Elimina',
  variant: 'danger', // 'danger' | 'warning' | 'default'
});
if (!ok) return;
// ... procedi con adminDelete
```

Il `ConfirmDialogProvider` è già montato in `App.tsx`. Quando si aggiunge un nuovo delete handler: includere sempre **l'identificativo umano** dell'entità (titolo/nome/email) nella descrizione e, se c'è cascata (1:N), esplicitarla (es. "e le sue N immagini"). Variante `danger` per le eliminazioni, `warning` per azioni reversibili ma impattanti (invio email massivo, ecc.).

## Riordino con drag & drop

Le entità con campo `ordine` (Press, PhotoAlbums, MusicAlbums, Immagini dentro un album) si riordinano **esclusivamente tramite drag & drop** — il campo `ordine` **non è più esposto come input** nelle pagine di dettaglio.

Pattern lato frontend:

- `Components/Table.tsx` accetta `sortable` e `onReorder`. Quando abilitato, aggiunge un'icona `fa-grip-vertical` come prima voce della colonna "Azioni" e rende la riga `draggable`. Al drop chiama `onReorder(newItems)` con l'array nel nuovo ordine.
- Nella lista: `onReorder` fa update ottimistico (`setItems(next)`), poi chiama `adminPatch('<entità>/reorder', { items: [{publicId, ordine: idx+1}] })`; on error, rollback allo stato precedente.
- Per le immagini dentro un album (griglia di card, non Table) il pattern è replicato a mano in `PhotoAlbumDetail.tsx` con drag handle sulla card subito dopo il badge `#N`.
- Il drag parte solo se si clicca sull'handle (`dragArmed` ref impostata on `mousedown`/`touchstart`): serve a non confliggere con la selezione di testo nelle celle.

### Auto-rilevamento metadati immagine

Per le entità che memorizzano metadati ricavabili dal file (es. risoluzione in `immagini_download`), calcolarli **lato client prima dell'upload** leggendo `HTMLImageElement.naturalWidth/Height` da un `URL.createObjectURL(file)`, così prefilli il form senza richiedere input manuale. Pattern già implementato in `DownloadImages.tsx` (funzione `detectImageResolution`). La logica riempie il campo solo se l'utente non l'ha già compilato a mano (rispetto di overrides).

Pattern lato backend:

- Tutti i `POST /admin/<entità>` auto-calcolano `ordine = MAX(ordine) + 1` quando il campo non è nel payload → i nuovi elementi finiscono sempre in coda.
- Tutti i `PUT /admin/<entità>/:publicId` usano `ordine = COALESCE(?, ordine)`: se il payload non include `ordine`, il valore esistente è preservato. Il riordino è responsabilità esclusiva del rispettivo endpoint `PATCH /reorder`.
- Non reintrodurre un input `Ordine` nei form di dettaglio: l'unica source of truth per il campo è il drag & drop.

## Variabili d'ambiente (`.env`)

```
VITE_APP_NAME="NB"
VITE_AWS_REGION=eu-north-1
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_BACKEND_URL=http://localhost:3007
VITE_S3_MEDIA_BUCKET=nb-media
VITE_S3_REGION=eu-north-1
VITE_GA_MEASUREMENT_ID=      # G-XXXXXXXXXX per Google Analytics, vuoto = disabilitato
```

In produzione i valori vengono iniettati al build time dalla pipeline CI che legge gli output Pulumi.

## Do/Don't

- **Do** usare `publicId` (UUID) nei path URL, non gli ID numerici.
- **Do** aggiungere entrambe le chiavi IT/EN per ogni nuova stringa UI.
- **Don't** leggere `localStorage` direttamente — passare da `LOCAL_STORAGE_KEYS`.
- **Don't** fare chiamate axios raw che bypassano il silent refresh; usare `apiClient` (tramite gli helper).
- **Don't** dimenticare il `postinstall` `flowbite-react patch` — necessario per far funzionare i componenti Flowbite con Tailwind v4.
- **Don't** usare `/dist` come output — Vite è configurato per `build/` e la pipeline di deploy si aspetta quella cartella.
