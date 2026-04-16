import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminCreate, adminUpdate, adminGetItem, getUploadUrl, uploadToS3 } from '../../../services/api-utility';
import Input from '../../../Components/Input';

interface StreamingLink {
  platform: string;
  url: string;
}

interface FormState {
  titolo: string;
  fotoS3Path: string;
  audioPreviewS3Path: string;
  ordine: number;
}

const MusicAlbumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form, setForm] = useState<FormState>({
    titolo: '', fotoS3Path: '', audioPreviewS3Path: '', ordine: 0,
  });
  const [streamingLinks, setStreamingLinks] = useState<StreamingLink[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<'foto' | 'audio' | null>(null);

  useEffect(() => {
    if (isNew) return;
    adminGetItem('music-albums', id!).then((data) => {
      setForm({
        titolo: data.titolo || '',
        fotoS3Path: data.fotoS3Path || '',
        audioPreviewS3Path: data.audioPreviewS3Path || '',
        ordine: data.ordine ?? 0,
      });
      if (data.streamingLinks && typeof data.streamingLinks === 'object') {
        setStreamingLinks(
          Object.entries(data.streamingLinks).map(([platform, url]) => ({
            platform,
            url: url as string,
          }))
        );
      }
    }).catch(() => toast.error('Errore nel caricamento'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const handleImageUpload = async (file: File) => {
    setUploadingField('foto');
    try {
      const { uploadUrl, publicUrl } = await getUploadUrl('music-albums', file.name, file.type);
      await uploadToS3(uploadUrl, file);
      setForm((p) => ({ ...p, fotoS3Path: publicUrl }));
      toast.success('Copertina caricata');
    } catch {
      toast.error('Errore durante il caricamento');
    } finally {
      setUploadingField(null);
    }
  };

  const handleAudioUpload = async (file: File) => {
    setUploadingField('audio');
    try {
      const { uploadUrl, publicUrl } = await getUploadUrl('music-albums/audio', file.name, file.type);
      await uploadToS3(uploadUrl, file);
      setForm((p) => ({ ...p, audioPreviewS3Path: publicUrl }));
      toast.success('Audio preview caricato');
    } catch {
      toast.error('Errore durante il caricamento');
    } finally {
      setUploadingField(null);
    }
  };

  const addLink = () => setStreamingLinks((p) => [...p, { platform: '', url: '' }]);
  const removeLink = (i: number) => setStreamingLinks((p) => p.filter((_, idx) => idx !== i));
  const updateLink = (i: number, field: keyof StreamingLink, value: string) =>
    setStreamingLinks((p) => p.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titolo.trim()) { toast.error('Il titolo è obbligatorio'); return; }
    setSaving(true);
    try {
      const linksObj = streamingLinks.reduce<Record<string, string>>((acc, l) => {
        if (l.platform.trim() && l.url.trim()) acc[l.platform.trim()] = l.url.trim();
        return acc;
      }, {});

      const payload = {
        ...form,
        fotoS3Path: form.fotoS3Path || null,
        audioPreviewS3Path: form.audioPreviewS3Path || null,
        streamingLinks: Object.keys(linksObj).length ? linksObj : null,
      };

      if (isNew) {
        await adminCreate('music-albums', payload);
      } else {
        await adminUpdate('music-albums', id!, payload);
      }
      toast.success('Album salvato');
      navigate('/admin/discografia');
    } catch {
      toast.error('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate('/admin/discografia')} className="text-gray-500 hover:text-gray-900 cursor-pointer">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'Nuovo album musicale' : 'Modifica album musicale'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Titolo *" value={form.titolo}
            onChange={(e) => setForm((p) => ({ ...p, titolo: e.target.value }))} required />
          <Input label="Ordine" type="number" value={String(form.ordine)}
            onChange={(e) => setForm((p) => ({ ...p, ordine: Number(e.target.value) || 0 }))} />
        </div>

        {/* Copertina */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Copertina</label>
          {form.fotoS3Path && (
            <img src={form.fotoS3Path} alt="Copertina" className="w-40 h-40 object-cover rounded-lg mb-2" />
          )}
          <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
            disabled={uploadingField === 'foto'}
            onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }}
            className="block text-sm text-gray-700 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          {uploadingField === 'foto' && <p className="text-xs text-gray-500 mt-1">Caricamento...</p>}
        </div>

        {/* Audio preview */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Audio preview</label>
          {form.audioPreviewS3Path && (
            <audio controls className="w-full mb-2">
              <source src={form.audioPreviewS3Path} />
            </audio>
          )}
          <input type="file" accept="audio/mpeg,audio/mp3,audio/m4a,audio/aac,audio/ogg"
            disabled={uploadingField === 'audio'}
            onChange={(e) => { if (e.target.files?.[0]) handleAudioUpload(e.target.files[0]); }}
            className="block text-sm text-gray-700 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          {uploadingField === 'audio' && <p className="text-xs text-gray-500 mt-1">Caricamento...</p>}
        </div>

        {/* Streaming links */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Link streaming</label>
          <div className="space-y-2">
            {streamingLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={link.platform}
                  placeholder="spotify / apple / youtube..."
                  onChange={(e) => updateLink(i, 'platform', e.target.value)}
                  className="w-36 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="url"
                  value={link.url}
                  placeholder="https://..."
                  onChange={(e) => updateLink(i, 'url', e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button type="button" onClick={() => removeLink(i)} className="text-red-500 hover:text-red-700 px-2 cursor-pointer">
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addLink} className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer">
            <i className="fa-solid fa-plus"></i> Aggiungi link
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer">
            {saving ? 'Salvataggio...' : 'Salva'}
          </button>
          <button type="button" onClick={() => navigate('/admin/discografia')}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
};

export default MusicAlbumDetail;
