import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import frTranslation from './locales/fr.json';
import enTranslation from './locales/en.json';
import arTranslation from './locales/ar.json';

const resources = {
  fr: { translation: frTranslation },
  en: { translation: enTranslation },
  ar: { translation: arTranslation }
};

// Persist language choice in localStorage
const savedLang = typeof window !== 'undefined' ? localStorage.getItem('ucaros_lang') : null;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

// Handle RTL for Arabic
i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  localStorage.setItem('ucaros_lang', lng);
});

export default i18n;
