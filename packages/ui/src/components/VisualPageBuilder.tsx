/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { visualPagesRepository } from '../repositories';
import { VisualPage, VisualSection, VisualRow, VisualColumn, VisualWidget, PageVersion } from '../types';
import { 
  WIDGET_REGISTRY, 
  WidgetCategoryType, 
  getWidgetByCategory, 
  getWidgetDefaultSettings 
} from './WidgetRegistry';
import { WidgetRenderer } from './WidgetRenderer';
import { VisualEffectsSettingsPanel } from './VisualEffectsSettingsPanel';
import { DesignSystemManager, VisualDesignSystem, SYSTEM_THEME_PRESETS, generateGlobalCSSRules } from './DesignSystemManager';
import { RightSidebarPanel } from './RightSidebarPanel';
import { ReusableComponentsManager, saveReusableComponent, loadReusableComponents } from './ReusableComponentsManager';
import { AssetManager } from './AssetManager';
import {
  cloneSection,
  cloneSectionsList,
  SECTION_TEMPLATES,
  TEMPLATE_CATEGORIES,
  PAGE_TEMPLATES,
  loadCustomSections,
  saveCustomSectionTemplate,
  deleteCustomSectionTemplate,
  loadCustomPages,
  saveCustomPageTemplate,
  deleteCustomPageTemplate,
  refreshCustomTemplatesFromApi,
  TemplateCategoryType,
  generateUniqueId
} from './LayoutTemplatesRegistry';
import { readStorageItem, writeStorageItem } from '@bina/utils';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown, 
  Layers, 
  Globe, 
  FileText, 
  Smartphone, 
  Tablet, 
  Monitor, 
  RotateCcw, 
  Save, 
  Grid, 
  Type, 
  Image as ImageIcon, 
  Square, 
  Settings, 
  Columns,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  PlusCircle,
  FolderOpen,
  Download,
  Upload,
  BookOpen,
  FolderHeart,
  FileCode,
  Palette,
  Boxes,
  Check,
  RefreshCw,
  LogOut,
  ChevronRight,
  Box,
  Lock,
  Unlock,
  Search,
  Pin
} from 'lucide-react';

export interface VisualPageBuilderProps {
  onExit?: (tab?: any) => void;
  onBackToWebsite?: () => void;
}

