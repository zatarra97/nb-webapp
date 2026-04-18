import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Table from '../../../Components/Table';
import { useConfirmDialog } from '../../../Components/ConfirmDialog';
import { adminGetList, adminDelete, adminPatch } from '../../../services/api-utility';
import DownloadImages from './DownloadImages';

interface Album {
  id: number;
  publicId: string;
  nome: string;
  ordine: number;
  immagini?: any[];
}

type GalleryTab = 'albums' | 'download';

// ---------------------------------------------------------------------------
// Gallery admin — pagina principale con due tab:
//  1) Album fotografici (default)
//  2) Immagini per il download (stampa / giornalisti)
// ---------------------------------------------------------------------------
const PhotoAlbums = () => {
  const navigate = useNavigate();
  const confirm = useConfirmDialog();
  const [activeTab, setActiveTab] = useState<GalleryTab>('albums');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadCount, setDownloadCount] = useState<number | null>(null);

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

  // Contatore per il badge del secondo tab — caricato una sola volta all'inizio
  useEffect(() => {
    adminGetList('download-images')
      .then((items) => setDownloadCount(items.length))
      .catch(() => setDownloadCount(0));
  }, []);

  const handleDelete = async (album: Album) => {
    const n = album.immagini?.length ?? 0;
    const ok = await confirm({
      title: "Eliminare l'album?",
      description: (
        <>
          Stai per eliminare l'album <strong>"{album.nome}"</strong>
          {n > 0 && (
            <> insieme alle sue <strong>{n}</strong> {n === 1 ? 'immagine' : 'immagini'}</>
          )}.
          L'operazione non può essere annullata.
        </>
      ),
      confirmLabel: 'Elimina album',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminDelete('photo-albums', album.publicId);
      toast.success('Album eliminato');
      load();
    } catch {
      toast.error('Errore durante l\'eliminazione');
    }
  };

  const handleReorder = async (next: Album[]) => {
    const previous = albums;
    setAlbums(next);
    try {
      await adminPatch('photo-albums/reorder', {
        items: next.map((a, idx) => ({ publicId: a.publicId, ordine: idx + 1 })),
      });
    } catch {
      toast.error('Errore durante il riordino');
      setAlbums(previous);
    }
  };

  const columns = [
    { key: 'nome', header: 'Nome album' },
    {
      key: 'immagini',
      header: 'Immagini',
      render: (imgs: any[]) => <span className="text-gray-600">{imgs?.length ?? 0}</span>,
    },
  ];

  const actions = [
    { icon: 'fa-edit', tooltip: 'Gestisci album', method: (a: Album) => navigate(`/admin/gallery/${a.publicId}`) },
    { icon: 'fa-trash', tooltip: 'Elimina', method: handleDelete },
  ];

  const tabs: Array<{ id: GalleryTab; label: string; badge: number | null }> = [
    { id: 'albums', label: 'Album fotografici', badge: albums.length },
    { id: 'download', label: 'Immagini per il download', badge: downloadCount },
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
        <p className="text-gray-500 text-sm mt-1">Album fotografici e immagini scaricabili</p>
      </div>

      {/* Tab switcher */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1" role="tablist" aria-label="Sezioni gallery">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`gallery-tabpanel-${tab.id}`}
                id={`gallery-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 -mb-px border-b-2 text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
                  active
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.badge !== null && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB — Album fotografici */}
      <div
        id="gallery-tabpanel-albums"
        role="tabpanel"
        aria-labelledby="gallery-tab-albums"
        hidden={activeTab !== 'albums'}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-500 text-sm">Album raggruppati per opera/produzione</p>
          <button
            onClick={() => navigate('/admin/gallery/new')}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-plus"></i>
            Nuovo album
          </button>
        </div>
        <Table columns={columns} data={albums} actions={actions} loading={loading} sortable onReorder={handleReorder} />
      </div>

      {/* TAB — Immagini per il download */}
      <div
        id="gallery-tabpanel-download"
        role="tabpanel"
        aria-labelledby="gallery-tab-download"
        hidden={activeTab !== 'download'}
      >
        <DownloadImages onCountChange={setDownloadCount} />
      </div>
    </div>
  );
};

export default PhotoAlbums;
