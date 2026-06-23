import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Bath, BedDouble, MapPin, Square as SquareIcon, Sparkles } from 'lucide-react';
import { VisualWidget } from '../types';
import {
  apiClient,
  propertyRepository,
  PLACEHOLDER_PROPERTY_FEATURED_MEDIA_ID,
  displayBilingualOrNA,
  displayCurrencyOrNA,
  displayNumberOrNA,
} from '@bina/shared';
import type { Property } from '@bina/types';

interface FeaturedPropertiesGridWidgetProps {
  widget: VisualWidget;
  language: 'ar' | 'en';
}

const navigateToLink = (link?: string) => {
  const target = link || '/properties';
  if (typeof (window as any).__setActivePageFallback === 'function') {
    const normalized = target.replace(/^\//, '');
    (window as any).__setActivePageFallback(normalized || 'properties');
    return;
  }
  window.location.href = target.startsWith('/') ? target : `/${target}`;
};

const getPropertyImageUrl = (property: Property) => {
  if (property.featuredImageId) {
    return apiClient.getAbsoluteUrl(`/api/media/${property.featuredImageId}/file`);
  }
  return apiClient.getAbsoluteUrl(`/api/media/${PLACEHOLDER_PROPERTY_FEATURED_MEDIA_ID}/file`);
};

export const FeaturedPropertiesGridWidget: React.FC<FeaturedPropertiesGridWidgetProps> = ({
  widget,
  language,
}) => {
  const settings = widget.settings || {};
  const t = (ar: string, en: string) => (language === 'ar' ? ar : en);

  const [items, setItems] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProperties = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const all = await propertyRepository.getProperties();
        const featuredOnly = settings.showFeaturedOnly === false ? all : all.filter((item) => item.featured);
        const sorted = [...featuredOnly].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
        const limit = Math.max(1, Number(settings.limit || 6));
        if (!isMounted) return;
        setItems(sorted.slice(0, limit));
      } catch (error) {
        if (!isMounted) return;
        console.warn('[FeaturedPropertiesGridWidget] Failed to load properties', error);
        setLoadError(t('تعذر تحميل العقارات من الخادم حالياً.', 'Failed to load properties from the server.'));
        setItems([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProperties();

    return () => {
      isMounted = false;
    };
  }, [settings.limit, settings.showFeaturedOnly, language]);

  const columnClass = useMemo(() => {
    const desktopColumns = Number(settings.columnsDesktop || 3);
    if (desktopColumns <= 2) {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2';
    }
    if (desktopColumns === 4) {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  }, [settings.columnsDesktop]);

  const sectionTitle = language === 'ar' ? (settings.titleAr || 'العقارات المميزة') : (settings.titleEn || 'Featured Properties');
  const sectionSubtitle = language === 'ar'
    ? (settings.subtitleAr || 'استعرض أفضل الوحدات العقارية المتاحة حالياً')
    : (settings.subtitleEn || 'Explore our hand-picked inventory of premium residences');
  const showAllText = language === 'ar' ? (settings.showAllButtonTextAr || 'عرض الكل') : (settings.showAllButtonTextEn || 'Show All');
  const showAllLink = settings.showAllButtonLink || '/properties';
  const background = settings.background || {
    mode: settings.backgroundMode || (settings.backgroundImageUrl ? 'image' : 'solid'),
    color: settings.backgroundColor || '#0b1020',
    imageUrl: settings.backgroundImageUrl || '',
    overlayOpacity: settings.backgroundImageOverlayOpacity ?? 65,
  };
  const isImageBackground = (background.mode || 'solid') === 'image' && Boolean(background.imageUrl);
  const blockStyle: React.CSSProperties = isImageBackground
    ? {
        backgroundColor: background.color || '#0b1020',
        backgroundImage: `linear-gradient(rgba(2, 6, 23, ${Math.max(0, Math.min(100, Number(background.overlayOpacity ?? 65))) / 100}), rgba(2, 6, 23, ${Math.max(0, Math.min(100, Number(background.overlayOpacity ?? 65))) / 100})), url(${background.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {
        backgroundColor: background.color || '#0b1020',
      };

  return (
    <section className="w-full py-12 md:py-16 relative overflow-hidden" style={blockStyle}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black text-[#D4AF37]">
            <Sparkles className="w-3.5 h-3.5" />
            {t('عقارات مختارة', 'Curated Inventory')}
          </span>
          <h2 className="font-sans font-black text-2xl md:text-4xl text-white tracking-tight">
            {sectionTitle}
          </h2>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-slate-300 leading-relaxed">
            {sectionSubtitle}
          </p>
        </div>

        {isLoading ? (
          <div className={`grid ${columnClass} gap-5`}>
            {Array.from({ length: Math.max(3, Number(settings.limit || 6)) }).map((_, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden border border-white/10 bg-white/10 backdrop-blur-sm animate-pulse">
                <div className="h-56 bg-white/10" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                  <div className="h-10 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-200 p-4 text-sm text-center">
            {loadError}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm text-slate-200 p-8 text-sm text-center">
            {t('لا توجد عقارات مميزة للعرض حالياً.', 'No featured properties are available right now.')}
          </div>
        ) : (
          <div className={`grid ${columnClass} gap-5`}>
            {items.map((property) => {
              const imageUrl = getPropertyImageUrl(property);
              return (
                <motion.div
                  key={property.id}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                  className="group rounded-2xl overflow-hidden border border-white/10 bg-white/95 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
                >
                  <div className="relative h-56 bg-slate-950 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={language === 'ar' ? property.title.ar : property.title.en}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {property.featured && (
                        <span className="px-2.5 py-1 rounded-full bg-[#D4AF37] text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-[#D4AF37]/25">
                          {t('مميز', 'Featured')}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur text-white text-[10px] font-bold border border-white/10">
                        {language === 'ar' ? property.type.ar : property.type.en}
                      </span>
                    </div>

                    <div className="absolute bottom-4 right-4 left-4 text-white space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-white/85">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{language === 'ar' ? property.location.ar : property.location.en}</span>
                      </div>
                      <h3 className="text-xl font-black leading-tight line-clamp-2">
                      {displayBilingualOrNA(property.title, language)}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-4 flex-1 flex flex-col bg-white/95">
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                      {displayBilingualOrNA(property.description, language)}
                    </p>

                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {language === 'ar'
                        ? property.seoDescAr || property.seoTitleAr || property.title.ar
                        : property.seoDescEn || property.seoTitleEn || property.title.en}
                    </p>

                    {settings.showSpecs !== false && (
                      <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 p-3 text-center">
                        <div className="space-y-1">
                          <BedDouble className="w-4 h-4 mx-auto text-[#D4AF37]" />
                        <div className="text-[10px] text-slate-500 font-bold">{displayNumberOrNA(property.bedrooms)}</div>
                        </div>
                        <div className="space-y-1 border-x border-slate-200 dark:border-slate-800">
                          <Bath className="w-4 h-4 mx-auto text-[#D4AF37]" />
                        <div className="text-[10px] text-slate-500 font-bold">{displayNumberOrNA(property.bathrooms)}</div>
                        </div>
                        <div className="space-y-1">
                          <SquareIcon className="w-4 h-4 mx-auto text-[#D4AF37]" />
                          <div className="text-[10px] text-slate-500 font-bold">{displayNumberOrNA(property.areaSqm)} m²</div>
                        </div>
                      </div>
                    )}

                    {settings.showPrice !== false && (
                      <div className="flex items-center justify-between text-right pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-400 font-bold">
                          {property.currency || 'SAR'}
                        </span>
                        <span className="text-lg font-black text-[#D4AF37]">
                          {displayCurrencyOrNA(property.price, language)}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => navigateToLink(showAllLink)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D4AF37] text-slate-950 font-black text-sm hover:scale-[1.02] transition-transform shadow-lg"
          >
            <span>{showAllText}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </section>
  );
};
