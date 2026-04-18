import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import PublicLayout from "../../Components/PublicLayout";

// ---------------------------------------------------------------------------
// Privacy Policy
//
// Informativa ai sensi dell'art. 13 GDPR (Regolamento UE 2016/679) e
// del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018.
//
// IMPORTANTE — Prima della messa online aggiornare tutti i valori
// contrassegnati con [INSERIRE ...] con i dati reali del Titolare.
// Vedere anche /cookie-policy per la politica sui cookie.
// ---------------------------------------------------------------------------

// Dati del Titolare — SOSTITUIRE CON DATI REALI PRIMA DEL DEPLOY
const TITOLARE = {
  nome: "Nicolò Balducci",
  codiceFiscale: "[INSERIRE CODICE FISCALE]",
  indirizzo: "[INSERIRE INDIRIZZO DI RESIDENZA O DOMICILIO PROFESSIONALE]",
  emailPrivacy: "[INSERIRE EMAIL PRIVACY, es. privacy@nicolobalducci.it]",
  pec: "[INSERIRE PEC, se disponibile]",
};

// Data ultimo aggiornamento — aggiornare ad ogni modifica sostanziale
const ULTIMO_AGGIORNAMENTO = "18 aprile 2026";

// ---------------------------------------------------------------------------
// Versione italiana
// ---------------------------------------------------------------------------
const PrivacyIT: React.FC = () => (
  <>
    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Informativa sulla Privacy</h1>
    <p className="text-sm text-gray-500 mb-10">
      Ultimo aggiornamento: {ULTIMO_AGGIORNAMENTO}
    </p>

    <p className="mb-6">
      La presente informativa è resa ai sensi dell'art. 13 del Regolamento (UE) 2016/679
      (<em>"GDPR"</em>) e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018
      (<em>"Codice Privacy"</em>) e descrive le modalità con cui vengono trattati i dati
      personali degli utenti che consultano il sito o si iscrivono alla newsletter.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">1. Titolare del trattamento</h2>
    <p className="mb-2">
      Il Titolare del trattamento è <strong>{TITOLARE.nome}</strong>, persona fisica,
      C.F. {TITOLARE.codiceFiscale}, con sede in {TITOLARE.indirizzo}.
    </p>
    <p className="mb-6">
      Per qualsiasi richiesta relativa al trattamento dei dati personali è possibile scrivere
      a: <strong>{TITOLARE.emailPrivacy}</strong>
      {TITOLARE.pec !== "[INSERIRE PEC, se disponibile]" && (
        <> — PEC: <strong>{TITOLARE.pec}</strong></>
      )}.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">2. Tipologie di dati raccolti</h2>
    <p className="mb-3">
      Il sito raccoglie <strong>esclusivamente l'indirizzo email</strong> fornito volontariamente
      dall'utente tramite il modulo di iscrizione alla newsletter.
    </p>
    <p className="mb-6">
      Non vengono raccolti altri dati identificativi (nome, cognome, numero di telefono, ecc.)
      né dati particolari ai sensi dell'art. 9 GDPR. Il sistema registra inoltre un token
      casuale di conferma e un timestamp di iscrizione/conferma, utilizzati ai soli fini tecnici
      e di sicurezza.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">3. Finalità e base giuridica</h2>
    <p className="mb-3">I dati sono trattati per le seguenti finalità:</p>
    <ul className="list-disc pl-6 mb-3 space-y-2">
      <li>
        <strong>Invio di comunicazioni informative</strong> relative a nuovi album, uscite
        discografiche, eventi, concerti e spettacoli del Titolare.
      </li>
      <li>
        <strong>Gestione dell'iscrizione</strong> alla newsletter (conferma double opt-in,
        disiscrizione, registrazione delle preferenze).
      </li>
    </ul>
    <p className="mb-6">
      La base giuridica del trattamento è il <strong>consenso libero, esplicito e
      informato</strong> dell'interessato ai sensi dell'art. 6, par. 1, lett. a) GDPR, prestato
      mediante l'iscrizione volontaria e confermato attraverso il meccanismo di <em>double
      opt-in</em> (link di conferma inviato via email).
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">4. Modalità del trattamento</h2>
    <p className="mb-6">
      I dati sono trattati con strumenti informatici, con misure di sicurezza tecniche e
      organizzative adeguate a prevenire l'accesso non autorizzato, la perdita, la modifica
      o la distruzione dei dati (art. 32 GDPR). Il database è ospitato su infrastruttura
      cloud Amazon Web Services (AWS) — regione Europa (Stoccolma, Svezia).
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">5. Periodo di conservazione</h2>
    <p className="mb-6">
      L'indirizzo email è conservato <strong>fino alla revoca del consenso</strong> da parte
      dell'interessato (disiscrizione dalla newsletter) o fino a cessazione della finalità
      (es. chiusura del servizio newsletter). Dopo la disiscrizione il dato può essere
      conservato per un periodo massimo di 30 giorni ai soli fini di documentare il corretto
      esercizio del diritto di opposizione, al termine dei quali viene eliminato.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">6. Destinatari dei dati</h2>
    <p className="mb-3">
      I dati possono essere comunicati ai seguenti soggetti, che agiscono come
      <em> responsabili del trattamento</em> ai sensi dell'art. 28 GDPR:
    </p>
    <ul className="list-disc pl-6 mb-3 space-y-2">
      <li>
        <strong>Amazon Web Services EMEA SARL</strong> — fornitore di infrastruttura cloud
        (database, hosting, servizio di invio email <em>Amazon SES</em>). I server utilizzati
        sono localizzati nell'Unione Europea.
      </li>
    </ul>
    <p className="mb-6">
      I dati non sono comunicati a soggetti terzi per finalità di marketing né sono oggetto
      di cessione o diffusione.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">7. Trasferimenti extra UE</h2>
    <p className="mb-6">
      Il trattamento avviene all'interno dello Spazio Economico Europeo. Non sono previsti
      trasferimenti dei dati verso Paesi terzi. Qualora in futuro si rendessero necessari,
      avverranno esclusivamente in presenza di garanzie adeguate ai sensi degli artt. 44-49
      GDPR (decisioni di adeguatezza della Commissione Europea o clausole contrattuali
      standard).
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">8. Diritti dell'interessato</h2>
    <p className="mb-3">
      Ai sensi degli articoli 15-22 GDPR, l'interessato ha diritto di:
    </p>
    <ul className="list-disc pl-6 mb-3 space-y-2">
      <li><strong>Accedere</strong> ai propri dati personali (art. 15);</li>
      <li><strong>Rettificare</strong> dati inesatti o integrarli (art. 16);</li>
      <li><strong>Ottenere la cancellazione</strong> dei dati (<em>"diritto all'oblio"</em>, art. 17);</li>
      <li><strong>Limitare</strong> il trattamento (art. 18);</li>
      <li><strong>Richiedere la portabilità</strong> dei dati in formato leggibile (art. 20);</li>
      <li><strong>Opporsi</strong> al trattamento (art. 21);</li>
      <li><strong>Revocare il consenso</strong> in qualsiasi momento, senza pregiudicare la liceità del trattamento effettuato prima della revoca (art. 7, par. 3).</li>
    </ul>
    <p className="mb-3">
      La revoca del consenso può essere esercitata in modo immediato e gratuito:
    </p>
    <ul className="list-disc pl-6 mb-6 space-y-2">
      <li>cliccando sul link di <strong>disiscrizione</strong> presente in ogni email inviata;</li>
      <li>scrivendo a <strong>{TITOLARE.emailPrivacy}</strong>.</li>
    </ul>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">9. Reclamo al Garante</h2>
    <p className="mb-6">
      L'interessato ha diritto di proporre reclamo all'Autorità Garante per la protezione
      dei dati personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="underline">garanteprivacy.it</a>)
      qualora ritenga che il trattamento dei propri dati violi il GDPR.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">10. Natura del conferimento</h2>
    <p className="mb-6">
      Il conferimento dell'indirizzo email è <strong>facoltativo</strong>. Il mancato
      conferimento comporta l'impossibilità di ricevere la newsletter ma non preclude la
      consultazione del sito.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">11. Processo decisionale automatizzato</h2>
    <p className="mb-6">
      Non è presente alcun processo decisionale automatizzato, inclusa la profilazione, di
      cui all'art. 22, par. 1 e 4 GDPR.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">12. Minori</h2>
    <p className="mb-6">
      Il sito non è destinato a minori di 14 anni. Ai sensi dell'art. 2-<em>quinquies</em> del
      Codice Privacy, il minore che abbia compiuto 14 anni può esprimere validamente il
      consenso al trattamento dei propri dati personali in relazione all'offerta diretta di
      servizi della società dell'informazione. Se si viene a conoscenza del trattamento di
      dati di un minore di 14 anni, tali dati saranno prontamente cancellati.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">13. Cookie</h2>
    <p className="mb-6">
      Per informazioni sull'utilizzo dei cookie si rimanda alla{" "}
      <a href="/cookie-policy" className="underline">Cookie Policy</a>.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">14. Modifiche</h2>
    <p className="mb-6">
      Il Titolare si riserva il diritto di modificare la presente informativa per adeguarla
      a evoluzioni normative o a modifiche dei servizi offerti. La versione aggiornata è
      sempre consultabile su questa pagina. In caso di modifiche sostanziali, gli iscritti
      alla newsletter saranno informati via email.
    </p>
  </>
);

