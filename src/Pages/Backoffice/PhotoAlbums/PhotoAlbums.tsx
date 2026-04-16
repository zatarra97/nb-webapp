import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Table from '../../../Components/Table';
import { adminGetList, adminDelete } from '../../../services/api-utility';

interface Album {
  id: number;
  publicId: string;
  nome: string;
  ordine: number;
  immagini?: any[];
}

const PhotoAlbums = () => {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setAlbums(await adminGetList('photo-albums'));
    } catch {
      toast.error('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (album: Album) => {
    if (!window.confirm(`Eliminare l'album "${album.nome}" e tutte le sue immagini?`)) return;
    try {
      await adminDelete('photo-albums', album.publicId);
      toast.success('Album eliminato');
      load();
    } catch {
      toast.error('Errore durante l\'eliminazione');
    }
  };

  const columns = [
    { key: 'nome', header: 'Nome album' },
    {
      key: 'immagini',
      header: 'Immagini',
      render: (imgs: any[]) => <span className="text-gray-600">{imgs?.length ?? 0}</span>,
    },
    { key: 'ordine', header: 'Ordine' },
  ];

  const actions = [
    { icon: 'fa-edit', tooltip: 'Gestisci album', method: (a: Album) => navigate(`/admin/gallery/${a.publicId}`) },
    { icon: 'fa-trash', tooltip: 'Elimina', method: handleDelete },
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione gallery</h1>
          <p className="text-gray-500 mt-1 text-sm">Album fotografici</p>
        </div>
        <button
          onClick={() => navigate('/admin/gallery/new')}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <i className="fa-solid fa-plus"></i>
          Nuovo album
        </button>
      </div>
      <Table columns={columns} data={albums} actions={actions} loading={loading} />
    </div>
  );
};

export default PhotoAlbums;
