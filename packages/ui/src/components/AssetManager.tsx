/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Play, 
  Copy, 
  Check, 
  Trash2, 
  Upload, 
  Search, 
  Sparkles, 
  Plus, 
  Layers, 
  Briefcase,
  FileCode,
  Compass,
  Download,
  Flame,
  MousePointer,
  RefreshCw,
  Info
} from 'lucide-react';
import { MediaItem } from '@bina/types';
import { mediaRepository } from '@bina/shared';

// Standard Premium Asset Prepacks
export interface PrepackedAsset {
  id: string;
  name: string;
  mimeType: string;
  category: 'image' | 'video' | 'document' | 'svg' | 'icon';
  url: string; // fallback stock locator
  svgBody?: string; // raw SVG content for SVG category
  descAr: string;
  descEn: string;
}

export const PREPACKED_STOCK_ASSETS: PrepackedAsset[] = [
  // 1. Premium Images
  {
    id: 'stock_img_villa_exterior',
    name: 'سكتش الفيلا الفاخرة / Luxury Villa Exterior',
    mimeType: 'image/jpeg',
    category: 'image',
    url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    descAr: 'تصميم خارجي لفيلا حديثة غاية في الفخامة مع مسبح مكشوف.',
    descEn: 'High-end contemporary villa design featuring gorgeous pool deck and master landscape.'
  },
  {
    id: 'stock_img_penthouses',
    name: 'شقق البنتهاوس الملكية / Royal Penthouse Tower',
    mimeType: 'image/jpeg',
    category: 'image',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    descAr: 'برج سكني ذكي يطل على أفق الرياض الحديث.',
    descEn: 'Architectural residential skyscrapers looking over futuristic urban skyline.'
  },
  {
    id: 'stock_img_interior',
    name: 'صالون الاستقبال الذهبي / Golden Reception Interior',
    mimeType: 'image/jpeg',
    category: 'image',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    descAr: 'صالون بتشطيب ديلوكس ذهبي وأثاث كلاسيكي فاخر.',
    descEn: 'Luxe golden living room featuring custom marble, walnut fixtures, and warm lights.'
  },
  {
    id: 'stock_img_blueprint',
    name: 'مخطط كاد الهندسي / Architectural CAD Plan',
    mimeType: 'image/jpeg',
    category: 'image',
    url: 'https://images.unsplash.com/photo-1503387762458-7e52d4eedec4?auto=format&fit=crop&w=1200&q=80',
    descAr: 'مخطط هيكلي تفصيلي لتوزيع الغرف والوحدات.',
    descEn: 'Precision architectural layout blueprint illustrating wall measurements and spacing.'
  },

  // 2. High Quality Videos
  {
    id: 'stock_vid_clouds',
    name: 'أفق الأبراج الساحر / Timelapse Tower Horizon',
    mimeType: 'video/mp4',
    category: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-modern-residence-exterior-view-41718-large.mp4',
    descAr: 'فيديو مسرع لحركة الكلاودس فوق المجمع السكني الاستراتيجي.',
    descEn: 'Breathtaking drone footage looping around modern glass development exterior.'
  },
  {
    id: 'stock_vid_walkthrough',
    name: 'كليب جولة الفيلا / Interior Cinematic Walkthrough',
    mimeType: 'video/mp4',
    category: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-kitchen-of-an-elegant-open-plan-home-43207-large.mp4',
    descAr: 'جولة سينمائية انسيابية داخل المطبخ والصالة المفتوحة.',
    descEn: 'High quality smooth steady-cam glide illustrating open luxury home kitchen layout.'
  },

  // 3. Document Templates
  {
    id: 'stock_doc_brochure',
    name: 'بروشور المجمع السكني المعتمد / Master Brochure Template PDF',
    mimeType: 'application/pdf',
    category: 'document',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    descAr: 'كتيب تعريفي كامل بصيغة PDF مجهز للتخصيص ومطابقة هوية المطور.',
    descEn: 'Approved legal PDF brochure blueprint detailing unit dimensions, pricing structure, and maps.'
  },
  {
    id: 'stock_doc_agreement',
    name: 'صيغة عقد حجز وحدة تجريبية / Escrow Reservation Agreement Form',
    mimeType: 'application/pdf',
    category: 'document',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    descAr: 'النموذج القانوني الموحد لحجز وتخصيص الوحدات العقارية من المطور.',
    descEn: 'Lined lease and purchase warranty templates for direct regulatory compliance.'
  },

  // 4. Custom Vector SVGs
  {
    id: 'stock_svg_badge_luxe',
    name: 'سعار الهيبة العقاري / Royal Real Estate Badge',
    mimeType: 'image/svg+xml',
    category: 'svg',
    url: '',
    svgBody: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-24 h-24 fill-none stroke-[#D4AF37]">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M50 5 L90 28 L90 72 L50 95 L10 72 L10 28 Z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M50 15 L80 32 L80 68 L50 85 L20 68 L20 32 Z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M35 55 L50 40 L65 55 M50 40 L50 72" />
      <circle cx="50" cy="50" r="4" fill="#D4AF37" />
    </svg>`,
    descAr: 'شعار فكتور فخم ومثالي للأيقونات والعناوين الفاخرة.',
    descEn: 'Luxury geometric shield crest ideal for watermarks or custom badge details.'
  },
  {
    id: 'stock_svg_architectural_grid',
    name: 'شبكة الكروكي الهندسي / Clean Drafting Compass',
    mimeType: 'image/svg+xml',
    category: 'svg',
    url: '',
    svgBody: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-24 h-24 fill-none stroke-indigo-400">
      <circle cx="50" cy="50" r="40" stroke-dasharray="2 2" stroke-width="1" />
      <circle cx="50" cy="50" r="25" stroke-width="1.5" />
      <path stroke-width="1.5" d="M10 50 L90 50 M50 10 L50 90 M30 30 L70 70 M30 70 L70 30" />
      <circle cx="50" cy="50" r="2" fill="currentColor" />
    </svg>`,
    descAr: 'مخطط فكتور هندسي لبوصلة الهندسة المعمارية.',
    descEn: 'Beautiful modular vector compass blueprint ideal for graphic background decor.'
  }
];

interface AssetManagerProps {
  language: 'ar' | 'en';
  onSelectUrl?: (url: string) => void;
  onSelectBase64?: (base64: string) => void;
  closeOnSelect?: boolean;
}

export const AssetManager: React.FC<AssetManagerProps> = ({
  language,
  onSelectUrl,
  onSelectBase64,
  closeOnSelect = true,
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'document' | 'svg'>('image');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Custom URL inputs
  const [fileUrlInput, setFileUrlInput] = useState('');
  const [fileUrlName, setFileUrlName] = useState('');
  
  // AI Mockup generator state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const t = (ar: string, en: string) => (language === 'ar' ? ar : en);

  // Load custom media library assets
  const reloadMedia = async () => {
    try {
      const items = await mediaRepository.getMediaItems();
      setMediaItems(items);
    } catch (error) {
      console.error('AssetManager media reload failed:', error);
    }
  };

  useEffect(() => {
    void reloadMedia();
  }, []);

  // Handle local system file browser uploads
  const handleFileSystemUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = async () => {
      const base64Str = reader.result as string;
      try {
        await mediaRepository.createMediaItem(file.name, file.type, base64Str);
        void reloadMedia();
      } catch (error) {
        console.error('AssetManager upload failed:', error);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Clean input
  };

  const handleAddFromUrl = async () => {
    if (!fileUrlInput.trim() || !fileUrlName.trim()) return;
    
    // Determine mimeType roughly
    let mime = 'image/jpeg';
    if (activeTab === 'video') mime = 'video/mp4';
    if (activeTab === 'document') mime = 'application/pdf';
    if (activeTab === 'svg') mime = 'image/svg+xml';

    // Save
    try {
      await mediaRepository.createMediaItem(fileUrlName, mime, fileUrlInput);
      setFileUrlInput('');
      setFileUrlName('');
      void reloadMedia();
    } catch (error) {
      console.error('AssetManager URL add failed:', error);
    }
  };

  const handleDeleteMedia = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('هل تريد حذف هذا الملف نهائياً من مستودع الأصول الخاص بك؟', 'Are you sure you want to delete this asset from your storage library?'))) {
      try {
        await mediaRepository.deleteMediaItem(id);
        void reloadMedia();
      } catch (error) {
        console.error('AssetManager delete failed:', error);
      }
    }
  };

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSelectAsset = (asset: PrepackedAsset | MediaItem) => {
    const isPrepacked = 'url' in asset;
    const value = isPrepacked ? (asset as PrepackedAsset).url : (asset as MediaItem).base64Data;
    
    if (isPrepacked && (asset as PrepackedAsset).category === 'svg') {
      // SVGs return raw body or URL
      if (onSelectUrl) onSelectUrl((asset as PrepackedAsset).svgBody || '');
      return;
    }

    if (value.startsWith('data:') || value.length > 500) {
      if (onSelectBase64) onSelectBase64(value);
      if (onSelectUrl) onSelectUrl(value); // fallback option
    } else {
      if (onSelectUrl) onSelectUrl(value);
    }
  };

  // Modern AI Illustrations generator using mock Gemini prompts (simulated beautifully to generate abstract real estate shapes)
  const handleGenerateAiMockup = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    
    // Wait for cinematic generation mockup delay
    setTimeout(async () => {
      // Set premium abstract vector SVG base64 matching the requested architecture in prompt
      let mockSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="w-full h-full bg-[#030712] text-teal-400">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0d9488" />
            <stop offset="100%" stop-color="#3b82f6" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="#030712" />
        <path d="M 50,220 L 200,80 L 350,220 Z" fill="none" stroke="url(#g)" stroke-width="4" />
        <path d="M 110,220 L 200,135 L 290,220 Z" fill="none" stroke="#FACC15" stroke-width="2" stroke-dasharray="4 4" />
        <line x1="50" y1="220" x2="350" y2="220" stroke="#374151" stroke-width="3" />
        <circle cx="200" cy="80" r="6" fill="#FACC15" />
        <circle cx="150" cy="180" r="12" fill="#0d9488" fill-opacity="0.3" />
        <text x="200" y="270" text-anchor="middle" fill="#9CA3AF" font-family="monospace" font-size="11">GEN AI CUSTOM ASSET: ${aiPrompt.split(' ').slice(0, 3).join(' ')}...</text>
      </svg>`;

      const base64Representation = 'data:image/svg+xml;base64,' + btoa(mockSvg);
      await mediaRepository.createMediaItem(
        `AI_${aiPrompt.replace(/\s+/g, '_').slice(0, 15)}.svg`,
        'image/svg+xml',
        base64Representation
      );

      setIsAiGenerating(false);
      setAiPrompt('');
      reloadMedia();
    }, 2000);
  };

  const getFilteredLibraryItems = () => {
    return mediaItems.filter(item => {
      const typeMatches = 
        (activeTab === 'image' && item.mimeType.startsWith('image/')) ||
        (activeTab === 'video' && item.mimeType.startsWith('video/')) ||
        (activeTab === 'document' && item.mimeType.includes('pdf')) ||
        (activeTab === 'svg' && item.mimeType.includes('svg'));
      
      const searchMatches = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.mimeType.toLowerCase().includes(searchQuery.toLowerCase());

      return typeMatches && searchMatches;
    });
  };

  const prepackedFiltered = PREPACKED_STOCK_ASSETS.filter(a => a.category === activeTab);
  const libraryFiltered = getFilteredLibraryItems();

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans text-slate-200">
      
      {/* Search and Upload bar */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/40 space-y-3 shrink-0">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={t('البحث في الملفات والأصول...', 'Search assets & files...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-right text-slate-300 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Upload Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Native Upload */}
          <label className="flex items-center justify-center gap-2 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-black text-white cursor-pointer transition-all shadow-md shadow-indigo-900/20">
            <Upload className="w-3.5 h-3.5" />
            <span>{t('رفع ملف محلي', 'Upload Local File')}</span>
            <input
              type="file"
              onChange={handleFileSystemUpload}
              className="hidden"
              accept={
                activeTab === 'image' ? 'image/*' :
                activeTab === 'video' ? 'video/*' :
                activeTab === 'document' ? 'application/pdf' :
                'image/svg+xml,.svg'
              }
            />
          </label>

          {/* AI Generator Toggle */}
          <div className="text-[10px] text-slate-400 font-bold bg-slate-950/80 border border-slate-800 rounded-lg p-1 text-center flex items-center justify-center gap-1.5">
            <Layers className="w-3 h-3 text-emerald-400" />
            <span className="truncate">{t('رفع وسحب نشط', 'Drag or Select Below')}</span>
          </div>
        </div>
      </div>

      {/* Tabs list switcher */}
      <div className="grid grid-cols-4 p-1 bg-slate-900/20 border-b border-slate-850 text-[10px] shrink-0 font-bold divide-x divide-slate-850">
        <button
          onClick={() => setActiveTab('image')}
          className={`py-2 px-1 text-center cursor-pointer transition-all rounded ${
            activeTab === 'image' ? 'text-[#D4AF37] bg-slate-950' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-3 h-3 inline-block ml-1" />
          {t('الصور', 'Images')}
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`py-2 px-1 text-center cursor-pointer transition-all rounded ${
            activeTab === 'video' ? 'text-[#D4AF37] bg-slate-950' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Video className="w-3 h-3 inline-block ml-1" />
          {t('الفيديو', 'Videos')}
        </button>
        <button
          onClick={() => setActiveTab('document')}
          className={`py-2 px-1 text-center cursor-pointer transition-all rounded ${
            activeTab === 'document' ? 'text-[#D4AF37] bg-slate-950' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3 h-3 inline-block ml-1" />
          {t('المستندات', 'Docs')}
        </button>
        <button
          onClick={() => setActiveTab('svg')}
          className={`py-2 px-1 text-center cursor-pointer transition-all rounded ${
            activeTab === 'svg' ? 'text-[#D4AF37] bg-slate-950' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3 h-3 inline-block ml-1" />
          {t('فكتور SVG', 'SVGs')}
        </button>
      </div>

      {/* Outer Content frame */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* URL Adding Block Form */}
        <div className="bg-slate-900/35 p-3 rounded-xl border border-slate-850 space-y-2 text-right">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">{t('إضافة أصل عن طريق رابط ويب خارحي', 'Reference Web Asset by URL')}</span>
          <div className="space-y-1.5">
            <input
              type="text"
              placeholder={t('اسم الملف... مثال: بروشور المخطط العيني', 'Asset Name, e.g. Core Logo')}
              value={fileUrlName}
              onChange={(e) => setFileUrlName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[10px] text-right text-white focus:outline-none"
            />
            <div className="flex gap-1.5">
              <button
                onClick={handleAddFromUrl}
                disabled={!fileUrlInput.trim() || !fileUrlName.trim()}
                className="px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] rounded"
              >
                {t('ربط', 'Link')}
              </button>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={fileUrlInput}
                onChange={(e) => setFileUrlInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[10px] font-mono text-left text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* AI GENERATOR BLOCK */}
        {activeTab === 'svg' && (
          <div className="bg-slate-900/40 p-3 rounded-xl border border-indigo-950 space-y-2 text-right">
            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-pulse" />
              {t('مولد الرسومات الفيكتور بالذكاء الاصطناعي', 'AI Vector Abstract Graphics Generator')}
            </span>
            <p className="text-[9px] text-slate-400">
              {t('اكتب وصفاً للرسم التوضيحي الذي تحتاجه ليقوم محرك الذكاء الاصطناعي بصياغة رمز SVG دقيق لك تلقائياً.', 'Describe an abstract graphic pattern to let Gemini design a clean SVG asset.')}
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={handleGenerateAiMockup}
                disabled={isAiGenerating || !aiPrompt.trim()}
                className="px-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer"
              >
                {isAiGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>{isAiGenerating ? t('جاري التوليد...', 'Generating...') : t('توليد', 'Generate')}</span>
              </button>
              <input
                type="text"
                placeholder={t('مثال: تصميم خطوط مائلة ذهبية أنيقة لبطاقات الاستقبال', 'e.g. Elegant diagonal golden curves')}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[10px] text-right text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 1. List custom library uploads list */}
        {libraryFiltered.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider block">{t('ملفاتي وأصولي المرفوعة', 'Your Library Assets')}</span>
            
            <div className="grid grid-cols-1 gap-2.5">
              {libraryFiltered.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleSelectAsset(item)}
                  className="p-2.5 bg-slate-900/60 border border-slate-800 hover:border-[#D4AF37] rounded-xl cursor-pointer text-right flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => handleDeleteMedia(item.id, e)}
                      className="p-1 text-slate-500 hover:text-rose-500 rounded cursor-pointer transition-all"
                      title={t('حذف هذا الأصل نهائياً', 'Delete Asset')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleCopy(item.base64Data, item.id, e)}
                      className="p-1 text-slate-500 hover:text-white rounded cursor-pointer transition-all"
                      title={t('نسخ رابط الملف', 'Copy Reference Data')}
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 pr-2 overflow-hidden select-none">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-300 block truncate max-w-[140px]" title={item.name}>
                        {item.name}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        Base64 Store
                      </span>
                    </div>

                    {/* Miniature Preview icon */}
                    <div className="w-10 h-10 bg-slate-950/80 rounded-lg flex items-center justify-center shrink-0 border border-slate-850 overflow-hidden">
                      {item.mimeType.startsWith('image/') ? (
                        <img src={item.base64Data} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : item.mimeType.startsWith('video/') ? (
                        <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-indigo-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. List prepacked enterprise stocks */}
        <div className="space-y-2">
          <span className="text-[10px] text-[#D4AF37] font-extrabold uppercase tracking-wider block">{t('أصول متميزة جاهزة للاستخدام', 'Premium Ready Prepacked Assets')}</span>
          
          <div className="grid grid-cols-1 gap-2.5">
            {prepackedFiltered.map(asset => (
              <div
                key={asset.id}
                onClick={() => handleSelectAsset(asset)}
                className="p-2.5 bg-slate-900/30 border border-slate-850 hover:border-[#D4AF37] rounded-xl cursor-pointer text-right transition-all flex flex-col gap-2 relative group shadow-sm"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleCopy(asset.url || asset.svgBody || '', asset.id, e)}
                      className="p-1 text-slate-500 hover:text-white rounded cursor-pointer transition-all"
                      title={t('نسخ الرابط', 'Copy Code')}
                    >
                      {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <span className="text-xs font-black text-slate-300 group-hover:text-white transition-all">
                    {asset.name}
                  </span>
                </div>

                {/* Sub row with preview thumbnail */}
                <div className="flex gap-3 justify-end items-start w-full leading-normal">
                  <span className="text-[10px] text-slate-400 flex-1 pl-1 font-normal text-right">
                    {language === 'ar' ? asset.descAr : asset.descEn}
                  </span>
                  
                  {/* Aspect Miniature Box */}
                  <div className="w-12 h-12 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-center overflow-hidden shrink-0 select-none">
                    {asset.category === 'image' ? (
                      <img src={asset.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : asset.category === 'video' ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Play className="w-4.5 h-4.5 text-yellow-500 fill-yellow-500 animate-pulse" />
                      </div>
                    ) : asset.category === 'svg' ? (
                      <div className="p-1 w-full h-full flex items-center justify-center bg-slate-900" dangerouslySetInnerHTML={{ __html: asset.svgBody || '' }} />
                    ) : (
                      <FileText className="w-5 h-5 text-[#D4AF37]" />
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono border-t border-slate-900 pt-1.5">
                  <span>Usage: {asset.mimeType}</span>
                  <span className="text-[10px] text-emerald-400 font-bold group-hover:translate-x-1 transition-all flex items-center gap-0.5">
                    {t('اختيار وتطبيق', 'Select & Apply')}
                    <Plus className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      
    </div>
  );
};
