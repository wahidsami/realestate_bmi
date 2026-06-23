/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LanguageProvider } from '@bina/ui/contexts/LanguageContext';
import { ThemeProvider } from '@bina/ui/contexts/ThemeContext';
import { ActivePublicPage, ViewMode } from '@bina/types';
import { WebApp } from '@web/App';
import { AdminApp } from '@admin/App';

const getInitialViewMode = (): ViewMode => {
  if (typeof window === 'undefined') {
    return 'public';
  }

  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  return path.startsWith('/admin') || searchParams.get('view') === 'admin' ? 'admin' : 'public';
};

const getInitialPublicPage = (): ActivePublicPage => {
  if (typeof window === 'undefined') {
    return 'home';
  }

  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const propId = searchParams.get('property');
  const projId = searchParams.get('project');

  if (propId) return `property-${propId}`;
  if (projId) return `project-${projId}`;
  if (path.startsWith('/property/')) return `property-${path.substring('/property/'.length)}`;
  if (path.startsWith('/properties/')) return `property-${path.substring('/properties/'.length)}`;
  if (path === '/properties' || path === '/properties/') return 'properties';
  if (path === '/projects' || path === '/projects/') return 'projects';
  if (path === '/about' || path === '/about/') return 'about';
  if (path === '/contact' || path === '/contact/') return 'contact';
  return 'home';
};

function AppContent() {
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);
  const [activePublicPage, setActivePublicPage] = useState<ActivePublicPage>(getInitialPublicPage);

  React.useEffect(() => {
    const handleUrlSync = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const propId = searchParams.get('property');
      const projId = searchParams.get('project');
      const isAdminRoute = path.startsWith('/admin') || searchParams.get('view') === 'admin';

      if (isAdminRoute) {
        setViewMode('admin');
      } else if (propId) {
        setViewMode('public');
        setActivePublicPage(`property-${propId}`);
      } else if (projId) {
        setViewMode('public');
        setActivePublicPage(`project-${projId}`);
      } else if (path.startsWith('/property/')) {
        setViewMode('public');
        const id = path.substring('/property/'.length);
        if (id) {
          setActivePublicPage(`property-${id}`);
        }
      } else if (path.startsWith('/properties/')) {
        setViewMode('public');
        const id = path.substring('/properties/'.length);
        if (id) {
          setActivePublicPage(`property-${id}`);
        }
      } else if (path === '/properties' || path === '/properties/') {
        setViewMode('public');
        setActivePublicPage('properties');
      } else if (path === '/projects' || path === '/projects/') {
        setViewMode('public');
        setActivePublicPage('projects');
      } else if (path === '/about' || path === '/about/') {
        setViewMode('public');
        setActivePublicPage('about');
      } else if (path === '/contact' || path === '/contact/') {
        setViewMode('public');
        setActivePublicPage('contact');
      } else if (path === '/' || path === '') {
        setViewMode('public');
        setActivePublicPage('home');
      }
    };

    window.addEventListener('popstate', handleUrlSync);
    handleUrlSync();
    (window as any).__triggerUrlSync = handleUrlSync;

    return () => {
      window.removeEventListener('popstate', handleUrlSync);
      delete (window as any).__triggerUrlSync;
    };
  }, []);

  const navigatePage = (pageName: string) => {
    let url = '/';
    if (pageName === 'properties') {
      url = '/properties';
    } else if (pageName === 'projects') {
      url = '/projects';
    } else if (pageName === 'about') {
      url = '/about';
    } else if (pageName === 'contact') {
      url = '/contact';
    } else if (pageName === 'home') {
      url = '/';
    } else if (pageName.startsWith('property-')) {
      const id = pageName.replace('property-', '');
      url = `/property/${id}`;
    } else if (pageName.startsWith('project-')) {
      const id = pageName.replace('project-', '');
      url = `/?project=${id}`;
    }

    if (window.location.pathname + window.location.search !== url) {
      window.history.pushState(null, '', url);
    }
    setActivePublicPage(pageName);
  };

  React.useEffect(() => {
    (window as any).__setActivePageFallback = navigatePage;
    return () => {
      delete (window as any).__setActivePageFallback;
    };
  }, []);

  React.useEffect(() => {
    const nextUrl = viewMode === 'admin' ? '/admin' : '/';
    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl !== nextUrl) {
      window.history.pushState(null, '', nextUrl);
    }
  }, [viewMode]);

  if (viewMode === 'admin') {
    return <AdminApp onBackToWebsite={() => setViewMode('public')} />;
  }

  return (
    <WebApp
      activePage={activePublicPage}
      setActivePage={navigatePage}
      setViewMode={setViewMode}
    />
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}
