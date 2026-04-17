import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import PublicLayout from '../../Components/PublicLayout';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const Disiscrizione = () => {
  const [params] = useSearchParams();
  const { t } = useTranslation();
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); return; }
    axios.delete(`${BACKEND_URL}/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <PublicLayout>
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          {status === 'loading' && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto" />
          )}
          {status === 'ok' && (
            <>
              <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-envelope-open text-xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('newsletter.unsubscribed_title')}</h1>
              <p className="text-gray-500 text-sm mb-6">{t('newsletter.unsubscribed_body')}</p>
              <Link to="/" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">
                ← {t('nav.home')}
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-times text-xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('newsletter.error_title')}</h1>
              <p className="text-gray-500 text-sm mb-6">{t('newsletter.error_body')}</p>
              <Link to="/" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">
                ← {t('nav.home')}
              </Link>
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default Disiscrizione;
