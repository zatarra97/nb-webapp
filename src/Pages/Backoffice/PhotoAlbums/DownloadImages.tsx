import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  adminCreate, adminUpdate, adminDelete, adminPatch,
  adminGetList, getUploadUrl, uploadToS3, deleteMedia,
} from '../../../services/api-utility';
import { useConfirmDialog } from '../../../Components/ConfirmDialog';
import Input from '../../../Components/Input';

interface DownloadImage {
  publicId: string;
  titolo: string;
  s3Path?: string | null;
  anno?: number | null;
  credit?: string | null;
  risoluzione?: string | null;
  ordine: number;
}

interface EditingImage extends DownloadImage {
  _isNew?: boolean;
}

interface Props {
  onCountChange?: (n: number) => void;
}

// ---------------------------------------------------------------------------
// Rileva la risoluzione di un File immagine (naturalWidth × naturalHeight).
// Usato per prefillare il campo "risoluzione" all'upload.
// ---------------------------------------------------------------------------
function detectImageResolution(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const value = `${img.naturalWidth}×${img.naturalHeight}`;
      URL.revokeObjectURL(url);
      resolve(value);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
const DownloadImages: React.FC<Props> = ({ onCountChange }) => {
  const confirm = useConfirmDialog();
  const [images, setImages] = useState<DownloadImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<EditingImage | null>(null);

  // Drag & drop
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const dragArmed = useRef(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminGetList('download-images');
      const sorted = data.slice().sort((a: DownloadImage, b: DownloadImage) => a.ordine - b.ordine);
      setImages(sorted);
      onCountChange?.(sorted.length);
    } catch {
      toast.error('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleNew = () => {
    setEditing({
      publicId: '',
      titolo: '',
      s3Path: null,
      anno: null,
      credit: null,
      risoluzione: null,
      ordine: images.length ? Math.max(...images.map((i) => i.ordine)) + 1 : 1,
      _isNew: true,
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    try {
      // Rileva la risoluzione PRIMA di caricare così è disponibile subito
      const risoluzione = await detectImageResolution(file);
      const { uploadUrl, publicUrl } = await getUploadUrl('download-images', file.name, file.type);
      await uploadToS3(uploadUrl, file);
      setEditing((prev) => prev ? {
        ...prev,
        s3Path: publicUrl,
        // Prefilla risoluzione solo se l'utente non l'ha ancora compilata manualmente
        risoluzione: prev.risoluzione?.trim() ? prev.risoluzione : risoluzione,
      } : null);
      toast.success('Immagine caricata');
    } catch {
      toast.error('Errore durante il caricamento');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.titolo.trim()) { toast.error('Il titolo è obbligatorio'); return; }
    setSaving(true);
    try {
      const payload = {
        titolo: editing.titolo,
        s3Path: editing.s3Path || null,
        anno: editing.anno || null,
        credit: editing.credit || null,
        risoluzione: editing.risoluzione || null,
        ...(editing._isNew ? { ordine: editing.ordine } : {}),
      };
      if (editing._isNew) {
        const created = await adminCreate('download-images', payload);
        const next = [...images, created].sort((a, b) => a.ordine - b.ordine);
        setImages(next);
        onCountChange?.(next.length);
      } else {
        await adminUpdate('download-images', editing.publicId, payload);
        setImages((prev) => prev.map((img) => img.publicId === editing.publicId ? { ...img, ...editing } : img));
      }
      toast.success('Immagine salvata');
      setEditing(null);
    } catch {
      toast.error('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (img: DownloadImage) => {
    const ok = await confirm({
      title: "Eliminare l'immagine?",
      description: (
        <>
          Stai per eliminare <strong>"{img.titolo}"</strong> dalle immagini scaricabili.
          Il file su S3 verrà rimosso e l'operazione non può essere annullata.
        </>
      ),
      confirmLabel: 'Elimina',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminDelete('download-images', img.publicId);
      if (img.s3Path) await deleteMedia(img.s3Path).catch(() => {});
      const next = images.filter((i) => i.publicId !== img.publicId);
      setImages(next);
      onCountChange?.(next.length);
      toast.success('Immagine eliminata');
    } catch {
      toast.error('Errore durante l\'eliminazione');
    }
  };

  // ---------------------------------------------------------------------------
  // Drag & drop reorder
  // ---------------------------------------------------------------------------
  const persistReorder = async (next: DownloadImage[]) => {
    const previous = images;
    setImages(next);
    try {
      await adminPatch('download-images/reorder', {
        items: next.map((img, idx) => ({ publicId: img.publicId, ordine: idx + 1 })),
      });
      setImages((curr) => curr.map((img, idx) => ({ ...img, ordine: idx + 1 })));
    } catch {
      toast.error('Errore durante il riordino');
      setImages(previous);
    }
  };

  const handleCardDragStart = (idx: number) => (e: React.DragEvent) => {
    if (!dragArmed.current) { e.preventDefault(); return; }
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  };

  const handleCardDragOver = (idx: number) => (e: React.DragEvent) => {
    if (draggedIdx === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (overIdx !== idx) setOverIdx(idx);
  };

  const handleCardDrop = (idx: number) => (e: React.DragEvent) => {
    if (draggedIdx === null) return;
    e.preventDefault();
    if (draggedIdx !== idx) {
      const next = [...images];
      const [moved] = next.splice(draggedIdx, 1);
      next.splice(idx, 0, moved);
      persistReorder(next);
    }
    setDraggedIdx(null);
    setOverIdx(null);
    dragArmed.current = false;
  };

  const handleCardDragEnd = () => {
    setDraggedIdx(null);
    setOverIdx(null);
    dragArmed.current = false;
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-500 text-sm">
          Foto ufficiali scaricabili da giornalisti e stampa. Ogni immagine è pubblicata con titolo, anno, credit e risoluzione.
        </p>
        <button
          onClick={handleNew}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <i className="fa-solid fa-plus"></i>
          Nuova immagine
        </button>
      </div>

      {images.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <i className="fa-solid fa-images text-4xl text-gray-300 mb-3 block"></i>
          <p className="text-gray-500 text-sm">Nessuna immagine scaricabile</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-3">
            <i className="fa-solid fa-circle-info mr-1" />
            Trascina le immagini usando l'icona <i className="fas fa-grip-vertical mx-1" /> per riordinarle.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, idx) => {
              const isDragging = draggedIdx === idx;
              const isOver = overIdx === idx && draggedIdx !== idx;
              return (
                <div
                  key={img.publicId}
                  draggable
                  onDragStart={handleCardDragStart(idx)}
                  onDragOver={handleCardDragOver(idx)}
                  onDrop={handleCardDrop(idx)}
                  onDragEnd={handleCardDragEnd}
                  onDragLeave={() => { if (overIdx === idx) setOverIdx(null); }}
                  className={`bg-white border border-gray-200 rounded-xl overflow-hidden transition-all ${
                    isDragging ? 'opacity-40' : ''
                  } ${isOver ? 'outline outline-2 outline-blue-400 outline-offset-[-2px]' : ''}`}
                >
                  {img.s3Path ? (
                    <img src={img.s3Path} alt={img.titolo} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-gray-100 flex items-center justify-center">
                      <i className="fa-solid fa-image text-3xl text-gray-400"></i>
                    </div>
                  )}
                  <div className="p-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-gray-500 flex-shrink-0">#{idx + 1}</span>
                      <button
                        type="button"
                        title="Trascina per riordinare"
                        aria-label="Trascina per riordinare"
                        onMouseDown={() => { dragArmed.current = true; }}
                        onMouseUp={() => { dragArmed.current = false; }}
                        onTouchStart={() => { dragArmed.current = true; }}
                        onTouchEnd={() => { dragArmed.current = false; }}
                        className="w-6 h-6 rounded bg-gray-100 hover:bg-blue-100 border border-gray-200 flex items-center justify-center flex-shrink-0 cursor-grab active:cursor-grabbing"
                      >
                        <i className="fas fa-grip-vertical text-gray-500 text-xs" />
                      </button>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{img.titolo}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {[img.anno, img.risoluzione].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button type="button" onClick={() => setEditing(img)} className="w-7 h-7 rounded bg-blue-50 hover:bg-blue-100 flex items-center justify-center cursor-pointer">
                        <i className="fas fa-edit text-blue-700 text-xs"></i>
                      </button>
                      <button type="button" onClick={() => handleDelete(img)} className="w-7 h-7 rounded bg-red-50 hover:bg-red-100 flex items-center justify-center cursor-pointer">
                        <i className="fas fa-trash text-red-600 text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal create/edit */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editing._isNew ? 'Nuova immagine scaricabile' : 'Modifica immagine'}
            </h3>

            <div className="space-y-4">
              {/* Upload immagine */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">File immagine</label>
                {editing.s3Path && (
                  <img src={editing.s3Path} alt="" className="w-full h-48 object-cover rounded-lg mb-2" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                  disabled={uploading}
                  onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
                  className="block text-sm text-gray-700 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {uploading && <p className="text-xs text-gray-500 mt-1">Caricamento...</p>}
              </div>

              <Input
                label="Titolo *"
                value={editing.titolo}
                onChange={(e) => setEditing((p) => p ? { ...p, titolo: e.target.value } : null)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Anno"
                  type="number"
                  value={editing.anno ? String(editing.anno) : ''}
                  onChange={(e) => setEditing((p) => p ? {
                    ...p,
                    anno: e.target.value ? Number(e.target.value) : null,
                  } : null)}
                  placeholder="es. 2024"
                />
                <Input
                  label="Risoluzione"
                  value={editing.risoluzione || ''}
                  onChange={(e) => setEditing((p) => p ? { ...p, risoluzione: e.target.value } : null)}
                  placeholder="auto-rilevata al caricamento"
                />
              </div>

              <Input
                label="Credit fotografo"
                value={editing.credit || ''}
                onChange={(e) => setEditing((p) => p ? { ...p, credit: e.target.value } : null)}
                placeholder="es. © Mario Rossi"
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || uploading}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {saving ? 'Salvataggio...' : 'Salva'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-5 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                >
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

export default DownloadImages;
