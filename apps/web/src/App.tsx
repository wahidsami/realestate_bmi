import React from 'react';
import { Header } from '../../../packages/ui/src/components/Header';
import { Footer } from '../../../packages/ui/src/components/Footer';
import { PublicPages } from '../../../packages/ui/src/components/PublicPages';
import { ActivePublicPage, ViewMode } from '../../../packages/types/src';

interface WebAppProps {
  activePage: ActivePublicPage;
  setActivePage: (page: string) => void;
  setViewMode: (mode: ViewMode) => void;
}

export function WebApp({ activePage, setActivePage, setViewMode }: WebAppProps) {
  return (
    <div id="public-website-root" className="min-h-screen flex flex-col justify-between bg-[#FCFCFC] text-neutral-900 selection:bg-(--color-secondary) selection:text-black transition-colors duration-300">
      <div>
        <Header activePage={activePage} setActivePage={setActivePage} setViewMode={setViewMode} />
        <main id="public-main-content">
          <PublicPages activePage={activePage} onNavigate={setActivePage} />
        </main>
      </div>

      <Footer setActivePage={setActivePage} />
    </div>
  );
}
