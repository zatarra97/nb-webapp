import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminGetList, adminDelete } from '../../../services/api-utility';

const SEZIONI = ['about-me'];

const ContentBlocks = () => {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSezione, setFilterSezione] = useState('');

  useEffect(() => {
    const url = filterSezione ? `content-blocks?sezione=${filterSezione}` : 'content-blocks';
    adminGetList(url)
      .then(setBlocks)
      .catch(() => toast.error('Errore nel caricamento'))
      .finally(() => setLoading(false));
  }, [filterSezione]);

  const handleDelete = async (publicId: string) => {
    if (!window.confirm('Eliminare questo blocco?')) return;
    try {
      await adminDelete('content-blocks', publicId);
      setBlocks((prev) => prev.filter((b) => b.publicId !== publicId));
      toast.success('Blocco eliminato');
    } catch {
      toast.error('Errore durante l\'eliminazione');
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blocchi di contenuto</h1>
        <button
          onClick={() => navigate('/admin/contenuti/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer text-sm"
        >
          <i className="fa-solid fa-plus"></i> Nuovo blocco
        </button>
      </div>

      {/* Filtro sezione */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilterSezione('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${!filterSezione ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Tutti
        </button>
        {SEZIONI.map((s) => (
          <button
            key={s}
            onClick={() => setFilterSezione(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer capitalize ${filterSezione === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {!loading && blocks.length === 0 && (
        <p className="text-gray-400 py-10 text-center">Nessun blocco presente.</p>
      )}

      <div className="space-y-3">
        {blocks.map((block) => (
          <div key={block.publicId} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 rounded-md px-2 py-0.5 capitalize">{block.sezione}</span>
                <span className="text-xs text-gray-400">ordine: {block.ordine}</span>
              </div>
              <p className="font-medium text-gray-900 truncate">
                {block.titoloIT || block.titoloEN || <span className="text-gray-400 italic">senza titolo</span>}
              </p>
              {block.titoloEN && block.titoloEN !== block.titoloIT && (
                <p className="text-sm text-gray-400 truncate">{block.titoloEN}</p>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => navigate(`/admin/contenuti/${block.publicId}`)}
                className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center cursor-pointer"
              >
                <i className="fas fa-edit text-blue-700 text-xs"></i>
              </button>
              <button
                onClick={() => handleDelete(block.publicId)}
                className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center cursor-pointer"
              >
                <i className="fas fa-trash text-red-600 text-xs"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentBlocks;
