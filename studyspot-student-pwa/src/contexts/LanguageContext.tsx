import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTranslation, type Language } from '../utils/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('language');
    if (saved === 'hi' || saved === 'en') {
      return saved;
    }
    // Try to detect browser language
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'hi' ? 'hi' : 'en';
  });

  // Update HTML lang attribute when language changes
  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', 'ltr'); // Both English and Hindi use LTR
  }, [language]);

  // Load language from backend on mount
  useEffect(() => {
    const loadLanguageFromBackend = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Use dynamic import to avoid circular dependencies
        const { default: api } = await import('../services/api');
        const response = await api.get('/api/users/profile');
        
        const userLanguage = response?.data?.data?.user?.language || response?.data?.user?.language;
        if (userLanguage === 'hi' || userLanguage === 'en') {
          setLanguageState(userLanguage);
          localStorage.setItem('language', userLanguage);
        }
      } catch (error) {
        console.warn('Failed to load language from backend:', error);
      }
    };

    loadLanguageFromBackend();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Save to backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const { default: api } = await import('../services/api');
        await api.put('/api/users/profile', { language: lang });
      }
    } catch (error) {
      console.warn('Failed to save language to backend:', error);
    }
  };

  const t = (key: string): string => {
    return getTranslation(key, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

