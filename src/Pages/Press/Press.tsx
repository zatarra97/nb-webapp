import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getPublicList } from '../../services/api-utility';
import PublicLayout from '../../Components/PublicLayout';

const Press = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'EN' : 'IT';

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicList('press')
      .then(setArticles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">{t('press.title')}</h1>
          <p className="text-gray-500">{t('press.subtitle')}</p>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        )}

        {!loading && articles.length === 0 && (
          <p className="text-gray-400 text-center py-16">{t('press.empty')}</p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {articles.map((article) => {
            const citazione =
              lang === 'EN'
                ? article.citazioneEN || article.citazioneIT
                : article.citazioneIT || article.citazioneEN;

            return (
              <div key={article.publicId} className="border border-gray-100 rounded-2xl p-6 flex flex-col justify-between gap-4">
                <blockquote className="text-gray-700 italic leading-relaxed text-sm">
                  {citazione ? `"${citazione}"` : ''}
                </blockquote>
                <div>
                  <p className="font-bold text-gray-900 text-sm uppercase tracking-widest">
                    {article.nomeTestata}
                  </p>
                  {article.nomeGiornalista && (
                    <p className="text-xs text-gray-400 mt-0.5">{article.nomeGiornalista}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
};

export default Press;
