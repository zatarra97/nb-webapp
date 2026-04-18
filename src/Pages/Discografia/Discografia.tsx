import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getPublicList } from '../../services/api-utility';
import PublicLayout from '../../Components/PublicLayout';

const PLATFORM_ICONS: Record<string, string> = {
  spotify: 'fa-brands fa-spotify',
  apple: 'fa-brands fa-apple',
  youtube: 'fa-brands fa-youtube',
  amazon: 'fa-brands fa-amazon',
  deezer: 'fa-solid fa-music',
  tidal: 'fa-solid fa-water',
};

const Discografia = () => {
  const { t } = useTranslation();
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicList('music-albums')
      .then(setAlbums)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <div className="container mx-auto px-3 md:px-6 py-16 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">{t('discografia.title')}</h1>
          <p className="text-gray-500">{t('discografia.subtitle')}</p>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        )}

        {!loading && albums.length === 0 && (
          <p className="text-gray-400 text-center py-16">{t('discografia.empty')}</p>
        )}

        <div className="space-y-8">
          {albums.map((album) => {
            const links: Record<string, string> = album.streamingLinks ?? {};
            const linkEntries = Object.entries(links);

            return (
              <div key={album.publicId} className="flex flex-col sm:flex-row gap-6 border border-gray-100 rounded-2xl overflow-hidden p-6">
                {/* Copertina */}
                <div className="flex-shrink-0">
                  {album.fotoS3Path ? (
                    <img
                      src={album.fotoS3Path}
                      alt={album.titolo}
                      className="w-36 h-36 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-36 h-36 bg-gray-100 rounded-xl flex items-center justify-center">
                      <i className="fa-solid fa-music text-3xl text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{album.titolo}</h2>

                  {/* Streaming links */}
                  {linkEntries.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                        {t('discografia.listen_on')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {linkEntries.map(([platform, url]) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            {PLATFORM_ICONS[platform.toLowerCase()] && (
                              <i className={PLATFORM_ICONS[platform.toLowerCase()]} />
                            )}
                            {t(`discografia.streaming.${platform.toLowerCase()}`, { defaultValue: platform })}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Audio preview */}
                  {album.audioPreviewS3Path && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                        {t('discografia.preview')}
                      </p>
                      <audio controls className="w-full max-w-sm h-9">
                        <source src={album.audioPreviewS3Path} />
                      </audio>
                    </div>
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

export default Discografia;
