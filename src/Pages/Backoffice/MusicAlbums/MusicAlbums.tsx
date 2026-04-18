import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Table from '../../../Components/Table';
import { useConfirmDialog } from '../../../Components/ConfirmDialog';
import { adminGetList, adminDelete, adminPatch } from '../../../services/api-utility';

interface MusicAlbum {
  id: number;
  publicId: string;
  titolo: string;
  fotoS3Path?: string;
  ordine: number;
  emailSentAt?: string;
}

const MusicAlbums = () => {
  const navigate = useNavigate();
  const confirm = useConfirmDialog();
  const [albums, setAlbums] = useState<MusicAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setAlbums(await adminGetList('music-albums'));
    } catch {
      toast.error('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (album: MusicAlbum) => {
    const ok = await confirm({
      title: "Eliminare l'album musicale?",
      description: (
        <>
          Stai per eliminare <strong>"{album.titolo}"</strong> dalla discografia,
          inclusi link streaming, copertina e preview audio associati.
          L'operazione non può essere annullata.
        </>
      ),
      confirmLabel: 'Elimina',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminDelete('music-albums', album.publicId);
      toast.success('Album eliminato');
      load();
    } catch {
      toast.error('Errore durante l\'eliminazione');
    }
  };

  const handleReorder = async (next: MusicAlbum[]) => {
    const previous = albums;
    setAlbums(next);
    try {
      await adminPatch('music-albums/reorder', {
        items: next.map((a, idx) => ({ publicId: a.publicId, ordine: idx + 1 })),
      });
    } catch {
      toast.error('Errore durante il riordino');
      setAlbums(previous);
    }
  };

  const columns = [
    { key: 'fotoS3Path', header: 'Copertina', type: 'image' as const, width: '80px' },
    { key: 'titolo', header: 'Titolo' },
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
    { icon: 'fa-edit', tooltip: 'Modifica', method: (a: MusicAlbum) => navigate(`/admin/discografia/${a.publicId}`) },
    { icon: 'fa-trash', tooltip: 'Elimina', method: handleDelete },
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione discografia</h1>
          <p className="text-gray-500 mt-1 text-sm">Album musicali</p>
        </div>
        <button
          onClick={() => navigate('/admin/discografia/new')}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <i className="fa-solid fa-plus"></i>
          Nuovo album
        </button>
      </div>
      <Table columns={columns} data={albums} actions={actions} loading={loading} sortable onReorder={handleReorder} />
    </div>
  );
};

export default MusicAlbums;
