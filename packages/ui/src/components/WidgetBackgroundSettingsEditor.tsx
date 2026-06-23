import React from 'react';
import { VisualWidget } from '../types';
import { BlockBackgroundSettingsEditor } from './BlockBackgroundSettingsEditor';

interface WidgetBackgroundSettingsEditorProps {
  currentWidget: VisualWidget;
  handleUpdateElementSetting: (key: string, val: any, isWidget: boolean) => void;
  language: 'ar' | 'en';
}

export const WidgetBackgroundSettingsEditor: React.FC<WidgetBackgroundSettingsEditorProps> = ({
  currentWidget,
  handleUpdateElementSetting,
  language,
}) => {
  const settings = currentWidget.settings || {};
  return (
    <BlockBackgroundSettingsEditor
      settings={settings}
      onChange={(next) => handleUpdateElementSetting('background', next, true)}
      language={language}
      titleAr="خلفية البلوك"
      titleEn="Block Background"
      noteAr="الخلفية هنا تُحفظ داخل إعدادات المكوّن، لذلك ستظهر نفسها داخل القوالب المحفوظة أيضاً."
      noteEn="This background is saved inside the widget settings, so it will also persist in saved templates."
    />
  );
};
