import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminGetList, adminDelete, adminPostAction } from '../../../services/api-utility';
import { useConfirmDialog } from '../../../Components/ConfirmDialog';

interface Subscriber {
  publicId: string;
  email: string;
  confermato: number;
  createdAt: string;
}

interface Invio {
  publicId: string;
  titolo: string;
  corpo: string;
  sentCount: number;
  inviatoAt: string;
}

interface SendModal {
  open: boolean;
  titolo: string;
  corpo: string;
}

const fmt = (v: string) =>
  new Date(v).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

type Tab = 'comunicazioni' | 'iscritti';

const Newsletter = () => {
  const confirm = useConfirmDialog();
  const [activeTab, setActiveTab] = useState<Tab>('comunicazioni');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [invii, setInvii] = useState<Invio[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [loadingInvii, setLoadingInvii] = useState(true);
  const [sendModal, setSendModal] = useState<SendModal>({ open: false, titolo: '', corpo: '' });
  const [sending, setSending] = useState(false);
  const [expandedCorpo, setExpandedCorpo] = useState<string | null>(null);

  const loadSubscribers = async () => {
    setLoadingSubs(true);
    try {
      setSubscribers(await adminGetList('subscribers'));
    } catch {
      toast.error('Errore nel caricamento degli iscritti');
    } finally {
      setLoadingSubs(false);
    }
  };

  const loadInvii = async () => {
    setLoadingInvii(true);
    try {
      setInvii(await adminGetList('newsletter/invii'));
    } catch {
      toast.error('Errore nel caricamento delle comunicazioni');
    } finally {
      setLoadingInvii(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
    loadInvii();
  }, []);

  const handleDeleteSubscriber = async (sub: Subscriber) => {
    const ok = await confirm({
      title: "Rimuovere l'iscritto dalla newsletter?",
      description: (
        <>
          Stai per rimuovere <strong>{sub.email}</strong> dalla lista iscritti.
          Non riceverà più comunicazioni e dovrà iscriversi nuovamente per tornare a ricevere gli aggiornamenti.
        </>
      ),
      confirmLabel: 'Rimuovi',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminDelete('subscribers', sub.publicId);
      toast.success('Iscritto eliminato');
      loadSubscribers();
    } catch {
      toast.error('Errore durante l\'eliminazione');
    }
  };

  const handleSend = async () => {
    if (!sendModal.titolo.trim()) { toast.error('L\'oggetto è obbligatorio'); return; }
    if (!sendModal.corpo.trim()) { toast.error('Il corpo è obbligatorio'); return; }
    setSending(true);
    try {
      const res = await adminPostAction('newsletter/send', { titolo: sendModal.titolo, corpo: sendModal.corpo });
      setInvii((prev) => [res.invio, ...prev]);
      setSendModal({ open: false, titolo: '', corpo: '' });
      toast.success(`Email inviata a ${res.sentCount} iscritti`);
    } catch {
      toast.error('Errore durante l\'invio');
    } finally {
      setSending(false);
    }
  };

  const confirmed = subscribers.filter((s) => s.confermato);

  const tabs: Array<{ id: Tab; label: string; badge: number }> = [
    { id: 'comunicazioni', label: 'Comunicazioni', badge: invii.length },
    { id: 'iscritti', label: 'Iscritti', badge: subscribers.length },
  ];

  return (
    <div className="container mx-auto px-6 py-8">

      {/* Header pagina */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
        <p className="text-gray-500 text-sm mt-1">Iscritti e comunicazioni inviate</p>
      </div>

      {/* Tab switcher */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1" role="tablist" aria-label="Sezioni newsletter">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 -mb-px border-b-2 text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
                  active
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TAB — Iscritti                                                      */}
      {/* ------------------------------------------------------------------ */}
      <div
        id="tabpanel-iscritti"
        role="tabpanel"
        aria-labelledby="tab-iscritti"
        hidden={activeTab !== 'iscritti'}
      >
        <div className="mb-4">
          <p className="text-gray-500 text-sm">
            {confirmed.length} confermati · {subscribers.filter((s) => !s.confermato).length} in attesa
          </p>
        </div>

        {loadingSubs ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
            Nessun iscritto alla newsletter
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Stato</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Data iscrizione</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscribers.map((sub) => (
                  <tr key={sub.publicId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800">{sub.email}</td>
                    <td className="px-4 py-3">
                      {sub.confermato ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                          <i className="fa-solid fa-circle-check"></i> Confermato
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          <i className="fa-regular fa-clock"></i> In attesa
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{fmt(sub.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteSubscriber(sub)}
                        className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Elimina"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TAB — Comunicazioni                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div
        id="tabpanel-comunicazioni"
        role="tabpanel"
        aria-labelledby="tab-comunicazioni"
        hidden={activeTab !== 'comunicazioni'}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-500 text-sm">Storico messaggi inviati agli iscritti</p>
          <button
            onClick={() => setSendModal({ open: true, titolo: '', corpo: '' })}
            disabled={confirmed.length === 0}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-40 transition-colors flex items-center gap-2 cursor-pointer text-sm"
          >
            <i className="fa-solid fa-paper-plane"></i>
            Nuovo messaggio
          </button>
        </div>

        {loadingInvii ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
          </div>
        ) : invii.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
            Nessuna comunicazione inviata
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Oggetto</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 w-28">Destinatari</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 w-44">Data invio</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invii.map((inv) => (
                  <>
                    <tr key={inv.publicId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-800 font-medium">{inv.titolo}</td>
                      <td className="px-4 py-3 text-gray-500 text-center">{inv.sentCount}</td>
                      <td className="px-4 py-3 text-gray-500">{fmt(inv.inviatoAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setExpandedCorpo(expandedCorpo === inv.publicId ? null : inv.publicId)}
                          className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                          title={expandedCorpo === inv.publicId ? 'Chiudi' : 'Mostra corpo'}
                        >
                          <i className={`fa-solid ${expandedCorpo === inv.publicId ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs`}></i>
                        </button>
                      </td>
                    </tr>
                    {expandedCorpo === inv.publicId && (
                      <tr key={`${inv.publicId}-corpo`}>
                        <td colSpan={4} className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans">{inv.corpo}</pre>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal invio */}
      {sendModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Nuovo messaggio newsletter</h2>
              <button
                onClick={() => setSendModal({ open: false, titolo: '', corpo: '' })}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
                <i className="fa-solid fa-circle-info"></i>
                Verrà inviata a <strong>{confirmed.length}</strong> iscritti confermati
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Oggetto</label>
                <input
                  type="text"
                  value={sendModal.titolo}
                  onChange={(e) => setSendModal((p) => ({ ...p, titolo: e.target.value }))}
                  placeholder="Es. Un aggiornamento da NB"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Messaggio</label>
                <p className="text-xs text-gray-400 mb-2">Lascia una riga vuota tra i paragrafi per separarli</p>
                <textarea
                  value={sendModal.corpo}
                  onChange={(e) => setSendModal((p) => ({ ...p, corpo: e.target.value }))}
                  rows={12}
                  placeholder={"Ciao,\n\nVolevo condividere con te..."}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setSendModal({ open: false, titolo: '', corpo: '' })}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="px-5 py-2 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-paper-plane"></i>
                {sending ? 'Invio in corso...' : `Invia a ${confirmed.length} iscritti`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Newsletter;
