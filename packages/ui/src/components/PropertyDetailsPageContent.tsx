/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Share2, 
  Phone, 
  Mail, 
  MessageCircle, 
  Bookmark, 
  Printer, 
  Bed, 
  Bath, 
  DoorOpen, 
  Maximize2, 
  Car, 
  Layers, 
  Calendar, 
  Hash, 
  Shield, 
  Activity, 
  FileText, 
  Video, 
  Map, 
  GraduationCap, 
  HeartPulse, 
  Building2, 
  ShoppingBag, 
  Utensils, 
  TreePine, 
  Train, 
  Check, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  ZoomIn, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  MapPin,
  Compass,
  FileSpreadsheet,
  Workflow,
  X,
  Play
} from 'lucide-react';
import { Property, Project, Inquiry } from '@bina/types';
import {
  inquiryRepository,
  apiClient,
  PLACEHOLDER_PROPERTY_FEATURED_MEDIA_ID,
  PLACEHOLDER_PROPERTY_GALLERY_MEDIA_ID,
} from '@bina/shared';
import { NajdiVillaVector, PenthouseVector, SmartApartmentVector, ArchitecturalPlanSVG } from './VectorGraphics';
import { readStorageItem, writeStorageItem, removeStorageItem } from '@bina/utils';

interface PropertyDetailsPageContentProps {
  property: Property;
  properties: Property[];
  projects: Project[];
  mediaItems: Record<string, string>;
  language: 'ar' | 'en';
  theme: any;
  onNavigate?: (pageName: string) => void;
  onBackToListing?: () => void;
}

