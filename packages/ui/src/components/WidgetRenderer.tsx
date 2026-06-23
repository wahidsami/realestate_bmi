import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Type, AlignLeft, FileText, ChevronDown, List, Table, Minus, 
  Square, Columns, Smartphone, MessageSquare, Share2, Image as ImageIcon, 
  Grid, Play, Film, LayoutGrid, HelpCircle, Layers, Clock, CheckSquare, 
  Tag, UserCheck, MessageCircle, Star, Award, BarChart3, Timer, 
  Users2, Briefcase, ChevronLeft, ChevronRight, Send, Mail, MapPin, Check
} from 'lucide-react';
import { VisualWidget } from '../types';
import { displayBilingualOrNA, displayCurrencyOrNA, displayNumberOrNA } from '@bina/shared';
import { EffectsWrapper, ShapeDivider } from './EffectsWrapper';
import { getIconComponent } from './AmenitiesSection';
import { FullWidthHeroSliderWidget } from './FullWidthHeroSliderWidget';
import { FeaturedPropertiesGridWidget } from './FeaturedPropertiesGridWidget';

interface WidgetRendererProps {
  widget: VisualWidget;
  language: 'ar' | 'en';
  itemData?: any; // Dynamic element context e.g. Selected property or selected project details
}

// Convert spacing presets to tailwind style mappings
export function resolveWidgetStyles(settings: any): React.CSSProperties {
  const styles: React.CSSProperties = {};
  
  // Custom Typography
  if (settings.typography) {
    const ty = settings.typography;
    if (ty.fontSize) {
      const sizeMap = {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      };
      styles.fontSize = sizeMap[ty.fontSize as keyof typeof sizeMap] || ty.fontSize;
    }
    if (ty.fontWeight) {
      const weightMap = {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        black: '900'
      };
      styles.fontWeight = weightMap[ty.fontWeight as keyof typeof weightMap] || ty.fontWeight;
    }
    if (ty.lineHeight) {
      styles.lineHeight = ty.lineHeight;
    }
  }

  // Core background & colors requested
  if (settings.colors?.text) {
    styles.color = settings.colors.text;
  } else if (settings.color) {
    styles.color = settings.color;
  }

  if (settings.colors?.background) {
    styles.backgroundColor = settings.colors.background;
  }

  // Borders customized
  if (settings.borders) {
    const bo = settings.borders;
    if (bo.radius && bo.radius !== 'none') {
      const radiusMap = {
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '1rem',
        full: '9999px'
      };
      styles.borderRadius = radiusMap[bo.radius as keyof typeof radiusMap] || '0px';
    }
    if (bo.width && bo.width !== '0') {
      styles.borderWidth = `${bo.width}px`;
    }
    if (bo.style) {
      styles.borderStyle = bo.style;
    }
    if (bo.color) {
      styles.borderColor = bo.color;
    }
  }

  // Custom Spacing
  if (settings.spacing) {
    const sp = settings.spacing;
    const spacingMap: Record<string, string> = {
      none: '0px',
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2.5rem',
      xl: '4rem'
    };
    if (sp.paddingTop) styles.paddingTop = spacingMap[sp.paddingTop];
    if (sp.paddingBottom) styles.paddingBottom = spacingMap[sp.paddingBottom];
    if (sp.paddingLeft) styles.paddingLeft = spacingMap[sp.paddingLeft];
    if (sp.paddingRight) styles.paddingRight = spacingMap[sp.paddingRight];
    if (sp.marginTop) styles.marginTop = spacingMap[sp.marginTop];
    if (sp.marginBottom) styles.marginBottom = spacingMap[sp.marginBottom];
    if (sp.marginLeft) styles.marginLeft = spacingMap[sp.marginLeft];
    if (sp.marginRight) styles.marginRight = spacingMap[sp.marginRight];
  }

  // Advanced Overlay and Background
  const background = settings.background || (
    settings.backgroundMode || settings.backgroundColor || settings.backgroundImageUrl
      ? {
          mode: settings.backgroundMode,
          color: settings.backgroundColor,
          imageUrl: settings.backgroundImageUrl,
          overlayOpacity: settings.backgroundImageOverlayOpacity,
        }
      : null
  );
  if (background) {
    const mode = background.mode || (background.imageUrl ? 'image' : 'solid');
    const color = background.color || styles.backgroundColor || 'transparent';
    styles.backgroundColor = color;
    if (mode === 'image' && background.imageUrl) {
      const overlayOpacity = Math.max(0, Math.min(100, Number(background.overlayOpacity ?? 65))) / 100;
      styles.backgroundImage = `linear-gradient(rgba(2, 6, 23, ${overlayOpacity}), rgba(2, 6, 23, ${overlayOpacity})), url(${background.imageUrl})`;
      styles.backgroundSize = 'cover';
      styles.backgroundPosition = 'center';
      styles.backgroundRepeat = 'no-repeat';
    }
  }

  return styles;
}

