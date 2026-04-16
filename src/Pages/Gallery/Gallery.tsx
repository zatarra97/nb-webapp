import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPublicList } from '../../services/api-utility';
import PublicLayout from '../../Components/PublicLayout';

const Gallery = () => {
  const { t } = useTranslation();
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicList('photo-albums')
      .then(setAlbums)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">{t('gallery.title')}</h1>
          <p className="text-gray-500">{t('gallery.subtitle')}</p>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        )}

        {!loading && albums.length === 0 && (
          <p className="text-gray-400 text-center py-16">{t('gallery.empty')}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {albums.map((album) => {
            const cover = [...(album.immagini ?? [])].sort(
              (a: any, b: any) => a.ordine - b.ordine
            )[0];

            return (
              <Link
                key={album.publicId}
                to={`/gallery/${album.publicId}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 block"
              >
                {cover?.s3Path ? (
                  <img
                    src={cover.s3Path}
                    alt={album.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fa-solid fa-image text-4xl text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
                  <div>
                    <p className="text-white font-semibold text-lg">{album.nome}</p>
                    {album.immagini && (
                      <p className="text-white/70 text-xs mt-0.5">{album.immagini.length} foto</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
};

export default Gallery;
