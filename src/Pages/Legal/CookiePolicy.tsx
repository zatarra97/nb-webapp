import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import PublicLayout from "../../Components/PublicLayout";
import { openCookiePreferences } from "../../Components/CookieBanner";

// ---------------------------------------------------------------------------
// Cookie Policy
//
// Documento redatto secondo le Linee guida del Garante per la protezione dei
// dati personali del 10 giugno 2021 in materia di cookie e altri strumenti
// di tracciamento (Provvedimento n. 231).
//
// Categorie presenti sul sito:
//  - Cookie tecnici / funzionali (sempre attivi, no consenso)
//  - Cookie analitici di terze parti — Google Analytics (consenso richiesto)
//
// IMPORTANTE — aggiornare l'elenco dei cookie se si aggiungono nuovi
// strumenti di tracciamento o embed di terze parti (YouTube, Spotify, ecc.).
// ---------------------------------------------------------------------------

const ULTIMO_AGGIORNAMENTO = "18 aprile 2026";
const EMAIL_PRIVACY = "[INSERIRE EMAIL PRIVACY, es. privacy@nicolobalducci.it]";

// Helper componente per riga tabella cookie
interface CookieRowProps {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
  category: string;
}
const CookieRow: React.FC<CookieRowProps> = ({ name, provider, purpose, duration, category }) => (
  <tr className="border-b border-gray-200 align-top">
    <td className="py-3 pr-4 font-mono text-xs text-gray-900">{name}</td>
    <td className="py-3 pr-4 text-xs text-gray-700">{provider}</td>
    <td className="py-3 pr-4 text-xs text-gray-700">{purpose}</td>
    <td className="py-3 pr-4 text-xs text-gray-700 whitespace-nowrap">{duration}</td>
    <td className="py-3 text-xs text-gray-700">{category}</td>
  </tr>
);

