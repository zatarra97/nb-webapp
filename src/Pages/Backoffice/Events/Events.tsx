import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Table from '../../../Components/Table';
import { adminGetList, adminDelete } from '../../../services/api-utility';

interface Evento {
  id: number;
  publicId: string;
  titolo: string;
  linkBiglietti?: string;
  dates?: Array<{ data: string; ora?: string }>;
  updatedAt?: string;
}

const Events = () => {
  const navigate = useNavigate();
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
    if (!window.confirm(`Eliminare l'evento "${event.titolo}"?`)) return;
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