export const VisualPageBuilder: React.FC<VisualPageBuilderProps> = ({ onExit, onBackToWebsite }) => {
  const { language } = useLanguage();
  const { theme } = useTheme();

  // Quick navigation custom dropdown indicator
  const [quickNavOpen, setQuickNavOpen] = useState(false);

  // Active Pages List
  const [pages, setPages] = useState<VisualPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<VisualPage | null>(null);
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [previewSize, setPreviewSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Custom Zoom Level & Tree Collapsing States
  const [zoom, setZoom] = useState<number>(100);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [copiedElement, setCopiedElement] = useState<{
    type: 'section' | 'row' | 'column' | 'widget';
    data: any;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    elId: string;
    elType: 'section' | 'row' | 'column' | 'widget';
    secId?: string;
    rowId?: string;
    colId?: string;
  } | null>(null);

  // Close context menu listener
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleContextMenu = (
    e: React.MouseEvent,
    elId: string,
    elType: 'section' | 'row' | 'column' | 'widget',
    secId?: string,
    rowId?: string,
    colId?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      elId,
      elType,
      secId,
      rowId,
      colId
    });
  };

  const toggleNodeCollapse = (nodeId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setCollapsedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Helper functions for redesigned Layers Tree
  const isWidgetDynamic = (type: string) => {
    const dynamicTypes = ['pricing_table', 'map', 'contact_form', 'property_grid', 'property_carousel', 'project_grid', 'amenities_section', 'visual_editor_page_content'];
    return dynamicTypes.includes(type);
  };

  const isElementHidden = (id: string, type?: string, extraSec?: any) => {
    if (type === 'section' && extraSec) {
      return extraSec.visible === false || !!hiddenElements[id];
    }
    return !!hiddenElements[id];
  };

  const isElementLocked = (id: string) => {
    return !!lockedElements[id];
  };

  const toggleElementVisibility = (id: string, type: 'section' | 'row' | 'column' | 'widget') => {
    if (type === 'section') {
      toggleSectionVisibility(id);
    } else {
      setHiddenElements(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    }
  };

  const toggleElementLock = (id: string) => {
    setLockedElements(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleDragStart = (e: React.DragEvent, id: string, type: 'section' | 'row' | 'column' | 'widget', parentId?: string) => {
    if (isElementLocked(id)) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, type, parentId }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string, targetType: 'section' | 'row' | 'column' | 'widget', targetParentId?: string) => {
    e.preventDefault();
    try {
      const raw = e.dataTransfer.getData('text/plain');
      if (!raw) return;
      const { id: sourceId, type: sourceType, parentId: sourceParentId } = JSON.parse(raw);
      
      if (sourceId === targetId) return; // Ignore on self Drop

      if (!selectedPage) return;
      const updatedSecs = JSON.parse(JSON.stringify(selectedPage.sections)) as VisualSection[];

      if (sourceType === 'section' && targetType === 'section') {
        const sIdx = updatedSecs.findIndex(s => s.id === sourceId);
        const tIdx = updatedSecs.findIndex(s => s.id === targetId);
        if (sIdx !== -1 && tIdx !== -1) {
          const [removed] = updatedSecs.splice(sIdx, 1);
          updatedSecs.splice(tIdx, 0, removed);
          saveUpdatedSections(updatedSecs);
          triggerNotice(t('تم إعادة ترتيب القسم نجاحاً', 'Section reordered successfully'));
        }
      } else if (sourceType === 'widget' && targetType === 'column') {
        let widgetToMove: VisualWidget | null = null;
        updatedSecs.forEach(sec => {
          sec.rows.forEach(row => {
            row.columns.forEach(col => {
              const idx = col.widgets.findIndex(w => w.id === sourceId);
              if (idx !== -1) {
                [widgetToMove] = col.widgets.splice(idx, 1);
              }
            });
          });
        });

        if (widgetToMove) {
          let added = false;
          for (const sec of updatedSecs) {
            for (const row of sec.rows) {
              const col = row.columns.find(c => c.id === targetId);
              if (col) {
                col.widgets.push(widgetToMove);
                added = true;
                break;
              }
            }
            if (added) break;
          }
          if (added) {
            saveUpdatedSections(updatedSecs);
            triggerNotice(t('تم نقل العنصر للعمود المختار', 'Widget moved to target column'));
          }
        }
      } else if (sourceType === 'widget' && targetType === 'widget') {
        let widgetToMove: VisualWidget | null = null;
        updatedSecs.forEach(sec => {
          sec.rows.forEach(row => {
            row.columns.forEach(col => {
              const idx = col.widgets.findIndex(w => w.id === sourceId);
              if (idx !== -1) {
                [widgetToMove] = col.widgets.splice(idx, 1);
              }
            });
          });
        });

        if (widgetToMove) {
          let inserted = false;
          for (const sec of updatedSecs) {
            for (const row of sec.rows) {
              for (const col of row.columns) {
                const tgtIdx = col.widgets.findIndex(w => w.id === targetId);
                if (tgtIdx !== -1) {
                  col.widgets.splice(tgtIdx + 1, 0, widgetToMove);
                  inserted = true;
                  break;
                }
              }
              if (inserted) break;
            }
            if (inserted) break;
          }
          if (inserted) {
            saveUpdatedSections(updatedSecs);
            triggerNotice(t('تم إعادة ترتيب العنصر نجاحاً', 'Widget level reordering successful'));
          }
        }
      }
    } catch (error) {
      console.error('Drop error:', error);
    }
  };

  const saveUpdatedSections = (updatedSecs: VisualSection[]) => {
    if (!selectedPage) return;
    setSelectedPage({ ...selectedPage, sections: updatedSecs });
    const updatedPages = pages.map(p => p.id === selectedPage.id ? { ...p, sections: updatedSecs } : p);
    setPages(updatedPages);
  };

  const expandAll = () => {
    const newCollapsed: Record<string, boolean> = {};
    setCollapsedNodes(newCollapsed);
  };

  const collapseAll = () => {
    const newCollapsed: Record<string, boolean> = {};
    if (selectedPage) {
      selectedPage.sections.forEach(sec => {
        newCollapsed[sec.id] = true;
        sec.rows.forEach(row => {
          newCollapsed[row.id] = true;
          row.columns.forEach(col => {
            newCollapsed[col.id] = true;
          });
        });
      });
    }
    setCollapsedNodes(newCollapsed);
  };

  const getBreadcrumbs = () => {
    if (!selectedPage) return [];
    const trail: { label: string; onClick: () => void }[] = [];
    trail.push({
      label: language === 'ar' ? 'الصفحة الرئيسية' : 'Root Page',
      onClick: () => {
        setSelectedElType('page');
        setSelectedSectionId(null);
        setSelectedRowId(null);
        setSelectedColId(null);
        setSelectedWidgetId(null);
      }
    });

    if (selectedSectionId) {
      const sec = selectedPage.sections.find(s => s.id === selectedSectionId);
      if (sec) {
        trail.push({
          label: t(sec.nameAr, sec.nameEn),
          onClick: () => {
            setSelectedSectionId(sec.id);
            setSelectedRowId(null);
            setSelectedColId(null);
            setSelectedWidgetId(null);
            setSelectedElType('section');
          }
        });
      }
    }

    if (selectedRowId && selectedSectionId) {
      const sec = selectedPage.sections.find(s => s.id === selectedSectionId);
      const rowIdx = sec?.rows.findIndex(r => r.id === selectedRowId);
      if (rowIdx !== undefined && rowIdx !== -1) {
        trail.push({
          label: language === 'ar' ? `حاوية ${rowIdx + 1}` : `Container ${rowIdx + 1}`,
          onClick: () => {
            setSelectedSectionId(selectedSectionId);
            setSelectedRowId(selectedRowId);
            setSelectedColId(null);
            setSelectedWidgetId(null);
            setSelectedElType('row');
          }
        });
      }
    }

    if (selectedColId && selectedRowId && selectedSectionId) {
      const sec = selectedPage.sections.find(s => s.id === selectedSectionId);
      const row = sec?.rows.find(r => r.id === selectedRowId);
      const colIdx = row?.columns.findIndex(c => c.id === selectedColId);
      const col = row?.columns[colIdx || 0];
      if (colIdx !== undefined && colIdx !== -1) {
        trail.push({
          label: language === 'ar' ? `عمود (span ${col?.span || 1})` : `Col (span ${col?.span || 1})`,
          onClick: () => {
            setSelectedSectionId(selectedSectionId);
            setSelectedRowId(selectedRowId);
            setSelectedColId(selectedColId);
            setSelectedWidgetId(null);
            setSelectedElType('column');
          }
        });
      }
    }

    if (selectedWidgetId && selectedColId && selectedRowId && selectedSectionId) {
      const sec = selectedPage.sections.find(s => s.id === selectedSectionId);
      const row = sec?.rows.find(r => r.id === selectedRowId);
      const col = row?.columns.find(c => c.id === selectedColId);
      const wid = col?.widgets.find(w => w.id === selectedWidgetId);
      if (wid) {
        const titleText = wid.settings.textAr || wid.settings.textEn || wid.settings.labelAr || wid.settings.labelEn || wid.type;
        trail.push({
          label: titleText.length > 15 ? titleText.substring(0, 15) + '...' : titleText,
          onClick: () => {
            setSelectedSectionId(selectedSectionId);
            setSelectedRowId(selectedRowId);
            setSelectedColId(selectedColId);
            setSelectedWidgetId(selectedWidgetId);
            setSelectedElType('widget');
          }
        });
      }
    }

    return trail;
  };

  const handleDuplicateElement = (elId: string, type: 'section' | 'row' | 'column' | 'widget') => {
    if (!selectedPage) return;
    const updatedSecs = JSON.parse(JSON.stringify(selectedPage.sections)) as VisualSection[];
    let success = false;

    if (type === 'section') {
      const idx = updatedSecs.findIndex(s => s.id === elId);
      if (idx !== -1) {
        const duplicated = regenerateIds(updatedSecs[idx]);
        updatedSecs.splice(idx + 1, 0, duplicated);
        success = true;
      }
    } else if (type === 'row') {
      updatedSecs.forEach(sec => {
        const idx = sec.rows.findIndex(r => r.id === elId);
        if (idx !== -1) {
          const duplicated = regenerateIds(sec.rows[idx]);
          sec.rows.splice(idx + 1, 0, duplicated);
          success = true;
        }
      });
    } else if (type === 'column') {
      updatedSecs.forEach(sec => {
        sec.rows.forEach(row => {
          const idx = row.columns.findIndex(c => c.id === elId);
          if (idx !== -1) {
            const duplicated = regenerateIds(row.columns[idx]);
            row.columns.splice(idx + 1, 0, duplicated);
            success = true;
          }
        });
      });
    } else if (type === 'widget') {
      updatedSecs.forEach(sec => {
        sec.rows.forEach(row => {
          row.columns.forEach(col => {
            const idx = col.widgets.findIndex(w => w.id === elId);
            if (idx !== -1) {
              const duplicated = regenerateIds(col.widgets[idx]);
              col.widgets.splice(idx + 1, 0, duplicated);
              success = true;
            }
          });
        });
      });
    }

    if (success) {
      saveUpdatedSections(updatedSecs);
      triggerNotice(t('تم تكرار العنصر بنجاح!', 'Element duplicated successfully!'));
    }
  };

  const handleRenameElement = (elId: string, type: 'section' | 'row' | 'column' | 'widget') => {
    if (!selectedPage) return;
    
    if (type === 'section') {
      const newNameAr = window.prompt(language === 'ar' ? 'أدخل الاسم الجديد باللغة العربية:' : 'Enter new section name (Arabic):');
      const newNameEn = window.prompt(language === 'ar' ? 'أدخل الاسم الجديد باللغة الإنجليزية:' : 'Enter new section name (English):');
      if (newNameAr && newNameEn) {
        const updatedSecs = selectedPage.sections.map(s => {
          if (s.id === elId) {
            return { ...s, nameAr: newNameAr, nameEn: newNameEn };
          }
          return s;
        });
        saveUpdatedSections(updatedSecs);
        triggerNotice(t('تم تعديل الاسم بنجاح!', 'Renamed successfully!'));
      }
    } else if (type === 'widget') {
      const newTitleAr = window.prompt(language === 'ar' ? 'أدخل عنوان العنصر الجديد (عربي):' : 'Enter widget text label (Arabic):');
      const newTitleEn = window.prompt(language === 'ar' ? 'أدخل عنوان العنصر الجديد (إنجليزي):' : 'Enter widget text label (English):');
      if (newTitleAr && newTitleEn) {
        const updatedSecs = JSON.parse(JSON.stringify(selectedPage.sections)) as VisualSection[];
        updatedSecs.forEach(sec => {
          sec.rows.forEach(row => {
            row.columns.forEach(col => {
              col.widgets.forEach(w => {
                if (w.id === elId) {
                  w.settings.textAr = newTitleAr;
                  w.settings.textEn = newTitleEn;
                  w.settings.labelAr = newTitleAr;
                  w.settings.labelEn = newTitleEn;
                }
              });
            });
          });
        });
        saveUpdatedSections(updatedSecs);
        triggerNotice(t('تم تعديل العنوان بنجاح!', 'Renamed successfully!'));
      }
    } else {
      triggerNotice(t('يتم تسمية هذه العناصر تلقائياً بناءً على ترتيبها.', 'These elements are auto-named based on hierarchy.'));
    }
  };

  const handleSaveAsComponent = (elId: string, type: 'section' | 'widget') => {
    if (type === 'section') {
      const sec = selectedPage?.sections.find(s => s.id === elId);
      if (sec) {
        setSelectedSectionForSave(sec);
        setSaveTemplateType('section');
        setSaveTemplateNameAr(sec.nameAr);
        setSaveTemplateNameEn(sec.nameEn);
        setIsSaveTemplateModalOpen(true);
      }
    } else if (type === 'widget') {
      const componentName = window.prompt(language === 'ar' ? 'اسم المكون الفني المشترك الجديد:' : 'Enter reusable component name:');
      if (componentName) {
        let widData: VisualWidget | null = null;
        selectedPage?.sections.forEach(sec => {
          sec.rows.forEach(row => {
            row.columns.forEach(col => {
              const w = col.widgets.find(item => item.id === elId);
              if (w) widData = w;
            });
          });
        });
        if (widData) {
          saveReusableComponent(
            'widget',
            componentName,
            componentName,
            { type: (widData as any).type, settings: (widData as any).settings }
          );
          triggerNotice(t('تم تسجيل المكون المشترك بنجاح!', 'Saved reusable component successfully!'));
        }
      }
    }
  };

  const handleDeleteElement = (elId: string, type: 'section' | 'row' | 'column' | 'widget', secId?: string, rowId?: string, colId?: string) => {
    if (type === 'section') {
      deleteSection(elId);
    } else if (type === 'row' && secId) {
      deleteRow(secId, elId);
    } else if (type === 'column' && secId && rowId) {
      deleteColumn(secId, rowId, elId);
    } else if (type === 'widget' && secId && rowId && colId) {
      deleteWidget(secId, rowId, colId, elId);
    }
  };

  // Recursively reconstruct distinct child IDs to make cloned widgets completely isolated.
  const regenerateIds = (obj: any): any => {
    const clone = JSON.parse(JSON.stringify(obj));
    clone.id = 'pb_' + Math.random().toString(36).substring(2, 11);
    if (clone.rows) {
      clone.rows = clone.rows.map((row: any) => regenerateIds(row));
    }
    if (clone.columns) {
      clone.columns = clone.columns.map((col: any) => regenerateIds(col));
    }
    if (clone.widgets) {
      clone.widgets = clone.widgets.map((wid: any) => regenerateIds(wid));
    }
    return clone;
  };

  const handleCopyElement = (elId: string, type: 'section' | 'row' | 'column' | 'widget') => {
    if (!selectedPage) return;
    let data: any = null;
    if (type === 'section') {
      data = selectedPage.sections.find(s => s.id === elId);
    } else if (type === 'row') {
      selectedPage.sections.forEach(s => {
        const found = s.rows.find(r => r.id === elId);
        if (found) data = found;
      });
    } else if (type === 'column') {
      selectedPage.sections.forEach(s => {
        s.rows.forEach(r => {
          const found = r.columns.find(c => c.id === elId);
          if (found) data = found;
        });
      });
    } else if (type === 'widget') {
      selectedPage.sections.forEach(s => {
        s.rows.forEach(r => {
          r.columns.forEach(c => {
            const found = c.widgets.find(w => w.id === elId);
            if (found) data = found;
          });
        });
      });
    }

    if (data) {
      setCopiedElement({ type, data: JSON.parse(JSON.stringify(data)) });
      triggerNotice(t('تم نسخ العنصر بنجاح!', 'Element configuration copied successfully!'));
    }
  };

  const handlePasteElement = (targetId: string, targetType: 'section' | 'row' | 'column' | 'widget') => {
    if (!copiedElement || !selectedPage) return;

    const pastedData = regenerateIds(copiedElement.data);
    const updatedSecs = JSON.parse(JSON.stringify(selectedPage.sections)) as VisualSection[];
    let success = false;

    if (copiedElement.type === 'section') {
      // Append section after target section
      const targetIdx = updatedSecs.findIndex(s => s.id === targetId);
      if (targetIdx !== -1) {
        updatedSecs.splice(targetIdx + 1, 0, pastedData);
        success = true;
      } else {
        updatedSecs.push(pastedData);
        success = true;
      }
    } else if (copiedElement.type === 'row' && targetType === 'section') {
      const targetSec = updatedSecs.find(s => s.id === targetId);
      if (targetSec) {
        targetSec.rows.push(pastedData);
        success = true;
      }
    } else if (copiedElement.type === 'column' && targetType === 'row') {
      for (const sec of updatedSecs) {
        const targetRow = sec.rows.find(r => r.id === targetId);
        if (targetRow) {
          targetRow.columns.push(pastedData);
          success = true;
          break;
        }
      }
    } else if (copiedElement.type === 'widget') {
      if (targetType === 'column') {
        for (const sec of updatedSecs) {
          for (const row of sec.rows) {
            const targetCol = row.columns.find(c => c.id === targetId);
            if (targetCol) {
              targetCol.widgets.push(pastedData);
              success = true;
              break;
            }
          }
          if (success) break;
        }
      } else if (targetType === 'widget') {
        for (const sec of updatedSecs) {
          for (const row of sec.rows) {
            for (const col of row.columns) {
              const tgtIdx = col.widgets.findIndex(w => w.id === targetId);
              if (tgtIdx !== -1) {
                col.widgets.splice(tgtIdx + 1, 0, pastedData);
                success = true;
                break;
              }
            }
            if (success) break;
          }
          if (success) break;
        }
      }
    }

    if (success) {
      setSelectedPage({ ...selectedPage, sections: updatedSecs });
      const updatedPages = pages.map(p => p.id === selectedPage.id ? { ...p, sections: updatedSecs } : p);
      setPages(updatedPages);
      triggerNotice(t('تم لصق المكون بنجاح!', 'Component successfully pasted!'));
    } else {
      alert(t('العنصر المنسوخ غير متوافق مع الحاوية المستهدفة.', 'Pasted element is incompatible with target selection context.'));
    }
  };
  
  // Selection States for Right Property Panel
  const [selectedElType, setSelectedElType] = useState<'page' | 'section' | 'row' | 'column' | 'widget' | null>('page');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [selectedColId, setSelectedColId] = useState<string | null>(null);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('TEXT');
  const [activeWidgetTab, setActiveWidgetTab] = useState<'content' | 'geometry' | 'typography' | 'visibility'>('content');

  // Layout Library & Custom Template States
  const [sidebarActiveTab, setSidebarActiveTab] = useState<'properties' | 'structure' | 'widgets' | 'backups' | 'library' | 'design_system' | 'components' | 'assets'>('structure');
  
  // Custom sidebar width configuration (320px -> 520px)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = readStorageItem('local', 'bina_edarah_sidebar_width');
    return saved ? parseInt(saved, 10) : 340;
  });
  
  const [settingsSearchQuery, setSettingsSearchQuery] = useState('');
  const [propertiesActiveSubTab, setPropertiesActiveSubTab] = useState<'all' | 'settings' | 'typography' | 'colors' | 'effects'>('all');
  const [widgetActiveCategory, setWidgetActiveCategory] = useState<'ALL' | 'TEXT' | 'BUTTONS' | 'MEDIA' | 'BUSINESS' | 'CONTACT'>('ALL');
  const [designSystemActiveSubTab, setDesignSystemActiveSubTab] = useState<'preset' | 'colors' | 'fonts' | 'elements' | 'custom'>('preset');
  const [symbolActiveSubTab, setSymbolActiveSubTab] = useState<'all' | 'section' | 'widget'>('all');
  
  // Collapsible Accordion States (with Pin Indicator)
  const [isPageTreeExpanded, setIsPageTreeExpanded] = useState(true);
  const [isPageTreePinned, setIsPageTreePinned] = useState(false);
  const [isGeneralExpanded, setIsGeneralExpanded] = useState(true);
  const [isTypographyExpanded, setIsTypographyExpanded] = useState(false);
  const [isColorsExpanded, setIsColorsExpanded] = useState(false);
  const [isEffectsExpanded, setIsEffectsExpanded] = useState(false);
  const [isSymbolsExpanded, setIsSymbolsExpanded] = useState(false);

  const [libraryActiveSubTab, setLibraryActiveSubTab] = useState<'sections' | 'pages' | 'custom'>('sections');
  const [customSections, setCustomSections] = useState<any[]>([]);
  const [customPages, setCustomPages] = useState<any[]>([]);

  // Advanced Redesigned Tree States
  const [hiddenElements, setHiddenElements] = useState<Record<string, boolean>>({});
  const [lockedElements, setLockedElements] = useState<Record<string, boolean>>({});
  const [filterQuery, setFilterQuery] = useState('');

  // Design System configurations state
  const [designSystem, setDesignSystem] = useState<VisualDesignSystem>(() => {
    const raw = readStorageItem('local', 'bina_edarah_active_design_system');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // Safe fallback
      }
    }
    return SYSTEM_THEME_PRESETS[0]; // Golden Luxury
  });

  // Save changes through the current persistence layer automatically
  useEffect(() => {
    writeStorageItem('local', 'bina_edarah_active_design_system', JSON.stringify(designSystem));
  }, [designSystem]);

  // Auto switch properties sidebar tab when elements are highlighted
  useEffect(() => {
    if (selectedElType && selectedElType !== 'page') {
      setSidebarActiveTab('properties');
    }
  }, [selectedElType, selectedWidgetId, selectedSectionId, selectedColId]);

  // Asset Picker modal state
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  const [assetPickerCallback, setAssetPickerCallback] = useState<((url: string) => void) | null>(null);

  const openAssetPicker = (callback: (url: string) => void) => {
    setAssetPickerCallback(() => callback);
    setIsAssetPickerOpen(true);
  };
  
  // Custom Template Saving Dialog State
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [saveTemplateType, setSaveTemplateType] = useState<'section' | 'page'>('section');
  const [saveTemplateNameAr, setSaveTemplateNameAr] = useState('');
  const [saveTemplateNameEn, setSaveTemplateNameEn] = useState('');
  const [selectedSectionForSave, setSelectedSectionForSave] = useState<VisualSection | null>(null);

  // Expanded groups in Layout Library
  const [expandedSectionLibraryCat, setExpandedSectionLibraryCat] = useState<string | null>('hero');
  const [expandedPageLibraryCat, setExpandedPageLibraryCat] = useState<string | null>('Real_Estate');

  // Modals / Helpers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPageTitleAr, setNewPageTitleAr] = useState('');
  const [newPageTitleEn, setNewPageTitleEn] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');

  // Toast notices status
  const [notice, setNotice] = useState<string | null>(null);

  const t = (ar: string, en: string) => (language === 'ar' ? ar : en);

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  // 1. Data Loading
  useEffect(() => {
    const bootstrap = async () => {
      try {
        await Promise.all([
          loadPages(),
          refreshCustomTemplatesFromApi(),
        ]);
        setCustomSections(loadCustomSections());
        setCustomPages(loadCustomPages());
      } catch (error) {
        console.error('Failed to load visual page builder data:', error);
      }
    };

    void bootstrap();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      void loadVersions(selectedPage.id).catch((error) => {
        console.error('Failed to load page versions:', error);
      });
    }
  }, [selectedPage?.id]);

  const loadPages = async () => {
    try {
      const all = await visualPagesRepository.getPages();
      setPages(all);
      if (all.length > 0 && !selectedPage) {
        setSelectedPage(all[0]);
      }
    } catch (error) {
      console.error('Visual page load failed:', error);
    }
  };

  const loadVersions = async (pageId: string) => {
    try {
      const vers = await visualPagesRepository.getVersions(pageId);
      setVersions(vers);
    } catch (error) {
      console.error('Visual page version load failed:', error);
    }
  };

  const refreshCustomTemplates = () => {
    setCustomSections(loadCustomSections());
    setCustomPages(loadCustomPages());
  };

  // 1.5. Layout Library & Custom Templates Handlers
  const handleInsertSectionTemplate = (sectionData: any) => {
    if (!selectedPage) return;
    const cloned = cloneSection(sectionData);
    
    let updatedSections = [...selectedPage.sections];
    if (selectedSectionId) {
      // Insert after the selected section for natural flow positioning!
      const idx = updatedSections.findIndex(s => s.id === selectedSectionId);
      if (idx !== -1) {
        updatedSections.splice(idx + 1, 0, cloned);
      } else {
        updatedSections.push(cloned);
      }
    } else {
      updatedSections.push(cloned);
    }

    const updatedPage = {
      ...selectedPage,
      sections: updatedSections
    };
    setSelectedPage(updatedPage);
    setSelectedSectionId(cloned.id);
    setSelectedElType('section');
    triggerNotice(t('تم إدراج القسم الجاهز بنجاح ووضعه بالهيكل!', 'Gleaming ready-made section instantiated into layout!'));
  };

  const handleReplaceSectionTemplate = (sectionData: any) => {
    if (!selectedPage || !selectedSectionId) {
      triggerNotice(t('يرجى اختيار أحد أقسام الصفحة في الشجرة أولاً لكي يتم إبداله بمادة القالب.', 'Select an active section in the Layout Tree first to replace with this template content.'));
      return;
    }
    const cloned = cloneSection(sectionData);
    const updatedSections = selectedPage.sections.map(s => s.id === selectedSectionId ? cloned : s);
    const updatedPage = { ...selectedPage, sections: updatedSections };
    setSelectedPage(updatedPage);
    setSelectedSectionId(cloned.id);
    setSelectedElType('section');
    triggerNotice(t('تم استبدال القسم بالقالب بنجاح!', 'Section successfully replaced with selection template!'));
  };

  const handleInsertPageTemplate = (pageTemplateData: any) => {
    if (!selectedPage) return;
    const cloned = cloneSectionsList(pageTemplateData.sections);
    const updatedPage = {
      ...selectedPage,
      sections: [...selectedPage.sections, ...cloned]
    };
    setSelectedPage(updatedPage);
    triggerNotice(t('تم دمج كامل أقسام قالب الصفحة بنجاح!', 'Merged all sections of page template into current page!'));
  };

  const handleReplacePageTemplate = (pageTemplateData: any) => {
    if (!selectedPage) return;
    if (!window.confirm(t('انتبه: سيتم استبدال وتجاوز كامل العناصر بالصفحة الحالية بمقترحات القالب المختار. هل تود المتابعة؟', 'Warning: This will overwrite ALL sections in your active designer canvas. Proceed?'))) {
      return;
    }
    const cloned = cloneSectionsList(pageTemplateData.sections);
    const updatedPage = {
      ...selectedPage,
      sections: cloned
    };
    setSelectedPage(updatedPage);
    setSelectedSectionId(null);
    setSelectedColId(null);
    setSelectedWidgetId(null);
    setSelectedElType('page');
    triggerNotice(t('تم بناء وتجاوز الصفحة الحالية بروح التخطيط المختار!', 'Active page layout completely re-instantiated with template spirit!'));
  };

  const handleOpenSaveSectionTemplateDialog = (section: VisualSection) => {
    setSelectedSectionForSave(section);
    setSaveTemplateType('section');
    setSaveTemplateNameAr(section.nameAr);
    setSaveTemplateNameEn(section.nameEn);
    setIsSaveTemplateModalOpen(true);
  };

  const handleOpenSavePageTemplateDialog = () => {
    if (!selectedPage) return;
    setSaveTemplateType('page');
    setSaveTemplateNameAr(selectedPage.titleAr);
    setSaveTemplateNameEn(selectedPage.titleEn);
    setIsSaveTemplateModalOpen(true);
  };

  const handleConfirmSaveCustomTemplate = () => {
    if (saveTemplateType === 'section') {
      if (!selectedSectionForSave) return;
      saveCustomSectionTemplate(
        saveTemplateNameAr || t('قسم مخصص لشركة البناء', 'Bespoke Architectural Section'),
        saveTemplateNameEn || t('Custom Section Layout', 'Custom Section Layout'),
        selectedSectionForSave
      );
      triggerNotice(t('حفظ قالب المعايير المخصص في مستودعك الخاص بنجاح!', 'Saved customized section template to your local library bank!'));
    } else {
      if (!selectedPage) return;
      saveCustomPageTemplate(
        saveTemplateNameAr || t('صفحة متكاملة مخصصة', 'Custom Personal Showcase Layout'),
        saveTemplateNameEn || t('Custom Page Showcase Layout', 'Custom Page Showcase Layout'),
        selectedPage.sections
      );
      triggerNotice(t('حفظ قالب صفحتك المتكامل بنجاح في مستودع المزامنة!', 'Saved whole-page custom template layout to Local Library catalog!'));
    }
    refreshCustomTemplates();
    setIsSaveTemplateModalOpen(false);
  };

  const handleDuplicateCustomTemplate = (type: 'section' | 'page', template: any) => {
    if (type === 'section') {
      saveCustomSectionTemplate(
        `${template.nameAr} - نسخة`,
        `${template.nameEn} (Copy)`,
        template.sectionData
      );
    } else {
      saveCustomPageTemplate(
        `${template.nameAr} - نسخة`,
        `${template.nameEn} (Copy)`,
        template.sections
      );
    }
    refreshCustomTemplates();
    triggerNotice(t('تم تدوير ومضاعفة القالب المختار بنجاح!', 'Template configuration duplicated successfully!'));
  };

  const handleExportTemplate = (type: 'section' | 'page', template: any) => {
    const dataToExport = {
      importType: type,
      nameAr: template.nameAr,
      nameEn: template.nameEn,
      descAr: template.descAr || '',
      descEn: template.descEn || '',
      data: type === 'section' ? template.sectionData : template.sections
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_template_${template.key || 'custom'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerNotice(t('تم استخراج وحفظ ملف الـ JSON للقالب لنقله!', 'JSON template configuration file downloaded successfully!'));
  };

  const handleDeleteCustomTemplate = (type: 'section' | 'page', key: string) => {
    if (!window.confirm(t('هل تود بالتأكيد حذف هذا القالب نهائياً من مستودعك؟', 'Are you sure you want to delete this template from your local library?'))) return;
    if (type === 'section') {
      deleteCustomSectionTemplate(key);
    } else {
      deleteCustomPageTemplate(key);
    }
    refreshCustomTemplates();
    triggerNotice(t('تم الحذف بنجاح من مكتبتك!', 'Successfully deleted template from your custom catalog!'));
  };

  // 2. Page Actions
  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageSlug || !newPageTitleAr || !newPageTitleEn) {
      triggerNotice(t('يرجى ملء جميع الحقول المطلوبة', 'Please fill all required fields'));
      return;
    }

    const newPage: VisualPage = {
      id: `vp_${Date.now()}`,
      slug: newPageSlug.toLowerCase().replace(/\s+/g, '-'),
      titleAr: newPageTitleAr,
      titleEn: newPageTitleEn,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: [
        {
          id: `sec_${Date.now()}_1`,
          nameAr: 'القسم الترحيبي الأول',
          nameEn: 'Intro Welcome Section',
          visible: true,
          backgroundColor: '#ffffff',
          background: {
            mode: 'solid',
            color: '#ffffff',
            imageUrl: '',
            overlayOpacity: 65,
          },
          paddingY: 'medium',
          rows: [
            {
              id: `row_${Date.now()}_1`,
              columns: [
                {
                  id: `col_${Date.now()}_1`,
                  span: 12,
                  widgets: [
                    {
                      id: `wid_${Date.now()}_1`,
                      type: 'heading',
                      settings: {
                        textAr: 'مرحباً بك في صفحتك المخصصة الجديدة',
                        textEn: 'Welcome to your new custom page',
                        align: 'center',
                        size: '2xl'
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    try {
      console.log('Saving page', newPage);
      await visualPagesRepository.savePage(newPage);
      triggerNotice(t('تم إنشاء الصفحة وحيازة المخطط!', 'Page created and sketch formatted!'));
      setIsCreateModalOpen(false);
      setNewPageSlug('');
      setNewPageTitleAr('');
      setNewPageTitleEn('');
      
      // Reload
      const all = await visualPagesRepository.getPages();
      setPages(all);
      setSelectedPage(newPage);
      setSelectedElType('page');
    } catch (error) {
      console.error('Failed to create visual page:', error);
      triggerNotice(t('فشل إنشاء الصفحة. تحقق من صلاحياتك أو من اتصال الخادم.', 'Failed to create page. Check your permissions or the server connection.'));
    }
  };

  const handleSavePage = async () => {
    if (!selectedPage) return;
    try {
      console.log('Saving page', selectedPage);
      await visualPagesRepository.savePage(selectedPage);
      triggerNotice(t('تم حفظ التغييرات وتوليد نسخة تاريخية تلقائياً!', 'Changes saved and auto version draft snapshot created!'));

      // Refresh lists
      loadPages();
      loadVersions(selectedPage.id);
    } catch (error) {
      console.error('Failed to save visual page:', error);
      triggerNotice(t('فشل حفظ الصفحة. تحقق من اتصال الخادم ثم أعد المحاولة.', 'Failed to save page. Check the server connection and try again.'));
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!window.confirm(t('هل أنت متأكد من حذف هذه الصفحة المخصصة وجميع نسخها؟', 'Are you sure you want to delete this custom page and all versions?'))) {
      return;
    }
    await visualPagesRepository.deletePage(id);
    triggerNotice(t('تم حذف الصفحة بالكامل', 'Page deleted successfully'));
    setSelectedPage(null);
    setSelectedElType(null);
    const all = await visualPagesRepository.getPages();
    setPages(all);
    if (all.length > 0) {
      setSelectedPage(all[0]);
      setSelectedElType('page');
    }
  };

  const handlePublishToggle = () => {
    if (!selectedPage) return;
    const nextStatus = selectedPage.status === 'published' ? 'draft' : 'published';
    const updated = { ...selectedPage, status: nextStatus };
    setSelectedPage(updated);
    console.log(nextStatus === 'published' ? 'Publishing page' : 'Unpublishing page', updated);
    visualPagesRepository.savePage(updated)
      .then(() => {
        triggerNotice(nextStatus === 'published' ? t('تم نشر الصفحة للعامة!', 'Page published successfully!') : t('تم تحويل الصفحة لمسودة غامضة', 'Page reverted to private draft'));
        loadPages();
      })
      .catch((error) => {
        console.error('Failed to toggle visual page publish state:', error);
        triggerNotice(t('فشل تغيير حالة الصفحة. لم يتم حفظ التعديل.', 'Failed to change page status. The update was not saved.'));
        setSelectedPage(selectedPage);
      });
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!window.confirm(t('هل تود استعادة هذه النسخة السابقة وإلغاء التعديلات الحالية؟', 'Do you wish to restore this older version and overwrite current values?'))) {
      return;
    }
    const restored = await visualPagesRepository.restoreVersion(versionId);
    if (restored) {
      setSelectedPage(restored);
      triggerNotice(t('تم استعادة النسخة بنجاح!', 'Version roll-back completed successfully!'));
      loadVersions(restored.id);
    } else {
      triggerNotice(t('فشلت محاولة الاستعادة', 'Failed to restore version'));
    }
  };

  // 3. Layout Mutators (Sections, Rows, Columns, Widgets)
  const addSection = () => {
    if (!selectedPage) return;
    const newSec: VisualSection = {
      id: `sec_${Date.now()}`,
      nameAr: `قسم جديد #${selectedPage.sections.length + 1}`,
      nameEn: `New Section #${selectedPage.sections.length + 1}`,
      visible: true,
      backgroundColor: '#f8fafc',
      paddingY: 'medium',
      rows: [
        {
          id: `row_${Date.now()}`,
          columns: [
            {
              id: `col_${Date.now()}`,
              span: 12,
              widgets: []
            }
          ]
        }
      ]
    };

    const updated = {
      ...selectedPage,
      sections: [...selectedPage.sections, newSec]
    };
    setSelectedPage(updated);
    setSelectedSectionId(newSec.id);
    setSelectedElType('section');
    triggerNotice(t('تمت إضافة قسم جديد فارغ بالمخطط', 'New empty section mapped!'));
  };

  const duplicateSection = (secId: string) => {
    if (!selectedPage) return;
    const item = selectedPage.sections.find(s => s.id === secId);
    if (!item) return;

    // Deep copy with updated IDs
    const cloned: VisualSection = JSON.parse(JSON.stringify(item));
    cloned.id = `sec_${Date.now()}_cloned`;
    cloned.nameAr += ' (مكرر)';
    cloned.nameEn += ' (Cloned)';
    
    // update children IDs to keep unique
    cloned.rows.forEach(r => {
      r.id = `row_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      r.columns.forEach(c => {
        c.id = `col_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        c.widgets.forEach(w => {
          w.id = `wid_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        });
      });
    });

    const idx = selectedPage.sections.findIndex(s => s.id === secId);
    const updatedSecs = [...selectedPage.sections];
    updatedSecs.splice(idx + 1, 0, cloned);

    setSelectedPage({ ...selectedPage, sections: updatedSecs });
    triggerNotice(t('تم مضاعفة وتكرار القسم', 'Section duplicated seamlessly'));
  };

  const deleteSection = (secId: string) => {
    if (!selectedPage) return;
    if (selectedPage.sections.length <= 1) {
      triggerNotice(t('عذراً، يجب إبقاء قسم واحد على الأقل بالصفحة', 'Sorry, at least one section is mandatory'));
      return;
    }
    const updated = {
      ...selectedPage,
      sections: selectedPage.sections.filter(s => s.id !== secId)
    };
    setSelectedPage(updated);
    if (selectedSectionId === secId) {
      setSelectedSectionId(null);
      setSelectedElType('page');
    }
    triggerNotice(t('تم إزالة القسم بالكامل', 'Section removed from layout'));
  };

  const toggleSectionVisibility = (secId: string) => {
    if (!selectedPage) return;
    const updatedSecs = selectedPage.sections.map(s => {
      if (s.id === secId) {
        return { ...s, visible: !s.visible };
      }
      return s;
    });
    setSelectedPage({ ...selectedPage, sections: updatedSecs });
  };

  const moveSection = (secId: string, direction: 'up' | 'down') => {
    if (!selectedPage) return;
    const idx = selectedPage.sections.findIndex(s => s.id === secId);
    if (idx === -1) return;

    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === selectedPage.sections.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updatedSecs = [...selectedPage.sections];
    const temp = updatedSecs[idx];
    updatedSecs[idx] = updatedSecs[targetIdx];
    updatedSecs[targetIdx] = temp;

    setSelectedPage({ ...selectedPage, sections: updatedSecs });
  };

  // Row operations
  const addRow = (secId: string) => {
    if (!selectedPage) return;
    const newRow: VisualRow = {
      id: `row_${Date.now()}`,
      columns: [
        {
          id: `col_${Date.now()}`,
          span: 12,
          widgets: []
        }
      ]
    };

    const updatedSecs = selectedPage.sections.map(s => {
      if (s.id === secId) {
        return { ...s, rows: [...s.rows, newRow] };
      }
      return s;
    });

    setSelectedPage({ ...selectedPage, sections: updatedSecs });
    setSelectedRowId(newRow.id);
    setSelectedElType('row');
  };

  const deleteRow = (secId: string, rowId: string) => {
    if (!selectedPage) return;
    const updatedSecs = selectedPage.sections.map(s => {
      if (s.id === secId) {
        return { ...s, rows: s.rows.filter(r => r.id !== rowId) };
      }
      return s;
    });
    setSelectedPage({ ...selectedPage, sections: updatedSecs });
    if (selectedRowId === rowId) {
      setSelectedRowId(null);
      setSelectedElType('section');
    }
  };

  // Column operations
  const addColumn = (secId: string, rowId: string) => {
    if (!selectedPage) return;
    const newCol: VisualColumn = {
      id: `col_${Date.now()}`,
      span: 6, // default half width
      widgets: []
    };

    const updatedSecs = selectedPage.sections.map(s => {
      if (s.id === secId) {
        const uRows = s.rows.map(r => {
          if (r.id === rowId) {
            // limit to standard cols count for sanity representation
            if (r.columns.length >= 4) {
              triggerNotice(t('الحد الأقصى للأعمدة بالسطر هو ٤ لتجنب تشوه المنظور', 'Maximum column limit of 4 reached for neat presentation'));
              return r;
            }
            // Auto redistribute layout span to fit nicely
            const nextCols = [...r.columns, newCol];
            const equalSpan = Math.floor(12 / nextCols.length);
            nextCols.forEach(col => col.span = equalSpan);
            return { ...r, columns: nextCols };
          }
          return r;
        });
        return { ...s, rows: uRows };
      }
      return s;
    });

    setSelectedPage({ ...selectedPage, sections: updatedSecs });
    setSelectedColId(newCol.id);
    setSelectedElType('column');
  };

  const deleteColumn = (secId: string, rowId: string, colId: string) => {
    if (!selectedPage) return;
    const updatedSecs = selectedPage.sections.map(s => {
      if (s.id === secId) {
        const uRows = s.rows.map(r => {
          if (r.id === rowId) {
            const nextCols = r.columns.filter(c => c.id !== colId);
            if (nextCols.length > 0) {
              const equalSpan = Math.floor(12 / nextCols.length);
              nextCols.forEach(col => col.span = equalSpan);
            }
            return { ...r, columns: nextCols };
          }
          return r;
        });
        return { ...s, rows: uRows };
      }
      return s;
    });
    setSelectedPage({ ...selectedPage, sections: updatedSecs });
    if (selectedColId === colId) {
      setSelectedColId(null);
      setSelectedElType('row');
    }
  };

  // Widget Operations
  const addWidget = (secId: string, rowId: string, colId: string, type: string) => {
    if (!selectedPage) return;
    
    const newWidget: VisualWidget = {
      id: `wid_${Date.now()}`,
      type,
      settings: {
        ...getWidgetDefaultSettings(type),
      }
    };

    const updatedSecs = selectedPage.sections.map(s => {
      if (s.id === secId) {
        const uRows = s.rows.map(r => {
          if (r.id === rowId) {
            const uCols = r.columns.map(c => {
              if (c.id === colId) {
                return { ...c, widgets: [...c.widgets, newWidget] };
              }
              return c;
            });
            return { ...r, columns: uCols };
          }
          return r;
        });
        return { ...s, rows: uRows };
      }
      return s;
    });

    setSelectedPage({ ...selectedPage, sections: updatedSecs });
    setSelectedWidgetId(newWidget.id);
    setSelectedSectionId(secId);
    setSelectedRowId(rowId);
    setSelectedColId(colId);
    setSelectedElType('widget');
    triggerNotice(t('تم ترويس وإدراج العنصر لبيئة الصفحة', 'Widget integrated successfully!'));
  };

  const deleteWidget = (secId: string, rowId: string, colId: string, widgetId: string) => {
    if (!selectedPage) return;
    const updatedSecs = selectedPage.sections.map(s => {
      if (s.id === secId) {
        const uRows = s.rows.map(r => {
          if (r.id === rowId) {
            const uCols = r.columns.map(c => {
              if (c.id === colId) {
                return { ...c, widgets: c.widgets.filter(w => w.id !== widgetId) };
              }
              return c;
            });
            return { ...r, columns: uCols };
          }
          return r;
        });
        return { ...s, rows: uRows };
      }
      return s;
    });
    setSelectedPage({ ...selectedPage, sections: updatedSecs });
    if (selectedWidgetId === widgetId) {
      setSelectedWidgetId(null);
      setSelectedElType('column');
    }
    triggerNotice(t('تم حذف المكون بنجاح', 'Widget removed from column'));
  };

  const duplicateWidget = (secId: string, rowId: string, colId: string, widget: VisualWidget) => {
    if (!selectedPage) return;
    
    const uWidget: VisualWidget = {
      ...JSON.parse(JSON.stringify(widget)),
      id: `wid_${Date.now()}`,
      settings: {
        ...getWidgetDefaultSettings(widget.type),
        ...(JSON.parse(JSON.stringify(widget)).settings || {})
      }
    };

    const updatedSecs = selectedPage.sections.map(s => {
      if (s.id === secId) {
        const uRows = s.rows.map(r => {
          if (r.id === rowId) {
            const uCols = r.columns.map(c => {
              if (c.id === colId) {
                const idx = c.widgets.findIndex(w => w.id === widget.id);
                if (idx === -1) {
                  return { ...c, widgets: [...c.widgets, uWidget] };
                }
                const updatedWidgets = [...c.widgets];
                updatedWidgets.splice(idx + 1, 0, uWidget);
                return { ...c, widgets: updatedWidgets };
              }
              return c;
            });
            return { ...r, columns: uCols };
          }
          return r;
        });
        return { ...s, rows: uRows };
      }
      return s;
    });

    setSelectedPage({ ...selectedPage, sections: updatedSecs });
    setSelectedWidgetId(uWidget.id);
    triggerNotice(t('تم تكرار ونسخ هذا المكون لإعادة استخدامه', 'Widget duplicated for reuse!'));
  };

  const moveWidget = (secId: string, rowId: string, colId: string, widgetId: string, direction: 'up' | 'down') => {
    if (!selectedPage) return;

    const updatedSecs = selectedPage.sections.map(s => {
      if (s.id === secId) {
        const uRows = s.rows.map(r => {
          if (r.id === rowId) {
            const uCols = r.columns.map(c => {
              if (c.id === colId) {
                const idx = c.widgets.findIndex(w => w.id === widgetId);
                if (idx === -1) return c;
                if (direction === 'up' && idx === 0) return c;
                if (direction === 'down' && idx === c.widgets.length - 1) return c;

                const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
                const updatedWidgets = [...c.widgets];
                const temp = updatedWidgets[idx];
                updatedWidgets[idx] = updatedWidgets[targetIdx];
                updatedWidgets[targetIdx] = temp;

                return { ...c, widgets: updatedWidgets };
              }
              return c;
            });
            return { ...r, columns: uCols };
          }
          return r;
        });
        return { ...s, rows: uRows };
      }
      return s;
    });

    setSelectedPage({ ...selectedPage, sections: updatedSecs });
    triggerNotice(t('تم نقل وترتيب المكون بنجاح', 'Widget reordered successfully!'));
  };

  // Update page-item layout settings directly with visual synchronization
  const updatePageSettings = (key: string, value: any) => {
    if (!selectedPage) return;
    const updated = { ...selectedPage, [key]: value };
    setSelectedPage(updated);
    setPages(pages.map(p => p.id === selectedPage.id ? updated : p));
  };

  // Modify currently selected element settings
  const handleUpdateElementSetting = (key: string, value: any, isSettingsNested: boolean = false) => {
    if (!selectedPage) return;

    if (selectedElType === 'page') {
      setSelectedPage({
        ...selectedPage,
        [key]: value
      });
    } else if (selectedElType === 'section') {
      const updatedSecs = selectedPage.sections.map(s => {
        if (s.id === selectedSectionId) {
          return { ...s, [key]: value };
        }
        return s;
      });
      setSelectedPage({ ...selectedPage, sections: updatedSecs });
    } else if (selectedElType === 'column') {
      const updatedSecs = selectedPage.sections.map(s => {
        if (s.id === selectedSectionId) {
          const uRows = s.rows.map(r => {
            if (r.id === selectedRowId) {
              const uCols = r.columns.map(c => {
                if (c.id === selectedColId) {
                  return { ...c, [key]: value };
                }
                return c;
              });
              return { ...r, columns: uCols };
            }
            return r;
          });
          return { ...s, rows: uRows };
        }
        return s;
      });
      setSelectedPage({ ...selectedPage, sections: updatedSecs });
    } else if (selectedElType === 'widget') {
      const updatedSecs = selectedPage.sections.map(s => {
        if (s.id === selectedSectionId) {
          const uRows = s.rows.map(r => {
            if (r.id === selectedRowId) {
              const uCols = r.columns.map(c => {
                if (c.id === selectedColId) {
                  const uWidgets = c.widgets.map(w => {
                    if (w.id === selectedWidgetId) {
                      if (isSettingsNested) {
                        return { 
                          ...w, 
                          settings: { ...w.settings, [key]: value } 
                        };
                      }
                      return { ...w, [key]: value };
                    }
                    return w;
                  });
                  return { ...c, widgets: uWidgets };
                }
                return c;
              });
              return { ...r, columns: uCols };
            }
            return r;
          });
          return { ...s, rows: uRows };
        }
        return s;
      });
      setSelectedPage({ ...selectedPage, sections: updatedSecs });
    }
  };

  // Safe wrapper for deep widget category/field properties
  const handleUpdateWidgetDeepSetting = (category: string, field: string, value: any) => {
    if (!selectedPage || selectedElType !== 'widget' || !selectedWidgetId) return;

    const updatedSecs = selectedPage.sections.map(s => {
      if (s.id === selectedSectionId) {
        const uRows = s.rows.map(r => {
          if (r.id === selectedRowId) {
            const uCols = r.columns.map(c => {
              if (c.id === selectedColId) {
                const uWidgets = c.widgets.map(w => {
                  if (w.id === selectedWidgetId) {
                    const currentCategorySetting = w.settings[category] || {};
                    return {
                      ...w,
                      settings: {
                        ...w.settings,
                        [category]: {
                          ...currentCategorySetting,
                          [field]: value
                        }
                      }
                    };
                  }
                  return w;
                });
                return { ...c, widgets: uWidgets };
              }
              return c;
            });
            return { ...r, columns: uCols };
          }
          return r;
        });
        return { ...s, rows: uRows };
      }
      return s;
    });
    setSelectedPage({ ...selectedPage, sections: updatedSecs });
  };

  // Safe fetch helper for widget configuration properties
  const getCurrentWidget = (): VisualWidget | null => {
    if (!selectedPage || !selectedSectionId || !selectedRowId || !selectedColId || !selectedWidgetId) return null;
    const s = selectedPage.sections.find(x => x.id === selectedSectionId);
    const r = s?.rows.find(x => x.id === selectedRowId);
    const c = r?.columns.find(x => x.id === selectedColId);
    const widget = c?.widgets.find(x => x.id === selectedWidgetId) || null;
    if (!widget) return null;
    return {
      ...widget,
      settings: {
        ...getWidgetDefaultSettings(widget.type),
        ...(widget.settings || {})
      }
    };
  };

  const currentWidget = getCurrentWidget();

  // Resize handler for the Right Properties Sidebar
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const isRtl = document.documentElement.dir === 'rtl' || language === 'ar';
      const delta = isRtl ? (moveEvent.clientX - startX) : (startX - moveEvent.clientX);
      const newWidth = Math.min(520, Math.max(320, startWidth + delta));
      setSidebarWidth(newWidth);
      writeStorageItem('local', 'bina_edarah_sidebar_width', String(newWidth));
    };
    
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div id="visual-page-builder-panel" className="fixed inset-0 z-[100] w-screen h-screen bg-slate-950 flex flex-col font-sans text-slate-200 overflow-hidden">
      
      {/* Dynamic Design System Style Variables Injector */}
      <style dangerouslySetInnerHTML={{ __html: generateGlobalCSSRules(designSystem) }} />
      
      {/* Toast alert indicator */}
      {notice && (
        <div className="fixed bottom-10 right-10 bg-indigo-600 text-white font-bold px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-indigo-400">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
          <span>{notice}</span>
        </div>
      )}

      {/* Row 1: Workspace & Breadcrumbs Header Bar */}
      <div id="builder-workspace-switcher-bar" className="bg-slate-900 border-b border-slate-800 px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 shadow-sm select-none z-[101]">
        {/* Real-time Breadcrumb path with Quick Navigation dropdown toggler */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
          <button 
            onClick={() => onExit && onExit('dashboard')} 
            className="text-slate-400 hover:text-white hover:underline transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>🏢</span>
            <span>{t('لوحة التحكم', 'Dashboard')}</span>
          </button>
          <span className="text-slate-600">/</span>
          <span className="text-slate-450 text-slate-400 flex items-center gap-1.5">
            <span>🎨</span>
            <span>{t('منشئ الصفحات', 'Page Builder')}</span>
          </span>
          {selectedPage && (
            <>
              <span className="text-slate-600">/</span>
              <span className="text-[#D4AF37] font-sans font-bold bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                {t(selectedPage.titleAr, selectedPage.titleEn)}
              </span>
            </>
          )}

          {/* Quick Navigation Dropdown Popover */}
          <div className="relative inline-block mx-2 text-right">
            <button
              type="button"
              onClick={() => setQuickNavOpen(!quickNavOpen)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-[#D4AF37] font-sans font-bold text-[11px] border border-[#D4AF37]/30 cursor-pointer flex items-center gap-1 transition-all"
            >
              <span>⚡ {t('الملاحة السريعة', 'Quick Navigation')}</span>
              <ChevronDown className="w-3 h-3 text-amber-500" />
            </button>

            {quickNavOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setQuickNavOpen(false)} />
                <div 
                  className="absolute top-full mt-2 w-72 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 p-4 space-y-4 text-xs font-sans text-right"
                  style={{ right: language === 'ar' ? 'auto' : '0px', left: language === 'ar' ? '0px' : 'auto' }}
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                >
                  {/* Home and core sections */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('الرئيسية والموديولات', 'Dashboard & Modules')}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickNavOpen(false);
                        if (onExit) onExit('dashboard');
                      }}
                      className="w-full text-right hover:bg-slate-900 text-slate-300 p-2 rounded-lg cursor-pointer block hover:text-white border-0 bg-transparent flex items-center gap-2"
                    >
                      <span>🏠</span>
                      <span className="font-bold">{t('الرئيسية وسيرفر التحكم', 'Dashboard Home')}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => { setQuickNavOpen(false); if (onExit) onExit('projects'); }}
                        className="text-right hover:bg-[#B45309]/10 text-slate-300 p-1.5 rounded hover:text-amber-500 border-0 bg-transparent"
                      >
                        🏢 {t('المشاريع', 'Projects')}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setQuickNavOpen(false); if (onExit) onExit('properties'); }}
                        className="text-right hover:bg-[#B45309]/10 text-slate-300 p-1.5 rounded hover:text-amber-500 border-0 bg-transparent"
                      >
                        🔑 {t('الأصول والعقارات', 'Properties')}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setQuickNavOpen(false); if (onExit) onExit('inquiries'); }}
                        className="text-right hover:bg-[#B45309]/10 text-slate-300 p-1.5 rounded hover:text-amber-500 border-0 bg-transparent"
                      >
                        ✉️ {t('الاتصالات والطلبات', 'Inquiries')}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setQuickNavOpen(false); if (onExit) onExit('media'); }}
                        className="text-right hover:bg-[#B45309]/10 text-slate-300 p-1.5 rounded hover:text-amber-500 border-0 bg-transparent"
                      >
                        🖼️ {t('معرض الوسائط', 'Media Library')}
                      </button>
                    </div>
                  </div>

                  {/* Recently Edited Pages Selector */}
                  <div className="space-y-1.5 border-t border-slate-900 pt-3">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('الصفحات المحررة مؤخراً', 'Recently Edited Pages')}</span>
                    {pages.length > 0 ? (
                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                        {pages.map((p) => {
                          const isCurrent = selectedPage?.id === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedPage(p);
                                setQuickNavOpen(false);
                              }}
                              className={`w-full text-right p-2 rounded-lg block border-0 transition-colors cursor-pointer flex items-center justify-between ${
                                isCurrent 
                                  ? 'bg-[#B45309]/20 text-amber-500' 
                                  : 'hover:bg-slate-900 text-slate-300 hover:text-white'
                              }`}
                            >
                              <span className="font-bold truncate max-w-[150px]">{t(p.titleAr, p.titleEn)}</span>
                              <span className="text-[9px] font-mono opacity-60">/{p.slug}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-600 italic">{t('لا يوجد صفحات متاحة', 'No pages available')}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Workspace Switcher Pill Group (The Premium Workspace Selector) */}
        <div className="flex flex-wrap bg-slate-950 border border-slate-800 rounded-xl p-1 text-[11px] font-sans font-bold shadow-inner">
          <button
            type="button"
            onClick={() => onExit && onExit('dashboard')}
            className="px-3 py-1.5 flex items-center gap-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer border-0 bg-transparent"
          >
            <span>🏢</span>
            <span>{t('لوحة التحكم', 'Dashboard')}</span>
          </button>
          
          <button
            type="button"
            onClick={() => {}}
            className="bg-indigo-600 text-white px-3.5 py-1.5 flex items-center gap-1.5 rounded-lg shadow-sm font-black border-0 cursor-default"
          >
            <span>🎨</span>
            <span>{t('منشئ الصفحات', 'Page Builder')}</span>
          </button>

          <button
            type="button"
            onClick={() => onExit && onExit('properties')}
            className="px-3 py-1.5 flex items-center gap-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer border-0 bg-transparent"
          >
            <span>📄</span>
            <span>{t('إدارة CMS', 'CMS')}</span>
          </button>

          {onBackToWebsite && (
            <button
              type="button"
              onClick={onBackToWebsite}
              className="px-3 py-1.5 flex items-center gap-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer border-0 bg-transparent"
            >
              <span>🏠</span>
              <span>{t('عرض الموقع', 'Website Preview')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Top Banner Control Bar for page operations */}
      <header id="builder-topbar" className="bg-slate-950 border-b border-slate-80/20 border-slate-800 px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 shadow-lg select-none">
        {/* Page selector */}
        <div className="flex items-center gap-3">
          <FolderOpen className="w-5 h-5 text-[#D4AF37]" />
          <select
            value={selectedPage?.id || ''}
            onChange={(e) => {
              const p = pages.find(x => x.id === e.target.value);
              if (p) {
                setSelectedPage(p);
                setSelectedElType('page');
              }
            }}
            className="bg-slate-900 border border-slate-800 text-emerald-400 font-bold rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {pages.map(p => (
              <option key={p.id} value={p.id}>
                {t(p.titleAr, p.titleEn)} ({p.status === 'published' ? t('نشط', 'Published') : t('مسودة', 'Draft')})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-2 bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>{t('صفحة جديدة', 'New Page')}</span>
          </button>
        </div>

        {/* Framing & Sizing responsive selectors */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 gap-1">
          <button
            onClick={() => setPreviewSize('desktop')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              previewSize === 'desktop' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">{t('شاشة كاملة', 'Desktop')}</span>
          </button>
          
          <button
            onClick={() => setPreviewSize('tablet')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              previewSize === 'tablet' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span className="hidden sm:inline">{t('آيباد', 'Tablet')}</span>
          </button>

          <button
            onClick={() => setPreviewSize('mobile')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              previewSize === 'mobile' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">{t('جوال', 'Mobile')}</span>
          </button>
        </div>

        {/* Global Save & Publish Actions */}
        {selectedPage && (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePublishToggle}
              className={`px-4 py-2 border rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedPage.status === 'published' 
                  ? 'bg-amber-900/30 text-amber-400 border-amber-800 hover:bg-amber-900/50' 
                  : 'bg-indigo-950/80 text-indigo-300 border-indigo-800 hover:bg-indigo-900'
              }`}
            >
              {selectedPage.status === 'published' ? t('📥 إلغاء النشر', '📥 Unpublish Page') : t('🚀 نشر الصفحة', '🚀 Publish Live')}
            </button>

            <button
              onClick={handleOpenSavePageTemplateDialog}
              className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              title={t('حفظ كامل تخطيط الصفحة كقالب مخصص متاح بالمكتبة', 'Save entire page layout as a custom template')}
            >
              <FolderHeart className="w-4 h-4 text-red-400 shrink-0" />
              <span>{t('حفظ كقالب', 'Save Template')}</span>
            </button>

            <button
              onClick={handleSavePage}
              className="px-5 py-2.5 bg-emerald-600 text-slate-950 font-sans font-black hover:scale-[1.03] rounded-lg text-xs transition-all cursor-pointer flex items-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4 text-slate-950 shrink-0" />
              <span>{t('حفظ المخطط والمزامنة', 'Save Draft & Versions')}</span>
            </button>

            <button
              onClick={() => handleDeletePage(selectedPage.id)}
              className="p-2.5 bg-rose-950/70 hover:bg-rose-900 border border-rose-900 rounded-lg text-rose-400 transition-all cursor-pointer"
              title={t('حذف الصفحة', 'Delete Page')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* Main Builder Workplace View */}
      <div id="builder-workplace" className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Panel: Navigation Tree, Widgets and Version History */}
        <aside id="builder-left-sidebar" className="hidden">
          {/* Extreme Left Vertical Icon Rail (VSCode / Figma style) */}
          <div className="w-14 bg-slate-900 border-r border-slate-800/85 flex flex-col justify-between shrink-0 h-full py-4 text-center select-none">
            {/* Top Items */}
            <div className="flex flex-col gap-3.5 items-center w-full">
              {/* Logo icon representation */}
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-serif font-black text-xs mb-2 border border-indigo-500/20">
                B
              </div>

              {/* Structure / Page Tree */}
              <button
                type="button"
                onClick={() => setSidebarActiveTab('structure')}
                className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all relative ${
                  sidebarActiveTab === 'structure' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 font-bold animate-pulse' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
                title={t('هيكل الصفحة', 'Page Layers Tree')}
              >
                <Layers className="w-4 h-4" />
                <span className="text-[7.5px] mt-0.5 font-sans leading-none font-bold select-none">{t('هيكل', 'Tree')}</span>
                {sidebarActiveTab === 'structure' && <span className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-[#D4AF37]" />}
              </button>

              {/* Widgets Library tab */}
              <button
                type="button"
                onClick={() => setSidebarActiveTab('widgets')}
                className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all relative ${
                  sidebarActiveTab === 'widgets' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
                title={t('مكتبة العناصر الذكية', 'Interactive Widgets')}
              >
                <PlusCircle className="w-4 h-4" />
                <span className="text-[7.5px] mt-0.5 font-sans leading-none font-bold select-none">{t('عناصر', 'Widgets')}</span>
                {sidebarActiveTab === 'widgets' && <span className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-[#D4AF37]" />}
              </button>

              {/* Layout Library segments */}
              <button
                type="button"
                onClick={() => setSidebarActiveTab('library')}
                className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all relative ${
                  sidebarActiveTab === 'library' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
                title={t('التخطيطات', 'Pre-built Templates')}
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-[7.5px] mt-0.5 font-sans leading-none font-bold select-none">{t('قوالب', 'Templates')}</span>
                {sidebarActiveTab === 'library' && <span className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-[#D4AF37]" />}
              </button>

              {/* Shared Reusable Symbols */}
              <button
                type="button"
                onClick={() => setSidebarActiveTab('components')}
                className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all relative ${
                  sidebarActiveTab === 'components' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
                title={t('المكونات المشتركة', 'Global Symbols')}
              >
                <Boxes className="w-4 h-4" />
                <span className="text-[7.5px] mt-0.5 font-sans leading-none font-bold select-none">{t('رموز', 'Symbols')}</span>
                {sidebarActiveTab === 'components' && <span className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-[#D4AF37]" />}
              </button>

              {/* Asset Library uploaders */}
              <button
                type="button"
                onClick={() => setSidebarActiveTab('assets')}
                className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all relative ${
                  sidebarActiveTab === 'assets' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
                title={t('الملفات والوسائط', 'Real Estate Media Assets')}
              >
                <ImageIcon className="w-4 h-4" />
                <span className="text-[7.5px] mt-0.5 font-sans leading-none font-bold select-none">{t('ملفات', 'Assets')}</span>
                {sidebarActiveTab === 'assets' && <span className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-[#D4AF37]" />}
              </button>

              {/* Branding / Design System */}
              <button
                type="button"
                onClick={() => setSidebarActiveTab('design_system')}
                className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all relative ${
                  sidebarActiveTab === 'design_system' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
                title={t('الهوية والسمات', 'Design Branding System')}
              >
                <Palette className="w-4 h-4" />
                <span className="text-[7.5px] mt-0.5 font-sans leading-none font-bold select-none">{t('هوية', 'Identity')}</span>
                {sidebarActiveTab === 'design_system' && <span className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-[#D4AF37]" />}
              </button>
            </div>

            {/* Bottom Items */}
            <div className="flex flex-col gap-3.5 items-center w-full">
              {/* Backups History Log tab */}
              <button
                type="button"
                onClick={() => setSidebarActiveTab('backups')}
                className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all relative ${
                  sidebarActiveTab === 'backups' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 font-bold animate-pulse' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
                title={t('النسخ الاحتياطية والمسودات', 'Draft Versions Control')}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-[7.5px] mt-0.5 font-sans leading-none font-bold select-none">{t('نسخ', 'History')}</span>
                {sidebarActiveTab === 'backups' && <span className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-[#D4AF37]" />}
              </button>
            </div>
          </div>

          {/* Main Content Sidebar Panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            {sidebarActiveTab === 'structure' && (
              <div className="flex-1 flex flex-col min-h-0 divide-y divide-slate-800">
                {/* Section 1: Page Map Tree Navigation */}
                {selectedPage && (
                  <div className="p-4 flex flex-col min-h-0 flex-1">
                    <div className="flex items-center justify-between pb-3 shrink-0">
                      <span className="text-slate-400 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-400 animate-pulse" />
                        <span>{t('شجرة شجرة عناصر الصفحة', 'Layout Tree Navigator')}</span>
                      </span>
                      
                      <button
                        onClick={addSection}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-emerald-400 flex items-center justify-center cursor-pointer transition-colors"
                        title={t('إضافة قسم', 'Add Section')}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Recursive tree list resembling Webflow / Elementor */}
                    <div className="space-y-1 overflow-y-auto pr-1 flex-1 text-slate-300 font-sans text-xs min-h-0 pb-4">
                      {/* Root Page Node */}
                      <div
                        onClick={() => {
                          setSelectedElType('page');
                          setSelectedSectionId(null);
                          setSelectedRowId(null);
                          setSelectedColId(null);
                          setSelectedWidgetId(null);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${
                          selectedElType === 'page' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-bold">{t('الصفحة العامة', 'Root Page')}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({selectedPage.slug})</span>
                      </div>

                      <div className="pl-2 rtl:pr-2 border-l rtl:border-r border-slate-850 mt-2 space-y-1.5">
                        {selectedPage.sections.map((sec, sIdx) => {
                          const isSecSelected = selectedSectionId === sec.id && selectedElType === 'section';
                          const isSecCollapsed = !!collapsedNodes[sec.id];
                          const isLastSec = sIdx === selectedPage.sections.length - 1;
                          
                          return (
                            <div key={sec.id} className="space-y-1 relative" onContextMenu={(e) => handleContextMenu(e, sec.id, 'section')}>
                              {/* Section Item */}
                              <div
                                onClick={() => {
                                  setSelectedSectionId(sec.id);
                                  setSelectedRowId(null);
                                  setSelectedColId(null);
                                  setSelectedWidgetId(null);
                                  setSelectedElType('section');
                                }}
                                className={`group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                                  isSecSelected ? 'bg-slate-800 border-l-4 border-indigo-500 text-white font-bold' : 'hover:bg-slate-900 bg-slate-950/45 text-slate-300'
                                } ${!sec.visible ? 'opacity-55 bg-slate-900/10' : ''}`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {/* Collapse control */}
                                  <button
                                    onClick={(e) => toggleNodeCollapse(sec.id, e)}
                                    className="p-0.5 text-slate-500 hover:text-slate-300 shrink-0 cursor-pointer"
                                  >
                                    {isSecCollapsed ? <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                  <span className="text-slate-500 font-mono text-[9px]">#{sIdx + 1}</span>
                                  <span className="font-bold truncate text-[11px] text-slate-200">
                                    {t(sec.nameAr, sec.nameEn)}
                                  </span>
                                </div>

                                {/* Quick Toolbar on Hover */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); moveSection(sec.id, 'up'); }}
                                    disabled={sIdx === 0}
                                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                                    title={t('نقل للأعلى', 'Move Up')}
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); moveSection(sec.id, 'down'); }}
                                    disabled={sIdx === selectedPage.sections.length - 1}
                                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                                    title={t('نقل للأسفل', 'Move Down')}
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); addRow(sec.id); }}
                                    className="p-1 text-emerald-400 hover:text-emerald-300"
                                    title={t('إضافة حاوية/سطر', 'Add Container/Row')}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Rows Nesting Area */}
                              {!isSecCollapsed && (
                                <div className="pl-3 rtl:pr-3 border-l rtl:border-r border-dashed border-slate-800 space-y-1">
                                  {sec.rows.length === 0 && (
                                    <div className="text-[10px] text-slate-600 pl-4 py-1">
                                      {t('└ لا توجد حاويات', '└ No Containers')}
                                    </div>
                                  )}
                                  {sec.rows.map((row, rIdx) => {
                                    const isRowSelected = selectedRowId === row.id && selectedElType === 'row';
                                    const isRowCollapsed = !!collapsedNodes[row.id];
                                    const isLastRow = rIdx === sec.rows.length - 1;

                                    return (
                                      <div key={row.id} className="space-y-1" onContextMenu={(e) => handleContextMenu(e, row.id, 'row', sec.id)}>
                                        {/* Row Item */}
                                        <div
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSectionId(sec.id);
                                            setSelectedRowId(row.id);
                                            setSelectedColId(null);
                                            setSelectedWidgetId(null);
                                            setSelectedElType('row');
                                          }}
                                          className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer ${
                                            isRowSelected ? 'bg-indigo-950/60 border border-indigo-700/60 text-white font-bold' : 'hover:bg-slate-900/50 text-slate-400'
                                          }`}
                                        >
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            {/* Branch character */}
                                            <span className="text-slate-600 font-mono text-[11px] shrink-0">
                                              {isLastRow ? '└' : '├'}
                                            </span>
                                            <button
                                              onClick={(e) => toggleNodeCollapse(row.id, e)}
                                              className="p-0.5 text-slate-600 hover:text-slate-400 shrink-0 cursor-pointer"
                                            >
                                              {isRowCollapsed ? <ChevronRight className="w-3 h-3 rtl:rotate-180" /> : <ChevronDown className="w-3 h-3" />}
                                            </button>
                                            <Columns className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                                            <span className="truncate text-[10px] font-semibold">{t(`حاوية ${rIdx + 1}`, `Container ${rIdx + 1}`)}</span>
                                          </div>

                                          {/* Row Toolbar Controls */}
                                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <button
                                              onClick={(e) => { e.stopPropagation(); addColumn(sec.id, row.id); }}
                                              className="p-0.5 text-teal-400 hover:text-teal-300"
                                              title={t('إضافة عمود', 'Add Column')}
                                            >
                                              <Plus className="w-2.5 h-2.5" />
                                            </button>
                                            <button
                                              onClick={(e) => { e.stopPropagation(); deleteRow(sec.id, row.id); }}
                                              className="p-0.5 text-rose-400 hover:text-rose-300"
                                              title={t('حذف', 'Delete')}
                                            >
                                              <X className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                        </div>

                                        {/* Columns Nesting Area */}
                                        {!isRowCollapsed && (
                                          <div className="pl-4 rtl:pr-4 space-y-1">
                                            {row.columns.length === 0 && (
                                              <div className="text-[10px] text-slate-600 pl-4 py-1">
                                                {t('└ لا توجد أعمدة', '└ No Columns')}
                                              </div>
                                            )}
                                            {row.columns.map((col, cIdx) => {
                                              const isColSelected = selectedColId === col.id && selectedElType === 'column';
                                              const isColCollapsed = !!collapsedNodes[col.id];
                                              const isLastCol = cIdx === row.columns.length - 1;

                                              return (
                                                <div key={col.id} className="space-y-1" onContextMenu={(e) => handleContextMenu(e, col.id, 'column', sec.id, row.id)}>
                                                  {/* Column Item */}
                                                  <div
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setSelectedSectionId(sec.id);
                                                      setSelectedRowId(row.id);
                                                      setSelectedColId(col.id);
                                                      setSelectedWidgetId(null);
                                                      setSelectedElType('column');
                                                    }}
                                                    className={`group flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
                                                      isColSelected ? 'bg-indigo-950/80 border border-indigo-600/50 text-white' : 'hover:bg-slate-900/40 text-slate-400'
                                                    }`}
                                                  >
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                      <span className="text-slate-600 font-mono text-[11px] shrink-0">
                                                        {isLastCol ? '└' : '├'}
                                                      </span>
                                                      <button
                                                        onClick={(e) => toggleNodeCollapse(col.id, e)}
                                                        className="p-0.5 text-slate-600 hover:text-slate-400 shrink-0 cursor-pointer"
                                                      >
                                                        {isColCollapsed ? <ChevronRight className="w-2.5 h-2.5 rtl:rotate-180" /> : <ChevronDown className="w-2.5 h-2.5" />}
                                                      </button>
                                                      <Grid className="w-3 h-3 text-cyan-500 shrink-0" />
                                                      <span className="truncate text-[10px]">{t(`عمود (span ${col.span})`, `Col (span ${col.span})`)}</span>
                                                    </div>

                                                    <button
                                                      onClick={(e) => { e.stopPropagation(); deleteColumn(sec.id, row.id, col.id); }}
                                                      className="opacity-0 group-hover:opacity-100 p-0.5 text-rose-400 hover:text-rose-300 shrink-0"
                                                      title={t('حذف العمود', 'Delete')}
                                                    >
                                                      <X className="w-2 h-2" />
                                                    </button>
                                                  </div>

                                                  {/* Widgets Nesting Area */}
                                                  {!isColCollapsed && (
                                                    <div className="pl-4 rtl:pr-4 space-y-0.5">
                                                      {col.widgets.map((wid, wIdx) => {
                                                        const isWidSelected = selectedWidgetId === wid.id && selectedElType === 'widget';
                                                        const isLastWid = wIdx === col.widgets.length - 1;
                                                        
                                                        // Icon Selector based on Widget Type
                                                        let widgetIcon = <Box className="w-3 h-3 text-slate-500 shrink-0" />;
                                                        if (wid.type === 'heading') widgetIcon = <Type className="w-3 h-3 text-amber-400 shrink-0" />;
                                                        else if (wid.type === 'text' || wid.type === 'rich_text') widgetIcon = <FileText className="w-3 h-3 text-blue-400 shrink-0" />;
                                                        else if (wid.type === 'image') widgetIcon = <ImageIcon className="w-3 h-3 text-emerald-400 shrink-0" />;
                                                        else if (wid.type === 'button') widgetIcon = <PlusCircle className="w-3 h-3 text-pink-400 shrink-0" />;
                                                        else if (wid.type === 'card' || wid.type === 'quote') widgetIcon = <Grid className="w-3 h-3 text-purple-400 shrink-0" />;

                                                        // Truncate and sanitize content labels
                                                        const labelText = wid.settings.textAr || wid.settings.textEn || wid.settings.labelAr || wid.settings.labelEn || wid.type;
                                                        const displayLabel = labelText.length > 22 ? labelText.substring(0, 22) + '...' : labelText;

                                                        return (
                                                          <div
                                                            key={wid.id}
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setSelectedSectionId(sec.id);
                                                              setSelectedRowId(row.id);
                                                              setSelectedColId(col.id);
                                                              setSelectedWidgetId(wid.id);
                                                              setSelectedElType('widget');
                                                            }}
                                                            onContextMenu={(e) => handleContextMenu(e, wid.id, 'widget', sec.id, row.id, col.id)}
                                                            className={`group/widn flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-all ${
                                                              isWidSelected ? 'bg-indigo-900 border border-indigo-700 text-white font-bold' : 'hover:bg-slate-900/40 bg-slate-900/10 text-slate-400'
                                                            }`}
                                                          >
                                                            <div className="flex items-center gap-1.5 min-w-0">
                                                              <span className="text-slate-600 font-mono text-[11px] shrink-0">
                                                                {isLastWid ? '└' : '├'}
                                                              </span>
                                                              {widgetIcon}
                                                              <span className="truncate text-[9.5px]" title={labelText}>{displayLabel}</span>
                                                            </div>

                                                            {/* Widget Controls */}
                                                            <div className="flex items-center gap-0.5 opacity-0 group-hover/widn:opacity-100 transition-opacity shrink-0">
                                                              <button
                                                                onClick={(e) => { e.stopPropagation(); moveWidget(sec.id, row.id, col.id, wid.id, 'up'); }}
                                                                disabled={wIdx === 0}
                                                                className="p-0.5 text-slate-500 hover:text-white disabled:opacity-30 cursor-pointer"
                                                              >
                                                                <ChevronUp className="w-2.5 h-2.5" />
                                                              </button>
                                                              <button
                                                                onClick={(e) => { e.stopPropagation(); moveWidget(sec.id, row.id, col.id, wid.id, 'down'); }}
                                                                disabled={isLastWid}
                                                                className="p-0.5 text-slate-500 hover:text-white disabled:opacity-30 cursor-pointer"
                                                              >
                                                                <ChevronDown className="w-2.5 h-2.5" />
                                                              </button>
                                                              <button
                                                                onClick={(e) => { e.stopPropagation(); deleteWidget(sec.id, row.id, col.id, wid.id); }}
                                                                className="p-0.5 text-rose-500 hover:text-rose-400 cursor-pointer"
                                                              >
                                                                <X className="w-2.5 h-2.5" />
                                                              </button>
                                                            </div>
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

          {/* Section 2: Unified Interactive Widget Library Explorer */}
          {selectedPage && (
            <div className="p-4 space-y-4">
              <span className="text-slate-400 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <Grid className="w-4 h-4 text-[#D4AF37]" />
                <span>{t('مكتبة العناصر الذكية', 'Smart Widget Library')}</span>
              </span>
              
              {!selectedColId && (
                <div className="bg-amber-500/10 border border-amber-500/25 rounded-md p-2.5 text-[10px] text-amber-300 leading-relaxed text-center">
                  ⚠️ {t('اختر عموداً (Col) من شجرة الصفحة أعلاه ثم اضغط على المكون لإدراجه في المنظور.', 'Select a column (Col) in the Layout Tree Navigator above, then click any widget below to instantiate.')}
                </div>
              )}

              {selectedColId && (
                <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-md p-2 text-[10px] text-emerald-300 leading-relaxed text-center">
                  ✅ {t('سيتم إدراج المكون في العمود المختار بنجاح.', 'Ready to insert widget inside the selected column.')}
                </div>
              )}

              {/* Categorized Accordion Nest */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {['TEXT', 'BUTTONS', 'MEDIA', 'CONTENT', 'SOCIAL', 'BUSINESS', 'CONTACT'].map((catKey) => {
                  const catWidgets = getWidgetByCategory(catKey as WidgetCategoryType);
                  const isOpen = expandedCategory === catKey;
                  
                  // Style colors per category for rich design pairing
                  let colorClass = "text-amber-400";
                  let bgHover = "hover:border-amber-500/20";
                  if (catKey === 'BUTTONS') { colorClass = "text-orange-400"; bgHover = "hover:border-orange-500/20"; }
                  else if (catKey === 'MEDIA') { colorClass = "text-emerald-400"; bgHover = "hover:border-emerald-500/20"; }
                  else if (catKey === 'CONTENT') { colorClass = "text-indigo-400"; bgHover = "hover:border-indigo-500/20"; }
                  else if (catKey === 'SOCIAL') { colorClass = "text-purple-400"; bgHover = "hover:border-purple-500/20"; }
                  else if (catKey === 'BUSINESS') { colorClass = "text-sky-400"; bgHover = "hover:border-sky-500/20"; }
                  else if (catKey === 'CONTACT') { colorClass = "text-rose-400"; bgHover = "hover:border-rose-500/20"; }

                  return (
                    <div key={catKey} className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/10 transition-colors">
                      {/* Accordion Header */}
                      <button
                        onClick={() => setExpandedCategory(isOpen ? null : catKey)}
                        className="w-full px-3 py-2 bg-slate-900/60 hover:bg-slate-900 flex items-center justify-between text-xs cursor-pointer select-none font-bold"
                      >
                        <span className="flex items-center gap-2 font-black">
                          <span className={`w-1.5 h-1.5 rounded-full bg-current ${colorClass}`} />
                          <span className="text-slate-200 text-[11px] font-mono tracking-wider">{catKey}</span>
                        </span>
                        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Accordion Content items list */}
                      {isOpen && (
                        <div className="p-2 bg-slate-950/40 grid grid-cols-1 gap-1.5 transition-all">
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
                                <span className={`text-[10px] uppercase font-mono tracking-widest ${colorClass}`}>
                                  {w.type.split('_').join(' ')}
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

          {/* Section 3: Versions History logs */}
          <div className="p-4 space-y-4 flex-1 flex flex-col justify-end">
            <span className="text-slate-400 text-xs font-black uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-400" />
              <span>{t('تاريخ النسخ الاحتياطية', 'Version Control History')}</span>
            </span>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {versions.length === 0 ? (
                <div className="text-slate-600 text-[10px] text-center font-bold font-serif py-3">
                  {t('لا توجد نسخ سابقة حتى الآن. سيقوم النظام بحفظ نسخة عند كل ضغط على المزامنة.', 'No older backup sessions logged yet. Auto logs update upon saving.')}
                </div>
              ) : (
                versions.map((ver) => (
                  <div 
                    key={ver.id}
                    className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-[11px] gap-2"
                  >
                    <div className="space-y-0.5 truncate text-right">
                      <span className="block font-black text-slate-300 truncate">{ver.versionName}</span>
                      <span className="block text-[9px] text-slate-500">{new Date(ver.createdAt).toLocaleString('ar-EG')}</span>
                    </div>

                    <button
                      onClick={() => handleRestoreVersion(ver.id)}
                      className="px-2 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 rounded text-[9px] text-indigo-300 font-bold cursor-pointer transition-all active:scale-95"
                    >
                      {t('استعادة', 'Restore')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>

      {sidebarActiveTab === 'library' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-950">
          {/* 1. Layout Library Sub Tabs Switcher */}
          <div className="flex bg-slate-900/60 p-1 sticky top-0 z-10 shrink-0 border-b border-slate-800/60">
            <button
              onClick={() => setLibraryActiveSubTab('sections')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                libraryActiveSubTab === 'sections'
                  ? 'bg-[#D4AF37] text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              {t('أقسام جاهزة', 'Sections')}
            </button>
            <button
              onClick={() => setLibraryActiveSubTab('pages')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                libraryActiveSubTab === 'pages'
                  ? 'bg-[#D4AF37] text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              {t('صفحات جاهزة', 'Pages')}
            </button>
            <button
              onClick={() => setLibraryActiveSubTab('custom')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                libraryActiveSubTab === 'custom'
                  ? 'bg-[#D4AF37] text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              {t('المستودع الخاص', 'My Designs')}
            </button>
          </div>

          {/* 2. Sub tab contents */}
          <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-800/80">
            {/* SECTIONS LAYOUTS */}
            {libraryActiveSubTab === 'sections' && (
              <div className="space-y-3 pt-1">
                <div className="text-[10px] text-slate-500 text-right leading-relaxed mb-2 font-sans">
                  {t('اختر تخطيط القسم وأدرجه أسفل صفحتك أو استبدل به قسماً محدداً.', 'Select a pre-designed section layout template to insert or replace.')}
                </div>

                {/* We can use standard sections categorised */}
                {['hero', 'about', 'services', 'testimonials', 'features', 'pricing', 'faq', 'contact', 'footers'].map((catKey) => {
                  const tpls = SECTION_TEMPLATES.filter(x => x.category === catKey);
                  const isOpen = expandedSectionLibraryCat === catKey;
                  return (
                    <div key={catKey} className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/10 mb-2">
                      <button
                        onClick={() => setExpandedSectionLibraryCat(isOpen ? null : catKey)}
                        className="w-full px-3 py-2 bg-slate-900/40 hover:bg-slate-900 flex items-center justify-between text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-1.5 capitalize text-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          <span>{catKey}</span>
                          <span className="text-[9px] text-slate-500 font-mono">({tpls.length})</span>
                        </span>
                        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isOpen && (
                        <div className="p-2.5 bg-slate-950/20 divide-y divide-slate-800/60 font-sans text-right">
                          {tpls.length === 0 ? (
                            <div className="text-[10px] text-slate-600 text-center py-2">
                              {t('لا توجد قوالب متوفرة حالياً لهذه الفئة.', 'No sections available in this segment yet.')}
                            </div>
                          ) : (
                            tpls.map((tpl) => (
                              <div key={tpl.key} className="py-2.5 first:pt-1 last:pb-1 space-y-2">
                                <div className="space-y-0.5">
                                  <h5 className="text-[11px] font-black text-slate-200">
                                    {language === 'ar' ? tpl.nameAr : tpl.nameEn}
                                  </h5>
                                  <p className="text-[9px] text-slate-500 leading-normal">
                                    {language === 'ar' ? tpl.descAr : tpl.descEn}
                                  </p>
                                </div>

                                <div className="flex gap-1.5 justify-start">
                                  <button
                                    onClick={() => {
                                      handleInsertSectionTemplate(tpl.sectionData);
                                    }}
                                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-slate-950 rounded text-[9.5px] font-black cursor-pointer transition-colors shadow-sm flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3 shrink-0" />
                                    <span>{t('إدراج بالهيكل', 'Insert Section')}</span>
                                  </button>
                                  
                                  {selectedSectionId && (
                                    <button
                                      onClick={() => {
                                        handleReplaceSectionTemplate(tpl.sectionData);
                                      }}
                                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-[9.5px] font-bold cursor-pointer transition-colors"
                                    >
                                      {t('استبدال المحدد', 'Replace Selected')}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* PAGES LAYOUTS */}
            {libraryActiveSubTab === 'pages' && (
              <div className="space-y-3 pt-1">
                <div className="text-[10px] text-slate-500 leading-relaxed mb-2 font-sans text-right">
                  {t('يمكنك دمج أقسام القالب الكامل بصفحتك أو استبدال تخطيط صفحتك بالكامل بقالب معد مسبقاً.', 'Merge entire template sections or start pure with preset designs.')}
                </div>

                {TEMPLATE_CATEGORIES.map((cat) => {
                  const tpls = PAGE_TEMPLATES.filter(x => x.category === cat.key);
                  const isOpen = expandedPageLibraryCat === cat.key;
                  return (
                    <div key={cat.key} className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/10 mb-2">
                      <button
                        onClick={() => setExpandedPageLibraryCat(isOpen ? null : cat.key)}
                        className="w-full px-3 py-2 bg-slate-900/40 hover:bg-slate-900 flex items-center justify-between text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-1.5 text-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{language === 'ar' ? cat.labelAr : cat.labelEn}</span>
                          <span className="text-[9px] text-slate-500 font-mono">({tpls.length})</span>
                        </span>
                        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isOpen && (
                        <div className="p-2.5 bg-slate-950/20 divide-y divide-slate-800/60 font-sans text-right space-y-3">
                          <div className="text-[9px] text-slate-400 leading-normal border-b border-slate-800/40 pb-1.5">
                            {language === 'ar' ? cat.descriptionAr : cat.descriptionEn}
                          </div>

                          {tpls.length === 0 ? (
                            <div className="text-[10px] text-slate-600 text-center py-2">
                              {t('لا توجد صفحات جاهزة مسجلة هنا حتى الآن.', 'No page layouts found in this index.')}
                            </div>
                          ) : (
                            tpls.map((tpl) => (
                              <div key={tpl.key} className="py-2.5 first:pt-0 last:pb-0 space-y-2">
                                <div className="space-y-0.5">
                                  <h5 className="text-[11px] font-black text-[#D4AF37]">
                                    {language === 'ar' ? tpl.nameAr : tpl.nameEn}
                                  </h5>
                                  <p className="text-[9px] text-slate-500 leading-normal">
                                    {language === 'ar' ? tpl.descAr : tpl.descEn}
                                  </p>
                                </div>

                                <div className="flex gap-1.5 justify-start">
                                  <button
                                    onClick={() => {
                                      handleInsertPageTemplate(tpl);
                                    }}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded text-[9.5px] font-black cursor-pointer transition-colors shadow-sm"
                                  >
                                    {t('دمج بالصفحة', 'Merge Sections')}
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(t('سيتم مسح كافة أقسام الصفحة الحالية لتطبيق القالب. هل تحب المتابعة؟', 'This replaces current sections layout totally. Do you accept?'))) {
                                        handleReplacePageTemplate(tpl);
                                      }
                                    }}
                                    className="px-2 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 rounded text-[9.5px] text-rose-300 font-bold cursor-pointer transition-colors"
                                  >
                                    {t('بدء جديد بالقالب', 'Replace Entire Page')}
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* CUSTOM SAVED CATS */}
            {libraryActiveSubTab === 'custom' && (
              <div className="space-y-4 pt-1 text-right font-sans">
                {/* Section Templates saved */}
                <div className="space-y-2 pb-3">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                    <FolderHeart className="w-3.5 h-3.5 text-indigo-400 font-bold" />
                    <span>{t('أقسام مخصصة محفوظة', 'My Saved Custom Sections')}</span>
                  </span>

                  {customSections.length === 0 ? (
                    <div className="text-[10px] text-slate-600 text-center py-4 bg-slate-900/30 border border-slate-900 border-dashed rounded-lg">
                      {t('لا توجد أقسام مسجلة حتى الآن.', 'Empty custom section template bucket.')}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {customSections.map((item) => (
                        <div key={item.key} className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-lg flex flex-col gap-2">
                          <div className="space-y-0.5">
                            <span className="block font-black text-[11px] text-slate-200">
                              {language === 'ar' ? item.nameAr : item.nameEn}
                            </span>
                            <span className="block text-[9px] text-slate-500 leading-normal">
                              {language === 'ar' ? item.descAr : item.descEn}
                            </span>
                          </div>

                          <div className="flex gap-1 justify-start">
                            <button
                              onClick={() => {
                                handleInsertSectionTemplate(item.sectionData);
                                triggerNotice(t('تم إدراج القسم المخصص المطور بنجاح!', 'Custom section successfully appended!'));
                              }}
                              className="px-1.5 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-slate-950 rounded text-[9px] font-black cursor-pointer"
                            >
                              {t('إدراج', 'Insert')}
                            </button>
                            <button
                              onClick={() => handleExportTemplate('section', item)}
                              className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-[9px] font-bold cursor-pointer"
                              title={t('تصدير كـ JSON', 'Export as JSON')}
                            >
                              <Download className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateCustomTemplate('section', item)}
                              className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-[9px] font-bold cursor-pointer"
                              title={t('مضاعفة القالب', 'Duplicate')}
                            >
                              <Copy className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomTemplate('section', item.key)}
                              className="px-1.5 py-0.5 bg-rose-950/80 text-rose-300 hover:text-white border border-rose-900 rounded text-[9px] font-bold cursor-pointer"
                              title={t('حذف القالب نهائياً', 'Delete')}
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Page Templates saved */}
                <div className="space-y-2 pt-1 border-t border-slate-900">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                    <FolderHeart className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('تخطيطات مستهدفة محفوظة', 'My Saved Full Pages')}</span>
                  </span>

                  {customPages.length === 0 ? (
                    <div className="text-[10px] text-slate-600 text-center py-4 bg-slate-900/30 border border-slate-900 border-dashed rounded-lg">
                      {t('لا توجد تخطيطات صفحة مسجلة حتى الآن.', 'Empty custom page template bucket.')}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {customPages.map((item) => (
                        <div key={item.key} className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-lg flex flex-col gap-2">
                          <div className="space-y-0.5">
                            <span className="block font-black text-[11px] text-slate-200">
                              {language === 'ar' ? item.nameAr : item.nameEn}
                            </span>
                            <span className="block text-[9px] text-slate-500 leading-normal">
                              {language === 'ar' ? item.descAr : item.descEn}
                            </span>
                          </div>

                          <div className="flex gap-1 justify-start">
                            <button
                              onClick={() => {
                                handleInsertPageTemplate(item);
                                triggerNotice(t('تم دمج أقسام الصفحة المخصصة بنجاح!', 'Added sections from custom page setup!'));
                              }}
                              className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded text-[9px] font-black cursor-pointer"
                            >
                              {t('دمج أقسام', 'Merge')}
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(t('سيتم تطبيق قالب الصفحة الكامل على صفحتك الحالية. هل تود بالتأكيد المتابعة؟', 'Apply custom page layout? This cleans current selections.'))) {
                                  handleReplacePageTemplate(item);
                                }
                              }}
                              className="px-1.5 py-0.5 bg-rose-950/80 text-rose-300 hover:text-white border border-rose-900 rounded text-[9px] font-bold cursor-pointer"
                            >
                              {t('تجاوز', 'Replace')}
                            </button>
                            <button
                              onClick={() => handleExportTemplate('page', item)}
                              className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-[9px] font-bold cursor-pointer font-mono"
                              title={t('تصدير كـ JSON', 'Export')}
                            >
                              <Download className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateCustomTemplate('page', item)}
                              className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-[9px] font-bold cursor-pointer"
                              title={t('مضاعفة القالب', 'Duplicate')}
                            >
                              <Copy className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomTemplate('page', item.key)}
                              className="px-1.5 py-0.5 bg-rose-950/80 text-rose-300 hover:text-white border border-rose-900 rounded text-[9px] font-bold cursor-pointer"
                              title={t('حذف القالب نهائياً', 'Delete')}
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {sidebarActiveTab === 'design_system' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-950">
          <DesignSystemManager
            language={language}
            activeConfig={designSystem}
            onChange={(cfg) => setDesignSystem(cfg)}
          />
        </div>
      )}

      {sidebarActiveTab === 'components' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-950">
          <ReusableComponentsManager
            language={language}
            onInsertWidget={(widget) => {
              if (!selectedPage) return;
              if (selectedSectionId && selectedRowId && selectedColId) {
                const updatedPages = pages.map(page => {
                  if (page.id !== selectedPage.id) return page;
                  const cloned = JSON.parse(JSON.stringify(page)) as VisualPage;
                  cloned.sections = cloned.sections.map(sec => {
                    if (sec.id !== selectedSectionId) return sec;
                    sec.rows = sec.rows.map(row => {
                      if (row.id !== selectedRowId) return row;
                      row.columns = row.columns.map(col => {
                        if (col.id !== selectedColId) return col;
                        col.widgets.push(widget);
                        return col;
                      });
                      return row;
                    });
                    return sec;
                  });
                  return cloned;
                });
                setPages(updatedPages);
                const activeP = updatedPages.find(p => p.id === selectedPage.id);
                if (activeP) setSelectedPage(activeP);
                triggerNotice(t('تم إدراج المكون المشترك داخل العمود الموحد!', 'Reusable component successfully inserted!'));
              } else {
                alert(t('الرجاء اختيار عمود (Column) في لوحة العمل أولاً لإضافة المكون المشترك داخله.', 'Please select a Column in the workspace first to insert the reusable component.'));
              }
            }}
          />
        </div>
      )}

      {sidebarActiveTab === 'assets' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-950">
          <AssetManager
            language={language}
            onSelectUrl={(url) => {
              navigator.clipboard.writeText(url);
              triggerNotice(t('تم نسخ رابط الأصل لمحافظتك! يمكنك إلصاقه في أي إعداد.', 'Asset Reference link copied! Paste it in any field.'));
            }}
          />
        </div>
      )}

    </aside>

    {/* Center Panel: Editor Canvas stage with device preview constraints */}
    <main id="builder-canvas-stage" className="flex-1 bg-slate-950 p-6 flex flex-col overflow-auto relative h-full">
          
          {/* Zoom controls bar */}
          <div className="w-full flex justify-between items-center px-4 py-2 shrink-0 border-b border-slate-900 bg-slate-905 mb-4 rounded-xl select-none">
            <div className="text-[10.5px] text-slate-400 font-mono">
              {t('مرحلة التحرير الفني المباشر', 'Visual Canvas Preview (WYSIWYG Mode)')}
            </div>
            {/* Zoom Levels Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
              <span className="text-[10px] text-slate-300 px-1">{t('نسبة العرض:', 'Zoom:')}</span>
              {[50, 75, 100, 125, 150].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setZoom(lvl)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${zoom === lvl ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  {lvl}%
                </button>
              ))}
            </div>
          </div>

          {!selectedPage ? (
            <div className="my-auto mx-auto text-center space-y-3 p-10 bg-slate-900 border border-slate-800 rounded-2xl max-w-sm">
              <Sparkles className="w-12 h-12 text-[#D4AF37] mx-auto animate-pulse" />
              <h4 className="font-sans font-bold text-sm text-slate-200">{t('لا توجد صفحة معروضة', 'No Page selected')}</h4>
              <p className="text-slate-500 text-xs">{t('يرجى إنشاء صفحة مخصصة للبدء في تشييد المخطط وتجربة المحرر المباشر.', 'Kindly initialize a custom layout page to begin constructing visual assets.')}</p>
            </div>
          ) : (
            // Canvas box Wrapper to prevent scaling clipping
            <div className="flex-1 w-full flex items-start justify-center overflow-auto min-h-0">
              <div
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  width: previewSize === 'desktop' ? '100%' : previewSize === 'tablet' ? '768px' : '375px',
                  minHeight: '600px',
                  height: 'calc(100% - 20px)'
                }}
                className="transition-all duration-300 ease-in-out shrink-0"
              >
                <div
                  className="bg-white text-slate-900 shadow-2xl rounded-2xl border-4 border-slate-800 overflow-hidden flex flex-col h-full w-full"
                >
                  {/* Fake Browser/Device Frame bar */}
                  <div className="bg-slate-100 border-b border-neutral-200 px-4 py-3 shrink-0 flex items-center justify-between select-none">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-400" />
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="px-3 py-1 bg-white/80 border border-neutral-300 rounded text-[10px] text-neutral-500 font-mono w-1/3 truncate text-center font-bold">
                      /{selectedPage.slug}
                    </div>
                    <div className="w-8" />
                  </div>

                  {/* Dynamic Pages Canvas Body */}
                  <div 
                    id="builder-inner-canvas-scroll"
                    className="flex-1 overflow-y-auto bg-neutral-50"
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  >
                    {selectedPage.sections.map((sec) => {
                      const isSecSelected = selectedSectionId === sec.id && selectedElType === 'section';
                      const hasHeroSlider = sec.rows?.some((row: any) =>
                        row.columns?.some((col: any) =>
                          col.widgets?.some((wid: any) => wid.type === 'hero_slider')
                        )
                      );
                      const sectionBackground = sec.background || {
                        mode: sec.backgroundMode || (sec.backgroundImageUrl ? 'image' : 'solid'),
                        color: sec.backgroundColor || '#ffffff',
                        imageUrl: sec.backgroundImageUrl || '',
                        overlayOpacity: sec.backgroundImageOverlayOpacity ?? 65,
                      };
                      const isSectionImageBackground = (sectionBackground.mode || 'solid') === 'image' && Boolean(sectionBackground.imageUrl);
                      const sectionBackgroundStyle: React.CSSProperties = isSectionImageBackground
                        ? {
                            backgroundColor: sectionBackground.color || '#ffffff',
                            backgroundImage: `linear-gradient(rgba(2, 6, 23, ${Math.max(0, Math.min(100, Number(sectionBackground.overlayOpacity ?? 65))) / 100}), rgba(2, 6, 23, ${Math.max(0, Math.min(100, Number(sectionBackground.overlayOpacity ?? 65))) / 100})), url(${sectionBackground.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                          }
                        : {
                            backgroundColor: sectionBackground.color || sec.backgroundColor || '#ffffff',
                          };
                      return (
                        <div
                          key={sec.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSectionId(sec.id);
                            setSelectedRowId(null);
                            setSelectedColId(null);
                            setSelectedWidgetId(null);
                            setSelectedElType('section');
                          }}
                          onContextMenu={(e) => handleContextMenu(e, sec.id, 'section')}
                          className={`relative group/sec transition-all ${
                            isSecSelected ? 'ring-2 ring-indigo-500 ring-inset bg-indigo-50/20' : ''
                          } ${!sec.visible ? 'opacity-35 bg-neutral-200/50' : ''}`}
                          style={{
                            ...sectionBackgroundStyle,
                            paddingTop: hasHeroSlider ? '0' : (sec.paddingY === 'large' ? '4rem' : sec.paddingY === 'medium' ? '2.5rem' : sec.paddingY === 'small' ? '1rem' : '0'),
                            paddingBottom: hasHeroSlider ? '0' : (sec.paddingY === 'large' ? '4rem' : sec.paddingY === 'medium' ? '2.5rem' : sec.paddingY === 'small' ? '1rem' : '0'),
                          }}
                        >
                          
                          {/* Section Controls Toolbar Overlay */}
                          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 opacity-0 group-hover/sec:opacity-100 transition-opacity bg-slate-900 border border-slate-800 rounded p-1">
                            <span className="text-[9px] font-bold text-slate-400 px-1 font-serif">
                              {t(sec.nameAr, sec.nameEn)}
                            </span>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSectionVisibility(sec.id);
                              }}
                              className="p-1 text-slate-400 hover:text-white"
                              title={sec.visible ? t('إخفاء من العرض العامة', 'Hide from Public') : t('إظهار للعامة', 'Show to Public')}
                            >
                              {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                            </button>
 
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateSection(sec.id);
                              }}
                              className="p-1 text-emerald-400 hover:text-white"
                              title={t('تكرار القسم', 'Duplicate Section')}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
 
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSection(sec.id);
                              }}
                              className="p-1 text-rose-400 hover:text-white"
                              title={t('حذف القسم', 'Delete Section')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
 
                          {/* Content Rows inside Section */}
                          <div className={hasHeroSlider ? "w-full space-y-0 px-0" : "max-w-4xl mx-auto px-4 space-y-6"}>
                            {sec.rows.map((row) => {
                              const isRowSelected = selectedRowId === row.id && selectedElType === 'row';
                              return (
                                <div
                                  key={row.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSectionId(sec.id);
                                    setSelectedRowId(row.id);
                                    setSelectedColId(null);
                                    setSelectedWidgetId(null);
                                    setSelectedElType('row');
                                  }}
                                  onContextMenu={(e) => handleContextMenu(e, row.id, 'row', sec.id)}
                                  className={`relative group/row grid gap-4 border border-dashed rounded-xl p-3 transition-all ${
                                    isRowSelected ? 'ring-2 ring-emerald-500 border-solid bg-emerald-50/15' : 'border-neutral-200/60 hover:border-neutral-350'
                                  }`}
                                  style={{
                                    gridTemplateColumns: `repeat(12, minmax(0, 1fr))`
                                  }}
                                >
                                  
                                  {/* Row metadata header bar */}
                                  <div className="absolute bottom-1 right-2 opacity-0 group-hover/row:opacity-60 text-[8px] text-slate-500 font-mono">
                                    Row Layout Wrapper
                                  </div>

                                  {/* Columns container */}
                                  {row.columns.map((col) => {
                                    const isColSelected = selectedColId === col.id && selectedElType === 'column';
                                    return (
                                      <div
                                        key={col.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedSectionId(sec.id);
                                          setSelectedRowId(row.id);
                                          setSelectedColId(col.id);
                                          setSelectedWidgetId(null);
                                          setSelectedElType('column');
                                        }}
                                        onContextMenu={(e) => handleContextMenu(e, col.id, 'column', sec.id, row.id)}
                                        className={`relative border border-dotted p-3 rounded-lg flex flex-col justify-center min-h-[70px] transition-all cursor-pointer ${
                                          isColSelected ? 'ring-2 ring-amber-500 ring-inset border-solid bg-amber-50/10' : 'border-neutral-200/50 hover:border-neutral-300'
                                        }`}
                                        style={{
                                          gridColumn: `span ${col.span} / span ${col.span}`
                                        }}
                                      >
                                        
                                        {/* Widgets Render Flow */}
                                        {col.widgets.length === 0 ? (
                                          <div className="text-center py-4 text-[10px] text-slate-400 font-bold border border-dashed border-neutral-350 rounded bg-slate-55">
                                            {t('عمود فارغ - انقر لإدراج عناصر', 'Empty column - Click to insert components')}
                                          </div>
                                        ) : (
                                          <div className="space-y-4">
                                            {col.widgets.map((wid, wIdx) => {
                                              const isWidSelected = selectedWidgetId === wid.id && selectedElType === 'widget';
                                              const itemRef = WIDGET_REGISTRY.find(it => it.type === wid.type);
                                              const label = itemRef ? (language === 'ar' ? itemRef.labelAr : itemRef.labelEn) : wid.type.toUpperCase();
                                              
                                              return (
                                                <div
                                                  key={wid.id}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedSectionId(sec.id);
                                                    setSelectedRowId(row.id);
                                                    setSelectedColId(col.id);
                                                    setSelectedWidgetId(wid.id);
                                                    setSelectedElType('widget');
                                                  }}
                                                  onContextMenu={(e) => handleContextMenu(e, wid.id, 'widget', sec.id, row.id, col.id)}
                                                  className={`relative group/wid p-3 rounded-xl border transition-all select-none ${
                                                    isWidSelected ? 'ring-2 ring-indigo-500 border-indigo-400 bg-indigo-50/5' : 'border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                                                  }`}
                                                >
                                                  
                                                  {/* Dynamic Widget Toolbar Overlays */}
                                                  <div className="absolute -top-2.5 right-2 z-20 opacity-0 group-hover/wid:opacity-100 transition-opacity bg-slate-950 border border-slate-800 text-[9px] text-white px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-xl" dir="rtl">
                                                    <span className="font-bold text-[#D4AF37]">{label}</span>
                                                    <div className="w-px h-2.5 bg-slate-800" />
                                                    
                                                    {/* Reordering Controls */}
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        moveWidget(sec.id, row.id, col.id, wid.id, 'up');
                                                      }}
                                                      disabled={wIdx === 0}
                                                      className="text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                                                      title={t('نقل لأعلى', 'Move Up')}
                                                    >
                                                      <ChevronUp className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        moveWidget(sec.id, row.id, col.id, wid.id, 'down');
                                                      }}
                                                      disabled={wIdx === col.widgets.length - 1}
                                                      className="text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                                                      title={t('نقل لأسفل', 'Move Down')}
                                                    >
                                                      <ChevronDown className="w-3 h-3" />
                                                    </button>
 
                                                    <div className="w-px h-2.5 bg-slate-800" />
 
                                                    {/* Copy / Duplicate Reusability Trigger */}
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        duplicateWidget(sec.id, row.id, col.id, wid);
                                                      }}
                                                      className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
                                                      title={t('تكرار وحفظ المكون كنسخة', 'Duplicate / Reuse Widget')}
                                                    >
                                                      <Copy className="w-3 h-3" />
                                                    </button>
 
                                                    {/* Delete Controls */}
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteWidget(sec.id, row.id, col.id, wid.id);
                                                      }}
                                                      className="text-rose-400 hover:text-rose-300 cursor-pointer"
                                                      title={t('حذف', 'Delete')}
                                                    >
                                                      <Trash2 className="w-3 h-3" />
                                                    </button>
                                                  </div>
 
                                                  {/* Dynamic High-End Element Compilation */}
                                                  <WidgetRenderer widget={wid} language={language} />
                                                 
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
 
                                      </div>
                                    );
                                  })}
 
                                </div>
                              );
                            })}
                          </div>
 
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Panel: Detail Configuration Properties Panel */}
        <RightSidebarPanel
          language={language}
          selectedPage={selectedPage}
          selectedElType={selectedElType}
          setSelectedElType={setSelectedElType}
          selectedSectionId={selectedSectionId}
          setSelectedSectionId={setSelectedSectionId}
          selectedRowId={selectedRowId}
          setSelectedRowId={setSelectedRowId}
          selectedColId={selectedColId}
          setSelectedColId={setSelectedColId}
          selectedWidgetId={selectedWidgetId}
          setSelectedWidgetId={setSelectedWidgetId}
          
          sidebarActiveTab={sidebarActiveTab}
          setSidebarActiveTab={setSidebarActiveTab}
          
          sidebarWidth={sidebarWidth}
          handleMouseDown={handleMouseDown}
          
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          hiddenElements={hiddenElements}
          setHiddenElements={setHiddenElements}
          lockedElements={lockedElements}
          setLockedElements={setLockedElements}
          
          versions={versions}
          handleRestoreVersion={handleRestoreVersion}
          
          designSystem={designSystem}
          setDesignSystem={setDesignSystem}
          
          updatePageSettings={updatePageSettings}
          setSelectedPage={setSelectedPage}
          handleUpdateElementSetting={handleUpdateElementSetting}
          addWidget={addWidget}
          deleteWidget={deleteWidget}
          addSection={addSection}
          triggerNotice={triggerNotice}
          currentWidget={currentWidget}
        />

      </div>

      {/* Initialize / Create new page modal view */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 text-right"
              dir="rtl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-sans font-black text-sm text-[#D4AF37] flex items-center gap-1.5">
                  <PlusCircle className="w-5 h-5 text-emerald-400" />
                  <span>تخطيط وتشييد صفحة مخصصة جديدة</span>
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePage} className="space-y-4 font-sans text-right">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">عنوان الصفحة باللغة العربية *</label>
                  <input
                    type="text"
                    required
                    value={newPageTitleAr}
                    onChange={(e) => setNewPageTitleAr(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white text-right focus:outline-none focus:border-indigo-500"
                    placeholder="مثال: من خدمات النخبة السكنية"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">عنوان الصفحة باللغة الإنجليزية *</label>
                  <input
                    type="text"
                    required
                    value={newPageTitleEn}
                    onChange={(e) => setNewPageTitleEn(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white text-right focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Premium Relocation Services"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">الرابط الفرعي (Slug) *</label>
                  <input
                    type="text"
                    required
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-emerald-400 text-right focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="vip-concierge-care"
                  />
                  <span className="text-[10px] text-slate-500 block">يحظر إدخال المسافات والرموز الخاصة، استخدم الأحرف الإنجليزية والشرطات فقط.</span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-lg text-xs transition-all shadow-xl font-sans"
                  >
                    تأكيد وتأسيس الصفحة فارغة بالمحاذاة
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isSaveTemplateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 text-right"
              dir="rtl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-sans font-black text-sm text-[#D4AF37] flex items-center gap-1.5">
                  <FolderHeart className="w-5 h-5 text-red-400" />
                  <span>
                    {saveTemplateType === 'section' 
                      ? t('حفظ القسم كقالب مخصص مكرر', 'Save Section as Custom Template') 
                      : t('حفظ تخطيط الصفحة كقالب مخصص متكامل', 'Save Page Layout as Custom Template')}
                  </span>
                </h3>
                <button
                  onClick={() => setIsSaveTemplateModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 font-sans text-right">
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  {saveTemplateType === 'section'
                    ? t('احفظ هذا القسم بتصميمه ومكوناته وألوانه الفريدة ليسهل إدراجه أو استبداله في أي صفحة أخرى أو تصديره للمشاركة.', 'Save this section layout with its bespoke widgets, colors, and margins so you can reuse or export it instantly.')
                    : t('احفظ كامل تخطيط هذه الصفحة بمظهرها وأقسامها المنسقة لتصبح قالب تملك معتمد بالمكتبة الشخصية.', 'Save the entire page layout of sections as a unified, production-ready private catalog template.')}
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">{t('اسم القالب (بالعربية) *', 'Template Name (Arabic) *')}</label>
                  <input
                    type="text"
                    required
                    value={saveTemplateNameAr}
                    onChange={(e) => setSaveTemplateNameAr(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white text-right focus:outline-none focus:border-indigo-500"
                    placeholder="مثال: من نحن - القسم الهيكلي"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">{t('اسم القالب (بالإنجليزية) *', 'Template Name (English) *')}</label>
                  <input
                    type="text"
                    required
                    value={saveTemplateNameEn}
                    onChange={(e) => setSaveTemplateNameEn(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white text-right focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. About Custom Block"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={handleConfirmSaveCustomTemplate}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-lg text-xs transition-all shadow-xl"
                  >
                    {t('حفظ القالب بالمكتبة', 'Confirm & Save Template')}
                  </button>
                  <button
                    onClick={() => setIsSaveTemplateModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs transition-all"
                  >
                    {t('إلغاء الأمر', 'Cancel')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
