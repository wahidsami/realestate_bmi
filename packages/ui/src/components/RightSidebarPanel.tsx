import React, { useEffect, useState } from 'react';
import { 
  Settings, Layers, PlusCircle, Palette, Boxes, Image as ImageIcon, RotateCcw, 
  Search, Pin, ChevronDown, Columns, Square, Trash2, Eye, EyeOff, Lock, Unlock, FolderOpen 
} from 'lucide-react';
import { VisualPage, VisualWidget, PageVersion } from '../types';
import { WIDGET_REGISTRY, WidgetCategoryType, getWidgetByCategory } from './WidgetRegistry';
import { VisualEffectsSettingsPanel } from './VisualEffectsSettingsPanel';
import { DesignSystemManager, VisualDesignSystem } from './DesignSystemManager';
import { ReusableComponentsManager, saveReusableComponent } from './ReusableComponentsManager';
import { AssetManager } from './AssetManager';
import { BlockBackgroundSettingsEditor } from './BlockBackgroundSettingsEditor';
import { WidgetBackgroundSettingsEditor } from './WidgetBackgroundSettingsEditor';
import { FeaturedPropertiesGridSettingsEditor } from './FeaturedPropertiesGridSettingsEditor';
import {
  cloneSection,
  cloneSectionsList,
  PAGE_TEMPLATES,
  SECTION_TEMPLATES,
  TEMPLATE_CATEGORIES,
  loadCustomPages,
  loadCustomSections,
  refreshCustomTemplatesFromApi,
} from './LayoutTemplatesRegistry';
import { HeroSliderSettingsEditor } from './HeroSliderSettingsEditor';
import { apiClient } from '@bina/shared';

interface RightSidebarPanelProps {
  language: 'ar' | 'en';
  selectedPage: VisualPage | null;
  selectedElType: 'page' | 'section' | 'row' | 'column' | 'widget' | null;
  setSelectedElType: (type: 'page' | 'section' | 'row' | 'column' | 'widget' | null) => void;
  selectedSectionId: string | null;
  setSelectedSectionId: (id: string | null) => void;
  selectedRowId: string | null;
  setSelectedRowId: (id: string | null) => void;
  selectedColId: string | null;
  setSelectedColId: (id: string | null) => void;
  selectedWidgetId: string | null;
  setSelectedWidgetId: (id: string | null) => void;
  
  sidebarActiveTab: 'properties' | 'structure' | 'widgets' | 'backups' | 'library' | 'design_system' | 'components' | 'assets';
  setSidebarActiveTab: (tab: 'properties' | 'structure' | 'widgets' | 'backups' | 'library' | 'design_system' | 'components' | 'assets') => void;
  
  sidebarWidth: number;
  handleMouseDown: (e: React.MouseEvent) => void;
  
  filterQuery: string;
  setFilterQuery: (q: string) => void;
  hiddenElements: Record<string, boolean>;
  setHiddenElements: (val: Record<string, boolean>) => void;
  lockedElements: Record<string, boolean>;
  setLockedElements: (val: Record<string, boolean>) => void;
  
  versions: PageVersion[];
  handleRestoreVersion: (id: string) => void;
  
  designSystem: VisualDesignSystem;
  setDesignSystem: (val: VisualDesignSystem) => void;
  
  updatePageSettings: (key: string, val: any) => void;
  setSelectedPage: (p: VisualPage | null) => void;
  handleUpdateElementSetting: (key: string, val: any, isWidget: boolean) => void;
  addWidget: (secId: string, rowId: string, colId: string, type: string, settings?: any) => void;
  deleteWidget: (secId: string, rowId: string, colId: string, widId: string) => void;
  addSection: () => void;
  triggerNotice: (msg: string) => void;
  currentWidget: VisualWidget | null;
}

