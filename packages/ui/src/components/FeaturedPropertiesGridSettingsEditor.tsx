import React from 'react';
import { Sliders } from 'lucide-react';
import { VisualWidget } from '../types';

interface FeaturedPropertiesGridSettingsEditorProps {
  currentWidget: VisualWidget;
  handleUpdateElementSetting: (key: string, val: any, isWidget: boolean) => void;
  language: 'ar' | 'en';
}

export const FeaturedPropertiesGridSettingsEditor: React.FC<FeaturedPropertiesGridSettingsEditorProps> = ({
  currentWidget,
  handleUpdateElementSetting,
  language,
}) => {
  const settings = currentWidget.settings || {};
  const t = (ar: string, en: string) => (language === 'ar' ? ar : en);

  const updateSetting = (key: string, value: any) => {
    handleUpdateElementSetting(key, value, true);
  };

  return (
    <div className="space-y-4 font-sans text-right text-xs">
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-3">
        <h4 className="text-[11px] font-black text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{t('مكتبة العقارات المميزة', 'Featured Properties Grid')}</span>
        </h4>

        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1.5">
            <label className="text-[9.5px] text-slate-400 font-bold block">
              {t('العنوان الرئيسي', 'Section Title')}
            </label>
            <input
              type="text"
              value={settings.titleAr || 'العقارات المميزة'}
              onChange={(e) => updateSetting('titleAr', e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs"
              placeholder={t('العقارات المميزة', 'Featured Properties')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9.5px] text-slate-400 font-bold block">
              {t('العنوان الإنجليزي', 'English Title')}
            </label>
            <input
              type="text"
              value={settings.titleEn || 'Featured Properties'}
              onChange={(e) => updateSetting('titleEn', e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs"
              placeholder={t('Featured Properties', 'Featured Properties')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9.5px] text-slate-400 font-bold block">
              {t('الوصف الفرعي', 'Subtitle')}
            </label>
            <textarea
              rows={3}
              value={settings.subtitleAr || 'استعرض أفضل الوحدات العقارية المتاحة حالياً'}
              onChange={(e) => updateSetting('subtitleAr', e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs"
              placeholder={t('اكتب وصفاً قصيراً...', 'Write a short description...')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9.5px] text-slate-400 font-bold block">
              {t('الوصف الإنجليزي', 'English Subtitle')}
            </label>
            <textarea
              rows={3}
              value={settings.subtitleEn || 'Explore our hand-picked inventory of premium residences'}
              onChange={(e) => updateSetting('subtitleEn', e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs"
              placeholder={t('Write a short description...', 'Write a short description...')}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-[9.5px] text-slate-400 font-bold block">
                {t('عدد البطاقات', 'Card Limit')}
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={settings.limit || 6}
                onChange={(e) => updateSetting('limit', parseInt(e.target.value, 10) || 6)}
                className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9.5px] text-slate-400 font-bold block">
                {t('أعمدة سطح المكتب', 'Desktop Columns')}
              </label>
              <select
                value={settings.columnsDesktop || 3}
                onChange={(e) => updateSetting('columnsDesktop', parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs"
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-[9.5px] text-slate-400 font-bold block">
                {t('عرض العقارات المميزة فقط', 'Featured Only')}
              </label>
              <select
                value={settings.showFeaturedOnly === false ? 'false' : 'true'}
                onChange={(e) => updateSetting('showFeaturedOnly', e.target.value === 'true')}
                className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs"
              >
                <option value="true">{t('نعم', 'Yes')}</option>
                <option value="false">{t('لا', 'No')}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9.5px] text-slate-400 font-bold block">
                {t('إظهار السعر', 'Show Price')}
              </label>
              <select
                value={settings.showPrice === false ? 'false' : 'true'}
                onChange={(e) => updateSetting('showPrice', e.target.value === 'true')}
                className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs"
              >
                <option value="true">{t('نعم', 'Yes')}</option>
                <option value="false">{t('لا', 'No')}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9.5px] text-slate-400 font-bold block">
              {t('إظهار المواصفات', 'Show Specs')}
            </label>
            <select
              value={settings.showSpecs === false ? 'false' : 'true'}
              onChange={(e) => updateSetting('showSpecs', e.target.value === 'true')}
              className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs"
            >
              <option value="true">{t('نعم', 'Yes')}</option>
              <option value="false">{t('لا', 'No')}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-[9.5px] text-slate-400 font-bold block">
                {t('نص زر عرض الكل', 'Show All Button Text')}
              </label>
              <input
                type="text"
                value={settings.showAllButtonTextAr || 'عرض الكل'}
                onChange={(e) => updateSetting('showAllButtonTextAr', e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9.5px] text-slate-400 font-bold block">
                {t('النص الإنجليزي', 'English Button Text')}
              </label>
              <input
                type="text"
                value={settings.showAllButtonTextEn || 'Show All'}
                onChange={(e) => updateSetting('showAllButtonTextEn', e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs"
                placeholder="Show All"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9.5px] text-slate-400 font-bold block">
              {t('رابط زر عرض الكل', 'Show All Link')}
            </label>
            <input
              type="text"
              value={settings.showAllButtonLink || '/properties'}
              onChange={(e) => updateSetting('showAllButtonLink', e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs"
              placeholder="/properties"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
