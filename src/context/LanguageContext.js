import React, { createContext, useContext, useState } from 'react';
import en from '../locales/en.json';
import pt from '../locales/pt.json';
import es from '../locales/es.json';

const translations = { en, pt, es };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const t = (key) => translations[language][key] || key;
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);