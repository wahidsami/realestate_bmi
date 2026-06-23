/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Type, 
  Flame, 
  RotateCcw, 
  Save, 
  ChevronRight, 
  Sparkles, 
  Check, 
  Sliders, 
  PlusCircle, 
  Trash2,
  Box,
  CornerDownRight,
  Sun,
  Moon,
  Library
} from 'lucide-react';
import { apiClient } from '@bina/shared';

export interface VisualDesignSystem {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
    cardBg: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  typography: {
    headingWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
    bodyWeight: 'normal' | 'medium' | 'semibold' | 'bold';
    headingLetterSpacing: string;
    headingLineHeight: string;
  };
  buttons: {
    radius: string;
    paddingY: string;
    paddingX: string;
    borderWidth: string;
    shadow: 'none' | 'sm' | 'md' | 'lg' | 'glow';
    hoverStyle: 'none' | 'lift' | 'scale' | 'glow';
  };
  inputs: {
    radius: string;
    bg: string;
    border: string;
    paddingY: string;
  };
  cards: {
    radius: string;
    bg: string;
    border: string;
    shadow: 'none' | 'soft' | 'sharp' | 'luxury';
    padding: string;
  };
  borderRadius: {
    global: string;
  };
  spacing: {
    sectionPaddingY: 'none' | 'small' | 'medium' | 'large';
  };
}

// 5 High-Quality Built-In Enterpise Theme Presets
export const SYSTEM_THEME_PRESETS: VisualDesignSystem[] = [
  {
    id: 'golden_luxury',
    name: 'العقاري الذهبي / Golden Luxury',
    colors: {
      primary: '#0B0F19',
      secondary: '#1A2333',
      accent: '#D4AF37',
      background: '#04060A',
      text: '#F1F5F9',
      border: '#D4AF3740',
      cardBg: '#0E1420'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
      mono: 'JetBrains Mono'
    },
    typography: {
      headingWeight: 'bold',
      bodyWeight: 'normal',
      headingLetterSpacing: '-0.02em',
      headingLineHeight: '1.2'
    },
    buttons: {
      radius: '6px',
      paddingY: '10px',
      paddingX: '20px',
      borderWidth: '1px',
      shadow: 'glow',
      hoverStyle: 'lift'
    },
    inputs: {
      radius: '6px',
      bg: '#0E1420',
      border: '#D4AF3730',
      paddingY: '10px'
    },
    cards: {
      radius: '12px',
      bg: '#0E1420',
      border: '#D4AF3720',
      shadow: 'luxury',
      padding: '24px'
    },
    borderRadius: {
      global: '12px'
    },
    spacing: {
      sectionPaddingY: 'medium'
    }
  },
  {
    id: 'emerald_oasis',
    name: 'الواحة الزمردية / Emerald Oasis',
    colors: {
      primary: '#064E3B',
      secondary: '#022C22',
      accent: '#10B981',
      background: '#F0FDF4',
      text: '#062F21',
      border: '#10B98130',
      cardBg: '#FFFFFF'
    },
    fonts: {
      heading: 'Outfit',
      body: 'Inter',
      mono: 'Fira Code'
    },
    typography: {
      headingWeight: 'semibold',
      bodyWeight: 'normal',
      headingLetterSpacing: '0em',
      headingLineHeight: '1.3'
    },
    buttons: {
      radius: '12px',
      paddingY: '12px',
      paddingX: '24px',
      borderWidth: '0px',
      shadow: 'md',
      hoverStyle: 'scale'
    },
    inputs: {
      radius: '8px',
      bg: '#F9FAFB',
      border: '#10B98140',
      paddingY: '11px'
    },
    cards: {
      radius: '16px',
      bg: '#FFFFFF',
      border: '#10B98115',
      shadow: 'soft',
      padding: '28px'
    },
    borderRadius: {
      global: '16px'
    },
    spacing: {
      sectionPaddingY: 'medium'
    }
  },
  {
    id: 'cyberpunk_neon',
    name: 'المستقبل السيبراني / Cyberpunk Neon',
    colors: {
      primary: '#09090B',
      secondary: '#18181B',
      accent: '#FACC15',
      background: '#040405',
      text: '#F4F4F5',
      border: '#FACC1590',
      cardBg: '#121214'
    },
    fonts: {
      heading: 'Space Grotesk',
      body: 'JetBrains Mono',
      mono: 'JetBrains Mono'
    },
    typography: {
      headingWeight: 'black',
      bodyWeight: 'medium',
      headingLetterSpacing: '-0.04em',
      headingLineHeight: '1.1'
    },
    buttons: {
      radius: '0px',
      paddingY: '14px',
      paddingX: '28px',
      borderWidth: '2px',
      shadow: 'glow',
      hoverStyle: 'glow'
    },
    inputs: {
      radius: '0px',
      bg: '#18181B',
      border: '#FACC1570',
      paddingY: '12px'
    },
    cards: {
      radius: '0px',
      bg: '#121214',
      border: '#FACC1550',
      shadow: 'sharp',
      padding: '24px'
    },
    borderRadius: {
      global: '0px'
    },
    spacing: {
      sectionPaddingY: 'large'
    }
  },
  {
    id: 'corporate_slate',
    name: 'الأناقة الكلاسيكية / Clean Corporate',
    colors: {
      primary: '#1E3A8A',
      secondary: '#1E293B',
      accent: '#2563EB',
      background: '#F8FAFC',
      text: '#0F172A',
      border: '#E2E8F0',
      cardBg: '#FFFFFF'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
      mono: 'Fira Code'
    },
    typography: {
      headingWeight: 'bold',
      bodyWeight: 'normal',
      headingLetterSpacing: '-0.01em',
      headingLineHeight: '1.25'
    },
    buttons: {
      radius: '8px',
      paddingY: '10px',
      paddingX: '22px',
      borderWidth: '1px',
      shadow: 'sm',
      hoverStyle: 'lift'
    },
    inputs: {
      radius: '6px',
      bg: '#FFFFFF',
      border: '#CBD5E1',
      paddingY: '10px'
    },
    cards: {
      radius: '8px',
      bg: '#FFFFFF',
      border: '#E2E8F0',
      shadow: 'soft',
      padding: '20px'
    },
    borderRadius: {
      global: '8px'
    },
    spacing: {
      sectionPaddingY: 'small'
    }
  },
  {
    id: 'warm_terracotta',
    name: 'التراب الدافئ / Warm Terracotta',
    colors: {
      primary: '#7C2D12',
      secondary: '#431407',
      accent: '#EA580C',
      background: '#FFFDF9',
      text: '#29140A',
      border: '#EA580C30',
      cardBg: '#FFFDF9'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Outfit',
      mono: 'JetBrains Mono'
    },
    typography: {
      headingWeight: 'medium',
      bodyWeight: 'normal',
      headingLetterSpacing: '0.01em',
      headingLineHeight: '1.35'
    },
    buttons: {
      radius: '30px',
      paddingY: '12px',
      paddingX: '26px',
      borderWidth: '0px',
      shadow: 'md',
      hoverStyle: 'scale'
    },
    inputs: {
      radius: '20px',
      bg: '#FAF5ED',
      border: '#EA580C40',
      paddingY: '10px'
    },
    cards: {
      radius: '24px',
      bg: '#FAF4EB',
      border: '#EA580C10',
      shadow: 'soft',
      padding: '32px'
    },
    borderRadius: {
      global: '24px'
    },
    spacing: {
      sectionPaddingY: 'medium'
    }
  }
];

