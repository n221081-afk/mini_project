import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  English: {
    Dashboard: 'Dashboard',
    Employees: 'Employees',
    Departments: 'Departments',
    Attendance: 'Attendance',
    Leaves: 'Leaves',
    Payroll: 'Payroll',
    Recruitment: 'Recruitment',
    Performance: 'Performance',
    Reports: 'Reports',
    Requests: 'Requests',
    Settings: 'Settings',
  },
  Spanish: {
    Dashboard: 'Tablero',
    Employees: 'Empleados',
    Departments: 'Departamentos',
    Attendance: 'Asistencia',
    Leaves: 'Permisos',
    Payroll: 'Nómina',
    Recruitment: 'Reclutamiento',
    Performance: 'Rendimiento',
    Reports: 'Informes',
    Requests: 'Solicitudes',
    Settings: 'Ajustes',
  },
  French: {
    Dashboard: 'Tableau de bord',
    Employees: 'Employés',
    Departments: 'Départements',
    Attendance: 'Présence',
    Leaves: 'Congés',
    Payroll: 'Paie',
    Recruitment: 'Recrutement',
    Performance: 'Performance',
    Reports: 'Rapports',
    Requests: 'Demandes',
    Settings: 'Paramètres',
  },
  German: {
    Dashboard: 'Armaturenbrett',
    Employees: 'Mitarbeiter',
    Departments: 'Abteilungen',
    Attendance: 'Anwesenheit',
    Leaves: 'Urlaube',
    Payroll: 'Gehaltsabrechnung',
    Recruitment: 'Rekrutierung',
    Performance: 'Leistung',
    Reports: 'Berichte',
    Requests: 'Anfragen',
    Settings: 'Einstellungen',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'English');

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['English'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