export const RightSidebarPanel: React.FC<RightSidebarPanelProps> = ({
  language,
  selectedPage,
  selectedElType,
  setSelectedElType,
  selectedSectionId,
  setSelectedSectionId,
  selectedRowId,
  setSelectedRowId,
  selectedColId,
  setSelectedColId,
  selectedWidgetId,
  setSelectedWidgetId,
  
  sidebarActiveTab,
  setSidebarActiveTab,
  
  sidebarWidth,
  handleMouseDown,
  
  filterQuery,
  setFilterQuery,
  hiddenElements,
  setHiddenElements,
  lockedElements,
  setLockedElements,
  
  versions,
  handleRestoreVersion,
  
  designSystem,
  setDesignSystem,
  
  updatePageSettings,
  setSelectedPage,
  handleUpdateElementSetting,
  addWidget,
  deleteWidget,
  addSection,
  triggerNotice,
  currentWidget,
}) => {
  const t = (ar: string, en: string) => (language === 'ar' ? ar : en);

  const [settingsSearchQuery, setSettingsSearchQuery] = useState('');
  const [propertiesActiveSubTab, setPropertiesActiveSubTab] = useState<'all' | 'settings' | 'typography' | 'colors' | 'effects'>('all');
  const [widgetActiveCategory, setWidgetActiveCategory] = useState<'ALL' | 'TEXT' | 'BUTTONS' | 'MEDIA' | 'BUSINESS' | 'CONTACT'>('ALL');
  const [libraryActiveSubTab, setLibraryActiveSubTab] = useState<'sections' | 'pages' | 'custom'>('sections');
  const [designSystemActiveSubTab, setDesignSystemActiveSubTab] = useState<'preset' | 'colors' | 'fonts' | 'elements' | 'custom'>('preset');
  const [symbolActiveSubTab, setSymbolActiveSubTab] = useState<'all' | 'section' | 'widget'>('all');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('TEXT');
  const [customSectionTemplates, setCustomSectionTemplates] = useState<ReturnType<typeof loadCustomSections>>([]);
  const [customPageTemplates, setCustomPageTemplates] = useState<ReturnType<typeof loadCustomPages>>([]);

  // Accordion Expand/Collapse States
  const [isPageTreeExpanded, setIsPageTreeExpanded] = useState(true);
  const [isPageTreePinned, setIsPageTreePinned] = useState(false);
  const [isGeneralExpanded, setIsGeneralExpanded] = useState(true);
  const [isTypographyExpanded, setIsTypographyExpanded] = useState(false);
  const [isColorsExpanded, setIsColorsExpanded] = useState(false);
  const [isEffectsExpanded, setIsEffectsExpanded] = useState(false);
  const [isSymbolsExpanded, setIsSymbolsExpanded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateTemplateLibrary = async () => {
      try {
        await refreshCustomTemplatesFromApi();
      } catch (error) {
        console.warn('[Templates] Failed to refresh template library from API', error);
      }

      if (!isMounted) return;

      setCustomSectionTemplates(loadCustomSections());
      setCustomPageTemplates(loadCustomPages());
    };

    void hydrateTemplateLibrary();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSidebarAccordion = (name: 'tree' | 'general' | 'typography' | 'colors' | 'effects' | 'symbols') => {
    if (name === 'tree') {
      setIsPageTreeExpanded(prev => !prev);
    } else if (name === 'general') {
      setIsGeneralExpanded(prev => !prev);
    } else if (name === 'typography') {
      const nextState = !isTypographyExpanded;
      setIsTypographyExpanded(nextState);
      if (nextState) {
        if (!isPageTreePinned) setIsPageTreeExpanded(false);
        setIsColorsExpanded(false);
        setIsEffectsExpanded(false);
        setIsSymbolsExpanded(false);
      }
    } else if (name === 'colors') {
      const nextState = !isColorsExpanded;
      setIsColorsExpanded(nextState);
      if (nextState) {
        if (!isPageTreePinned) setIsPageTreeExpanded(false);
        setIsTypographyExpanded(false);
        setIsEffectsExpanded(false);
        setIsSymbolsExpanded(false);
      }
    } else if (name === 'effects') {
      const nextState = !isEffectsExpanded;
      setIsEffectsExpanded(nextState);
      if (nextState) {
        if (!isPageTreePinned) setIsPageTreeExpanded(false);
        setIsTypographyExpanded(false);
        setIsColorsExpanded(false);
        setIsSymbolsExpanded(false);
      }
    } else if (name === 'symbols') {
      const nextState = !isSymbolsExpanded;
      setIsSymbolsExpanded(nextState);
      if (nextState) {
        if (!isPageTreePinned) setIsPageTreeExpanded(false);
        setIsTypographyExpanded(false);
        setIsColorsExpanded(false);
        setIsEffectsExpanded(false);
      }
    }
  };

  const matchesSearch = (textAr: string, textEn: string) => {
    if (!settingsSearchQuery) return true;
    const q = settingsSearchQuery.toLowerCase();
    return textAr.toLowerCase().includes(q) || textEn.toLowerCase().includes(q);
  };

  const sectionTemplatesByCategory = SECTION_TEMPLATES.reduce<Record<string, typeof SECTION_TEMPLATES>>((acc, template) => {
    if (!acc[template.category]) acc[template.category] = [];
    acc[template.category].push(template);
    return acc;
  }, {});

  const pageTemplatesByCategory = PAGE_TEMPLATES.reduce<Record<string, typeof PAGE_TEMPLATES>>((acc, template) => {
    if (!acc[template.category]) acc[template.category] = [];
    acc[template.category].push(template);
    return acc;
  }, {});

  const sectionLibraryCategories = [
    'hero',
    'about',
    'services',
    'testimonials',
    'features',
    'pricing',
    'faq',
    'contact',
    'footers',
  ];

  const hasBuiltInSectionTemplates = Object.values(sectionTemplatesByCategory).some((items) => items.length > 0);
  const hasBuiltInPageTemplates = Object.values(pageTemplatesByCategory).some((items) => items.length > 0);

  const applyTemplateSections = (sections: any[], noticeKeyAr: string, noticeKeyEn: string) => {
    if (!selectedPage) {
      triggerNotice(t('اختر صفحة أولاً قبل تطبيق القالب', 'Select a page before applying a template'));
      return;
    }

    setSelectedPage({
      ...selectedPage,
      sections: cloneSectionsList(sections),
    });
    triggerNotice(t(noticeKeyAr, noticeKeyEn));
  };

  const appendTemplateSections = (sections: any[], noticeKeyAr: string, noticeKeyEn: string) => {
    if (!selectedPage) {
      triggerNotice(t('اختر صفحة أولاً قبل إدراج القالب', 'Select a page before inserting a template'));
      return;
    }

    setSelectedPage({
      ...selectedPage,
      sections: [...selectedPage.sections, ...cloneSectionsList(sections)],
    });
    triggerNotice(t(noticeKeyAr, noticeKeyEn));
  };

  return (
    <aside 
      id="builder-right-properties" 
      style={{ width: `${sidebarWidth}px`, maxWidth: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
      className="bg-slate-950 border-l border-slate-800 flex flex-col shrink-0 h-full relative"
    >
      {/* Draggable resizing handle strip */}
      <div 
        className="absolute top-0 bottom-0 left-0 w-1.5 cursor-col-resize hover:bg-[#D4AF37]/50 active:bg-[#D4AF37] z-50 transition-colors"
        onMouseDown={handleMouseDown}
      />

      {/* REGION 1 — Primary Tabs (Sticky) */}
      <div className="h-[60px] max-h-[60px] bg-slate-900 border-b border-slate-850 flex items-center justify-around shrink-0 px-1 select-none sticky top-0 z-20">
        <button
          onClick={() => setSidebarActiveTab('properties')}
          className={`flex flex-col items-center justify-center flex-1 h-12 rounded-lg transition-all text-xs cursor-pointer ${
            sidebarActiveTab === 'properties' ? 'text-[#D4AF37] bg-slate-800/50 font-bold border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="text-[9px] mt-0.5">{t('خصائص', 'Inspector')}</span>
        </button>

        <button
          onClick={() => setSidebarActiveTab('structure')}
          className={`flex flex-col items-center justify-center flex-1 h-12 rounded-lg transition-all text-xs cursor-pointer ${
            sidebarActiveTab === 'structure' ? 'text-[#D4AF37] bg-slate-800/50 font-bold border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="text-[9px] mt-0.5">{t('هيكل', 'Layers')}</span>
        </button>

        <button
          onClick={() => setSidebarActiveTab('widgets')}
          className={`flex flex-col items-center justify-center flex-1 h-12 rounded-lg transition-all text-xs cursor-pointer ${
            sidebarActiveTab === 'widgets' ? 'text-[#D4AF37] bg-slate-800/50 font-bold border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="text-[9px] mt-0.5">{t('عناصر', 'Widgets')}</span>
        </button>

        <button
          onClick={() => setSidebarActiveTab('library')}
          className={`flex flex-col items-center justify-center flex-1 h-12 rounded-lg transition-all text-xs cursor-pointer ${
            sidebarActiveTab === 'library' ? 'text-[#D4AF37] bg-slate-800/50 font-bold border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span className="text-[9px] mt-0.5">{t('قوالب', 'Templates')}</span>
        </button>

        <button
          onClick={() => setSidebarActiveTab('design_system')}
          className={`flex flex-col items-center justify-center flex-1 h-12 rounded-lg transition-all text-xs cursor-pointer ${
            sidebarActiveTab === 'design_system' ? 'text-[#D4AF37] bg-slate-800/50 font-bold border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span className="text-[9px] mt-0.5">{t('هوية', 'System')}</span>
        </button>

        <button
          onClick={() => setSidebarActiveTab('components')}
          className={`flex flex-col items-center justify-center flex-1 h-12 rounded-lg transition-all text-xs cursor-pointer ${
            sidebarActiveTab === 'components' ? 'text-[#D4AF37] bg-slate-800/50 font-bold border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span className="text-[9px] mt-0.5">{t('رموز', 'Symbols')}</span>
        </button>

        <button
          onClick={() => setSidebarActiveTab('assets')}
          className={`flex flex-col items-center justify-center flex-1 h-12 rounded-lg transition-all text-xs cursor-pointer ${
            sidebarActiveTab === 'assets' ? 'text-[#D4AF37] bg-slate-800/50 font-bold border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span className="text-[9px] mt-0.5">{t('ملفات', 'Assets')}</span>
        </button>

        <button
          onClick={() => setSidebarActiveTab('backups')}
          className={`flex flex-col items-center justify-center flex-1 h-12 rounded-lg transition-all text-xs cursor-pointer ${
            sidebarActiveTab === 'backups' ? 'text-[#D4AF37] bg-slate-800/50 font-bold border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-[9px] mt-0.5">{t('نسخ', 'History')}</span>
        </button>
      </div>

      {/* REGION 2 — Context Header (Sticky) */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-3 py-2.5 flex flex-col justify-center shrink-0 min-h-[48px] select-none sticky top-[60px] z-15">
        <div className="flex items-center justify-between text-xs font-black uppercase text-slate-300">
          <span className="flex items-center gap-1.5 shrink-0">
            {sidebarActiveTab === 'properties' && <Settings className="w-3.5 h-3.5 text-emerald-400" />}
            {sidebarActiveTab === 'structure' && <Layers className="w-3.5 h-3.5 text-indigo-400" />}
            {sidebarActiveTab === 'widgets' && <PlusCircle className="w-3.5 h-3.5 text-[#D4AF37]" />}
            {sidebarActiveTab === 'library' && <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />}
            {sidebarActiveTab === 'design_system' && <Palette className="w-3.5 h-3.5 text-amber-500" />}
            {sidebarActiveTab === 'components' && <Boxes className="w-3.5 h-3.5 text-teal-400" />}
            {sidebarActiveTab === 'assets' && <ImageIcon className="w-3.5 h-3.5 text-pink-400" />}
            {sidebarActiveTab === 'backups' && <RotateCcw className="w-3.5 h-3.5 text-yellow-500" />}
            <span>
              {sidebarActiveTab === 'properties' && t('محرر خصائص العنصر', 'Element Properties')}
              {sidebarActiveTab === 'structure' && t('شجرة هيكل الصفحة', 'Figma Pages Tree')}
            {sidebarActiveTab === 'widgets' && t('مكتبة العناصر الذكية', 'Smart Elements List')}
            {sidebarActiveTab === 'library' && t('مكتبة القوالب الجاهزة', 'Ready-Made Template Library')}
              {sidebarActiveTab === 'design_system' && t('إدارة الخطوط والمظهر الطباعي', 'Typography & Brand Styles')}
              {sidebarActiveTab === 'components' && t('المكونات والرموز المشتركة', 'Global Shared Symbols')}
              {sidebarActiveTab === 'assets' && t('الملفات والوسائط المرفوعة', 'Asset Media Library')}
              {sidebarActiveTab === 'backups' && t('النسخ الاحتياطية والمسودات', 'Versions Registry')}
            </span>
          </span>
          
          {/* ⌘ Search Settings Input inside Region 2 for maximum screen space utilization */}
          {sidebarActiveTab === 'properties' && (
            <div className="relative max-w-[130px] md:max-w-[170px]">
              <input
                type="text"
                value={settingsSearchQuery}
                onChange={(e) => setSettingsSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? 'بحث... ⌘' : 'Settings filters... ⌘'}
                className="w-full bg-slate-1000 border border-slate-800 text-[10px] text-slate-200 pl-2 pr-2 py-1.5 rounded-md focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-[9.5px]"
              />
              {settingsSearchQuery && (
                <button
                  onClick={() => setSettingsSearchQuery('')}
                  className="absolute right-1 top-1 text-slate-500 hover:text-slate-300 text-[11px] px-0.5"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* REGION 3 — Secondary Tabs (Sticky) */}
      <div className="bg-slate-900/60 border-b border-slate-900 flex py-1 px-1.5 overflow-x-auto shrink-0 select-none scrollbar-none sticky top-[108px] z-10 w-full">
        {sidebarActiveTab === 'properties' && (
          <div className="flex gap-1 w-full">
            {[
              { key: 'all', arName: 'الكل', enName: 'All' },
              { key: 'settings', arName: 'عام', enName: 'General' },
              { key: 'typography', arName: 'خطوط', enName: 'Fonts' },
              { key: 'colors', arName: 'ألوان', enName: 'Colors' },
              { key: 'effects', arName: 'مؤثرات', enName: 'FX' },
            ].map((subTab) => {
              const isActive = propertiesActiveSubTab === subTab.key;
              return (
                <button
                  key={subTab.key}
                  onClick={() => {
                    setPropertiesActiveSubTab(subTab.key as any);
                    // Smart accordion toggles!
                    if (subTab.key === 'all') {
                      setIsGeneralExpanded(true);
                      setIsTypographyExpanded(true);
                      setIsColorsExpanded(true);
                      setIsEffectsExpanded(true);
                    } else if (subTab.key === 'settings') {
                      setIsGeneralExpanded(true);
                      if (!isPageTreePinned) setIsPageTreeExpanded(false);
                      setIsTypographyExpanded(false);
                      setIsColorsExpanded(false);
                      setIsEffectsExpanded(false);
                    } else if (subTab.key === 'typography') {
                      setIsTypographyExpanded(true);
                      if (!isPageTreePinned) setIsPageTreeExpanded(false);
                      setIsGeneralExpanded(false);
                      setIsColorsExpanded(false);
                      setIsEffectsExpanded(false);
                    } else if (subTab.key === 'colors') {
                      setIsColorsExpanded(true);
                      if (!isPageTreePinned) setIsPageTreeExpanded(false);
                      setIsGeneralExpanded(false);
                      setIsTypographyExpanded(false);
                      setIsEffectsExpanded(false);
                    } else if (subTab.key === 'effects') {
                      setIsEffectsExpanded(true);
                      if (!isPageTreePinned) setIsPageTreeExpanded(false);
                      setIsGeneralExpanded(false);
                      setIsTypographyExpanded(false);
                      setIsColorsExpanded(false);
                    }
                  }}
                  className={`flex-1 py-1 text-[9.5px] font-bold rounded text-center cursor-pointer transition-all ${
                    isActive ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/35' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'ar' ? subTab.arName : subTab.enName}
                </button>
              );
            })}
          </div>
        )}

        {sidebarActiveTab === 'structure' && (
          <div className="flex gap-1 w-full justify-between items-center text-[10px] text-slate-400 font-bold px-1.5 py-0.5">
            <span>{t('إدارة وهيكل الطبقات', 'Figma Navigator Layers')}</span>
            <button
              onClick={addSection}
              className="px-2 py-0.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded text-[9px] text-[#D4AF37] flex items-center gap-1 cursor-pointer font-black text-xs"
            >
              {t('+ قسم جديد', '+ Add Layer')}
            </button>
          </div>
        )}

        {sidebarActiveTab === 'widgets' && (
          <div className="flex gap-1 w-full">
            {[
              { key: 'ALL', arName: 'الكل', enName: 'All' },
              { key: 'TEXT', arName: 'نصوص', enName: 'Texts' },
              { key: 'BUTTONS', arName: 'أزرار', enName: 'Buttons' },
              { key: 'MEDIA', arName: 'وسائط', enName: 'Media' },
              { key: 'BUSINESS', arName: 'مواصفات', enName: 'Specs' },
            ].map((subTab) => {
              const isActive = widgetActiveCategory === subTab.key;
              return (
                <button
                  key={subTab.key}
                  onClick={() => {
                    setWidgetActiveCategory(subTab.key as any);
                    setExpandedCategory(subTab.key === 'ALL' ? 'TEXT' : subTab.key);
                  }}
                  className={`flex-1 py-1 text-[9.5px] font-bold rounded text-center cursor-pointer transition-all ${
                    isActive ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'ar' ? subTab.arName : subTab.enName}
                </button>
              );
            })} 
          </div>
        )}

        {sidebarActiveTab === 'library' && (
          <div className="flex gap-1 w-full">
            {[
              { key: 'sections', arName: 'الأقسام', enName: 'Sections' },
              { key: 'pages', arName: 'الصفحات', enName: 'Pages' },
              { key: 'custom', arName: 'مخصصة', enName: 'Custom' },
            ].map((subTab) => {
              const isActive = libraryActiveSubTab === subTab.key;
              return (
                <button
                  key={subTab.key}
                  onClick={() => setLibraryActiveSubTab(subTab.key as any)}
                  className={`flex-1 py-1 text-[9.5px] font-bold rounded text-center cursor-pointer transition-all ${
                    isActive ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'ar' ? subTab.arName : subTab.enName}
                </button>
              );
            })}
          </div>
        )}

        {sidebarActiveTab === 'design_system' && (
          <div className="flex gap-1 w-full">
            {[
              { key: 'preset', arName: 'سمات', enName: 'Presets' },
              { key: 'colors', arName: 'ألوان', enName: 'Colors' },
              { key: 'fonts', arName: 'خطوط', enName: 'Fonts' },
              { key: 'elements', arName: 'أزرار', enName: 'Widgets' },
              { key: 'custom', arName: 'مخصص', enName: 'Custom' },
            ].map((subTab) => {
              const isActive = designSystemActiveSubTab === subTab.key;
              return (
                <button
                  key={subTab.key}
                  onClick={() => setDesignSystemActiveSubTab(subTab.key as any)}
                  className={`flex-1 py-1 text-[9.5px] font-bold rounded text-center cursor-pointer transition-all ${
                    isActive ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'ar' ? subTab.arName : subTab.enName}
                </button>
              );
            })}
          </div>
        )}

        {sidebarActiveTab === 'components' && (
          <div className="flex gap-1 w-full">
            {[
              { key: 'all', arName: 'الكل', enName: 'All' },
              { key: 'section', arName: 'أقسام', enName: 'Sections' },
              { key: 'widget', arName: 'ويدجت', enName: 'Widgets' },
            ].map((subTab) => {
              const isActive = symbolActiveSubTab === subTab.key;
              return (
                <button
                  key={subTab.key}
                  onClick={() => setSymbolActiveSubTab(subTab.key as any)}
                  className={`flex-1 py-1 text-[9.5px] font-bold rounded text-center cursor-pointer transition-all ${
                    isActive ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'ar' ? subTab.arName : subTab.enName}
                </button>
              );
            })}
          </div>
        )}

        {sidebarActiveTab === 'assets' && (
          <div className="flex gap-1 w-full justify-between items-center text-[10px] text-slate-400 font-bold px-1.5 py-0.5">
            <span>{t('مكتبة الصور والوسائط', 'Real Estate Media Pool')}</span>
          </div>
        )}

        {sidebarActiveTab === 'backups' && (
          <div className="flex gap-1 w-full justify-between items-center text-[10px] text-slate-400 font-bold px-1.5 py-0.5">
            <span>{t('سجل ونسخ المسودات', 'Versions and Logs')}</span>
          </div>
        )}
      </div>

      {/* REGION 4 — Scrollable Workspace */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-slate-950/20 text-right select-text">
        
        {/* 1. PROPERTIES ACCORDIONS (Inspector Settings) */}
        {sidebarActiveTab === 'properties' && (
          <div className="divide-y divide-slate-850/85">
            
            {/* Accordion A: Page Tree Accordion */}
            {(propertiesActiveSubTab === 'all' || propertiesActiveSubTab === 'settings') && (
              <div className="border-b border-slate-800 last:border-0">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900/40 hover:bg-slate-900/60 select-none">
                  <button
                    onClick={() => toggleSidebarAccordion('tree')}
                    className="flex-1 flex items-center gap-1.5 cursor-pointer text-right text-xs font-black text-slate-300"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isPageTreeExpanded ? 'rotate-180' : ''}`} />
                    <span>{t('شجرة الهيكل للتصفح السريع', 'Visual Page Layers Navigator')}</span>
                  </button>
                  <button
                    onClick={() => setIsPageTreePinned(!isPageTreePinned)}
                    className={`p-1.5 hover:text-[#D4AF37] transition-colors cursor-pointer ${isPageTreePinned ? 'text-[#D4AF37]' : 'text-slate-600'}`}
                    title={t('تثبيت اللوحة لمنع الإغلاق التلقائي ذكياً', 'Pin Panel')}
                  >
                    <Pin className="w-3 h-3" />
                  </button>
                </div>

                {isPageTreeExpanded && (
                  <div className="p-2.5 bg-slate-950/25">
                    <div className="space-y-1.5">
                      <div className="relative">
                        <input
                          type="text"
                          value={filterQuery}
                          onChange={(e) => setFilterQuery(e.target.value)}
                          placeholder={t('ابحث في العناصر... (أقسام، أعمدة، بطاقات)', 'Search layers...')}
                          className="w-full bg-slate-900/80 border border-slate-850 text-[10px] text-slate-250 pl-8 pr-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] placeholder:text-slate-600 focus:ring-1 focus:ring-[#D4AF37]/20"
                        />
                        <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-650 pointer-events-none" />
                      </div>

                      {selectedPage && (
                        <div className="space-y-1 mt-2 max-h-[190px] overflow-y-auto pr-1">
                          {selectedPage.sections
                            .filter((sec) => !filterQuery || sec.id.toLowerCase().includes(filterQuery.toLowerCase()) || 
                              sec.rows.some((r) => r.columns.some((c) => c.widgets.some((w) => w.type.toLowerCase().includes(filterQuery.toLowerCase()))))
                            )
                            .map((sec) => {
                              const isSecSelected = selectedSectionId === sec.id && selectedElType === 'section';
                              const isSecHidden = !!hiddenElements[sec.id];
                              const isSecLocked = !!lockedElements[sec.id];
                              return (
                                <div key={sec.id} className="space-y-1">
                                  <div 
                                    onClick={() => { setSelectedElType('section'); setSelectedSectionId(sec.id); setSelectedRowId(null); setSelectedColId(null); setSelectedWidgetId(null); }}
                                    className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer select-none transition-all ${
                                      isSecSelected ? 'bg-indigo-900/50 border border-indigo-700/60 font-bold text-white shadow-inner' : 'hover:bg-slate-900/50 text-slate-400'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1">
                                      <Layers className="w-3 h-3 text-indigo-400 shrink-0" />
                                      <span className="font-mono text-[10.5px] font-black">{sec.id.slice(0, 9)}... (Section)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                      <button 
                                        onClick={() => setHiddenElements({ ...hiddenElements, [sec.id]: !isSecHidden })}
                                        className="text-slate-500 hover:text-slate-300 cursor-pointer p-0.5"
                                      >
                                        {isSecHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                      </button>
                                      <button 
                                        onClick={() => setLockedElements({ ...lockedElements, [sec.id]: !isSecLocked })}
                                        className="text-slate-500 hover:text-slate-300 cursor-pointer p-0.5"
                                      >
                                        {isSecLocked ? <Lock className="w-3 h-3 text-[#D4AF37]" /> : <Unlock className="w-3 h-3" />}
                                      </button>
                                    </div>
                                  </div>

                                  {sec.rows.map((row) => (
                                    <div key={row.id} className="mr-3 pr-1 border-r border-slate-900 space-y-1">
                                      {row.columns.map((col) => {
                                        const isColSelected = selectedColId === col.id && selectedElType === 'column';
                                        return (
                                          <div key={col.id} className="space-y-1">
                                            <div 
                                              onClick={() => { setSelectedElType('column'); setSelectedSectionId(sec.id); setSelectedRowId(row.id); setSelectedColId(col.id); setSelectedWidgetId(null); }}
                                              className={`flex items-center justify-between p-1 rounded-lg text-[11px] cursor-pointer select-none transition-all ${
                                                isColSelected ? 'bg-emerald-950/65 border border-emerald-800/60 font-bold text-white' : 'hover:bg-slate-900/30 text-slate-500'
                                              }`}
                                            >
                                              <div className="flex items-center gap-1.5">
                                                <Columns className="w-3 h-3 text-emerald-400 shrink-0" />
                                                <span className="font-mono text-[9px] font-bold">Col {col.gridSpan ? `(span ${col.gridSpan})` : '(auto)'}</span>
                                              </div>
                                            </div>

                                            {col.widgets.map((wid) => {
                                              const isWidSelected = selectedWidgetId === wid.id && selectedElType === 'widget';
                                              return (
                                                <div 
                                                  key={wid.id}
                                                  onClick={() => { setSelectedElType('widget'); setSelectedSectionId(sec.id); setSelectedRowId(row.id); setSelectedColId(col.id); setSelectedWidgetId(wid.id); }}
                                                  className={`mr-4 pr-1.5 border-r border-slate-900/80 p-0.5 rounded text-[10px] cursor-pointer select-none transition-all flex items-center justify-between ${
                                                    isWidSelected ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-black' : 'hover:bg-slate-900/40 text-slate-500'
                                                  }`}
                                                >
                                                  <div className="flex items-center gap-1 truncate">
                                                    <Square className="w-2.5 h-2.5 opacity-60 text-[#D4AF37] shrink-0" />
                                                    <span className="truncate">{wid.type.replace('WIDGET_', '')}</span>
                                                  </div>
                                                  <button 
                                                    onClick={(e) => { e.stopPropagation(); deleteWidget(sec.id, row.id, col.id, wid.id); }}
                                                    className="p-0.5 text-rose-500 hover:text-rose-450 cursor-pointer shrink-0"
                                                  >
                                                    <Trash2 className="w-2.5 h-2.5" />
                                                  </button>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                </div>
            )}

            {/* Accordion B: General Configuration Settings */}
            {(propertiesActiveSubTab === 'all' || propertiesActiveSubTab === 'settings') && (
              <div className="border-b border-slate-800 last:border-0">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900/40 hover:bg-slate-900/60 select-none">
                  <button
                    onClick={() => toggleSidebarAccordion('general')}
                    className="flex-1 flex items-center gap-1.5 cursor-pointer text-right text-xs font-black text-slate-300"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isGeneralExpanded ? 'rotate-180' : ''}`} />
                    <span>{t('بيانات وهيكلية العنصر', 'General Element Configurations')}</span>
                  </button>
                </div>

                {isGeneralExpanded && (
                  <div className="p-3.5 space-y-3.5 text-right font-sans text-xs">
                    
                    {/* Selected page editor */}
                    {selectedPage && selectedElType === 'page' && (
                      <div className="space-y-3">
                        {matchesSearch('عنوان الصفحة عربي', 'Page Title AR') && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 font-bold block">{t('عنوان الصفحة (عربي)', 'Page Title (AR)')}</label>
                            <input
                              type="text"
                              value={selectedPage.titleAr}
                              onChange={(e) => updatePageSettings('titleAr', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                            />
                          </div>
                        )}
                        {matchesSearch('عنوان الصفحة إنجليزي', 'Page Title EN') && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 font-bold block">{t('عنوان الصفحة (إنجليزي)', 'Page Title (EN)')}</label>
                            <input
                              type="text"
                              value={selectedPage.titleEn}
                              onChange={(e) => updatePageSettings('titleEn', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                            />
                          </div>
                        )}
                        {matchesSearch('رابط الصفحة الفرعي', 'SEO URL Slug') && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 font-bold block">{t('رابط الصفحة الفرعي', 'SEO URL Slug')}</label>
                            <input
                              type="text"
                              value={selectedPage.slug}
                              onChange={(e) => updatePageSettings('slug', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selected section properties */}
                    {selectedSectionId && selectedElType === 'section' && (
                      <div className="space-y-3">
                        {matchesSearch('اسم المعرف عير رقمي', 'Identifier Name') && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 font-bold block">{t('اسم المعرف (عربي / مخصص)', 'Identifier Name')}</label>
                            <input
                              type="text"
                              value={selectedSectionId}
                              disabled
                              className="w-full bg-slate-900/45 border border-slate-800 text-slate-500 px-2.5 py-1.5 rounded-lg select-all"
                            />
                          </div>
                        )}

                        {matchesSearch('الهوامش الرأسية للقسم', 'Vertical Padding spacing') && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 font-bold block">{t('الهوامش الرأسية للقسم', 'Vertical Padding (Spacing)')}</label>
                            <select
                              value={selectedPage?.sections.find(s => s.id === selectedSectionId)?.spacing || 'py-16'}
                              onChange={(e) => handleUpdateElementSetting('spacing', e.target.value, false)}
                              className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-2.5 py-1.5 rounded-lg focus:none focus:border-[#D4AF37]"
                            >
                              <option value="py-8">{t('هوامش صغيرة (py-8)', 'Standard compact (py-8)')}</option>
                              <option value="py-12">{t('هوامش متوسطة (py-12)', 'Standard moderate (py-12)')}</option>
                              <option value="py-16">{t('هوامش واسعة (py-16)', 'Generous spacing (py-16)')}</option>
                              <option value="py-24">{t('مساحة فارهة (py-24)', 'Luxury elegant spacing (py-24)')}</option>
                            </select>
                          </div>
                        )}

                        <BlockBackgroundSettingsEditor
                          settings={selectedPage?.sections.find(s => s.id === selectedSectionId) || {}}
                          onChange={(next) => handleUpdateElementSetting('background', next, false)}
                          language={language}
                          titleAr="خلفية القسم"
                          titleEn="Section Background"
                          noteAr="خلفية القسم تُحفظ داخل الصفحة وتظهر عند استخدام القالب أو نسخه."
                          noteEn="Section background is stored with the page and appears in templates and duplicates."
                        />

                        <button
                          onClick={() => {
                            const activeSec = selectedPage?.sections.find(x => x.id === selectedSectionId);
                            if (activeSec) {
                              const nameAr = prompt(t('أدخل اسماً عربياً لقالب القسم المشترك:', 'Enter Arabic name for section symbol:'), 'قسم مخصص');
                              const nameEn = prompt(t('أدخل اسماً إنجليزياً لقالب القسم المشترك:', 'Enter English name for section symbol:'), 'Shared Section Symbol');
                              if (nameAr && nameEn) {
                                saveReusableComponent('section', nameAr, nameEn, JSON.parse(JSON.stringify(activeSec)));
                                triggerNotice(t('تم تدوين القسم كـ رمز مشترك بنجاح!', 'Shared Symbol registered in database successfully!'));
                              }
                            }
                          }}
                          className="w-full py-2 bg-slate-900 border border-slate-800 hover:text-[#D4AF37] hover:border-[#D4AF37]/35 rounded-lg text-slate-300 transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer font-bold"
                        >
                          <Boxes className="w-3.5 h-3.5 text-teal-400" />
                          <span>{t('حفظ كمكون مشترك لمزامنته', 'Create Global Symbol')}</span>
                        </button>
                      </div>
                    )}

                    {/* Selected Column parameters */}
                    {selectedColId && selectedElType === 'column' && (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 font-bold block">{t('توزيع اتساع شبكة الأعمدة (Grid span)', 'Grid stretch parameter')}</label>
                          <select
                            value={selectedPage?.sections.flatMap(s=>s.rows).flatMap(r=>r.columns).find(c=>c.id === selectedColId)?.gridSpan || 6}
                            onChange={(e) => handleUpdateElementSetting('gridSpan', parseInt(e.target.value, 10), false)}
                            className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                          >
                            <option value="12">{t('أقصى عرض (12/12) - سطر كامل', 'Full Width (12/12)')}</option>
                            <option value="8">{t('عرض واسع (8/12)', 'Wide stretch (8/12)')}</option>
                            <option value="6">{t('نصف عرض السطر (6/12)', 'Half row (6/12)')}</option>
                            <option value="4">{t('ثلث عرض السطر (4/12)', 'One-Third row (4/12)')}</option>
                            <option value="3">{t('ربع عرض السطر (3/12)', 'One-Quarter row (3/12)')}</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 font-bold block">{t('خلفية العمود', 'Column Background')}</label>
                          <div className="text-[10px] text-slate-500 leading-relaxed">
                            {t('الأعمدة ستدعم الخلفية عندما يكون لديها إعدادات مخصصة، وهذا جاهز للمراحل القادمة.', 'Columns will support custom backgrounds once dedicated settings are enabled.')}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Selected Widget detailed settings */}
                    {selectedWidgetId && selectedElType === 'widget' && currentWidget && (
                      <div className="space-y-3 font-sans">
                        <div className="p-2 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-between">
                          <span className="font-bold text-xs text-gradient bg-gradient-to-r from-teal-400 to-[#D4AF37] bg-clip-text text-transparent">
                            {currentWidget.type.split('_').join(' ')}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono select-all">ID: {currentWidget.id.slice(0, 8)}</span>
                        </div>

                        <WidgetBackgroundSettingsEditor
                          currentWidget={currentWidget}
                          handleUpdateElementSetting={handleUpdateElementSetting}
                          language={language}
                        />

                        {/* Dynamically render fields inside schema with search filter query */}
                        {currentWidget.type === 'hero_slider' || currentWidget.type === 'property_grid' ? (
                          currentWidget.type === 'property_grid' ? (
                            <FeaturedPropertiesGridSettingsEditor
                              currentWidget={currentWidget}
                              handleUpdateElementSetting={handleUpdateElementSetting}
                              language={language}
                            />
                          ) : (
                          <HeroSliderSettingsEditor
                            currentWidget={currentWidget}
                            handleUpdateElementSetting={handleUpdateElementSetting}
                            language={language}
                          />
                          )
                        ) : (
                          Object.entries((WIDGET_REGISTRY as any)[currentWidget.type]?.settingsSchema || {}).map(([key, schemaVal]: [string, any]) => {
                            const showField = matchesSearch(schemaVal.labelAr || schemaVal.labelEn || key, key);
                            if (!showField) return null;

                            const val = currentWidget.settings[key] ?? schemaVal.default;
                            
                            if (schemaVal.type === 'string') {
                              return (
                                <div key={key} className="space-y-1.5">
                                  <label className="text-[10px] text-slate-400 font-bold block">{language === 'ar' ? schemaVal.labelAr : schemaVal.labelEn}</label>
                                  <input
                                    type="text"
                                    value={val}
                                    onChange={(e) => handleUpdateElementSetting(key, e.target.value, true)}
                                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                  />
                                </div>
                              );
                            }

                            if (schemaVal.type === 'text') {
                              return (
                                <div key={key} className="space-y-1.5">
                                  <label className="text-[10px] text-slate-400 font-bold block">{language === 'ar' ? schemaVal.labelAr : schemaVal.labelEn}</label>
                                  <textarea
                                    value={val}
                                    rows={3}
                                    onChange={(e) => handleUpdateElementSetting(key, e.target.value, true)}
                                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] font-sans text-xs text-right leading-normal"
                                  />
                                </div>
                              );
                            }

                            if (schemaVal.type === 'image') {
                              return (
                                <div key={key} className="space-y-2">
                                  <label className="text-[10px] text-slate-400 font-bold block">{language === 'ar' ? schemaVal.labelAr : schemaVal.labelEn}</label>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={val}
                                      onChange={(e) => handleUpdateElementSetting(key, e.target.value, true)}
                                      className="w-full bg-slate-900 border border-slate-800 text-slate-205 px-2 py-1.5 text-[10px] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                      placeholder="https://"
                                    />
                                  </div>
                                  {val && (
                                    <div className="border border-slate-800 rounded-lg overflow-hidden h-24 bg-slate-900/60 relative">
                                      <img src={val} className="w-full h-full object-cover" alt="Selected widget asset" referrerPolicy="no-referrer" />
                                      <button 
                                        onClick={() => handleUpdateElementSetting(key, '', true)} 
                                        className="absolute top-1 right-1 w-5 h-5 bg-slate-950/80 hover:bg-red-950 rounded-full flex items-center justify-center text-xs text-slate-400 hover:text-red-400 cursor-pointer text-center"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            if (schemaVal.type === 'select') {
                              return (
                                <div key={key} className="space-y-1.5">
                                  <label className="text-[10px] text-slate-400 font-bold block">{language === 'ar' ? schemaVal.labelAr : schemaVal.labelEn}</label>
                                  <select
                                    value={val}
                                    onChange={(e) => handleUpdateElementSetting(key, e.target.value, true)}
                                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                  >
                                    {(language === 'ar' ? schemaVal.optionsAr : schemaVal.optionsEn || schemaVal.options || []).map((o: any) => (
                                      <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                  </select>
                                </div>
                              );
                            }

                            return null;
                          })
                        )}
                      </div>
                    )}

                    {!selectedElType && (
                      <div className="text-center py-4 text-slate-500 text-[10.5px]">
                        {t('⚠️ يرجى اختيار أي عنصر أولاً لتظهر لك أدوات التحكم التفاعلية', '⚠️ Highlight or click any canvas grid section to begin editing settings.')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Accordion C: Typography Accents */}
            {(propertiesActiveSubTab === 'all' || propertiesActiveSubTab === 'typography') && selectedWidgetId && selectedElType === 'widget' && currentWidget && (
              <div className="border-b border-slate-800 last:border-0">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900/40 hover:bg-slate-900/60 select-none">
                  <button
                    onClick={() => toggleSidebarAccordion('typography')}
                    className="flex-1 flex items-center gap-1.5 cursor-pointer text-right text-xs font-black text-slate-300"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isTypographyExpanded ? 'rotate-180' : ''}`} />
                    <span>{t('الخطوط ومحاذاة الطباعة', 'Typography Alignment & Sizes')}</span>
                  </button>
                </div>

                {isTypographyExpanded && (
                  <div className="p-3.5 space-y-3.5 text-right font-sans text-xs">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 font-bold block">{t('محاذاة تموضع النص الكلي', 'Line Text Alignment Preset')}</label>
                      <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg">
                        {[
                          { key: 'right', icon: '👉', labelAr: 'يمين', labelEn: 'Right' },
                          { key: 'center', icon: '↔️', labelAr: 'توسيط', labelEn: 'Center' },
                          { key: 'left', icon: '👈', labelAr: 'يسار', labelEn: 'Left' },
                        ].map((opt) => {
                          const isActive = currentWidget.settings['textAlign'] === opt.key;
                          return (
                            <button
                              key={opt.key}
                              onClick={() => handleUpdateElementSetting('textAlign', opt.key, true)}
                              className={`py-1 rounded text-center cursor-pointer transition-all ${
                                isActive ? 'bg-[#D4AF37] text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                              }`}
                            >
                              <span className="text-[11px] block">{opt.icon}</span>
                              <span className="text-[8px] mt-0.5 block">{language === 'ar' ? opt.labelAr : opt.labelEn}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold block">{t('حجم مظهر الخطوط مسبقاً (Tailwind)', 'Tailwind Text Sizing Level')}</label>
                      <select
                        value={currentWidget.settings['sizeClass'] || 'text-base'}
                        onChange={(e) => handleUpdateElementSetting('sizeClass', e.target.value, true)}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option value="text-xs">{t('صغير جداً (text-xs)', 'Mini layout size (text-xs)')}</option>
                        <option value="text-sm">{t('صغير قياسي (text-sm)', 'Compact text-sm')}</option>
                        <option value="text-base">{t('عادي متوسط (text-base)', 'Standard normal (text-base)')}</option>
                        <option value="text-lg">{t('كبير فرعي (text-lg)', 'Sub-heading (text-lg)')}</option>
                        <option value="text-xl">{t('كبير ملحوظ (text-xl)', 'Highlight lead text-xl')}</option>
                        <option value="text-2xl">{t('عنوان فرعي ممتاز (text-2xl)', 'H3 size text-2xl')}</option>
                        <option value="text-3xl">{t('عنوان رئيسي مخصص (text-3xl)', 'H2 Display text-3xl')}</option>
                        <option value="text-4xl font-extrabold">{t('عنوان لوحة عملاق (text-4xl)', 'H1 Giant display (text-4xl)')}</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Accordion D: Color customization */}
            {(propertiesActiveSubTab === 'all' || propertiesActiveSubTab === 'colors') && (selectedElType === 'section' || selectedElType === 'widget') && (
              <div className="border-b border-slate-800 last:border-0">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900/40 hover:bg-slate-900/60 select-none">
                  <button
                    onClick={() => toggleSidebarAccordion('colors')}
                    className="flex-1 flex items-center gap-1.5 cursor-pointer text-right text-xs font-black text-slate-300"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isColorsExpanded ? 'rotate-180' : ''}`} />
                    <span>{t('اللون البصري والسمة الرمزية', 'Colors Customizers & Backgrounds')}</span>
                  </button>
                </div>

                {isColorsExpanded && (
                  <div className="p-3.5 space-y-3.5 text-right font-sans text-xs">
                    {selectedElType === 'section' && (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 font-bold block">{t('لون خلفية القسم (Background)', 'Container BG Color')}</label>
                          <div className="flex gap-2.5">
                            <input
                              type="color"
                              value={selectedPage?.sections.find(s=>s.id === selectedSectionId)?.backgroundColor || '#020617'}
                              onChange={(e) => handleUpdateElementSetting('backgroundColor', e.target.value, false)}
                              className="w-10 h-8 p-0 border border-slate-800 rounded bg-transparent cursor-pointer"
                            />
                            <input
                              type="text"
                              value={selectedPage?.sections.find(s=>s.id === selectedSectionId)?.backgroundColor || '#020617'}
                              onChange={(e) => handleUpdateElementSetting('backgroundColor', e.target.value, false)}
                              className="flex-1 bg-slate-900 border border-slate-800 text-slate-205 text-xs px-2 rounded focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 font-bold block">{t('لون النصوص العام كلاسيك', 'General Section Text Color')}</label>
                          <div className="flex gap-2.5">
                            <input
                              type="color"
                              value={selectedPage?.sections.find(s=>s.id === selectedSectionId)?.textColor || '#ffffff'}
                              onChange={(e) => handleUpdateElementSetting('textColor', e.target.value, false)}
                              className="w-10 h-8 p-0 border border-slate-800 rounded bg-transparent cursor-pointer"
                            />
                            <input
                              type="text"
                              value={selectedPage?.sections.find(s=>s.id === selectedSectionId)?.textColor || '#ffffff'}
                              onChange={(e) => handleUpdateElementSetting('textColor', e.target.value, false)}
                              className="flex-1 bg-slate-900 border border-slate-800 text-slate-205 text-xs px-2 rounded focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedElType === 'widget' && currentWidget && (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 font-bold block">{t('اللون الرمزي الرئيسي للمكون (Accent)', 'Widget Color Accent')}</label>
                          <div className="flex gap-2.5">
                            <input
                              type="color"
                              value={currentWidget.settings['accentColor'] || '#D4AF37'}
                              onChange={(e) => handleUpdateElementSetting('accentColor', e.target.value, true)}
                              className="w-10 h-8 p-0 border border-slate-800 rounded bg-transparent cursor-pointer"
                            />
                            <input
                              type="text"
                              value={currentWidget.settings['accentColor'] || '#D4AF37'}
                              onChange={(e) => handleUpdateElementSetting('accentColor', e.target.value, true)}
                              className="flex-1 bg-slate-900 border border-slate-800 text-slate-205 text-xs px-2 rounded focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Accordion E: Advanced visual shadow FX */}
            {(propertiesActiveSubTab === 'all' || propertiesActiveSubTab === 'effects') && (selectedElType === 'section' || selectedElType === 'widget') && (
              <div className="border-b border-slate-800 last:border-0">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900/40 hover:bg-slate-900/60 select-none">
                  <button
                    onClick={() => toggleSidebarAccordion('effects')}
                    className="flex-1 flex items-center gap-1.5 cursor-pointer text-right text-xs font-black text-slate-300"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isEffectsExpanded ? 'rotate-180' : ''}`} />
                    <span>{t('مؤثرات بصرية والتحكم بالإنيميشن', 'Visual Advanced Shadow Effects & FX')}</span>
                  </button>
                </div>

                {isEffectsExpanded && (
                  <div className="p-3.5 space-y-3.5 text-right font-sans text-xs bg-slate-950/25">
                    <VisualEffectsSettingsPanel
                      language={language}
                      activeEffects={
                        selectedElType === 'section' 
                          ? selectedPage?.sections.find(s=>s.id === selectedSectionId)?.effects || {}
                          : currentWidget?.settings['effects'] || {}
                      }
                      onChange={(updatedFX) => handleUpdateElementSetting('effects', updatedFX, selectedElType === 'widget')}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Accordion F: Global symbols syncing */}
            {propertiesActiveSubTab === 'all' && selectedWidgetId && selectedElType === 'widget' && currentWidget && (
              <div className="border-b border-slate-800 last:border-0">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900/40 hover:bg-slate-900/60 select-none">
                  <button
                    onClick={() => toggleSidebarAccordion('symbols')}
                    className="flex-1 flex items-center gap-1.5 cursor-pointer text-right text-xs font-black text-slate-300"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isSymbolsExpanded ? 'rotate-180' : ''}`} />
                    <span>{t('المكونات المشتركة عالمياً الرموز', 'Global Reusable Symbols Manager')}</span>
                  </button>
                </div>

                {isSymbolsExpanded && (
                  <div className="p-3.5 space-y-3.5 text-right font-sans text-xs">
                    {currentWidget.settings['componentId'] ? (
                      <div className="space-y-3">
                        <div className="p-2.5 bg-indigo-950/30 border border-indigo-500/35 rounded-lg text-indigo-300 leading-normal text-[10.5px]">
                          ℹ️ {t('هذا العنصر مرتبط بـ مكون عالمي منسق. أي تعديل يتم حفظه هنا سيتم تحديثه في كافة الصفحات!', 'Connected to global reusable widget symbol. Edits sync automatically.')}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateElementSetting('componentId', '', true)}
                            className="flex-1 py-1.5 bg-slate-900 border border-slate-800 hover:text-rose-450 text-slate-400 text-[10px] font-black rounded cursor-pointer transition-colors"
                          >
                            {t('فك الارتباط', 'Detach Link')}
                          </button>
                          <button
                            onClick={() => {
                              const componentId = String(currentWidget.settings['componentId'] || '');
                              if (!componentId) return;
                              apiClient.put(`/builder-assets/${componentId}`, {
                                kind: 'reusable_component',
                                key: componentId,
                                nameAr: currentWidget.type,
                                nameEn: currentWidget.type,
                                data: {
                                  id: componentId,
                                  type: currentWidget.type,
                                  settings: JSON.parse(JSON.stringify(currentWidget.settings))
                                }
                              }).then(() => {
                                triggerNotice(t('تم نشر تحديث رمز الويدجت عالمياً!', 'Synchronized master widget successfully across all pages!'));
                              }).catch(() => {
                                triggerNotice(t('تعذر مزامنة الرمز حالياً', 'Unable to sync symbol right now'));
                              });
                            }}
                            className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>{t('تزامن كلي', 'Push & Sync')}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          const nameAr = prompt(t('أدخل اسماً عربياً لويدجت المكون المشترك:', 'Enter Arabic name for linked widget symbol:'), currentWidget.type);
                          const nameEn = prompt(t('أدخل اسماً إنجليزياً لويدجت المكون المشترك:', 'Enter English name for linked widget symbol:'), currentWidget.type);
                          if (nameAr && nameEn) {
                            const newComp = saveReusableComponent('widget', nameAr, nameEn, {
                              type: currentWidget.type,
                              settings: JSON.parse(JSON.stringify(currentWidget.settings))
                            });
                            handleUpdateElementSetting('componentId', newComp.id, true);
                            triggerNotice(t('تم حفظ الويدجت كمكون مشترك متكامل!', 'Widget successfully saved as global reusable component!'));
                          }
                        }}
                        className="w-full py-2 bg-indigo-950/40 hover:bg-slate-900 border border-indigo-850 text-indigo-300 text-[10px] font-black rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Boxes className="w-3.5 h-3.5" />
                        <span>{t('حفظ كـ رمز ويدجت لمزامنته عالمياً', 'Save as Global Symbol')}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. STRUCTURE (Figma layers navigator hierarchy only) */}
        {sidebarActiveTab === 'structure' && selectedPage && (
          <div className="p-3.5 space-y-3.5">
            <div className="relative">
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder={t('ابحث في المجموعات والطبقات... 🔍', 'Search layers navigator... 🔍')}
                className="w-full bg-slate-900/80 border border-slate-850 text-[11px] text-slate-205 pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:border-[#D4AF37] placeholder:text-slate-600 focus:ring-1 focus:ring-[#D4AF37]/20"
              />
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
            </div>

            <div className="space-y-1.5 mt-2">
              {selectedPage.sections
                .filter((sec) => !filterQuery || sec.id.toLowerCase().includes(filterQuery.toLowerCase()) || 
                  sec.rows.some((r) => r.columns.some((c) => c.widgets.some((w) => w.type.toLowerCase().includes(filterQuery.toLowerCase()))))
                )
                .map((sec) => {
                  const isSecSelected = selectedSectionId === sec.id && selectedElType === 'section';
                  const isSecHidden = !!hiddenElements[sec.id];
                  const isSecLocked = !!lockedElements[sec.id];
                  return (
                    <div key={sec.id} className="space-y-1.5 rounded-lg border border-slate-900/50 p-1.5 bg-slate-900/5">
                      <div 
                        onClick={() => { setSelectedElType('section'); setSelectedSectionId(sec.id); setSelectedRowId(null); setSelectedColId(null); setSelectedWidgetId(null); }}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer select-none transition-all ${
                          isSecSelected ? 'bg-indigo-900/55 border border-indigo-700/60 font-black text-white' : 'hover:bg-slate-900/40 text-slate-300'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 font-bold">
                          <Layers className="w-3.5 h-3.5 text-indigo-455" />
                          <span className="font-mono text-[10px] uppercase">{sec.id.slice(0, 9)}... (Section)</span>
                        </span>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => setHiddenElements({ ...hiddenElements, [sec.id]: !isSecHidden })}
                            className="text-slate-500 hover:text-slate-300 cursor-pointer p-0.5"
                          >
                            {isSecHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button 
                            onClick={() => setLockedElements({ ...lockedElements, [sec.id]: !isSecLocked })}
                            className="text-slate-500 hover:text-slate-300 cursor-pointer p-0.5"
                          >
                            {isSecLocked ? <Lock className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {sec.rows.map((row) => (
                        <div key={row.id} className="mr-3 pr-2.5 border-r border-slate-905 space-y-1.5">
                          {row.columns.map((col) => {
                            const isColSelected = selectedColId === col.id && selectedElType === 'column';
                            return (
                              <div key={col.id} className="space-y-1.5">
                                <div 
                                  onClick={() => { setSelectedElType('column'); setSelectedSectionId(sec.id); setSelectedRowId(row.id); setSelectedColId(col.id); setSelectedWidgetId(null); }}
                                  className={`flex items-center justify-between p-1.5 rounded-md text-[11px] cursor-pointer select-none transition-all ${
                                    isColSelected ? 'bg-emerald-950/65 border border-emerald-800/60 font-black text-white' : 'hover:bg-slate-900/30 text-slate-450'
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5 font-bold">
                                    <Columns className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="font-mono text-[9.5px]">Col {col.gridSpan ? `(span ${col.gridSpan})` : '(auto)'}</span>
                                  </span>
                                </div>

                                {col.widgets.map((wid) => {
                                  const isWidSelected = selectedWidgetId === wid.id && selectedElType === 'widget';
                                  return (
                                    <div 
                                      key={wid.id}
                                      onClick={() => { setSelectedElType('widget'); setSelectedSectionId(sec.id); setSelectedRowId(row.id); setSelectedColId(col.id); setSelectedWidgetId(wid.id); }}
                                      className={`mr-4 pr-2 border-r border-slate-900/65 p-1 rounded text-[10px] cursor-pointer select-none transition-all flex items-center justify-between ${
                                        isWidSelected ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/35 font-black' : 'hover:bg-slate-900/40 text-slate-500'
                                      }`}
                                    >
                                      <span className="flex items-center gap-1 truncate">
                                        <Square className="w-2.5 h-2.5 text-[#D4AF37] opacity-65 shrink-0" />
                                        <span className="truncate">{wid.type.replace('WIDGET_', '')}</span>
                                      </span>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); deleteWidget(sec.id, row.id, col.id, wid.id); }}
                                        className="p-1 text-rose-500 hover:text-rose-400 cursor-pointer text-center"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* 3. WIDGETS (Insertion library) */}
        {sidebarActiveTab === 'widgets' && selectedPage && (
          <div className="p-3.5 space-y-3.5">
            {!selectedColId && (
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-md p-2.5 text-[9.5px] text-amber-300 leading-relaxed text-center font-bold">
                ⚠️ {t('اختر عموداً (Col) من شجرة هيكل الصفحة أعلاه أولاً، ثم اضغط على المكون لإدراجه في المنظور.', 'Select a column in the page layers tree above, then click any widget below to instantiate.')}
              </div>
            )}

            {selectedColId && (
              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-md p-2 text-[10px] text-emerald-300 leading-relaxed text-center font-black">
                ✅ {t('سيتم إدراج العنصر في العمود المختار بنجاح.', 'Ready to instantiate widget inside chosen column.')}
              </div>
            )}

            <div className="space-y-2">
              {['TEXT', 'BUTTONS', 'MEDIA', 'CONTENT', 'SOCIAL', 'BUSINESS', 'CONTACT']
                .filter((catKey) => widgetActiveCategory === 'ALL' || widgetActiveCategory === catKey || (widgetActiveCategory === 'BUSINESS' && (catKey === 'BUSINESS' || catKey === 'CONTENT')))
                .map((catKey) => {
                  const catWidgets = getWidgetByCategory(catKey as WidgetCategoryType);
                  const isOpen = expandedCategory === catKey;
                  
                  let colorClass = "text-amber-400";
                  let bgHover = "hover:border-amber-500/20";
                  if (catKey === 'BUTTONS') { colorClass = "text-orange-400"; bgHover = "hover:border-orange-500/20"; }
                  else if (catKey === 'MEDIA') { colorClass = "text-emerald-400"; bgHover = "hover:border-emerald-500/20"; }
                  else if (catKey === 'CONTENT') { colorClass = "text-indigo-400"; bgHover = "hover:border-indigo-505/20"; }
                  else if (catKey === 'SOCIAL') { colorClass = "text-purple-400"; bgHover = "hover:border-purple-500/20"; }
                  else if (catKey === 'BUSINESS') { colorClass = "text-sky-400"; bgHover = "hover:border-sky-500/20"; }
                  else if (catKey === 'CONTACT') { colorClass = "text-rose-400"; bgHover = "hover:border-rose-500/20"; }

                  return (
                    <div key={catKey} className="border border-slate-900 rounded-lg overflow-hidden bg-slate-900/10">
                      <button
                        onClick={() => setExpandedCategory(isOpen ? null : catKey)}
                        className="w-full px-3 py-2 bg-slate-900/80 hover:bg-slate-900 flex items-center justify-between text-xs cursor-pointer select-none font-bold"
                      >
                        <span className="flex items-center gap-2 font-black">
                          <span className={`w-1.5 h-1.5 rounded-full bg-current ${colorClass}`} />
                          <span className="text-slate-200 text-[10px] font-mono tracking-wider">{catKey}</span>
                        </span>
                        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isOpen && (
                        <div className="p-2 bg-slate-950/40 space-y-1.5">
                          {catWidgets.map((w) => (
                            <button
                              key={w.type}
                              onClick={() => {
                                if (!selectedColId) {
                                  triggerNotice(t('يرجى تحديد عمود من شجرة هيكل الصفحة أعلاه أولاً', 'Please select a column in the Layout Tree first'));
                                  return;
                                }
                                addWidget(selectedSectionId!, selectedRowId!, selectedColId!, w.type);
                              }}
                              className={`w-full p-2 bg-slate-900/40 hover:bg-slate-900 border border-slate-900 ${bgHover} rounded-md text-right flex flex-col items-start gap-1 cursor-pointer transition-all`}
                            >
                              <div className="w-full flex items-center justify-between text-[11px] text-slate-300 font-bold">
                                <span>{language === 'ar' ? w.labelAr : w.labelEn}</span>
                                <span className={`text-[9px] uppercase font-mono tracking-widest ${colorClass}`}>
                                  {w.type.replace('WIDGET_', '').split('_').join(' ')}
                                </span>
                              </div>
                              <p className="text-[9px] text-slate-500 leading-normal text-right">
                                {language === 'ar' ? w.descriptionAr : w.descriptionEn}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* 4. TEMPLATE LIBRARY */}
        {sidebarActiveTab === 'library' && (
          <div className="p-3 space-y-3">
            {!selectedPage && (
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-md p-2.5 text-[9.5px] text-amber-300 leading-relaxed text-center font-bold">
                ⚠️ {t('اختر صفحة أولاً حتى تتمكن من تطبيق أو إدراج القوالب.', 'Select a page first to insert or apply templates.')}
              </div>
            )}

            {libraryActiveSubTab === 'sections' && (
              <div className="space-y-3">
                {!hasBuiltInSectionTemplates && (
                  <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3 text-[10px] text-slate-500 text-center">
                    {t('لا توجد قوالب أقسام جاهزة حالياً. راجع الـ seed أو اتصل بالخادم.', 'No built-in section templates are available right now. Check the seed data or API.')}
                  </div>
                )}
                {sectionLibraryCategories.map((categoryKey) => {
                  const templates = sectionTemplatesByCategory[categoryKey] || [];
                  if (templates.length === 0) return null;

                  return (
                    <div key={categoryKey} className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <div className="text-xs font-black text-slate-200 capitalize">{categoryKey}</div>
                        <div className="text-[9px] text-slate-500 font-bold">{templates.length}</div>
                      </div>
                      <div className="space-y-2">
                        {templates.map((template) => (
                          <div key={template.key} className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 space-y-2">
                            <div className="space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="text-xs font-black text-slate-100 leading-tight">
                                  {language === 'ar' ? template.nameAr : template.nameEn}
                                </div>
                                <span className="text-[9px] uppercase tracking-widest text-emerald-300 font-mono">{template.category}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 leading-relaxed">
                                {language === 'ar' ? template.descAr : template.descEn}
                              </div>
                            </div>

                            <button
                              onClick={() => appendTemplateSections([template.sectionData], 'تم إدراج القالب القسم بنجاح', 'Section template inserted successfully')}
                              className="w-full rounded-md border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-200 text-[10px] font-bold py-2 cursor-pointer transition-colors"
                            >
                              {t('إدراج هذا القسم', 'Insert this section')}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {libraryActiveSubTab === 'pages' && (
              <div className="space-y-3">
                {!hasBuiltInPageTemplates && (
                  <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3 text-[10px] text-slate-500 text-center">
                    {t('لا توجد قوالب صفحات جاهزة حالياً. راجع الـ seed أو اتصل بالخادم.', 'No built-in page templates are available right now. Check the seed data or API.')}
                  </div>
                )}
                {TEMPLATE_CATEGORIES.map((category) => {
                  const templates = pageTemplatesByCategory[category.key] || [];
                  if (templates.length === 0) return null;

                  return (
                    <div key={category.key} className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <div className="text-xs font-black text-slate-200">{language === 'ar' ? category.labelAr : category.labelEn}</div>
                        <div className="text-[9px] text-slate-500 font-bold">{templates.length}</div>
                      </div>
                      <div className="space-y-2">
                        {templates.map((template) => (
                          <div key={template.key} className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 space-y-2">
                            <div className="space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="text-xs font-black text-slate-100 leading-tight">
                                  {language === 'ar' ? template.nameAr : template.nameEn}
                                </div>
                                <span className="text-[9px] uppercase tracking-widest text-emerald-300 font-mono">{template.category}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 leading-relaxed">
                                {language === 'ar' ? template.descAr : template.descEn}
                              </div>
                            </div>

                            <button
                              onClick={() => applyTemplateSections(template.sections, 'تم تطبيق قالب الصفحة بنجاح', 'Page template applied successfully')}
                              className="w-full rounded-md border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-200 text-[10px] font-bold py-2 cursor-pointer transition-colors"
                            >
                              {t('تطبيق على الصفحة الحالية', 'Apply to current page')}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {libraryActiveSubTab === 'custom' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-200 px-1">{t('الأقسام المخصصة', 'Custom Sections')}</div>
                  {customSectionTemplates.length === 0 ? (
                    <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3 text-[10px] text-slate-500 text-center">
                      {t('لا توجد أقسام مخصصة محفوظة بعد.', 'No custom sections saved yet.')}
                    </div>
                  ) : (
                    customSectionTemplates.map((template) => (
                      <div key={template.key} className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 space-y-2">
                        <div className="text-xs font-black text-slate-100">{language === 'ar' ? template.nameAr : template.nameEn}</div>
                        <div className="text-[10px] text-slate-500 leading-relaxed">{language === 'ar' ? template.descAr : template.descEn}</div>
                        <button
                          onClick={() => appendTemplateSections([template.sectionData], 'تم إدراج القالب المخصص بنجاح', 'Custom section inserted successfully')}
                          className="w-full rounded-md border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-200 text-[10px] font-bold py-2 cursor-pointer transition-colors"
                        >
                          {t('إدراج القسم', 'Insert section')}
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-200 px-1">{t('الصفحات المخصصة', 'Custom Pages')}</div>
                  {customPageTemplates.length === 0 ? (
                    <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3 text-[10px] text-slate-500 text-center">
                      {t('لا توجد صفحات مخصصة محفوظة بعد.', 'No custom pages saved yet.')}
                    </div>
                  ) : (
                    customPageTemplates.map((template) => (
                      <div key={template.key} className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 space-y-2">
                        <div className="text-xs font-black text-slate-100">{language === 'ar' ? template.nameAr : template.nameEn}</div>
                        <div className="text-[10px] text-slate-500 leading-relaxed">{language === 'ar' ? template.descAr : template.descEn}</div>
                        <button
                          onClick={() => applyTemplateSections(template.sections, 'تم تطبيق القالب المخصص بنجاح', 'Custom page template applied successfully')}
                          className="w-full rounded-md border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-200 text-[10px] font-bold py-2 cursor-pointer transition-colors"
                        >
                          {t('تطبيق على الصفحة الحالية', 'Apply to current page')}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. DESIGN BRANDING SYSTEM (Identity parameters) */}
        {sidebarActiveTab === 'design_system' && (
          <div className="w-full h-full flex flex-col">
            <DesignSystemManager
              language={language}
              activeConfig={designSystem}
              onChange={(updated) => setDesignSystem(updated)}
              forcedSection={designSystemActiveSubTab}
            />
          </div>
        )}

        {/* 5. REUSABLE SYMBOLS */}
        {sidebarActiveTab === 'components' && (
          <div className="p-1">
            <ReusableComponentsManager
              language={language}
              filterType={symbolActiveSubTab}
              onPickSection={(secData) => {
                if (selectedPage) {
                  const clonedSec = cloneSection(secData);
                  setSelectedPage({ ...selectedPage, sections: [...selectedPage.sections, clonedSec] });
                  triggerNotice(t('تم إدراج القسم المشترك بنجاح!', 'Shared Symbol Section inserted successfully!'));
                }
              }}
              onPickWidget={(wData) => {
                if (selectedColId) {
                  addWidget(selectedSectionId!, selectedRowId!, selectedColId!, wData.type, wData.settings);
                  triggerNotice(t('تم إدراج الويدجت المشترك بنجاح!', 'Shared Symbol Widget inserted successfully!'));
                } else {
                  triggerNotice(t('يرجى اختيار عمود من الشجرة لإدراج الويدجت فيه', 'Please select a column in the page layout tree first'));
                }
              }}
            />
          </div>
        )}

        {/* 6. MEDIA ASSET STORAGE */}
        {sidebarActiveTab === 'assets' && (
          <div className="p-3">
            <AssetManager
              language={language}
              onSelectAsset={(url) => {
                triggerNotice(t('تم نسخ رابط الصورة بنجاح! انسخ الرابط في مربع الخصائص.', 'Asset URL selected! Copy the link and paste inside your image widget details settings.'));
              }}
            />
          </div>
        )}

        {/* 7.备份 RESTORE DRAFTS RESTORATION */}
        {sidebarActiveTab === 'backups' && (
          <div className="py-2.5">
            <div className="space-y-2.5 p-3.5">
              {versions.length === 0 ? (
                <div className="text-slate-500 text-[10px] text-center font-bold font-serif py-6 bg-slate-900/20 border border-slate-900 rounded-lg">
                  {t('لا توجد نسخ سابقة حتى الآن. سيقوم النظام بحفظ نسخة عند كل ضغط على المزامنة.', 'No older backup sessions logged yet. Auto logs update upon saving.')}
                </div>
              ) : (
                versions.map((ver) => (
                  <div 
                    key={ver.id}
                    className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg flex items-center justify-between text-[11px] gap-2 hover:border-slate-750 transition-colors"
                  >
                    <div className="space-y-1 truncate text-right flex-1 select-text">
                      <span className="block font-black text-slate-300 truncate">{ver.versionName}</span>
                      <span className="block text-[9px] text-slate-500">{new Date(ver.createdAt).toLocaleString('ar-EG')}</span>
                    </div>

                    <button
                      onClick={() => handleRestoreVersion(ver.id)}
                      className="px-2.5 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 rounded text-[9.5px] text-indigo-300 font-bold cursor-pointer transition-all active:scale-95 shrink-0"
                    >
                      {t('استعادة', 'Restore')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
};
