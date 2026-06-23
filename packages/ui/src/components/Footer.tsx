/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { ActivePublicPage } from '@bina/types';
import { Mail, Phone, MapPin, Building } from 'lucide-react';

interface FooterProps {
  setActivePage: (page: ActivePublicPage) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActivePage }) => {
  const { staticT, t } = useLanguage();
  const { theme, settings } = useTheme();

  return (
    <footer 
      id="main-app-footer" 
      className="text-white border-t border-white/5 pt-16 pb-8 transition-all duration-300 relative overflow-hidden"
      style={{ backgroundColor: `${theme.primary}FE` }}
    >
      {/* Decorative architectural background circle */}
      <div 
        className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full opacity-5 pointer-events-none"
        style={{ border: `2px solid ${theme.secondary}` }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10 text-right">
          
          {/* Section 1: Firm Overview */}
          <div id="footer-firm-overview" className="space-y-4">
            <div className="flex items-center gap-2 justify-start md:justify-end">
              <Building className="w-6 h-6" style={{ color: theme.secondary }} />
              <h2 className="font-sans font-bold text-lg tracking-wider text-white">
                {settings ? t(settings.companyName) : staticT('companyName')}
              </h2>
            </div>
            <p className="text-white/60 text-xs leading-relaxed max-w-sm">
              {settings ? t(settings.companyTagline) : staticT('tagline')}
            </p>

            {/* Social Media Integration */}
            <div className="flex gap-2.5 justify-start md:justify-start pt-2 items-center">
              {settings?.socialX && (
                <a href={settings.socialX} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-white/30 flex items-center justify-center text-white/70 hover:text-white transition-all hover:scale-110" title="X (Twitter)">
                  <span className="font-sans font-black text-[10px]">X</span>
                </a>
              )}
              {settings?.socialInstagram && (
                <a href={settings.socialInstagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-white/30 flex items-center justify-center text-white/70 hover:text-white transition-all hover:scale-110" title="Instagram">
                  <span className="font-sans font-bold text-[10px]">IG</span>
                </a>
              )}
              {settings?.socialLinkedIn && (
                <a href={settings.socialLinkedIn} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-white/30 flex items-center justify-center text-white/70 hover:text-white transition-all hover:scale-110" title="LinkedIn">
                  <span className="font-sans font-bold text-[10px]">LN</span>
                </a>
              )}
              {settings?.socialTikTok && (
                <a href={settings.socialTikTok} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-white/30 flex items-center justify-center text-white/70 hover:text-white transition-all hover:scale-110" title="TikTok">
                  <span className="font-sans font-bold text-[10px]">TT</span>
                </a>
              )}
              {settings?.socialSnapchat && (
                <a href={settings.socialSnapchat} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-white/30 flex items-center justify-center text-white/70 hover:text-white transition-all hover:scale-110" title="Snapchat">
                  <span className="font-sans font-bold text-[10px]">SC</span>
                </a>
              )}
              {settings?.whatsapp && (
                <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-white/30 flex items-center justify-center text-white/70 hover:text-white transition-all hover:scale-110" title="WhatsApp">
                  <span className="font-sans font-bold text-[10px]">WA</span>
                </a>
              )}
            </div>
            {/* Vision 2030 custom vector badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 mt-4 rounded border border-emerald-500/10 bg-emerald-500/5 select-none text-right">
              <svg className="w-8 h-8 fill-emerald-400" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                <path d="M50 20 L60 40 L80 40 L65 55 L75 80 L50 65 L25 80 L35 55 L20 40 L40 40 Z" fill="currentColor" />
              </svg>
              <div>
                <span className="block text-[10px] uppercase text-white/50 tracking-wider">Vision 2030</span>
                <span className="block font-sans text-[11px] font-medium text-emerald-400">{staticT('saudiVision')}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Quick Links */}
          <div id="footer-quick-links" className="space-y-4">
            <h3 className="font-sans font-bold text-sm uppercase tracking-widest" style={{ color: theme.secondary }}>
              {staticT('quickLinks')}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => setActivePage('home')} 
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {staticT('home')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('properties')} 
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {staticT('properties')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('projects')} 
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {staticT('projects')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('about')} 
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {staticT('aboutUs')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('contact')} 
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {staticT('contactUs')}
                </button>
              </li>
            </ul>
          </div>

          {/* Section 3: Contact Details */}
          <div id="footer-contact-info" className="space-y-4">
            <h3 className="font-sans font-bold text-sm uppercase tracking-widest" style={{ color: theme.secondary }}>
              {staticT('contactInfo')}
            </h3>
            <ul className="space-y-3.5 text-sm text-white/70">
              <li className="flex items-center gap-3 justify-start md:justify-end">
                <span>{settings?.contactPhone}</span>
                <Phone className="w-4 h-4 flex-shrink-0" style={{ color: theme.secondary }} />
              </li>
              <li className="flex items-center gap-3 justify-start md:justify-end">
                <span>{settings?.contactEmail}</span>
                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: theme.secondary }} />
              </li>
              <li className="flex items-start gap-3 justify-start md:justify-end">
                <span className="leading-relaxed max-w-xs">{settings ? t(settings.address) : ''}</span>
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: theme.secondary }} />
              </li>
            </ul>
          </div>

        </div>

        {/* Regulatory & Legal Line */}
        <div 
          id="footer-bottom-bar"
          className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4"
        >
          <p>{staticT('allRightsReserved')}</p>
          <div className="flex gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">ترخيص الهيئة العامة للعقار</span>
            <span className="hover:text-white transition-colors cursor-pointer">الشروط والأحكام</span>
            <span className="hover:text-white transition-colors cursor-pointer">سياسة الخصوصية</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
