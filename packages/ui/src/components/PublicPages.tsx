/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  propertyRepository, 
  projectRepository, 
  inquiryRepository, 
  pageRepository,
  mediaRepository,
  visualPagesRepository
} from '@bina/shared';
import { apiClient } from '@bina/shared';
import { PLACEHOLDER_PROPERTY_FEATURED_MEDIA_ID, PLACEHOLDER_PROPERTY_GALLERY_MEDIA_ID } from '@bina/shared';
import { VisualPageRenderer } from './WidgetRenderer';
import { AmenitiesSection } from './AmenitiesSection';
import { PropertyDetailsPageContent } from './PropertyDetailsPageContent';
import { Property, Project, PageContent, Inquiry, MediaItem, HeroSlide } from '@bina/types';
import { NajdiVillaVector, PenthouseVector, SmartApartmentVector, ArchitecturalPlanSVG } from './VectorGraphics';
import { readStorageItem, removeStorageItem, writeStorageItem } from '@bina/utils';
import { displayBilingualOrNA, displayCurrencyOrNA, displayNumberOrNA } from '@bina/shared';
import { 
  Compass, 
  Award, 
  Maximize, 
  BedDouble, 
  Bath, 
  MapPin, 
  Sparkles, 
  User, 
  Phone, 
  Mail, 
  MessageSquare,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Sliders
} from 'lucide-react';

interface PublicPagesProps {
  activePage: string;
  onNavigate?: (page: string) => void;
}

type PropertySearchFilter = {
  type: string;
  district: string;
  beds: string;
  budget: string;
};

const DEFAULT_PROPERTY_SEARCH_FILTER: PropertySearchFilter = {
  type: 'all',
  district: 'all',
  beds: 'all',
  budget: 'all'
};

const readPropertySearchFilter = (): PropertySearchFilter => {
  const raw = readStorageItem('session', 'property_search_filter');
  if (!raw) return DEFAULT_PROPERTY_SEARCH_FILTER;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_PROPERTY_SEARCH_FILTER;

    return {
      type: typeof parsed.type === 'string' && parsed.type ? parsed.type : 'all',
      district: typeof parsed.district === 'string' && parsed.district ? parsed.district : 'all',
      beds: typeof parsed.beds === 'string' && parsed.beds ? parsed.beds : 'all',
      budget: typeof parsed.budget === 'string' && parsed.budget ? parsed.budget : 'all'
    };
  } catch (error) {
    console.error('Failed parsing property search filter from storage:', error);
    return DEFAULT_PROPERTY_SEARCH_FILTER;
  }
};