export const PropertyDetailsPageContent: React.FC<PropertyDetailsPageContentProps> = ({
  property,
  properties,
  projects,
  mediaItems,
  language,
  theme,
  onNavigate,
  onBackToListing
}) => {
  const isAr = language === 'ar';

  // State Management
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // Floor plan zoom

  // Inquiry Form state
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [isInquirySubmitting, setIsInquirySubmitting] = useState(false);

  // Translate helpers
  const t = (obj: any) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return isAr ? obj.ar || obj.en : obj.en || obj.ar;
  };

  const getFarsiSarla = (val: string) => {
    if (isAr) {
      if (val === 'available') return 'متاح للبيع';
      if (val === 'reserved') return 'محجوز';
      if (val === 'sold') return 'تم البيع';
      if (val === 'rented') return 'تم التأجير';
    } else {
      if (val === 'available') return 'Available';
      if (val === 'reserved') return 'Reserved';
      if (val === 'sold') return 'Sold';
      if (val === 'rented') return 'Rented';
    }
    return val;
  };

  // Get project information
  const matchedProject = projects.find(p => p.id === property.projectId);

  // Gather all applicable gallery images
  const imagesList: string[] = [];
  if (property.featuredImageId && mediaItems[property.featuredImageId]) {
    imagesList.push(mediaItems[property.featuredImageId]);
  } else if (property.featuredImageId) {
    imagesList.push(apiClient.getAbsoluteUrl(`/api/media/${property.featuredImageId}/file`));
  } else {
    imagesList.push(apiClient.getAbsoluteUrl(`/api/media/${PLACEHOLDER_PROPERTY_FEATURED_MEDIA_ID}/file`));
  }
  if (property.galleryImageIds && property.galleryImageIds.length > 0) {
    property.galleryImageIds.forEach(id => {
      if (mediaItems[id]) {
        imagesList.push(mediaItems[id]);
      } else {
        imagesList.push(apiClient.getAbsoluteUrl(`/api/media/${id}/file`));
      }
    });
  } else {
    imagesList.push(apiClient.getAbsoluteUrl(`/api/media/${PLACEHOLDER_PROPERTY_GALLERY_MEDIA_ID}/file`));
  }

  // Fallback vector images
  const renderFallbackVector = () => {
    const typeStr = t(property.type).toLowerCase();
    if (typeStr.includes('villa') || typeStr.includes('فيلا')) {
      return <NajdiVillaVector className="w-full h-full object-cover" />;
    }
    if (typeStr.includes('penthouse') || typeStr.includes('بنتهاوس')) {
      return <PenthouseVector className="w-full h-full object-cover" />;
    }
    return <SmartApartmentVector className="w-full h-full object-cover" />;
  };

  // Setup saved in local storage on initialize
  useEffect(() => {
    const saved = readStorageItem('local', `saved_property_${property.id}`);
    if (saved) setIsSaved(true);
  }, [property.id]);

  // Handle saving estate
  const handleToggleSave = () => {
    if (isSaved) {
      removeStorageItem('local', `saved_property_${property.id}`);
      setIsSaved(false);
    } else {
      writeStorageItem('local', `saved_property_${property.id}`, 'true');
      setIsSaved(true);
    }
  };

  // Handle sharing estate link
  const handleShare = () => {
    const currentUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: t(property.title),
        text: t(property.description),
        url: currentUrl
      }).catch(err => {
        console.error(err);
      });
    } else {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Set SEO headers dynamically
  useEffect(() => {
    const origTitle = document.title;
    const seoTitle = isAr 
      ? (property.seoTitleAr || t(property.title))
      : (property.seoTitleEn || t(property.title));
    
    document.title = seoTitle;

    // Automatic schema generation
    const schemaMarkup = {
      "@context": "https://schema.org",
      "@type": "SingleFamilyResidence",
      "name": t(property.title),
      "description": t(property.description),
      "numberOfRooms": property.bedrooms,
      "numberOfBathroomsTotal": property.bathrooms,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": t(property.location) || (matchedProject ? t(matchedProject.city) : ''),
        "addressRegion": "Riyadh",
        "addressCountry": "SA"
      },
      "price": property.price,
      "priceCurrency": property.currency || "SAR"
    };

    const scriptId = 'realestate-property-jsonld';
    let scriptEl = document.getElementById(scriptId);
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptEl);
    }
    scriptEl.innerHTML = JSON.stringify(schemaMarkup);

    return () => {
      document.title = origTitle;
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [property.id, language]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        setActiveImageIdx(prev => (prev - 1 + imagesList.length) % imagesList.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIdx(prev => (prev + 1) % imagesList.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, imagesList.length]);

  // Handle Inquiry Dispatch
  const handleFormInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone) return;
    setIsInquirySubmitting(true);
    try {
      await inquiryRepository.createInquiry({
        fullName: inquiryName,
        phone: inquiryPhone,
        email: inquiryEmail,
        message: inquiryMessage || `Inquiry specifically from Luxury details page for estate: ${t(property.title)}`,
        propertyId: property.id,
        projectId: property.projectId || undefined,
        status: 'new'
      });
      setIsInquirySubmitting(false);
      setInquirySuccess(true);
      // Reset
      setInquiryName('');
      setInquiryPhone('');
      setInquiryEmail('');
      setInquiryMessage('');
    } catch (err) {
      console.error(err);
      setIsInquirySubmitting(false);
    }
  };

  // Resolve floor plans
  const floorPlansList: string[] = [];
  if (property.floorPlanMediaIds && property.floorPlanMediaIds.length > 0) {
    property.floorPlanMediaIds.forEach(id => {
      if (mediaItems[id]) {
        floorPlansList.push(mediaItems[id]);
      }
    });
  } else if (property.floorPlanImageId && mediaItems[property.floorPlanImageId]) {
    floorPlansList.push(mediaItems[property.floorPlanImageId]);
  }

  // Resolve document downloads
  const documentsList: Array<{ name: string; url: string }> = [];
  if (property.documentMediaIds && property.documentMediaIds.length > 0) {
    property.documentMediaIds.forEach((id, index) => {
      if (mediaItems[id]) {
        documentsList.push({
          name: isAr ? `وثيقة مبيعات وتفاصيل العقار #${index + 1}` : `Brochure & Spec File #${index + 1}`,
          url: mediaItems[id]
        });
      }
    });
  }

  // Related Properties filter algorithms
  const relatedProperties = properties
    .filter(p => p.id !== property.id) // Exclude current
    .filter(p => {
      // Direct Project Match
      if (property.projectId && p.projectId === property.projectId) return true;
      // Close price range (within 35%)
      const minPrice = property.price * 0.65;
      const maxPrice = property.price * 1.35;
      if (p.price >= minPrice && p.price <= maxPrice) return true;
      // Same City / Region
      const curLoc = t(property.location).toLowerCase();
      const otherLoc = t(p.location).toLowerCase();
      if (curLoc.slice(0, 5) === otherLoc.slice(0, 5)) return true;
      return false;
    })
    .slice(0, 3); // top 3

  // Core Render
  return (
    <div 
      className="w-full relative text-right" 
      dir={isAr ? 'rtl' : 'ltr'} 
      id={`luxury-property-page-${property.id}`}
    >
      {/* Lightbox for Gallery */}
      {isLightboxOpen && imagesList.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-55 flex flex-col items-center justify-center p-4 select-none animate-fadeIn">
          {/* Top Panel Actions */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-50">
            <span className="text-xs font-bold font-mono tracking-widest bg-neutral-900/60 px-4 py-2 rounded-xl border border-white/10">
              {activeImageIdx + 1} / {imagesList.length}
            </span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setLightboxScale(prev => prev === 1 ? 2 : 1)}
                className="p-3 bg-neutral-900/60 rounded-full hover:bg-neutral-800 border border-white/5 cursor-pointer text-white transition-colors"
                title={isAr ? 'تكبير الصورة' : 'Zoom In'}
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsLightboxOpen(false)}
                className="p-3 bg-[#E11D48] rounded-full hover:bg-rose-500 cursor-pointer text-white transition-all shadow-md active:scale-95"
                title={isAr ? 'إغلاق المعرض' : 'Close Gallery'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Left Arrow */}
          <button 
            onClick={() => setActiveImageIdx(prev => (prev - 1 + imagesList.length) % imagesList.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-neutral-900/60 hover:bg-neutral-800 rounded-full border border-white/10 cursor-pointer text-white transition-colors hover:scale-105 active:scale-95 z-40"
          >
            {isAr ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
          </button>

          {/* Image Container */}
          <div className="max-w-4xl max-h-[80vh] flex items-center justify-center overflow-hidden relative">
            <img 
              src={imagesList[activeImageIdx]} 
              className="max-w-full max-h-full object-contain transition-transform duration-300 shadow-2xl cursor-grab active:cursor-grabbing"
              style={{ transform: `scale(${lightboxScale})` }}
              alt="Elite Real Estate Detail"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Right Arrow */}
          <button 
            onClick={() => setActiveImageIdx(prev => (prev + 1) % imagesList.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-neutral-900/60 hover:bg-neutral-800 rounded-full border border-white/10 cursor-pointer text-white transition-colors hover:scale-105 active:scale-95 z-40"
          >
            {isAr ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
          </button>

          {/* Thumbnail row below lightbox */}
          <div className="absolute bottom-6 left-4 right-4 flex justify-center gap-2 overflow-x-auto py-2 max-w-2xl mx-auto scrollbar-hide">
            {imagesList.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveImageIdx(idx);
                  setLightboxScale(1);
                }}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                  idx === activeImageIdx ? 'border-amber-400 scale-105' : 'border-transparent opacity-50'
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Breadcrumb strip */}
      <div className="border-b border-neutral-200/50 bg-neutral-50/50 py-4.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500 font-sans">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button 
              onClick={() => onNavigate?.('home')} 
              className="hover:text-amber-650 transition-colors font-semibold cursor-pointer"
            >
              {isAr ? 'الرئيسية' : 'Home'}
            </button>
            <span>/</span>
            <button 
              onClick={() => onNavigate?.('properties')} 
              className="hover:text-amber-650 transition-colors font-semibold cursor-pointer"
            >
              {isAr ? 'العقارات والفلل' : 'Real Estates'}
            </button>
            <span>/</span>
            <span className="text-neutral-800 font-bold max-w-[200px] truncate">{t(property.title)}</span>
          </div>

          <button
            onClick={onBackToListing}
            className="flex items-center gap-1 text-slate-800 hover:text-amber-600 transition-colors font-bold cursor-pointer border border-neutral-200 bg-white px-3 py-1.5 rounded-lg text-[11px]"
          >
            {isAr ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span>{isAr ? 'العودة للتصفح' : 'Go back'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* SIDEBAR COLUMNS (Inquiry Form on Left for RTL / Right for LTR) - width 4cols */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* SECTION 13: INQUIRY PANEL (STIKCY SIDEBAR) */}
            <div 
              id="sticky-inquiry-sidebar"
              className="bg-slate-950 border border-slate-850 rounded-2xl p-6.5 text-white shadow-xl space-y-5"
            >
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-amber-500 tracking-wider">
                  {isAr ? 'تقديم طلب مخصص وآمن' : 'SCHEDULE APPOINTMENT'}
                </span>
                <h3 className="font-sans font-black text-xl text-neutral-50 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span>{isAr ? 'التواصل والاستفسار' : 'Contact & Inquiry'}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isAr ? 'نحن هنا لمساعدتك على إتمام الصفقة الأمثل عقارياً.' : 'Connect directly with developer representative.'}
                </p>
              </div>

              {inquirySuccess ? (
                <div className="bg-emerald-950/60 border border-emerald-800 rounded-xl p-4 text-emerald-400 text-center space-y-2 animate-fadeIn">
                  <Check className="w-8 h-8 mx-auto text-emerald-400" />
                  <p className="text-xs font-black">{isAr ? '✓ تم قيد اهتمامك وإرساله لـ CRM' : '✓ CRM logged successfully!'}</p>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    {isAr ? 'سيتصل بك مستشارنا العقاري خلال دقائق معدودة للتنسيق.' : 'Your personal developer adviser will buzz shortly.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormInquirySubmit} className="space-y-4 text-xs">
                  <div className="space-y-1.5 text-right">
                    <label className="text-[10px] text-slate-400 font-bold block">{isAr ? 'الاسم بالكامل' : 'Full Name'}</label>
                    <input 
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder={isAr ? 'أ. أحمد الشمري' : 'e.g. John Doe'}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 focus:border-amber-400 focus:outline-none text-slate-100 text-right font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5 text-right">
                    <label className="text-[10px] text-slate-400 font-bold block">{isAr ? 'رقم الجوال النشط' : 'Mobile Number'}</label>
                    <input 
                      type="tel"
                      required
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      placeholder="05xxxxxxxx"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 focus:border-amber-400 focus:outline-none text-slate-100 text-left font-sans font-semibold"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5 text-right">
                    <label className="text-[10px] text-slate-400 font-bold block">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
                    <input 
                      type="email"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      placeholder="someone@domain.com"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 focus:border-amber-400 focus:outline-none text-slate-100 text-left font-sans font-semibold"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5 text-right">
                    <label className="text-[10px] text-slate-400 font-bold block">{isAr ? 'تفاصيل رسالتك أو العرض المرغوب' : 'Your message'}</label>
                    <textarea 
                      rows={3}
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder={isAr ? 'أرغب بالتنسيق لمعاينة فيلا النور والحصول على الأسعار المباشرة والمخططات الملحقة...' : 'Schedule site visit and payment plans details...'}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 focus:border-amber-400 focus:outline-none text-slate-100 text-right leading-relaxed font-semibold placeholder:text-slate-600"
                    />
                  </div>

                  {/* Ref placeholders */}
                  <div className="grid grid-cols-2 gap-3 text-[10px] bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/40 text-slate-400 font-sans">
                    <div>
                      <span className="block font-bold">{isAr ? 'كود العقار' : 'Property Code'}</span>
                      <span className="font-mono text-amber-400 font-black">{property.unitCode || property.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="block font-bold">{isAr ? 'مرجع المشروع' : 'Project Ref'}</span>
                      <span className="font-mono text-slate-300 font-black">{matchedProject ? t(matchedProject.name).slice(0,10) : '---'}</span>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isInquirySubmitting}
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/10 active:scale-95 disabled:opacity-50"
                  >
                    {isInquirySubmitting ? (isAr ? 'جاري التسجيل...' : 'Recording...') : (isAr ? 'إرسال الاستفسار والطلب' : 'Send Inquiry')}
                  </button>
                </form>
              )}

              {/* Instant Messenger and dialers */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a 
                  href={`https://wa.me/966501234567?text=${encodeURIComponent(isAr ? `السلام عليكم، أرغب بالاستفسار عن العقار: ${t(property.title)}` : `Hello, calling to request details about: ${t(property.title)}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-emerald-600/15 border border-emerald-900 text-emerald-400 rounded-xl hover:bg-emerald-600/30 text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <MessageCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{isAr ? 'تواصل عبر واتساب' : 'WhatsApp'}</span>
                </a>

                <a 
                  href="tel:+966501234567"
                  className="p-3 bg-blue-600/15 border border-blue-900 text-blue-400 rounded-xl hover:bg-blue-600/30 text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Phone className="w-4 h-4 shrink-0 text-blue-400" />
                  <span>{isAr ? 'اتصل الآن' : 'Call Sales'}</span>
                </a>
              </div>

              {/* Fast favorite link toggler */}
              <button 
                onClick={handleToggleSave}
                className="w-full flex items-center justify-center gap-2 text-xs py-2 border-t border-slate-900/80 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                <span>{isSaved ? (isAr ? 'حفظت العقار بمفضلتك' : 'Saved to favorites') : (isAr ? 'حفظ العقار في المفضلة' : 'Save estate to favorites')}</span>
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="space-y-1">
                <Shield className="w-5 h-5 mx-auto text-amber-600" />
                <span className="font-bold block text-[10px] text-neutral-800">{isAr ? 'خصوصية تامة' : 'Full Secure'}</span>
                <span className="text-[9px] text-neutral-400 block">{isAr ? 'البيانات محمية' : 'Data SSL protected'}</span>
              </div>
              <div className="space-y-1 border-x border-neutral-150">
                <Workflow className="w-5 h-5 mx-auto text-amber-600" />
                <span className="font-bold block text-[10px] text-neutral-800">{isAr ? 'دعم احترافي' : 'Elite Support'}</span>
                <span className="text-[9px] text-neutral-400 block">{isAr ? 'من فريقنا المخصص' : 'Dedicated team'}</span>
              </div>
              <div className="space-y-1">
                <Activity className="w-5 h-5 mx-auto text-amber-600" />
                <span className="font-bold block text-[10px] text-neutral-800">{isAr ? 'رد سريع' : 'Instant Reply'}</span>
                <span className="text-[9px] text-neutral-400 block">{isAr ? 'على استفساراتك' : 'Under 1 hour'}</span>
              </div>
            </div>

          </div>

          {/* MAIN PAGE SECTIONS - width 8cols */}
          <div className="lg:col-span-8 space-y-10">

            {/* SECTION 1: LUXURY HERO EXPERIENCE */}
            <div className="space-y-6" id="luxury-hero-experience">
              
              {/* Media slider banner block */}
              <div className="relative aspect-video w-full rounded-2xl bg-neutral-950 overflow-hidden border border-neutral-200 flex items-center justify-center shadow-lg group">
                
                {imagesList.length === 0 ? (
                  renderFallbackVector()
                ) : (
                  <img 
                    src={imagesList[activeImageIdx]} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
                    alt="Property high definition rendering"
                    referrerPolicy="no-referrer"
                  />
                )}

                {/* Left/Right controls inside slider */}
                {imagesList.length > 1 && (
                  <>
                    <button 
                      onClick={() => setActiveImageIdx(p => (p - 1 + imagesList.length) % imagesList.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/50 hover:bg-black/80 rounded-full text-white cursor-pointer transition-colors z-20"
                    >
                      {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => setActiveImageIdx(p => (p + 1) % imagesList.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/50 hover:bg-black/80 rounded-full text-white cursor-pointer transition-colors z-20"
                    >
                      {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                  </>
                )}

                {/* Badge tags */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 text-[10px] text-right">
                  <span className="px-3 py-1 bg-black/80 text-white font-black rounded-lg border border-white/10 uppercase tracking-widest shadow-sm">
                    🏢 {t(property.type)}
                  </span>
                  
                  <span className={`px-3 py-1 font-black rounded-lg text-white border border-white/10 shadow-sm ${
                    property.status === 'available' ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}>
                    {getFarsiSarla(property.status)}
                  </span>

                  {property.featured && (
                    <span className="px-3 py-1 font-black rounded-lg text-slate-950 bg-amber-400 border border-amber-500 shadow-sm">
                      👑 {isAr ? 'عقار فريد مميز' : 'Featured Estate'}
                    </span>
                  )}
                </div>

                {/* Image count tracker overlay */}
                {imagesList.length > 0 && (
                  <div className="absolute bottom-4 right-4 text-[10px] font-bold px-3 py-1.5 rounded-lg bg-black/75 text-white shadow-md border border-white/10 z-10 font-mono tracking-widest">
                    <span>{activeImageIdx + 1} / {imagesList.length}</span>
                  </div>
                )}

                {/* Lightbox toggle icon overlay */}
                {imagesList.length > 0 && (
                  <button 
                    onClick={() => {
                      setLightboxScale(1);
                      setIsLightboxOpen(true);
                    }}
                    className="absolute bottom-4 left-4 p-2 bg-black/75 hover:bg-black text-white hover:text-amber-400 rounded-lg shadow-md border border-white/10 cursor-pointer z-10 transition-colors"
                    title={isAr ? 'عرض ملء الشاشة' : 'Fullscreen view'}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Thumbnails list underneath slider */}
              {imagesList.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 select-none">
                  {imagesList.slice(0, 5).map((imgUrl, thumbIdx) => {
                    const isSelected = thumbIdx === activeImageIdx;
                    return (
                      <button 
                        key={thumbIdx} 
                        onClick={() => setActiveImageIdx(thumbIdx)}
                        className={`h-22 rounded-xl overflow-hidden bg-neutral-900 shadow-sm border-2 transition-all ${
                          isSelected ? 'border-amber-400 scale-[1.02]' : 'border-neutral-200 opacity-65 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      </button>
                    );
                  })}
                  {imagesList.length > 5 && (
                    <button 
                      onClick={() => {
                        setActiveImageIdx(5);
                        setIsLightboxOpen(true);
                      }}
                      className="h-22 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-black text-xs flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 transition-all cursor-pointer"
                    >
                      <span className="font-mono text-sm">+{imagesList.length - 5}</span>
                      <span className="text-[9px] mt-0.5">{isAr ? 'صور إضافية' : 'More Photos'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Main property title block, pricing and fast actions line */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6.5 md:p-8 space-y-5 text-right shadow-sm">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{t(property.location)}</span>
                      {property.district && (
                        <>
                          <span>•</span>
                          <span>{t(property.district)}</span>
                        </>
                      )}
                    </div>
                    <h1 className="font-sans font-black text-3xl text-neutral-900 leading-normal tracking-tight">
                      {t(property.title)}
                    </h1>
                    {matchedProject && (
                      <div className="text-xs bg-slate-100 text-slate-800 font-bold px-3 py-1 rounded inline-block mt-1">
                        {isAr ? 'ضمن كمبوند المجمع:' : 'Part of Community:'} <span className="text-amber-700">{t(matchedProject.name)}</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="sm:text-left text-right bg-neutral-50 px-4.5 py-3 rounded-2xl border border-neutral-150 shrink-0 font-sans">
                    <span className="text-[10px] text-neutral-400 block font-bold uppercase tracking-widest">{isAr ? 'القيمة المطلوبة للتملك' : 'LISTING PRICE'}</span>
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="font-sans font-extrabold text-3xl text-slate-950">
                        {property.price.toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                      </span>
                      <span className="text-xs font-black text-amber-600">{property.currency || (isAr ? 'ريال' : 'SAR')}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                      {property.saleOrRent === 'rent' ? (isAr ? 'سنوياً - دفعتين' : 'Yearly rent') : (isAr ? 'دفع كاش / تملك كامل' : 'CASH / Freehold')}
                    </span>
                  </div>
                </div>

                {/* Quick actions panel */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <button 
                      onClick={handleShare}
                      className="flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-50 hover:bg-slate-150 border border-neutral-250 text-slate-850 hover:text-black font-semibold rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm"
                    >
                      <Share2 className="w-4 h-4 shrink-0 text-slate-650" />
                      <span>{copiedLink ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'مشاركة' : 'Share estate')}</span>
                    </button>
                    
                    <a 
                      href={`https://wa.me/966501234567?text=${encodeURIComponent(isAr ? `أرغب بالمعلومات لعقار: ${t(property.title)}` : `Specs for estate: ${t(property.title)}`)}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-800 font-semibold rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{isAr ? 'واتساب مبيعات' : 'WhatsApp'}</span>
                    </a>

                    <a 
                      href="tel:+966501234567"
                      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-250 text-blue-800 font-semibold rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm"
                    >
                      <Phone className="w-4 h-4 shrink-0 text-blue-600" />
                      <span>{isAr ? 'اتصال مباشر' : 'Direct Call'}</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleToggleSave}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-150 text-amber-900 font-bold rounded-xl cursor-pointer transition-all active:scale-95"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
                      <span>{isSaved ? (isAr ? 'مفضل لديك' : 'Saved') : (isAr ? 'حفظ الاهتمام' : 'Save')}</span>
                    </button>

                    <button 
                      onClick={handlePrint}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-neutral-200 text-slate-700 rounded-xl cursor-pointer transition-all active:scale-95"
                      title={isAr ? 'طباعة الكراس' : 'Print specs brochure'}
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* SECTION 2: PROPERTY SUMMARY STRIP */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6.5 text-right space-y-4 shadow-sm" id="property-summary-strip">
              <h3 className="font-sans font-black text-xs text-amber-700 uppercase tracking-wider block border-b border-neutral-100 pb-2">
                🏠 {isAr ? 'ملخص المواصفات والمساحات' : 'Unit Structural Summary'}
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
                <div className="bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-150 text-center space-y-1">
                  <Bed className="w-5 h-5 mx-auto text-amber-700" />
                  <span className="text-[11px] text-neutral-400 block">{isAr ? 'غرف نوم فسيحة' : 'Bedrooms'}</span>
                  <span className="font-sans font-extrabold text-sm text-neutral-800">{property.bedrooms}</span>
                </div>
                <div className="bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-150 text-center space-y-1">
                  <Bath className="w-5 h-5 mx-auto text-amber-700" />
                  <span className="text-[11px] text-neutral-400 block">{isAr ? 'دورات المياه' : 'Bathrooms'}</span>
                  <span className="font-sans font-extrabold text-sm text-neutral-800">{property.bathrooms}</span>
                </div>
                {property.livingRooms && property.livingRooms > 0 ? (
                  <div className="bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-150 text-center space-y-1">
                    <DoorOpen className="w-5 h-5 mx-auto text-amber-700" />
                    <span className="text-[11px] text-neutral-400 block">{isAr ? 'المجالس والصالات' : 'Living Rooms'}</span>
                    <span className="font-sans font-extrabold text-sm text-neutral-800">{property.livingRooms}</span>
                  </div>
                ) : null}
                <div className="bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-150 text-center space-y-1">
                  <Maximize2 className="w-5 h-5 mx-auto text-amber-700" />
                  <span className="text-[11px] text-neutral-400 block">{isAr ? 'مسطح البناء' : 'Built-up Area'}</span>
                  <span className="font-sans font-extrabold text-sm text-neutral-900">{property.areaSqm} {isAr ? 'م٢' : 'm²'}</span>
                </div>
                {property.balconies && property.balconies > 0 ? (
                  <div className="bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-150 text-center space-y-1">
                    <Compass className="w-5 h-5 mx-auto text-amber-700" />
                    <span className="text-[11px] text-neutral-400 block">{isAr ? 'شرفات وبلكونة' : 'Balconies'}</span>
                    <span className="font-sans font-extrabold text-sm text-neutral-800">{property.balconies}</span>
                  </div>
                ) : null}
                {property.parkingSpaces && property.parkingSpaces > 0 ? (
                  <div className="bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-150 text-center space-y-1">
                    <Car className="w-5 h-5 mx-auto text-amber-700" />
                    <span className="text-[11px] text-neutral-400 block">{isAr ? 'مواقف مخصصة' : 'Parking Spaces'}</span>
                    <span className="font-sans font-extrabold text-sm text-neutral-800">{property.parkingSpaces}</span>
                  </div>
                ) : null}
                {property.floorNumber !== undefined ? (
                  <div className="bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-150 text-center space-y-1">
                    <Layers className="w-5 h-5 mx-auto text-amber-700" />
                    <span className="text-[11px] text-neutral-400 block">{isAr ? 'رقم الطابق' : 'Floor Level'}</span>
                    <span className="font-sans font-extrabold text-sm text-neutral-850">
                      {property.floorNumber === 0 ? (isAr ? 'أرضي' : 'Ground') : `${property.floorNumber}`}
                    </span>
                  </div>
                ) : null}
                {property.propertyAge !== undefined ? (
                  <div className="bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-150 text-center space-y-1">
                    <Calendar className="w-5 h-5 mx-auto text-amber-700" />
                    <span className="text-[11px] text-neutral-400 block">{isAr ? 'عمر العقار' : 'Property Age'}</span>
                    <span className="font-sans font-extrabold text-sm text-neutral-800">
                      {property.propertyAge === 0 ? (isAr ? 'جديد (صفر)' : 'Brand New') : `${property.propertyAge} ${isAr ? 'سنة' : 'yrs'}`}
                    </span>
                  </div>
                ) : null}
              </div>

            </div>

            {/* SECTION 4 & SECTION 5: PROPERTY DESCRIPTION AND HIGHLIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* SECTION 4: PROPERTY DESCRIPTION */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6.5 text-right space-y-4 shadow-sm" id="property-description">
                <h3 className="font-sans font-black text-xs text-amber-700 uppercase tracking-wider block border-b border-slate-100 pb-2">
                  📝 {isAr ? 'وصف تفصيلي كامل للعقار' : 'Narrative & Description'}
                </h3>
                
                <p className="text-neutral-700 text-sm leading-relaxed whitespace-pre-wrap font-semibold font-sans">
                  {t(property.description)}
                </p>
              </div>

              {/* SECTION 5: PROPERTY HIGHLIGHTS */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6.5 text-right space-y-4 shadow-sm" id="property-highlights">
                <h3 className="font-sans font-black text-xs text-amber-700 uppercase tracking-wider block border-b border-slate-100 pb-2">
                  ✨ {isAr ? 'أبرز مميزات العقار والنقاط الجاذبة' : 'Estates Highlining Traits'}
                </h3>

                <div className="space-y-2.5">
                  {property.highlights && property.highlights.length > 0 ? (
                    property.highlights.map((hlt, idx) => (
                      <div key={idx} className="p-3 bg-amber-50/45 border border-amber-100 rounded-xl flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 leading-normal">{t(hlt)}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      {/* Premium fallbacks in case empty */}
                      <div className="p-3 bg-amber-50/45 border border-amber-100 rounded-xl flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 leading-normal">{isAr ? 'موقع مميز وجذاب للغاية' : 'High luxury strategic corner'}</span>
                      </div>
                      <div className="p-3 bg-amber-50/45 border border-amber-100 rounded-xl flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 leading-normal">{isAr ? 'المقاييس الفاخرة للتشطيب النهائي والرخام' : 'Luxury finishes and Italian marbling'}</span>
                      </div>
                      <div className="p-3 bg-amber-50/45 border border-amber-100 rounded-xl flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 leading-normal">{isAr ? 'قريب من محاور الرياض الرئيسية والطرق العامة' : 'Near vital capital arteries'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* SECTION 3: GENERAL OVERVIEW */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6.5 text-right space-y-4 shadow-sm animate-fadeIn" id="property-overview">
              <h3 className="font-sans font-black text-xs text-[#B45309] uppercase tracking-wider block border-b border-neutral-100 pb-2">
                📊 {isAr ? 'نظرة عامة وبيانات الفحص للعقار' : 'Technical Specifications Registry'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="space-y-2 border-b border-neutral-100 md:border-b-0 md:pb-0 pb-2">
                  <div className="flex justify-between py-1 border-b border-dotted border-neutral-200">
                    <span className="text-neutral-400 font-bold block">{isAr ? 'تصنيف ونوع العقار' : 'Property Type'}</span>
                    <span className="font-bold text-neutral-800">{t(property.type)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dotted border-neutral-200">
                    <span className="text-neutral-400 font-bold block">{isAr ? 'الغرض والهدف' : 'Purpose'}</span>
                    <span className="font-bold text-neutral-800">
                      {property.saleOrRent === 'rent' ? (isAr ? 'للإيجار' : 'For Rent') : (isAr ? 'للبيع تملك' : 'For Sale')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dotted border-neutral-200">
                    <span className="text-neutral-400 font-bold block">{isAr ? 'حالة الأصول الحالية' : 'Operational Status'}</span>
                    <span className="font-bold text-slate-850">{getFarsiSarla(property.status)}</span>
                  </div>
                  {property.finishingType && (
                    <div className="flex justify-between py-1 border-b border-dotted border-neutral-200">
                      <span className="text-neutral-400 font-bold block">{isAr ? 'فئة وجودة التشطيب' : 'Finishing Type'}</span>
                      <span className="font-bold text-neutral-800">{t(property.finishingType)}</span>
                    </div>
                  )}
                  {property.ownershipType && (
                    <div className="flex justify-between py-1 border-b border-dotted border-neutral-200">
                      <span className="text-neutral-400 font-bold block">{isAr ? 'صيغة الملكية والإثبات' : 'Ownership Type'}</span>
                      <span className="font-bold text-neutral-800">{t(property.ownershipType)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-dotted border-neutral-200">
                    <span className="text-neutral-400 font-bold block">{isAr ? 'المدينة الإدارية' : 'City Territory'}</span>
                    <span className="font-bold text-amber-700">{property.district ? t(property.location) : (isAr ? 'الرياض' : 'Riyadh')}</span>
                  </div>
                  {property.district && (
                    <div className="flex justify-between py-1 border-b border-dotted border-neutral-200">
                      <span className="text-neutral-400 font-bold block">{isAr ? 'الحي / المربع' : 'District Area'}</span>
                      <span className="font-bold text-neutral-800">{t(property.district)}</span>
                    </div>
                  )}
                  {property.developer && (
                    <div className="flex justify-between py-1 border-b border-dotted border-neutral-200">
                      <span className="text-neutral-400 font-bold block">{isAr ? 'المطور الإنشائي' : 'Corporate Developer'}</span>
                      <span className="font-bold text-neutral-800">{t(property.developer)}</span>
                    </div>
                  )}
                  {property.listingDate && (
                    <div className="flex justify-between py-1 border-b border-dotted border-neutral-200">
                      <span className="text-neutral-400 font-bold block">{isAr ? 'تاريخ عرض العقار' : 'Listing Date'}</span>
                      <span className="font-mono font-bold text-neutral-800">{property.listingDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-dotted border-neutral-200">
                    <span className="text-neutral-400 font-bold block">{isAr ? 'كود المرجع العقاري' : 'Serial Database PIN'}</span>
                    <span className="font-mono font-black text-slate-800 uppercase tracking-widest">
                      {property.unitCode || `PR-${property.id.slice(-6).toUpperCase()}`}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* SECTION 6: AMENITIES & FEATURES */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6.5 text-right space-y-4 shadow-sm" id="property-amenities">
              <h3 className="font-sans font-black text-xs text-amber-700 uppercase tracking-wider block border-b border-neutral-100 pb-2">
                🏊‍♂️ {isAr ? 'المرافق والتجهيزات التقنية والراحة' : 'Amenities & Core Convenience'}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
                {property.amenityParking && (
                  <div className="p-3 bg-neutral-50/50 rounded-xl border border-neutral-150 flex items-center gap-2">
                    <Car className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-neutral-750">{isAr ? 'موقف سيارات' : 'Parking'}</span>
                  </div>
                )}
                {property.amenityCoveredParking && (
                  <div className="p-3 bg-neutral-50/50 rounded-xl border border-neutral-150 flex items-center gap-2">
                    <Car className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-neutral-750">{isAr ? 'موقف مغطى خاص' : 'Covered Parking'}</span>
                  </div>
                )}
                {property.amenityPool && (
                  <div className="p-3 bg-neutral-50/50 rounded-xl border border-neutral-150 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-bold text-neutral-750">{isAr ? 'مسبح مشترك' : 'Community Pool'}</span>
                  </div>
                )}
                {property.amenityPrivatePool && (
                  <div className="p-3 bg-neutral-50/50 rounded-xl border border-neutral-150 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-sky-600 shrink-0" />
                    <span className="font-bold text-neutral-750">{isAr ? 'مسبح خاص' : 'Private Suite Pool'}</span>
                  </div>
                )}
                {property.amenityGym && (
                  <div className="p-3 bg-neutral-50/50 rounded-xl border border-neutral-150 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-bold text-neutral-750">{isAr ? 'نادي رياضي صحي' : 'Fitness Gym'}</span>
                  </div>
                )}
                {property.amenitySecurity && (
                  <div className="p-3 bg-neutral-50/50 rounded-xl border border-neutral-150 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-neutral-750">{isAr ? 'حراسة وأمن ٢٤/٧' : 'CCTV Guards'}</span>
                  </div>
                )}
                {property.amenityElevator && (
                  <div className="p-3 bg-neutral-50/50 rounded-xl border border-neutral-150 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-neutral-750">{isAr ? 'مصعد كهربائي' : 'Schindler Elevator'}</span>
                  </div>
                )}
                {property.amenitySmartHome && (
                  <div className="p-3 bg-neutral-50/50 rounded-xl border border-neutral-150 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="font-bold text-neutral-750">{isAr ? 'نظام تحكم ذكي' : 'Smart Home Hub'}</span>
                  </div>
                )}
                {property.amenityChildrenArea && (
                  <div className="p-3 bg-neutral-50/50 rounded-xl border border-neutral-150 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-neutral-750">{isAr ? 'منطقة أطفال آمنة' : 'Children Park'}</span>
                  </div>
                )}
                {property.amenityGarden && (
                  <div className="p-3 bg-neutral-50/50 rounded-xl border border-neutral-150 flex items-center gap-2">
                    <TreePine className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-bold text-neutral-750">{isAr ? 'حديقة غناء خاصة' : 'Garden Estate'}</span>
                  </div>
                )}
                {property.amenityMaidRoom && (
                  <div className="p-3 bg-neutral-50/50 rounded-xl border border-neutral-150 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span className="font-bold text-neutral-750">{isAr ? 'غرفة خادمة ماستر' : 'Maid Quarter'}</span>
                  </div>
                )}
                {property.amenityDriverRoom && (
                  <div className="p-3 bg-neutral-50/50 rounded-xl border border-neutral-150 flex items-center gap-2">
                    <Car className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span className="font-bold text-neutral-750">{isAr ? 'غرفة سائق مستقلة' : 'Driver Suite'}</span>
                  </div>
                )}
                {property.amenityMosque && (
                  <div className="p-3 bg-neutral-50/50 rounded-xl border border-neutral-150 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-neutral-750 shrink-0" />
                    <span className="font-bold text-neutral-750">{isAr ? 'مسجد جامع مدمج' : 'Integrated Mosque'}</span>
                  </div>
                )}

                {/* Render Custom Amenities created by Admin dynamically */}
                {property.customAmenities && property.customAmenities.map((am, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-neutral-800">{t(am)}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* SECTION 7 & SECTION 8: FLOOR PLANS AND PROPERTY DOCUMENTS */}
            {(floorPlansList.length > 0 || documentsList.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* SECTION 7: FLOOR PLANS */}
                {floorPlansList.length > 0 ? (
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6 text-right space-y-4 shadow-sm" id="property-floorplan">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="font-sans font-black text-xs text-amber-700 uppercase tracking-wider block">
                        🗺️ {isAr ? 'الكروكي الهندسي ومخطط الطابق' : 'Architectural Floor Plans'}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-amber-600">
                        <button 
                          onClick={() => setZoomLevel(prev => prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1)}
                          className="p-1 px-2.5 bg-neutral-150 hover:bg-neutral-205 text-[11px] rounded transition-all cursor-pointer font-bold"
                        >
                          🔍 {zoomLevel === 1 ? (isAr ? 'تكبير' : 'Zoom') : (isAr ? 'تصغير' : 'Reset')}
                        </button>
                      </div>
                    </div>

                    <div className="w-full aspect-video rounded-xl bg-neutral-950 overflow-hidden border border-neutral-150 shadow-inner flex items-center justify-center p-3 relative">
                      <img 
                        src={floorPlansList[0]} 
                        className="max-h-full max-w-full object-contain transition-transform duration-300" 
                        style={{ transform: `scale(${zoomLevel})` }}
                        alt="Detailed Engineering map"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {floorPlansList.length > 1 && (
                      <p className="text-[10px] text-neutral-400 font-bold leading-normal text-center bg-slate-50 p-2 rounded">
                        ℹ️ {isAr ? 'العقار يحتوي على مساحات إضافية، راجع ملف مواصفات الـ PDF.' : 'More sheets are packaged inside corporate Spec File.'}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6 text-right space-y-4 shadow-sm">
                    <h3 className="font-sans font-black text-xs text-amber-700 uppercase tracking-wider block border-b border-slate-100 pb-2">
                      🗺️ {isAr ? 'مخطط الطابق والتجهيز' : 'Floor Plans Layout'}
                    </h3>
                    <div className="aspect-video w-full rounded-xl bg-neutral-50 flex flex-col items-center justify-center border border-dashed border-neutral-200 text-center p-4">
                      <ArchitecturalPlanSVG className="w-12 h-12 opacity-30 text-amber-800" />
                      <p className="text-[11px] text-neutral-450 mt-2">
                        {isAr ? 'الكروكي والمخطط الهندسي تحت المراجعة الفنية، تواصل لطلب نسخة.' : 'Floor maps are proprietary, request via inquiry panel.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* SECTION 8: PROPERTY DOCUMENTS */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 text-right space-y-4 shadow-sm" id="property-documents">
                  <h3 className="font-sans font-black text-xs text-amber-700 uppercase tracking-wider block border-b border-slate-100 pb-2">
                    📁 {isAr ? 'المستندات ووثائق التملك الجاهزة' : 'Spec sheets & PDF brochures'}
                  </h3>

                  <div className="space-y-3">
                    {documentsList.length > 0 ? (
                      documentsList.map((doc, dIdx) => (
                        <a 
                          key={dIdx}
                          href={doc.url}
                          download={`Bina_estate_specification_sheet_${dIdx + 1}.pdf`}
                          className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-150 rounded-xl transition-all cursor-pointer font-sans"
                        >
                          <div className="flex items-center gap-3">
                            <FileSpreadsheet className="w-5 h-5 text-[#E11D48] shrink-0" />
                            <div className="text-right">
                              <span className="font-bold text-xs text-neutral-800 block leading-tight">{doc.name}</span>
                              <span className="text-[10px] text-neutral-400 block font-semibold mt-0.5">PDF Document • 4.8 MB</span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-neutral-200 hover:bg-neutral-300 px-3 py-1.5 rounded-lg font-black shrink-0 text-slate-800">
                            {isAr ? 'تحميل' : 'Download'}
                          </span>
                        </a>
                      ))
                    ) : (
                      <>
                        <a 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            alert(isAr ? 'تنزيل كراس التطوير معلق حتى تأكيد مستندات الإفراغ العقاري.' : 'Brochure download will trigger after booking validation.');
                          }}
                          className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-150 rounded-xl transition-all cursor-pointer font-sans"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-[#E11D48]" />
                            <div className="text-right">
                              <span className="font-bold text-xs text-neutral-800 block leading-tight">
                                {isAr ? 'بروشور المبيعات وكراس المواصفات الإنشائية' : 'Technical Specifications Brochure'}
                              </span>
                              <span className="text-[10px] text-neutral-400 block mt-0.5">PDF booklet • 3.2 MB</span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-amber-500 text-slate-950 px-2 rounded-lg font-black">
                            {isAr ? 'طلب الكراس' : 'Request'}
                          </span>
                        </a>
                        
                        <div className="p-3 bg-neutral-50/70 text-[10px] text-neutral-450 leading-relaxed rounded-xl">
                          💡 {isAr 
                            ? 'المجلدات تشمل المخططات الإنشائية وتفاصيل السباكة والكهرباء والضمانات البنائية الموثقة.'
                            : 'Documents pack includes real structural safety guarantees, and electrical blueprints.'}
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* SECTION 9: VIDEO & VIRTUAL TOUR */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6.5 text-right space-y-4 shadow-sm" id="property-video-tour">
              <h3 className="font-sans font-black text-xs text-amber-700 uppercase tracking-wider block border-b border-neutral-100 pb-2">
                🎥 {isAr ? 'الفيديو والجولة الافتراضية ۳D للعقار' : 'Media, Video & Immersive 3D Tours'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Property / Project video frame */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'العرض المرئي الترويجي للمشروع' : 'Corporate Video Reel'}</span>
                  {property.videoUploadId && mediaItems[property.videoUploadId] ? (
                    <div className="w-full aspect-video rounded-xl bg-neutral-950 overflow-hidden relative border border-slate-200 shadow-lg">
                      <video 
                        controls
                        className="w-full h-full object-cover" 
                        src={mediaItems[property.videoUploadId]}
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-xl bg-neutral-900 border border-neutral-200 flex flex-col items-center justify-center p-4 text-center">
                      <Video className="w-8 h-8 text-amber-700 opacity-60" />
                      <p className="text-[10px] text-neutral-400 mt-1.5 leading-normal">
                        {isAr ? 'الشريط الترويجي الإعلاني غير متاح حالياً.' : 'Custom property video is pending production.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Virtual Tour section */}
                <div className="flex flex-col justify-between space-y-4 bg-slate-50 p-4.5 rounded-xl border border-neutral-200 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-amber-750 font-bold block">{isAr ? 'بوابة المعاينة والجولة الافتراضية ثلاثية الأبعاد' : '3D Immersive VR Tour'}</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                      {isAr 
                        ? 'تفضل بزيارة عقارك المستقبلي وتفقد أدق التفاصيل الهندسية دون الحاجة لمغادرة مكتبك عبر تقنية نظارات الواقع الافتراضي.'
                        : 'Explore detailed spatial layouts of this premium masterwork. Compatible with VR gadgets.'}
                    </p>
                  </div>

                  <div className="space-y-2 font-semibold">
                    {property.virtualTourUrl ? (
                      <a 
                        href={property.virtualTourUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 p-2.5 bg-neutral-900 hover:bg-slate-800 text-white rounded-xl transition-all cursor-pointer shadow"
                      >
                        <Compass className="w-4 h-4" />
                        <span>{isAr ? 'ابدأ الاستعراض الافتراضي 3D' : 'Launch 3D Virtual Tour'}</span>
                      </a>
                    ) : (
                      <button 
                        onClick={() => alert(isAr ? 'قريباً: سيتم إشعال محرك جيب ثلاثي الأبعاد للعقار!' : 'VR engine launch is scheduled for next release.')}
                        className="w-full flex items-center justify-center gap-2 p-2.5 bg-neutral-150 text-neutral-600 rounded-xl transition-all cursor-not-allowed"
                      >
                        <Compass className="w-4 h-4 text-neutral-450" />
                        <span>{isAr ? 'الجولة الافتراضية ۳D (قريباً)' : '3D Virtual Tour (Coming soon)'}</span>
                      </button>
                    )}

                    {property.tour360Url && (
                      <a 
                        href={property.tour360Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 p-2.5 border border-dashed border-amber-600 hover:bg-amber-50 rounded-xl text-amber-900 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isAr ? 'جولة ۳٦٠ درجة بانورامية' : '360° Panoramic view'}</span>
                      </a>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* SECTION 10: LOCATION EXPERIENCE & SECTION 11: NEARBY PLACES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
              
              {/* SECTION 10: LOCATION EXPERIENCE */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6.5 text-right space-y-4 shadow-sm" id="property-location">
                <h3 className="font-sans font-black text-xs text-[#B45309] uppercase tracking-wider block border-b border-slate-100 pb-2">
                  📍 {isAr ? 'الموقع الجغرافي وخريطة التدشين' : 'Location coordinates on map'}
                </h3>

                <div className="space-y-4">
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs font-sans space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-400 font-bold">{isAr ? 'العنوان' : 'Address'}</span>
                      <span className="font-bold text-neutral-800">{property.address ? t(property.address) : t(property.location)}</span>
                    </div>
                    {property.coordinates && (
                      <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                        <span className="text-neutral-400 font-bold">{isAr ? 'إحداثيات تحديد GPS' : 'GPS Coordinates'}</span>
                        <span className="font-mono text-slate-800 font-bold">{property.coordinates}</span>
                      </div>
                    )}
                  </div>

                  {/* Standard high premium visual map block */}
                  <div className="h-44 w-full bg-slate-100 border border-neutral-250 rounded-xl overflow-hidden relative shadow-inner">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <ArchitecturalPlanSVG />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 space-y-2 font-sans bg-transparent">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md bg-amber-500">
                        <MapPin className="w-5 h-5 text-neutral-900" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-neutral-950 font-sans">{t(property.title)}</h4>
                        <p className="text-[10px] text-neutral-500 font-bold">{property.coordinates || '24.8459° N, 46.6588° E'}</p>
                      </div>
                    </div>
                  </div>

                  {property.coordinates ? (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.coordinates)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 p-2.5 text-xs border border-neutral-300 hover:bg-neutral-50 font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4 text-neutral-500" />
                      <span>{isAr ? 'فتح المسار في خرائط جوجل' : 'Open in Google Maps'}</span>
                    </a>
                  ) : (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t(property.location) + ' ' + (property.district ? t(property.district) : ''))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 p-2.5 text-xs border border-neutral-300 hover:bg-neutral-50 font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4 text-neutral-500" />
                      <span>{isAr ? 'فتح وتتبع خط السير' : 'Open in Google Maps'}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* SECTION 11: NEARBY PLACES */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6.5 text-right space-y-4 shadow-sm" id="property-nearby">
                <h3 className="font-sans font-black text-xs text-amber-700 uppercase tracking-wider block border-b border-slate-100 pb-2">
                  🎒 {isAr ? 'المقاصد والمواقع القريبة المحيطة' : 'Nearby amenities within check range'}
                </h3>

                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {property.nearbyPlaces && property.nearbyPlaces.length > 0 ? (
                    property.nearbyPlaces.map((pl, idx) => {
                      const iconMap = () => {
                        const typPr = pl.type?.toLowerCase();
                        if (typPr?.includes('school') || typPr?.includes('مدرسة') || typPr?.includes('تعليم')) return <GraduationCap className="w-4 h-4 text-sky-600" />;
                        if (typPr?.includes('hospital') || typPr?.includes('مستشفى') || typPr?.includes('مرقد')) return <HeartPulse className="w-4 h-4 text-rose-600" />;
                        if (typPr?.includes('mosque') || typPr?.includes('مسجد') || typPr?.includes('جامع')) return <Compass className="w-4 h-4 text-emerald-600" />;
                        if (typPr?.includes('mall') || typPr?.includes('مول') || typPr?.includes('تسوق')) return <ShoppingBag className="w-4 h-4 text-purple-600" />;
                        if (typPr?.includes('restaurant') || typPr?.includes('مطعم')) return <Utensils className="w-4 h-4 text-amber-600" />;
                        if (typPr?.includes('park') || typPr?.includes('حديقة') || typPr?.includes('منتزه')) return <TreePine className="w-4 h-4 text-emerald-550" />;
                        return <Train className="w-4 h-4 text-blue-600" />;
                      };

                      return (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-150 text-xs">
                          <div className="flex items-center gap-2">
                            {iconMap()}
                            <span className="font-bold text-neutral-800 leading-tight">{t(pl.name)}</span>
                          </div>
                          <span className="font-mono text-[11px] text-neutral-450 font-black">{pl.distance}</span>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      {/* Premium fallbacks */}
                      <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-150 text-xs">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-sky-600" />
                          <span className="font-bold text-neutral-800 leading-tight">{isAr ? 'مدارس النخبة النموذجية الأهلية' : 'Al Nokhabah Model School'}</span>
                        </div>
                        <span className="font-mono text-[11px] text-neutral-450 font-black">1.2 {isAr ? 'كم' : 'km'}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-150 text-xs">
                        <div className="flex items-center gap-2">
                          <HeartPulse className="w-4 h-4 text-rose-600" />
                          <span className="font-bold text-neutral-800 leading-tight">{isAr ? 'مستشفى المملكة التخصصي ورئاسة الرضوض' : 'Kingdom Specialist Hospital'}</span>
                        </div>
                        <span className="font-mono text-[11px] text-neutral-450 font-black">3.1 {isAr ? 'كم' : 'km'}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-150 text-xs">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-purple-600" />
                          <span className="font-bold text-neutral-800 leading-tight">{isAr ? 'النرجس سنتر مول والمقاصد التجارية' : 'An Narjis Center Mall'}</span>
                        </div>
                        <span className="font-mono text-[11px] text-neutral-450 font-black">2.3 {isAr ? 'كم' : 'km'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* SECTION 12: PROPERTY SPECIFICATIONS TABLE */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6.5 text-right space-y-4 shadow-sm" id="property-specs-table">
              <h3 className="font-sans font-black text-xs text-amber-700 uppercase tracking-wider block border-b border-slate-100 pb-2">
                📋 {isAr ? 'جدول البيانات الفنية والتوثيق المكتوب' : 'Estate Detailed Technical Specification Table'}
              </h3>

              <div className="overflow-x-auto select-none" dir={isAr ? 'rtl' : 'ltr'}>
                <table className="w-full text-right text-xs text-neutral-900 font-sans border-neutral-100 border">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-450 font-black border-b border-neutral-200">
                      <th className="p-3.5">{isAr ? 'المواصفة والبيان' : 'Specification Field'}</th>
                      <th className="p-3.5">{isAr ? 'القيمة المسجلة بالرمز' : 'Value Registered'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-semibold text-slate-800">
                    <tr>
                      <td className="p-3.5 text-neutral-450 font-bold">{isAr ? 'رقم مجمع المرجع الخاص' : 'Reference Serial'}</td>
                      <td className="p-3.5 font-mono">{property.unitCode || property.id.toUpperCase()}</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 text-neutral-450 font-bold">{isAr ? 'تصنيف الصنف السكني' : 'Property Type'}</td>
                      <td className="p-3.5">{t(property.type)}</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 text-neutral-450 font-bold">{isAr ? 'البلدة ومقعد الحي' : 'Territory Block'}</td>
                      <td className="p-3.5">{t(property.location)} {property.district ? ` • ${t(property.district)}` : ''}</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 text-neutral-450 font-bold">{isAr ? 'المساحة الصافية للإفراغ' : 'Net Area Sqm'}</td>
                      <td className="p-3.5 font-mono">{property.areaSqm} {isAr ? 'متر مربع' : 'sqm'}</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 text-neutral-450 font-bold">{isAr ? 'مستودع النوم' : 'Bedrooms count'}</td>
                      <td className="p-3.5">{property.bedrooms} {isAr ? 'غرف نوم رئيسية' : 'Rooms'}</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 text-neutral-450 font-bold">{isAr ? 'المراحيض المتاحة' : 'Bathrooms'}</td>
                      <td className="p-3.5">{property.bathrooms} {isAr ? 'دورات مياه فندقية' : 'Baths'}</td>
                    </tr>
                    {property.floorNumber !== undefined && (
                      <tr>
                        <td className="p-3.5 text-neutral-450 font-bold">{isAr ? 'الدور والارتفاع' : 'Floor level'}</td>
                        <td className="p-3.5">{property.floorNumber === 0 ? (isAr ? 'أرضي مبسط' : 'Ground') : `${property.floorNumber}`}</td>
                      </tr>
                    )}
                    {property.propertyAge !== undefined && (
                      <tr>
                        <td className="p-3.5 text-neutral-450 font-bold">{isAr ? 'تاريخ التشييد (بناء)' : 'Operational age'}</td>
                        <td className="p-3.5">{property.propertyAge === 0 ? (isAr ? 'حديث الانتهاء' : 'New') : `${property.propertyAge} ${isAr ? 'سنة بنائية' : 'years'}`}</td>
                      </tr>
                    )}
                    {property.developer && (
                      <tr>
                        <td className="p-3.5 text-neutral-450 font-bold">{isAr ? 'المطور الإنشائي الحصري' : 'Registered Developer'}</td>
                        <td className="p-3.5">{t(property.developer)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 14: RELATED PROPERTIES */}
            {relatedProperties.length > 0 && (
              <div className="space-y-6 pt-6" id="property-related">
                <div className="border-r-4 border-amber-500 pr-3.5 text-right">
                  <h3 className="font-sans font-black text-xl text-neutral-900 leading-none">
                    {isAr ? 'عقارات ووحدات سكنية مقترحة مماثلة' : 'Elite Similars & Recommended Residences'}
                  </h3>
                  <span className="text-xs text-neutral-400 mt-1 block font-bold">
                    {isAr ? 'اخترنا لك أفضل الخيارات الحصرية في نفس النطاق الاستثماري والجغرافي.' : 'Selected tailored high-end listings aligned with your taste.'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none">
                  {relatedProperties.map((rProp) => (
                    <div 
                      key={rProp.id}
                      onClick={() => {
                        onNavigate?.(`property-${rProp.id}`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div className="h-44 relative bg-neutral-900 overflow-hidden">
                        {rProp.featuredImageId && mediaItems[rProp.featuredImageId] ? (
                          <img 
                            src={mediaItems[rProp.featuredImageId]} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" 
                            alt=""
                            referrerPolicy="no-referrer"
                          />
                        ) : rProp.featuredImageId ? (
                          <img
                            src={apiClient.getAbsoluteUrl(`/api/media/${rProp.featuredImageId}/file`)}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                            alt=""
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center p-3 opacity-80">
                            <ArchitecturalPlanSVG className="w-8 h-8 text-white/25" />
                          </div>
                        )}
                        <span className="absolute top-3 right-3 text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-black/75 text-white">
                          {t(rProp.type)}
                        </span>
                      </div>

                      <div className="p-4 space-y-3.5">
                        <div className="space-y-1">
                          <span className="text-[9.5px] font-bold text-amber-700 block">{t(rProp.location)}</span>
                          <h4 className="font-sans font-bold text-sm text-neutral-900 group-hover:text-amber-705 leading-relaxed truncate">{t(rProp.title)}</h4>
                        </div>
                        
                        <div className="flex justify-between items-center bg-neutral-50 p-2 text-[10px] text-neutral-500 rounded font-sans">
                          <span>{rProp.bedrooms} Bed</span>
                          <span>{rProp.bathrooms} Bath</span>
                          <span>{rProp.areaSqm} sqm</span>
                        </div>

                        <div className="flex justify-between items-center text-xs pt-1 border-t border-neutral-50">
                          <span className="text-[10px] text-neutral-400 font-bold">{isAr ? 'التثمين' : 'Price'}</span>
                          <span className="font-black text-slate-905">{rProp.price.toLocaleString()} {isAr ? 'ريال' : 'SAR'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
