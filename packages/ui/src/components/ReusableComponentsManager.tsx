/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FolderHeart, 
  Trash2, 
  PlusCircle, 
  Link2, 
  Link2Off, 
  RefreshCw, 
  Boxes, 
  LayoutTemplate, 
  Grid, 
  Sparkles, 
  Check, 
  ChevronRight,
  Info
} from 'lucide-react';
import { VisualSection, VisualWidget, VisualPage } from '../types';
import { apiClient } from '@bina/shared';

export interface GlobalReusableComponent {
  id: string;
  recordId?: string;
  type: 'widget' | 'section' | 'layout';
  nameAr: string;
  nameEn: string;
  data: any; // visual representation
  updatedAt: string;
}

const BUILDER_ASSET_KIND = 'reusable_component';
let reusableComponentsCache: GlobalReusableComponent[] = [];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const unwrapBuilderAssetList = (response: unknown): GlobalReusableComponent[] => {
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
    id: item.data?.id || item.key || item.id,
    recordId: item.id,
    type: item.data?.type || 'widget',
    nameAr: item.nameAr || item.data?.nameAr || '',
    nameEn: item.nameEn || item.data?.nameEn || '',
    data: item.data?.data || item.data || {},
    updatedAt: item.updatedAt || new Date().toISOString(),
  }));
};

const notifyReusableComponentsChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('bina:reusable-components-changed'));
  }
};

export const loadReusableComponents = (): GlobalReusableComponent[] => {
  return reusableComponentsCache.map((item) => ({ ...item }));
};

const syncReusableComponentsFromApi = async (): Promise<void> => {
  if (!apiClient.enabled) {
    return;
  }

  try {
    const response = await apiClient.get('/builder-assets?kind=reusable_component');
    reusableComponentsCache = unwrapBuilderAssetList(response);
    notifyReusableComponentsChanged();
  } catch {
    // Keep the existing cache in place if the API is temporarily unavailable.
  }
};

export const saveReusableComponent = (
  type: 'widget' | 'section' | 'layout',
  nameAr: string,
  nameEn: string,
  data: any
): GlobalReusableComponent => {
  // Clone clean representation
  const cleanData = JSON.parse(JSON.stringify(data));
  const id = `reusable_comp_${type}_${Date.now()}`;
  
  const newComp: GlobalReusableComponent = {
    id,
    recordId: id,
    type,
    nameAr,
    nameEn,
    data: cleanData,
    updatedAt: new Date().toISOString()
  };
  reusableComponentsCache = [...reusableComponentsCache, newComp];
  notifyReusableComponentsChanged();

  if (apiClient.enabled) {
    apiClient.post('/builder-assets', {
      id,
      kind: BUILDER_ASSET_KIND,
      key: id,
      nameAr,
      nameEn,
      data: newComp,
    }).catch(() => undefined);
  }
  return newComp;
};

export const deleteReusableComponent = (id: string): void => {
  reusableComponentsCache = reusableComponentsCache.filter(c => c.id !== id && c.recordId !== id);
  notifyReusableComponentsChanged();
  if (apiClient.enabled) {
    apiClient.delete(`/builder-assets/${id}`).catch(() => undefined);
  }
};

interface ReusableComponentsManagerProps {
  language: 'ar' | 'en';
  onInsertWidget: (widget: VisualWidget) => void;
  onInsertSection: (section: VisualSection) => void;
  onApplyLayout: (sections: VisualSection[]) => void;
  activePages: VisualPage[];
  onUpdatePagesList: (newPages: VisualPage[]) => void;
  selectedPageId?: string;
}

