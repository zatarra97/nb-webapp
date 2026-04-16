import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  adminCreate, adminUpdate, adminGetItem, adminDelete, adminPatch,
  getUploadUrl, uploadToS3, deleteMedia,
} from '../../../services/api-utility';
import Input from '../../../Components/Input';

interface Immagine {
  publicId: string;
  ordine: number;
  s3Path?: string;
  titolo?: string;
  ruoloIT?: string;
  ruoloEN?: string;
  conIT?: string;
  conEN?: string;
  descrizioneIT?: string;
  descrizioneEN?: string;
}

interface EditingImage extends Immagine {
  _isNew?: boolean;
  _file?: File;
  _preview?: string;
}

const PhotoAlbumDetail = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const isNew = albumId === 'new';

  const [nome, setNome] = useState('');
  const [ordine, setOrdine] = useState(0);
  const [images, setImages] = useState<EditingImage[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [editingImage, setEditingImage] = useState<EditingImage | null>(null);

  useEffect(() => {
    if (isNew) return;
    adminGetItem('photo-albums', albumId!).then((data) => {
      setNome(data.nome || '');
      setOrdine(data.ordine ?? 0);
      setImages(data.immagini ?? []);
    }).catch(() => toast.error('Errore nel caricamento'))
      .finally(() => setLoading(false));
  }, [albumId, isNew]);

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) { toast.error('Il nome è obbligatorio'); return; }
    setSaving(true);
    try {
      if (isNew) {
        const created = await adminCreate('photo-albums', { nome, ordine });
        toast.success('Album creato');
        navigate(`/admin/gallery/${created.publicId}`, { replace: true });
      } else {
        await adminUpdate('photo-albums', albumId!, { nome, ordine });
        toast.success('Album salvato');
      }
    } catch {
      toast.error('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleImageFileSelect = async (file: File, idx: number) => {
    setUploadingIdx(idx);
    try {
      const folder = `photo-albums/${albumId}`;
      const { uploadUrl, publicUrl } = await getUploadUrl(folder, file.name, file.type);
      await uploadToS3(uploadUrl, file);
      setImages((prev) =>
        prev.map((img, i) => (i === idx ? { ...img, s3Path: publicUrl } : img))
      );
      toast.success('Immagine caricata');
    } catch {
      toast.error('Errore durante il caricamento');
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleAddImage = async () => {
    if (isNew) { toast.error('Salva prima l\'album'); return; }
    const newImg: EditingImage = {
      publicId: '',
      ordine: (images.length + 1),
      _isNew: true,
    };
    setEditingImage(newImg);
  };

  const handleSaveImage = async () => {
    if (!editingImage) return;
    if (!albumId) return;
    setSaving(true);
    try {
      if (editingImage._isNew) {
        const created = await adminCreate(`photo-albums/${albumId}/images`, {
          ordine: editingImage.ordine,
          s3Path: editingImage.s3Path || null,
          titolo: editingImage.titolo || null,
          ruoloIT: editingImage.ruoloIT || null,
          ruoloEN: editingImage.ruoloEN || null,
          conIT: editingImage.conIT || null,
          conEN: editingImage.conEN || null,
          descrizioneIT: editingImage.descrizioneIT || null,
          descrizioneEN: editingImage.descrizioneEN || null,
        });
        setImages((prev) => [...prev, created]);
      } else {
        await adminUpdate(
          `photo-albums/${albumId}/images`,
          editingImage.publicId,
          {
            ordine: editingImage.ordine,
            s3Path: editingImage.s3Path || null,
            titolo: editingImage.titolo || null,
            ruoloIT: editingImage.ruoloIT || null,
            ruoloEN: editingImage.ruoloEN || null,
            conIT: editingImage.conIT || null,
            conEN: editingImage.conEN || null,
            descrizioneIT: editingImage.descrizioneIT || null,
            descrizioneEN: editingImage.descrizioneEN || null,
          }
        );
        setImages((prev) =>
          prev.map((img) => (img.publicId === editingImage.publicId ? editingImage : img))
        );
      }
      toast.success('Immagine salvata');
      setEditingImage(null);
    } catch {
      toast.error('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async (img: EditingImage) => {
    if (!window.confirm('Eliminare questa immagine?')) return;
    try {
      await adminDelete(`photo-albums/${albumId}/images`, img.publicId);
      if (img.s3Path) await deleteMedia(img.s3Path).catch(() => {});
      setImages((prev) => prev.filter((i) => i.publicId !== img.publicId));
      toast.success('Immagine eliminata');
    } catch {
      toast.error('Errore durante l\'eliminazione');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate('/admin/gallery')} className="text-gray-500 hover:text-gray-900 cursor-pointer">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'Nuovo album' : `Album: ${nome}`}
        </h1>
      </div>

      {/* Form album */}
      <form onSubmit={handleSaveAlbum} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 flex items-end gap-4">
        <div className="flex-1">
          <Input label="Nome album *" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div className="w-32">
          <Input label="Ordine" type="number" value={String(ordine)} onChange={(e) => setOrdine(Number(e.target.value) || 0)} />
        </div>
        <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer h-10">
          {saving ? '...' : 'Salva album'}
        </button>
      </form>

      {/* Immagini */}
      {!isNew && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Immagini ({images.length})</h2>
            <button
              onClick={handleAddImage}
              className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 cursor-pointer text-sm"
            >
              <i className="fa-solid fa-plus"></i> Aggiungi immagine
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.sort((a, b) => a.ordine - b.ordine).map((img) => (
              <div key={img.publicId} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {img.s3Path ? (
                  <img src={img.s3Path} alt={img.titolo || ''} className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36 bg-gray-100 flex items-center justify-center">
                    <i className="fa-solid fa-image text-3xl text-gray-400"></i>
                  </div>
                )}
                <div className="p-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-700 truncate">{img.titolo || `#${img.ordine}`}</p>
                    {img.ruoloIT && <p className="text-xs text-gray-500 truncate">{img.ruoloIT}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setEditingImage(img)} className="w-7 h-7 rounded bg-blue-50 hover:bg-blue-100 flex items-center justify-center cursor-pointer">
                      <i className="fas fa-edit text-blue-700 text-xs"></i>
                    </button>
                    <button type="button" onClick={() => handleDeleteImage(img)} className="w-7 h-7 rounded bg-red-50 hover:bg-red-100 flex items-center justify-center cursor-pointer">
                      <i className="fas fa-trash text-red-600 text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal modifica immagine */}
      {editingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditingImage(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingImage._isNew ? 'Aggiungi immagine' : 'Modifica immagine'}
            </h3>

            <div className="space-y-3">
              {/* Upload immagine */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Immagine</label>
                {editingImage.s3Path && (
                  <img src={editingImage.s3Path} alt="" className="w-full h-40 object-cover rounded-lg mb-2" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                  disabled={uploadingIdx !== null}
                  onChange={async (e) => {
                    if (!e.target.files?.[0] || !albumId) return;
                    const file = e.target.files[0];
                    setUploadingIdx(-1);
                    try {
                      const { uploadUrl, publicUrl } = await getUploadUrl(`photo-albums/${albumId}`, file.name, file.type);
                      await uploadToS3(uploadUrl, file);
                      setEditingImage((prev) => prev ? { ...prev, s3Path: publicUrl } : null);
                    } catch {
                      toast.error('Errore durante il caricamento');
                    } finally {
                      setUploadingIdx(null);
                    }
                  }}
                  className="block text-sm text-gray-700 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {uploadingIdx !== null && <p className="text-xs text-gray-500 mt-1">Caricamento...</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input label="Ordine *" type="number" value={String(editingImage.ordine)}
                  onChange={(e) => setEditingImage((p) => p ? { ...p, ordine: Number(e.target.value) || 0 } : null)} />
                <Input label="Titolo" value={editingImage.titolo || ''}
                  onChange={(e) => setEditingImage((p) => p ? { ...p, titolo: e.target.value } : null)} />
                <Input label="Ruolo (IT)" value={editingImage.ruoloIT || ''}
                  onChange={(e) => setEditingImage((p) => p ? { ...p, ruoloIT: e.target.value } : null)} />
                <Input label="Ruolo (EN)" value={editingImage.ruoloEN || ''}
                  onChange={(e) => setEditingImage((p) => p ? { ...p, ruoloEN: e.target.value } : null)} />
                <Input label="Con (IT)" value={editingImage.conIT || ''}
                  onChange={(e) => setEditingImage((p) => p ? { ...p, conIT: e.target.value } : null)} />
                <Input label="Con (EN)" value={editingImage.conEN || ''}
                  onChange={(e) => setEditingImage((p) => p ? { ...p, conEN: e.target.value } : null)} />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Descrizione (IT)</label>
                <textarea value={editingImage.descrizioneIT || ''} rows={2}
                  onChange={(e) => setEditingImage((p) => p ? { ...p, descrizioneIT: e.target.value } : null)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Descrizione (EN)</label>
                <textarea value={editingImage.descrizioneEN || ''} rows={2}
                  onChange={(e) => setEditingImage((p) => p ? { ...p, descrizioneEN: e.target.value } : null)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleSaveImage} disabled={saving}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer">
                  {saving ? '...' : 'Salva'}
                </button>
                <button type="button" onClick={() => setEditingImage(null)}
                  className="px-5 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoAlbumDetail;