const LOCAL_STORAGE_DESIGN_SYSTEM_KEY = 'bina_edarah_active_design_system';
const BUILDER_ASSET_KIND = 'design_theme';

type PersistedVisualDesignSystem = VisualDesignSystem & {
  recordId?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const unwrapBuilderAssetList = (response: unknown): PersistedVisualDesignSystem[] => {
  if (!isRecord(response)) return [];
  const data = isRecord(response.data) ? response.data : response;
  const items = Array.isArray((data as any).data)
    ? (data as any).data
    : Array.isArray((data as any).items)
      ? (data as any).items
      : Array.isArray((data as any))
        ? (data as any)
        : [];
  return items.map((item: any) => ({
    ...(item.data as VisualDesignSystem),
    recordId: item.id,
  }));
};

interface DesignSystemManagerProps {
  language: 'ar' | 'en';
  activeConfig: VisualDesignSystem;
  onChange: (updatedConfig: VisualDesignSystem) => void;
  forcedSection?: 'preset' | 'colors' | 'fonts' | 'elements' | 'custom';
}

export const DesignSystemManager: React.FC<DesignSystemManagerProps> = ({
  language,
  activeConfig,
  onChange,
  forcedSection,
}) => {
  const [activeSection, setActiveSection] = useState<'preset' | 'colors' | 'fonts' | 'elements' | 'custom'>('preset');
  const [saveThemeName, setSaveThemeName] = useState('');
  const [customThemes, setCustomThemes] = useState<PersistedVisualDesignSystem[]>([]);

  useEffect(() => {
    if (forcedSection) {
      setActiveSection(forcedSection);
    }
  }, [forcedSection]);

  const t = (ar: string, en: string) => (language === 'ar' ? ar : en);

  // Load saved custom theme structures
  useEffect(() => {
    let cancelled = false;
    const loadThemes = async () => {
      if (!apiClient.enabled) {
        return;
      }
      try {
        const response = await apiClient.get('/builder-assets?kind=design_theme');
        const items = unwrapBuilderAssetList(response);
        if (!cancelled) {
          setCustomThemes(items);
        }
      } catch {
        if (!cancelled) {
          setCustomThemes([]);
        }
      }
    };
    loadThemes();
    return () => {
      cancelled = true;
    };
  }, []);

  // Update design system state variables helper
  const updateNestedProperty = (group: keyof VisualDesignSystem, key: string, value: any) => {
    const groupData = activeConfig[group] as any;
    const updatedGroup = {
      ...groupData,
      [key]: value
    };
    onChange({
      ...activeConfig,
      [group]: updatedGroup
    });
  };

  const selectTheme = (theme: VisualDesignSystem) => {
    onChange({
      ...theme,
      id: theme.id // Preserve ID
    });
  };

  const handleSaveTheme = () => {
    if (!saveThemeName.trim()) return;
    const newTheme: VisualDesignSystem = {
      ...JSON.parse(JSON.stringify(activeConfig)),
      id: `custom_theme_${Date.now()}`,
      name: saveThemeName
    };
    const updatedList = [...customThemes, { ...newTheme, recordId: newTheme.id }];
    setCustomThemes(updatedList);
    if (apiClient.enabled) {
      apiClient.post('/builder-assets', {
        id: newTheme.id,
        kind: BUILDER_ASSET_KIND,
        key: newTheme.id,
        nameAr: newTheme.name,
        nameEn: newTheme.name,
        data: newTheme,
      }).catch(() => undefined);
    }
    setSaveThemeName('');
  };

  const handleDeleteTheme = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedList = customThemes.filter(x => x.recordId !== id && x.id !== id);
    setCustomThemes(updatedList);
    if (apiClient.enabled) {
      apiClient.delete(`/builder-assets/${id}`).catch(() => undefined);
    }
  };

  // Google Fonts dynamic links load setup
  useEffect(() => {
    const fontNames = [
      activeConfig.fonts.heading,
      activeConfig.fonts.body,
      activeConfig.fonts.mono
    ].filter(Boolean);

    // Remove duplicates
    const uniqueFonts = Array.from(new Set(fontNames));
    const fontQuery = uniqueFonts.map(f => f.replace(/\s+/g, '+') + ':wght@300;400;500;600;700;800;900').join('&family=');
    
    if (fontQuery) {
      const url = `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`;
      const elementId = 'dynamic-design-system-fonts';
      let linkElement = document.getElementById(elementId) as HTMLLinkElement;
      
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.id = elementId;
        linkElement.rel = 'stylesheet';
        document.head.appendChild(linkElement);
      }
      linkElement.href = url;
    }
  }, [activeConfig.fonts.heading, activeConfig.fonts.body, activeConfig.fonts.mono]);

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans text-slate-200">
      
      {/* Category Selection Sidebar Tabs */}
      {!forcedSection && (
        <div className="grid grid-cols-5 border-b border-slate-800 bg-slate-900/60 p-1 divide-x divide-slate-800 shrink-0">
          <button
            onClick={() => setActiveSection('preset')}
            className={`py-2 text-[10px] font-black tracking-wide flex flex-col items-center gap-1 cursor-pointer transition-all rounded ${
              activeSection === 'preset' ? 'text-[#D4AF37] bg-slate-900/90 shadow-sm border border-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={t('سمات مسبقة', 'Theme Presets')}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{t('سمة', 'Themes')}</span>
          </button>

          <button
            onClick={() => setActiveSection('colors')}
            className={`py-2 text-[10px] font-black tracking-wide flex flex-col items-center gap-1 cursor-pointer transition-all rounded ${
              activeSection === 'colors' ? 'text-[#D4AF37] bg-slate-900/90 shadow-sm border border-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={t('ألوان البراند', 'Colors')}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t('ألوان', 'Colors')}</span>
          </button>

          <button
            onClick={() => setActiveSection('fonts')}
            className={`py-2 text-[10px] font-black tracking-wide flex flex-col items-center gap-1 cursor-pointer transition-all rounded ${
              activeSection === 'fonts' ? 'text-[#D4AF37] bg-slate-900/90 shadow-sm border border-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={t('الخطوط والحروف', 'Typography')}
          >
            <Type className="w-3.5 h-3.5" />
            <span>{t('خطوط', 'Fonts')}</span>
          </button>

          <button
            onClick={() => setActiveSection('elements')}
            className={`py-2 text-[10px] font-black tracking-wide flex flex-col items-center gap-1 cursor-pointer transition-all rounded ${
              activeSection === 'elements' ? 'text-[#D4AF37] bg-slate-900/90 shadow-sm border border-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={t('تخصيص العناصر الدقيقة', 'Component Styling presets')}
          >
            <Box className="w-3.5 h-3.5" />
            <span>{t('أزرار/بطاقات', 'Presets')}</span>
          </button>

          <button
            onClick={() => setActiveSection('custom')}
            className={`py-2 text-[10px] font-black tracking-wide flex flex-col items-center gap-1 cursor-pointer transition-all rounded ${
              activeSection === 'custom' ? 'text-[#D4AF37] bg-slate-900/90 shadow-sm border border-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={t('القوالب المحفوظة', 'Save Theme Templates')}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t('مخصص', 'Custom')}</span>
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-right">
        
        {/* TAB 1: ENTERPRISE THEMES PRESETS */}
        {activeSection === 'preset' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              {t('سمات مخصصة جاهزة للمشروع', 'Enterprise Brand Theme Presets')}
            </h3>
            
            <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
              {t(
                'اختر سمة تجارية متكاملة تغير الألوان والخطوط والأزرار والبطاقات على الفور لتناسب فئة تطلعات عملائك.',
                'Switch brand styles in one click. Overrides CSS variables to cascade colors and button designs across pages.'
              )}
            </p>

            <div className="grid grid-cols-1 gap-3 pt-2">
              {SYSTEM_THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => selectTheme(preset)}
                  className={`p-3.5 rounded-xl border text-right transition-all flex flex-col gap-2 relative cursor-pointer group ${
                    activeConfig.id === preset.id
                      ? 'bg-slate-900/90 border-[#D4AF37] shadow-lg shadow-yellow-950/20'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-black text-white group-hover:text-[#D4AF37] transition-all">
                      {preset.name}
                    </span>
                    {activeConfig.id === preset.id && (
                      <Check className="w-4 h-4 text-[#D4AF37] self-start" />
                    )}
                  </div>
                  
                  {/* Colors Preview */}
                  <div className="flex gap-1.5 pt-1">
                    <div className="w-4 h-4 rounded-full border border-slate-700" style={{ backgroundColor: preset.colors.primary }} title="Primary" />
                    <div className="w-4 h-4 rounded-full border border-slate-700" style={{ backgroundColor: preset.colors.secondary }} title="Secondary" />
                    <div className="w-4 h-4 rounded-full border border-slate-700" style={{ backgroundColor: preset.colors.accent }} title="Accent" />
                    <div className="w-4 h-4 rounded-full border border-slate-700" style={{ backgroundColor: preset.colors.background }} title="Background" />
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex justify-between items-center w-full text-[9px] text-slate-500 font-mono mt-1 pt-2 border-t border-slate-900">
                    <span>Font: {preset.fonts.heading} / {preset.fonts.body}</span>
                    <span>Radius: {preset.buttons.radius}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: GLOBAL COLORS SCENE */}
        {activeSection === 'colors' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              {t('منظومة ألوان الهوية الرياضية والذهبية', 'Global Brand Identity Colors')}
            </h3>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              {t(
                'سيتم ترحيل هذه الألوان تلقائياً إلى كافة الـ Widgets والـ Buttons المرتبطة بها لضمان دقة وتطابق الهوية التجارية.',
                'Cascading colors automatically linked with variable overrides across visual sections and lists.'
              )}
            </p>

            <div className="space-y-3.5 pt-2">
              {/* Primary Color */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400 font-mono">{activeConfig.colors.primary}</span>
                  <label className="text-slate-300">{t('اللون الأساسي / Primary Color', 'Primary Brand Color')}</label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={activeConfig.colors.primary}
                    onChange={(e) => updateNestedProperty('colors', 'primary', e.target.value)}
                    className="w-12 h-9 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={activeConfig.colors.primary}
                    onChange={(e) => updateNestedProperty('colors', 'primary', e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-850 rounded-lg text-xs font-mono text-center text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400 font-mono">{activeConfig.colors.secondary}</span>
                  <label className="text-slate-300">{t('اللون الثانوي / Secondary Color', 'Secondary Color')}</label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={activeConfig.colors.secondary}
                    onChange={(e) => updateNestedProperty('colors', 'secondary', e.target.value)}
                    className="w-12 h-9 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={activeConfig.colors.secondary}
                    onChange={(e) => updateNestedProperty('colors', 'secondary', e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-850 rounded-lg text-xs font-mono text-center text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Accent (Gold/Highlight) Color */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400 font-mono">{activeConfig.colors.accent}</span>
                  <label className="text-slate-300">{t('لون التمييز / Accent Accent Color', 'Brand Highlight / Accent')}</label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={activeConfig.colors.accent}
                    onChange={(e) => updateNestedProperty('colors', 'accent', e.target.value)}
                    className="w-12 h-9 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={activeConfig.colors.accent}
                    onChange={(e) => updateNestedProperty('colors', 'accent', e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-850 rounded-lg text-xs font-mono text-center text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Background Backdrop Color */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400 font-mono">{activeConfig.colors.background}</span>
                  <label className="text-slate-300">{t('خلفية الصفحات / Page Background', 'Canvas Background Backdrop')}</label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={activeConfig.colors.background}
                    onChange={(e) => updateNestedProperty('colors', 'background', e.target.value)}
                    className="w-12 h-9 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={activeConfig.colors.background}
                    onChange={(e) => updateNestedProperty('colors', 'background', e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-850 rounded-lg text-xs font-mono text-center text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Global Text Main Color */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400 font-mono">{activeConfig.colors.text}</span>
                  <label className="text-slate-300">{t('لون النصوص الأساسي / Body Text', 'Global Typography Ink Color')}</label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={activeConfig.colors.text}
                    onChange={(e) => updateNestedProperty('colors', 'text', e.target.value)}
                    className="w-12 h-9 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={activeConfig.colors.text}
                    onChange={(e) => updateNestedProperty('colors', 'text', e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-850 rounded-lg text-xs font-mono text-center text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Elements Border Color */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400 font-mono">{activeConfig.colors.border}</span>
                  <label className="text-slate-300">{t('الحدود والخطوط الفاصلة / Global Borders', 'Divider & Outline Borders')}</label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={activeConfig.colors.border.substring(0, 7)}
                    onChange={(e) => updateNestedProperty('colors', 'border', e.target.value)}
                    className="w-12 h-9 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={activeConfig.colors.border}
                    onChange={(e) => updateNestedProperty('colors', 'border', e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-850 rounded-lg text-xs font-mono text-center text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GLOBAL FONTS & TYPOGRAPHY */}
        {activeSection === 'fonts' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              {t('إدارة الخطوط والمظهر المطبعي', 'Global Typography & Font Families')}
            </h3>

            <div className="space-y-4 pt-2">
              {/* Heading Font Selection */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 block font-bold">{t('خط العناوين الرئيسية والفرعية', 'Headings Display Font')}</label>
                <select
                  value={activeConfig.fonts.heading}
                  onChange={(e) => updateNestedProperty('fonts', 'heading', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] text-right font-sans"
                >
                  <option value="Inter">Inter (سويسري نظيف)</option>
                  <option value="Playfair Display">Playfair Display (فاخر وفخم)</option>
                  <option value="Space Grotesk">Space Grotesk (تقني حديث)</option>
                  <option value="Outfit">Outfit (دائري ناعم)</option>
                  <option value="Montserrat">Montserrat (بلدوزر رسمي)</option>
                  <option value="Cinzel">Cinzel (روماني كلاسيكي)</option>
                </select>
              </div>

              {/* Body Font Selection */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 block font-bold">{t('خط نصوص القراءة والفقرات', 'Body Text Paragraph Font')}</label>
                <select
                  value={activeConfig.fonts.body}
                  onChange={(e) => updateNestedProperty('fonts', 'body', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] text-right font-sans"
                >
                  <option value="Inter">Inter (عالمي ممتاز)</option>
                  <option value="Outfit">Outfit (أنيق حديث)</option>
                  <option value="Montserrat">Montserrat (قوي وواضح)</option>
                  <option value="Playfair Display">Playfair Display (سيريف أنيق)</option>
                </select>
              </div>

              {/* Mono Font Selection */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 block font-bold">{t('خط الأرقام والبيانات البرمجية', 'Data & Monospace Font')}</label>
                <select
                  value={activeConfig.fonts.mono}
                  onChange={(e) => updateNestedProperty('fonts', 'mono', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] text-right font-sans"
                >
                  <option value="JetBrains Mono">JetBrains Mono (عالي الوضوح)</option>
                  <option value="Fira Code">Fira Code (جميل متناسق)</option>
                </select>
              </div>

              {/* Heading Extra Parameters */}
              <div className="border-t border-slate-800/80 pt-3 space-y-3">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase block">{t('إعدادات ميكانيكا الحروف', 'Display Layout Tuning')}</span>
                
                {/* Weight */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-450 block">{t('سمك العناوين', 'Heading Font Weight')}</label>
                  <div className="grid grid-cols-5 gap-1">
                    {(['normal', 'medium', 'semibold', 'bold', 'black'] as const).map(w => (
                      <button
                        key={w}
                        onClick={() => updateNestedProperty('typography', 'headingWeight', w)}
                        className={`py-1 text-[9px] font-bold rounded capitalize cursor-pointer transition-all ${
                          activeConfig.typography.headingWeight === w ? 'bg-[#D4AF37] text-slate-950 font-black' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Letter Spacing & Line Height */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 block">{t('تباعد الحروف', 'Letter Spacing')}</label>
                    <select
                      value={activeConfig.typography.headingLetterSpacing}
                      onChange={(e) => updateNestedProperty('typography', 'headingLetterSpacing', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-white focus:outline-none"
                    >
                      <option value="-0.04em">Tightest (-0.04em)</option>
                      <option value="-0.02em">Tight (-0.02em)</option>
                      <option value="0em">Normal (0em)</option>
                      <option value="0.02em">Wide (0.02em)</option>
                      <option value="0.05em">Widest (0.05em)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 block">{t('ارتفاع السطر', 'Line Height')}</label>
                    <select
                      value={activeConfig.typography.headingLineHeight}
                      onChange={(e) => updateNestedProperty('typography', 'headingLineHeight', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-white focus:outline-none"
                    >
                      <option value="1.0">Tight (1.0)</option>
                      <option value="1.2">Compact (1.2)</option>
                      <option value="1.35">Elegant (1.35)</option>
                      <option value="1.5">Comfort (1.5)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMPONENT STYLING PRESETS (Buttons, Inputs, Cards) */}
        {activeSection === 'elements' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              {t('منظومة أزرار وبطاقات ومداخل الهوية', 'Component Preset Overrides')}
            </h3>

            {/* BUTTONS OVERRIDES */}
            <div className="space-y-3.5 bg-slate-900/30 p-3 rounded-xl border border-slate-850">
              <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider block flex items-center gap-1">
                <Sliders className="w-3 h-3" />
                {t('خصائص الأزرار العالمية', 'Global Button Style Preset')}
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">{t('انحناء الزاوية', 'Border Radius')}</label>
                  <select
                    value={activeConfig.buttons.radius}
                    onChange={(e) => updateNestedProperty('buttons', 'radius', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-white"
                  >
                    <option value="0px">Sharp Flat (0px)</option>
                    <option value="4px">Soft Sm (4px)</option>
                    <option value="8px">Standard Md (8px)</option>
                    <option value="12px">Curved Lg (12px)</option>
                    <option value="999px">Pill Oval (Pill)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">{t('قوة الظل المدمج', 'Shadow Effect')}</label>
                  <select
                    value={activeConfig.buttons.shadow}
                    onChange={(e) => updateNestedProperty('buttons', 'shadow', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-white"
                  >
                    <option value="none">No Shadow</option>
                    <option value="sm">Soft Inner (Sm)</option>
                    <option value="md">Elevated (Md)</option>
                    <option value="lg">Intense (Lg)</option>
                    <option value="glow">Luxury Gold Glow</option>
                  </select>
                </div>
              </div>

              {/* Hover effect selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400">{t('أسلوب الحركة عند التحويم', 'Interactive Hover Style')}</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['none', 'lift', 'scale', 'glow'] as const).map(eff => (
                    <button
                      key={eff}
                      onClick={() => updateNestedProperty('buttons', 'hoverStyle', eff)}
                      className={`py-1 text-[9px] font-bold rounded capitalize cursor-pointer transition-all ${
                        activeConfig.buttons.hoverStyle === eff ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {eff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CARDS OVERRIDES */}
            <div className="space-y-3.5 bg-slate-900/30 p-3 rounded-xl border border-slate-850">
              <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider block flex items-center gap-1">
                <Box className="w-3 h-3" />
                {t('خصائص البطاقات والحاويات العالمية', 'Global Card Style Preset')}
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">{t('زوايا الحاويات', 'Card Radius')}</label>
                  <select
                    value={activeConfig.cards.radius}
                    onChange={(e) => updateNestedProperty('cards', 'radius', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-white"
                  >
                    <option value="0px">Sharp Flat (0px)</option>
                    <option value="8px">Standard (8px)</option>
                    <option value="12px">Luxury Soft (12px)</option>
                    <option value="16px">Cozy (16px)</option>
                    <option value="24px">Oasis Bold (24px)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">{t('نمط الظل الخلفي', 'Shadow Style')}</label>
                  <select
                    value={activeConfig.cards.shadow}
                    onChange={(e) => updateNestedProperty('cards', 'shadow', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-white"
                  >
                    <option value="none">Flat None</option>
                    <option value="soft">Cosmo Ambient (Soft)</option>
                    <option value="sharp">Fine Border (Sharp)</option>
                    <option value="luxury">Luxury Gold Reflection</option>
                  </select>
                </div>
              </div>
            </div>

            {/* GLOBAL ROUNDNESS AND SPACING */}
            <div className="space-y-3 bg-slate-900/30 p-3 rounded-xl border border-slate-850">
              <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider block">{t('الضوابط العامة والمحيطية', 'Spacing & Global Scale')}</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">{t('درجة الانحناء العامة', 'Global Roundness')}</label>
                  <input
                    type="text"
                    value={activeConfig.borderRadius.global}
                    onChange={(e) => updateNestedProperty('borderRadius', 'global', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-center font-mono text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">{t('فراغات الأقسام الرئيسية', 'Section Padding Y')}</label>
                  <select
                    value={activeConfig.spacing.sectionPaddingY}
                    onChange={(e) => updateNestedProperty('spacing', 'sectionPaddingY', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-white"
                  >
                    <option value="none">Dense (0px)</option>
                    <option value="small">Cozy Tight (40px)</option>
                    <option value="medium">Standard Corporate (80px)</option>
                    <option value="large">Cinematic Wide (120px)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CUSTOM THEMES SAVER */}
        {activeSection === 'custom' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              {t('حفظ سمة مخصصة كعناصر تجارية مستقلة', 'Save Custom Brand Preset')}
            </h3>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              {t(
                'احفظ السمة والتنسيق اللوني الحالي بالكامل لتسهيل إعادة تفعيله أو استدعائه لاحقاً بضغطة واحدة.',
                'Saves your entire custom colors and typography palette as an easily selectable brand preset in browser local index.'
              )}
            </p>

            {/* Save Form */}
            <div className="space-y-2 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <label className="text-[10px] text-slate-300 block font-bold">{t('اسم السمة المخصصة الجديدة', 'Theme Preset Name')}</label>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveTheme}
                  disabled={!saveThemeName.trim()}
                  className="px-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-850 disabled:text-slate-500 text-white font-bold text-xs rounded transition-all cursor-pointer"
                >
                  {t('حفظ', 'Save')}
                </button>
                <input
                  type="text"
                  placeholder={t('مثال: الهوية الصيفية الزاهية', 'e.g. Elegant Sapphire Premium')}
                  value={saveThemeName}
                  onChange={(e) => setSaveThemeName(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-right text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Custom Theme List */}
            {customThemes.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <span className="text-[10px] text-teal-400 font-extrabold uppercase block">{t('السمات المخصصة المحفوظة', 'Your Saved Custom Themes')}</span>
                
                <div className="grid grid-cols-1 gap-2">
                  {customThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => selectTheme(theme)}
                      className={`p-3 rounded-lg border text-right transition-all flex items-center justify-between group ${
                        activeConfig.name === theme.name
                          ? 'bg-slate-900 border-indigo-500'
                          : 'bg-slate-900/30 border-slate-800 hover:bg-slate-900/60'
                      }`}
                    >
                      <button
                      onClick={(e) => handleDeleteTheme(theme.recordId || theme.id, e)}
                        className="p-1 text-slate-500 hover:text-rose-500 rounded cursor-pointer transition-all"
                        title={t('حذف', 'Delete Theme')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-xs text-slate-300 font-bold pr-2">
                        {theme.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
      
    </div>
  );
};

// Generates the comprehensive :root dynamic CSS rules mapping to standard Tailwind style variables
export const generateGlobalCSSRules = (ds: VisualDesignSystem): string => {
  // Resolve Font Fallbacks simple handling
  const resolveFont = (family: string) => {
    if (family === 'Playfair Display') return `'Playfair Display', Georgia, serif`;
    if (family === 'Space Grotesk') return `'Space Grotesk', sans-serif`;
    if (family === 'Outfit') return `'Outfit', sans-serif`;
    if (family === 'Cinzel') return `'Cinzel', Garamond, serif`;
    if (family === 'JetBrains Mono') return `'JetBrains Mono', monospace`;
    if (family === 'Fira Code') return `'Fira Code', monospace`;
    return `'Inter', 'Helvetica Neue', Arial, sans-serif`;
  };

  // Resolve Padding spacing
  const sectionPadding = ds.spacing.sectionPaddingY === 'none' 
    ? '0px' 
    : ds.spacing.sectionPaddingY === 'small' 
    ? '40px' 
    : ds.spacing.sectionPaddingY === 'medium' 
    ? '80px' 
    : '120px';

  // Resolve weights
  const resolveWeightValue = (weight: string) => {
    switch(weight) {
      case 'normal': return '400';
      case 'medium': return '500';
      case 'semibold': return '600';
      case 'bold': return '700';
      case 'black': return '900';
      default: return '400';
    }
  };

  // Resolve shadows
  const getButtonShadowCSS = (shad: string) => {
    if (shad === 'sm') return '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    if (shad === 'md') return '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)';
    if (shad === 'lg') return '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.2)';
    if (shad === 'glow') return `0 0 12px 1px ${ds.colors.accent}60`;
    return 'none';
  };

  const getCardShadowCSS = (shad: string) => {
    if (shad === 'soft') return '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 5px 15px -3px rgba(0, 0, 0, 0.03)';
    if (shad === 'sharp') return `2px 2px 0px 0px ${ds.colors.accent}40`;
    if (shad === 'luxury') return `0 15px 40px -4px rgba(0, 0, 0, 0.15), 0 0 20px 2px ${ds.colors.accent}15`;
    return 'none';
  };

  return `
    :root {
      /* Colors */
      --global-color-primary: ${ds.colors.primary};
      --global-color-secondary: ${ds.colors.secondary};
      --global-color-accent: ${ds.colors.accent};
      --global-color-background: ${ds.colors.background};
      --global-color-text: ${ds.colors.text};
      --global-color-border: ${ds.colors.border};
      --global-color-card-bg: ${ds.colors.cardBg};

      /* Fonts */
      --font-heading: ${resolveFont(ds.fonts.heading)};
      --font-body: ${resolveFont(ds.fonts.body)};
      --font-mono: ${resolveFont(ds.fonts.mono)};

      /* Typography */
      --heading-weight: ${resolveWeightValue(ds.typography.headingWeight)};
      --body-weight: ${resolveWeightValue(ds.typography.bodyWeight)};
      --heading-letter-spacing: ${ds.typography.headingLetterSpacing};
      --heading-line-height: ${ds.typography.headingLineHeight};

      /* Buttons Settings */
      --button-radius: ${ds.buttons.radius};
      --button-padding-y: ${ds.buttons.paddingY};
      --button-padding-x: ${ds.buttons.paddingX};
      --button-border-width: ${ds.buttons.borderWidth};
      --button-shadow: ${getButtonShadowCSS(ds.buttons.shadow)};
      --button-hover-transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      /* Inputs Settings */
      --input-radius: ${ds.inputs.radius};
      --input-bg: ${ds.inputs.bg};
      --input-border: ${ds.inputs.border};
      --input-padding-y: ${ds.inputs.paddingY};

      /* Cards Settings */
      --card-radius: ${ds.cards.radius};
      --card-bg: ${ds.cards.bg};
      --card-border: ${ds.cards.border};
      --card-shadow: ${getCardShadowCSS(ds.cards.shadow)};
      --card-padding: ${ds.cards.padding};

      /* Spacing Scale & Radius */
      --global-radius: ${ds.borderRadius.global};
      --global-section-padding-y: ${sectionPadding};
    }

    /* Inject Class bindings seamlessly for visual rendering outputs */
    .theme-headings {
      font-family: var(--font-heading) !important;
      font-weight: var(--heading-weight) !important;
      letter-spacing: var(--heading-letter-spacing) !important;
      line-height: var(--heading-line-height) !important;
    }

    .theme-body {
      font-family: var(--font-body) !important;
      font-weight: var(--body-weight) !important;
    }

    .theme-mono {
      font-family: var(--font-mono) !important;
    }

    /* Enterprise Component Presets Styles */
    .ds-button-primary {
      background-color: var(--global-color-accent) !important;
      color: var(--global-color-primary) !important;
      font-family: var(--font-heading) !important;
      font-weight: bold !important;
      border-radius: var(--button-radius) !important;
      padding-top: var(--button-padding-y) !important;
      padding-bottom: var(--button-padding-y) !important;
      padding-left: var(--button-padding-x) !important;
      padding-right: var(--button-padding-x) !important;
      border: var(--button-border-width) solid var(--global-color-accent) !important;
      box-shadow: var(--button-shadow) !important;
      transition: var(--button-hover-transition) !important;
    }
    
    .ds-button-primary:hover {
      opacity: 0.95 !important;
      ${ds.buttons.hoverStyle === 'lift' ? 'transform: translateY(-2px) !important; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3) !important;' : ''}
      ${ds.buttons.hoverStyle === 'scale' ? 'transform: scale(1.03) !important;' : ''}
      ${ds.buttons.hoverStyle === 'glow' ? 'box-shadow: 0 0 18px 4px var(--global-color-accent) !important;' : ''}
    }

    .ds-button-secondary {
      background-color: transparent !important;
      color: var(--global-color-text) !important;
      font-family: var(--font-heading) !important;
      font-weight: 500 !important;
      border-radius: var(--button-radius) !important;
      padding-top: var(--button-padding-y) !important;
      padding-bottom: var(--button-padding-y) !important;
      padding-left: var(--button-padding-x) !important;
      padding-right: var(--button-padding-x) !important;
      border: 1px solid var(--global-color-border) !important;
      transition: var(--button-hover-transition) !important;
    }

    .ds-button-secondary:hover {
      background-color: var(--global-color-border) !important;
      color: var(--global-color-primary) !important;
    }

    .ds-input {
      font-family: var(--font-body) !important;
      background-color: var(--input-bg) !important;
      border: 1px solid var(--input-border) !important;
      border-radius: var(--input-radius) !important;
      padding-top: var(--input-padding-y) !important;
      padding-bottom: var(--input-padding-y) !important;
      color: var(--global-color-text) !important;
      transition: var(--button-hover-transition) !important;
    }

    .ds-input:focus {
      outline: none !important;
      border-color: var(--global-color-accent) !important;
      box-shadow: 0 0 0 2px var(--global-color-accent)30 !important;
    }

    .ds-card {
      background-color: var(--global-color-card-bg) !important;
      border: 1px solid var(--card-border) !important;
      border-radius: var(--card-radius) !important;
      box-shadow: var(--card-shadow) !important;
      padding: var(--card-padding) !important;
    }

    .ds-section-padding {
      padding-top: var(--global-section-padding-y) !important;
      padding-bottom: var(--global-section-padding-y) !important;
    }
  `;
};
