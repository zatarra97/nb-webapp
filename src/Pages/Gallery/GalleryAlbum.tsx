import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPublicItem } from '../../services/api-utility';
import PublicLayout from '../../Components/PublicLayout';

const GalleryAlbum = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'EN' : 'IT';

  const [album, setAlbum] = useState<any>(null);
  const [selectedImg, setSelectedImg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!albumId) return;
    getPublicItem('photo-albums', albumId)
      .then(setAlbum)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [albumId]);

  const images = [...(album?.immagini ?? [])].sort((a: any, b: any) => a.ordine - b.ordine);

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-16">
        <div className="mb-10 flex items-center gap-4">
          <Link to="/gallery" className="text-gray-400 hover:text-gray-900 transition-colors">
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
              {t('gallery.back')}
            </p>
            <h1 className="text-3xl font-bold">{album?.nome ?? ''}</h1>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        )}

        {!loading && images.length === 0 && (
          <p className="text-gray-400 text-center py-16">{t('gallery.empty_images')}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img: any) => (
            <button
              key={img.publicId}
              onClick={() => setSelectedImg(img)}
              className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 cursor-pointer"
            >
              {img.s3Path ? (
                <img
                  src={img.s3Path}
                  alt={img.titolo || ''}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <i className="fa-solid fa-image text-3xl text-gray-300" />
                </div>
              )}
              {(img.titolo || img[`ruolo${lang}`]) && (
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-white text-xs font-medium truncate">
                    {img.titolo || img[`ruolo${lang}`]}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImg(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl cursor-pointer"
            onClick={() => setSelectedImg(null)}
          >
            <i className="fa-solid fa-times" />
          </button>
          <div
            className="max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedImg.s3Path && (
              <img
                src={selectedImg.s3Path}
                alt={selectedImg.titolo || ''}
                className="w-full max-h-[75vh] object-contain rounded-xl"
              />
            )}
            {(selectedImg.titolo || selectedImg[`ruolo${lang}`] || selectedImg[`con${lang}`] || selectedImg[`descrizione${lang}`]) && (
              <div className="mt-4 text-white text-center space-y-1">
                {selectedImg.titolo && <p className="font-semibold text-lg">{selectedImg.titolo}</p>}
                {selectedImg[`ruolo${lang}`] && <p className="text-white/70 text-sm">{selectedImg[`ruolo${lang}`]}</p>}
                {selectedImg[`con${lang}`] && <p className="text-white/60 text-sm">con {selectedImg[`con${lang}`]}</p>}
                {selectedImg[`descrizione${lang}`] && (
                  <p className="text-white/60 text-xs mt-2 max-w-lg mx-auto">{selectedImg[`descrizione${lang}`]}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </PublicLayout>
  );
};

export default GalleryAlbum;
