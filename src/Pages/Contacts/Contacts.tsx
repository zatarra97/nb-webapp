import { useTranslation } from 'react-i18next';
import PublicLayout from '../../Components/PublicLayout';
import sorekLogo from '../../Images/sorek artists.avif';

const Contacts = () => {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      <div className="container mx-auto px-3 md:px-6 py-16 max-w-3xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">{t('contacts.title')}</h1>
        </div>

        {/* Logo agenzia */}
        <div className="mb-12">
          <img
            src={sorekLogo}
            alt="Sorek Artists"
            className="h-16 object-contain"
          />
        </div>

        <div className="space-y-12">
          {/* General Management */}
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase font-semibold text-gray-400 mb-5 border-b border-gray-200 pb-2">
              {t('contacts.general_management')}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                <span className="font-semibold text-gray-900">Eitan Sorek</span>
                <a href="mailto:eitan@sorekartists.com" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  eitan@sorekartists.com
                </a>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                <span className="font-semibold text-gray-900">Sabine Mardo</span>
                <a href="mailto:sabine@sorekartists.com" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  sabine@sorekartists.com
                </a>
              </div>
            </div>

            <div className="text-sm text-gray-600 leading-relaxed space-y-0.5">
              <p className="font-medium text-gray-800">Künstlerhaus St. Lukas</p>
              <p>Fasanenstrasse 13</p>
              <p>D - 10623 Berlin</p>
              <p>Germany</p>
            </div>

            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>
                <span className="text-gray-400 text-xs uppercase tracking-widest mr-2">T.</span>
                <a href="tel:+493091448866" className="hover:text-gray-900 transition-colors">+49 30 91448866</a>
              </p>
              <p>
                <span className="text-gray-400 text-xs uppercase tracking-widest mr-2">F.</span>
                +49 30 54881338
              </p>
              <p>
                <span className="text-gray-400 text-xs uppercase tracking-widest mr-2">W.</span>
                <a href="https://www.sorekartists.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors underline underline-offset-2">
                  www.sorekartists.com
                </a>
              </p>
            </div>
          </div>

          {/* Local Management */}
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase font-semibold text-gray-400 mb-5 border-b border-gray-200 pb-2">
              {t('contacts.local_management')}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                <span className="font-semibold text-gray-900">Andrea Penna <span className="font-normal text-gray-500 text-sm">(Studio Cogliolo)</span></span>
                <a href="mailto:cogliolo@cogliolo.it" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  cogliolo@cogliolo.it
                </a>
              </div>
            </div>

            <div className="text-sm text-gray-600 leading-relaxed space-y-0.5">
              <p>Via Valadier 1</p>
              <p>00193 Rome</p>
              <p>Italy</p>
            </div>

            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>
                <span className="text-gray-400 text-xs uppercase tracking-widest mr-2">T.</span>
                <a href="tel:+39063207627" className="hover:text-gray-900 transition-colors">+39 06 3207627</a>
              </p>
              <p>
                <span className="text-gray-400 text-xs uppercase tracking-widest mr-2">F.</span>
                +39 06 3207628
              </p>
              <p>
                <span className="text-gray-400 text-xs uppercase tracking-widest mr-2">W.</span>
                <a href="https://www.cogliolo.it" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors underline underline-offset-2">
                  www.cogliolo.it
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Contacts;
