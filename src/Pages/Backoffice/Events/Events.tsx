import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Table from '../../../Components/Table';
import { useConfirmDialog } from '../../../Components/ConfirmDialog';
import { adminGetList, adminDelete } from '../../../services/api-utility';

interface Evento {
  id: number;
  publicId: string;
  titolo: string;
  linkBiglietti?: string;
  dates?: Array<{ data: string; ora?: string }>;
  emailSentAt?: string;
  updatedAt?: string;
}

const Events = () => {
  const navigate = useNavigate();
  const confirm = useConfirmDialog();
  const [eventi, setEventi] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminGetList('events');
      setEventi(data);
    } catch {
      toast.error('Errore nel caricamento degli eventi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (event: Evento) => {
    const n = event.dates?.length ?? 0;
    const ok = await confirm({
      title: "Eliminare l'evento?",
      description: (
        <>
          Stai per eliminare <strong>"{event.titolo}"</strong>
          {n > 0 && <> e le sue <strong>{n}</strong> {n === 1 ? 'data' : 'date'}</>}.
          L'operazione non può essere annullata.
        </>
      ),
      confirmLabel: 'Elimina',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminDelete('events', event.publicId);
      toast.success('Evento eliminato');
      load();
    } catch {
      toast.error('Errore durante l\'eliminazione');
    }
  };

  const columns = [
    { key: 'titolo', header: 'Titolo' },
    {
      key: 'dates',
      header: 'Prossima data',
      render: (dates: Evento['dates']) => {
        if (!dates?.length) return <span className="text-gray-400">-</span>;
        const sorted = [...dates].sort((a, b) => a.data.localeCompare(b.data));
        const next = sorted[0];
        const d = new Date(next.data + 'T00:00:00').toLocaleDateString('it-IT', {
          day: '2-digit', month: '2-digit', year: 'numeric',
        });
        return <span>{d}{next.ora ? ` — ${next.ora}` : ''}</span>;
      },
    },
    {
      key: 'linkBiglietti',
      header: 'Biglietti',
      render: (v: string) =>
        v ? <a href={v} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">Link</a>
          : <span className="text-gray-400">-</span>,
    },
    {
      key: 'emailSentAt',
      header: 'Email inviata',
      render: (v: string) =>
        v
          ? <span className="text-xs text-green-600 flex items-center gap-1">
              <i className="fa-solid fa-check-circle"></i>
              {new Date(v).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          : <span className="text-gray-400 text-xs">—</span>,
    },
  ];


  const actions = [
    { icon: 'fa-edit', tooltip: 'Modifica', method: (e: Evento) => navigate(`/admin/eventi/${e.publicId}`) },
    { icon: 'fa-trash', tooltip: 'Elimina', method: handleDelete },
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione eventi</h1>
          <p className="text-gray-500 mt-1 text-sm">Date e concerti</p>
        </div>
        <button
          onClick={() => navigate('/admin/eventi/new')}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <i className="fa-solid fa-plus"></i>
          Nuovo evento
        </button>
      </div>

      <Table columns={columns} data={eventi} actions={actions} loading={loading} />
    </div>
  );
};

export default Events;