// ---------------------------------------------------------------------------
// Versione italiana
// ---------------------------------------------------------------------------
const CookieIT: React.FC = () => (
  <>
    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
    <p className="text-sm text-gray-500 mb-10">
      Ultimo aggiornamento: {ULTIMO_AGGIORNAMENTO}
    </p>

    <p className="mb-6">
      La presente Cookie Policy è redatta ai sensi delle Linee guida del Garante per la
      protezione dei dati personali del 10 giugno 2021 (Provvedimento n. 231), del
      Regolamento (UE) 2016/679 (<em>GDPR</em>) e dell'art. 122 del D.Lgs. 196/2003
      (<em>Codice Privacy</em>).
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">1. Cosa sono i cookie</h2>
    <p className="mb-3">
      I cookie sono piccoli file di testo che i siti visitati inviano al terminale
      dell'utente, dove vengono memorizzati per essere ritrasmessi agli stessi siti alla
      visita successiva. Strumenti di tracciamento analoghi (<em>local storage</em>,{" "}
      <em>session storage</em>, <em>web beacon</em>) sono considerati equivalenti ai cookie
      dalla normativa.
    </p>
    <p className="mb-6">
      Le Linee guida del Garante distinguono i cookie in base alla finalità in due
      macrocategorie: <strong>tecnici</strong> (non richiedono consenso) e
      <strong> di profilazione/analitici</strong> (richiedono consenso preventivo e
      informato).
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">2. Cookie tecnici e funzionali</h2>
    <p className="mb-3">
      Sono utilizzati al solo fine di effettuare la trasmissione di una comunicazione su
      una rete di comunicazione elettronica, o nella misura strettamente necessaria per
      erogare un servizio esplicitamente richiesto dall'utente (art. 122 Codice Privacy).
      Non richiedono il consenso dell'interessato.
    </p>
    <p className="mb-3">Sul sito sono utilizzati i seguenti strumenti tecnici:</p>

    <div className="overflow-x-auto mb-6">
      <table className="w-full text-left min-w-[640px]">
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="py-2 pr-4 text-xs uppercase tracking-wider text-gray-900">Nome</th>
            <th className="py-2 pr-4 text-xs uppercase tracking-wider text-gray-900">Fornitore</th>
            <th className="py-2 pr-4 text-xs uppercase tracking-wider text-gray-900">Finalità</th>
            <th className="py-2 pr-4 text-xs uppercase tracking-wider text-gray-900">Durata</th>
            <th className="py-2 text-xs uppercase tracking-wider text-gray-900">Categoria</th>
          </tr>
        </thead>
        <tbody>
          <CookieRow
            name="i18nextLng"
            provider="Sito (prima parte)"
            purpose="Memorizza la lingua preferita dall'utente (IT/EN)."
            duration="Persistente"
            category="Tecnico / Funzionale"
          />
          <CookieRow
            name="nb-cookie-consent"
            provider="Sito (prima parte)"
            purpose="Registra le scelte dell'utente sui cookie per non mostrare nuovamente il banner."
            duration="6 mesi"
            category="Tecnico"
          />
          <CookieRow
            name="idToken / accessToken / userRole / returnUrl"
            provider="Sito (prima parte)"
            purpose="Mantenere la sessione dell'utente autenticato nell'area riservata /admin. Non presenti per gli utenti del sito pubblico."
            duration="Sessione"
            category="Tecnico"
          />
        </tbody>
      </table>
    </div>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">3. Cookie analitici di terze parti</h2>
    <p className="mb-3">
      Il sito utilizza <strong>Google Analytics 4</strong>, uno strumento di analisi fornito
      da Google Ireland Limited, per raccogliere informazioni aggregate e anonime sull'uso
      del sito (pagine visitate, tempo di permanenza, tipo di dispositivo, provenienza
      geografica a livello di città). L'indirizzo IP è <strong>anonimizzato</strong> prima
      del trattamento e non è possibile risalire all'identità degli utenti.
    </p>
    <p className="mb-3">
      Questi cookie vengono installati <strong>solo dopo il consenso esplicito</strong>
      dell'utente e possono essere revocati in qualsiasi momento. Prima del consenso
      nessuna informazione viene trasmessa a Google.
    </p>

    <div className="overflow-x-auto mb-6">
      <table className="w-full text-left min-w-[640px]">
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="py-2 pr-4 text-xs uppercase tracking-wider text-gray-900">Nome</th>
            <th className="py-2 pr-4 text-xs uppercase tracking-wider text-gray-900">Fornitore</th>
            <th className="py-2 pr-4 text-xs uppercase tracking-wider text-gray-900">Finalità</th>
            <th className="py-2 pr-4 text-xs uppercase tracking-wider text-gray-900">Durata</th>
            <th className="py-2 text-xs uppercase tracking-wider text-gray-900">Categoria</th>
          </tr>
        </thead>
        <tbody>
          <CookieRow
            name="_ga"
            provider="Google Ireland Ltd."
            purpose="Identifica in forma anonima un visitatore unico."
            duration="2 anni"
            category="Analitico — terze parti"
          />
          <CookieRow
            name="_ga_<ID>"
            provider="Google Ireland Ltd."
            purpose="Mantiene lo stato della sessione per Google Analytics 4."
            duration="2 anni"
            category="Analitico — terze parti"
          />
        </tbody>
      </table>
    </div>

    <p className="mb-6">
      Privacy Policy di Google:{" "}
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
        policies.google.com/privacy
      </a>
      . Informazioni sul trattamento da parte di Google Analytics:{" "}
      <a href="https://support.google.com/analytics/answer/6004245" target="_blank" rel="noopener noreferrer" className="underline">
        support.google.com/analytics/answer/6004245
      </a>
      .
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">4. Base giuridica</h2>
    <ul className="list-disc pl-6 mb-6 space-y-2">
      <li>
        <strong>Cookie tecnici e funzionali</strong>: art. 122 Codice Privacy — non richiedono
        consenso essendo strettamente necessari all'erogazione del servizio.
      </li>
      <li>
        <strong>Cookie analitici di terze parti</strong>: art. 6, par. 1, lett. a) GDPR —
        consenso esplicito dell'interessato.
      </li>
    </ul>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">5. Gestione e revoca del consenso</h2>
    <p className="mb-3">
      L'utente può modificare o revocare in qualsiasi momento il consenso prestato. La
      revoca ha effetto immediato e non pregiudica la liceità del trattamento effettuato
      prima della revoca stessa.
    </p>
    <div className="mb-6">
      <button
        type="button"
        onClick={() => openCookiePreferences()}
        className="text-sm px-4 py-2 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors cursor-pointer font-semibold"
      >
        Gestisci le preferenze sui cookie
      </button>
    </div>
    <p className="mb-3">
      In alternativa, l'utente può gestire i cookie direttamente dal proprio browser:
    </p>
    <ul className="list-disc pl-6 mb-6 space-y-2">
      <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="underline">Google Chrome</a></li>
      <li><a href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie" target="_blank" rel="noopener noreferrer" className="underline">Mozilla Firefox</a></li>
      <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="underline">Apple Safari</a></li>
      <li><a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="underline">Microsoft Edge</a></li>
    </ul>
    <p className="mb-6">
      È anche possibile disattivare Google Analytics installando il componente aggiuntivo
      del browser disponibile all'indirizzo{" "}
      <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="underline">
        tools.google.com/dlpage/gaoptout
      </a>
      .
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">6. Durata del consenso</h2>
    <p className="mb-6">
      Il consenso prestato ha una durata massima di <strong>6 mesi</strong>, in conformità
      alle raccomandazioni del Garante Privacy. Trascorso tale periodo verrà nuovamente
      richiesto. Il consenso viene altresì ri-richiesto in caso di modifiche sostanziali
      della presente Cookie Policy.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">7. Titolare e contatti</h2>
    <p className="mb-6">
      Titolare del trattamento è <strong>Nicolò Balducci</strong>. Per ulteriori informazioni
      si rimanda alla <a href="/privacy-policy" className="underline">Privacy Policy</a> o è
      possibile scrivere a <strong>{EMAIL_PRIVACY}</strong>.
    </p>
  </>
);

