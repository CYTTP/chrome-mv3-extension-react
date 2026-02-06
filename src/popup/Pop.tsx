
import { useTranslation } from 'react-i18next';

const Pop = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="w-[360px] min-h-[400px] p-4 bg-gray-100 flex flex-col gap-4 items-center">
      <button 
        onClick={toggleLanguage}
        className="px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 cursor-pointer text-sm transition-colors"
      >
        {i18n.language === 'zh' ? 'English' : '中文'}
      </button>
      <div className="text-lg font-medium">{t('hello')}</div>
    </div>
  );
};

export default Pop;
