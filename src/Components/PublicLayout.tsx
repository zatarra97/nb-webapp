import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { openCookiePreferences } from './CookieBanner';

const NAV_LINKS = [
  { path: '/', key: 'home' },
  { path: '/about', key: 'about' },
  { path: '/eventi', key: 'eventi' },
  { path: '/gallery', key: 'gallery' },
  { path: '/discografia', key: 'discografia' },
  { path: '/contacts', key: 'contacts' },
];

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'it' ? 'en' : 'it');
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <nav className="border-b border-gray-200 sticky top-0 bg-white z-40">
        <div className="container mx-auto px-3 md:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold tracking-widest uppercase">NB</Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ path, key }) => (
              <Link
                key={path}
                to={path}
                className={`text-sm font-medium transition-colors ${
                  pathname === path ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t(`nav.${key}`)}
              </Link>
            ))}
            <button
              onClick={toggleLang}
              className="text-xs font-semibold border border-gray-300 rounded px-2 py-1 text-gray-500 hover:text-gray-900 hover:border-gray-500 transition-colors cursor-pointer"
            >
              {i18n.language === 'it' ? 'EN' : 'IT'}
            </button>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
            aria-label="Apri menu"
          >
            <i className="fa-solid fa-bars text-sm" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 md:hidden flex flex-col shadow-2xl transition-transform duration-300 ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header drawer */}
        <div className="flex items-center justify-between px-5 h-14 border-b-2 border-black flex-shrink-0">
          <span className="text-sm font-black tracking-widest uppercase">NB</span>
          <button
            onClick={closeMenu}
            className="w-8 h-8 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
            aria-label="Chiudi menu"
          >
            <i className="fa-solid fa-times text-sm" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto">
          {NAV_LINKS.map(({ path, key }) => {
            const active = pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={closeMenu}
                className={`flex items-center justify-between px-5 py-4 border-b border-gray-100 text-sm font-medium transition-colors ${
                  active ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {t(`nav.${key}`)}
                {active && <i className="fa-solid fa-chevron-right text-xs opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Language toggle */}
        <div className="px-5 py-5 border-t-2 border-black flex-shrink-0">
          <button
            onClick={() => { toggleLang(); closeMenu(); }}
            className="w-full py-3 border border-black text-sm font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            {i18n.language === 'it' ? 'Switch to English' : 'Passa all\'Italiano'}
          </button>
        </div>
      </div>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gray-100 py-8 mt-12">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Nicolò Balducci — {t('footer.all_rights_reserved')}</p>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-center">
            <Link to="/privacy-policy" className="hover:text-gray-900 transition-colors">
              {t('footer.privacy_policy')}
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/cookie-policy" className="hover:text-gray-900 transition-colors">
              {t('footer.cookie_policy')}
            </Link>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={openCookiePreferences}
              className="hover:text-gray-900 transition-colors cursor-pointer"
            >
              {t('footer.manage_cookies')}
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
