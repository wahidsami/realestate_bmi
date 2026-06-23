/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { ActivePublicPage, ViewMode, PageContent } from '@bina/types';
import { pageRepository } from '@bina/shared';
import { CorporateLogo } from './VectorGraphics';
import { Globe, Shield, Menu, X } from 'lucide-react';

interface HeaderProps {
  activePage: ActivePublicPage;
  setActivePage: (page: ActivePublicPage) => void;
  setViewMode: (mode: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  setActivePage,
  setViewMode,
}) => {
  const { language, setLanguage, staticT } = useLanguage();
  const { theme, settings } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [customPages, setCustomPages] = React.useState<PageContent[]>([]);

  React.useEffect(() => {
    const fetchCustomPages = async () => {
      try {
        const allPages = await pageRepository.getPages();
        const publishedCustom = allPages.filter(p => 
          p.status === 'published' && 
          p.slug !== 'home' && 
          p.slug !== 'about' && 
          p.slug !== 'contact' &&
          !p.parentId
        );
        setCustomPages(publishedCustom);
      } catch (err) {
        console.error('Error fetching CMS pages in header:', err);
      }
    };
    fetchCustomPages();
  }, [activePage]);

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const menuItems: Array<{ id: ActivePublicPage; label: string }> = [
    { id: 'home', label: staticT('home') },
    { id: 'properties', label: staticT('properties') },
    { id: 'projects', label: staticT('activeProjects') },
    ...customPages.map(p => ({
      id: p.slug,
      label: language === 'ar' ? (p.title.ar || p.title.en) : (p.title.en || p.title.ar)
    })),
    { id: 'about', label: staticT('aboutUs') },
    { id: 'contact', label: staticT('contactUs') },
  ];

  return (
    <header 
      id="main-app-header"
      className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md shadow-xl transition-all duration-300"
      style={{ backgroundColor: `${theme.primary}DF` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo and Brand */}
          <div 
            id="header-brand-logo"
            className="flex-shrink-0 cursor-pointer flex items-center pr-2 gap-3"
            onClick={() => setActivePage('home')}
          >
            {settings?.logoBase64 ? (
              <img 
                src={settings.logoBase64} 
                alt="Bina & Edarah Logo" 
                className="h-10 sm:h-12 w-auto object-contain rounded-lg bg-white/5 p-1"
                referrerPolicy="no-referrer"
              />
            ) : (
              <CorporateLogo className="h-10 sm:h-12 w-auto" />
            )}
            <span className="text-white text-base font-sans font-black tracking-wide hidden sm:inline">
              {settings?.companyName ? (language === 'ar' ? settings.companyName.ar : settings.companyName.en) : (language === 'ar' ? 'بناء وإدارة' : 'BINA & EDARAH')}
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-navigation" className="hidden md:flex space-x-1 space-x-reverse">
            {menuItems.map((item) => {
              const active = activePage === item.id;
              return (
                <button
                  id={`nav-item-${item.id}`}
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`px-4 py-2 rounded-md font-sans text-sm font-medium transition-all duration-300 ${
                    active 
                      ? 'text-white' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  style={active ? { borderBottom: `2.5px solid ${theme.secondary}` } : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Localization & Security Gate Controls */}
          <div id="header-controls" className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <button
              id="lang-switcher-btn"
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 text-xs font-mono font-medium tracking-wide transition-all duration-300"
            >
              <Globe className="w-3.5 h-3.5" style={{ color: theme.secondary }} />
              <span>{staticT('switchLang')}</span>
            </button>

            {/* Admin Gateway */}
            <button
              id="admin-gateway-btn"
              onClick={() => setViewMode('admin')}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-sans text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r hover:opacity-90 active:scale-95 shadow-md shadow-black/30 transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${theme.secondary}, #FFECA1)`
              }}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{staticT('goToAdmin')}</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div id="mobile-menu-trigger" className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="p-1 px-2.5 rounded text-white/80 bg-white/5 border border-white/10 text-xs font-mono font-semibold"
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>
            
            <button
              onClick={() => setViewMode('admin')}
              className="p-1.5 rounded text-black shadow-sm"
              style={{ backgroundColor: theme.secondary }}
            >
              <Shield className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded text-white/80 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div 
          id="mobile-navigation-drawer"
          className="md:hidden border-t border-white/5 px-4 pt-3 pb-5 space-y-2 shadow-2xl transition-all duration-300"
          style={{ backgroundColor: theme.primary }}
        >
          {menuItems.map((item) => {
            const active = activePage === item.id;
            return (
              <button
                id={`mobile-nav-${item.id}`}
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full py-3 px-4 rounded text-right font-sans text-sm font-medium transition-all ${
                  active 
                    ? 'text-white font-semibold' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                style={active ? { borderLeft: `4px solid ${theme.secondary}`, backgroundColor: 'rgba(255,255,255,0.03)' } : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
