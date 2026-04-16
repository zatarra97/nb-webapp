import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Table from '../../../Components/Table';
import { adminGetList, adminDelete } from '../../../services/api-utility';

interface PressItem {
  id: number;
  publicId: string;
  nomeTestata: string;
  nomeGiornalista?: string;
  ordine: number;
  citazioneIT?: string;
}

const PressList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<PressItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await adminGetList('press'));
    } catch {
      toast.error('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (item: PressItem) => {
    if (!window.confirm(`Eliminare "${item.nomeTestata}"?`)) return;
    try {
      await adminDelete('press', item.publicId);
      toast.success('Articolo eliminato');
      load();
    } catch {
      toast.error('Errore durante l\'eliminazione');
    }
  };

  const columns = [
    { key: 'nomeTestata', header: 'Testata' },
    { key: 'nomeGiornalista', header: 'Giornalista', render: (v: string) => v || <span className="text-gray-400">-</span> },
    { key: 'ordine', header: 'Ordine' },
    {
      key: 'citazioneIT',
      header: 'Citazione',
      render: (v: string) => v
        ? <span className="line-clamp-1 max-w-xs text-gray-600 italic">"{v}"</span>
        : <span className="text-gray-400">-</span>,
    },
  ];

  const actions = [
    { icon: 'fa-edit', tooltip: 'Modifica', method: (p: PressItem) => navigate(`/admin/press/${p.publicId}`) },
    { icon: 'fa-trash', tooltip: 'Elimina', method: handleDelete },
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione press</h1>
          <p className="text-gray-500 mt-1 text-sm">Rassegna stampa</p>
        </div>
        <button
          onClick={() => navigate('/admin/press/new')}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <i className="fa-solid fa-plus"></i>
          Nuovo articolo
        </button>
      </div>
      <Table columns={columns} data={items} actions={actions} loading={loading} />
    </div>
  );
};

export default PressList;
