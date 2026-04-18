import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getPublicList } from '../../services/api-utility';
import PublicLayout from '../../Components/PublicLayout';

const About = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'EN' : 'IT';
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicList('content-blocks?sezione=about-me')
      .then(setBlocks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <section className="py-20">
        <div className="container mx-auto px-3 md:px-6 max-w-3xl">
          {loading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
            </div>
          )}

          <div className="space-y-12">
            {blocks.map((block, idx) => {
              const titolo = lang === 'EN' ? block.titoloEN || block.titoloIT : block.titoloIT || block.titoloEN;
              const contenuto = lang === 'EN' ? block.contenutoEN || block.contenutoIT : block.contenutoIT || block.contenutoEN;
              return (
                <div key={block.publicId}>
                  {titolo && (
                    <h1 className={`font-bold tracking-tight text-gray-900 mb-6 ${idx === 0 ? 'text-4xl mb-10' : 'text-2xl'}`}>
                      {titolo}
                    </h1>
                  )}
                  {contenuto && (
                    <div
                      className="rich-content text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: contenuto }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default About;
