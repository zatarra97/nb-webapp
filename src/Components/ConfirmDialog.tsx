import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// ConfirmDialog — modale di conferma riutilizzabile con API Promise-based
//
// Uso tipico dentro un handler:
//
//   const confirm = useConfirmDialog();
//   const ok = await confirm({
//     title: "Eliminare l'evento?",
//     description: <>Stai per eliminare <strong>"{x.titolo}"</strong>.</>,
//     confirmLabel: 'Elimina',
//     variant: 'danger',
//   });
//   if (!ok) return;
//   await adminDelete(...);
//
// Il provider va montato una sola volta nell'albero React (vedi App.tsx).
// Il dialog gestisce ESC per annullare, autofocus sul bottone di conferma,
// chiusura al click sul backdrop.
// ---------------------------------------------------------------------------

export type ConfirmVariant = 'danger' | 'warning' | 'default';

export interface ConfirmOptions {
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmDialogContext = createContext<ConfirmFn | null>(null);

interface Pending {
  options: ConfirmOptions;
  resolve: (ok: boolean) => void;
}

export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pending, setPending] = useState<Pending | null>(null);

  const confirm = useCallback<ConfirmFn>((options) =>
    new Promise<boolean>((resolve) => {
      setPending({ options, resolve });
    }), []);

  const close = (ok: boolean) => {
    if (!pending) return;
    pending.resolve(ok);
    setPending(null);
  };

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      {pending && <ConfirmDialog options={pending.options} onResult={close} />}
    </ConfirmDialogContext.Provider>
  );
};

export function useConfirmDialog(): ConfirmFn {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) throw new Error('useConfirmDialog deve essere usato dentro ConfirmDialogProvider');
  return ctx;
}

// ---------------------------------------------------------------------------
// Componente presentazionale
// ---------------------------------------------------------------------------
interface ConfirmDialogProps {
  options: ConfirmOptions;
  onResult: (ok: boolean) => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ options, onResult }) => {
  const { title, description, confirmLabel = 'Conferma', cancelLabel = 'Annulla', variant = 'default' } = options;
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onResult(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    // Blocca lo scroll del body mentre il dialog è aperto
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onResult]);

  const iconBg = variant === 'danger'
    ? 'bg-red-100 text-red-600'
    : variant === 'warning'
      ? 'bg-amber-100 text-amber-600'
      : 'bg-blue-100 text-blue-600';

  const confirmBtn = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : variant === 'warning'
      ? 'bg-amber-600 hover:bg-amber-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white';

  const icon = variant === 'danger' ? 'fa-triangle-exclamation'
    : variant === 'warning' ? 'fa-circle-exclamation'
    : 'fa-circle-question';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? 'confirm-dialog-description' : undefined}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50" onClick={() => onResult(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
              <i className={`fa-solid ${icon} text-lg`} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 id="confirm-dialog-title" className="text-lg font-bold text-gray-900 mb-1">
                {title}
              </h2>
              {description && (
                <div id="confirm-dialog-description" className="text-sm text-gray-600 leading-relaxed">
                  {description}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={() => onResult(false)}
            className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmRef}
            onClick={() => onResult(true)}
            className={`px-5 py-2 rounded-xl font-semibold transition-colors cursor-pointer ${confirmBtn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
