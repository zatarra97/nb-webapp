import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPublicList } from '../../services/api-utility';
import PublicLayout from '../../Components/PublicLayout';

const MONTHS_IT = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_IT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Home = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'EN' : 'IT';

  const [eventi, setEventi] = useState<any[]>([]);
  const [press, setPress] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [musicAlbums, setMusicAlbums] = useState<any[]>([]);
  const [showAllMusic, setShowAllMusic] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  useEffect(() => {
    getPublicList('events').then(setEventi).catch(() => {});
    getPublicList('press').then(setPress).catch(() => {});
    getPublicList('photo-albums').then((d) => setAlbums(d.slice(0, 4))).catch(() => {});
    getPublicList('music-albums').then(setMusicAlbums).catch(() => {});
  }, []);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  };

  // Map dateStr (YYYY-MM-DD) → list of {event, date}
  const eventsByDate = eventi.reduce<Record<string, { ev: any; date: any }[]>>((acc, ev) => {
    ev.dates?.forEach((d: any) => {
      if (!acc[d.data]) acc[d.data] = [];
      acc[d.data].push({ ev, date: d });
    });
    return acc;
  }, {});

  // Calendar grid
  const firstDow = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  const startOffset = firstDow === 0 ? 6 : firstDow - 1; // Mon=0
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const day = i - startOffset + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const monthNames = lang === 'EN' ? MONTHS_EN : MONTHS_IT;
  const dayNames = lang === 'EN' ? DAYS_EN : DAYS_IT;

  const description = selectedEvent
    ? (lang === 'EN'
      ? selectedEvent.descrizioneEN || selectedEvent.descrizioneIT
      : selectedEvent.descrizioneIT || selectedEvent.descrizioneEN)
    : null;

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="py-32 text-center border-b border-gray-100">
        <h1 className="text-6xl font-bold tracking-tight mb-3">NB</h1>
        <p className="text-lg text-gray-500 tracking-widest uppercase">{t('home.hero_subtitle')}</p>
      </section>

      {/* Album musicali */}
      {musicAlbums.length > 0 && (
        <section className="py-20 border-b border-gray-100 bg-gray-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.04)_0%,_transparent_60%)] pointer-events-none" />
          <div className="container mx-auto px-6 relative max-w-3xl">
            <h2 className="text-3xl font-bold text-white text-center mb-10">Album</h2>
            <div className="space-y-4">
              {(showAllMusic ? musicAlbums : musicAlbums.slice(0, 3)).map((album) => (
                <div key={album.publicId} className="group flex gap-6 items-center bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/20 rounded-2xl p-5 transition-all duration-200">
                  {album.fotoS3Path ? (
                    <img src={album.fotoS3Path} alt={album.titolo} className="w-24 h-24 rounded-xl object-cover flex-shrink-0 shadow-lg" />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-music text-white/30 text-2xl" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-white mb-3">{album.titolo}</p>
                    {album.streamingLinks && Object.keys(album.streamingLinks).length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(album.streamingLinks).map(([platform, url]) => (
                          <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-lg px-3 py-1.5 transition-all capitalize">
                            {platform}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!showAllMusic && musicAlbums.length > 3 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAllMusic(true)}
                  className="text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl px-6 py-2.5 transition-all cursor-pointer"
                >
                  Mostra altri {musicAlbums.length - 3}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Calendario eventi */}
      {eventi.length > 0 && (
        <section className="py-16 border-b border-gray-100">
          <div className="container mx-auto px-6 max-w-5xl">
            {/* Header mese */}
            <div className="flex items-center justify-between mb-8">
              <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <i className="fa-solid fa-chevron-left text-gray-500 text-sm" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                {monthNames[calMonth]} {calYear}
              </h2>
              <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <i className="fa-solid fa-chevron-right text-gray-500 text-sm" />
              </button>
            </div>

            {/* Intestazione giorni settimana */}
            <div className="grid grid-cols-7 mb-1">
              {dayNames.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase py-2 tracking-wide">
                  {d}
                </div>
              ))}
            </div>

            {/* Griglia giorni */}
            <div className="grid grid-cols-7 border-l border-t border-gray-100 rounded-xl overflow-hidden">
              {cells.map((day, i) => {
                const dateStr = day
                  ? `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  : null;
                const dayEntries = dateStr ? (eventsByDate[dateStr] ?? []) : [];
                const isToday = dateStr === todayStr;
                return (
                  <div
                    key={i}
                    className={`min-h-[110px] border-r border-b border-gray-100 p-1.5 ${!day ? 'bg-gray-50/60' : ''}`}
                  >
                    {day && (
                      <>
                        <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                          isToday ? 'bg-gray-900 text-white' : 'text-gray-400'
                        }`}>
                          {day}
                        </span>
                        <div className="space-y-0.5">
                          {dayEntries.map(({ ev, date }, j) => (
                            <button
                              key={j}
                              onClick={() => setSelectedEvent(ev)}
                              className="w-full text-left rounded-md px-1.5 py-1 bg-gray-900 hover:bg-gray-700 transition-colors cursor-pointer group"
                            >
                              {date.ora && (
                                <span className="text-[10px] text-gray-400 group-hover:text-gray-300 block leading-none mb-0.5">
                                  {date.ora.slice(0, 5)}
                                </span>
                              )}
                              <span className="text-[11px] text-white font-medium block truncate leading-tight">
                                {ev.titolo}
                              </span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Press */}
      {press.length > 0 && (
        <section className="py-20 border-b border-gray-100 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative container mx-auto px-6">
            <div className="mb-10">
              <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">{t('home.section_press')}</p>
              <h2 className="text-3xl font-bold text-white">{t('press.subtitle')}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {press.map((p) => {
                const citazione = lang === 'EN' ? p.citazioneEN || p.citazioneIT : p.citazioneIT || p.citazioneEN;
                return (
                  <div key={p.publicId} className="bg-white/8 backdrop-blur border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
                    <p className="text-xs font-bold text-white uppercase tracking-widest">{p.nomeTestata}</p>
                    {citazione && (
                      <p className="text-sm text-gray-300 italic leading-relaxed flex-1">
                        <span className="text-2xl text-white/30 font-serif leading-none mr-1">"</span>
                        {citazione}
                        <span className="text-2xl text-white/30 font-serif leading-none ml-1">"</span>
                      </p>
                    )}
                    {p.nomeGiornalista && (
                      <p className="text-xs text-gray-500 mt-auto">— {p.nomeGiornalista}</p>
                    )}
                  </div>
                );
              })}
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

      {/* Modale evento */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pulsante chiudi */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-times text-white text-sm" />
            </button>

            {selectedEvent.immagineS3Path && (
              <img
                src={selectedEvent.immagineS3Path}
                alt={selectedEvent.titolo}
                className="w-full h-52 object-cover rounded-t-2xl"
              />
            )}

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedEvent.titolo}</h3>

              {/* Date */}
              {selectedEvent.dates?.length > 0 && (
                <div className="mb-4 space-y-1.5">
                  {[...selectedEvent.dates]
                    .sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime())
                    .map((d: any, i: number) => (
                      <p key={i} className="text-sm text-gray-600 flex items-center gap-2">
                        <i className="fa-regular fa-calendar text-gray-400 w-4" />
                        <span>
                          {new Date(d.data + 'T00:00:00').toLocaleDateString(i18n.language, {
                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                          })}
                          {d.ora && <span className="ml-2 text-gray-500 font-medium">{d.ora.slice(0, 5)}</span>}
                        </span>
                      </p>
                    ))}
                </div>
              )}

              {/* Descrizione */}
              {description && (
                <p className="text-sm text-gray-700 leading-relaxed mb-5 whitespace-pre-line">{description}</p>
              )}

              {/* Link biglietti */}
              {selectedEvent.linkBiglietti && (
                <a
                  href={selectedEvent.linkBiglietti}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <i className="fa-solid fa-ticket text-xs" />
                  {t('eventi.tickets')}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
};

export default Home;