// ---------------------------------------------------------------------------
// English version
// ---------------------------------------------------------------------------
const CookieEN: React.FC = () => (
  <>
    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
    <p className="text-sm text-gray-500 mb-10">
      Last updated: {ULTIMO_AGGIORNAMENTO}
    </p>

    <p className="mb-6">
      This Cookie Policy is drafted pursuant to the Guidelines of the Italian Data Protection
      Authority of 10 June 2021 (Provision no. 231), Regulation (EU) 2016/679 (<em>GDPR</em>)
      and art. 122 of Legislative Decree 196/2003 (<em>Italian Privacy Code</em>).
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">1. What cookies are</h2>
    <p className="mb-3">
      Cookies are small text files that visited websites send to the user's terminal, where
      they are stored to be retransmitted to the same sites on subsequent visits. Similar
      tracking tools (<em>local storage</em>, <em>session storage</em>, <em>web beacons</em>)
      are considered equivalent to cookies by the regulation.
    </p>
    <p className="mb-6">
      The Italian Authority guidelines distinguish cookies by purpose into two macro-categories:
      <strong> technical cookies</strong> (do not require consent) and
      <strong> profiling/analytics cookies</strong> (require prior and informed consent).
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">2. Technical and functional cookies</h2>
    <p className="mb-3">
      They are used solely to carry out the transmission of a communication over an
      electronic communications network, or to the extent strictly necessary to deliver a
      service explicitly requested by the user (art. 122 of the Italian Privacy Code). They
      do not require user consent.
    </p>
    <p className="mb-3">The website uses the following technical tools:</p>

    <div className="overflow-x-auto mb-6">
      <table className="w-full text-left min-w-[640px]">
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="py-2 pr-4 text-xs uppercase tracking-wider text-gray-900">Name</th>
            <th className="py-2 pr-4 text-xs uppercase tracking-wider text-gray-900">Provider</th>
            <th className="py-2 pr-4 text-xs uppercase tracking-wider text-gray-900">Purpose</th>
            <th className="py-2 pr-4 text-xs uppercase tracking-wider text-gray-900">Duration</th>
            <th className="py-2 text-xs uppercase tracking-wider text-gray-900">Category</th>
          </tr>
        </thead>
        <tbody>
          <CookieRow
            name="i18nextLng"
            provider="Website (first party)"
            purpose="Stores the user's preferred language (IT/EN)."
            duration="Persistent"
            category="Technical / Functional"
          />
          <CookieRow
            name="nb-cookie-consent"
            provider="Website (first party)"
            purpose="Records the user's cookie choices so the banner is not shown again."
            duration="6 months"
            category="Technical"
          />
          <CookieRow
            name="idToken / accessToken / userRole / returnUrl"
            provider="Website (first party)"
            purpose="Maintains the session of the authenticated user in the /admin area. Not present for public website visitors."
            duration="Session"
            category="Technical"
          />
        </tbody>
      </table>
    </div>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">3. Third-party analytics cookies</h2>
    <p className="mb-3">
      The website uses <strong>Google Analytics 4</strong>, an analytics tool provided by
      Google Ireland Limited, to collect aggregated and anonymous information on website
      usage (pages visited, time spent, device type, geographic origin at city level). The
      IP address is <strong>anonymised</strong> before processing and it is not possible to
      identify users.
    </p>
    <p className="mb-3">
      These cookies are installed <strong>only after the user's explicit consent</strong>
      and can be withdrawn at any time. Before consent, no information is transmitted to
      Google.
    </p>

    <div className="overflow-x-auto mb-6">
      <table className="w-full text-left min-w-[640px]">
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="py-2 pr-4 text-xs uppercase tracking-wider text-gray-900">Name</th>
            <th className="py-2 pr-4 text-xs uppercase tracking-wider text-gray-900">Provider</th>
            <th className="py-2 pr-4 text-xs uppercase tracking-wider text-gray-900">Purpose</th>
            <th className="py-2 pr-4 text-xs uppercase tracking-wider text-gray-900">Duration</th>
            <th className="py-2 text-xs uppercase tracking-wider text-gray-900">Category</th>
          </tr>
        </thead>
        <tbody>
          <CookieRow
            name="_ga"
            provider="Google Ireland Ltd."
            purpose="Anonymously identifies a unique visitor."
            duration="2 years"
            category="Analytics — third party"
          />
          <CookieRow
            name="_ga_<ID>"
            provider="Google Ireland Ltd."
            purpose="Maintains session state for Google Analytics 4."
            duration="2 years"
            category="Analytics — third party"
          />
        </tbody>
      </table>
    </div>

    <p className="mb-6">
      Google Privacy Policy:{" "}
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
        policies.google.com/privacy
      </a>
      . Information on processing by Google Analytics:{" "}
      <a href="https://support.google.com/analytics/answer/6004245" target="_blank" rel="noopener noreferrer" className="underline">
        support.google.com/analytics/answer/6004245
      </a>
      .
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">4. Legal basis</h2>
    <ul className="list-disc pl-6 mb-6 space-y-2">
      <li>
        <strong>Technical and functional cookies</strong>: art. 122 Italian Privacy Code —
        no consent required as strictly necessary for service delivery.
      </li>
      <li>
        <strong>Third-party analytics cookies</strong>: art. 6(1)(a) GDPR — explicit consent
        of the data subject.
      </li>
    </ul>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">5. Consent management and withdrawal</h2>
    <p className="mb-3">
      The user can modify or withdraw consent at any time. Withdrawal takes immediate effect
      and does not affect the lawfulness of processing carried out before the withdrawal.
    </p>
    <div className="mb-6">
      <button
        type="button"
        onClick={() => openCookiePreferences()}
        className="text-sm px-4 py-2 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors cursor-pointer font-semibold"
      >
        Manage cookie preferences
      </button>
    </div>
    <p className="mb-3">
      Alternatively, the user can manage cookies directly from their browser:
    </p>
    <ul className="list-disc pl-6 mb-6 space-y-2">
      <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="underline">Google Chrome</a></li>
      <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="underline">Mozilla Firefox</a></li>
      <li><a href="https://support.apple.com/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="underline">Apple Safari</a></li>
      <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="underline">Microsoft Edge</a></li>
    </ul>
    <p className="mb-6">
      It is also possible to disable Google Analytics by installing the browser add-on
      available at{" "}
      <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="underline">
        tools.google.com/dlpage/gaoptout
      </a>
      .
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">6. Duration of consent</h2>
    <p className="mb-6">
      Consent granted has a maximum duration of <strong>6 months</strong>, in line with the
      recommendations of the Italian Data Protection Authority. After this period it will
      be requested again. Consent is also requested again in case of substantial changes to
      this Cookie Policy.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">7. Data Controller and contacts</h2>
    <p className="mb-6">
      The Data Controller is <strong>Nicolò Balducci</strong>. For further information,
      please refer to the <a href="/privacy-policy" className="underline">Privacy Policy</a>{" "}
      or write to <strong>{EMAIL_PRIVACY}</strong>.
    </p>
  </>
);

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------
const CookiePolicy: React.FC = () => {
  const { i18n } = useTranslation();
  const isIT = i18n.language?.startsWith("it");

  return (
    <PublicLayout>
      <Helmet>
        <title>Cookie Policy — Nicolò Balducci</title>
        <meta name="robots" content="index, follow" />
      </Helmet>
      <article className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-3xl text-gray-700 leading-relaxed text-[15px]">
        {isIT ? <CookieIT /> : <CookieEN />}
      </article>
    </PublicLayout>
  );
};

export default CookiePolicy;
