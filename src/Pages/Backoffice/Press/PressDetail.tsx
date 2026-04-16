import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminCreate, adminUpdate, adminGetItem } from '../../../services/api-utility';
import Input from '../../../Components/Input';

interface FormState {
  nomeTestata: string;
  citazioneIT: string;
  citazioneEN: string;
  nomeGiornalista: string;
  ordine: number;
}

const PressDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form, setForm] = useState<FormState>({
    nomeTestata: '', citazioneIT: '', citazioneEN: '', nomeGiornalista: '', ordine: 0,
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    adminGetItem('press', id!).then((data) => {
      setForm({
        nomeTestata: data.nomeTestata || '',
        citazioneIT: data.citazioneIT || '',
        citazioneEN: data.citazioneEN || '',
        nomeGiornalista: data.nomeGiornalista || '',
        ordine: data.ordine ?? 0,
      });
    }).catch(() => toast.error('Errore nel caricamento'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nomeTestata.trim()) { toast.error('Il nome della testata è obbligatorio'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        nomeGiornalista: form.nomeGiornalista || null,
        citazioneIT: form.citazioneIT || null,
        citazioneEN: form.citazioneEN || null,
      };
      if (isNew) {
        await adminCreate('press', payload);
      } else {
        await adminUpdate('press', id!, payload);
      }
      toast.success('Articolo salvato');
      navigate('/admin/press');
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
        <button onClick={() => navigate('/admin/press')} className="text-gray-500 hover:text-gray-900 cursor-pointer">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'Nuovo articolo press' : 'Modifica articolo press'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <Input
          label="Nome testata *"
          value={form.nomeTestata}
          onChange={(e) => setForm((p) => ({ ...p, nomeTestata: e.target.value }))}
          required
        />

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Citazione (IT)</label>
          <textarea
            value={form.citazioneIT}
            onChange={(e) => setForm((p) => ({ ...p, citazioneIT: e.target.value }))}
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Citazione (EN)</label>
          <textarea
            value={form.citazioneEN}
            onChange={(e) => setForm((p) => ({ ...p, citazioneEN: e.target.value }))}
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <Input
          label="Nome giornalista"
          value={form.nomeGiornalista}
          onChange={(e) => setForm((p) => ({ ...p, nomeGiornalista: e.target.value }))}
        />

        <Input
          label="Ordine di visualizzazione"
          type="number"
          value={String(form.ordine)}
          onChange={(e) => setForm((p) => ({ ...p, ordine: Number(e.target.value) || 0 }))}
        />

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer">
            {saving ? 'Salvataggio...' : 'Salva'}
          </button>
          <button type="button" onClick={() => navigate('/admin/press')} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
};

export default PressDetail;
