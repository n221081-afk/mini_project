import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function SettingsPage() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [notifications, setNotifications] = useState(true);
  const { language, changeLanguage, t } = useLanguage();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    window.dispatchEvent(new Event('themeChange'));
  };

  useEffect(() => {
    const handleThemeEvent = () => setTheme(localStorage.getItem('theme') || 'light');
    window.addEventListener('themeChange', handleThemeEvent);
    return () => window.removeEventListener('themeChange', handleThemeEvent);
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <h1 className="page-header">{t('Settings')}</h1>
      
      <div className="card p-6 divide-y dark:divide-white/10">
        <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-lg dark:text-white">Appearance (Theme)</h3>
            <p className="text-sm text-gray-500 dark:text-white/60">Toggle between Light and Dark mode for the application.</p>
          </div>
          <div className="flex gap-2 bg-gray-100 dark:bg-[#0b1220] p-1 rounded-lg border dark:border-white/10">
            <button onClick={() => handleThemeChange('light')} className={`px-4 py-2 rounded-md transition-colors font-medium text-sm ${theme === 'light' ? 'bg-white dark:bg-gray-800 shadow-sm text-primary-600' : 'text-gray-500 dark:text-gray-400'}`}>Light</button>
            <button onClick={() => handleThemeChange('dark')} className={`px-4 py-2 rounded-md transition-colors font-medium text-sm ${theme === 'dark' ? 'bg-gray-800 shadow-sm text-white' : 'text-gray-500 dark:text-gray-400'}`}>Dark</button>
          </div>
        </div>

        <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-lg dark:text-white">Email Notifications</h3>
            <p className="text-sm text-gray-500 dark:text-white/60">Receive emails for leave approvals, payroll generation, and HR requests.</p>
          </div>
          <button onClick={() => setNotifications(!notifications)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-lg dark:text-white">Language Preferences</h3>
            <p className="text-sm text-gray-500 dark:text-white/60">Change the primary language of the HR dashboard interface.</p>
          </div>
          <select value={language} onChange={(e) => changeLanguage(e.target.value)} className="input-field max-w-[200px]">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
          </select>
        </div>
      </div>
    </div>
  );
}
