import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminCreate, adminUpdate, adminGetItem, getUploadUrl, uploadToS3, adminPostAction } from '../../../services/api-utility';
import Input from '../../../Components/Input';

interface StreamingLink {
  platform: string;
  url: string;
}

interface FormState {
  titolo: string;
  fotoS3Path: string;
  audioPreviewS3Path: string;
}

interface EmailModal {
  open: boolean;
  titolo: string;
  descrizione: string;
}

const MusicAlbumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form, setForm] = useState<FormState>({
    titolo: '', fotoS3Path: '', audioPreviewS3Path: '',
  });
  const [streamingLinks, setStreamingLinks] = useState<StreamingLink[]>([]);
  const [emailSentAt, setEmailSentAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<'foto' | 'audio' | null>(null);
  const [emailModal, setEmailModal] = useState<EmailModal>({ open: false, titolo: '', descrizione: '' });
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (isNew) return;
    adminGetItem('music-albums', id!).then((data) => {
      setForm({
        titolo: data.titolo || '',
        fotoS3Path: data.fotoS3Path || '',
        audioPreviewS3Path: data.audioPreviewS3Path || '',
      });
      if (data.streamingLinks && typeof data.streamingLinks === 'object') {
        setStreamingLinks(
          Object.entries(data.streamingLinks).map(([platform, url]) => ({
            platform,
            url: url as string,
          }))
        );
      }
      setEmailSentAt(data.emailSentAt || null);
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

  const buildEmailDescrizione = () => {
    const parts: string[] = [];
    const validLinks = streamingLinks.filter((l) => l.platform.trim() && l.url.trim());
    if (validLinks.length) {
      parts.push('Ascolta ora su:\n' + validLinks.map((l) => `${l.platform}: ${l.url}`).join('\n'));
    }
    return parts.join('\n\n');
  };

  const openEmailModal = () => {
    setEmailModal({ open: true, titolo: form.titolo, descrizione: buildEmailDescrizione() });
  };

  const handleSendEmail = async () => {
    if (!emailModal.titolo.trim()) { toast.error('Il titolo è obbligatorio'); return; }
    setSendingEmail(true);
    try {
      const res = await adminPostAction(`music-albums/${id}/send-newsletter`, {
        titolo: emailModal.titolo,
        descrizione: emailModal.descrizione,
      });
      setEmailSentAt(res.emailSentAt);
      setEmailModal({ open: false, titolo: '', descrizione: '' });
      toast.success(`Email inviata a ${res.sentCount} iscritti`);
    } catch {
      toast.error('Errore durante l\'invio dell\'email');
    } finally {
      setSendingEmail(false);
    }
  };

  const formatEmailSentAt = (v: string) =>
    new Date(v).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/discografia')} className="text-gray-500 hover:text-gray-900 cursor-pointer">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Nuovo album musicale' : 'Modifica album musicale'}
          </h1>
        </div>
        {!isNew && (
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={openEmailModal}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm cursor-pointer"
            >
              <i className="fa-solid fa-paper-plane"></i>
              Invia email
            </button>
            {emailSentAt && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <i className="fa-solid fa-check-circle"></i>
                Inviata il {formatEmailSentAt(emailSentAt)}
              </span>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <Input label="Titolo *" value={form.titolo}
          onChange={(e) => setForm((p) => ({ ...p, titolo: e.target.value }))} required />

        {/* Copertina */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Copertina</label>
          {form.fotoS3Path && (
            <img src={form.fotoS3Path} alt="Copertina" className="w-40 h-40 object-cover rounded-lg mb-2" />
          )}
          <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
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
                <input type="text" value={link.platform} placeholder="spotify / apple / youtube..."
                  onChange={(e) => updateLink(i, 'platform', e.target.value)}
                  className="w-36 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input type="url" value={link.url} placeholder="https://..."
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

      {/* Modal composizione email */}
      {emailModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Componi email newsletter</h2>
              <button
                onClick={() => setEmailModal({ open: false, titolo: '', descrizione: '' })}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {emailSentAt && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  Email già inviata il {formatEmailSentAt(emailSentAt)}. Procedendo verrà inviata nuovamente.
                </div>
              )}
              {/* Anteprima copertina */}
              {form.fotoS3Path && (
                <div className="flex justify-center">
                  <img src={form.fotoS3Path} alt="Copertina" className="w-32 h-32 object-cover rounded-xl shadow" />
                </div>
              )}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Oggetto</label>
                <input
                  type="text"
                  value={emailModal.titolo}
                  onChange={(e) => setEmailModal((p) => ({ ...p, titolo: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Corpo email</label>
                <p className="text-xs text-gray-400 mb-2">Usa <code>---</code> su una riga per inserire un separatore orizzontale</p>
                <textarea
                  value={emailModal.descrizione}
                  onChange={(e) => setEmailModal((p) => ({ ...p, descrizione: e.target.value }))}
                  rows={10}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setEmailModal({ open: false, titolo: '', descrizione: '' })}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="px-5 py-2 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-paper-plane"></i>
                {sendingEmail ? 'Invio in corso...' : 'Invia a tutti gli iscritti'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicAlbumDetail;
