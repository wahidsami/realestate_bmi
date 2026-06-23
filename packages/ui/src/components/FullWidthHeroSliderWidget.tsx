import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Search, Sparkles, MapPin, Building, Key, Coins } from 'lucide-react';
import { VisualWidget } from '@bina/types';
import { writeStorageItem } from '@bina/utils';

interface FullWidthHeroSliderWidgetProps {
  widget: VisualWidget;
  language: 'ar' | 'en';
}

export const FullWidthHeroSliderWidget: React.FC<FullWidthHeroSliderWidgetProps> = ({
  widget,
  language
}) => {
  const settings = widget.settings || {};
  const slides = settings.slides || [];
  
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isHovered, setIsHovered] = useState(false);

  // Search box state
  const [filterType, setFilterType] = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterBeds, setFilterBeds] = useState('all');
  const [filterBudget, setFilterBudget] = useState('all');

  const t = (ar: string, en: string) => (language === 'ar' ? ar : en);

  // Autoplay intervals loop
  useEffect(() => {
    if (settings.autoplay === false || isHovered || slides.length <= 1) return;
    
    const intervalTicks = setInterval(() => {
      setDirection('next');
      setActiveIdx((prev) => {
        if (settings.infiniteLoop === false && prev === slides.length - 1) {
          return prev;
        }
        return (prev + 1) % slides.length;
      });
    }, settings.autoplaySpeed || 6000);

    return () => clearInterval(intervalTicks);
  }, [settings.autoplay, settings.autoplaySpeed, settings.infiniteLoop, isHovered, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center bg-slate-950 text-slate-500 border border-slate-900 rounded-2xl relative font-sans">
        <Sparkles className="w-8 h-8 text-[#D4AF37] mb-2 animate-bounce" />
        <span className="text-xs font-bold text-slate-400">{t('معرض شرائح هيرو فارغ - يرجى إضافة الشرائح بـ لوحة التحكم', 'Luxury Hero Slider Empty - Add pristine slides inside right panel')}</span>
      </div>
    );
  }

  const currentSlide = slides[activeIdx] || slides[0];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection('prev');
    setActiveIdx((prev) => {
      if (prev === 0) {
        return settings.infiniteLoop === false ? 0 : slides.length - 1;
      }
      return prev - 1;
    });
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection('next');
    setActiveIdx((prev) => {
      if (prev === slides.length - 1) {
        return settings.infiniteLoop === false ? prev : 0;
      }
      return prev + 1;
    });
  };

  // Switch to page properties and apply filters
  const handleExecuteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filterObj = {
      type: filterType,
      district: filterDistrict,
      beds: filterBeds,
      budget: filterBudget
    };
    
    writeStorageItem('session', 'property_search_filter', JSON.stringify(filterObj));
    
    // Redirect to properties using the global helper we found in App.tsx!
    if (typeof (window as any).__setActivePageFallback === 'function') {
      (window as any).__setActivePageFallback('properties');
    }
  };

  // Nav controls stylings mapping
  const navStyle = settings.navStyle || 'circle';
  const getNavBtnClasses = () => {
    const base = "w-12 h-12 flex items-center justify-center transition-all bg-black/40 hover:bg-[#D4AF37] text-white hover:text-slate-950 border border-white/20 hover:border-[#D4AF37] cursor-pointer shrink-0 shadow-lg backdrop-blur-md";
    if (navStyle === 'square') return base;
    if (navStyle === 'rounded') return `${base} rounded-xl`;
    return `${base} rounded-full`; // circle default
  };

  const getDotsClasses = (active: boolean) => {
    const base = "transition-all duration-300 cursor-pointer";
    if (navStyle === 'square') {
      return active ? `${base} w-8 h-2 bg-[#D4AF37]` : `${base} w-2 h-2 bg-white/40 hover:bg-white/70`;
    }
    if (navStyle === 'rounded') {
      return active ? `${base} w-7 h-2 rounded bg-[#D4AF37]` : `${base} w-2 h-2 rounded bg-white/40 hover:bg-white/70`;
    }
    return active ? `${base} w-6 h-2 rounded-full bg-[#D4AF37]` : `${base} w-2 h-2 rounded-full bg-white/40 hover:bg-white/70`;
  };

  // Animation variants mappings
  const transType = settings.transitionType || 'fade';
  
  const getTransitionVariants = () => {
    if (transType === 'slide') {
      return {
        enter: (dir: 'next' | 'prev') => ({
          x: dir === 'next' ? '100%' : '-100%',
          opacity: 0,
          scale: 1
        }),
        center: {
          x: 0,
          opacity: 1,
          scale: 1,
          transition: { 
            x: { type: 'tween', ease: 'easeInOut', duration: 0.8 }, 
            opacity: { duration: 0.5 } 
          }
        },
        exit: (dir: 'next' | 'prev') => ({
          x: dir === 'next' ? '-100%' : '100%',
          opacity: 0,
          scale: 1,
          transition: { 
            x: { type: 'tween', ease: 'easeInOut', duration: 0.8 }, 
            opacity: { duration: 0.5 } 
          }
        })
      };
    }
    
    if (transType === 'zoom') {
      return {
        enter: {
          scale: 1.15,
          opacity: 0
        },
        center: {
          scale: 1,
          opacity: 1,
          transition: { 
            scale: { duration: 1.3, ease: 'easeOut' }, 
            opacity: { duration: 0.7 } 
          }
        },
        exit: {
          scale: 0.92,
          opacity: 0,
          transition: { 
            scale: { duration: 1.1, ease: 'easeIn' }, 
            opacity: { duration: 0.6 } 
          }
        }
      };
    }
    
    // default FADE
    return {
      enter: { opacity: 0 },
      center: { opacity: 1, transition: { duration: 0.9, ease: 'easeInOut' } },
      exit: { opacity: 0, transition: { duration: 0.9, ease: 'easeInOut' } }
    };
  };

  // Sizing Class Solver
  const heightMode = settings.heightMode || 'fullscreen';
  let heightClass = "h-[60vh] md:h-[70vh] lg:h-[100vh]";
  let inlineStyles: React.CSSProperties = {};
  
  if (heightMode === 'vh') {
    const vhHeight = Number(settings.sliderHeightVh || 100);
    heightClass = "min-h-[30vh]";
    inlineStyles = { height: `${Number.isFinite(vhHeight) ? vhHeight : 100}vh` };
  } else if (heightMode === 'large') {
    heightClass = "h-[450px] md:h-[650px] lg:h-[800px]";
  } else if (heightMode === 'medium') {
    heightClass = "h-[350px] md:h-[480px] lg:h-[600px]";
  } else if (heightMode === 'custom') {
    heightClass = "min-h-[400px]";
    inlineStyles = { height: settings.customHeight || '700px' };
  }

  // Choose the display mode for this slide's image
  const displayMode = currentSlide.displayMode || settings.displayMode || 'cover';
  const getObjectFitClass = (mode: string) => {
    switch (mode) {
      case 'contain':
        return 'object-contain';
      case 'fill':
        return 'object-fill';
      case 'center_crop':
      case 'center-crop':
      case 'cover':
      default:
        return 'object-cover';
    }
  };

  return (
    <div 
      className={`w-full relative overflow-hidden bg-slate-950 font-sans ${heightClass}`} 
      style={inlineStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background slide items transition layer */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={activeIdx}
          custom={direction}
          variants={getTransitionVariants() as any}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full z-0 block overflow-hidden"
        >
          {/* Media background block */}
          {currentSlide.bgType === 'video' && currentSlide.videoBase64 ? (
            <video 
              src={currentSlide.videoBase64} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
            />
          ) : currentSlide.base64Data ? (
            <img 
              src={currentSlide.base64Data} 
              className={`absolute inset-0 w-full h-full ${getObjectFitClass(displayMode)} object-center z-0`} 
              alt="Luxury residence backdrop" 
              referrerPolicy="no-referrer"
              style={{ width: '100%', height: '100%' }}
            />
          ) : currentSlide.imageUrl ? (
            <img 
              src={currentSlide.imageUrl} 
              className={`absolute inset-0 w-full h-full ${getObjectFitClass(displayMode)} object-center z-0 animate-scaleSlow`} 
              alt="Majestic estate landscape" 
              referrerPolicy="no-referrer"
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-slate-950 via-[#0e1726] to-slate-900 z-0" />
          )}

          {/* Dim Overlay and Gradient Filters */}
          {currentSlide.overlayColor && (
            <div 
              className="absolute inset-0 z-1" 
              style={{ 
                backgroundColor: currentSlide.overlayColor,
                opacity: (currentSlide.overlayOpacity ?? 50) / 100 
              }}
            />
          )}

          {currentSlide.gradientOverlay !== false && (
            <div className="absolute inset-0 z-2 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-black/30 pointer-events-none" />
          )}

          {/* Content layer inside active slide */}
          <div className="absolute inset-0 z-10 flex px-6 md:px-16 lg:px-24 py-12 md:py-20 items-center justify-center">
            {/* Position constraints based on vertical align */}
            <div className={`w-full max-w-5xl flex flex-col h-full justify-center 
              ${currentSlide.valign === 'top' ? 'justify-start pt-6' : ''}
              ${currentSlide.valign === 'bottom' ? 'justify-end pb-12' : ''}
              ${currentSlide.align === 'left' ? 'text-left items-start' : ''}
              ${currentSlide.align === 'right' ? 'text-right items-end' : ''}
              ${currentSlide.align === 'center' || !currentSlide.align ? 'text-center items-center' : ''}
            `}>
              
              {/* Luxury Accent Badge */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] md:text-xs font-black tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(212,175,55,0.15)] backdrop-blur-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('إيجاز عقاري ملكي فاخر', 'ROYAL MAJESTIC ESTATES COLLECTION')}</span>
              </motion.div>

              {/* Title Bilingual text with magnificent display typography */}
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-2xl md:text-5xl lg:text-[54px] font-extrabold text-white leading-tight font-sans tracking-tight max-w-4xl cursor-default select-none text-shadow-lg"
              >
                {language === 'ar' ? currentSlide.titleAr : currentSlide.titleEn}
              </motion.h2>

              {/* Subtitle description */}
              <motion.p
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mt-4 text-xs md:text-lg text-slate-200 font-medium max-w-2xl leading-relaxed cursor-default select-none block"
              >
                {language === 'ar' ? currentSlide.subtitleAr : currentSlide.subtitleEn}
              </motion.p>

              {/* CTA Dual Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.8 }}
                className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                {/* Primary Button */}
                {(currentSlide.primaryBtnTextAr || currentSlide.primaryBtnTextEn) && (
                  <button
                    onClick={() => {
                      if (typeof (window as any).__setActivePageFallback === 'function') {
                        (window as any).__setActivePageFallback(currentSlide.primaryBtnLink?.replace('/', '') || 'properties');
                      }
                    }}
                    className="px-6 py-3.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#f39c12] hover:from-[#f39c12] hover:to-[#D4AF37] text-slate-950 text-xs font-black shadow-[0_4px_20px_rgba(212,175,55,0.4)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.6)] cursor-pointer hover:scale-[1.03] transition-all flex items-center justify-center gap-2"
                  >
                    <span>{language === 'ar' ? currentSlide.primaryBtnTextAr : currentSlide.primaryBtnTextEn}</span>
                  </button>
                )}

                {/* Secondary Button */}
                {(currentSlide.secondaryBtnTextAr || currentSlide.secondaryBtnTextEn) && (
                  <button
                    onClick={() => {
                      if (currentSlide.secondaryBtnLink && currentSlide.secondaryBtnLink !== '#') {
                        if (typeof (window as any).__setActivePageFallback === 'function') {
                          (window as any).__setActivePageFallback(currentSlide.secondaryBtnLink.replace('/', ''));
                        }
                      }
                    }}
                    className="px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white text-xs font-bold shadow-lg cursor-pointer backdrop-blur-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>{language === 'ar' ? currentSlide.secondaryBtnTextAr : currentSlide.secondaryBtnTextEn}</span>
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows (Sticky on sides) */}
      {settings.showPrevNext !== false && slides.length > 1 && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 px-4 md:px-8 flex justify-between pointer-events-none">
          <button
            type="button"
            onClick={handlePrev}
            className={`${getNavBtnClasses()} pointer-events-auto`}
            title={t('الشريحة السابقة', 'Previous slide')}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className={`${getNavBtnClasses()} pointer-events-auto`}
            title={t('الشريحة التالية', 'Next slide')}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Pagination dots indices at bottom edge */}
      {settings.showDots !== false && slides.length > 1 && (
        <div className="absolute bottom-6 inset-x-0 z-20 flex items-center justify-center gap-2">
          {slides.map((_: any, dotIdx: number) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => {
                setDirection(dotIdx > activeIdx ? 'next' : 'prev');
                setActiveIdx(dotIdx);
              }}
              className={getDotsClasses(dotIdx === activeIdx)}
              title={t(`الذهاب للشريحة ${dotIdx + 1}`, `Go to slide ${dotIdx + 1}`)}
            />
          ))}
        </div>
      )}

      {/* Floating search filter box at absolute center-bottom if enabled */}
      {settings.showSearchBox !== false && (
        <div className="absolute inset-x-0 bottom-16 md:bottom-20 lg:bottom-10 z-30 px-4 max-w-4xl mx-auto pointer-events-none animate-slideUp">
          <form 
            onSubmit={handleExecuteSearch}
            className="w-full bg-[#0a0f1d]/85 backdrop-blur-xl border border-[#D4AF37]/35 rounded-2xl p-4 md:p-5 shadow-[0_15px_45px_rgba(0,0,0,0.5)] pointer-events-auto grid grid-cols-2 md:grid-cols-5 gap-3 items-end text-right font-sans"
          >
            {/* Filter Property Type */}
            <div className="space-y-1.5 col-span-1">
              <label className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1 justify-end">
                <span>{t('نوع العقار', 'Property Type')}</span>
                <Building className="w-3 h-3 text-[#D4AF37]" />
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-xs px-2.5 py-2 rounded-lg cursor-pointer focus:outline-none focus:border-[#D4AF37]/80 text-right"
              >
                <option value="all">👑 {t('كل أنواع العقارات', 'All Luxury Types')}</option>
                <option value="villa">{t('فيلا مستقلة', 'Stand-alone Villa')}</option>
                <option value="apartment">{t('شقة سكنية فاخرة', 'Exquisite Apartment')}</option>
                <option value="mansion">{t('قصر أرستقراطي كبير', 'Pristine Mansion')}</option>
                <option value="penthouse">{t('دوبلكس وبنتهاوس علوي', 'Modern Penthouse')}</option>
              </select>
            </div>

            {/* Filter District */}
            <div className="space-y-1.5 col-span-1">
              <label className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1 justify-end">
                <span>{t('الحي / الموقع', 'District Location')}</span>
                <MapPin className="w-3 h-3 text-[#D4AF37]" />
              </label>
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-xs px-2.5 py-2 rounded-lg cursor-pointer focus:outline-none focus:border-[#D4AF37]/80 text-right"
              >
                <option value="all">📍 {t('جميع أحياء الرياض الفاخرة', 'All Riyadh VIP locations')}</option>
                <option value="hittin">{t('حطين الثرية (Hittin)', 'Hittin')}</option>
                <option value="malqa">{t('الملقا الشمالي (Malqa)', 'Malqa')}</option>
                <option value="jasmin">{t('الياسمين العصري (Jasmin)', 'Jasmin')}</option>
                <option value="safara">{t('حي السفارات الدبلوماسي', 'Diplomatic Quarter')}</option>
              </select>
            </div>

            {/* Filter Bedrooms */}
            <div className="space-y-1.5 col-span-1">
              <label className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1 justify-end">
                <span>{t('عدد الغرف والنوم', 'Bedrooms size')}</span>
                <Key className="w-3 h-3 text-[#D4AF37]" />
              </label>
              <select
                value={filterBeds}
                onChange={(e) => setFilterBeds(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-xs px-2.5 py-2 rounded-lg cursor-pointer focus:outline-none focus:border-[#D4AF37]/80 text-right"
              >
                <option value="all">🗝️ {t('أي سعة غرف', 'Any Bedroom size')}</option>
                <option value="3">3 {t('غرف نوم أو أكثر', 'Bedrooms or more')}</option>
                <option value="4">4 {t('غرف نوم أو أكثر', 'Bedrooms or more')}</option>
                <option value="5">5 {t('غرف نوم ملكية أو أكثر', 'Majestic 5+ Bedrooms')}</option>
              </select>
            </div>

            {/* Filter Budget */}
            <div className="space-y-1.5 col-span-1">
              <label className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1 justify-end">
                <span>{t('الميزانية القصوى', 'Maximum Budget')}</span>
                <Coins className="w-3 h-3 text-[#D4AF37]" />
              </label>
              <select
                value={filterBudget}
                onChange={(e) => setFilterBudget(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-xs px-2.5 py-2 rounded-lg cursor-pointer focus:outline-none focus:border-[#D4AF37]/80 text-right"
              >
                <option value="all">💰 {t('دون تحديد سقف مالي', 'No Limit')}</option>
                <option value="3000000">{t('حتى 3 مليون ريال', 'Up to 3,000,000 SAR')}</option>
                <option value="5000000">{t('حتى 5 مليون ريال', 'Up to 5,000,000 SAR')}</option>
                <option value="10000000">{t('حتى 10 مليون ريال', 'Up to 10,000,000 SAR')}</option>
                <option value="15000000">{t('فوق 15 مليون ريال', 'Luxury 15,000,000+ SAR')}</option>
              </select>
            </div>

            {/* Submit search trigger */}
            <div className="col-span-2 md:col-span-1">
              <button
                type="submit"
                className="w-full py-2.5 md:py-[10px] rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#f39c12] hover:from-[#f39c12] hover:to-[#D4AF37] text-slate-950 text-xs font-black  cursor-pointer shadow-[0_4px_12px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-1.5 focus:outline-none scale-100 hover:scale-[1.02]"
              >
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span>{t('ابحث لعقاري ⟵', 'Tailor Query')}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
