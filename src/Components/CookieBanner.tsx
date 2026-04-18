import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { readConsent, saveConsent, ConsentRecord } from "../services/consent";

// ---------------------------------------------------------------------------
// CookieBanner
//
// Mostrato al primo accesso (o quando cambia la versione della policy o il
// consenso è scaduto). Opzioni:
//   - "Accetta tutti"      → consenso a tutte le categorie opzionali
//   - "Rifiuta tutti"      → solo categorie tecniche
//   - "Personalizza"       → checkbox per singola categoria
//
// La X di chiusura NON è presente: secondo il Garante, chiudere il banner
// senza scegliere equivale a diniego dei cookie non necessari ma qui si
// richiede sempre una scelta esplicita per maggior tutela.
// ---------------------------------------------------------------------------

const CookieBanner: React.FC = () => {
  const { t } = useTranslation();
  const [record, setRecord] = useState<ConsentRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    setRecord(readConsent());
    setReady(true);

    // Listener globale per aprire il banner da altri punti (footer)
    const openHandler = () => {
      setRecord(null);
      setCustom(true);
      setAnalytics(readConsent()?.categories.analytics ?? false);
    };
    window.addEventListener("nb-open-cookie-preferences", openHandler);
    return () => window.removeEventListener("nb-open-cookie-preferences", openHandler);
  }, []);

  if (!ready || record !== null) return null;

  const acceptAll = () => {
    saveConsent({ analytics: true });
    setRecord(readConsent());
  };

  const rejectAll = () => {
    saveConsent({ analytics: false });
    setRecord(readConsent());
  };

  const saveCustom = () => {
    saveConsent({ analytics });
    setRecord(readConsent());
  };

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-body"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-gray-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="container mx-auto px-4 md:px-6 py-5 max-w-5xl">
        <h2 id="cookie-banner-title" className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">
          {t("cookies.banner_title")}
        </h2>
        <p id="cookie-banner-body" className="text-sm text-gray-600 leading-relaxed mb-4">
          {t("cookies.banner_body")}{" "}
          <Link to="/cookie-policy" className="underline hover:text-gray-900">
            {t("cookies.banner_cookie_policy")}
          </Link>{" "}·{" "}
          <Link to="/privacy-policy" className="underline hover:text-gray-900">
            {t("cookies.banner_privacy_policy")}
          </Link>
          .
        </p>

        {custom && (
          <div className="border-t border-gray-200 py-4 space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent-technical"
                checked
                disabled
                className="mt-1"
              />
              <label htmlFor="consent-technical" className="flex-1">
                <span className="block text-sm font-semibold text-gray-900">
                  {t("cookies.cat_technical_title")}{" "}
                  <span className="text-xs font-normal text-gray-500">
                    ({t("cookies.cat_always_active")})
                  </span>
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  {t("cookies.cat_technical_body")}
                </span>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent-analytics"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="consent-analytics" className="flex-1 cursor-pointer">
                <span className="block text-sm font-semibold text-gray-900">
                  {t("cookies.cat_analytics_title")}
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  {t("cookies.cat_analytics_body")}
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2 md:gap-3 mt-2">
          {!custom ? (
            <>
              <button
                type="button"
                onClick={() => setCustom(true)}
                className="text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer"
              >
                {t("cookies.customize")}
              </button>
              <button
                type="button"
                onClick={rejectAll}
                className="text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer"
              >
                {t("cookies.reject_all")}
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="text-sm px-4 py-2 bg-gray-900 text-white hover:bg-black transition-colors cursor-pointer font-semibold"
              >
                {t("cookies.accept_all")}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={rejectAll}
                className="text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer"
              >
                {t("cookies.reject_all")}
              </button>
              <button
                type="button"
                onClick={saveCustom}
                className="text-sm px-4 py-2 bg-gray-900 text-white hover:bg-black transition-colors cursor-pointer font-semibold"
              >
                {t("cookies.save_preferences")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;

// Utility per aprire il banner da qualsiasi punto (es. link in footer)
export function openCookiePreferences(): void {
  window.dispatchEvent(new CustomEvent("nb-open-cookie-preferences"));
}
