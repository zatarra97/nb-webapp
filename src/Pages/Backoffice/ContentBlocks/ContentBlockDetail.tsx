import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { adminCreate, adminUpdate, adminGetItem } from '../../../services/api-utility';
import Input from '../../../Components/Input';

const SEZIONI = ['about-me'];

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------
const Toolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const btn = (label: string, action: () => void, active?: boolean) => (
    <button
      type="button"
      onClick={action}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
        active ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-1 border border-gray-200 rounded-t-lg bg-gray-50 px-2 py-1.5">
      {btn('B', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
      {btn('I', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
      {btn('S', () => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'))}
      <span className="w-px bg-gray-300 mx-1" />
      {btn('H1', () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }))}
      {btn('H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
      {btn('H3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }))}
      <span className="w-px bg-gray-300 mx-1" />
      {btn('• Lista', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
      {btn('1. Lista', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
      <span className="w-px bg-gray-300 mx-1" />
      {btn('❝ Cita', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'))}
      {btn('—', () => editor.chain().focus().setHorizontalRule().run())}
      <span className="w-px bg-gray-300 mx-1" />
      {btn('↩', () => editor.chain().focus().undo().run())}
      {btn('↪', () => editor.chain().focus().redo().run())}
    </div>
  );
};

// ---------------------------------------------------------------------------
// RichEditor — wrapper attorno a TipTap
// ---------------------------------------------------------------------------
const RichEditor = ({ value, onChange, label }: { value: string; onChange: (html: string) => void; label: string }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync value when it changes externally (e.g. data load)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  return (
    <div>
      <label className="block text-gray-700 text-sm font-bold mb-1">{label}</label>
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="border border-t-0 border-gray-200 rounded-b-lg min-h-[160px] px-3 py-2 text-sm text-gray-800 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 [&_.ProseMirror]:outline-none [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-gray-300 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_hr]:border-gray-300 [&_.ProseMirror_p]:mb-2"
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// ContentBlockDetail
// ---------------------------------------------------------------------------
const ContentBlockDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [sezione, setSezione] = useState('about-me');
  const [titoloIT, setTitoloIT] = useState('');
  const [titoloEN, setTitoloEN] = useState('');
  const [contenutoIT, setContenutoIT] = useState('');
  const [contenutoEN, setContenutoEN] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'it' | 'en'>('it');

  useEffect(() => {
    if (isNew) return;
    adminGetItem('content-blocks', id!)
      .then((data) => {
        setSezione(data.sezione || 'about-me');
        setTitoloIT(data.titoloIT || '');
        setTitoloEN(data.titoloEN || '');
        setContenutoIT(data.contenutoIT || '');
        setContenutoEN(data.contenutoEN || '');
      })
      .catch(() => toast.error('Errore nel caricamento'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { sezione, titoloIT: titoloIT || null, titoloEN: titoloEN || null, contenutoIT: contenutoIT || null, contenutoEN: contenutoEN || null };
      if (isNew) {
        await adminCreate('content-blocks', payload);
      } else {
        await adminUpdate('content-blocks', id!, payload);
      }
      toast.success('Blocco salvato');
      navigate('/admin/contenuti');
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
    <div className="container mx-auto px-6 py-8 max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate('/admin/contenuti')} className="text-gray-500 hover:text-gray-900 cursor-pointer">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'Nuovo blocco' : 'Modifica blocco'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        {/* Sezione */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Sezione *</label>
          <select
            value={sezione}
            onChange={(e) => setSezione(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {SEZIONI.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Tab IT / EN */}
        <div>
          <div className="flex gap-1 mb-4 border-b border-gray-200">
            {(['it', 'en'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
                  activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {activeTab === 'it' && (
            <div className="space-y-4">
              <Input label="Titolo (IT)" value={titoloIT} onChange={(e) => setTitoloIT(e.target.value)} placeholder="Titolo opzionale" />
              <RichEditor label="Contenuto (IT)" value={contenutoIT} onChange={setContenutoIT} />
            </div>
          )}
          {activeTab === 'en' && (
            <div className="space-y-4">
              <Input label="Titolo (EN)" value={titoloEN} onChange={(e) => setTitoloEN(e.target.value)} placeholder="Optional title" />
              <RichEditor label="Contenuto (EN)" value={contenutoEN} onChange={setContenutoEN} />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer">
            {saving ? 'Salvataggio...' : 'Salva'}
          </button>
          <button type="button" onClick={() => navigate('/admin/contenuti')}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentBlockDetail;
