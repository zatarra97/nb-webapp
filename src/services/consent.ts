// ---------------------------------------------------------------------------
// Consent management — gestione consenso cookie/privacy
//
// Conformità: Linee guida Garante Privacy (10 giugno 2021) + GDPR
// Requisiti implementati:
//  - Consenso granulare per categoria (tecnici sempre attivi, analitici opzionali)
//  - Blocco preventivo degli script di terze parti (GA) prima del consenso
//  - Scadenza del consenso: 6 mesi (raccomandazione Garante)
//  - Possibilità di revoca/modifica in qualsiasi momento
//  - Versioning: se cambia la policy, il consenso è richiesto di nuovo
// ---------------------------------------------------------------------------

export const CONSENT_STORAGE_KEY = "nb-cookie-consent";

// Incrementare quando si modifica la Cookie Policy in modo sostanziale
// (es. si aggiungono nuove categorie o nuovi cookie di terze parti).
// Il cambio versione invalida i consensi esistenti e mostra di nuovo il banner.
export const CONSENT_POLICY_VERSION = 1;

// Scadenza del consenso: 6 mesi in millisecondi
// (Garante raccomanda al massimo 6 mesi per richiedere il consenso di nuovo)
const CONSENT_MAX_AGE_MS = 6 * 30 * 24 * 60 * 60 * 1000;

export interface ConsentCategories {
  technical: true;      // sempre true — cookie tecnici, non richiedono consenso
  analytics: boolean;   // Google Analytics e simili
}

export interface ConsentRecord {
  version: number;
  timestamp: number;    // ms epoch
  categories: ConsentCategories;
}

// ---------------------------------------------------------------------------
// Lettura/scrittura
// ---------------------------------------------------------------------------

export function readConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;

    // Invalidazione per cambio policy
    if (parsed.version !== CONSENT_POLICY_VERSION) return null;

    // Invalidazione per scadenza
    if (Date.now() - parsed.timestamp > CONSENT_MAX_AGE_MS) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function saveConsent(categories: Omit<ConsentCategories, "technical">): ConsentRecord {
  const record: ConsentRecord = {
    version: CONSENT_POLICY_VERSION,
    timestamp: Date.now(),
    categories: { technical: true, ...categories },
  };
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  window.dispatchEvent(new CustomEvent("nb-consent-change", { detail: record }));
  return record;
}

export function clearConsent(): void {
  localStorage.removeItem(CONSENT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("nb-consent-change", { detail: null }));
}

// ---------------------------------------------------------------------------
// Helper per i gate di terze parti
// ---------------------------------------------------------------------------

export function hasAnalyticsConsent(): boolean {
  const consent = readConsent();
  return consent?.categories.analytics === true;
}

export function hasGivenConsent(): boolean {
  return readConsent() !== null;
}

// ---------------------------------------------------------------------------
// Subscribe a cambi di consenso (da codice non-React, es. analytics loader)
// ---------------------------------------------------------------------------

export function onConsentChange(callback: (record: ConsentRecord | null) => void): () => void {
  const handler = (e: Event) => callback((e as CustomEvent).detail);
  window.addEventListener("nb-consent-change", handler);
  return () => window.removeEventListener("nb-consent-change", handler);
}
