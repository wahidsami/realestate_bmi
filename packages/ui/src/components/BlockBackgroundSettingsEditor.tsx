import React from 'react';
import { Palette } from 'lucide-react';

interface BlockBackgroundSettingsEditorProps {
  settings: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
  language: 'ar' | 'en';
  titleAr: string;
  titleEn: string;
  noteAr?: string;
  noteEn?: string;
}

export const BlockBackgroundSettingsEditor: React.FC<BlockBackgroundSettingsEditorProps> = ({
  settings,
  onChange,
  language,
  titleAr,
  titleEn,
  noteAr,
  noteEn,
}) => {
  const t = (ar: string, en: string) => (language === 'ar' ? ar : en);

  const background = settings.background || {
    mode: settings.backgroundMode || (settings.backgroundImageUrl ? 'image' : 'solid'),
    color: settings.backgroundColor || '#0b1020',
    imageUrl: settings.backgroundImageUrl || '',
    overlayOpacity: settings.backgroundImageOverlayOpacity ?? 65,
  };

  const updateBackground = (next: Record<string, any>) => {
    onChange({
      ...background,
      ...next,
    });
  };

  const isImageMode = (background.mode || 'solid') === 'image';

  return (
    <div className="space-y-3 font-sans text-right text-xs">
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-3">
        <h4 className="text-[11px] font-black text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-1.5">
          <Palette className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{t(titleAr, titleEn)}</span>
        </h4>

        <div className="space-y-1.5">
          <label className="text-[9.5px] text-slate-400 font-bold block">
            {t('نوع الخلفية', 'Background Type')}
          </label>
          <select
            value={background.mode || 'solid'}
            onChange={(e) => updateBackground({ mode: e.target.value })}
            className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs"
          >
            <option value="solid">{t('لون ثابت', 'Solid Color')}</option>
            <option value="image">{t('صورة خلفية', 'Background Image')}</option>
          </select>
        </div>

        {isImageMode ? (
          <>
            <div className="space-y-1.5">
              <label className="text-[9.5px] text-slate-400 font-bold block">
                {t('رابط صورة الخلفية', 'Background Image URL')}
              </label>
              <input
                type="text"
                value={background.imageUrl || ''}
                onChange={(e) => updateBackground({ imageUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs"
                placeholder="https://..."
              />
              {background.imageUrl && (
                <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-950/70">
                  <img
                    src={background.imageUrl}
                    alt={t('معاينة الخلفية', 'Background preview')}
                    className="w-full h-28 object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[9.5px] text-slate-400 font-bold block">
                {t('شفافية التراكب', 'Overlay Opacity')}
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={background.overlayOpacity ?? 65}
                onChange={(e) => updateBackground({ overlayOpacity: parseInt(e.target.value, 10) })}
                className="w-full accent-[#D4AF37]"
              />
              <div className="text-[10px] text-slate-500 font-mono text-left">
                {background.overlayOpacity ?? 65}%
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-1.5">
            <label className="text-[9.5px] text-slate-400 font-bold block">
              {t('لون الخلفية', 'Background Color')}
            </label>
            <div className="flex gap-2.5">
              <input
                type="color"
                value={background.color || '#0b1020'}
                onChange={(e) => updateBackground({ color: e.target.value })}
                className="w-10 h-8 p-0 border border-slate-800 rounded bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={background.color || '#0b1020'}
                onChange={(e) => updateBackground({ color: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs"
                placeholder="#0b1020"
              />
            </div>
          </div>
        )}

        <div className="text-[10px] text-slate-500 leading-relaxed">
          {t(
            noteAr || 'الخلفية هنا تُحفظ داخل إعدادات هذا البلوك، لذلك ستظهر نفسها داخل القوالب المحفوظة أيضاً.',
            noteEn || 'This background is saved inside this block settings, so it will also persist in saved templates.'
          )}
        </div>
      </div>
    </div>
  );
};
