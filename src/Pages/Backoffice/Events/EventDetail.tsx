import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminCreate, adminUpdate, adminGetItem, getUploadUrl, uploadToS3, adminPostAction } from '../../../services/api-utility';
import Input from '../../../Components/Input';

interface EventDate {
  data: string;
  ora: string;
}

interface FormState {
  titolo: string;
  immagineS3Path: string;
  descrizioneIT: string;
  descrizioneEN: string;
  linkBiglietti: string;
  luogo: string;
}

interface EmailModal {
  open: boolean;
  titolo: string;
  descrizione: string;
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form, setForm] = useState<FormState>({
    titolo: '', immagineS3Path: '', descrizioneIT: '', descrizioneEN: '', linkBiglietti: '', luogo: '',
  });
  const [dates, setDates] = useState<EventDate[]>([{ data: '', ora: '' }]);
  const [emailSentAt, setEmailSentAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [emailModal, setEmailModal] = useState<EmailModal>({ open: false, titolo: '', descrizione: '' });
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (isNew) return;
    adminGetItem('events', id!).then((data) => {
      setForm({
        titolo: data.titolo || '',
        immagineS3Path: data.immagineS3Path || '',
        descrizioneIT: data.descrizioneIT || '',
        descrizioneEN: data.descrizioneEN || '',
        linkBiglietti: data.linkBiglietti || '',
        luogo: data.luogo || '',
      });
      setDates(
        data.dates?.length
          ? data.dates.map((d: any) => ({ data: d.data || '', ora: d.ora || '' }))
          : [{ data: '', ora: '' }]
      );
      setEmailSentAt(data.emailSentAt || null);
    }).catch(() => toast.error('Errore nel caricamento'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const addDate = () => setDates((prev) => [...prev, { data: '', ora: '' }]);
  const removeDate = (i: number) => setDates((prev) => prev.filter((_, idx) => idx !== i));
  const updateDate = (i: number, field: keyof EventDate, value: string) => {
    setDates((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)));
  };

  const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];

  const handleImageUpload = async (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Formato non supportato. Usa JPG, PNG, WebP o AVIF.');
      return;
    }
    setUploading(true);
    try {
      const { uploadUrl, publicUrl } = await getUploadUrl('events', file.name, file.type);
      await uploadToS3(uploadUrl, file);
      setForm((prev) => ({ ...prev, immagineS3Path: publicUrl }));
      toast.success('Immagine caricata');
    } catch {
      toast.error('Errore durante il caricamento dell\'immagine');
    } finally {
      setUploading(false);
    }
  };

  // Drag & drop sulla dropzone immagine (solo quando non è presente un'immagine)
  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, immagineS3Path: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titolo.trim()) { toast.error('Il titolo è obbligatorio'); return; }
    const validDates = dates.filter((d) => d.data.trim());
    if (!validDates.length) { toast.error('Almeno una data è obbligatoria'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        dates: validDates,
        immagineS3Path: form.immagineS3Path || null,
        linkBiglietti: form.linkBiglietti || null,
        luogo: form.luogo || null,
      };
      if (isNew) {
        await adminCreate('events', payload);
      } else {
        await adminUpdate('events', id!, payload);
      }
      toast.success('Evento salvato');
      navigate('/admin/eventi');
    } catch {
      toast.error('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const buildEmailDescrizione = () => {
    const parts: string[] = [];
    const validDates = dates.filter((d) => d.data);
    if (validDates.length) {
      parts.push(
        validDates.map((d) => {
          const dateStr = new Date(d.data + 'T00:00:00').toLocaleDateString('it-IT', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          });
          return d.ora ? `${dateStr} — ${d.ora}` : dateStr;
        }).join('\n')
      );
    }
    if (form.luogo) parts.push(`📍 ${form.luogo}`);
    if (form.linkBiglietti) parts.push(`Biglietti: ${form.linkBiglietti}`);
    if (form.descrizioneIT) { parts.push('---'); parts.push(form.descrizioneIT); }
    if (form.descrizioneEN) { parts.push('---'); parts.push(form.descrizioneEN); }
    return parts.join('\n\n');
  };

  const openEmailModal = () => {
    setEmailModal({ open: true, titolo: form.titolo, descrizione: buildEmailDescrizione() });
  };

  const handleSendEmail = async () => {
    if (!emailModal.titolo.trim()) { toast.error('Il titolo è obbligatorio'); return; }
    setSendingEmail(true);
    try {
      const res = await adminPostAction(`events/${id}/send-newsletter`, {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/eventi')} className="text-gray-500 hover:text-gray-900 cursor-pointer">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Nuovo evento' : 'Modifica evento'}
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
                Inviata il {new Date(emailSentAt).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-6 items-start">

        {/* --------------------------------------------------------------- */}
        {/* Colonna sinistra — Immagine / Dropzone                           */}
        {/* --------------------------------------------------------------- */}
        <div className="md:sticky md:top-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Immagine</label>

          {form.immagineS3Path ? (
            <div>
              {/* Formato originale: larghezza = 100% della colonna, altezza auto */}
              <img
                src={form.immagineS3Path}
                alt="Anteprima evento"
                className="w-full h-auto rounded-xl border border-gray-200 shadow-sm block"
              />
              <div className="mt-3 flex items-center gap-2">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                    disabled={uploading}
                    onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }}
                    className="hidden"
                  />
                  <span className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors cursor-pointer text-sm">
                    <i className="fa-solid fa-rotate"></i>
                    Cambia immagine
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={uploading}
                  className="px-4 py-2 bg-white border border-gray-300 text-red-600 rounded-xl font-semibold hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer text-sm"
                  title="Rimuovi immagine"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
              {uploading && <p className="text-xs text-gray-500 mt-2">Caricamento...</p>}
            </div>
          ) : (
            <label
              onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setDragOver(true); }}
              onDragLeave={(e) => {
                // dragLeave spara anche quando entri nei figli — filtra verificando che stai
                // effettivamente uscendo dal contenitore
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                setDragOver(false);
              }}
              onDrop={handleImageDrop}
              className={`block border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
              } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                disabled={uploading}
                onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }}
                className="hidden"
              />
              <i className={`fa-solid fa-cloud-arrow-up text-4xl mb-3 ${dragOver ? 'text-blue-500' : 'text-gray-400'}`}></i>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                {dragOver ? 'Rilascia per caricare' : 'Trascina qui l\'immagine'}
              </p>
              <p className="text-xs text-gray-500">
                oppure <span className="text-blue-600 underline">clicca per sfogliare</span>
              </p>
              <p className="text-xs text-gray-400 mt-3">JPG, PNG, WebP, AVIF</p>
              {uploading && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  Caricamento...
                </div>
              )}
            </label>
          )}
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Colonna destra — Form                                             */}
        {/* --------------------------------------------------------------- */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <Input
          label="Titolo *"
          value={form.titolo}
          onChange={(e) => setForm((p) => ({ ...p, titolo: e.target.value }))}
          required
        />

        <Input
          label="Luogo"
          value={form.luogo}
          onChange={(e) => setForm((p) => ({ ...p, luogo: e.target.value }))}
          placeholder="es. Milano, Mediolanum Forum"
        />

        {/* Date */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Date *</label>
          <div className="space-y-2">
            {dates.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="date"
                  value={d.data}
                  onChange={(e) => updateDate(i, 'data', e.target.value)}
                  required
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="time"
                  value={d.ora}
                  onChange={(e) => updateDate(i, 'ora', e.target.value)}
                  className="w-32 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Orario"
                />
                {dates.length > 1 && (
                  <button type="button" onClick={() => removeDate(i)} className="text-red-500 hover:text-red-700 px-2 cursor-pointer">
                    <i className="fa-solid fa-times"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addDate}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <i className="fa-solid fa-plus"></i> Aggiungi data
          </button>
        </div>

        {/* Descrizioni IT/EN */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Descrizione (IT)</label>
          <textarea
            value={form.descrizioneIT}
            onChange={(e) => setForm((p) => ({ ...p, descrizioneIT: e.target.value }))}
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Descrizione (EN)</label>
          <textarea
            value={form.descrizioneEN}
            onChange={(e) => setForm((p) => ({ ...p, descrizioneEN: e.target.value }))}
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <Input
          label="Link biglietti"
          type="url"
          value={form.linkBiglietti}
          onChange={(e) => setForm((p) => ({ ...p, linkBiglietti: e.target.value }))}
          placeholder="https://..."
        />

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? 'Salvataggio...' : 'Salva'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/eventi')}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Annulla
          </button>
        </div>
        </form>
      </div>

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
                  Email già inviata il {new Date(emailSentAt).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}. Procedendo verrà inviata nuovamente.
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
                  rows={12}
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

export default EventDetail;
