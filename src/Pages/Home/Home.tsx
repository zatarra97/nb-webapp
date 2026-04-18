import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { getPublicList } from '../../services/api-utility';
import PublicLayout from '../../Components/PublicLayout';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const MONTHS_IT = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_IT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SectionLabel = ({ label }: { label: string }) => (
  <div className="flex items-center gap-4 mb-10">
    <div className="flex-1 h-px bg-black" />
    <span className="text-[11px] font-bold tracking-[0.25em] uppercase">{label}</span>
    <div className="flex-1 h-px bg-black" />
  </div>
);

const Home = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'EN' : 'IT';

  const [eventi, setEventi] = useState<any[]>([]);
  const [press, setPress] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [musicAlbums, setMusicAlbums] = useState<any[]>([]);
  const [showAllMusic, setShowAllMusic] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus('loading');
    try {
      await axios.post(`${BACKEND_URL}/subscribe`, { email: newsletterEmail });
      setNewsletterStatus('ok');
      setNewsletterEmail('');
    } catch {
      setNewsletterStatus('error');
    }
  };

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

  const eventsByDate = eventi.reduce<Record<string, { ev: any; date: any }[]>>((acc, ev) => {
    ev.dates?.forEach((d: any) => {
      if (!acc[d.data]) acc[d.data] = [];
      acc[d.data].push({ ev, date: d });
    });
    return acc;
  }, {});

  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const startOffset = firstDow === 0 ? 6 : firstDow - 1;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const day = i - startOffset + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const monthNames = lang === 'EN' ? MONTHS_EN : MONTHS_IT;
  const dayNames = lang === 'EN' ? DAYS_EN : DAYS_IT;

  // Lista piatta eventi del mese selezionato (per vista mobile)
  const monthEvents = eventi
    .flatMap((ev) => (ev.dates || []).map((d: any) => ({ ev, date: d })))
    .filter(({ date }) => {
      const [y, m] = date.data.split('-').map(Number);
      return y === calYear && m === calMonth + 1;
    })
    .sort((a, b) => a.date.data.localeCompare(b.date.data) || (a.date.ora || '').localeCompare(b.date.ora || ''));

  const description = selectedEvent
    ? (lang === 'EN'
      ? selectedEvent.descrizioneEN || selectedEvent.descrizioneIT
      : selectedEvent.descrizioneIT || selectedEvent.descrizioneEN)
    : null;

  return (
    <PublicLayout>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="border-b-2 border-black">
        <div className="py-16 text-center px-3 md:px-6">
          <h1 className="text-[100px] leading-none font-black tracking-tight">NB</h1>
        </div>
      </section>

      {/* ── ALBUM MUSICALI ───────────────────────────────────────────────── */}
      {musicAlbums.length > 0 && (
        <section className="py-16 border-b-2 border-black">
          <div className="container mx-auto px-3 md:px-6">
            <SectionLabel label={t('home.section_music') || 'Discografia'} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-black bg-black">
              {(showAllMusic ? musicAlbums : musicAlbums.slice(0, 4)).map((album) => (
                <div
                  key={album.publicId}
                  className="flex gap-5 items-center p-5 bg-white hover:bg-gray-50 transition-colors"
                >
                  {album.fotoS3Path ? (
                    <img src={album.fotoS3Path} alt={album.titolo} className="w-28 h-28 md:w-36 md:h-36 object-cover flex-shrink-0 border border-black" />
                  ) : (
                    <div className="w-28 h-28 md:w-36 md:h-36 border border-black flex items-center justify-center flex-shrink-0 bg-gray-100">
                      <i className="fa-solid fa-music text-gray-400 text-2xl" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold mb-3 tracking-tight">{album.titolo}</p>
                    {album.streamingLinks && Object.keys(album.streamingLinks).length > 0 && (
                      <div className="flex gap-3 flex-wrap">
                        {Object.entries(album.streamingLinks).map(([platform, url]) => (
                          <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                            className="text-xs font-medium uppercase tracking-wider underline underline-offset-2 hover:text-gray-500 transition-colors capitalize">
                            {platform}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!showAllMusic && musicAlbums.length > 4 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAllMusic(true)}
                  className="text-xs font-bold tracking-widest uppercase border border-black px-6 py-2.5 hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  {lang === 'EN' ? `Show ${musicAlbums.length - 4} more` : `Mostra altri ${musicAlbums.length - 4}`}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CALENDARIO / LISTA EVENTI ────────────────────────────────────── */}
      {eventi.length > 0 && (
        <section className="py-16 border-b-2 border-black">
          <div className="container mx-auto px-3 md:px-6">
            <SectionLabel label={t('home.section_events') || 'Date'} />

            {/* Navigazione mese — comune a entrambe le viste */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="w-8 h-8 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer">
                <i className="fa-solid fa-chevron-left text-xs" />
              </button>
              <span className="text-sm font-bold tracking-widest uppercase">
                {monthNames[calMonth]} {calYear}
              </span>
              <button onClick={nextMonth} className="w-8 h-8 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer">
                <i className="fa-solid fa-chevron-right text-xs" />
              </button>
            </div>

            {/* ── VISTA MOBILE: lista eventi del mese ── */}
            <div className="md:hidden">
              {monthEvents.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8 border border-black">
                  {lang === 'EN' ? 'No events this month' : 'Nessun evento in questo mese'}
                </p>
              ) : (
                <div className="border border-black divide-y divide-black">
                  {monthEvents.map(({ ev, date }, i) => {
                    const d = new Date(date.data + 'T00:00:00');
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedEvent(ev)}
                        className="w-full text-left flex items-start gap-4 px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex-shrink-0 w-12 text-center border-r border-black pr-4">
                          <p className="text-xl font-black leading-none">{d.getDate()}</p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {d.toLocaleDateString(i18n.language, { month: 'short' })}
                          </p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold truncate">{ev.titolo}</p>
                          {ev.luogo && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              <i className="fa-solid fa-location-dot mr-1" />{ev.luogo}
                            </p>
                          )}
                          {date.ora && (
                            <p className="text-xs text-gray-400 mt-0.5">{date.ora.slice(0, 5)}</p>
                          )}
                        </div>
                        <i className="fa-solid fa-chevron-right text-xs text-gray-300 flex-shrink-0 mt-1" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── VISTA DESKTOP: calendario a griglia ── */}
            <div className="hidden md:block">
              <div className="grid grid-cols-7 border-t border-l border-black">
                {dayNames.map((d) => (
                  <div key={d} className="border-r border-b border-black text-center text-[10px] font-bold tracking-widest uppercase py-2 bg-black text-white">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 border-l border-black">
                {cells.map((day, i) => {
                  const dateStr = day
                    ? `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    : null;
                  const dayEntries = dateStr ? (eventsByDate[dateStr] ?? []) : [];
                  const isToday = dateStr === todayStr;
                  return (
                    <div
                      key={i}
                      className={`min-h-[100px] border-r border-b border-black p-1.5 ${!day ? 'bg-gray-50' : 'bg-white'}`}
                    >
                      {day && (
                        <>
                          <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center mb-1 ${
                            isToday ? 'bg-black text-white' : 'text-gray-400'
                          }`}>
                            {day}
                          </span>
                          <div className="space-y-0.5">
                            {dayEntries.map(({ ev, date }, j) => (
                              <button
                                key={j}
                                onClick={() => setSelectedEvent(ev)}
                                className="w-full text-left px-1.5 py-1 bg-black text-white hover:bg-gray-800 transition-colors cursor-pointer"
                              >
                                {date.ora && (
                                  <span className="text-[9px] text-gray-400 block leading-none mb-0.5">
                                    {date.ora.slice(0, 5)}
                                  </span>
                                )}
                                <span className="text-[10px] font-medium block truncate leading-tight">
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

          </div>
        </section>
      )}

      {/* ── PRESS ────────────────────────────────────────────────────────── */}
      {press.length > 0 && (
        <section className="py-16 border-b-2 border-black">
          <div className="container mx-auto px-3 md:px-6">
            <SectionLabel label={t('home.section_press') || 'Press'} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px border border-black bg-black">
              {press.map((p) => {
                const citazione = lang === 'EN' ? p.citazioneEN || p.citazioneIT : p.citazioneIT || p.citazioneEN;
                return (
                  <div key={p.publicId} className="bg-white p-6 flex flex-col gap-3">
                    <p className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-2">
                      {p.nomeTestata}
                    </p>
                    {citazione && (
                      <p className="text-sm leading-relaxed flex-1 italic text-gray-700">
                        <span className="text-3xl font-black leading-none mr-0.5 not-italic">"</span>
                        {citazione}
                        <span className="text-3xl font-black leading-none ml-0.5 not-italic">"</span>
                      </p>
                    )}
                    {p.nomeGiornalista && (
                      <p className="text-[11px] uppercase tracking-wider font-medium text-gray-400 mt-auto">
                        — {p.nomeGiornalista}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── GALLERY ──────────────────────────────────────────────────────── */}
      {albums.length > 0 && (
        <section className="py-16 border-b-2 border-black">
          <div className="container mx-auto px-3 md:px-6">
            <div className="flex items-center gap-4 mb-10">
              <div className="flex-1 h-px bg-black" />
              <span className="text-[11px] font-bold tracking-[0.25em] uppercase">{t('home.section_gallery')}</span>
              <div className="flex-1 h-px bg-black" />
              <Link to="/gallery" className="text-[11px] font-bold tracking-[0.25em] uppercase underline underline-offset-2 hover:text-gray-500 transition-colors whitespace-nowrap">
                {t('home.view_all')} →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-black bg-black">
              {albums.map((album) => {
                const cover = album.immagini?.sort((a: any, b: any) => a.ordine - b.ordine)[0];
                return (
                  <Link key={album.publicId} to={`/gallery/${album.publicId}`} className="group relative aspect-square overflow-hidden bg-gray-100">
                    {cover?.s3Path ? (
                      <img src={cover.s3Path} alt={album.nome} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <i className="fa-solid fa-image text-3xl text-gray-300" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-3 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                      <p className="text-white text-xs font-bold uppercase tracking-wider truncate">{album.nome}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── NEWSLETTER ───────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-3 md:px-6 max-w-lg">
          <SectionLabel label="Newsletter" />
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black tracking-tight mb-2">{t('newsletter.title')}</h2>
            <p className="text-sm text-gray-500">{t('newsletter.subtitle')}</p>
          </div>
          {newsletterStatus === 'ok' ? (
            <p className="text-sm font-medium flex items-center justify-center gap-2 border border-black px-6 py-3">
              <i className="fa-solid fa-check" />
              {t('newsletter.success')}
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-0">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={t('newsletter.placeholder')}
                required
                disabled={newsletterStatus === 'loading'}
                className="flex-1 border border-black border-r-0 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none bg-white"
              />
              <button
                type="submit"
                disabled={newsletterStatus === 'loading'}
                className="px-6 py-3 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0 border border-black"
              >
                {newsletterStatus === 'loading' ? '...' : t('newsletter.cta')}
              </button>
            </form>
          )}
          {newsletterStatus === 'error' && (
            <p className="text-xs text-red-600 mt-3 text-center">{t('newsletter.error')}</p>
          )}
        </div>
      </section>

      {/* ── MODALE EVENTO ────────────────────────────────────────────────── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative bg-white border-2 border-black w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 border border-black bg-white hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-times text-sm" />
            </button>

            {selectedEvent.immagineS3Path && (
              <img src={selectedEvent.immagineS3Path} alt={selectedEvent.titolo} className="w-full h-52 object-cover border-b-2 border-black" />
            )}

            <div className="p-6">
              <p className="text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">Evento</p>
              <h3 className="text-xl font-black tracking-tight mb-4 border-b border-black pb-4">{selectedEvent.titolo}</h3>

              {selectedEvent.dates?.length > 0 && (
                <div className="mb-4 space-y-1.5">
                  {[...selectedEvent.dates]
                    .sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime())
                    .map((d: any, i: number) => (
                      <p key={i} className="text-sm flex items-center gap-2">
                        <i className="fa-regular fa-calendar w-4 text-gray-400" />
                        <span>
                          {new Date(d.data + 'T00:00:00').toLocaleDateString(i18n.language, {
                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                          })}
                          {d.ora && <span className="ml-2 font-bold">{d.ora.slice(0, 5)}</span>}
                        </span>
                      </p>
                    ))}
                </div>
              )}

              {selectedEvent.luogo && (
                <p className="text-sm flex items-center gap-2 mb-4">
                  <i className="fa-solid fa-location-dot w-4 text-gray-400" />
                  {selectedEvent.luogo}
                </p>
              )}

              {description && (
                <p className="text-sm leading-relaxed mb-5 whitespace-pre-line text-gray-700 border-t border-gray-200 pt-4">{description}</p>
              )}

              {selectedEvent.linkBiglietti && (
                <a
                  href={selectedEvent.linkBiglietti}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors border border-black"
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
