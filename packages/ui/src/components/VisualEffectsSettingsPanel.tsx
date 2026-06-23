import React, { useState } from 'react';
import { Sparkles, Play, Clock, Sliders, Palette, Zap, ArrowDown, HelpCircle, Layers } from 'lucide-react';
import { VisualEffects } from './EffectsWrapper';

interface VisualEffectsSettingsPanelProps {
  effects: VisualEffects | undefined;
  onChange: (updatedEffects: VisualEffects) => void;
  language: 'ar' | 'en';
  isSection?: boolean;
}

export const VisualEffectsSettingsPanel: React.FC<VisualEffectsSettingsPanelProps> = ({
  effects = { enabled: false } as VisualEffects,
  onChange,
  language,
  isSection = false,
}) => {
  const [activeTab, setActiveTab] = useState<'transitions' | 'controls' | 'styles' | 'specific'>('transitions');

  const t = (ar: string, en: string) => (language === 'ar' ? ar : en);

  const updateField = (key: keyof VisualEffects, value: any) => {
    onChange({
      ...effects,
      [key]: value,
    });
  };

  const handleToggleEngine = () => {
    updateField('enabled', !effects.enabled);
  };

  if (!effects.enabled) {
    return (
      <div id="effects-engine-disabled-panel" className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3 text-right">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 font-sans">
          <span className="text-[11px] text-indigo-400 font-extrabold flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            {t('محرك المؤثرات البصرية', 'Visual Effects Engine')}
          </span>
          <span className="text-[9px] bg-indigo-950/80 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-900">
            {t('مغلق', 'Inactive')}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed text-right font-sans">
          {t(
            'قم بتفعيل محرك السينمائي المتطور لتطبيق التمرير المتعدد الأبعاد والتحويم ثلاثي الأبعاد والنيومورفيزم والتأثير المائي الفاخر.',
            'Activate the cinema-grade physics engine to toggle multi-axis parallax, 3D tilt tracking, glassmorphism, and luxury canvas overrides.'
          )}
        </p>
        <button
          onClick={handleToggleEngine}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] rounded-lg transition-all shadow-md shadow-indigo-900/40 cursor-pointer flex items-center justify-center gap-1.5 font-sans"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('تفعيل المحرك السينمائي الفاخر', 'Activate Cinematic Engine')}</span>
        </button>
      </div>
    );
  }

  return (
    <div id="effects-engine-active-panel" className="space-y-4 text-right">
      {/* Title & Disable Button */}
      <div className="p-3 bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-indigo-900/50 rounded-xl flex items-center justify-between gap-2 font-sans">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
          <div className="text-[11px] font-black text-white">
            {t('✨ سينما المؤثرات النشطة', '✨ Active Effects Engine')}
          </div>
        </div>
        <button
          onClick={handleToggleEngine}
          className="px-2 py-1 border border-red-900/60 hover:border-red-500 bg-red-950/30 hover:bg-red-950/60 text-red-400 rounded-md text-[9px] font-bold transition-all cursor-pointer"
        >
          {t('تعطيل', 'Turn Off')}
        </button>
      </div>

      {/* Internal Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-lg">
        <button
          onClick={() => setActiveTab('transitions')}
          className={`py-1.5 rounded text-[9px] font-black transition-all cursor-pointer ${
            activeTab === 'transitions' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('حركة', 'Motion')}
        </button>
        <button
          onClick={() => setActiveTab('controls')}
          className={`py-1.5 rounded text-[9px] font-black transition-all cursor-pointer ${
            activeTab === 'controls' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('توقيت', 'Time')}
        </button>
        <button
          onClick={() => setActiveTab('styles')}
          className={`py-1.5 rounded text-[9px] font-black transition-all cursor-pointer ${
            activeTab === 'styles' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('نمط', 'Style')}
        </button>
        <button
          onClick={() => setActiveTab('specific')}
          className={`py-1.5 rounded text-[9px] font-black transition-all cursor-pointer ${
            activeTab === 'specific' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isSection ? t('فواصل', 'Dividers') : t('إضافات', 'Widgets')}
        </button>
      </div>

      {/* Tab 1: Transitions */}
      {activeTab === 'transitions' && (
        <div className="space-y-3.5 bg-slate-900/30 p-3 border border-slate-800/40 rounded-xl font-sans">
          <div className="text-[10px] text-indigo-300 font-extrabold pb-0.5 border-b border-slate-800 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-indigo-400" />
            {t('حركات الدخول الأساسية', 'Entrance Transitions')}
          </div>

          {/* Fade Toggle */}
          <div className="flex items-center justify-between">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!!effects.fade}
                onChange={(e) => updateField('fade', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
            <span className="text-[10px] font-bold text-slate-300">{t('تلاشي تدريجي (Fade)', 'Fade Opacity Transition')}</span>
          </div>

          {/* Slide Configuration */}
          <div className="space-y-2 pt-1.5 border-t border-slate-800/55">
            <div className="flex items-center justify-between">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!effects.slide}
                  onChange={(e) => updateField('slide', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
              <span className="text-[10px] font-bold text-slate-300">{t('إزاحة حركية (Slide)', 'Slide Offset Transition')}</span>
            </div>
            {effects.slide && (
              <div className="grid grid-cols-2 gap-2 pl-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 block">{t('اتجاه الإزاحة', 'Slide Direction')}</span>
                  <select
                    value={effects.slideDirection || 'up'}
                    onChange={(e) => updateField('slideDirection', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-[10px] text-white p-1 rounded font-bold focus:outline-none text-right"
                  >
                    <option value="up">↑ {t('أعلى', 'Up')}</option>
                    <option value="down">↓ {t('أسفل', 'Down')}</option>
                    <option value="left">→ {t('يسار (انزلاق لليسار)', 'Left')}</option>
                    <option value="right">← {t('يمين (انزلاق لليمين)', 'Right')}</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Zoom Configuration */}
          <div className="space-y-2 pt-1.5 border-t border-slate-800/55">
            <div className="flex items-center justify-between">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!effects.zoom}
                  onChange={(e) => updateField('zoom', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
              <span className="text-[10px] font-bold text-slate-300">{t('تأثير تكبير (Zoom)', 'Zoom Scale Transition')}</span>
            </div>
            {effects.zoom && (
              <div className="space-y-1 pl-3 font-mono">
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span className="font-bold text-indigo-400">{effects.zoomScale || 0.85}x</span>
                  <span>{t('شدة التكبير', 'Scale Multiplier')}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={effects.zoomScale !== undefined ? effects.zoomScale : 0.85}
                  onChange={(e) => updateField('zoomScale', parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-slate-950 rounded"
                />
              </div>
            )}
          </div>

          {/* Rotate Configuration */}
          <div className="space-y-2 pt-1.5 border-t border-slate-800/55">
            <div className="flex items-center justify-between">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!effects.rotate}
                  onChange={(e) => updateField('rotate', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
              <span className="text-[10px] font-bold text-slate-300">{t('التدوير (Rotate)', 'Rotation degrees')}</span>
            </div>
            {effects.rotate && (
              <div className="space-y-1 pl-3 font-mono">
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span className="font-bold text-indigo-400">{effects.rotateDegree || 12}°</span>
                  <span>{t('زاوية الدوران القصوى', 'Rotation Angle')}</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={effects.rotateDegree !== undefined ? effects.rotateDegree : 12}
                  onChange={(e) => updateField('rotateDegree', parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500 h-1 bg-slate-950 rounded"
                />
              </div>
            )}
          </div>

          {/* Scale Setup */}
          <div className="space-y-2 pt-1.5 border-t border-slate-800/55">
            <div className="flex items-center justify-between">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!effects.scale}
                  onChange={(e) => updateField('scale', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
              <span className="text-[10px] font-bold text-slate-300">{t('التحجيم (Scale Amount)', 'Direct scale multiplier')}</span>
            </div>
            {effects.scale && (
              <div className="space-y-1 pl-3 font-mono">
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span className="font-bold text-indigo-400">{effects.scaleAmount || 1.0}x</span>
                  <span>{t('مضاعف الحجم', 'Scale ratio')}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.05"
                  value={effects.scaleAmount !== undefined ? effects.scaleAmount : 1}
                  onChange={(e) => updateField('scaleAmount', parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-slate-950 rounded"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Controls & Timings */}
      {activeTab === 'controls' && (
        <div className="space-y-3.5 bg-slate-900/30 p-3 border border-slate-800/40 rounded-xl font-sans">
          <div className="text-[10px] text-indigo-300 font-extrabold pb-0.5 border-b border-slate-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            {t('خصائص التوقيت والمشغلات', 'Physics & Timings')}
          </div>

          {/* Duration Slider */}
          <div className="space-y-1 font-mono">
            <div className="flex justify-between text-[9px] text-slate-400">
              <span className="font-bold text-emerald-400">{(effects.duration !== undefined ? effects.duration : 0.6)}s</span>
              <span>{t('مدة الحركة (Duration)', 'Animation velocity duration')}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={effects.duration !== undefined ? effects.duration : 0.6}
              onChange={(e) => updateField('duration', parseFloat(e.target.value))}
              className="w-full accent-indigo-500 h-1 bg-slate-950 rounded"
            />
          </div>

          {/* Delay Slider */}
          <div className="space-y-1 font-mono">
            <div className="flex justify-between text-[9px] text-slate-400">
              <span className="font-bold text-emerald-400">{(effects.delay !== undefined ? effects.delay : 0)}s</span>
              <span>{t('تأخير البداية (Delay)', 'Wait delay before trigger')}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={effects.delay !== undefined ? effects.delay : 0}
              onChange={(e) => updateField('delay', parseFloat(e.target.value))}
              className="w-full accent-indigo-500 h-1 bg-slate-950 rounded"
            />
          </div>

          {/* Trigger Dropdown */}
          <div className="space-y-1.5 font-sans">
            <label className="text-[9px] text-slate-400 font-bold block">{t('مشغل الحركة (Animation Trigger)', 'Trigger Action Source')}</label>
            <select
              value={effects.trigger || 'load'}
              onChange={(e) => updateField('trigger', e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 p-1.5 rounded text-[10px] font-bold text-white focus:outline-none text-right"
            >
              <option value="load">{t('تحميل الصفحة المباشر (Page Load)', 'Direct Page Load')}</option>
              <option value="scroll">{t('الظهور مع التمرير (Reveal On Scroll)', 'Trigger On Viewport Entrance')}</option>
            </select>
          </div>

          {/* Repeat Dropdown */}
          <div className="space-y-1.5 font-sans">
            <label className="text-[9px] text-slate-400 font-bold block">{t('تكرار الحركة (Iteration Loop)', 'Repeat Mode')}</label>
            <select
              value={effects.repeat || 'once'}
              onChange={(e) => updateField('repeat', e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 p-1.5 rounded text-[10px] font-bold text-white focus:outline-none text-right"
            >
              <option value="once">{t('مرة واحدة فقط (Once)', 'Play Once on Trigger')}</option>
              <option value="infinite">{t('تأثير متبادل مستمر (Infinite loop)', 'Continuous interactive oscillation')}</option>
            </select>
          </div>

          {/* Mobile Enabled Checkbox */}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/55 font-sans">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={effects.mobileEnabled !== false}
                onChange={(e) => updateField('mobileEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
            <span className="text-[10px] font-bold text-slate-300">{t('تفعيل على الجوال واللوحي', 'Mobile Enable/Disable')}</span>
          </div>
        </div>
      )}

      {/* Tab 3: Creative Styles & Aesthetic Panels */}
      {activeTab === 'styles' && (
        <div className="space-y-3.5 bg-slate-900/30 p-3 border border-slate-800/40 rounded-xl font-sans">
          <div className="text-[10px] text-indigo-300 font-extrabold pb-0.5 border-b border-slate-800 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            {t('تنسيقات الأبعاد والتصميم المتقدم', 'Aero Styles & Overlays')}
          </div>

          {/* Parallax Scroll Setup */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!effects.parallax}
                  onChange={(e) => updateField('parallax', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
              <span className="text-[10px] font-bold text-slate-300">{t('إزاحة مع التمرير (Parallax)', 'Scroll Parallax Depth')}</span>
            </div>
            {effects.parallax && (
              <div className="space-y-1 pl-3 font-mono">
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span className="text-indigo-400">{effects.parallaxSpeed || 0.15}</span>
                  <span>{t('سرعة البارالاكس', 'Parallax Speed Multiplier')}</span>
                </div>
                <input
                  type="range"
                  min="-0.8"
                  max="0.8"
                  step="0.05"
                  value={effects.parallaxSpeed !== undefined ? effects.parallaxSpeed : 0.15}
                  onChange={(e) => updateField('parallaxSpeed', parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-slate-950 rounded"
                />
              </div>
            )}
          </div>

          {/* Hover Effects dropdown */}
          <div className="space-y-1.5 pt-1.5 border-t border-slate-800/55">
            <label className="text-[9px] text-slate-400 font-bold block font-sans">{t('مؤثر التحويم التفاعلي (Hover Effect)', 'On-Hover Physics')}</label>
            <select
              value={effects.hoverEffect || 'none'}
              onChange={(e) => updateField('hoverEffect', e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 p-1.5 rounded text-[10px] font-bold text-white focus:outline-none text-right font-sans"
            >
              <option value="none">{t('لا يوجد تأثير', 'None')}</option>
              <option value="lift">{t('ارتفاع حركي (Float Lift)', 'Float Lift Up')}</option>
              <option value="scaleUp">{t('تكبير وتطابق (Grow Scale)', 'Standard Scale Up')}</option>
              <option value="glow">{t('وهج مذهب فاخر (Luxury Accent Glow)', 'Golden Theme Glow Aura')}</option>
              <option value="glassShine">{t('بريق زجاجي خاطف (Glass Shine sweep)', 'Shining Light Sweeping')}</option>
              <option value="borderShift">{t('إضاءة الحدود والبراويز (Border Neon)', 'Border Shift color')}</option>
            </select>
          </div>

          {/* 3D Mouse Tracking Setup */}
          <div className="space-y-2 pt-1.5 border-t border-slate-800/55">
            <div className="flex items-center justify-between font-sans">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!effects.mouseTracking}
                  onChange={(e) => updateField('mouseTracking', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
              <span className="text-[10px] font-bold text-slate-300">{t('تتبع حركة الماوس ثلاثي الأبعاد (3D Tilt)', 'Interactive Mouse Track Tilt')}</span>
            </div>
            {effects.mouseTracking && (
              <div className="space-y-1 pl-3 font-mono">
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span className="text-indigo-400">±{effects.mouseTrackingStrength || 15}°</span>
                  <span>{t('زاوية الإمالة والشدة', 'Orientation Intensity strength')}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="2"
                  value={effects.mouseTrackingStrength !== undefined ? effects.mouseTrackingStrength : 15}
                  onChange={(e) => updateField('mouseTrackingStrength', parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500 h-1 bg-slate-950 rounded"
                />
              </div>
            )}
          </div>

          {/* Floating periodic loop dropdown */}
          <div className="space-y-1.5 pt-1.5 border-t border-slate-800/55">
            <label className="text-[9px] text-slate-400 font-bold block font-sans">{t('حركة عائمة مستمرة (CSS Floating)', 'Idle Floating oscillation')}</label>
            <select
              value={effects.floating || 'none'}
              onChange={(e) => updateField('floating', e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 p-1.5 rounded text-[10px] font-bold text-white focus:outline-none text-right font-sans"
            >
              <option value="none">{t('بدون طفو', 'None')}</option>
              <option value="floatY">{t('تأرجح عمودي سلس (Classic Bobbing)', 'Bobbing Up & Down')}</option>
              <option value="sway">{t('دوران متبادل يمنة ويسرة (Lateral Sway)', 'Side-to-Side Swaying')}</option>
              <option value="pulsePlay">{t('نبض مائي فاخر (Breathing Pulse)', 'Soft Breathing Scale')}</option>
              <option value="slantedFloat">{t('طفو مائل سينمائي (Cinematic float)', 'Combines float with tilt')}</option>
            </select>
          </div>

          {/* Glassmorphism Configuration */}
          <div className="space-y-2 pt-1.5 border-t border-slate-800/55">
            <div className="flex items-center justify-between font-sans">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!effects.glassmorphism}
                  onChange={(e) => updateField('glassmorphism', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
              <span className="text-[10px] font-bold text-slate-300">{t('تنسيق البلور الزجاجي (Glassmorphism)', 'Aero Frosted Glass overlay')}</span>
            </div>
            {effects.glassmorphism && (
              <div className="space-y-2 pl-3 font-mono">
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span className="text-indigo-400">{effects.glassBlur !== undefined ? effects.glassBlur : 12}px</span>
                    <span>{t('شدة تشتيت الضباب (Blur)', 'Backdrop blur size')}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    step="1"
                    value={effects.glassBlur !== undefined ? effects.glassBlur : 12}
                    onChange={(e) => updateField('glassBlur', parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 h-1 bg-slate-950 rounded"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span className="text-indigo-400">{Math.round((effects.glassBgOpacity !== undefined ? effects.glassBgOpacity : 0.12) * 100)}%</span>
                    <span>{t('شفافية الخلفية (Opacity)', 'Backdrop background opacity')}</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.8"
                    step="0.01"
                    value={effects.glassBgOpacity !== undefined ? effects.glassBgOpacity : 0.12}
                    onChange={(e) => updateField('glassBgOpacity', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 bg-slate-950 rounded"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Neumorphic Double shadow setup */}
          <div className="space-y-2 pt-1.5 border-t border-slate-800/55 font-sans">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-300">{t('النيومورفيزم الفاخر (Neumorphism)', 'Futuristic Neumorphic shadows')}</span>
              <select
                value={effects.neumorphism || 'none'}
                onChange={(e) => updateField('neumorphism', e.target.value)}
                className="bg-slate-950 border border-slate-850 p-1 rounded text-[9px] font-bold text-indigo-300 text-right font-sans"
              >
                <option value="none">{t('مغلق', 'Inactive')}</option>
                <option value="flat">{t('بارز مستوي (Flat Extruded)', 'Flat Double Shadows')}</option>
                <option value="convex">{t('محدب انسيابي (Convex Curves)', 'Convex Soft extrusion')}</option>
                <option value="concave">{t('مقعر غامر (Concave)', 'Concave debossed structure')}</option>
                <option value="pressed">{t('مكبوس للداخل (Pressed)', 'Soft Press down')}</option>
              </select>
            </div>
            {effects.neumorphism && effects.neumorphism !== 'none' && (
              <div className="space-y-1.5 pl-3 font-mono">
                <label className="text-[9px] text-slate-500 block font-sans">{t('لون مواءمة النيومورفيك (HEX)', 'Matching background color')}</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={effects.neumorphicColor || '#eceff1'}
                    onChange={(e) => updateField('neumorphicColor', e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent shrink-0 border border-slate-800"
                  />
                  <input
                    type="text"
                    value={effects.neumorphicColor || '#eceff1'}
                    onChange={(e) => updateField('neumorphicColor', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-[10px] text-white p-1 rounded font-bold text-center"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Gradient Background overrides */}
          <div className="space-y-2 pt-1.5 border-t border-slate-800/55 font-mono">
            <div className="flex items-center justify-between">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!effects.gradientBackground}
                  onChange={(e) => updateField('gradientBackground', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
              <span className="text-[10px] font-bold text-slate-300 font-sans">{t('خلفية تدرج لوني مجسم (Gradient)', 'Linear Gradient Background')}</span>
            </div>
            {effects.gradientBackground && (
              <div className="space-y-2 pl-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-slate-500 block font-sans">{t('اللون البدائي', 'Color From')}</span>
                    <input
                      type="color"
                      value={effects.gradientFrom || '#0c1020'}
                      onChange={(e) => updateField('gradientFrom', e.target.value)}
                      className="w-full h-6 cursor-pointer rounded border border-slate-800"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-slate-500 block font-sans">{t('اللون النهائي', 'Color To')}</span>
                    <input
                      type="color"
                      value={effects.gradientTo || '#161d36'}
                      onChange={(e) => updateField('gradientTo', e.target.value)}
                      className="w-full h-6 cursor-pointer rounded border border-slate-800"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] text-slate-500 font-sans">
                    <span className="text-indigo-400 font-mono">{effects.gradientAngle !== undefined ? effects.gradientAngle : 135}°</span>
                    <span>{t('زاوية تدفق الألوان', 'Gradient Degree Direction')}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="15"
                    value={effects.gradientAngle !== undefined ? effects.gradientAngle : 135}
                    onChange={(e) => updateField('gradientAngle', parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 h-1 bg-slate-950 rounded"
                  />
                </div>
                <div className="flex items-center justify-between pt-0.5 font-sans">
                  <input
                    type="checkbox"
                    checked={!!effects.gradientAnimate}
                    onChange={(e) => updateField('gradientAnimate', e.target.checked)}
                    className="accent-indigo-500 pointer-events-auto"
                  />
                  <span className="text-[9px] text-slate-400">{t('تموج تدرج متحرك مستمر', 'Continuous Color Wave Shift')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Specific Elements */}
      {activeTab === 'specific' && (
        <div className="space-y-3.5 bg-slate-900/30 p-3 border border-slate-800/40 rounded-xl font-sans">
          <div className="text-[10px] text-indigo-300 font-extrabold pb-0.5 border-b border-slate-800 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            {isSection ? t('فواصل وهيكل الأقسام المتطورة', 'Curved Shape Dividers') : t('سحر المكونات والتفاعلات الفاخرة', 'Interactive Element Components')}
          </div>

          {isSection ? (
            /* Section Level Controls: Shape Dividers & Sticky */
            <>
              {/* Sticky section capability */}
              <div className="space-y-2 pb-2 border-b border-slate-800/55">
                <div className="flex items-center justify-between">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!effects.sticky}
                      onChange={(e) => updateField('sticky', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <span className="text-[10px] font-bold text-slate-300">{t('تثبيت القسم مع التمرير (Sticky)', 'Sticky Position on Viewport')}</span>
                </div>
                {effects.sticky && (
                  <div className="space-y-1 pl-3 font-mono">
                    <div className="flex justify-between text-[9px] text-slate-500 font-sans">
                      <span className="text-indigo-400">{effects.stickyTopOffset !== undefined ? effects.stickyTopOffset : 80}px</span>
                      <span>{t('الهامش العلوي للتثبيت', 'Top offset spacing')}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="300"
                      step="10"
                      value={effects.stickyTopOffset !== undefined ? effects.stickyTopOffset : 80}
                      onChange={(e) => updateField('stickyTopOffset', parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-500 h-1 bg-slate-950 rounded"
                    />
                  </div>
                )}
              </div>

              {/* Shape Divider TOP */}
              <div className="space-y-2 pb-2 border-b border-slate-800/55">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300">{t('فاصل القمة العلوي (Top Divider)', 'Upper Shape Curve')}</span>
                  <select
                    value={effects.shapeDividerTop || 'none'}
                    onChange={(e) => updateField('shapeDividerTop', e.target.value)}
                    className="bg-slate-950 border border-slate-850 p-1 rounded text-[9px] font-bold text-indigo-300 text-right"
                  >
                    <option value="none">{t('مغلق', 'None')}</option>
                    <option value="waves">{t('تموجات مائية (Waves)', 'Flowing Water Waves')}</option>
                    <option value="curves">{t('منحنيات سلسة (Curves)', 'Arched Curves')}</option>
                    <option value="slant">{t('ميل مائل حاد (Slant)', 'Diagonal Slant line')}</option>
                    <option value="triangle">{t('ذروة المثلث (Triangle)', 'Triangle Pyramid block')}</option>
                  </select>
                </div>
                {effects.shapeDividerTop && effects.shapeDividerTop !== 'none' && (
                  <div className="space-y-2 pl-3 font-mono">
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-slate-500 block font-sans">{t('لون فاصل القمة', 'Divider Color')}</span>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={effects.shapeDividerTopColor || '#ffffff'}
                          onChange={(e) => updateField('shapeDividerTopColor', e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer bg-transparent shrink-0 border border-slate-800"
                        />
                        <input
                          type="text"
                          value={effects.shapeDividerTopColor || '#ffffff'}
                          onChange={(e) => updateField('shapeDividerTopColor', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 text-[10px] text-white p-1 rounded font-bold text-center"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] text-slate-500 font-sans">
                        <span className="text-indigo-400">{effects.shapeDividerTopHeight || 120}px</span>
                        <span>{t('ارتفاع الفاصل', 'Divider Height')}</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="300"
                        step="10"
                        value={effects.shapeDividerTopHeight || 120}
                        onChange={(e) => updateField('shapeDividerTopHeight', parseInt(e.target.value, 10))}
                        className="w-full accent-indigo-500 h-1 bg-slate-950 rounded"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Shape Divider BOTTOM */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300">{t('فاصل القاعدة السفلي (Bottom Divider)', 'Lower Shape Curve')}</span>
                  <select
                    value={effects.shapeDividerBottom || 'none'}
                    onChange={(e) => updateField('shapeDividerBottom', e.target.value)}
                    className="bg-slate-950 border border-slate-850 p-1 rounded text-[9px] font-bold text-indigo-300 text-right"
                  >
                    <option value="none">{t('مغلق', 'None')}</option>
                    <option value="waves">{t('تموجات مائية (Waves)', 'Flowing Water Waves')}</option>
                    <option value="curves">{t('منحنيات سلسة (Curves)', 'Arched Curves')}</option>
                    <option value="slant">{t('ميل مائل حاد (Slant)', 'Diagonal Slant line')}</option>
                    <option value="triangle">{t('ذروة المثلث (Triangle)', 'Triangle Pyramid block')}</option>
                  </select>
                </div>
                {effects.shapeDividerBottom && HTMLScriptElement && effects.shapeDividerBottom !== 'none' && (
                  <div className="space-y-2 pl-3 font-mono">
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-slate-500 block font-sans">{t('لون فاصل القاعدة', 'Divider Color')}</span>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={effects.shapeDividerBottomColor || '#ffffff'}
                          onChange={(e) => updateField('shapeDividerBottomColor', e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer bg-transparent shrink-0 border border-slate-800"
                        />
                        <input
                          type="text"
                          value={effects.shapeDividerBottomColor || '#ffffff'}
                          onChange={(e) => updateField('shapeDividerBottomColor', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 text-[10px] text-white p-1 rounded font-bold text-center"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] text-slate-500 font-sans">
                        <span className="text-indigo-400">{effects.shapeDividerBottomHeight || 120}px</span>
                        <span>{t('ارتفاع الفاصل', 'Divider Height')}</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="300"
                        step="10"
                        value={effects.shapeDividerBottomHeight || 120}
                        onChange={(e) => updateField('shapeDividerBottomHeight', parseInt(e.target.value, 10))}
                        className="w-full accent-indigo-500 h-1 bg-slate-950 rounded"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Widget Level Controls: Marquee, Counters, Reveals */
            <>
              {/* Marquee Ticker Setup */}
              <div className="space-y-2 pb-2 border-b border-slate-800/55">
                <div className="flex items-center justify-between">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!effects.marquee}
                      onChange={(e) => updateField('marquee', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <span className="text-[10px] font-bold text-slate-300">{t('شريط إخباري متحرك (Marquee)', 'Infinite Marquee Ticker')}</span>
                </div>
                {effects.marquee && (
                  <div className="space-y-2 pl-3">
                    <div className="space-y-1">
                      <span className="text-[8px] text-slate-400 block">{t('النص المتحرك بالشريط', 'Marquee Loop Text')}</span>
                      <input
                        type="text"
                        value={effects.marqueeText || 'BINA & EDARAH LUXURY LIVING'}
                        onChange={(e) => updateField('marqueeText', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 text-[10px] text-white p-1.5 rounded font-bold focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1 font-mono">
                        <span className="text-[8px] text-slate-400 block font-sans">{t('سرعة الشريط', 'Ticker speed')}</span>
                        <input
                          type="number"
                          value={effects.marqueeSpeed || 15}
                          onChange={(e) => updateField('marqueeSpeed', parseInt(e.target.value, 10))}
                          className="w-full bg-slate-950 border border-slate-850 text-[10px] text-white p-1 rounded font-bold focus:outline-none text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] text-slate-400 block">{t('اتجاه الحركة', 'Direction')}</span>
                        <select
                          value={effects.marqueeDirection || 'left'}
                          onChange={(e) => updateField('marqueeDirection', e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-850 p-1 rounded text-[10px] text-white focus:outline-none text-right font-bold"
                        >
                          <option value="left">{t('يمين لليسار LTR', 'Left')}</option>
                          <option value="right">{t('يسار لليمين RTL', 'Right')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Counters Setup */}
              <div className="space-y-2 pb-2 border-b border-slate-800/55">
                <div className="flex items-center justify-between">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!effects.counter}
                      onChange={(e) => updateField('counter', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <span className="text-[10px] font-bold text-slate-300">{t('عدادات رقمية ذكية (Counters)', 'Animated Statistics counter')}</span>
                </div>
                {effects.counter && (
                  <div className="space-y-2 pl-3">
                    <div className="space-y-1 font-mono">
                      <span className="text-[8px] text-slate-400 block font-sans">{t('الرقم النهائي المستهدف', 'Target value')}</span>
                      <input
                        type="number"
                        value={effects.counterTarget || 100}
                        onChange={(e) => updateField('counterTarget', parseInt(e.target.value, 10))}
                        className="w-full bg-slate-950 border border-slate-850 text-[10px] text-white p-1.5 rounded font-bold focus:outline-none text-center"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[8px] text-slate-400 block">{t('البادئة (Prefix)', 'Prefix')}</span>
                        <input
                          type="text"
                          value={effects.counterPrefix || ''}
                          onChange={(e) => updateField('counterPrefix', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 text-[10px] text-white p-1 rounded font-bold focus:outline-none text-center"
                          placeholder="+"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] text-slate-400 block">{t('اللاحقة (Suffix)', 'Suffix')}</span>
                        <input
                          type="text"
                          value={effects.counterSuffix || ''}
                          onChange={(e) => updateField('counterSuffix', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 text-[10px] text-white p-1 rounded font-bold focus:outline-none text-center"
                          placeholder="K+"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Reveal Selection */}
              <div className="space-y-2 pb-2 border-b border-slate-800/55">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300">{t('كشف النص التدريجي (Text Reveal)', 'Luxurious Text reveal transition')}</span>
                  <select
                    value={effects.textReveal || 'none'}
                    onChange={(e) => updateField('textReveal', e.target.value as any)}
                    className="bg-slate-950 border border-slate-850 p-1 rounded text-[9px] font-bold text-indigo-300 text-right"
                  >
                    <option value="none">{t('مغلق', 'None')}</option>
                    <option value="chars">{t('حرف تلو الآخر (Character Reveal)', 'Splitting Letters')}</option>
                    <option value="words">{t('كلمة تلو الأخرى (Word Reveal)', 'Splitting Words')}</option>
                  </select>
                </div>
                <p className="text-[8px] text-slate-500 leading-relaxed text-right pl-3">
                  {t('يعمل للتأثير فورا مع العناوين والفقرات النصية لكشف الكلمات بفخامة حركية.', 'Applies immediately to standard headings or body elements on viewport focus.')}
                </p>
              </div>

              {/* Image Reveal Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-sans">
                  <span className="text-[10px] font-bold text-slate-300">{t('كشف الصور السينمائي (Image Reveal)', 'Cinema Wipe reveals')}</span>
                  <select
                    value={effects.imageReveal || 'none'}
                    onChange={(e) => updateField('imageReveal', e.target.value as any)}
                    className="bg-slate-950 border border-slate-850 p-1 rounded text-[9px] font-bold text-indigo-300 text-right font-sans"
                  >
                    <option value="none">{t('مغلق', 'None')}</option>
                    <option value="wipeLeft">{t('مسح كاشف لليسار (Wipe Left)', 'Golden Sweep Left')}</option>
                    <option value="wipeRight">{t('مسح كاشف لليمين (Wipe Right)', 'Golden Sweep Right')}</option>
                    <option value="maskGrow">{t('تطهير فجائي كاشف (Iris Grow)', 'Scale Mask Expansion')}</option>
                  </select>
                </div>
                <p className="text-[8px] text-slate-500 leading-relaxed text-right pl-3">
                  {t('يكتسح لون ذهبي أو داكن الصورة ثم يسحب نفسه لكشف الصورة الفاخرة تحت السطح.', 'A luxurious custom overlay sweep that wipes away to show the underlying image.')}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
