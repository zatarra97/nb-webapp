import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getPublicList, downloadFileAs } from '../../services/api-utility';
import PublicLayout from '../../Components/PublicLayout';

interface DownloadImage {
  publicId: string;
  titolo: string;
  s3Path?: string;
  anno?: number;
  credit?: string;
  risoluzione?: string;
}

const Gallery = () => {
  const { t } = useTranslation();
  const [albums, setAlbums] = useState<any[]>([]);
  const [downloadImages, setDownloadImages] = useState<DownloadImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getPublicList('photo-albums').then(setAlbums).catch(() => {}),
      getPublicList('public-download-images').then(setDownloadImages).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleDownload = async (img: DownloadImage) => {
    if (!img.s3Path) return;
    setDownloadingId(img.publicId);
    try {
      // Estrai estensione dall'URL S3
      const match = img.s3Path.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
      const ext = match?.[1] || 'jpg';
      const yearPart = img.anno ? `-${img.anno}` : '';
      const filename = `${slugify(img.titolo)}${yearPart}.${ext}`;
      await downloadFileAs(img.s3Path, filename);
    } catch {
      toast.error(t('gallery.download_error'));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-3 md:px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">{t('gallery.title')}</h1>
          <p className="text-gray-500">{t('gallery.subtitle')}</p>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Album fotografici                                                  */}
        {/* ----------------------------------------------------------------- */}
        {!loading && albums.length === 0 && downloadImages.length === 0 && (
          <p className="text-gray-400 text-center py-16">{t('gallery.empty')}</p>
        )}

        {albums.length > 0 && (
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
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Immagini per il download (stampa / giornalisti)                    */}
        {/* ----------------------------------------------------------------- */}
        {downloadImages.length > 0 && (
          <section className="mt-20">
            <div className="mb-8 border-t border-gray-200 pt-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('gallery.download_title')}</h2>
              <p className="text-gray-500 text-sm">{t('gallery.download_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {downloadImages.map((img) => (
                <figure
                  key={img.publicId}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col"
                >
                  {img.s3Path ? (
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                      <img src={img.s3Path} alt={img.titolo} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                      <i className="fa-solid fa-image text-4xl text-gray-300" />
                    </div>
                  )}

                  <figcaption className="p-4 flex flex-col gap-2 flex-1">
                    <div>
                      <p className="font-semibold text-gray-900 leading-tight">
                        {img.titolo}
                        {img.risoluzione && (
                          <span className="font-normal text-gray-500"> ({img.risoluzione})</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {[img.anno, img.credit].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownload(img)}
                      disabled={!img.s3Path || downloadingId === img.publicId}
                      className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {downloadingId === img.publicId ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          {t('gallery.downloading')}
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-download" />
                          {t('gallery.download_button')}
                        </>
                      )}
                    </button>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  );
};

export default Gallery;
