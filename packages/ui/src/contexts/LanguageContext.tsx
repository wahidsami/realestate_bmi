/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BilingualText } from '@bina/types';
import { readStorageItem, writeStorageItem } from '@bina/utils';

export type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRtl: boolean;
  t: (text: BilingualText | undefined | null) => string;
  staticT: (key: string) => string;
}

const STATIC_TRANSLATIONS: Record<string, { ar: string; en: string }> = {
  // Public Layout
  home: { ar: 'الرئيسية', en: 'Home' },
  properties: { ar: 'العقارات', en: 'Properties' },
  projects: { ar: 'المشاريع الكبرى', en: 'Projects' },
  aboutUs: { ar: 'من نحن', en: 'About Us' },
  contactUs: { ar: 'اتصل بنا', en: 'Contact Us' },
  switchLang: { ar: 'English', en: 'العربية' },
  companyName: { ar: 'بناء وإدارة', en: 'BINA & EDARAH' },
  tagline: { ar: 'تطوير، إدارة واستثمار عقاري فاخر بمواصفات عالمية', en: 'Luxury Real Estate Development, Management & Investment' },
  
  // Footer
  allRightsReserved: { ar: 'جميع الحقوق محفوظة لشركة بناء وإدارة العقارية © ٢٠٢٦', en: 'All rights reserved to BINA & EDARAH Real Estate Co. © 2026' },
  saudiVision: { ar: 'شريك عقاري واعد يدعم رؤية المملكة ٢٠٣٠', en: 'A promising real estate partner supporting Saudi Vision 2030' },
  quickLinks: { ar: 'روابط سريعة', en: 'Quick Links' },
  contactInfo: { ar: 'معلومات الاتصال', en: 'Contact Information' },
  
  // Dashboard Admin Layout
  adminHeader: { ar: 'بوابة الإدارة التنفيذية', en: 'Executive Admin Portal' },
  adminDashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  adminProjects: { ar: 'المشاريع الكبرى', en: 'Projects' },
  adminProperties: { ar: 'العقارات المدرجة', en: 'Properties' },
  adminInquiries: { ar: 'طلبات التواصل', en: 'Inquiries' },
  adminPages: { ar: 'إدارة الصفحات', en: 'Pages Content' },
  adminMedia: { ar: 'مكتبة الوسائط المرفوعة', en: 'Media Library' },
  adminSettings: { ar: 'إعدادات الموقع', en: 'Website Settings' },
  backToWebsite: { ar: 'عرض الموقع العام', en: 'View Public Site' },
  goToAdmin: { ar: 'بوابة الإدارة', en: 'Admin Portal' },

  // Page Labels & Headers
  featuredProperties: { ar: 'العقارات المميزة', en: 'Featured Properties' },
  allProperties: { ar: 'مستودع العقارات النخبوية', en: 'Elite Properties Inventory' },
  activeProjects: { ar: 'المسيرة العمرانية', en: 'Active Master Projects' },
  noPropertiesYet: { ar: 'لم يتم إدراج عقارات بعد.', en: 'No properties listed yet.' },
  noProjectsYet: { ar: 'لم يتم إدراج مشاريع بعد.', en: 'No projects listed yet.' },
  bedrooms: { ar: 'غرف نوم', en: 'Beds' },
  bathrooms: { ar: 'دورات مياه', en: 'Baths' },
  area: { ar: 'المساحة', en: 'Area' },
  sqm: { ar: 'م٢', en: 'sqm' },
  sar: { ar: 'ريال سعودي', en: 'SAR' },
  statusAvailable: { ar: 'متاح للبيع', en: 'Available' },
  statusSold: { ar: 'تم البيع', en: 'Sold' },
  statusReserved: { ar: 'محجوز مؤقتاً', en: 'Reserved' },
  projectStatusPlanned: { ar: 'مخطط مستقبلي', en: 'Planned' },
  projectStatusUndercon: { ar: 'تحت الإنشاء', en: 'Under Construction' },
  projectStatusCompleted: { ar: 'مكتمل البناء', en: 'Completed' },
  
  // Contact Form Shell (Forms are disabled for inputs, but we display the descriptive shell)
  contactTitle: { ar: 'تقديم استفسار عقاري راقٍ', en: 'Submit a Luxury Inquiry' },
  contactSubtitle: { ar: 'الرجاء طباعة بياناتكم وتحديد رغبتكم العقارية ليقوم ممثلو الإدارة العليا بالاتصال بكم.', en: 'Please enter your contact details; our senior executives will call you.' },
  fullName: { ar: 'الاسم الكريم', en: 'Full Name' },
  emailAddress: { ar: 'البريد الإلكتروني', en: 'Email Address' },
  phoneNumber: { ar: 'رقم الجوال', en: 'Mobile Number' },
  messageText: { ar: 'نص الرسالة أو الاستفسار', en: 'Inquiry Message' },
  submitInquiry: { ar: 'إرسال الطلب بشكل رسمي', en: 'Submit Official Inquiry' },
  formDisabledTip: { ar: 'نموذج تقديم الطلبات المباشر سيتم ربطه بقواعد البيانات في الإصدار القادم.', en: 'The direct request form will be connected to live DB systems in the upcoming release.' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Default language is AR (Arabic)
    const stored = readStorageItem('local', 'bina_edarah_lang');
    return (stored as Language) || 'ar';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    writeStorageItem('local', 'bina_edarah_lang', lang);
  };

  const isRtl = language === 'ar';

  useEffect(() => {
    // Set direction and lang attributes on html element
    const html = document.documentElement;
    html.dir = isRtl ? 'rtl' : 'ltr';
    html.lang = language;
  }, [language, isRtl]);

  const t = (text: BilingualText | undefined | null): string => {
    if (!text) return '';
    return text[language] || text['ar'] || '';
  };

  const staticT = (key: string): string => {
    const translation = STATIC_TRANSLATIONS[key];
    if (!translation) return key;
    return translation[language] || translation['ar'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRtl, t, staticT }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
