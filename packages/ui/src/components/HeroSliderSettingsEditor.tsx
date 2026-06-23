import React, { useState } from 'react';
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Upload, Play, Image as ImageIcon, 
  ChevronDown, ChevronUp, Sliders, Check, Eye, EyeOff, Sparkles, AlertTriangle
} from 'lucide-react';
import { VisualWidget } from '../types';

interface HeroSliderSettingsEditorProps {
  currentWidget: VisualWidget;
  handleUpdateElementSetting: (key: string, val: any, isWidget: boolean) => void;
  language: 'ar' | 'en';
}

export const HeroSliderSettingsEditor: React.FC<HeroSliderSettingsEditorProps> = ({
  currentWidget,
  handleUpdateElementSetting,
  language
}) => {
  const settings = currentWidget.settings || {};
  const slides = settings.slides || [];
  
  // State to track which slide indices are expanded for editing
  const [expandedSlideIdx, setExpandedSlideIdx] = useState<number | null>(0);
  const [localErrors, setLocalErrors] = useState<string>('');

  const t = (ar: string, en: string) => (language === 'ar' ? ar : en);

  // Safely update specific setting and dispatch
  const updateSetting = (key: string, value: any) => {
    handleUpdateElementSetting(key, value, true);
  };

  // Add a new luxury blank slide
  const handleAddSlide = () => {
    const newSlide = {
      id: `slide_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      bgType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      base64Data: '',
      videoBase64: '',
      overlayColor: '#000000',
      overlayOpacity: 50,
      gradientOverlay: true,
      titleAr: 'قصر نجد الملكي وواحة السحاب',
      titleEn: 'Najd Sovereign Royal Estate & Cloud Oasis',
      subtitleAr: 'أعجوبة معمارية خالدة في أرقى المربعات السكنية الخاصة',
      subtitleEn: 'A timeless architectural marvel in the ultra-exclusive diplomatic squares',
      align: 'center', // 'center' | 'left' | 'right'
      valign: 'center', // 'center' | 'top' | 'bottom'
      primaryBtnTextAr: 'طلب مرافقة خاصة لشراء القصر ⟵',
      primaryBtnTextEn: 'Request Private Guided Palace Butler Tour ⟵',
      primaryBtnLink: '/contact',
      secondaryBtnTextAr: 'تحميل كتيب المواد والتشطيبات الفاخرة',
      secondaryBtnTextEn: 'Download Italian Materials Catalogue',
      secondaryBtnLink: '#'
    };
    const updatedSlides = [...slides, newSlide];
    updateSetting('slides', updatedSlides);
    setExpandedSlideIdx(updatedSlides.length - 1);
  };

  // Delete slide
  const handleDeleteSlide = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (slides.length <= 1) {
      setLocalErrors(t('يجب الإبقاء على شريحة واحدة على الأقل في المعرض.', 'At least one slide is required in our pristine show bank.'));
      setTimeout(() => setLocalErrors(''), 3500);
      return;
    }
    const updated = slides.filter((_: any, i: number) => i !== idx);
    updateSetting('slides', updated);
    
    if (expandedSlideIdx === idx) {
      setExpandedSlideIdx(null);
    } else if (expandedSlideIdx !== null && expandedSlideIdx > idx) {
      setExpandedSlideIdx(expandedSlideIdx - 1);
    }
  };

  // Move slide
  const handleMoveSlide = (idx: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    
    const updated = [...slides];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    
    updateSetting('slides', updated);
    if (expandedSlideIdx === idx) {
      setExpandedSlideIdx(targetIdx);
    } else if (expandedSlideIdx === targetIdx) {
      setExpandedSlideIdx(idx);
    }
  };

  // Update specific field inside a specific slide
  const handleUpdateSlideField = (idx: number, field: string, value: any) => {
    const updated = slides.map((s: any, i: number) => {
      if (i === idx) {
        return { ...s, [field]: value };
      }
      return s;
    });
    updateSetting('slides', updated);
  };

  // Handle direct background image / video file upload and conversion to base64
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, idx: number, type: 'image' | 'video') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // Read file as Base64/data URL format
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      if (type === 'image') {
        handleUpdateSlideField(idx, 'base64Data', baseStrClean(base64Str));
        handleUpdateSlideField(idx, 'imageUrl', ''); // Clear placeholder image
      } else {
        handleUpdateSlideField(idx, 'videoBase64', base64Str);
      }
    };
    reader.readAsDataURL(file);
  };

  // Safe cleaner
  const baseStrClean = (str: string) => {
    return str; // keep standard base64 formatted url
  };

  return (
    <div className="space-y-4 font-sans text-right text-xs">
      {/* General Settings Accordion */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-3">
        <h4 className="text-[11px] font-black text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{t('إعدادات معرض الهيرو العام عريض المساحة', 'Global Slider Height & Controls')}</span>
        </h4>

        {/* Height Mode Selector */}
        <div className="space-y-1">
          <label className="text-[9.5px] text-slate-400 font-bold block">
            {t('ارتفاع المعرض الكلي بالمستعرض', 'Slider Absolute Height Option')}
          </label>
          <select
            value={settings.heightMode || 'fullscreen'}
            onChange={(e) => updateSetting('heightMode', e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs"
          >
            <option value="fullscreen">{t('كامل الشاشة (100vh)', 'Full Screen (100vh)')}</option>
            <option value="vh">{t('ارتفاع بنظام vh', 'VH Height Control')}</option>
            <option value="large">{t('طويل ملكي (800px)', 'Royal Large (800px)')}</option>
            <option value="medium">{t('متوسط قياسي (600px)', 'Normal Medium (600px)')}</option>
            <option value="custom">{t('ارتفاع مخصص بالأرقام', 'Custom Fixed Dimension')}</option>
          </select>
        </div>

        {settings.heightMode === 'vh' && (
          <div className="space-y-1 animate-fadeIn">
            <label className="text-[9.5px] text-slate-400 font-bold block">
              {t('أدخل قيمة الارتفاع بالنسبة المئوية من الشاشة', 'Enter height as viewport percentage')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={30}
                max={100}
                step={1}
                value={settings.sliderHeightVh || 100}
                onChange={(e) => updateSetting('sliderHeightVh', parseInt(e.target.value, 10))}
                className="flex-1 accent-[#D4AF37]"
              />
              <div className="w-20 bg-slate-950 border border-slate-850 text-slate-200 px-2 py-1.5 rounded-lg text-center font-mono text-xs">
                {settings.sliderHeightVh || 100}vh
              </div>
            </div>
          </div>
        )}

        {/* Custom Height String Input */}
        {settings.heightMode === 'custom' && (
          <div className="space-y-1 animate-fadeIn">
            <label className="text-[9.5px] text-slate-400 font-bold block">
              {t('اكتب قيمة الارتفاع (مثال: 550px или 75vh)', 'Custom Height value (e.g. 700px / 75vh)')}
            </label>
            <input
              type="text"
              value={settings.customHeight || '700px'}
              onChange={(e) => updateSetting('customHeight', e.target.value)}
              placeholder="e.g. 700px"
              className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] font-mono text-center text-xs"
            />
          </div>
        )}

        {/* Transition Selector */}
        <div className="space-y-1">
          <label className="text-[9.5px] text-slate-400 font-bold block">
            {t('مؤثر انتقال الشرائح التفاعلي', 'Slide Transition Effect')}
          </label>
          <select
            value={settings.transitionType || 'fade'}
            onChange={(e) => updateSetting('transitionType', e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none"
          >
            <option value="fade">{t('تلاشي متقاطع (Fade)', 'Cross-Fade (Fade)')}</option>
            <option value="slide">{t('انزلاق أفقي (Slide)', 'Horizontal Slide')}</option>
            <option value="zoom">{t('تكبير عميق (Zoom-in)', 'Deep Cinematic Zoom')}</option>
          </select>
        </div>

        {/* Navigation Dots / Arrows Toggle */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="space-y-1">
            <label className="text-[9.5px] text-slate-450 font-bold block">{t('عرض أسهم التنقل الكلاسيكية', 'Display Navigation Arrows')}</label>
            <select
              value={settings.showPrevNext === false ? 'false' : 'true'}
              onChange={(e) => updateSetting('showPrevNext', e.target.value === 'true')}
              className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2 py-1 rounded text-[10px]"
            >
              <option value="true">{t('نعم، إظهار الأسهم', 'Enabled')}</option>
              <option value="false">{t('لا، إخفاء الأسهم', 'Hidden')}</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9.5px] text-slate-450 font-bold block">{t('نقاط ترقيم الصفحات سفل الشاشة', 'Display Pagination Dots')}</label>
            <select
              value={settings.showDots === false ? 'false' : 'true'}
              onChange={(e) => updateSetting('showDots', e.target.value === 'true')}
              className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2 py-1 rounded text-[10px]"
            >
              <option value="true">{t('نعم، إظهار النقاط', 'Enabled')}</option>
              <option value="false">{t('لا، إخفاء النقاط', 'Hidden')}</option>
            </select>
          </div>
        </div>

        {/* Navigation buttons/dots styling options */}
        <div className="space-y-1">
          <label className="text-[9.5px] text-slate-400 font-bold block">
            {t('هيكل وشخصية مفاتيح التحكم والأسهم', 'Navigation Element Frame Style')}
          </label>
          <select
            value={settings.navStyle || 'circle'}
            onChange={(e) => updateSetting('navStyle', e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none"
          >
            <option value="circle">{t('دائري فخم (Circle)', 'Polished Circle Layout')}</option>
            <option value="rounded">{t('حواف مستديرة ناعمة (Rounded)', 'Soft Rounded Box')}</option>
            <option value="square">{t('مربع مضلع حاد (Square)', 'Sharp Clean Square')}</option>
          </select>
        </div>

        {/* Autoplay & Loops */}
        <div className="border-t border-slate-800/80 pt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div className="space-y-1">
            <label className="text-slate-450 block">{t('التمرير التلقائي للشرائح', 'Autoplay Enabled')}</label>
            <select
              value={settings.autoplay === false ? 'false' : 'true'}
              onChange={(e) => updateSetting('autoplay', e.target.value === 'true')}
              className="w-full bg-slate-950 border border-slate-850 text-slate-205 p-1 rounded"
            >
              <option value="true">{t('مشغل (Autoplay)', 'Enabled')}</option>
              <option value="false">{t('معطل (Manual)', 'Disabled')}</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-slate-450 block">{t('سرعة الانتقال التلقائي', 'Speed (Milliseconds)')}</label>
            <input
              type="number"
              step={1000}
              min={2000}
              value={settings.autoplaySpeed || 6000}
              onChange={(e) => updateSetting('autoplaySpeed', parseInt(e.target.value, 10))}
              disabled={settings.autoplay === false}
              className="w-full bg-slate-950 border border-slate-850 text-slate-100 p-1 rounded text-center font-mono disabled:opacity-40"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="space-y-1">
            <label className="text-slate-455 block">{t('إيقاف مؤقت عند الوقوف بالفأرة', 'Pause On Hover Loop')}</label>
            <select
              value={settings.pauseOnHover === false ? 'false' : 'true'}
              onChange={(e) => updateSetting('pauseOnHover', e.target.value === 'true')}
              className="w-full bg-slate-950 border border-slate-850 text-slate-205 p-1 rounded"
            >
              <option value="true">{t('نعم، قف عمودياً', 'Pause')}</option>
              <option value="false">{t('استمر دائماً', 'Ignore Hover')}</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-slate-455 block">{t('تكرار حلقي لا نهائي', 'Infinite Loop Scroll')}</label>
            <select
              value={settings.infiniteLoop === false ? 'false' : 'true'}
              onChange={(e) => updateSetting('infiniteLoop', e.target.value === 'true')}
              className="w-full bg-slate-950 border border-slate-850 text-slate-205 p-1 rounded"
            >
              <option value="true">{t('نعم، تكرار مستمر', 'Loop Infinitely')}</option>
              <option value="false">{t('توقف عند النهاية', 'Stop on End')}</option>
            </select>
          </div>
        </div>

        {/* Integrated Quick Search Box Below Slider Toggle */}
        <div className="border-t border-slate-800/80 pt-2.5 space-y-1.5 bg-indigo-950/20 p-2 rounded-lg border border-indigo-900/30">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-indigo-300 font-extrabold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
              <span>{t('محرك البحث ومصفاة الفلترة المدمجة', 'Integrated Search Quick Filter Box')}</span>
            </label>
            <span className="px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-300 text-[8px] font-bold uppercase">Connected</span>
          </div>
          <p className="text-slate-400 text-[9px] leading-relaxed mb-1.5">
            {t('ظهور لوحة فلترة منسقة مدمجة كلياً أسفل الشريحة متصلة مباشرة بعقارات السيادية المسجلة تلقائياً.', 'An elegant floating filters card allowing users to query, filter by bedrooms/types/price, and instantly link findings.')}
          </p>
          <select
            value={settings.showSearchBox === false ? 'false' : 'true'}
            onChange={(e) => updateSetting('showSearchBox', e.target.value === 'true')}
            className="w-full bg-slate-950 border border-indigo-900/50 text-slate-200 px-2.5 py-1.5 rounded-lg font-bold text-xs"
          >
            <option value="true">👑 {t('تشغيل محرك البحث العقاري (ON)', 'Turn Search Filter ON')}</option>
            <option value="false">⚪ {t('إخفاء لوحة البحث كلياً (OFF)', 'Hide Search Filter Box OFF')}</option>
          </select>
        </div>
      </div>

      {/* Slide Customizers List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="font-extrabold text-[#D4AF37] text-[11px] block">
            🌌 {t(`مصفوفة الشرائح الفاخرة (${slides.length})`, `Pristine Slides Ensemble (${slides.length})`)}
          </span>
          <button
            type="button"
            onClick={handleAddSlide}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('شريحة جديدة +', 'Add Slide +')}</span>
          </button>
        </div>

        {localErrors && (
          <div className="p-2 border border-rose-900 bg-rose-950/30 text-rose-300 rounded text-[10.5px] font-bold text-center flex items-center justify-center gap-1 animate-pulse">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{localErrors}</span>
          </div>
        )}

        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-0.5">
          {slides.map((slide: any, sIdx: number) => {
            const isExpanded = expandedSlideIdx === sIdx;
            const slideTitleStr = language === 'ar' 
              ? (slide.titleAr || slide.title?.ar || '') 
              : (slide.titleEn || slide.title?.en || '');
              
            return (
              <div 
                key={slide.id || sIdx} 
                className={`rounded-lg border transition-all ${
                  isExpanded ? 'border-[#D4AF37] bg-slate-900/40' : 'border-slate-800 hover:border-slate-700 bg-slate-900/10'
                }`}
              >
                {/* Header of Item slide */}
                <div 
                  onClick={() => setExpandedSlideIdx(isExpanded ? null : sIdx)}
                  className="px-3 py-2 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">#{sIdx + 1}</span>
                    <span className="text-[11px] font-bold text-slate-200 truncate max-w-[130px]">
                      {slideTitleStr || t('شريحة غير معنونة', 'Untitled Majestic Slide')}
                    </span>
                  </div>

                  {/* Actions right / left */}
                  <div className="flex items-center gap-1.5">
                    {/* Move up */}
                    <button
                      type="button"
                      disabled={sIdx === 0}
                      onClick={(e) => handleMoveSlide(sIdx, 'up', e)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20 shrink-0"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    {/* Move down */}
                    <button
                      type="button"
                      disabled={sIdx === slides.length - 1}
                      onClick={(e) => handleMoveSlide(sIdx, 'down', e)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20 shrink-0"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSlide(sIdx, e)}
                      className="p-1 rounded hover:bg-rose-900/50 text-rose-400 hover:text-white shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </div>

                {/* Body of Slide Config */}
                {isExpanded && (
                  <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-3.5 text-right font-sans">
                    {/* Background Type Toggle */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-bold block">{t('نوع وسيط الخلفية الأساسي', 'Background Type')}</label>
                      <div className="grid grid-cols-2 gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleUpdateSlideField(sIdx, 'bgType', 'image')}
                          className={`py-1 rounded text-center font-bold text-[10px] cursor-pointer ${
                            slide.bgType !== 'video' ? 'bg-[#D4AF37] text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="flex items-center justify-center gap-1"><ImageIcon className="w-3 h-3" /> {t('صورة معروضة', 'HD Image')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateSlideField(sIdx, 'bgType', 'video')}
                          className={`py-1 rounded text-center font-bold text-[10px] cursor-pointer ${
                            slide.bgType === 'video' ? 'bg-[#D4AF37] text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="flex items-center justify-center gap-1"><Play className="w-3 h-3" /> {t('فيديو خلفي', 'MP4 Video')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Media File Upload Selector */}
                    <div className="space-y-1.5 p-2 bg-slate-950 rounded-lg border border-slate-850">
                      <label className="text-[9.5px] text-[#D4AF37] font-bold block mb-1">
                        {slide.bgType === 'video' ? t('تحميل فيديو الخلفية المباشر', 'Upload Slide MP4 Video Background') : t('تحميل صورة الخلفية المباشرة', 'Upload Slide Image Background')}
                      </label>
                      <div className="flex flex-col items-center gap-2">
                        {slide.bgType === 'video' ? (
                          slide.videoBase64 ? (
                            <div className="w-full text-center text-[10px] text-emerald-400 font-bold py-2 bg-emerald-950/20 border border-emerald-900/40 rounded">
                              ✓ {t('تم إرفاق فيديو مخصص بنجاح', 'Direct Custom Video Background Uploaded!')}
                            </div>
                          ) : (
                            <div className="w-full text-center text-[10px] text-slate-500 py-2 border border-dashed border-slate-800 rounded bg-slate-900/10">
                              {t('لا توجد مادة فيديو مرفقة', 'No video uploaded yet')}
                            </div>
                          )
                        ) : (
                          slide.base64Data ? (
                            <img src={slide.base64Data} className="w-full h-24 object-cover rounded border border-slate-800" alt="Slide backdrop" referrerPolicy="no-referrer" />
                          ) : slide.imageUrl ? (
                            <img src={slide.imageUrl} className="w-full h-24 object-cover rounded border border-slate-800 opacity-60" alt="Placeholder preview" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full text-center text-[10px] text-slate-500 py-6 border border-dashed border-slate-800 rounded">
                              {t('لا توجد صورة محملة', 'No slide image background')}
                            </div>
                          )
                        )}

                        <label className="w-full text-center py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 cursor-pointer font-bold text-[10px] flex items-center justify-center gap-1 transition-all">
                          <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{slide.bgType === 'video' ? t('اختر ملف فيديو MP4 محلي', 'Select Local MP4 Clip') : t('اختر ملف صورة مخصص', 'Select Local Image File')}</span>
                          <input
                            type="file"
                            accept={slide.bgType === 'video' ? 'video/mp4' : 'image/*'}
                            className="hidden"
                            onChange={(e) => handleMediaUpload(e, sIdx, slide.bgType === 'video' ? 'video' : 'image')}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Media Display Mode Customizer */}
                    {slide.bgType !== 'video' && (
                      <div className="space-y-1">
                        <label className="text-[9.5px] text-slate-400 font-bold block">
                          {t('وضع عرض مادة الخلفية (Display Mode)', 'Media Display Mode')}
                        </label>
                        <select
                          value={slide.displayMode || 'cover'}
                          onChange={(e) => handleUpdateSlideField(sIdx, 'displayMode', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none text-[11px]"
                        >
                          <option value="cover">🖼️ {t('امتداد كامل الغطاء (Cover - Default)', 'Cover (Default)')}</option>
                          <option value="contain">📦 {t('احتواء كامل الصورة داخل الإطار (Contain)', 'Contain')}</option>
                          <option value="fill">↕️ {t('مط وتعبئة ميكانيكية (Fill)', 'Fill')}</option>
                          <option value="center_crop">✂️ {t('قص وتوسيط ذكي (Center Crop)', 'Center Crop')}</option>
                        </select>
                      </div>
                    )}

                    {/* Dim Overlay Customizer */}
                    <div className="bg-slate-900/40 p-2.5 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[9.5px] text-slate-400 font-bold">{t('تفعيل طبقة تعتيم الخلفية (Overlay)', 'Overlay Filter on top')}</label>
                        <select
                          value={slide.overlayColor ? 'true' : 'false'}
                          onChange={(e) => handleUpdateSlideField(sIdx, 'overlayColor', e.target.value === 'true' ? '#000000' : '')}
                          className="bg-slate-950 text-slate-200 border border-slate-800 text-[9px] rounded px-1.5 py-0.5"
                        >
                          <option value="true">{t('تعتيم نشط (ON)', 'ON')}</option>
                          <option value="false">{t('بدون تعتيم (OFF)', 'OFF')}</option>
                        </select>
                      </div>

                      {slide.overlayColor && (
                        <>
                          {/* Color and opacity sliders */}
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="space-y-1">
                              <label className="text-slate-450 block">{t('لون التعتيم الأساسي', 'Overlay Color')}</label>
                              <div className="flex gap-1.5">
                                <input
                                  type="color"
                                  value={slide.overlayColor || '#000000'}
                                  onChange={(e) => handleUpdateSlideField(sIdx, 'overlayColor', e.target.value)}
                                  className="w-8 h-6 p-0 border border-slate-800 bg-transparent rounded cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={slide.overlayColor || '#000000'}
                                  onChange={(e) => handleUpdateSlideField(sIdx, 'overlayColor', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-850 p-1 text-[9px] font-mono text-center text-slate-300"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-slate-450 block">{t(`نسبة الشفافية (${slide.overlayOpacity ?? 50}%)`, 'Opacity')}</label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={slide.overlayOpacity ?? 50}
                                onChange={(e) => handleUpdateSlideField(sIdx, 'overlayOpacity', parseInt(e.target.value, 10))}
                                className="w-full accent-[#D4AF37]"
                              />
                            </div>
                          </div>

                          {/* Gradient toggle */}
                          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/50">
                            <label className="text-slate-450">{t('إدراج تدرج سينمائي عمودي', 'Enable Cinematic Vertical Gradient')}</label>
                            <select
                              value={slide.gradientOverlay === false ? 'false' : 'true'}
                              onChange={(e) => handleUpdateSlideField(sIdx, 'gradientOverlay', e.target.value === 'true')}
                              className="bg-slate-950 text-slate-200 border border-slate-800 text-[9px] rounded p-0.5"
                            >
                              <option value="true">{t('نعم، مائل كفيلتر', 'Graduated Overlay')}</option>
                              <option value="false">{t('لون موحد ثابت', 'Solid Overlay')}</option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Content Texts Arabic / English */}
                    <div className="space-y-2 pt-1 border-t border-slate-800/50">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-450 font-bold block">{t('العنوان الرئيسي (عربي)', 'Arabic Title')}</label>
                          <input
                            type="text"
                            value={slide.titleAr || (slide.title?.ar || '')}
                            onChange={(e) => handleUpdateSlideField(sIdx, 'titleAr', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 p-1.5 text-slate-200 rounded text-xs text-right font-sans"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-450 font-bold block">{t('Title (English)', 'English Title')}</label>
                          <input
                            type="text"
                            value={slide.titleEn || (slide.title?.en || '')}
                            onChange={(e) => handleUpdateSlideField(sIdx, 'titleEn', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 p-1.5 text-slate-205 rounded text-xs text-left"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-455 font-bold block">{t('الوصف الفرعي (عربي)', 'Arabic Subtitle')}</label>
                          <input
                            type="text"
                            value={slide.subtitleAr || (slide.subtitle?.ar || '')}
                            onChange={(e) => handleUpdateSlideField(sIdx, 'subtitleAr', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 p-1.5 text-slate-200 rounded text-xs text-right font-sans"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-455 font-bold block">{t('Subtitle (English)', 'English Subtitle')}</label>
                          <input
                            type="text"
                            value={slide.subtitleEn || (slide.subtitle?.en || '')}
                            onChange={(e) => handleUpdateSlideField(sIdx, 'subtitleEn', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 p-1.5 text-slate-205 rounded text-xs text-left"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dual Action CTA Buttons Customizers */}
                    <div className="bg-slate-900/20 p-2.5 rounded-lg space-y-2 border border-slate-800">
                      <span className="text-[9.5px] font-extrabold text-[#D4AF37] block mb-1">🎯 {t('جولتي الأزرار التفاعلية (CTAs)', 'Primary & Secondary CTA Buttons')}</span>
                      
                      <div className="space-y-2">
                        <div className="p-2 border border-slate-800 bg-slate-950/40 rounded space-y-1.5">
                          <span className="text-[9px] font-bold text-slate-400 block">{t('الزر الأول الأساسي (Primary Button)', 'Primary Action Button')}</span>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder={t('نص عربي', 'Text AR')}
                              value={slide.primaryBtnTextAr || ''}
                              onChange={(e) => handleUpdateSlideField(sIdx, 'primaryBtnTextAr', e.target.value)}
                              className="bg-slate-950 border border-slate-850 p-1 text-[10.5px] text-right text-white rounded"
                            />
                            <input
                              type="text"
                              placeholder={t('نص إنجليزي', 'Text EN')}
                              value={slide.primaryBtnTextEn || ''}
                              onChange={(e) => handleUpdateSlideField(sIdx, 'primaryBtnTextEn', e.target.value)}
                              className="bg-slate-950 border border-slate-850 p-1 text-[10.5px] text-left text-white rounded"
                              dir="ltr"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder={t('رابط توجيه الزر الفريد (Link / URL)', 'Redirect link (e.g. /properties)')}
                            value={slide.primaryBtnLink || ''}
                            onChange={(e) => handleUpdateSlideField(sIdx, 'primaryBtnLink', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 p-1 text-[10px] text-center font-mono rounded"
                            dir="ltr"
                          />
                        </div>

                        <div className="p-2 border border-slate-800 bg-slate-950/40 rounded space-y-1.5">
                          <span className="text-[9px] font-bold text-slate-400 block">{t('الزر الثاني الاحتياطي (Secondary Button)', 'Secondary Action Button')}</span>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder={t('نص عربي', 'Text AR')}
                              value={slide.secondaryBtnTextAr || ''}
                              onChange={(e) => handleUpdateSlideField(sIdx, 'secondaryBtnTextAr', e.target.value)}
                              className="bg-slate-950 border border-slate-850 p-1 text-[10.5px] text-right text-white rounded"
                            />
                            <input
                              type="text"
                              placeholder={t('نص إنجليزي', 'Text EN')}
                              value={slide.secondaryBtnTextEn || ''}
                              onChange={(e) => handleUpdateSlideField(sIdx, 'secondaryBtnTextEn', e.target.value)}
                              className="bg-slate-950 border border-slate-850 p-1 text-[10.5px] text-left text-white rounded"
                              dir="ltr"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder={t('رابط توجيه الزر السلبي (Link / URL)', 'Redirect link (e.g. #)')}
                            value={slide.secondaryBtnLink || ''}
                            onChange={(e) => handleUpdateSlideField(sIdx, 'secondaryBtnLink', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 p-1 text-[10px] text-center font-mono rounded"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Content Alignment & Vertical Positioning */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-450 font-bold block">{t('المحاذاة الأفقية للمحتوى', 'Horizontal Content Align')}</label>
                        <select
                          value={slide.align || 'center'}
                          onChange={(e) => handleUpdateSlideField(sIdx, 'align', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 p-1 rounded text-[10px]"
                        >
                          <option value="right">{t('يمين كالمعتاد (RTL Right)', 'Right')}</option>
                          <option value="center">{t('توسيط فخم (Center)', 'Center')}</option>
                          <option value="left">{t('يسار كلاسيك (Left)', 'Left')}</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-450 font-bold block">{t('المحاذاة العمودية للمحتوى', 'Vertical Content Position')}</label>
                        <select
                          value={slide.valign || 'center'}
                          onChange={(e) => handleUpdateSlideField(sIdx, 'valign', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 p-1 rounded text-[10px]"
                        >
                          <option value="top">{t('سقف الشاشة (Top)', 'Top')}</option>
                          <option value="center">{t('منتصف مريح (Center)', 'Center')}</option>
                          <option value="bottom">{t('قاع الشاشة (Bottom)', 'Bottom')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