// ---------------------------------------------------------------------------
// English version
// ---------------------------------------------------------------------------
const PrivacyEN: React.FC = () => (
  <>
    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
    <p className="text-sm text-gray-500 mb-10">
      Last updated: {ULTIMO_AGGIORNAMENTO}
    </p>

    <p className="mb-6">
      This privacy notice is provided pursuant to art. 13 of Regulation (EU) 2016/679
      (<em>"GDPR"</em>) and Italian Legislative Decree 196/2003 as amended by Legislative
      Decree 101/2018. It describes how personal data of users visiting the website or
      subscribing to the newsletter is processed.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">1. Data Controller</h2>
    <p className="mb-2">
      The Data Controller is <strong>{TITOLARE.nome}</strong>, natural person,
      Italian Tax Code {TITOLARE.codiceFiscale}, based in {TITOLARE.indirizzo}.
    </p>
    <p className="mb-6">
      For any request regarding the processing of personal data, please write to:{" "}
      <strong>{TITOLARE.emailPrivacy}</strong>.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">2. Categories of data collected</h2>
    <p className="mb-3">
      The website collects <strong>only the email address</strong> voluntarily provided by
      the user through the newsletter subscription form.
    </p>
    <p className="mb-6">
      No other identifying data (name, surname, phone number, etc.) is collected, nor
      special categories of data within the meaning of art. 9 GDPR. The system also records
      a random confirmation token and subscription/confirmation timestamps, used solely for
      technical and security purposes.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">3. Purpose and legal basis</h2>
    <p className="mb-3">Data is processed for the following purposes:</p>
    <ul className="list-disc pl-6 mb-3 space-y-2">
      <li>
        <strong>Sending informational communications</strong> about new albums, record
        releases, events, concerts and performances.
      </li>
      <li>
        <strong>Management of the newsletter subscription</strong> (double opt-in
        confirmation, unsubscription, preference recording).
      </li>
    </ul>
    <p className="mb-6">
      The legal basis is the <strong>free, explicit and informed consent</strong> of the
      data subject pursuant to art. 6(1)(a) GDPR, given through voluntary subscription and
      confirmed through the <em>double opt-in</em> mechanism (confirmation link sent by
      email).
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">4. Processing methods</h2>
    <p className="mb-6">
      Data is processed by electronic means, with technical and organisational security
      measures adequate to prevent unauthorised access, loss, modification or destruction
      (art. 32 GDPR). The database is hosted on Amazon Web Services (AWS) cloud
      infrastructure — European region (Stockholm, Sweden).
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">5. Retention period</h2>
    <p className="mb-6">
      The email address is retained <strong>until consent is withdrawn</strong> by the data
      subject (newsletter unsubscription) or until the purpose ceases (e.g. discontinuation
      of the newsletter service). After unsubscription, the data may be retained for a
      maximum of 30 days solely to document the correct exercise of the right to object,
      after which it is deleted.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">6. Recipients of the data</h2>
    <p className="mb-3">
      Data may be communicated to the following entities acting as <em>processors</em>
      pursuant to art. 28 GDPR:
    </p>
    <ul className="list-disc pl-6 mb-3 space-y-2">
      <li>
        <strong>Amazon Web Services EMEA SARL</strong> — cloud infrastructure provider
        (database, hosting, <em>Amazon SES</em> email sending service). Servers used are
        located in the European Union.
      </li>
    </ul>
    <p className="mb-6">
      Data is not shared with third parties for marketing purposes, nor sold or disclosed.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">7. Transfers outside the EU</h2>
    <p className="mb-6">
      Processing takes place within the European Economic Area. No transfers of data to
      third countries are foreseen. Should they become necessary in the future, they will
      only take place with adequate safeguards pursuant to articles 44-49 GDPR (adequacy
      decisions of the European Commission or standard contractual clauses).
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">8. Data subject rights</h2>
    <p className="mb-3">
      Pursuant to articles 15-22 GDPR, the data subject has the right to:
    </p>
    <ul className="list-disc pl-6 mb-3 space-y-2">
      <li><strong>Access</strong> their personal data (art. 15);</li>
      <li><strong>Rectify</strong> inaccurate data or complete them (art. 16);</li>
      <li><strong>Obtain erasure</strong> of data (<em>"right to be forgotten"</em>, art. 17);</li>
      <li><strong>Restrict</strong> processing (art. 18);</li>
      <li><strong>Request portability</strong> of data in a readable format (art. 20);</li>
      <li><strong>Object</strong> to processing (art. 21);</li>
      <li><strong>Withdraw consent</strong> at any time, without affecting the lawfulness of processing before the withdrawal (art. 7(3)).</li>
    </ul>
    <p className="mb-3">
      Consent withdrawal can be exercised immediately and free of charge:
    </p>
    <ul className="list-disc pl-6 mb-6 space-y-2">
      <li>by clicking the <strong>unsubscribe</strong> link included in every email;</li>
      <li>by writing to <strong>{TITOLARE.emailPrivacy}</strong>.</li>
    </ul>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">9. Complaint to the supervisory authority</h2>
    <p className="mb-6">
      The data subject has the right to lodge a complaint with the Italian Data Protection
      Authority (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="underline">garanteprivacy.it</a>)
      if they believe that the processing of their data breaches the GDPR.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">10. Nature of the provision</h2>
    <p className="mb-6">
      Providing the email address is <strong>optional</strong>. Failure to provide it means
      the user cannot receive the newsletter, but does not prevent browsing the website.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">11. Automated decision-making</h2>
    <p className="mb-6">
      No automated decision-making, including profiling, within the meaning of art. 22(1)
      and (4) GDPR is carried out.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">12. Minors</h2>
    <p className="mb-6">
      The website is not intended for children under 14 years of age. Pursuant to art.
      2-<em>quinquies</em> of the Italian Privacy Code, a minor who has reached 14 years
      can validly consent to the processing of their personal data in relation to the direct
      offer of information society services. If we become aware of processing data of a
      minor under 14, such data will be promptly deleted.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">13. Cookies</h2>
    <p className="mb-6">
      For information about the use of cookies, please refer to the{" "}
      <a href="/cookie-policy" className="underline">Cookie Policy</a>.
    </p>

    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">14. Changes</h2>
    <p className="mb-6">
      The Data Controller reserves the right to modify this notice to adapt it to
      regulatory developments or changes in the services offered. The current version is
      always available on this page. In case of substantial changes, newsletter subscribers
      will be notified by email.
    </p>
  </>
);

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------
const PrivacyPolicy: React.FC = () => {
  const { i18n } = useTranslation();
  const isIT = i18n.language?.startsWith("it");

  return (
    <PublicLayout>
      <Helmet>
        <title>{isIT ? "Privacy Policy" : "Privacy Policy"} — Nicolò Balducci</title>
        <meta name="robots" content="index, follow" />
      </Helmet>
      <article className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-3xl text-gray-700 leading-relaxed text-[15px]">
        {isIT ? <PrivacyIT /> : <PrivacyEN />}
      </article>
    </PublicLayout>
  );
};

export default PrivacyPolicy;
