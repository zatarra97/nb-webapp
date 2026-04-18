// ---------------------------------------------------------------------------
// Google Analytics — loader gated dal consenso
//
// Carica gtag.js SOLO dopo che l'utente ha dato consenso esplicito alla
// categoria "analytics". Prima del consenso non viene fatta NESSUNA chiamata
// di rete verso Google (conforme a Linee guida Garante del 10 giugno 2021 —
// blocco preventivo degli script di terze parti).
//
// Se il consenso viene revocato a runtime, viene chiamato gtag("consent",
// "update", { analytics_storage: "denied" }) per interrompere il tracking.
// ---------------------------------------------------------------------------

import { hasAnalyticsConsent, onConsentChange } from "./consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
let scriptLoaded = false;

function injectGaScript(measurementId: string): void {
  if (scriptLoaded) return;
  scriptLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };

  // Consent mode v2: partiamo con tutti i segnali su "denied" e poi li
  // aggiorniamo a "granted" solo se il consenso analytics è presente.
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: hasAnalyticsConsent() ? "granted" : "denied",
    wait_for_update: 500,
  });

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    anonymize_ip: true,          // anonimizzazione IP
    allow_google_signals: false, // niente signals per privacy
    send_page_view: true,
  });

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(s);
}

export function initAnalytics(): void {
  if (!GA_MEASUREMENT_ID) {
    // Nessun measurement id configurato — GA disabilitato
    return;
  }

  // Carica lo script solo se c'è consenso; altrimenti aspetta l'evento
  if (hasAnalyticsConsent()) {
    injectGaScript(GA_MEASUREMENT_ID);
  }

  // Reagire ai cambi di consenso in tempo reale
  onConsentChange((record) => {
    const granted = record?.categories.analytics === true;

    if (granted && !scriptLoaded) {
      injectGaScript(GA_MEASUREMENT_ID);
    }

    if (scriptLoaded && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: granted ? "granted" : "denied",
      });
    }
  });
}

// Invia un pageview manuale (utile con React Router SPA navigation)
export function trackPageView(path: string): void {
  if (!GA_MEASUREMENT_ID || !hasAnalyticsConsent() || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.origin + path,
  });
}
