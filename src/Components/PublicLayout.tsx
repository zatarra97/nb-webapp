import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NAV_LINKS = [
  { path: '/', key: 'home' },
  { path: '/eventi', key: 'eventi' },
  { path: '/press', key: 'press' },
  { path: '/gallery', key: 'gallery' },
  { path: '/discografia', key: 'discografia' },
];

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'it' ? 'en' : 'it');

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-40">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold tracking-widest uppercase">NB</Link>
          <div className="flex items-center gap-6">
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
        </div>
      </nav>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} NB
      </footer>
    </div>
  );
};

export default PublicLayout;