// Map visibility settings into target utility CSS classes
export function resolveVisibilityClasses(settings: any): string {
  if (!settings?.responsiveVisibility) return '';
  const rv = settings.responsiveVisibility;
  const classes: string[] = [];
  
  if (rv.mobile === false) classes.push('max-md:hidden');
  if (rv.tablet === false) classes.push('md:max-lg:hidden');
  if (rv.desktop === false) classes.push('lg:hidden');
  
  return classes.join(' ');
}

// Convert animation presets to Motion Variants
export function resolveAnimationProps(settings: any) {
  const anim = settings?.animation?.type || 'none';
  const hover = settings?.animation?.hoverEffect || 'none';

  let initial = {};
  let animate = {};
  let whileHover = {};
  let transition = { duration: 0.4, ease: 'easeOut' };

  if (anim === 'fade-in') {
    initial = { opacity: 0 };
    animate = { opacity: 1 };
  } else if (anim === 'slide-up') {
    initial = { opacity: 0, y: 30 };
    animate = { opacity: 1, y: 0 };
  } else if (anim === 'zoom-in') {
    initial = { opacity: 0, scale: 0.9 };
    animate = { opacity: 1, scale: 1 };
  } else if (anim === 'bounce') {
    initial = { y: 0 };
    animate = {
      y: [0, -12, 0],
      transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' }
    };
  } else if (anim === 'pulse') {
    initial = { opacity: 0.9 };
    animate = {
      opacity: [0.9, 0.4, 0.9],
      transition: { repeat: Infinity, duration: 2.5 }
    };
  }

  if (hover === 'scaleup') {
    whileHover = { scale: 1.04 };
  } else if (hover === 'glow') {
    whileHover = { boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)' };
  } else if (hover === 'lift') {
    whileHover = { y: -6 };
  }

  return { initial, animate, whileHover, transition };
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget, language, itemData }) => {
  const resolvePlaceholders = (val: string | undefined): string => {
    if (!val) return '';
    if (!itemData) return val;
    let text = val;

    const getBilingualVal = (field: any) => {
      if (!field) return 'N/A';
      if (typeof field === 'string') return field;
      return displayBilingualOrNA(field, language);
    };

    // Construct the placeholder values matches the requirements
    const placeholders: Record<string, string> = {
      '{{title}}': getBilingualVal(itemData.title || itemData.name),
      '{{name}}': getBilingualVal(itemData.name || itemData.title),
      '{{description}}': getBilingualVal(itemData.description),
      '{{developer}}': getBilingualVal(itemData.developer),
      '{{price}}': displayCurrencyOrNA(itemData.price, language),
      '{{location}}': getBilingualVal(itemData.location),
      '{{city}}': getBilingualVal(itemData.city),
      '{{district}}': getBilingualVal(itemData.district),
      '{{address}}': getBilingualVal(itemData.address),
      '{{completion_date}}': itemData.completionDate || 'N/A',
      '{{units}}': displayNumberOrNA(itemData.units),
      '{{bedrooms}}': displayNumberOrNA(itemData.bedrooms),
      '{{bathrooms}}': displayNumberOrNA(itemData.bathrooms),
      '{{area}}': displayNumberOrNA(itemData.areaSqm),
      '{{type}}': getBilingualVal(itemData.type),
      '{{status}}': itemData.status || 'N/A',
    };

    Object.entries(placeholders).forEach(([placeholder, value]) => {
      text = text.replace(new RegExp(placeholder, 'g'), value);
    });

    return text;
  };

  const t = (ar: string | undefined, en: string | undefined) => {
    const raw = language === 'ar' ? ar || en || 'N/A' : en || ar || 'N/A';
    return resolvePlaceholders(raw);
  };

  const isRtl = language === 'ar';
  const settings = widget.settings;
  const styles = resolveWidgetStyles(settings);
  const visibilityClass = resolveVisibilityClasses(settings);
  const { initial, animate, whileHover, transition } = resolveAnimationProps(settings);

  // Sub states
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const [carouselIdx, setCarouselIdx] = useState<number>(0);
  const [openAccordions, setOpenAccordions] = useState<Record<number, boolean>>({});
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({});
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync active tab state
  useEffect(() => {
    if (settings.activeTabIdx !== undefined) {
      setActiveTabIdx(settings.activeTabIdx);
    }
  }, [settings.activeTabIdx]);

  const toggleAccordion = (idx: number) => {
    setOpenAccordions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Carousel timer effect
  useEffect(() => {
    if (widget.type === 'carousel' && settings.images && settings.autoplay) {
      const interval = setInterval(() => {
        setCarouselIdx(prev => (prev + 1) % settings.images.length);
      }, settings.delay || 4000);
      return () => clearInterval(interval);
    }
  }, [widget.type, settings.images, settings.autoplay, settings.delay]);

  // Form handlers
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setContactSubmitted(true);
    }, 1200);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setNewsletterSubmitted(true);
    }, 1000);
  };

  const handleShareClick = () => {
    const shareData = {
      title: t(settings.textAr, settings.textEn),
      url: window.location.href
    };
    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(language === 'ar' ? 'تم نسخ رابط الصفحة إلى الحافظة لسهولة مشاركتها!' : 'URL copied to clipboard for easy sharing!');
    }
  };

  // Render Widget View Content
  const renderWidgetContent = () => {
    switch (widget.type) {
      // ================= TEXT CATEGORY =================
      case 'heading': {
        const sizeClass = settings.size === '3xl' ? 'text-4xl font-extrabold sm:text-5xl' : 
                          settings.size === '2xl' ? 'text-3xl font-bold sm:text-4xl' : 
                          settings.size === 'xl' ? 'text-2xl font-bold' : 
                          'text-xl font-semibold';
        const textVal = t(settings.textAr, settings.textEn);
        const widgetEffects = settings.effects;
        return (
          <h2 
            className={`${sizeClass} leading-tight tracking-tight`}
            style={{ textAlign: settings.align || (isRtl ? 'right' : 'left'), color: settings.color }}
          >
            {widgetEffects?.textReveal && widgetEffects.textReveal !== 'none' ? (
              <EffectsWrapper effects={widgetEffects}>{textVal}</EffectsWrapper>
            ) : (
              textVal
            )}
          </h2>
        );
      }

      case 'text': {
        const textVal = t(settings.textAr, settings.textEn);
        const widgetEffects = settings.effects;
        return (
          <p 
            className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base whitespace-pre-line"
            style={{ textAlign: settings.align || (isRtl ? 'right' : 'left'), color: settings.color }}
          >
            {widgetEffects?.textReveal && widgetEffects.textReveal !== 'none' ? (
              <EffectsWrapper effects={widgetEffects}>{textVal}</EffectsWrapper>
            ) : (
              textVal
            )}
          </p>
        );
      }

      case 'rich_text':
        return (
          <div 
            className="text-slate-700 dark:text-slate-200 leading-relaxed text-sm prose dark:prose-invert max-w-none text-justify"
            style={{ textAlign: settings.align || (isRtl ? 'right' : 'left') }}
            dangerouslySetInnerHTML={{ __html: t(settings.textAr, settings.textEn) }}
          />
        );

      case 'quote':
        return (
          <div 
            className={`p-5 my-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl relative ${
              isRtl ? 'border-r-4 border-[#d4af37] text-right' : 'border-l-4 border-[#d4af37] text-left'
            }`}
          >
            <span className="absolute -top-3 text-5xl text-[#d4af37]/20 font-serif">“</span>
            <p className="italic text-base text-slate-700 dark:text-slate-200 leading-relaxed font-sans font-medium">
              {t(settings.textAr, settings.textEn)}
            </p>
            {(settings.authorAr || settings.authorEn) && (
              <p className="mt-2 text-xs font-bold text-[#d4af37] uppercase tracking-wider">
                — {t(settings.authorAr, settings.authorEn)}
              </p>
            )}
          </div>
        );

      case 'list': {
        const items = isRtl ? (settings.itemsAr || []) : (settings.itemsEn || []);
        const resolvedItems = items.map((item: string) => resolvePlaceholders(item));
        return (
          <ul className="space-y-2.5" style={{ textAlign: isRtl ? 'right' : 'left' }}>
            {resolvedItems.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
                  style={{ backgroundColor: settings.bulletColor || '#d4af37' }}
                />
                <span className="leading-tight">{item}</span>
              </li>
            ))}
          </ul>
        );
      }

      case 'table': {
        const headers = isRtl ? (settings.headersAr || []) : (settings.headersEn || []);
        const rows = isRtl ? (settings.rowsAr || []) : (settings.rowsEn || []);
        const resolvedHeaders = headers.map((h: string) => resolvePlaceholders(h));
        const resolvedRows = rows.map((row: string[]) => row.map((cell: string) => resolvePlaceholders(cell)));
        return (
          <div className="overflow-x-auto w-full border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold" style={{ backgroundColor: settings.headBg }}>
                  {resolvedHeaders.map((h: string, i: number) => (
                    <th key={i} className="p-3 text-right font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {resolvedRows.map((row: string[], j: number) => (
                  <tr key={j} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {row.map((cell: string, k: number) => (
                      <td key={k} className="p-3 font-semibold text-slate-700 dark:text-slate-200">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'divider':
        return (
          <div className="py-2.5 w-full flex justify-center">
            {settings.styleType === 'gold-dots' ? (
              <div className="flex gap-1.5 py-2 justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]/30" />
              </div>
            ) : (
              <hr 
                className="w-full"
                style={{ 
                  borderTopWidth: settings.thickness || '2px', 
                  borderStyle: settings.styleType || 'solid', 
                  borderColor: settings.color || '#e2e8f0' 
                }}
              />
            )}
          </div>
        );

      case 'spacer':
        return (
          <div 
            className="w-full"
            style={{
              height: window.innerWidth < 768 ? (settings.heightMobile || '20px') : (settings.heightDesktop || '40px')
            }}
          />
        );

      // ================= BUTTONS CATEGORY =================
      case 'button':
        return (
          <div className="w-full" style={{ textAlign: settings.align || (isRtl ? 'right' : 'left') }}>
            <a
              href={settings.buttonLink || '#'}
              className="px-6 py-3 rounded-lg text-xs font-black shadow-lg shadow-neutral-900/10 cursor-pointer select-none inline-flex items-center gap-2 hover:opacity-90 transition-opacity text-white"
              style={{ backgroundColor: settings.color || '#0f172a' }}
            >
              <span>{t(settings.textAr, settings.textEn)}</span>
            </a>
          </div>
        );

      case 'dual_button':
        return (
          <div className="w-full flex flex-wrap gap-3" style={{ justifyContent: settings.align === 'center' ? 'center' : settings.align === 'left' ? 'flex-start' : 'flex-end' }}>
            <a
              href={settings.primaryLink || '#'}
              className="px-6 py-3 rounded-lg text-xs font-black bg-stone-900 text-white hover:bg-stone-800 shadow-md transition-all cursor-pointer"
            >
              <span>{t(settings.primaryAr, settings.primaryEn)}</span>
            </a>
            <a
              href={settings.secondaryLink || '#'}
              className="px-6 py-3 rounded-lg text-xs font-black bg-white border border-neutral-200 text-stone-900 hover:bg-neutral-50 shadow-sm transition-all cursor-pointer"
            >
              <span>{t(settings.secondaryAr, settings.secondaryEn)}</span>
            </a>
          </div>
        );

      case 'call_button':
        return (
          <div className="w-full">
            <a
              href={`tel:${settings.phoneNumber}`}
              className="px-6 py-3.5 rounded-xl shadow-lg shadow-[#047857]/10 text-white font-bold text-xs inline-flex items-center gap-2 justify-center bg-emerald-600 hover:bg-emerald-500 w-full md:w-auto"
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>{t(settings.textAr, settings.textEn)}</span>
            </a>
          </div>
        );

      case 'whatsapp_button': {
        const textEncoded = encodeURIComponent(settings.customMessage || '');
        const link = `https://wa.me/${settings.phoneNumber}?text=${textEncoded}`;
        return (
          <div className="w-full">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl text-white font-extrabold text-xs inline-flex items-center gap-2 justify-center bg-[#25D366] hover:bg-[#20ba5a] shadow-lg shadow-emerald-500/20 w-full"
            >
              <MessageSquare className="w-4 h-4 shrink-0 fill-current" />
              <span>{t(settings.textAr, settings.textEn)}</span>
            </a>
          </div>
        );
      }

      case 'share_button':
        return (
          <button
            onClick={handleShareClick}
            className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer inline-flex items-center gap-2"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>{t(settings.textAr, settings.textEn)}</span>
          </button>
        );

      // ================= MEDIA CATEGORY =================
      case 'image':
        return (
          <div className="relative overflow-hidden w-full group rounded-2xl bg-slate-100 shadow-md">
            <img
              src={settings.imageUrl}
              alt={t(settings.altAr, settings.altEn)}
              className="w-full h-full object-cover max-h-[420px] transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {t(settings.altAr, settings.altEn) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white text-right">
                <p className="text-xs font-semibold">{t(settings.altAr, settings.altEn)}</p>
              </div>
            )}
          </div>
        );

      case 'gallery': {
        const images = settings.images || [];
        const colClass = settings.columns === 4 ? 'grid-cols-2 lg:grid-cols-4' : 
                         settings.columns === 3 ? 'grid-cols-1 md:grid-cols-3' : 
                         'grid-cols-2';
        return (
          <div className={`grid gap-3 ${colClass}`}>
            {images.map((img: string, i: number) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-stone-100 shadow-sm relative group">
                <img
                  src={img}
                  alt={`Gallery piece ${i}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        );
      }

      case 'carousel': {
        const slides = settings.images || [];
        if (slides.length === 0) return null;
        return (
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 group shadow-lg">
            <img
              src={slides[carouselIdx]}
              alt={`Carousel frame ${carouselIdx}`}
              className="w-full h-full object-cover transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            {settings.showArrows && (
              <>
                <button
                  onClick={() => setCarouselIdx(p => (p - 1 + slides.length) % slides.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 z-10 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCarouselIdx(p => (p + 1) % slides.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 z-10 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10">
              {slides.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setCarouselIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${carouselIdx === i ? 'bg-white w-4' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </div>
        );
      }

      case 'video':
        return (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-md">
            <iframe
              src={settings.videoUrl}
              title="Promotional video player"
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );

      case 'logo_grid': {
        const logos = settings.logos || [];
        const cols = settings.cols || 3;
        const gridColsClass = cols === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3';
        return (
          <div className={`grid gap-6 items-center justify-items-center ${gridColsClass}`}>
            {logos.map((logo: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl max-w-[140px] flex items-center justify-center ${
                  settings.grayscale ? 'filter grayscale hover:grayscale-0 transition-all duration-500' : ''
                }`}
              >
                <img src={logo.url} alt={logo.name} className="max-h-12 max-w-full object-contain" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        );
      }

      // ================= CONTENT CATEGORY =================
      case 'accordion': {
        const items = isRtl ? (settings.itemsAr || []) : (settings.itemsEn || []);
        return (
          <div className="space-y-2 text-right">
            {items.map((item: any, i: number) => (
              <div key={i} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleAccordion(i)}
                  className="w-full flex items-center justify-between p-4 font-bold text-xs select-none text-slate-800 dark:text-slate-100"
                >
                  <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${openAccordions[i] ? 'rotate-180' : ''}`} />
                  <span>{item.title}</span>
                </button>
                {openAccordions[i] && (
                  <div className="p-4 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                    <p>{item.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }

      case 'faq': {
        const qas = isRtl ? (settings.questionsAr || []) : (settings.questionsEn || []);
        return (
          <div className="space-y-3.5 text-right">
            {qas.map((item: any, i: number) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between font-extrabold text-xs text-slate-900 dark:text-white"
                >
                  <Plus className={`w-3.5 h-3.5 text-[#d4af37] transition-transform ${openFaqs[i] ? 'rotate-45' : ''}`} />
                  <span>{item.q}</span>
                </button>
                {openFaqs[i] && (
                  <p className="mt-2 text-[11px] leading-relaxed text-stone-600 dark:text-stone-300 pr-4 border-r border-[#d4af37]">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        );
      }

      case 'tabs': {
        const tabList = isRtl ? (settings.tabsAr || []) : (settings.tabsEn || []);
        if (tabList.length === 0) return null;
        return (
          <div className="space-y-4 text-right">
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4" dir={isRtl ? 'rtl' : 'ltr'}>
              {tabList.map((tab: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveTabIdx(i)}
                  className={`pb-2.5 text-xs font-bold transition-all relative ${
                    activeTabIdx === i ? 'text-[#d4af37]' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span>{tab.title}</span>
                  {activeTabIdx === i && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#d4af37]" />
                  )}
                </button>
              ))}
            </div>
            <div className="p-4 bg-neutral-50 dark:bg-slate-900 rounded-xl text-xs leading-relaxed text-slate-700 dark:text-slate-200">
              <p>{tabList[activeTabIdx]?.content}</p>
            </div>
          </div>
        );
      }

      case 'timeline': {
        const events = isRtl ? (settings.eventsAr || []) : (settings.eventsEn || []);
        return (
          <div className="relative border-r-2 border-slate-200 dark:border-slate-800 pr-5 space-y-6 text-right font-sans" dir="rtl">
            {events.map((ev: any, i: number) => (
              <div key={i} className="relative">
                <span className={`absolute -right-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
                  ev.completed ? 'bg-emerald-500 border-white dark:border-slate-900' : 'bg-white border-slate-300 dark:bg-slate-950 dark:border-slate-800'
                }`} />
                <p className="text-[10px] font-bold text-[#d4af37] tracking-wider uppercase mb-1">{ev.date}</p>
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white leading-tight">{ev.title}</h4>
              </div>
            ))}
          </div>
        );
      }

      case 'feature_list': {
        const feats = isRtl ? (settings.featuresAr || []) : (settings.featuresEn || []);
        return (
          <div className="space-y-4 text-right">
            {feats.map((feat: any, i: number) => (
              <div key={i} className="flex gap-3 leading-tight text-right items-start" dir="rtl">
                <span className="p-1.5 rounded-lg bg-[#d4af37]/10 text-[#d4af37] mt-0.5">
                  <Check className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{feat.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-1">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'feature_grid': {
        const cardList = isRtl ? (settings.cardsAr || []) : (settings.cardsEn || []);
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {cardList.map((card: any, i: number) => (
              <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm text-right">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{card.title}</h4>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-normal">{card.desc}</p>
              </div>
            ))}
          </div>
        );
      }

      case 'amenities_section': {
        const titleText = isRtl ? (settings.titleAr || '') : (settings.titleEn || '');
        const items = settings.amenities || [];
        return (
          <div className="space-y-4">
            {titleText && (
              <h3 className="font-sans font-extrabold text-[#B45309] text-sm text-right">
                {titleText}
              </h3>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-right">
              {items.map((item: any, i: number) => {
                const IconComponent = getIconComponent(item.icon);
                return (
                  <div 
                    key={i} 
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex flex-col items-center justify-between text-center gap-3 shadow-xs hover:border-[#B45309]/30 transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-55/40 text-[#B45309] dark:text-amber-500 flex items-center justify-center">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-slate-800 dark:text-slate-200 font-sans font-extrabold text-xs leading-normal">
                      {isRtl ? item.labelAr : item.labelEn}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'pricing_table': {
        const tiers = isRtl ? (settings.tiersAr || []) : (settings.tiersEn || []);
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tiers.map((tier: any, i: number) => (
              <div 
                key={i} 
                className={`p-5 rounded-2xl border text-right relative flex flex-col justify-between ${
                  tier.hot ? 'border-[#d4af37] bg-slate-950 text-white shadow-xl ring-2 ring-[#d4af37]/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                {tier.hot && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#d4af37] text-slate-950 font-black text-[8px] rounded uppercase tracking-widest">
                    {language === 'ar' ? 'مميز' : 'Hot Offer'}
                  </span>
                )}
                <div>
                  <h4 className="text-xs font-bold text-[#d4af37]">{tier.name}</h4>
                  <p className="text-2xl font-black mt-2 tracking-tight">{tier.price}</p>
                  <ul className="mt-4 space-y-2 text-[10px] text-slate-400 leading-normal border-t border-slate-100 dark:border-slate-800 pt-3">
                    {tier.features.map((f: string, j: number) => (
                      <li key={j} className="flex gap-1.5 justify-end items-center">
                        <span>{f}</span>
                        <Check className="w-3 h-3 text-[#d4af37]" />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5">
                  <button className="w-full py-2 bg-[#d4af37] text-slate-950 font-black text-[10px] rounded-lg cursor-pointer">
                    {tier.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      }

      // ================= SOCIAL CATEGORY =================
      case 'testimonials': {
        const items = isRtl ? (settings.itemsAr || []) : (settings.itemsEn || []);
        return (
          <div className="space-y-4">
            {items.map((item: any, i: number) => (
              <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm text-right" dir="rtl">
                <div className="flex items-center gap-3 mb-3">
                  <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">{item.name}</h4>
                    <p className="text-[9px] text-slate-400">{item.title}</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 italic mb-2 select-none leading-relaxed">
                  “{item.quote}”
                </p>
                <div className="flex gap-0.5">
                  <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
                  <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
                  <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
                  <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
                  <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'reviews':
        return (
          <div className="p-4 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-2xl text-center font-sans space-y-2">
            <h4 className="text-xs font-black text-slate-900 dark:text-white tracking-wide">{t(settings.platformAr, settings.platformEn)}</h4>
            <div className="flex gap-0.5 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#d4af37] text-[#d4af37]" />
              ))}
            </div>
            <p className="text-xl font-black text-[#d4af37]">{settings.score}</p>
            <p className="text-[10px] text-slate-500 leading-normal">{t(settings.textAr, settings.textEn)}</p>
          </div>
        );

      case 'ratings':
        return (
          <div className="text-center py-2 space-y-2">
            <div className="flex gap-1 justify-center">
              {[...Array(settings.stars || 5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#d4af37] text-[#d4af37]" />
              ))}
            </div>
            <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
              {t(settings.labelAr, settings.labelEn)}
            </p>
          </div>
        );

      case 'client_logos': {
        const logoSet = settings.images || [];
        return (
          <div className="flex flex-wrap gap-6 items-center justify-center py-2">
            {logoSet.map((logo: string, i: number) => (
              <img 
                key={i} 
                src={logo} 
                alt="Partner Brand Badge" 
                className="h-7 object-contain opacity-50 hover:opacity-100 transition-all filter grayscale hover:grayscale-0"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
        );
      }

      // ================= BUSINESS CATEGORY =================
      case 'statistics': {
        const stats = isRtl ? (settings.statsAr || []) : (settings.statsEn || []);
        return (
          <div className="grid grid-cols-2 gap-4">
            {stats.map((item: any, i: number) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-center border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-lg md:text-xl font-black text-[#d4af37] tracking-tight">{item.number}</p>
                <p className="text-[9px] text-slate-400 mt-1 leading-normal font-semibold">{item.label}</p>
              </div>
            ))}
          </div>
        );
      }

      case 'counters':
        return (
          <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
              {settings.targetNumber || 0}
            </p>
            <p className="text-[10px] font-bold text-[#d4af37] mt-1">
              {t(settings.suffixAr, settings.suffixEn)}
            </p>
          </div>
        );

      case 'team_members': {
        const staff = isRtl ? (settings.membersAr || []) : (settings.membersEn || []);
        return (
          <div className="space-y-4">
            {staff.map((person: any, i: number) => (
              <div key={i} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-3 text-right" dir="rtl">
                <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">{person.name}</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">{person.role}</p>
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'services': {
        const svcs = isRtl ? (settings.servicesAr || []) : (settings.servicesEn || []);
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {svcs.map((svc: any, i: number) => (
              <div key={i} className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 rounded-2xl text-right">
                <h4 className="text-xs font-bold text-[#d4af37] leading-tight">{svc.title}</h4>
                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{svc.desc}</p>
              </div>
            ))}
          </div>
        );
      }

      case 'portfolio':
        return (
          <div className="p-4 bg-slate-950 text-white rounded-2xl text-right border border-[#d4af37]/30 shadow-xl space-y-3" dir="rtl">
            <div>
              <span className="px-2 py-0.5 bg-[#d4af37] text-slate-950 font-black text-[8px] rounded uppercase">VIP PORTFOLIO</span>
              <h4 className="text-xs font-black mt-1.5">{t(settings.titleAr, settings.titleEn)}</h4>
              <p className="text-[10px] text-slate-400 mt-1">{settings.totalActiveVillas}</p>
            </div>
            <a 
              href={settings.brochureLink || '#'} 
              className="mt-2 text-[10px] font-black py-2 px-3 text-slate-950 bg-[#d4af37] hover:bg-[#c09d30] rounded-lg inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'ar' ? '📖 تحميل كتيب الأصول' : '📖 Download Assets brochure'}</span>
            </a>
          </div>
        );

      case 'projects': {
        const items = isRtl ? (settings.projectsAr || []) : (settings.projectsEn || []);
        return (
          <div className="space-y-3">
            {items.map((proj: any, i: number) => (
              <div key={i} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 text-right" dir="rtl">
                <div className="h-28 bg-stone-100 relative">
                  <img src={proj.cover} alt="Active construction layout" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-[8px] text-emerald-400 rounded-md font-mono">
                    {proj.progress}%
                  </span>
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{proj.name}</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">{proj.location}</p>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${proj.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      }

      // ================= CONTACT CATEGORY =================
      case 'contact_form':
        return (
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-right relative shadow-xl">
            {contactSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <span className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl">✓</span>
                <h4 className="text-xs font-black text-slate-950 dark:text-white">
                  {language === 'ar' ? 'تم استلام طلب الاستشارة السكنية!' : 'Your Consultation Request Received!'}
                </h4>
                <p className="text-[10px] text-slate-500">
                  {language === 'ar' ? 'سيقوم وكيل المبيعات الحصري بالتواصل معك عبر الهاتف خلال ساعة.' : 'Our prestigious sales advisor will connect via phone within an hour.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3.5">
                <h4 className="text-xs font-black text-slate-950 dark:text-white">{t(settings.buttonTextAr, settings.buttonTextEn)}</h4>
                <div className="space-y-1">
                  <input
                    type="text"
                    required
                    placeholder={t(settings.placeholderNameAr, settings.placeholderNameEn)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-right focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="tel"
                    required
                    placeholder={language === 'ar' ? 'رقم الجوال الخاص بك' : 'Your Contact Phone Number'}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-right focus:outline-none focus:border-[#d4af37] font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="email"
                    required
                    placeholder={language === 'ar' ? 'عنوان بريدك الإلكتروني المفضل' : 'Your Secure Business Email'}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-right focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#d4af37] text-slate-950 font-black text-xs rounded-lg uppercase cursor-pointer hover:opacity-95 transition-opacity disabled:opacity-50"
                >
                  {loading ? t(settings.submittingTextAr, settings.submittingTextEn) : t(settings.buttonTextAr, settings.buttonTextEn)}
                </button>
              </form>
            )}
          </div>
        );

      case 'newsletter':
        return (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-right">
            {newsletterSubmitted ? (
               <div className="text-center py-4 space-y-1">
                 <p className="text-xs font-extrabold text-emerald-500">✓ {language === 'ar' ? 'مستثمر مقيد بالنجاح!' : 'Successfully Listed VIP Investor!'}</p>
                 <p className="text-[10px] text-slate-500">{language === 'ar' ? 'ستصلك عروض الصفقات العاجلة أولاً.' : 'Private briefings will arrive securely to your inbox.'}</p>
               </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">{t(settings.titleAr, settings.titleEn)}</h4>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#d4af37] text-slate-950 text-xs font-black rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    {language === 'ar' ? 'انضم' : 'Join'}
                  </button>
                  <input
                    type="email"
                    required
                    placeholder="email@luxury.com"
                    className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </form>
            )}
          </div>
        );

      case 'hero_slider':
        return (
          <FullWidthHeroSliderWidget
            widget={widget}
            language={language}
          />
        );

      case 'property_grid':
        return (
          <FeaturedPropertiesGridWidget
            widget={widget}
            language={language}
          />
        );

      case 'map':
        return (
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 relative bg-slate-50">
            <iframe
              src={settings.embedUrl}
              title="Location navigation tracker map"
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        );

      default:
        return (
          <div className="p-3 border border-dashed rounded text-xs text-slate-400 text-center">
            Unsupported Dynamic Widget type "{widget.type}"
          </div>
        );
    }
  };

  return (
    <EffectsWrapper
      effects={widget.settings?.effects}
      className={visibilityClass}
      style={styles}
    >
      <motion.div
        id={`widget-renderer-wrap-${widget.id}`}
        className="w-full h-full overflow-hidden transition-all"
        initial={initial}
        animate={animate}
        whileHover={whileHover}
        transition={transition}
      >
        {renderWidgetContent()}
      </motion.div>
    </EffectsWrapper>
  );
};

// Simple Plus component replacement since Lucide may have version mismatch
const Plus: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

interface VisualPageRendererProps {
  page: any; // VisualPage
  language: 'ar' | 'en';
  itemData?: any; // Dynamic element context e.g. Selected property or selected project details
}

export const VisualPageRenderer: React.FC<VisualPageRendererProps> = ({ page, language, itemData }) => {
  if (!page || !page.sections) return null;

  const getColSpanClass = (span: number) => {
    const spans: Record<number, string> = {
      12: 'col-span-12',
      11: 'col-span-12 md:col-span-11',
      10: 'col-span-12 md:col-span-10',
      9: 'col-span-12 md:col-span-9',
      8: 'col-span-12 md:col-span-8',
      7: 'col-span-12 md:col-span-7',
      6: 'col-span-12 md:col-span-6',
      5: 'col-span-12 md:col-span-5',
      4: 'col-span-12 md:col-span-4',
      3: 'col-span-12 md:col-span-3',
      2: 'col-span-12 md:col-span-2',
      1: 'col-span-12 md:col-span-1',
    };
    return spans[span] || 'col-span-12';
  };

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="w-full">
      {page.sections
        .filter((sec: any) => sec.visible !== false)
        .map((sec: any) => {
          const hasHeroSlider = sec.rows?.some((row: any) =>
            row.columns?.some((col: any) =>
              col.widgets?.some((wid: any) => wid.type === 'hero_slider')
            )
          );
          return (
            <EffectsWrapper
              key={sec.id}
              effects={sec.effects}
              className="w-full relative overflow-hidden transition-all first:border-0"
              style={{
                backgroundColor: sec.backgroundColor || '#ffffff',
                paddingTop: hasHeroSlider ? '0' : (sec.paddingY === 'large' ? '5rem' : sec.paddingY === 'medium' ? '3rem' : sec.paddingY === 'small' ? '1.5rem' : '0'),
                paddingBottom: hasHeroSlider ? '0' : (sec.paddingY === 'large' ? '5rem' : sec.paddingY === 'medium' ? '3rem' : sec.paddingY === 'small' ? '1.5rem' : '0'),
              }}
            >
              {sec.effects?.shapeDividerTop && sec.effects.shapeDividerTop !== 'none' && (
                <ShapeDivider
                  type={sec.effects.shapeDividerTop}
                  position="top"
                  color={sec.effects.shapeDividerTopColor || '#ffffff'}
                  height={sec.effects.shapeDividerTopHeight || 120}
                />
              )}
              {sec.effects?.shapeDividerBottom && sec.effects.shapeDividerBottom !== 'none' && (
                <ShapeDivider
                  type={sec.effects.shapeDividerBottom}
                  position="bottom"
                  color={sec.effects.shapeDividerBottomColor || '#ffffff'}
                  height={sec.effects.shapeDividerBottomHeight || 120}
                />
              )}
              <div className={hasHeroSlider ? "w-full relative z-20" : "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-20"}>
                {sec.rows.map((row: any) => (
                  <div
                    key={row.id}
                    className={hasHeroSlider ? "w-full relative" : "grid grid-cols-12 gap-8 items-center w-full"}
                  >
                    {row.columns.map((col: any) => (
                      <div
                        key={col.id}
                        className={hasHeroSlider ? "w-full" : `${getColSpanClass(col.span)} flex flex-col justify-center space-y-5`}
                      >
                        {col.widgets.map((wid: any) => (
                          <WidgetRenderer
                            key={wid.id}
                            widget={wid}
                            language={language}
                            itemData={itemData}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </EffectsWrapper>
          );
        })}
    </div>
  );
};
