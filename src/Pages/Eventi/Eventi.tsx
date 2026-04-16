import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getPublicList } from '../../services/api-utility';
import PublicLayout from '../../Components/PublicLayout';

const Eventi = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'EN' : 'IT';

  const [eventi, setEventi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicList('events')
      .then(setEventi)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' });

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return null;
    return timeStr.slice(0, 5);
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">{t('eventi.title')}</h1>
          <p className="text-gray-500">{t('eventi.subtitle')}</p>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        )}

        {!loading && eventi.length === 0 && (
          <p className="text-gray-400 text-center py-16">{t('eventi.empty')}</p>
        )}

        <div className="space-y-8">
          {eventi.map((ev) => {
            const dates = [...(ev.dates ?? [])].sort(
              (a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime()
            );
            const desc = lang === 'EN' ? ev.descrizioneEN || ev.descrizioneIT : ev.descrizioneIT || ev.descrizioneEN;

            return (
              <article key={ev.publicId} className="flex flex-col md:flex-row gap-6 border border-gray-100 rounded-2xl overflow-hidden">
                {ev.immagineS3Path && (
                  <img
                    src={ev.immagineS3Path}
                    alt={ev.titolo}
                    className="w-full md:w-64 h-52 md:h-auto object-cover flex-shrink-0"
                  />
                )}
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">{ev.titolo}</h2>
                    {dates.length > 0 && (
                      <ul className="space-y-1 mb-4">
                        {dates.map((d: any, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                            <i className="fa-regular fa-calendar text-gray-400 w-4" />
                            <span>{formatDate(d.data)}</span>
                            {d.ora && (
                              <>
                                <i className="fa-regular fa-clock text-gray-400 w-4 ml-2" />
                                <span>{formatTime(d.ora)}</span>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    {desc && <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>}
                  </div>
                  {ev.linkBiglietti && (
                    <a
                      href={ev.linkBiglietti}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors w-fit"
                    >
                      <i className="fa-solid fa-ticket" />
                      {t('eventi.tickets')}
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
};

export default Eventi;