export const ReusableComponentsManager: React.FC<ReusableComponentsManagerProps> = ({
  language,
  onInsertWidget,
  onInsertSection,
  onApplyLayout,
  activePages,
  onUpdatePagesList,
  selectedPageId
}) => {
  const [components, setComponents] = useState<GlobalReusableComponent[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'widget' | 'section' | 'layout'>('all');

  const t = (ar: string, en: string) => (language === 'ar' ? ar : en);

  // Load components list
  const refreshList = () => {
    setComponents(loadReusableComponents());
  };

  useEffect(() => {
    refreshList();
    syncReusableComponentsFromApi().then(refreshList);
    const handleChange = () => refreshList();
    window.addEventListener('bina:reusable-components-changed', handleChange as EventListener);
    return () => window.removeEventListener('bina:reusable-components-changed', handleChange as EventListener);
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('هل أنت متأكد من حذف هذا المكون المشترك؟ سيؤدي ذلك لقطع الاتصال في كلي الصفحات.', 'Are you sure you want to delete this global synced component? Linked instances will become unlinked.'))) {
      deleteReusableComponent(id);
      refreshList();
    }
  };

  // Highly advanced Sweep Propagation to resolve changes globally in all pages instantly!
  const propogateComponentChangesGlobally = (componentId: string, updatedData: any) => {
    const freshComponents = loadReusableComponents();
    const targetComp = freshComponents.find(c => c.id === componentId);
    if (!targetComp) return;

    // Update global list
    targetComp.data = JSON.parse(JSON.stringify(updatedData));
    targetComp.updatedAt = new Date().toISOString();
    reusableComponentsCache = freshComponents;
    notifyReusableComponentsChanged();
    if (apiClient.enabled && targetComp.recordId) {
      apiClient.put(`/builder-assets/${targetComp.recordId}`, {
        kind: BUILDER_ASSET_KIND,
        key: targetComp.id,
        nameAr: targetComp.nameAr,
        nameEn: targetComp.nameEn,
        data: targetComp,
      }).catch(() => undefined);
    }

    // Propagate into all visual pages!
    const updatedPages = activePages.map(page => {
      const pageClone = JSON.parse(JSON.stringify(page)) as VisualPage;
      let hasChange = false;

      pageClone.sections = pageClone.sections.map(sec => {
        // If section is linked to this component
        if (sec.id === componentId || (sec as any).componentId === componentId) {
          hasChange = true;
          return {
            ...sec,
            ...JSON.parse(JSON.stringify(updatedData)),
            id: sec.id, // keep page section unique locator
            componentId: componentId // persist linkage
          };
        }

        // Loop inside rows/columns for linked widgets
        sec.rows = sec.rows.map(row => {
          row.columns = row.columns.map(col => {
            col.widgets = col.widgets.map(wid => {
              if (wid.settings && wid.settings.componentId === componentId) {
                hasChange = true;
                return {
                  ...wid,
                  type: targetComp.data.type || wid.type,
                  settings: {
                    ...JSON.parse(JSON.stringify(updatedData)),
                    componentId: componentId // maintain link
                  }
                };
              }
              return wid;
            });
            return col;
          });
          return row;
        });

        return sec;
      });

      return pageClone;
    });

    onUpdatePagesList(updatedPages);
    refreshList();
  };

  const handleUseComponent = (comp: GlobalReusableComponent) => {
    if (comp.type === 'widget') {
      // Create widget clone with component link
      const widgetClone: VisualWidget = {
        id: `widget_${Date.now()}`,
        type: comp.data.type || 'HEADING',
        settings: {
          ...JSON.parse(JSON.stringify(comp.data.settings || comp.data)),
          componentId: comp.id // link reference
        }
      };
      onInsertWidget(widgetClone);
    } else if (comp.type === 'section') {
      const sectionClone: VisualSection = {
        ...JSON.parse(JSON.stringify(comp.data)),
        id: `section_${Date.now()}`,
        componentId: comp.id // link reference key
      };
      onInsertSection(sectionClone);
    } else if (comp.type === 'layout') {
      if (confirm(t('سيؤدي تطبيق هذا التخطيط لاستبدال أقسام الصفحة الحالية بالكامل. هل تود الاستمرار؟', 'Applying this custom template layout will replace all current page sections. Proceed?'))) {
        const sectionsCloned = comp.data.map((s: any) => ({
          ...JSON.parse(JSON.stringify(s)),
          id: `section_${Math.random().toString(36).substr(2, 9)}`
        }));
        onApplyLayout(sectionsCloned);
      }
    }
  };

  const filtered = components.filter(c => activeTab === 'all' || c.type === activeTab);

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans text-slate-200">
      
      {/* Tab switchers */}
      <div className="grid grid-cols-4 p-1 bg-slate-900/60 border-b border-slate-800 text-[10px] shrink-0 font-bold divide-x divide-slate-800">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-2 px-1 text-center cursor-pointer transition-all rounded ${
            activeTab === 'all' ? 'text-[#D4AF37] bg-slate-950' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('الكل', 'All')}
        </button>
        <button
          onClick={() => setActiveTab('widget')}
          className={`py-2 px-1 text-center cursor-pointer transition-all rounded ${
            activeTab === 'widget' ? 'text-[#D4AF37] bg-slate-950' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('ويدجت', 'Widgets')}
        </button>
        <button
          onClick={() => setActiveTab('section')}
          className={`py-2 px-1 text-center cursor-pointer transition-all rounded ${
            activeTab === 'section' ? 'text-[#D4AF37] bg-slate-950' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('أقسام', 'Sections')}
        </button>
        <button
          onClick={() => setActiveTab('layout')}
          className={`py-2 px-1 text-center cursor-pointer transition-all rounded ${
            activeTab === 'layout' ? 'text-[#D4AF37] bg-slate-950' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('تخطيطات', 'Layouts')}
        </button>
      </div>

      {/* Main content body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        <div className="flex items-center gap-2 text-indigo-400 border-b border-slate-800 pb-2.5">
          <Boxes className="w-4 h-4" />
          <h3 className="text-xs font-black uppercase tracking-wider">
            {t('المكونات المشتركة المستدامة', 'Global Reusable Components / Symbols')}
          </h3>
        </div>

        <p className="text-[10px] text-slate-400 leading-relaxed text-right">
          {t(
            'احفظ أي ويدجت أو قسم كـ "مكون مشترك". عند استخدام هذا المكون في صفحات متعددة، فإن أي تعديل لاحق سيتزامن تلقائياً وينعكس في كافة الصفحات الموافقة بضغطة واحدة، تماماً كميزة Symbols في Webflow.',
            'Save widgets, sections, or layouts as globally linked reusable components. Updates made here propagate instantly across all pages containing linked instances.'
          )}
        </p>

        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center gap-3.5 mt-4">
            <Info className="w-7 h-7 text-indigo-500/80 animate-pulse" />
            <div className="space-y-1">
              <span className="text-xs font-black block text-slate-300">
                {t('لا توجد مكونات محفوظة بعد', 'No Reusable Components')}
              </span>
              <span className="text-[9px] text-slate-500 max-w-[180px] block leading-relaxed">
                {t('انقر على أي ويدجت أو قسم في ساحة التطوير واختر "حفظ كمكون مشترك" لتبدأ.', 'Select any widget or section and save it as a Component to establish dynamic global symbols.')}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filtered.map(comp => (
              <div
                key={comp.id}
                onClick={() => handleUseComponent(comp)}
                className="group p-3 bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 rounded-xl cursor-pointer text-right transition-all flex flex-col gap-2 relative shadow-sm"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => handleDelete(comp.id, e)}
                      className="p-1 text-slate-500 hover:text-red-500 rounded cursor-pointer transition-all"
                      title={t('حذف المكون', 'Delete Component')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[9px] bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded uppercase">
                      {comp.type}
                    </span>
                  </div>
                  
                  <span className="text-xs font-black text-slate-200 group-hover:text-[#D4AF37] transition-all">
                    {language === 'ar' ? comp.nameAr : comp.nameEn}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-1 pt-2 border-t border-slate-800/60">
                  <span>Synced Symbol</span>
                  <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                    {t('استدعاء الآن', 'Insert Now')}
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-all" />
                  </span>
                </div>

                {/* Helper tool tip indicating sync */}
                <span className="absolute -top-1.5 -left-1.5 bg-indigo-500 text-[8px] text-white font-black px-1 py-0.5 rounded shadow flex items-center gap-0.5 scale-0 group-hover:scale-100 transition-all">
                  <Link2 className="w-2.5 h-2.5" />
                  <span>Linked</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
};
