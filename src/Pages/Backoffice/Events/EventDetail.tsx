import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminCreate, adminUpdate, adminGetItem, getUploadUrl, uploadToS3 } from '../../../services/api-utility';
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
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form, setForm] = useState<FormState>({
    titolo: '', immagineS3Path: '', descrizioneIT: '', descrizioneEN: '', linkBiglietti: '',
  });
  const [dates, setDates] = useState<EventDate[]>([{ data: '', ora: '' }]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isNew) return;
    adminGetItem('events', id!).then((data) => {
      setForm({
        titolo: data.titolo || '',
        immagineS3Path: data.immagineS3Path || '',
        descrizioneIT: data.descrizioneIT || '',
        descrizioneEN: data.descrizioneEN || '',
        linkBiglietti: data.linkBiglietti || '',
      });
      setDates(
        data.dates?.length
          ? data.dates.map((d: any) => ({ data: d.data || '', ora: d.ora || '' }))
          : [{ data: '', ora: '' }]
      );
    }).catch(() => toast.error('Errore nel caricamento'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const addDate = () => setDates((prev) => [...prev, { data: '', ora: '' }]);
  const removeDate = (i: number) => setDates((prev) => prev.filter((_, idx) => idx !== i));
  const updateDate = (i: number, field: keyof EventDate, value: string) => {
    setDates((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)));
  };

  const handleImageUpload = async (file: File) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate('/admin/eventi')} className="text-gray-500 hover:text-gray-900 cursor-pointer">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'Nuovo evento' : 'Modifica evento'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <Input
          label="Titolo *"
          value={form.titolo}
          onChange={(e) => setForm((p) => ({ ...p, titolo: e.target.value }))}
          required
        />

        {/* Immagine */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Immagine</label>
          {form.immagineS3Path && (
            <img src={form.immagineS3Path} alt="Anteprima" className="w-full h-48 object-cover rounded-lg mb-3" />
          )}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            disabled={uploading}
            onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }}
            className="block text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          {uploading && <p className="text-xs text-gray-500 mt-1">Caricamento...</p>}
        </div>

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
  );
};

export default EventDetail;