export const PublicPages: React.FC<PublicPagesProps> = ({ activePage, onNavigate }) => {
  const { staticT, t, language } = useLanguage();
  const { theme, settings } = useTheme();

  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pages, setPages] = useState<Record<string, PageContent>>({});
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [mediaItems, setMediaItems] = useState<Record<string, string>>({}); // id -> base64
  const [visualPages, setVisualPages] = useState<any[]>([]);
  const [propertySearchFilter, setPropertySearchFilter] = useState<PropertySearchFilter>(DEFAULT_PROPERTY_SEARCH_FILTER);

  // Subscribe to Page Builder published elements
  useEffect(() => {
    let mounted = true;

    const loadVisualPages = async () => {
      try {
        const pages = await visualPagesRepository.getPages();
        if (mounted) {
          setVisualPages(pages);
        }
      } catch (error) {
        console.error('Failed to load visual pages from API:', error);
        if (mounted) {
          setVisualPages(visualPagesRepository.getPagesSync());
        }
      }
    };

    loadVisualPages();
    const handleUpdate = () => {
      setVisualPages(visualPagesRepository.getPagesSync());
    };
    const unsubscribe = visualPagesRepository.subscribe(handleUpdate);
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (activePage !== 'properties') return;
    setPropertySearchFilter(readPropertySearchFilter());
  }, [activePage]);
  
  // Contact Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [linkedPropertyId, setLinkedPropertyId] = useState('');
  const [linkedProjectId, setLinkedProjectId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Home Page Form States
  const [homeName, setHomeName] = useState('');
  const [homePhone, setHomePhone] = useState('');
  const [homeEmail, setHomeEmail] = useState('');
  const [homeMsg, setHomeMsg] = useState('');
  const [homeInquirySuccess, setHomeInquirySuccess] = useState(false);

  // Hero Slider states
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  const defaultSlides: HeroSlide[] = [
    {
      id: 'default_slide_1',
      title: { ar: 'بناء العهد الجديد من الفخامة', en: 'Forging the New Era of Luxury' },
      subtitle: { ar: 'فلل وقصور عصرية مستوحاة من العراقة النجدية والتطوير العمراني المتكامل.', en: 'Modern villas and mansions inspired by Najdi architectural heritage and integrated urban planning.' },
      ctaText: { ar: 'اكتشف فلل النخبة', en: 'Discover Elite Villas' },
      ctaPage: 'properties'
    },
    {
      id: 'default_slide_2',
      title: { ar: 'أبراج نخبوية تعانق طموح الأفق', en: 'Elite Towers Embracing Horizon Ambitions' },
      subtitle: { ar: 'شقق بنتهاوس فاخرة بإطلالات بانورامية خلابة ومسابح معلقة خاصة.', en: 'Premium penthouse apartments with majestic panoramic vistas and private glass-edge pools.' },
      ctaText: { ar: 'تصفح شقق البنتهاوس', en: 'Explore Penthouses' },
      ctaPage: 'properties'
    },
    {
      id: 'default_slide_3',
      title: { ar: 'تطوير هندسي بمقاييس الغد', en: 'Engineering Development to Tomorrow Standards' },
      subtitle: { ar: 'مجمعات سكنية ومقرات إدارية متكاملة الذكاء تحت مظلة رؤية المملكة ٢٠٣٠.', en: 'Smart-integrated residential hubs and administrative districts aligned with Saudi Vision 2030.' },
      ctaText: { ar: 'رؤية مشاريعنا الكبرى', en: 'View Mega Projects' },
      ctaPage: 'projects'
    }
  ];

  const normalizeProjectStatus = (status?: string) => {
    const value = String(status || '').toLowerCase();
    if (value === 'sold' || value === 'sold-out' || value === 'under-construction') return value;
    return 'available';
  };

  const getProjectStatusLabel = (status?: string) => {
    const normalized = normalizeProjectStatus(status);
    if (normalized === 'sold') {
      return language === 'ar' ? 'مباع بالكامل' : 'Sold';
    }
    if (normalized === 'sold-out') {
      return language === 'ar' ? 'مباع بالكامل' : 'Sold Out';
    }
    if (normalized === 'under-construction') {
      return language === 'ar' ? 'تحت الإنشاء' : 'Under Construction';
    }
    return language === 'ar' ? 'متاح للطلب' : 'Available';
  };

  const slidesToRender = settings?.heroSlides && settings.heroSlides.length > 0 
    ? settings.heroSlides 
    : defaultSlides;

  // Slider Autoplay Interval Loop
  useEffect(() => {
    if (slidesToRender.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlideIdx(prev => (prev + 1) % slidesToRender.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slidesToRender.length]);

  // Load Database Records upon entering a page
  useEffect(() => {
    setSelectedProject(null);
    setSelectedProperty(null);
    const loadData = async () => {
      try {
        if (import.meta.env?.DEV) {
          console.log('[PublicPages] Loading public website data from API');
        }
        const props = await propertyRepository.getProperties();
        const projs = await projectRepository.getProjects();
        const pageList = await pageRepository.getPages();
        const media = await mediaRepository.getMediaItems();

        const mediaMap: Record<string, string> = {};
        media.forEach(m => {
          mediaMap[m.id] = m.base64Data;
        });

        const pageMap: Record<string, PageContent> = {};
        pageList.forEach(p => {
          pageMap[p.slug] = p;
        });

        setProperties(props);
        setProjects(projs);
        setPages(pageMap);
        setMediaItems(mediaMap);
      } catch (err) {
        console.error('Error reading corporate storage:', err);
      }
    };
    loadData();
  }, [activePage]);

  // Handle inquiry dispatching (mock to repository)
  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    setIsSubmitting(true);
    try {
      await inquiryRepository.createInquiry({
        fullName,
        email,
        phone,
        message,
        propertyId: linkedPropertyId || undefined,
        projectId: linkedProjectId || undefined,
        status: 'new'
      });
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        // Clear forms
        setFullName('');
        setEmail('');
        setPhone('');
        setMessage('');
        setLinkedPropertyId('');
        setLinkedProjectId('');
      }, 800);
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleHomeInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeName || !homePhone) return;
    try {
      await inquiryRepository.createInquiry({
        fullName: homeName,
        email: homeEmail,
        phone: homePhone,
        message: homeMsg,
        status: 'new'
      });
      setHomeInquirySuccess(true);
      setHomeName('');
      setHomeEmail('');
      setHomePhone('');
      setHomeMsg('');
      setTimeout(() => setHomeInquirySuccess(false), 9000);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to render property or project primary image
  const renderItemImage = (featuredImageId?: string, type?: string) => {
    if (featuredImageId && mediaItems[featuredImageId]) {
      return (
        <img 
          src={mediaItems[featuredImageId]} 
          alt="BINA luxury asset" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      );
    }
    if (featuredImageId) {
      return (
        <img
          src={apiClient.getAbsoluteUrl(`/api/media/${featuredImageId}/file`)}
          alt="BINA luxury asset"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      );
    }
    if (mediaItems[PLACEHOLDER_PROPERTY_FEATURED_MEDIA_ID]) {
      return (
        <img
          src={mediaItems[PLACEHOLDER_PROPERTY_FEATURED_MEDIA_ID]}
          alt="BINA luxury asset"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      );
    }
    return (
      <img
        src={apiClient.getAbsoluteUrl(`/api/media/${PLACEHOLDER_PROPERTY_FEATURED_MEDIA_ID}/file`)}
        alt="BINA luxury asset"
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    );
  };

  // PAGE RENDER OVERRIDES USING DYNAMIC VISUAL BUILDER PAGES AND TEMPLATES
  const isPropertyDetailPage = activePage.startsWith('property-');
  const propertyIdFromPageName = isPropertyDetailPage ? activePage.substring('property-'.length) : null;
  const currentPropertyToRender = propertyIdFromPageName 
    ? (properties.find(p => p.id === propertyIdFromPageName || p.unitCode === propertyIdFromPageName) || null)
    : selectedProperty;

  if (currentPropertyToRender) {
    return (
      <PropertyDetailsPageContent
        property={currentPropertyToRender}
        properties={properties}
        projects={projects}
        mediaItems={mediaItems}
        language={language}
        theme={theme}
        onNavigate={onNavigate}
        onBackToListing={() => {
          setSelectedProperty(null);
          if (onNavigate) onNavigate('properties');
        }}
      />
    );
  }

  const activeVisualPage = visualPages.find(p => p.slug === activePage && p.status === 'published');
  if (activeVisualPage) {
    // Dynamically apply document title
    const isAr = language === 'ar';
    const visualTitle = isAr ? activeVisualPage.titleAr : activeVisualPage.titleEn;
    if (visualTitle) {
      document.title = visualTitle;
    }
    return (
      <div id={`pub-visual-page-${activeVisualPage.slug}`} className="w-full pb-16">
        <VisualPageRenderer page={activeVisualPage} language={language} />
      </div>
    );
  }

  // Page 1: HOME
  if (activePage === 'home') {
    const homeContent = pages['home'];
    return (
      <div id="pub-page-home" className="space-y-24 pb-24">
        
        {/* State-of-the-art Luxury Hero Slider */}
        <section 
          id="home-hero-slider" 
          className="relative min-h-[85vh] sm:min-h-[82vh] lg:min-h-[80vh] flex items-center justify-center text-white overflow-hidden bg-neutral-950 select-none font-sans"
        >
          {/* Slides Carousel Wrapper with cross-fade transition */}
          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="wait">
              {slidesToRender.map((slide, sIdx) => {
                if (sIdx !== activeSlideIdx) return null;
                const usesUploadedImage = slide.imageUploadId && mediaItems[slide.imageUploadId];
                return (
                  <motion.div
                    key={slide.id || sIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.1, ease: 'easeInOut' }}
                    className="absolute inset-0 w-full h-full"
                  >
                    {/* Background Overlay Dimmer */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/70 z-10" />
                    
                    {usesUploadedImage ? (
                      <img 
                        src={mediaItems[slide.imageUploadId!]} 
                        alt="BINA luxury slide backdrop" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      // Render fallback vector graphics or a majestic design
                      <div className="w-full h-full flex items-center justify-center relative opacity-25">
                        {sIdx % 3 === 0 ? (
                          <NajdiVillaVector className="w-full h-full object-cover" />
                        ) : sIdx % 3 === 1 ? (
                          <PenthouseVector className="w-full h-full object-cover" />
                        ) : (
                          <SmartApartmentVector className="w-full h-full object-cover" />
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Absolute decorative Najdi frame lines */}
          <div className="absolute inset-x-0 bottom-0 h-4 bg-[linear-gradient(90deg,_#D4AF37_0%,_transparent_50%,_#D4AF37_100%)] opacity-35 z-20 pointer-events-none" />

          {/* Foreground slide text card */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20 space-y-7 py-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-xs font-semibold tracking-wider text-(--color-secondary) uppercase mb-3 animate-pulse">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>{staticT('saudiVision')}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlideIdx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h1 className="font-sans font-black text-3xl sm:text-5xl md:text-6xl tracking-tight leading-tight md:leading-snug max-w-4xl mx-auto text-white">
                  {language === 'ar' ? slidesToRender[activeSlideIdx].title.ar : slidesToRender[activeSlideIdx].title.en}
                </h1>
                
                <p className="text-white/80 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
                  {language === 'ar' ? slidesToRender[activeSlideIdx].subtitle.ar : slidesToRender[activeSlideIdx].subtitle.en}
                </p>

                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <button 
                    onClick={() => {
                      const pageDirection = slidesToRender[activeSlideIdx].ctaPage || 'properties';
                      onNavigate?.(pageDirection as any);
                    }}
                    className="px-8 py-3.5 rounded-lg font-sans text-xs sm:text-sm font-black tracking-wide text-black hover:scale-[1.03] transition-all duration-350 shadow-xl flex items-center gap-2 auto-cols-max cursor-pointer select-none"
                    style={{ backgroundColor: theme.secondary || '#B45309' }}
                  >
                    <span>{language === 'ar' ? slidesToRender[activeSlideIdx].ctaText.ar : slidesToRender[activeSlideIdx].ctaText.en}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Left Arrow Nav */}
          {slidesToRender.length > 1 && (
            <button
              onClick={() => setActiveSlideIdx(prev => (prev - 1 + slidesToRender.length) % slidesToRender.length)}
              className="absolute left-4 sm:left-6 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/80 text-white cursor-pointer transition-all active:scale-90"
            >
              <ChevronLeft className="w-5 h-5 shrink-0" />
            </button>
          )}

          {/* Right Arrow Nav */}
          {slidesToRender.length > 1 && (
            <button
              onClick={() => setActiveSlideIdx(prev => (prev + 1) % slidesToRender.length)}
              className="absolute right-4 sm:right-6 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/80 text-white cursor-pointer transition-all active:scale-90"
            >
              <ChevronRight className="w-5 h-5 shrink-0" />
            </button>
          )}

          {/* Pagination Indicators Dots */}
          {slidesToRender.length > 1 && (
            <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2 z-30 pointer-events-auto">
              {slidesToRender.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setActiveSlideIdx(dotIdx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    dotIdx === activeSlideIdx ? 'w-8 bg-[#D4AF37]' : 'w-2.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </section>

        {/* Corporate Vision & Strategic Pillars */}
        {homeContent?.sections && (
          <section id="home-strategic-pillars" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {homeContent.sections.map((sec, idx) => (
                <div 
                  key={sec.id} 
                  className="p-8 rounded-2xl border border-neutral-200 bg-white shadow-sm flex flex-col justify-between transition-all duration-350 hover:shadow-md hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-full bg-(--color-primary)/10 flex items-center justify-center">
                      {idx === 0 ? <Compass className="w-6 h-6 text-(--color-primary)" /> : <Award className="w-6 h-6 text-(--color-primary)" />}
                    </div>
                    <h3 className="font-sans font-bold text-xl text-neutral-900 text-right">{t(sec.title)}</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed text-right">{t(sec.body)}</p>
                  </div>
                  <div className="absolute right-0 bottom-0 w-32 h-32 opacity-5 pointer-events-none">
                    <ArchitecturalPlanSVG />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Curator's Choice of Featured Mega Projects */}
        <section id="pub-featured-projects" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="block text-xs uppercase tracking-widest font-black text-(--color-secondary)" style={{ color: theme.secondary }}>
              {language === 'ar' ? 'البوابة المعمارية والمشاريع الكبرى' : 'Portfolio of Megaprojects'}
            </span>
            <h2 className="font-sans font-bold text-3xl text-neutral-900 tracking-tight">
              {language === 'ar' ? 'مشاريع نخبوية تجسد العهد الجديد' : 'Strategic Premium Developments'}
            </h2>
            <div className="w-20 h-1 mx-auto rounded" style={{ backgroundColor: theme.secondary }}></div>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-10 text-neutral-400 font-semibold">
              {language === 'ar' ? 'لم يتم إضافة مشاريع مسجلة بعد.' : 'No premium master developments added yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projects.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-lg cursor-pointer transition-all duration-350 flex flex-col justify-between group"
                >
                  <div className="h-56 relative overflow-hidden bg-neutral-950">
                    {renderItemImage(p.coverImageId, t(p.name))}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-350" />
                    
                    {p.featured && (
                      <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-[#B45309] text-white">
                        {language === 'ar' ? 'مشروع فريد' : 'Masterpiece'}
                      </span>
                    )}

                    <span className="absolute bottom-4 left-4 text-[10px] bg-black/60 font-semibold px-2.5 py-1 rounded text-white border border-white/10">
                      {p.city && language === 'ar' ? p.city.ar : p.city?.en || 'Riyadh'}
                    </span>
                  </div>

                  <div className="p-6 text-right space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="font-sans font-black text-lg text-neutral-900 line-clamp-1">{t(p.name)}</h3>
                      <p className="text-neutral-500 text-xs line-clamp-2 leading-relaxed">
                        {t(p.description) || (language === 'ar' ? 'كراس التطوير المتكامل ومواصفات السطح السكني' : 'Master plan booklet')}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      <span>{language === 'ar' ? 'استعراض تفاصيل المجمع' : 'Explore Community'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Short list of Curated Properties (Featured Properties Section) */}
        <section id="pub-featured-inventory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="block text-xs uppercase tracking-widest font-black text-(--color-secondary)" style={{ color: theme.secondary }}>
              {language === 'ar' ? 'الوحدات المتاحة وحق الملكية' : 'Featured Residential Assets'}
            </span>
            <h2 className="font-sans font-bold text-3xl text-neutral-900 tracking-tight">
              {language === 'ar' ? 'وحدات عقارية مصممة لكبار الملاك' : 'Luxury Architecture & Residences'}
            </h2>
            <div className="w-20 h-1 mx-auto rounded" style={{ backgroundColor: theme.secondary }}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {properties.slice(0, 3).map((prop) => (
              <div 
                key={prop.id}
                onClick={() => {
                  if (onNavigate) {
                    onNavigate(`property-${prop.id}`);
                  } else {
                    setSelectedProperty(prop);
                  }
                }}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-lg cursor-pointer transition-all duration-350 flex flex-col"
              >
                {/* Media frame */}
                <div className="h-56 relative overflow-hidden bg-neutral-950">
                  {renderItemImage(prop.featuredImageId, t(prop.type))}
                  {/* Floating status badge */}
                  <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-black/75 text-white border border-white/10 shadow">
                    {t(prop.type)}
                  </span>
                  {/* Status indicator */}
                  <span 
                    className={`absolute bottom-4 left-4 text-[10px] font-semibold px-2.5 py-1 rounded shadow ${
                      prop.status === 'available' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-black'
                    }`}
                  >
                    {staticT(prop.status === 'available' ? 'statusAvailable' : prop.status === 'reserved' ? 'statusReserved' : 'statusSold')}
                  </span>
                </div>

                {/* Listing content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-right">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-neutral-400 text-xs justify-start">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{displayBilingualOrNA(prop.location, language)}</span>
                    </div>
                    <h3 className="font-sans font-bold text-lg text-neutral-900 line-clamp-1">{displayBilingualOrNA(prop.title, language)}</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-1 bg-neutral-50 p-2.5 rounded-xl text-[11px] text-neutral-600 font-semibold text-center">
                    <div className="flex flex-col items-center justify-center p-1">
                      <span className="text-slate-400 text-[9px] mb-0.5">{staticT('areaSQM') || 'AREA'}</span>
                      <span className="text-neutral-800 font-mono">{displayNumberOrNA(prop.areaSqm)}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center border-x border-neutral-200/60 p-1">
                      <span className="text-slate-400 text-[9px] mb-0.5">{staticT('bathrooms') || 'BATHS'}</span>
                      <span className="text-neutral-800 font-mono">{displayNumberOrNA(prop.bathrooms)}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-1">
                      <span className="text-slate-400 text-[9px] mb-0.5">{staticT('bedrooms') || 'BEDS'}</span>
                      <span className="text-neutral-800 font-mono">{displayNumberOrNA(prop.bedrooms)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-xs text-neutral-400">{staticT('sar')}</span>
                    <span className="font-sans font-black text-lg text-(--color-primary)" style={{ color: theme.primary }}>
                      {displayCurrencyOrNA(prop.price, language)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Stats Section */}
        <section id="home-interactive-stats" className="py-20 bg-neutral-900 text-neutral-100 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              <div className="space-y-2 border-r border-[#D4AF37]/20 pr-6 text-right">
                <span className="block text-[#D4AF37] font-mono text-4xl font-black">١٢+</span>
                <span className="block text-neutral-400 text-xs font-bold uppercase tracking-wider">{language === 'ar' ? 'المشاريع الاستراتيجية الكبرى' : 'Mega Strategic Projects'}</span>
              </div>
              <div className="space-y-2 border-r border-[#D4AF37]/20 pr-6 text-right">
                <span className="block text-[#D4AF37] font-mono text-4xl font-black">٤٥٠+</span>
                <span className="block text-neutral-400 text-xs font-bold uppercase tracking-wider">{language === 'ar' ? 'الوحدات السكنية الفاخرة' : 'Premium Luxury Units'}</span>
              </div>
              <div className="space-y-2 border-r border-[#D4AF37]/20 pr-6 text-right">
                <span className="block text-[#D4AF37] font-mono text-4xl font-black">٩٨.٧٪</span>
                <span className="block text-neutral-400 text-xs font-bold uppercase tracking-wider">{language === 'ar' ? 'نسبة رضاء ملاك العقارات' : 'Mollak Satisfaction Rate'}</span>
              </div>
              <div className="space-y-2 pr-6 text-right">
                <span className="block text-[#D4AF37] font-mono text-4xl font-black">٤.٢ م.ر</span>
                <span className="block text-neutral-400 text-xs font-bold uppercase tracking-wider">{language === 'ar' ? 'إجمالي محفظة المبيعات والوساطة' : 'Total Portfolio Management'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* National Testimonials Section */}
        <section id="home-testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="block text-xs uppercase tracking-widest font-black text-(--color-secondary)" style={{ color: theme.secondary }}>
              {language === 'ar' ? 'شركاء النجاح والملاك' : 'Partners & Elite Clients'}
            </span>
            <h2 className="font-sans font-bold text-3xl text-neutral-900 tracking-tight">
              {language === 'ar' ? 'أصداء ثقة النخبة بمستقبل السكن' : 'Client Testimonials & Trust Reflections'}
            </h2>
            <div className="w-20 h-1 mx-auto rounded" style={{ backgroundColor: theme.secondary }}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200 relative text-right flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-end gap-1 text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current shrink-0" />)}
                </div>
                <p className="text-stone-700 text-sm leading-relaxed font-serif italic">
                  "امتد التعاون مع شركة بناء وإدارة لتطوير مشروع الفلل السكني بمنتزه المربع بالرياض. كان التزام الفريق بالجودة ودقة التنفيذ ومطابقة الشروط العقارية استثنائياً بكل المعايير."
                </p>
              </div>
              <div className="pt-6 border-t border-stone-200 mt-6 flex items-center justify-end gap-3">
                <div className="text-right">
                  <span className="block text-neutral-900 font-extrabold text-sm">عبدالرحمن بن سعود السديري</span>
                  <span className="block text-neutral-500 text-[11px] font-bold">{language === 'ar' ? 'الرئيس التنفيذي، ركائز للاستثمار العقاري' : 'CEO, Rakaez Real Estate'}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-stone-800 text-white flex items-center justify-center font-bold text-xs shrink-0">ع</div>
              </div>
            </div>

            <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200 relative text-right flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-end gap-1 text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current shrink-0" />)}
                </div>
                <p className="text-stone-700 text-sm leading-relaxed font-serif italic">
                  "تملكت شقة بنتهاوس في برج إليت تيرسز بالخبر. التصميم الداخلي وتوزيع الفراغات الهندسية يراعي أدق معايير الخصوصية السعودية والرفاهية التي نبحث عنها دائماً."
                </p>
              </div>
              <div className="pt-6 border-t border-stone-200 mt-6 flex items-center justify-end gap-3">
                <div className="text-right">
                  <span className="block text-neutral-900 font-extrabold text-sm">أ. نورة فيصل الفيصل</span>
                  <span className="block text-neutral-500 text-[11px] font-bold">{language === 'ar' ? 'سيدة أعمال، الرياض المانحة' : 'Businesswoman, Riyadh'}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-stone-800 text-white flex items-center justify-center font-bold text-xs shrink-0">ن</div>
              </div>
            </div>

            <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200 relative text-right flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-end gap-1 text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current shrink-0" />)}
                </div>
                <p className="text-stone-700 text-sm leading-relaxed font-serif italic">
                  "محرك استيراد إكسل المتكامل واهتمام الإدارة بخلفية التكوين التقني يمثل طفرة ذكية ميزت بناء وإدارة عن باقي المطورين. نتطلع لشراكاتنا العمرانية المستمرة."
                </p>
              </div>
              <div className="pt-6 border-t border-stone-200 mt-6 flex items-center justify-end gap-3">
                <div className="text-right">
                  <span className="block text-neutral-900 font-extrabold text-sm">المهندس سلطان الحجيلان</span>
                  <span className="block text-neutral-500 text-[11px] font-bold">{language === 'ar' ? 'مطور عقاري ومستشار استثماري' : 'Real Estate Developer Consultant'}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-stone-800 text-white flex items-center justify-center font-bold text-xs shrink-0">س</div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA consultation section */}
        <section id="home-contact-cta" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-neutral-900 text-white rounded-3xl p-8 sm:p-12 border border-neutral-800 shadow-2xl relative overflow-hidden text-right">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 text-center space-y-4 max-w-2xl mx-auto">
            <span className="block text-xs uppercase tracking-widest font-black text-(--color-secondary)" style={{ color: theme.secondary }}>
              {language === 'ar' ? 'مركز تواصل الملاك العقاري' : 'Premium Inquiry Hub'}
            </span>
            <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight text-white">
              {language === 'ar' ? 'تواصل معنا لحجز وحدتك العقارية النخبوية' : 'Initiate Secure Consultation'}
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm">
              {language === 'ar' 
                ? 'بادر بمراستلنا لحجز وحدتك، أو طلب دراسة استثمار عقاري في أرقى أحياء المملكة.' 
                : 'Inquire directly for exclusive architectural spaces or project collaborations.'}
            </p>

            <form onSubmit={handleHomeInquirySubmit} className="space-y-4 pt-6 text-right font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 text-right">
                  <label className="text-[10px] uppercase font-bold text-stone-400">{language === 'ar' ? 'الاسم الثلاثي' : 'Full Name'}</label>
                  <input
                    type="text"
                    required
                    value={homeName}
                    onChange={(e) => setHomeName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#D4AF37] text-right"
                    placeholder={language === 'ar' ? 'أ. سالم بن خالد' : 'John Doe'}
                  />
                </div>
                <div className="space-y-1.5 text-right">
                  <label className="text-[10px] uppercase font-bold text-stone-400">{language === 'ar' ? 'رقم الجوال' : 'Mobile Phone'}</label>
                  <input
                    type="tel"
                    required
                    value={homePhone}
                    onChange={(e) => setHomePhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#D4AF37] text-right"
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5 text-right">
                  <label className="text-[10px] uppercase font-bold text-stone-400">{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                  <input
                    type="email"
                    required
                    value={homeEmail}
                    onChange={(e) => setHomeEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#D4AF37] text-right"
                    placeholder="client@bina.sa"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-[10px] uppercase font-bold text-stone-400 block">{language === 'ar' ? 'تفاصيل استفسار الملاك العقاري والاهتمامات' : 'Message Details'}</label>
                <textarea
                  rows={3}
                  required
                  value={homeMsg}
                  onChange={(e) => setHomeMsg(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#D4AF37] text-right leading-relaxed"
                  placeholder={language === 'ar' ? 'أرغب في الاستفسار عن كراسة تطوير مجمع النور السكني ونماذج السداد...' : 'Interested in premium units details...'}
                />
              </div>

              <div className="pt-2 flex justify-center">
                {homeInquirySuccess ? (
                  <div className="p-3 bg-emerald-950/45 text-emerald-400 border border-emerald-900 rounded-lg text-xs font-bold w-full text-center">
                    {language === 'ar' ? '✓ تم حفظ طلبك وإدراجك بمسار المبيعات النخبوية للعملاء، سنتواصل معك قريباً!' : '✓ Inquiry submitted and routed, we will contact you shortly.'}
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-lg text-xs font-black uppercase text-black hover:opacity-95 shadow transition-all cursor-pointer font-bold select-none"
                    style={{ backgroundColor: theme.secondary || '#B45309' }}
                  >
                    {language === 'ar' ? 'تقديم الاستفسار العقاري الآمن وإرسال الطلب' : 'Submit Premium Inquiry Request'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

      </div>
    );
  }

  // Page 2: PROPERTIES (Luxury Catalog)
  if (activePage === 'properties') {
    const filter = propertySearchFilter;
    const hasFilter = Object.values(filter).some((value) => value && value !== 'all');
    let filteredProperties = [...properties];

    if (hasFilter) {
      if (filter.type && filter.type !== 'all') {
        const typeValue = filter.type.toLowerCase();
        filteredProperties = filteredProperties.filter((p) => {
          const typeStr = (p.type?.en || p.type || '').toString().toLowerCase();
          const typeAr = (p.type?.ar || '').toString().toLowerCase();
          return typeStr.includes(typeValue) || typeAr.includes(typeValue);
        });
      }

      if (filter.district && filter.district !== 'all') {
        const districtValue = filter.district.toLowerCase();
        filteredProperties = filteredProperties.filter((p) => {
          const locAr = (p.location?.ar || '').toString().toLowerCase();
          const locEn = (p.location?.en || '').toString().toLowerCase();
          return locAr.includes(districtValue) || locEn.includes(districtValue);
        });
      }

      if (filter.beds && filter.beds !== 'all') {
        const minBeds = parseInt(filter.beds, 10);
        if (!Number.isNaN(minBeds)) {
          filteredProperties = filteredProperties.filter((p) => p.bedrooms >= minBeds);
        }
      }

      if (filter.budget && filter.budget !== 'all') {
        const maxBudget = parseInt(filter.budget, 10);
        if (!Number.isNaN(maxBudget)) {
          filteredProperties = filteredProperties.filter((p) => p.price <= maxBudget);
        }
      }
    }

    const propertyTypeOptions = properties.reduce<Array<{ value: string; label: string }>>((acc, prop) => {
      const value = (prop.type?.en || prop.type?.ar || '').toString().trim();
      if (!value) return acc;
      if (!acc.some((item) => item.value.toLowerCase() === value.toLowerCase())) {
        acc.push({
          value,
          label: displayBilingualOrNA(prop.type, language)
        });
      }
      return acc;
    }, []);

    const propertyDistrictOptions = properties.reduce<Array<{ value: string; label: string }>>((acc, prop) => {
      const value = (prop.location?.en || prop.location?.ar || '').toString().trim();
      if (!value) return acc;
      if (!acc.some((item) => item.value.toLowerCase() === value.toLowerCase())) {
        acc.push({
          value,
          label: displayBilingualOrNA(prop.location, language)
        });
      }
      return acc;
    }, []);

    const propertyBedroomOptions = [1, 2, 3, 4, 5].filter((count) => properties.some((prop) => (prop.bedrooms || 0) >= count));
    const propertyBudgetOptions = [
      { value: '3000000', label: language === 'ar' ? 'حتى ٣,٠٠٠,٠٠٠ ريال' : 'Up to 3,000,000 SAR' },
      { value: '5000000', label: language === 'ar' ? 'حتى ٥,٠٠٠,٠٠٠ ريال' : 'Up to 5,000,000 SAR' },
      { value: '10000000', label: language === 'ar' ? 'حتى ١٠,٠٠٠,٠٠٠ ريال' : 'Up to 10,000,000 SAR' },
      { value: '15000000', label: language === 'ar' ? 'حتى ١٥,٠٠٠,٠٠٠ ريال' : 'Up to 15,000,000 SAR' }
    ];

    const updatePropertySearchFilter = (nextFilter: PropertySearchFilter) => {
      setPropertySearchFilter(nextFilter);
      writeStorageItem('session', 'property_search_filter', JSON.stringify(nextFilter));
    };

    const resetPropertySearchFilter = () => {
      setPropertySearchFilter(DEFAULT_PROPERTY_SEARCH_FILTER);
      removeStorageItem('session', 'property_search_filter');
    };

    return (
      <div id="pub-page-properties" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 font-sans">
        <div className="text-center space-y-2">
          <h1 className="font-sans font-extrabold text-3xl text-neutral-950">{staticT('allProperties')}</h1>
          <p className="text-neutral-500 text-sm max-w-lg mx-auto">تصفح أفضل العقارات المتاحة لدينا في أرقى أحياء الرياض وجدة المصممة لكبار الملاك وعشاق الرفاهية.</p>
          <div className="w-20 h-1 mx-auto rounded" style={{ backgroundColor: theme.secondary }}></div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-8 items-start">
          <aside className="bg-white/95 rounded-2xl border border-neutral-200 shadow-sm overflow-hidden relative z-10 xl:sticky xl:top-6 xl:self-start">
            <div className="px-5 py-4 bg-slate-950 text-white flex items-center justify-between gap-3">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-[0.24em] text-amber-300 font-black">
                  {language === 'ar' ? 'تصفية فاخرة' : 'Luxury Filter'}
                </div>
                <h2 className="font-sans font-black text-lg">{language === 'ar' ? 'ابحث في العقارات' : 'Filter Properties'}</h2>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Sliders className="w-5 h-5 text-amber-300" />
              </div>
            </div>

            <div className="p-5 space-y-4 text-right">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-900 text-xs leading-relaxed">
                {language === 'ar'
                  ? 'استخدم هذه الفلاتر للانتقال مباشرة إلى العقار المناسب، أو امسحها لعرض كل النتائج.'
                  : 'Use these filters to narrow the catalog instantly or clear them to show all results.'}
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-500">
                  {language === 'ar' ? 'نوع العقار' : 'Property Type'}
                </label>
                <select
                  value={filter.type}
                  onChange={(e) => updatePropertySearchFilter({ ...filter, type: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-right focus:outline-none focus:border-amber-400"
                >
                  <option value="all">{language === 'ar' ? 'كل الأنواع' : 'All types'}</option>
                  {propertyTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-500">
                  {language === 'ar' ? 'الحي / الموقع' : 'District / Location'}
                </label>
                <select
                  value={filter.district}
                  onChange={(e) => updatePropertySearchFilter({ ...filter, district: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-right focus:outline-none focus:border-amber-400"
                >
                  <option value="all">{language === 'ar' ? 'كل الأحياء' : 'All districts'}</option>
                  {propertyDistrictOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-500">
                  {language === 'ar' ? 'عدد الغرف' : 'Bedrooms'}
                </label>
                <select
                  value={filter.beds}
                  onChange={(e) => updatePropertySearchFilter({ ...filter, beds: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-right focus:outline-none focus:border-amber-400"
                >
                  <option value="all">{language === 'ar' ? 'كل الأعداد' : 'Any count'}</option>
                  {propertyBedroomOptions.map((count) => (
                    <option key={count} value={String(count)}>
                      {count}+ {language === 'ar' ? 'غرفة' : 'beds'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-500">
                  {language === 'ar' ? 'الميزانية القصوى' : 'Maximum Budget'}
                </label>
                <select
                  value={filter.budget}
                  onChange={(e) => updatePropertySearchFilter({ ...filter, budget: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-right focus:outline-none focus:border-amber-400"
                >
                  <option value="all">{language === 'ar' ? 'بدون حد' : 'No limit'}</option>
                  {propertyBudgetOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetPropertySearchFilter}
                  className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-bold text-sm transition-colors"
                >
                  {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
                </button>
                <div className="flex-1 px-4 py-3 rounded-xl bg-slate-950 text-white text-center font-black text-sm">
                  {filteredProperties.length} / {properties.length}
                </div>
              </div>
            </div>
          </aside>

          <section className="space-y-6 relative z-0">
            {hasFilter && (
              <div className="p-4 bg-amber-50/80 border border-amber-200/60 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-right text-xs text-amber-900 animate-fadeIn shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-bold">
                    {language === 'ar'
                      ? '👑 تصفية البحث الفاخرة نشطة حالياً وتعرض نتائج مخصصة تليق بك.'
                      : '👑 Ultra-private search filtration is active, presenting select estates tailored to you.'}
                  </span>
                </div>
                <button
                  onClick={resetPropertySearchFilter}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-black rounded-lg transition-all text-[11px] cursor-pointer"
                >
                  {language === 'ar' ? 'إعادة تعيين وعرض كافة العقارات ⟲' : 'Reset & Display All Estates ⟲'}
                </button>
              </div>
            )}

            {filteredProperties.length === 0 ? (
              <div className="text-center py-20 text-neutral-400 font-medium bg-white rounded-2xl border border-neutral-200 shadow-sm">
                {language === 'ar' ? 'لا توجد عقارات مطابقة لبحثك المخصص حالياً.' : 'No premium estates match your exclusive search terms.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProperties.map((prop) => (
                  <div 
                    key={prop.id}
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate(`property-${prop.id}`);
                      } else {
                        setSelectedProperty(prop);
                      }
                    }}
                    className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="h-48 relative overflow-hidden bg-neutral-900">
                      {renderItemImage(prop.featuredImageId, t(prop.type))}
                      <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/60 text-white">
                        {t(prop.type)}
                      </span>
                      <span 
                        className={`absolute bottom-4 left-4 text-[10px] font-semibold px-2 py-0.5 rounded ${
                          prop.status === 'available' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-black'
                        }`}
                      >
                        {staticT(prop.status === 'available' ? 'statusAvailable' : prop.status === 'reserved' ? 'statusReserved' : 'statusSold')}
                      </span>
                    </div>

                    <div className="p-6 space-y-4 text-right">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-neutral-400 text-xs text-right">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{t(prop.location)}</span>
                        </div>
                        <h3 className="font-sans font-bold text-lg text-neutral-900 line-clamp-1">{t(prop.title)}</h3>
                      </div>

                      <div className="flex justify-between items-center bg-neutral-50 p-2 text-xs text-neutral-500 rounded">
                        <div className="flex items-center gap-1">
                          <BedDouble className="w-3.5 h-3.5" />
                          <span>{prop.bedrooms} {staticT('bedrooms')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="w-3.5 h-3.5" />
                          <span>{prop.bathrooms} {staticT('bathrooms')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Maximize className="w-3.5 h-3.5" />
                          <span>{prop.areaSqm} {staticT('sqm')}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                        <span className="text-xs text-neutral-400">{staticT('sar')}</span>
                        <span className="font-sans font-extrabold text-lg text-neutral-900">
                          {displayCurrencyOrNA(prop.price, language)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Selected Property Detail Modal Overlay */}
        {selectedProperty && (
          <div 
            id="property-detail-overlay"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedProperty(null)}
          >
            <div 
              className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden text-right relative border border-neutral-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-64 relative bg-neutral-900">
                {renderItemImage(selectedProperty.featuredImageId, t(selectedProperty.type))}
                <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded bg-black/80 text-white">
                  {t(selectedProperty.type)}
                </span>
                <button 
                  onClick={() => setSelectedProperty(null)}
                  className="absolute top-4 left-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/80 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-neutral-500 text-sm">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{t(selectedProperty.location)}</span>
                  </div>
                  <h2 className="font-sans font-extrabold text-2xl text-neutral-950">{t(selectedProperty.title)}</h2>
                </div>

                <p className="text-neutral-600 text-sm leading-relaxed">{t(selectedProperty.description)}</p>

                <div className="grid grid-cols-3 gap-4 bg-neutral-50 p-4 rounded text-sm text-neutral-700 text-center">
                  <div className="space-y-1">
                    <span className="text-xs text-neutral-400 block">{staticT('bedrooms')}</span>
                    <span className="font-bold block">{displayNumberOrNA(selectedProperty.bedrooms)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-neutral-400 block">{staticT('bathrooms')}</span>
                    <span className="font-bold block">{displayNumberOrNA(selectedProperty.bathrooms)}</span>
                  </div>
                  <div className="space-y-1 font-sans">
                    <span className="text-xs text-neutral-400 block">{staticT('area')}</span>
                    <span className="font-bold block">{displayNumberOrNA(selectedProperty.areaSqm)} {staticT('sqm')}</span>
                  </div>
                </div>

                {/* Grid-based dynamic Amenities Section */}
                <div className="py-4 border-t border-slate-100">
                  <AmenitiesSection property={selectedProperty} language={language} />
                </div>

                <div className="border-t border-neutral-100 pt-6 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-400">{staticT('sar')}</span>
                    <div className="font-sans font-extrabold text-2xl text-(--color-primary)" style={{ color: theme.primary }}>
                      {displayCurrencyOrNA(selectedProperty.price, language)}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedProperty(null);
                      // Navigate to contact and preset property
                      setLinkedPropertyId(selectedProperty.id);
                      const contactButton = document.getElementById('nav-item-contact');
                      contactButton?.click();
                    }}
                    className="px-6 py-2.5 rounded font-sans text-xs font-bold text-white uppercase hover:opacity-95"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {staticT('submitInquiry')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Page 3: PROJECTS
  if (activePage === 'projects') {
    if (selectedProject) {
      const connectedProps = properties.filter(p => p.projectId === selectedProject.id);
      
      // Dynamically apply custom SEO Title and Description
      if (selectedProject.seoTitleAr && language === 'ar') {
        document.title = selectedProject.seoTitleAr;
      } else if (selectedProject.seoTitleEn && language === 'en') {
        document.title = selectedProject.seoTitleEn;
      }

      return (
        <div id="pub-page-project-details" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-right">
          {/* Back Navigation Bar */}
          <div className="flex justify-start">
            <button 
              onClick={() => {
                setSelectedProject(null);
                document.title = language === 'ar' ? "بناء وإدارة" : "BINA Portal";
              }}
              className="flex items-center gap-2 px-5 py-2.5 border border-neutral-200 hover:border-neutral-400 bg-white hover:bg-neutral-50 rounded-xl text-xs font-bold text-neutral-700 transition-all cursor-pointer shadow-sm"
            >
              <ArrowRight className="w-4 h-4" />
              <span>{language === 'ar' ? 'العودة لقائمة المشاريع الكبرى' : 'Back to Megaprojects'}</span>
            </button>
          </div>

          {/* Core Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-8">
              <div className="h-[420px] w-full rounded-2xl bg-neutral-950 border border-neutral-200 overflow-hidden relative shadow-lg">
                {renderItemImage(selectedProject.coverImageId, t(selectedProject.name))}
                <span className="absolute top-4 right-4 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl bg-black/85 text-white border border-white/10 shadow-md">
                  {getProjectStatusLabel(selectedProject.status)}
                </span>
                {selectedProject.featured && (
                  <span className="absolute top-4 left-4 text-xs font-black px-4 py-2 rounded-xl bg-amber-500 text-slate-950 border border-amber-600 shadow-md">
                    👑 {language === 'ar' ? 'مشروع فريد ومميز' : 'Featured Masterpiece'}
                  </span>
                )}
                <span className="absolute bottom-4 right-4 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl bg-white/90 text-neutral-900 border border-white/40 shadow-md">
                  {language === 'ar' ? `${selectedProject.units || connectedProps.length} وحدة` : `${selectedProject.units || connectedProps.length} Units`}
                </span>
              </div>

              {/* Title & Description Card */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 justify-start">
                  <MapPin className="w-4 h-4 text-[#B45309]" />
                  <span className="font-bold text-neutral-750 text-neutral-800">{t(selectedProject.city)}</span>
                  <span className="text-neutral-300">•</span>
                  <span className="font-semibold">{t(selectedProject.district)}</span>
                  {selectedProject.address && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <span className="font-mono text-neutral-400 font-bold">{t(selectedProject.address)}</span>
                    </>
                  )}
                </div>
                
                <h1 className="font-sans font-black text-3xl text-neutral-900 tracking-tight leading-normal">{t(selectedProject.name)}</h1>
                <div className="w-20 h-1.5 rounded-full" style={{ backgroundColor: theme.secondary || '#B45309' }}></div>
                
                <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap pt-3 font-semibold">
                  {t(selectedProject.description) || (language === 'ar' ? 'لا يوجد محتوى شرح بروشور متوفر حالياً للمشروع السكني.' : 'No descriptive content has been provided for this community yet.')}
                </p>

                {selectedProject.developer && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                    <span className="text-neutral-400 font-bold">{language === 'ar' ? 'المطور' : 'Developer'}</span>
                    <span className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-800 font-bold">
                      {t(selectedProject.developer)}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl p-5 md:p-6 shadow-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
                  <div className="space-y-1">
                    <Layers className="w-5 h-5 mx-auto text-amber-600" />
                    <span className="text-[10px] text-neutral-500 font-bold block">{language === 'ar' ? 'عدد الوحدات' : 'Units'}</span>
                    <span className="font-black text-neutral-900 block">{selectedProject.units || connectedProps.length}</span>
                  </div>
                  <div className="space-y-1 border-x border-neutral-100">
                    <Calendar className="w-5 h-5 mx-auto text-amber-600" />
                    <span className="text-[10px] text-neutral-500 font-bold block">{language === 'ar' ? 'تاريخ التسليم' : 'Completion'}</span>
                    <span className="font-black text-neutral-900 block">{selectedProject.completionDate || '---'}</span>
                  </div>
                  <div className="space-y-1">
                    <MapPin className="w-5 h-5 mx-auto text-amber-600" />
                    <span className="text-[10px] text-neutral-500 font-bold block">{language === 'ar' ? 'المدينة' : 'City'}</span>
                    <span className="font-black text-neutral-900 block">{t(selectedProject.city) || '---'}</span>
                  </div>
                  <div className="space-y-1 border-l border-neutral-100">
                    <Sparkles className="w-5 h-5 mx-auto text-amber-600" />
                    <span className="text-[10px] text-neutral-500 font-bold block">{language === 'ar' ? 'الحالة' : 'Status'}</span>
                    <span className="font-black text-neutral-900 block">{getProjectStatusLabel(selectedProject.status)}</span>
                  </div>
                </div>
              </div>

              {/* MP4 Video Segment */}
              {selectedProject.videoUploadId && mediaItems[selectedProject.videoUploadId] && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
                  <h3 className="font-sans font-black text-lg text-neutral-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]"></span>
                    <span>{language === 'ar' ? 'العرض المرئي الترويجي للمشروع' : 'Project Video Presentation'}</span>
                  </h3>
                  <div className="w-full aspect-video rounded-xl bg-neutral-950 overflow-hidden border border-neutral-200 shadow-inner relative">
                    <video 
                      controls 
                      className="w-full h-full object-cover"
                      src={mediaItems[selectedProject.videoUploadId]}
                    />
                  </div>
                </div>
              )}

              {/* Multi-photo strip */}
              {selectedProject.galleryImageIds && selectedProject.galleryImageIds.length > 0 ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
                  <h3 className="font-sans font-black text-lg text-neutral-900">
                    {language === 'ar' ? 'البوم صور ومخططات الوحدات' : 'Project Detail Architectural Gallery'}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {selectedProject.galleryImageIds.map((galId, index) => {
                      if (!mediaItems[galId]) return null;
                      return (
                        <div 
                          key={galId + '_' + index} 
                          className="h-44 rounded-xl overflow-hidden border border-neutral-100 bg-neutral-900 flex items-center justify-center p-1 shadow-sm hover:scale-[1.03] transition-all"
                        >
                          <img 
                            src={mediaItems[galId]} 
                            alt={`Gallery asset ${index}`}
                            className="max-h-full max-w-full object-contain"
                            referrerPolicy="no-referrer"
                        />
                      </div>
                    );
                  })}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
                  <h3 className="font-sans font-black text-lg text-neutral-900">
                    {language === 'ar' ? 'البوم صور ومخططات الوحدات' : 'Project Detail Architectural Gallery'}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="h-44 rounded-xl overflow-hidden border border-neutral-100 bg-neutral-50 flex items-center justify-center p-1 shadow-sm">
                      <img
                        src={mediaItems[PLACEHOLDER_PROPERTY_GALLERY_MEDIA_ID] || apiClient.getAbsoluteUrl(`/api/media/${PLACEHOLDER_PROPERTY_GALLERY_MEDIA_ID}/file`)}
                        alt="Project gallery placeholder"
                        className="max-h-full max-w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Data Cards */}
            <div className="space-y-6">
              {/* Core Sheet Info */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-5 shadow-sm text-right">
                <h4 className="font-sans font-black text-xs text-[#B45309] uppercase tracking-wider border-b border-slate-100 pb-2">
                  {language === 'ar' ? 'مواصفات المشروع الإنشائية' : 'Technical Specifications Sheet'}
                </h4>

                <div className="space-y-3.5 text-xs font-sans">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 font-bold">{language === 'ar' ? 'تاريخ التسليم المتوقع' : 'Target Delivery'}</span>
                    <span className="font-mono font-black text-neutral-800">{selectedProject.completionDate || '---'}</span>
                  </div>
                  <hr className="border-neutral-100" />
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 font-bold">{language === 'ar' ? 'عدد الوحدات' : 'Units'}</span>
                    <span className="font-bold text-neutral-800">{selectedProject.units || connectedProps.length} {language === 'ar' ? 'وحدة' : 'Units'}</span>
                  </div>
                  <hr className="border-neutral-100" />
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 font-bold">{language === 'ar' ? 'الحالة الحالية' : 'Operational status'}</span>
                    <span className="font-bold text-neutral-800">{getProjectStatusLabel(selectedProject.status)}</span>
                  </div>
                </div>

                {/* PDF direct item file */}
                {selectedProject.brochurePdfId && mediaItems[selectedProject.brochurePdfId] ? (
                  <div className="pt-2">
                    <a 
                      href={mediaItems[selectedProject.brochurePdfId]} 
                      download={`${selectedProject.name.en || 'project'}_bina_booklet.pdf`}
                      className="w-full flex items-center justify-center gap-2 p-3.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs uppercase rounded-xl transition-colors shadow-sm cursor-pointer"
                    >
                      <span>{language === 'ar' ? 'تحميل كراس المواصفات الهندسي (PDF)' : 'Download PDF Architectural Brochure'}</span>
                    </a>
                  </div>
                ) : null}

                {/* Location Map shortcut */}
                {selectedProject.googleMapsLink && (
                  <div className="pt-1">
                    <a 
                      href={selectedProject.googleMapsLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 p-3.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <span>{language === 'ar' ? 'تتبع الإحداثيات على خريطة جوجل' : 'Display Location on Google Maps'}</span>
                    </a>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setLinkedProjectId(selectedProject.id);
                    // Open contact page
                    onNavigate?.('contact');
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3.5 mt-3 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer shadow-md active:scale-95 text-center font-sans"
                  style={{ backgroundColor: theme.primary }}
                >
                  <span>{language === 'ar' ? 'تقديم طلب حجز للمشروع' : 'Inquire for this Project'}</span>
                </button>
              </div>

              {/* Amenities List Card */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-sm text-right">
                <h4 className="font-sans font-black text-xs text-[#B45309] uppercase tracking-wider border-b border-slate-100 pb-2">
                  {language === 'ar' ? 'مزايا الراحة والتجهيزات المعتمدة' : 'Infrastructure & Comfort Matrix'}
                </h4>

                <ul className="space-y-3.5 text-xs text-neutral-700 font-semibold">
                  {selectedProject.amenityParking && (
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{language === 'ar' ? 'مواقف سيارات خاصة وسفلية آمنة' : 'Private & Underground Parking'}</span>
                    </li>
                  )}
                  {selectedProject.amenitySecurity && (
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{language === 'ar' ? 'حراسة وأمن وبوابات رقمية مدار الساعة' : 'CCTV & Digital Guards 24/7'}</span>
                    </li>
                  )}
                  {selectedProject.amenityElevators && (
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{language === 'ar' ? 'مصاعد كهربائية ذكية ذات كفاءة متميزة' : 'Smart high-speed Schindler elevators'}</span>
                    </li>
                  )}
                  {selectedProject.amenityMosque && (
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{language === 'ar' ? 'مسجد جامع مدمج بالتجمع السكني' : 'Integrated Community Mosque'}</span>
                    </li>
                  )}
                  {selectedProject.amenityGym && (
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{language === 'ar' ? 'صالة لياقة بدنية ونادي صحي متكامل' : 'Equipped Wellness Club & Gym'}</span>
                    </li>
                  )}
                  {selectedProject.amenityPool && (
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{language === 'ar' ? 'مسبح أوليمبي دافئ للبالغين والأطفال' : 'Heated Swimming Pool Complex'}</span>
                    </li>
                  )}
                  {selectedProject.amenityChildrenArea && (
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{language === 'ar' ? 'منطقة رعاية وحضانات ألعاب للأطفال' : 'Supervised Safe Child Zone'}</span>
                    </li>
                  )}

                  {/* Render Custom amenities */}
                  {selectedProject.customAmenities && selectedProject.customAmenities.map((am, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#B45309] shrink-0" />
                      <span>{t(am)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium Contact inquiry form for selected project */}
              <div className="bg-neutral-900 border border-neutral-850 text-white rounded-2xl p-6 space-y-4 shadow-sm text-right">
                <h4 className="font-sans font-black text-[#FFECA1] text-sm">
                  {language === 'ar' ? 'احجز لطلب معاينة خاصة ممعنة' : 'Schedule a Private Real Tour'}
                </h4>
                <p className="text-[11px] text-neutral-405 leading-normal">
                  {language === 'ar' 
                    ? 'اكتب تفاصيل الاتصال، وسيقوم رئيس علاقات المستثمرين للأصول بالتنسيق الحصري معك.' 
                    : 'Submit your coordinates below, and our developer team will register your credentials.'}
                </p>

                {submitSuccess ? (
                  <div className="p-4 bg-emerald-950/80 border border-emerald-900 text-emerald-400 rounded-xl space-y-2 text-center">
                    <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
                    <p className="text-xs font-bold">{language === 'ar' ? 'تم قيد طلب التواصل بنجاح فائق!' : 'Inquiry locked successfully!'}</p>
                  </div>
                ) : (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!fullName || !phone) return;
                    setIsSubmitting(true);
                    inquiryRepository.createInquiry({
                      fullName,
                      email,
                      phone,
                      message: message || `Client requesting view trip specifically for project: ${t(selectedProject.name)}`,
                      projectId: selectedProject.id,
                      status: 'new'
                    }).then(() => {
                      setIsSubmitting(false);
                      setSubmitSuccess(true);
                      setFullName('');
                      setPhone('');
                      setEmail('');
                      setMessage('');
                    }).catch(() => setIsSubmitting(false));
                  }} className="space-y-3 text-xs text-right">
                    <div className="space-y-1">
                      <label className="text-neutral-400 font-bold block">{language === 'ar' ? 'الاسم بالكامل' : 'Your name'}</label>
                      <input 
                        type="text" 
                        required 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 focus:bg-neutral-800 focus:border-white text-white font-sans text-xs" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-neutral-400 font-bold block">{language === 'ar' ? 'رقم الجوال النشط' : 'Mobile Number'}</label>
                      <input 
                        type="tel" 
                        required 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 focus:bg-neutral-800 focus:border-white text-white font-sans text-xs" 
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 p-3 font-bold text-xs bg-[#B45309] hover:bg-[#92400E] text-white rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? (language === 'ar' ? 'إرسال...' : 'Sending...') : (language === 'ar' ? 'تأكيد الحجز الفوري' : 'Submit view request')}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Linked properties nested in this project community */}
          {connectedProps.length > 0 && (
            <div className="space-y-6 pt-10 border-t border-neutral-200">
              <h3 className="font-sans font-black text-xl text-neutral-900 tracking-tight">
                {language === 'ar' ? 'عقارات ووحدات معروضة للبيع ضمن هذا المشروع' : 'Listed Villas & Apartments Available Inside Al-Wasil'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {connectedProps.map((prop) => (
                  <div 
                    key={prop.id}
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate(`property-${prop.id}`);
                      } else {
                        setSelectedProperty(prop);
                      }
                    }}
                    className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer text-right flex flex-col justify-between group"
                  >
                    <div className="h-52 bg-neutral-900 relative overflow-hidden">
                      {renderItemImage(prop.featuredImageId, t(prop.type))}
                      <span className="absolute top-4 right-4 bg-black/80 border border-white/10 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg shadow-sm">
                        {t(prop.type)}
                      </span>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-[#B45309] font-bold block">{t(prop.location)}</span>
                        <h4 className="font-sans font-black text-base text-neutral-900 group-hover:text-[#B45309] transition-colors">{t(prop.title)}</h4>
                      </div>
                      <hr className="border-neutral-100" />
                      <div className="flex justify-between items-center text-xs font-sans">
                        <span className="text-neutral-500 font-semibold">{displayNumberOrNA(prop.bedrooms)} Bed | {displayNumberOrNA(prop.bathrooms)} Bath | {displayNumberOrNA(prop.areaSqm)} m²</span>
                        <span className="font-black text-neutral-900 text-sm">{displayCurrencyOrNA(prop.price, language)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div id="pub-page-projects" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="text-center space-y-2">
          <h1 className="font-sans font-black text-3xl text-neutral-950">{staticT('activeProjects')}</h1>
          <p className="text-neutral-500 text-sm max-w-lg mx-auto">رواد تطوير التجمعات الذكية المعاصرة التي تجسد عراقة الهوية السعودية وقيمة المعمار الحديث.</p>
          <div className="w-16 h-1 mx-auto rounded" style={{ backgroundColor: theme.secondary }}></div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 text-neutral-400 font-medium">
            {staticT('noProjectsYet')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.map((proj) => {
              const connectedProps = properties.filter(p => p.projectId === proj.id);
              return (
                <div 
                  key={proj.id}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="h-72 relative bg-neutral-950 overflow-hidden">
                    {renderItemImage(proj.coverImageId, t(proj.name))}
                    <span className="absolute top-4 right-4 text-[10px] uppercase font-black tracking-wider px-3.5 py-1.5 rounded-lg bg-black/80 text-white shadow-sm">
                      {getProjectStatusLabel(proj.status)}
                    </span>
                    <span className="absolute bottom-4 right-4 text-[10px] uppercase font-black tracking-wider px-3.5 py-1.5 rounded-lg bg-white/90 text-neutral-900 shadow-sm border border-white/40">
                      {language === 'ar' ? `${proj.units || connectedProps.length} وحدة` : `${proj.units || connectedProps.length} Units`}
                    </span>
                    {proj.featured && (
                      <span className="absolute top-4 left-4 text-[9px] font-black tracking-widest px-2.5 py-1 rounded bg-amber-500 text-[#0F172A] shadow-md uppercase">
                        {language === 'ar' ? 'مُميز' : 'Featured'}
                      </span>
                    )}
                  </div>

                  <div className="p-6 md:p-8 space-y-6 text-right flex flex-col justify-between flex-grow">
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 text-neutral-400 text-xs justify-start md:justify-end">
                        <MapPin className="w-3.5 h-3.5 text-[#B45309]" />
                        <span className="font-bold">{t(proj.city)} • {t(proj.district)}</span>
                      </div>
                      <h2 className="font-sans font-extrabold text-xl text-neutral-900 hover:text-[#B45309] transition-colors">{t(proj.name)}</h2>
                      {proj.developer && (
                        <p className="text-[11px] text-neutral-500 font-bold">
                          {language === 'ar' ? 'المطور:' : 'Developer:'} {t(proj.developer)}
                        </p>
                      )}
                      <p className="text-neutral-500 text-xs leading-relaxed line-clamp-3">{t(proj.description)}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-neutral-50 rounded-xl border border-neutral-100 p-3">
                      <div>
                        <div className="text-neutral-400 font-bold">{language === 'ar' ? 'الوحدات' : 'Units'}</div>
                        <div className="font-black text-neutral-900">{proj.units || connectedProps.length}</div>
                      </div>
                      <div>
                        <div className="text-neutral-400 font-bold">{language === 'ar' ? 'التسليم' : 'Delivery'}</div>
                        <div className="font-black text-neutral-900">{proj.completionDate || '---'}</div>
                      </div>
                      <div>
                        <div className="text-neutral-400 font-bold">{language === 'ar' ? 'الحالة' : 'Status'}</div>
                        <div className="font-black text-neutral-900">{getProjectStatusLabel(proj.status)}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-100 pt-5 mt-4">
                      <div className="flex items-center gap-4 text-[11px] font-sans text-neutral-400 font-semibold">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{proj.completionDate || '---'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" />
                          <span>{connectedProps.length} {staticT('adminProperties')}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => setSelectedProject(proj)}
                        className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
                      >
                        {language === 'ar' ? 'تفاصيل المجمع ⟵' : 'View Details ⟶'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Page 4: ABOUT US
  if (activePage === 'about') {
    const aboutContent = pages['about'];
    return (
      <div id="pub-page-about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <div className="text-center space-y-2">
          <h1 className="font-sans font-extrabold text-3xl text-neutral-950">{aboutContent ? t(aboutContent.title) : staticT('aboutUs')}</h1>
          <p className="text-neutral-400 text-sm">{aboutContent ? t(aboutContent.subtitle) : ''}</p>
          <div className="w-20 h-1 mx-auto rounded" style={{ backgroundColor: theme.secondary }}></div>
        </div>

        {aboutContent?.sections && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {aboutContent.sections.map((sec, index) => (
              <div 
                key={sec.id}
                className="p-8 rounded-lg border border-neutral-200 bg-white shadow-sm hover:shadow-md relative overflow-hidden transition-all text-right"
              >
                {/* Decorative gold marker */}
                <div 
                  className="w-1.5 h-16 absolute top-8 right-0 rounded-l"
                  style={{ backgroundColor: index % 2 === 0 ? theme.primary : theme.secondary }}
                />
                
                <h3 className="font-sans font-extrabold text-xl text-neutral-900 mb-4">{t(sec.title)}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-line">{t(sec.body)}</p>
                
                <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-mono tracking-widest uppercase">BINA CO. CORP</span>
                  <span>الرمز العقاري ٠٠٢</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Page 5: CONTACT US
  if (activePage === 'contact') {
    const contactContent = pages['contact'];
    return (
      <div id="pub-page-contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="text-center space-y-2">
          <h1 className="font-sans font-extrabold text-3xl text-neutral-950">{contactContent ? t(contactContent.title) : staticT('contactUs')}</h1>
          <p className="text-neutral-500 text-sm max-w-lg mx-auto">{contactContent ? t(contactContent.subtitle) : ''}</p>
          <div className="w-20 h-1 mx-auto rounded" style={{ backgroundColor: theme.secondary }}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Submission Ticket / Inquiry Form */}
          <div id="public-inquiry-box" className="p-8 bg-white border border-neutral-200 rounded-lg shadow-xl relative overflow-hidden text-right">
            {submitSuccess ? (
              <div className="py-12 text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-sans font-bold text-2xl text-neutral-900">نشكر تواصلكم النبيل</h3>
                <p className="text-neutral-500 text-sm max-w-sm mx-auto">
                  تم تسجيل اهتمامكم العقاري بنجاح في قاعدة بيانات شركة بناء وإدارة. سيقوم مستشارونا التنفيذيون بالاتصال بكم خلال ساعة عمل واحدة.
                </p>
                <div className="p-4 bg-neutral-50 border border-neutral-150 rounded text-xs font-mono inline-block">
                  TICKET ID: BINA_TKT_{Date.now().toString().slice(-6)}
                </div>
                <div>
                  <button 
                    onClick={() => setSubmitSuccess(false)}
                    className="text-neutral-400 hover:text-neutral-900 text-xs font-medium underline"
                  >
                    تقديم استفسار آخر
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-5">
                <div className="border-b border-neutral-100 pb-3">
                  <h3 className="font-sans font-bold text-lg text-neutral-900">{staticT('contactTitle')}</h3>
                  <p className="text-neutral-400 text-xs">{staticT('contactSubtitle')}</p>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 block">{staticT('fullName')}</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="سليمان الراجحي"
                        className="w-full text-sm p-3 border border-neutral-300 rounded focus:border-(--color-primary) focus:outline-none text-right pr-10"
                      />
                      <User className="w-4 h-4 text-neutral-400 absolute top-3.5 right-3.5" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 block">{staticT('phoneNumber')}</label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0500000000"
                        className="w-full text-sm p-3 border border-neutral-300 rounded focus:border-(--color-primary) focus:outline-none text-left pl-10"
                        dir="ltr"
                      />
                      <Phone className="w-4 h-4 text-neutral-400 absolute top-3.5 right-3.5" />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 block">{staticT('emailAddress')}</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="client@bina.sa"
                        className="w-full text-sm p-3 border border-neutral-300 rounded focus:border-(--color-primary) focus:outline-none text-left pl-10"
                        dir="ltr"
                      />
                      <Mail className="w-4 h-4 text-neutral-400 absolute top-3.5 right-3.5" />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 block">{staticT('messageText')}</label>
                    <div className="relative">
                      <textarea 
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="أرغب في الاستفسار عن تفاصيل فيلا السمو الكريمة..."
                        className="w-full text-sm p-3 border border-neutral-300 rounded focus:border-(--color-primary) focus:outline-none text-right pr-10"
                      />
                      <MessageSquare className="w-4 h-4 text-neutral-400 absolute top-3.5 right-3.5" />
                    </div>
                  </div>

                  {/* Property Selector */}
                  {properties.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 block">العقار المراد الاستفسار عنه</label>
                      <select 
                        value={linkedPropertyId}
                        onChange={(e) => {
                          setLinkedPropertyId(e.target.value);
                          if (e.target.value) setLinkedProjectId('');
                        }}
                        className="w-full text-sm p-3 border border-neutral-300 bg-white rounded focus:border-(--color-primary) focus:outline-none text-right"
                      >
                        <option value="">-- خيار عام / تواصل تجاري --</option>
                        {properties.map(p => (
                          <option key={p.id} value={p.id}>{t(p.title)}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Project Selector */}
                  {projects.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 block">المجمع السكني أو المشروع المرتبط</label>
                      <select 
                        value={linkedProjectId}
                        onChange={(e) => {
                          setLinkedProjectId(e.target.value);
                          if (e.target.value) setLinkedPropertyId('');
                        }}
                        className="w-full text-sm p-3 border border-neutral-300 bg-white rounded focus:border-(--color-primary) focus:outline-none text-right"
                      >
                        <option value="">-- خيار عام / لا ينطبق --</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{t(p.name)}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="pt-4 space-y-3">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded font-sans text-sm font-semibold text-white tracking-wider hover:opacity-95 text-center transition-all bg-gradient-to-r"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`
                    }}
                  >
                    {isSubmitting ? 'جاري إرسال الطلب...' : staticT('submitInquiry')}
                  </button>
                  <p className="text-[10px] text-center text-neutral-400 leading-normal">
                    {staticT('formDisabledTip')}
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Map and HQ Details */}
          <div id="pub-hq-address-card" className="space-y-8 text-right">
            {contactContent?.sections && contactContent.sections.map((sec) => (
              <div 
                key={sec.id}
                className="p-8 rounded-lg border border-neutral-200 bg-slate-50 relative overflow-hidden"
              >
                <h3 className="font-sans font-extrabold text-lg text-neutral-900 mb-3">{t(sec.title)}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-line">{t(sec.body)}</p>
              </div>
            ))}

            {/* High-end design placeholder map frame */}
            <div 
              className="h-80 rounded-lg overflow-hidden relative shadow-inner border border-neutral-300"
              style={{ backgroundColor: theme.primary }}
            >
              {/* Drawing an abstract high-quality architectural map pattern as client side vector */}
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <ArchitecturalPlanSVG />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: theme.secondary }}>
                  <MapPin className="w-6 h-6 text-neutral-900" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-white text-base">Al Olaya Premium Real Estate Zone</h4>
                  <p className="text-white/60 text-xs">Riyadh, Saudi Arabia | coordinates: 24.7136° N, 46.6753° E</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // FALLBACK: Dynamic Custom CMS Page Renderer
  const pageItems = Object.values(pages) as PageContent[];
  const customPage = pageItems.find(p => p.slug === activePage || p.slugAr === activePage || p.slugEn === activePage);
  if (customPage) {
    const isAr = language === 'ar';
    const pageTitle = isAr ? (customPage.title.ar || customPage.title.en) : (customPage.title.en || customPage.title.ar);
    const pageContent = isAr ? (customPage.contentAr || customPage.contentEn) : (customPage.contentEn || customPage.contentAr);
    const seoTitle = isAr ? (customPage.seoTitleAr || customPage.seoTitleEn) : (customPage.seoTitleEn || customPage.seoTitleAr);
    
    if (seoTitle) {
      document.title = seoTitle;
    }

    return (
      <div id={`pub-page-custom-${customPage.slug}`} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 text-right">
        <div className="space-y-4">
          <h1 className="font-sans font-black text-3xl text-neutral-900 tracking-tight leading-normal">
            {pageTitle}
          </h1>
          <div className="w-16 h-1 rounded" style={{ backgroundColor: theme.secondary || '#B45309' }}></div>
        </div>

        <article className="prose prose-slate max-w-none text-neutral-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
          {pageContent || (isAr ? 'لا يوجد محتوى في هذه الصفحة بعد.' : 'No content available for this page yet.')}
        </article>

        {/* If this has subpages (child pages), list them elegantly! */}
        {pageItems.some(p => p.parentId === customPage.id) && (
          <div className="pt-8 border-t border-neutral-100 space-y-4">
            <h3 className="font-sans font-black text-xs text-[#B45309] uppercase tracking-wider">
              {isAr ? 'الصفحات الفرعية والخدمات' : 'Subpages & Related Divisions'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pageItems
                .filter(p => p.parentId === customPage.id && p.status === 'published')
                .map(subPage => (
                  <button
                    key={subPage.id}
                    onClick={() => {
                      const button = document.getElementById(`nav-item-custom-page-${subPage.slug}`);
                      if (button) {
                        button.click();
                      } else {
                        const parentChanger = (window as any).__setActivePageFallback;
                        if (parentChanger) parentChanger(subPage.slug);
                      }
                    }}
                    className="p-5 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 rounded-xl text-right transition-all cursor-pointer bg-white shadow-sm"
                  >
                    <span className="font-sans font-bold text-sm text-neutral-800 block">
                      {isAr ? subPage.title.ar : subPage.title.en}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-bold block mt-1">
                      {isAr ? 'انقر لعرض محتويات الصفحة التفصيلية' : 'Click to display details'}
                    </span>
                  </button>
                ))
              }
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
