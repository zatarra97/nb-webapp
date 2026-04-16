import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPublicList } from '../../services/api-utility';
import PublicLayout from '../../Components/PublicLayout';

const Home = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'EN' : 'IT';

  const [eventi, setEventi] = useState<any[]>([]);
  const [press, setPress] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [musicAlbums, setMusicAlbums] = useState<any[]>([]);

  useEffect(() => {
    getPublicList('events').then((d) => setEventi(d.slice(0, 3))).catch(() => {});
    getPublicList('press').then((d) => setPress(d.slice(0, 3))).catch(() => {});
    getPublicList('photo-albums').then((d) => setAlbums(d.slice(0, 4))).catch(() => {});
    getPublicList('music-albums').then((d) => setMusicAlbums(d.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="py-32 text-center border-b border-gray-100">
        <h1 className="text-6xl font-bold tracking-tight mb-3">NB</h1>
        <p className="text-lg text-gray-500 tracking-widest uppercase">{t('home.hero_subtitle')}</p>
      </section>

      {/* Prossimi eventi */}
      {eventi.length > 0 && (
        <section className="py-16 border-b border-gray-100">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{t('home.section_eventi')}</h2>
              <Link to="/eventi" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                {t('home.view_all')} →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {eventi.map((ev) => {
                const nextDate = ev.dates?.sort((a: any, b: any) =>
                  new Date(a.data).getTime() - new Date(b.data).getTime()
                )[0];
                return (
                  <div key={ev.publicId} className="border border-gray-100 rounded-2xl overflow-hidden">
                    {ev.immagineS3Path && (
                      <img src={ev.immagineS3Path} alt={ev.titolo} className="w-full h-44 object-cover" />
                    )}
                    <div className="p-4">
                      <p className="text-xs text-gray-400 mb-1">
                        {nextDate ? new Date(nextDate.data).toLocaleDateString(i18n.language) : ''}
                      </p>
                      <h3 className="font-semibold text-gray-900">{ev.titolo}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Press */}
      {press.length > 0 && (
        <section className="py-16 bg-gray-50 border-b border-gray-100">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{t('home.section_press')}</h2>
              <Link to="/press" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                {t('home.view_all')} →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {press.map((p) => (
                <div key={p.publicId} className="bg-white rounded-2xl border border-gray-100 p-6">
                  <p className="text-sm italic text-gray-600 mb-4 line-clamp-4">
                    "{lang === 'EN' ? p.citazioneEN || p.citazioneIT : p.citazioneIT || p.citazioneEN}"
                  </p>
                  <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">{p.nomeTestata}</p>
                  {p.nomeGiornalista && <p className="text-xs text-gray-400">{p.nomeGiornalista}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {albums.length > 0 && (
        <section className="py-16 border-b border-gray-100">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{t('home.section_gallery')}</h2>
              <Link to="/gallery" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                {t('home.view_all')} →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {albums.map((album) => {
                const cover = album.immagini?.sort((a: any, b: any) => a.ordine - b.ordine)[0];
                return (
                  <Link key={album.publicId} to={`/gallery/${album.publicId}`} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                    {cover?.s3Path ? (
                      <img src={cover.s3Path} alt={album.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="fa-solid fa-image text-3xl text-gray-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-white text-sm font-medium">{album.nome}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Discografia */}
      {musicAlbums.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{t('home.section_discografia')}</h2>
              <Link to="/discografia" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                {t('home.view_all')} →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {musicAlbums.map((album) => (
                <div key={album.publicId} className="flex gap-4 items-center border border-gray-100 rounded-2xl p-4">
                  {album.fotoS3Path ? (
                    <img src={album.fotoS3Path} alt={album.titolo} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-music text-gray-300" />
                    </div>
                  )}
                  <p className="font-semibold text-gray-900">{album.titolo}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  );
};

export default Home;
