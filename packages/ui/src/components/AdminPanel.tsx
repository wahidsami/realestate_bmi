/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  propertyRepository, 
  projectRepository, 
  inquiryRepository, 
  pageRepository,
  mediaRepository,
  settingsRepository
} from '../repositories';
import { Property, Project, Inquiry, PageContent, MediaItem, ActiveAdminTab, BilingualText, HeroSlide } from '../types';
import { getPropertyTypeFromText, getPropertyTypeLabel, type PropertyPresetType } from '@bina/shared';
import { 
  LayoutDashboard, 
  Milestone, 
  Building2, 
  Inbox, 
  FileText, 
  Image as ImageIcon, 
  Sliders, 
  ArrowLeft,
  DollarSign, 
  Upload, 
  Trash2, 
  CheckCircle, 
  HelpCircle,
  Eye,
  Key,
  Database,
  Plus,
  X,
  PlusCircle,
  Edit,
  MapPin,
  Globe,
  Film,
  FileText as FilePdf,
  Layers,
  Car,
  Lock,
  Waves,
  Dumbbell,
  ArrowUpDown,
  ShieldCheck,
  Shield,
  Compass,
  Smile,
  Trees,
  Bed,
  UserCheck,
  Cpu,
  Wifi,
  Tv,
  Coffee,
  Sun,
  Flame,
  Wind,
  Sparkles,
  GlassWater,
  Heart,
  Home,
  Grid,
  Book
} from 'lucide-react';
import { ArchitecturalPlanSVG } from './VectorGraphics';
import { ExcelImportEngine } from './ExcelImportEngine';
import { VisualPageBuilder } from './VisualPageBuilder';

interface AdminPanelProps {
  onBackToWebsite: () => void;
}

type UploadProgressState = {
  visible: boolean;
  label: string;
  progress: number;
  status: 'idle' | 'preparing' | 'uploading' | 'success' | 'error';
};

const SELECTABLE_AMENITY_ICONS = [
  { name: 'sparkles', icon: Sparkles, iconNameAr: 'شؤون فاخرة', iconNameEn: 'Luxury Highlight' },
  { name: 'wifi', icon: Wifi, iconNameAr: 'إنترنت واي فاي', iconNameEn: 'Wi-Fi' },
  { name: 'tv', icon: Tv, iconNameAr: 'ترفيه وشاشات', iconNameEn: 'Smart Media/TV' },
  { name: 'coffee', icon: Coffee, iconNameAr: 'صالة وقهوة', iconNameEn: 'Coffee Station' },
  { name: 'sun', icon: Sun, iconNameAr: 'مستأنس ومكشوف', iconNameEn: 'Sunny/Terrace' },
  { name: 'flame', icon: Flame, iconNameAr: 'تدفئة وتدفير', iconNameEn: 'Fireplace/Heating' },
  { name: 'wind', icon: Wind, iconNameAr: 'تكييف وتهوية', iconNameEn: 'Premium HVAC' },
  { name: 'key', icon: Key, iconNameAr: 'مفتاح ودخول آمن', iconNameEn: 'Keyless Access' },
  { name: 'heart', icon: Heart, iconNameAr: 'مميز واستثنائي', iconNameEn: 'Top-Rated Feature' },
  { name: 'home', icon: Home, iconNameAr: 'طابع فيلا مستقل', iconNameEn: 'Detached Residence' },
  { name: 'grid', icon: Grid, iconNameAr: 'تصميم بساطي ذكي', iconNameEn: 'Intelligent Grid' },
  { name: 'book', icon: Book, iconNameAr: 'صالة دراسة ومكتب', iconNameEn: 'Study/Library' },
  { name: 'car', icon: Car, iconNameAr: 'موقف خاص فسيح', iconNameEn: 'Secure Parking' },
  { name: 'lock', icon: Lock, iconNameAr: 'خزائن أو مستودع', iconNameEn: 'Private Garage' },
  { name: 'waves', icon: Waves, iconNameAr: 'مسابح أولمبية', iconNameEn: 'Scenic Pool' },
  { name: 'dumbbell', icon: Dumbbell, iconNameAr: 'صالة رياضية فتنس', iconNameEn: 'Executive Gym' },
  { name: 'shield', icon: Shield, iconNameAr: 'بوابات أمنية', iconNameEn: 'Sovereign Guard' },
  { name: 'trees', icon: Trees, iconNameAr: 'تشجير وممشى معشب', iconNameEn: 'Breezy Gardens' },
  { name: 'bed', icon: Bed, iconNameAr: 'جناح غرف نوم', iconNameEn: 'Bespoke Bedr' }
];

const getAdminAmenityIcon = (name?: string) => {
  const item = SELECTABLE_AMENITY_ICONS.find(i => i.name === (name || '').toLowerCase());
  return item ? item.icon : Sparkles;
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToWebsite }) => {
  const { staticT, t, language } = useLanguage();
  const { theme, updateThemeColors, settings, refreshTheme } = useTheme();

  // Tab State
  const [activeTab, setActiveTab] = useState<ActiveAdminTab>('dashboard');

  // Database Records
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [pages, setPages] = useState<PageContent[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  // Settings form local drafts (keep settings fully functional and customizable)
  const [primaryColorDraft, setPrimaryColorDraft] = useState(theme.primary);
  const [secondaryColorDraft, setSecondaryColorDraft] = useState(theme.secondary);
  const [accentColorDraft, setAccentColorDraft] = useState(theme.accent);
  const [emailDraft, setEmailDraft] = useState('');
  const [phoneDraft, setPhoneDraft] = useState('');
  const [addressArDraft, setAddressArDraft] = useState('');
  const [addressEnDraft, setAddressEnDraft] = useState('');

  // General Settings Drafts
  const [websiteNameArDraft, setWebsiteNameArDraft] = useState('');
  const [websiteNameEnDraft, setWebsiteNameEnDraft] = useState('');
  const [logoBase64Draft, setLogoBase64Draft] = useState('');
  const [faviconBase64Draft, setFaviconBase64Draft] = useState('');

  // Contact & Social Media Drafts
  const [whatsappDraft, setWhatsappDraft] = useState('');
  const [socialXDraft, setSocialXDraft] = useState('');
  const [socialInstagramDraft, setSocialInstagramDraft] = useState('');
  const [socialLinkedInDraft, setSocialLinkedInDraft] = useState('');
  const [socialTikTokDraft, setSocialTikTokDraft] = useState('');
  const [socialSnapchatDraft, setSocialSnapchatDraft] = useState('');
  const [heroSlidesDraft, setHeroSlidesDraft] = useState<HeroSlide[]>([]);

  // CMS Pages Editor States
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [pageTitleAr, setPageTitleAr] = useState('');
  const [pageTitleEn, setPageTitleEn] = useState('');
  const [pageSlugAr, setPageSlugAr] = useState('');
  const [pageSlugEn, setPageSlugEn] = useState('');
  const [pageContentAr, setPageContentAr] = useState('');
  const [pageContentEn, setPageContentEn] = useState('');
  const [pageSeoTitleAr, setPageSeoTitleAr] = useState('');
  const [pageSeoTitleEn, setPageSeoTitleEn] = useState('');
  const [pageSeoDescAr, setPageSeoDescAr] = useState('');
  const [pageSeoDescEn, setPageSeoDescEn] = useState('');
  const [pageStatus, setPageStatus] = useState<'draft' | 'published'>('published');
  const [pageParentId, setPageParentId] = useState('');

  // Media Library Upload States
  const [dragOver, setDragOver] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync draft states on load
  useEffect(() => {
    if (settings) {
      setPrimaryColorDraft(settings.primaryColor);
      setSecondaryColorDraft(settings.secondaryColor);
      setAccentColorDraft(settings.accentColor);
      setEmailDraft(settings.contactEmail);
      setPhoneDraft(settings.contactPhone);
      setAddressArDraft(settings.address.ar);
      setAddressEnDraft(settings.address.en);
      setWebsiteNameArDraft(settings.companyName?.ar || '');
      setWebsiteNameEnDraft(settings.companyName?.en || '');
      setLogoBase64Draft(settings.logoBase64 || '');
      setFaviconBase64Draft(settings.faviconBase64 || '');
      setWhatsappDraft(settings.whatsapp || '');
      setSocialXDraft(settings.socialX || '');
      setSocialInstagramDraft(settings.socialInstagram || '');
      setSocialLinkedInDraft(settings.socialLinkedIn || '');
      setSocialTikTokDraft(settings.socialTikTok || '');
      setSocialSnapchatDraft(settings.socialSnapchat || '');
      setHeroSlidesDraft(settings.heroSlides || []);
    }
  }, [settings]);

  // Load all data
  const loadAdminData = async () => {
    try {
      const props = await propertyRepository.getProperties();
      const projs = await projectRepository.getProjects();
      const inqs = await inquiryRepository.getInquiries();
      const pgs = await pageRepository.getPages();
      const media = await mediaRepository.getMediaItems();

      setProperties(props);
      setProjects(projs);
      setInquiries(inqs);
      setPages(pgs);
      setMediaItems(media);
    } catch (e) {
      console.error('Failed to load portal databases:', e);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, [activeTab]);

  const triggerNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Inquiry Status Handler
  const handleInquiryStatusChange = async (id: string, status: Inquiry['status']) => {
    try {
      await inquiryRepository.updateInquiryStatus(id, status);
      triggerNotice(language === 'ar' ? 'تم تحديث حالة الطلب عقارياً' : 'Inquiry status updated');
      void loadAdminData();
    } catch (error) {
      console.error('Failed to update inquiry status:', error);
      triggerNotice(language === 'ar' ? 'فشل تحديث حالة الطلب' : 'Failed to update inquiry');
    }
  };

  // Inquiry Delete Handler
  const handleInquiryDelete = async (id: string) => {
    try {
      await inquiryRepository.deleteInquiry(id);
      triggerNotice(language === 'ar' ? 'تم حذف الطلب' : 'Inquiry deleted');
      void loadAdminData();
    } catch (error) {
      console.error('Failed to delete inquiry:', error);
      triggerNotice(language === 'ar' ? 'فشل حذف الطلب' : 'Failed to delete inquiry');
    }
  };

  // Media Upload files reader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processAndSaveFile(files[0]);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      triggerNotice(language === 'ar' ? 'الرجاء اختيار ملف صورة صالح للشعار' : 'Please select a valid image file for logo');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setLogoBase64Draft(base64);
        triggerNotice(language === 'ar' ? 'تم اختيار الشعار بنجاح، يرجى حفظ التغييرات لتفعيله' : 'Logo loaded, save settings to apply change');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      triggerNotice(language === 'ar' ? 'الرجاء اختيار ملف صورة صالح للأيقونة المفضلة' : 'Please select a valid image file for favicon');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setFaviconBase64Draft(base64);
        triggerNotice(language === 'ar' ? 'تم اختيار الأيقونة المفضلة بنجاح، يرجى حفظ التغييرات لتفعيلها' : 'Favicon loaded, save settings to apply change');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSlideItem = () => {
    const newSlide: HeroSlide = {
      id: `slide_${Date.now()}`,
      title: { ar: 'تحفة معمارية جديدة ترسم الأفق', en: 'A New Architectural Masterwork Defining Horizons' },
      subtitle: { ar: 'مشاريع سكنية وتجارية نخبوية في الرياض وجدة بأعلى معايير الرفاهية والخصوصية.', en: 'Elite residential and commercial projects in Riyadh and Jeddah with maximum luxury and privacy.' },
      ctaText: { ar: 'تصفح مخزون العقارات', en: 'Browse Properties Inventory' },
      ctaPage: 'properties',
      base64Data: ''
    };
    setHeroSlidesDraft([...heroSlidesDraft, newSlide]);
    triggerNotice(language === 'ar' ? 'تم إضافة شريحة مخصصة في نهاية القائمة' : 'Added a new slide to the list');
  };

  const handleAddHeroSlideImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      triggerNotice(language === 'ar' ? 'الرجاء اختيار صورة صالحة' : 'Please upload a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setHeroSlidesDraft(prev => prev.map((s, i) => i === index ? { ...s, base64Data: base64 } : s));
        triggerNotice(language === 'ar' ? 'تم تجهيز صورة الشريحة بنجاح' : 'Slide image processed successfully');
      }
    };
    reader.readAsDataURL(file);
  };

  const processAndSaveFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      triggerNotice(language === 'ar' ? 'الرجاء اختيار ملف صورة صالح' : 'Please select a valid image file');
      return;
    }

    setPropertyUploadState({
      visible: true,
      label: language === 'ar' ? 'جارٍ رفع الصورة إلى مكتبة الوسائط' : 'Uploading image to media library',
      progress: 12,
      status: 'preparing',
    });

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setPropertyUploadState((current) => ({
          ...current,
          visible: true,
          progress: 35,
          status: 'uploading',
        }));

        try {
          await mediaRepository.createMediaItem(file.name, file.type, base64, {
            onUploadProgress: (progress) => {
              setPropertyUploadState((current) => ({
                ...current,
                visible: true,
                progress: Math.max(35, Math.min(95, 35 + Math.round(progress * 0.6))),
                status: 'uploading',
              }));
            },
          });
          setPropertyUploadState({
            visible: true,
            label: language === 'ar' ? 'تم رفع الصورة إلى مكتبة الوسائط' : 'Image uploaded to media library',
            progress: 100,
            status: 'success',
          });
          triggerNotice(language === 'ar' ? 'تم رفع الصورة وحفظها بنجاح' : 'Image uploaded successfully');
          loadAdminData();
          window.setTimeout(() => {
            resetPropertyUploadState();
          }, 1200);
        } catch (error) {
          console.error(error);
          setPropertyUploadState({
            visible: true,
            label: language === 'ar' ? 'فشل رفع الصورة إلى مكتبة الوسائط' : 'Failed to upload image to media library',
            progress: 100,
            status: 'error',
          });
          window.setTimeout(() => {
            resetPropertyUploadState();
          }, 1800);
        }
      }
    };
    reader.onerror = () => {
      setPropertyUploadState({
        visible: true,
        label: language === 'ar' ? 'فشل قراءة الملف' : 'Failed to read file',
        progress: 100,
        status: 'error',
      });
      window.setTimeout(() => {
        resetPropertyUploadState();
      }, 1800);
    };
    reader.readAsDataURL(file);
  };

  // Media File Delete Handler
  const handleMediaDelete = async (id: string) => {
    try {
      await mediaRepository.deleteMediaItem(id);
      triggerNotice(language === 'ar' ? 'تم حذف الوسائط' : 'Media item deleted');
      void loadAdminData();
    } catch (error) {
      console.error('Failed to delete media item:', error);
      triggerNotice(language === 'ar' ? 'فشل حذف الوسائط' : 'Failed to delete media');
    }
  };

  // Save Settings & Update Themes Real-time
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsRepository.updateSettings({
        companyName: {
          ar: websiteNameArDraft,
          en: websiteNameEnDraft
        },
        contactEmail: emailDraft,
        contactPhone: phoneDraft,
        address: {
          ar: addressArDraft,
          en: addressEnDraft
        },
        logoBase64: logoBase64Draft,
        faviconBase64: faviconBase64Draft,
        whatsapp: whatsappDraft,
        socialX: socialXDraft,
        socialInstagram: socialInstagramDraft,
        socialLinkedIn: socialLinkedInDraft,
        socialTikTok: socialTikTokDraft,
        socialSnapchat: socialSnapchatDraft,
        heroSlides: heroSlidesDraft
      });
      // Call Context color triggers
      await updateThemeColors(primaryColorDraft, secondaryColorDraft, accentColorDraft);
      await refreshTheme();
      triggerNotice(language === 'ar' ? 'تم حفظ التغييرات وتطبيق السمة فورياً!' : 'Settings saved and Theme updated instantly!');
    } catch {
      triggerNotice('Error updating database settings');
    }
  };

  const handleExportInquiriesCSV = () => {
    if (inquiries.length === 0) {
      triggerNotice(language === 'ar' ? 'لا توجد استفسارات لتصديرها عقارياً' : 'No inquiries to export');
      return;
    }
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Message', 'Status', 'Created At'];
    const rows = inquiries.map(inq => [
      inq.id,
      inq.fullName.replace(/"/g, '""'),
      inq.email,
      inq.phone,
      inq.message.replace(/"/g, '""').replace(/\n/g, ' '),
      inq.status,
      inq.createdAt
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bina_leads_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotice(language === 'ar' ? 'تم تصدير ملف العملاء بنجاح!' : 'Leads CSV exported successfully!');
  };

  // Reset CMS Page Form State
  const resetPageForm = () => {
    setIsEditingPage(false);
    setCurrentPageId(null);
    setPageTitleAr('');
    setPageTitleEn('');
    setPageSlugAr('');
    setPageSlugEn('');
    setPageContentAr('');
    setPageContentEn('');
    setPageSeoTitleAr('');
    setPageSeoTitleEn('');
    setPageSeoDescAr('');
    setPageSeoDescEn('');
    setPageStatus('published');
    setPageParentId('');
  };

  // Create or Update Page form submission
  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitleAr || !pageTitleEn || !pageSlugAr || !pageSlugEn) {
      triggerNotice(language === 'ar' ? 'الرجاء ملء العناوين والروابط بالعربية والإنجليزية' : 'Please fill out Titles and Slugs in both languages');
      return;
    }

    const pageData = {
      slug: pageSlugEn.trim().toLowerCase(), // English slug to be used standardly
      title: { ar: pageTitleAr, en: pageTitleEn },
      sections: [], // standard empty sections, will rely on custom content fields
      slugAr: pageSlugAr.trim().toLowerCase(),
      slugEn: pageSlugEn.trim().toLowerCase(),
      contentAr: pageContentAr,
      contentEn: pageContentEn,
      seoTitleAr: pageSeoTitleAr,
      seoTitleEn: pageSeoTitleEn,
      seoDescAr: pageSeoDescAr,
      seoDescEn: pageSeoDescEn,
      status: pageStatus,
      parentId: pageParentId || undefined
    };

    try {
      if (currentPageId) {
        await pageRepository.updatePage(currentPageId, pageData);
        triggerNotice(language === 'ar' ? 'تم تحديث الصفحة بنجاح' : 'Page updated successfully');
      } else {
        await pageRepository.createPage(pageData);
        triggerNotice(language === 'ar' ? 'تم إنشاء الصفحة بنجاح' : 'Page created successfully');
      }
      resetPageForm();
      loadAdminData();
    } catch {
      triggerNotice('Error saving page');
    }
  };

  // Delete page handler
  const handleDeletePage = async (id: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الصفحة؟' : 'Are you sure you want to delete this page?')) {
      try {
        await pageRepository.deletePage(id);
        triggerNotice(language === 'ar' ? 'تم حذف الصفحة وعزل روابطها' : 'Page deleted successfully');
        void loadAdminData();
      } catch (error) {
        console.error('Failed to delete page:', error);
        triggerNotice(language === 'ar' ? 'فشل حذف الصفحة' : 'Failed to delete page');
      }
    }
  };

  // Start editing page
  const handleEditPageClick = (page: PageContent) => {
    setIsEditingPage(true);
    setCurrentPageId(page.id);
    setPageTitleAr(page.title.ar);
    setPageTitleEn(page.title.en);
    setPageSlugAr(page.slugAr || page.slug || '');
    setPageSlugEn(page.slugEn || page.slug || '');
    setPageContentAr(page.contentAr || (page.sections && page.sections[0]?.body?.ar) || '');
    setPageContentEn(page.contentEn || (page.sections && page.sections[0]?.body?.en) || '');
    setPageSeoTitleAr(page.seoTitleAr || page.title.ar);
    setPageSeoTitleEn(page.seoTitleEn || page.title.en);
    setPageSeoDescAr(page.seoDescAr || page.subtitle?.ar || '');
    setPageSeoDescEn(page.seoDescEn || page.subtitle?.en || '');
    setPageStatus(page.status || 'published');
    setPageParentId(page.parentId || '');
  };

  // Project Editor States
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectNameAr, setProjectNameAr] = useState('');
  const [projectNameEn, setProjectNameEn] = useState('');
  const [projectDescAr, setProjectDescAr] = useState('');
  const [projectDescEn, setProjectDescEn] = useState('');
  const [projectDeveloperAr, setProjectDeveloperAr] = useState('');
  const [projectDeveloperEn, setProjectDeveloperEn] = useState('');
  const [projectCityAr, setProjectCityAr] = useState('');
  const [projectCityEn, setProjectCityEn] = useState('');
  const [projectDistrictAr, setProjectDistrictAr] = useState('');
  const [projectDistrictEn, setProjectDistrictEn] = useState('');
  const [projectAddressAr, setProjectAddressAr] = useState('');
  const [projectAddressEn, setProjectAddressEn] = useState('');
  const [projectCompletionDate, setProjectCompletionDate] = useState('');
  const [projectUnits, setProjectUnits] = useState<string | number>('');
  const [projectStatus, setProjectStatus] = useState<'available' | 'sold' | 'under-construction' | 'sold-out'>('available');
  const [projectGoogleMapsLink, setProjectGoogleMapsLink] = useState('');
  const [projectLatitude, setProjectLatitude] = useState<string | number>('');
  const [projectLongitude, setProjectLongitude] = useState<string | number>('');
  const [projectFeatured, setProjectFeatured] = useState(false);
  const [projectCoverImageId, setProjectCoverImageId] = useState('');
  const [projectGalleryImageIds, setProjectGalleryImageIds] = useState<string[]>([]);
  const [projectBrochurePdfId, setProjectBrochurePdfId] = useState('');
  const [projectVideoUploadId, setProjectVideoUploadId] = useState('');
  
  // Amenities
  const [projectAmenityParking, setProjectAmenityParking] = useState(false);
  const [projectAmenitySecurity, setProjectAmenitySecurity] = useState(false);
  const [projectAmenityElevators, setProjectAmenityElevators] = useState(false);
  const [projectAmenityMosque, setProjectAmenityMosque] = useState(false);
  const [projectAmenityGym, setProjectAmenityGym] = useState(false);
  const [projectAmenityPool, setProjectAmenityPool] = useState(false);
  const [projectAmenityChildrenArea, setProjectAmenityChildrenArea] = useState(false);
  
  const [projectCustomAmenities, setProjectCustomAmenities] = useState<{ ar: string; en: string }[]>([]);
  const [tempCustomAmenityAr, setTempCustomAmenityAr] = useState('');
  const [tempCustomAmenityEn, setTempCustomAmenityEn] = useState('');
  
  // SEO
  const [projectSeoTitleAr, setProjectSeoTitleAr] = useState('');
  const [projectSeoTitleEn, setProjectSeoTitleEn] = useState('');
  const [projectSeoDescAr, setProjectSeoDescAr] = useState('');
  const [projectSeoDescEn, setProjectSeoDescEn] = useState('');

  // Property Editor States
  const [isEditingProperty, setIsEditingProperty] = useState(false);
  const [currentPropertyId, setCurrentPropertyId] = useState<string | null>(null);
  const [propertyProjectId, setPropertyProjectId] = useState('');
  const [propertyTypeSelection, setPropertyTypeSelection] = useState<PropertyPresetType | 'custom'>('apartment');
  const [propertyCustomTypeAr, setPropertyCustomTypeAr] = useState('');
  const [propertyCustomTypeEn, setPropertyCustomTypeEn] = useState('');
  const [propertyNameAr, setPropertyNameAr] = useState('');
  const [propertyNameEn, setPropertyNameEn] = useState('');
  const [propertyDescAr, setPropertyDescAr] = useState('');
  const [propertyDescEn, setPropertyDescEn] = useState('');
  const [propertyLocationAr, setPropertyLocationAr] = useState('');
  const [propertyLocationEn, setPropertyLocationEn] = useState('');
  const [propertyUnitNumber, setPropertyUnitNumber] = useState('');
  const [propertyAreaSqm, setPropertyAreaSqm] = useState<string | number>('');
  const [propertyBedrooms, setPropertyBedrooms] = useState<string | number>('');
  const [propertyBathrooms, setPropertyBathrooms] = useState<string | number>('');
  const [propertyLivingRooms, setPropertyLivingRooms] = useState<string | number>('');
  const [propertyBalconies, setPropertyBalconies] = useState<string | number>('');
  const [propertyParkingSpaces, setPropertyParkingSpaces] = useState<string | number>('');
  const [propertyPrice, setPropertyPrice] = useState<string | number>('');
  const [propertyCurrency, setPropertyCurrency] = useState('SAR');
  const [propertySaleOrRent, setPropertySaleOrRent] = useState<'sale' | 'rent'>('sale');
  const [propertyStatus, setPropertyStatus] = useState<'available' | 'reserved' | 'sold' | 'rented'>('available');
  const [propertyFeatured, setPropertyFeatured] = useState(false);
  const [propertyCoverImageId, setPropertyCoverImageId] = useState('');
  const [propertyGalleryImageIds, setProjectGalleryImageIds_toUse_as_prop_instead] = useState<string[]>([]);
  const [propertyFloorPlanImageId, setPropertyFloorPlanImageId] = useState('');
  const [propertyVideoUploadId, setPropertyVideoUploadId] = useState('');
  const [propertyUploadState, setPropertyUploadState] = useState<UploadProgressState>({
    visible: false,
    label: '',
    progress: 0,
    status: 'idle',
  });

  // Premium Property Completion States
  const [activePropertyEditorSubtab, setActivePropertyEditorSubtab] = useState<string>('general');
  const [propertyDistrictAr, setPropertyDistrictAr] = useState('');
  const [propertyDistrictEn, setPropertyDistrictEn] = useState('');
  const [propertyAddressAr, setPropertyAddressAr] = useState('');
  const [propertyAddressEn, setPropertyAddressEn] = useState('');
  const [propertyCoordinates, setPropertyCoordinates] = useState('');
  const [propertyFloorNumber, setPropertyFloorNumber] = useState<string | number>('');
  const [propertyAge, setPropertyAge] = useState<string | number>('');
  const [propertyFinishingTypeAr, setPropertyFinishingTypeAr] = useState('');
  const [propertyFinishingTypeEn, setPropertyFinishingTypeEn] = useState('');
  const [propertyOwnershipTypeAr, setPropertyOwnershipTypeAr] = useState('');
  const [propertyOwnershipTypeEn, setPropertyOwnershipTypeEn] = useState('');
  const [propertyDeveloperAr, setPropertyDeveloperAr] = useState('');
  const [propertyDeveloperEn, setPropertyDeveloperEn] = useState('');
  const [propertyListingDate, setPropertyListingDate] = useState('');

  // Highlights State
  const [propertyHighlights, setPropertyHighlights] = useState<{ ar: string; en: string }[]>([]);
  const [tempHighlightAr, setTempHighlightAr] = useState('');
  const [tempHighlightEn, setTempHighlightEn] = useState('');

  // Amenities Checkboxes
  const [propAmenityParking, setPropAmenityParking] = useState(false);
  const [propAmenityCoveredParking, setPropAmenityCoveredParking] = useState(false);
  const [propAmenityPool, setPropAmenityPool] = useState(false);
  const [propAmenityPrivatePool, setPropAmenityPrivatePool] = useState(false);
  const [propAmenityGym, setPropAmenityGym] = useState(false);
  const [propAmenityElevator, setPropAmenityElevator] = useState(false);
  const [propAmenitySecurity, setPropAmenitySecurity] = useState(false);
  const [propAmenityMosque, setPropAmenityMosque] = useState(false);
  const [propAmenityChildrenArea, setPropAmenityChildrenArea] = useState(false);
  const [propAmenityGarden, setPropAmenityGarden] = useState(false);
  const [propAmenityMaidRoom, setPropAmenityMaidRoom] = useState(false);
  const [propAmenityDriverRoom, setPropAmenityDriverRoom] = useState(false);
  const [propAmenitySmartHome, setPropAmenitySmartHome] = useState(false);
  const [propCustomAmenities, setPropCustomAmenities] = useState<{ ar: string; en: string; icon?: string }[]>([]);
  const [tempPropAmenityAr, setTempPropAmenityAr] = useState('');
  const [tempPropAmenityEn, setTempPropAmenityEn] = useState('');
  const [tempPropAmenityIcon, setTempPropAmenityIcon] = useState('sparkles');

  // Floor Plans Gallery
  const [propertyFloorPlanMediaIds, setPropertyFloorPlanMediaIds] = useState<string[]>([]);

  // Documents
  const [propertyDocumentMediaIds, setPropertyDocumentMediaIds] = useState<string[]>([]);

  // Tour URLs & project video
  const [propertyProjectVideoUrl, setPropertyProjectVideoUrl] = useState('');
  const [propertyVirtualTourUrl, setPropertyVirtualTourUrl] = useState('');
  const [propertyTour360Url, setPropertyTour360Url] = useState('');

  // Nearby Places
  const [propertyNearbyPlaces, setPropertyNearbyPlaces] = useState<Array<{ name: { ar: string; en: string }; type: string; distance: string }>>([]);
  const [tempNearbyPlaceNameAr, setTempNearbyPlaceNameAr] = useState('');
  const [tempNearbyPlaceNameEn, setTempNearbyPlaceNameEn] = useState('');
  const [tempNearbyPlaceType, setTempNearbyPlaceType] = useState('school');
  const [tempNearbyPlaceDistance, setTempNearbyPlaceDistance] = useState('');

  // SEO details
  const [propertySeoTitleAr, setPropertySeoTitleAr] = useState('');
  const [propertySeoTitleEn, setPropertySeoTitleEn] = useState('');
  const [propertySeoDescAr, setPropertySeoDescAr] = useState('');
  const [propertySeoDescEn, setPropertySeoDescEn] = useState('');
  const [propertySeoKeywords, setPropertySeoKeywords] = useState('');
  const [propertyOpenGraphImageId, setPropertyOpenGraphImageId] = useState('');
  const [propertyCanonicalUrl, setPropertyCanonicalUrl] = useState('');

  // Inquiry Settings
  const [propertyInquiryMobile, setPropertyInquiryMobile] = useState('');
  const [propertyInquiryEmail, setPropertyInquiryEmail] = useState('');
  const [propertyInquiryMessageDefault, setPropertyInquiryMessageDefault] = useState('');

  // Reset Project Form
  const resetProjectForm = () => {
    setIsEditingProject(false);
    setCurrentProjectId(null);
    setProjectNameAr('');
    setProjectNameEn('');
    setProjectDescAr('');
    setProjectDescEn('');
    setProjectDeveloperAr('');
    setProjectDeveloperEn('');
    setProjectCityAr('');
    setProjectCityEn('');
    setProjectDistrictAr('');
    setProjectDistrictEn('');
    setProjectAddressAr('');
    setProjectAddressEn('');
    setProjectCompletionDate('');
    setProjectUnits('');
    setProjectStatus('available');
    setProjectGoogleMapsLink('');
    setProjectLatitude('');
    setProjectLongitude('');
    setProjectFeatured(false);
    setProjectCoverImageId('');
    setProjectGalleryImageIds([]);
    setProjectBrochurePdfId('');
    setProjectVideoUploadId('');
    
    setProjectAmenityParking(false);
    setProjectAmenitySecurity(false);
    setProjectAmenityElevators(false);
    setProjectAmenityMosque(false);
    setProjectAmenityGym(false);
    setProjectAmenityPool(false);
    setProjectAmenityChildrenArea(false);
    setProjectCustomAmenities([]);
    setTempCustomAmenityAr('');
    setTempCustomAmenityEn('');
    
    setProjectSeoTitleAr('');
    setProjectSeoTitleEn('');
    setProjectSeoDescAr('');
    setProjectSeoDescEn('');
  };

  // Open for adding a new project
  const handleOpenAddProject = () => {
    resetProjectForm();
    setIsEditingProject(true);
  };

  // Open for editing an existing project
  const handleEditProjectClick = (proj: Project) => {
    setIsEditingProject(true);
    setCurrentProjectId(proj.id);
    setProjectNameAr(proj.name?.ar || '');
    setProjectNameEn(proj.name?.en || '');
    setProjectDescAr(proj.description?.ar || '');
    setProjectDescEn(proj.description?.en || '');
    setProjectDeveloperAr(proj.developer?.ar || '');
    setProjectDeveloperEn(proj.developer?.en || '');
    setProjectCityAr(proj.city?.ar || '');
    setProjectCityEn(proj.city?.en || '');
    setProjectDistrictAr(proj.district?.ar || '');
    setProjectDistrictEn(proj.district?.en || '');
    setProjectAddressAr(proj.address?.ar || '');
    setProjectAddressEn(proj.address?.en || '');
    setProjectCompletionDate(proj.completionDate || '');
    setProjectUnits(proj.units ?? '');
    setProjectStatus((proj.status as 'available' | 'sold' | 'under-construction' | 'sold-out') || 'available');
    setProjectGoogleMapsLink(proj.googleMapsLink || '');
    setProjectLatitude(proj.latitude || '');
    setProjectLongitude(proj.longitude || '');
    setProjectFeatured(proj.featured || false);
    setProjectCoverImageId(proj.coverImageId || '');
    setProjectGalleryImageIds(proj.galleryImageIds || []);
    setProjectBrochurePdfId(proj.brochurePdfId || '');
    setProjectVideoUploadId(proj.videoUploadId || '');
    
    // Amenities
    setProjectAmenityParking(proj.amenityParking ?? false);
    setProjectAmenitySecurity(proj.amenitySecurity ?? false);
    setProjectAmenityElevators(proj.amenityElevators ?? false);
    setProjectAmenityMosque(proj.amenityMosque ?? false);
    setProjectAmenityGym(proj.amenityGym ?? false);
    setProjectAmenityPool(proj.amenityPool ?? false);
    setProjectAmenityChildrenArea(proj.amenityChildrenArea ?? false);
    setProjectCustomAmenities(proj.customAmenities || []);
    
    // SEO
    setProjectSeoTitleAr(proj.seoTitleAr || '');
    setProjectSeoTitleEn(proj.seoTitleEn || '');
    setProjectSeoDescAr(proj.seoDescAr || '');
    setProjectSeoDescEn(proj.seoDescEn || '');
  };

  const resetPropertyUploadState = () => {
    setPropertyUploadState({
      visible: false,
      label: '',
      progress: 0,
      status: 'idle',
    });
  };

  const renderUploadProgressPanel = () => {
    if (!propertyUploadState.visible || !propertyUploadState.label) {
      return null;
    }

    return (
      <div
        className={`rounded-xl border px-3 py-2 space-y-2 ${
          propertyUploadState.status === 'error'
            ? 'border-rose-200 bg-rose-50 text-rose-700'
            : propertyUploadState.status === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 bg-white text-slate-700'
        }`}
      >
        <div className="flex items-center justify-between gap-3 text-[10px] font-bold">
          <span className="truncate">{propertyUploadState.label}</span>
          <span>{propertyUploadState.progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              propertyUploadState.status === 'error'
                ? 'bg-rose-500'
                : propertyUploadState.status === 'success'
                  ? 'bg-emerald-500'
                  : 'bg-[#B45309]'
            }`}
            style={{ width: `${propertyUploadState.progress}%` }}
          />
        </div>
        <div className="text-[10px] font-medium">
          {propertyUploadState.status === 'preparing' && (language === 'ar' ? 'جارٍ تجهيز الملف' : 'Preparing file')}
          {propertyUploadState.status === 'uploading' && (language === 'ar' ? 'جارٍ الرفع إلى الخادم' : 'Uploading to server')}
          {propertyUploadState.status === 'success' && (language === 'ar' ? 'تم الرفع بنجاح' : 'Upload complete')}
          {propertyUploadState.status === 'error' && (language === 'ar' ? 'فشل الرفع' : 'Upload failed')}
        </div>
      </div>
    );
  };

  const uploadProjectAsset = async (file: File, name: string, label: string): Promise<string> => {
    setPropertyUploadState({
      visible: true,
      label,
      progress: 8,
      status: 'preparing',
    });

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        if (!base64) {
          setPropertyUploadState({
            visible: true,
            label,
            progress: 100,
            status: 'error',
          });
          reject(new Error('Failed to read file'));
          return;
        }

        setPropertyUploadState((current) => ({
          ...current,
          visible: true,
          label,
          progress: 35,
          status: 'uploading',
        }));

        try {
          const item = await mediaRepository.createMediaItem(name, file.type, base64, {
            onUploadProgress: (progress) => {
              setPropertyUploadState((current) => ({
                ...current,
                visible: true,
                label,
                progress: Math.max(35, Math.min(95, 35 + Math.round(progress * 0.6))),
                status: 'uploading',
              }));
            },
          });
          setPropertyUploadState({
            visible: true,
            label,
            progress: 100,
            status: 'success',
          });
          resolve(item.id);
          window.setTimeout(() => {
            resetPropertyUploadState();
          }, 1200);
        } catch (err) {
          setPropertyUploadState({
            visible: true,
            label,
            progress: 100,
            status: 'error',
          });
          reject(err);
          window.setTimeout(() => {
            resetPropertyUploadState();
          }, 1800);
        }
      };
      reader.onerror = () => {
        setPropertyUploadState({
          visible: true,
          label,
          progress: 100,
          status: 'error',
        });
        reject(new Error('Failed to read file'));
        window.setTimeout(() => {
          resetPropertyUploadState();
        }, 1800);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleProjectDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'cover' | 'pdf' | 'video' | 'gallery') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      if (field === 'gallery') {
        const uploadedIds: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const id = await uploadProjectAsset(
            file,
            file.name,
            language === 'ar'
              ? `جارٍ رفع صورة المعرض ${i + 1} من ${files.length}`
              : `Uploading gallery image ${i + 1} of ${files.length}`,
          );
          uploadedIds.push(id);
        }
        setProjectGalleryImageIds(prev => [...prev, ...uploadedIds]);
        const freshMedia = await mediaRepository.getMediaItems();
        setMediaItems(freshMedia);
        triggerNotice(language === 'ar' ? `تم رفع عدد (${files.length}) صور بنجاح في مكتبة الوسائط` : `Successfully uploaded ${files.length} images to library`);
      } else {
        const file = files[0];
        const label = field === 'cover'
          ? (language === 'ar' ? 'جارٍ رفع صورة الغلاف' : 'Uploading cover image')
          : field === 'pdf'
            ? (language === 'ar' ? 'جارٍ رفع ملف البروشور PDF' : 'Uploading brochure PDF')
            : (language === 'ar' ? 'جارٍ رفع الفيديو التعريفي' : 'Uploading walkthrough video');
        const id = await uploadProjectAsset(file, file.name, label);
        if (field === 'cover') {
          setProjectCoverImageId(id);
          triggerNotice(language === 'ar' ? 'تم اختيار ورفع غلاف المشروع' : 'Uploaded cover image');
        } else if (field === 'pdf') {
          setProjectBrochurePdfId(id);
          triggerNotice(language === 'ar' ? 'تم رفع ملف البروشور الهندسي PDF' : 'Uploaded brochure PDF');
        } else if (field === 'video') {
          setProjectVideoUploadId(id);
          triggerNotice(language === 'ar' ? 'تم رفع الفيديو التعريفي للمشروع' : 'Uploaded profile video');
        }
        const freshMedia = await mediaRepository.getMediaItems();
        setMediaItems(freshMedia);
      }
    } catch (err) {
      console.error(err);
      triggerNotice(language === 'ar' ? 'فشل رفع الملف في مستودع الوسائط' : 'Asset upload failure');
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectNameAr || !projectNameEn) {
      triggerNotice(language === 'ar' ? 'الرجاء إدخال اسم المشروع باللغتين' : 'Please input Project Name in both languages');
      return;
    }
    
    const projData: Omit<Project, 'id'> = {
      name: { ar: projectNameAr, en: projectNameEn },
      description: { ar: projectDescAr, en: projectDescEn },
      developer: { ar: projectDeveloperAr, en: projectDeveloperEn },
      location: { 
        ar: `${projectDistrictAr || ''}، ${projectCityAr || ''}`, 
        en: `${projectDistrictEn || ''}, ${projectCityEn || ''}`
      },
      city: { ar: projectCityAr, en: projectCityEn },
      district: { ar: projectDistrictAr, en: projectDistrictEn },
      address: { ar: projectAddressAr, en: projectAddressEn },
      completionDate: projectCompletionDate,
      units: projectUnits ? Number(projectUnits) : 0,
      status: projectStatus,
      googleMapsLink: projectGoogleMapsLink,
      latitude: projectLatitude ? Number(projectLatitude) : undefined,
      longitude: projectLongitude ? Number(projectLongitude) : undefined,
      featured: projectFeatured,
      coverImageId: projectCoverImageId || undefined,
      galleryImageIds: projectGalleryImageIds,
      brochurePdfId: projectBrochurePdfId || undefined,
      videoUploadId: projectVideoUploadId || undefined,
      
      // Amenities
      amenityParking: projectAmenityParking,
      amenitySecurity: projectAmenitySecurity,
      amenityElevators: projectAmenityElevators,
      amenityMosque: projectAmenityMosque,
      amenityGym: projectAmenityGym,
      amenityPool: projectAmenityPool,
      amenityChildrenArea: projectAmenityChildrenArea,
      customAmenities: projectCustomAmenities,
      
      // SEO
      seoTitleAr: projectSeoTitleAr,
      seoTitleEn: projectSeoTitleEn,
      seoDescAr: projectSeoDescAr,
      seoDescEn: projectSeoDescEn
    };
    
    try {
      if (currentProjectId) {
        await projectRepository.updateProject(currentProjectId, projData);
        triggerNotice(language === 'ar' ? 'تم تحديث المشروع السكني الكلي بنجاح' : 'Residential Project updated');
      } else {
        await projectRepository.createProject(projData);
        triggerNotice(language === 'ar' ? 'تم تخطيط وتخزين المشروع بنجاح الفائق' : 'Residential Project created successfully');
      }
      resetProjectForm();
      loadAdminData();
    } catch (err) {
      console.error(err);
      triggerNotice('Error saving real estate project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المشروع السكني وكافة مواصفاته الفنية؟' : 'Are you sure you want to delete this housing project entirely?')) {
      try {
        await projectRepository.deleteProject(id);
        triggerNotice(language === 'ar' ? 'تم حذف ملفات ومرفقات هذا المشروع' : 'Project wiped successfully');
        void loadAdminData();
      } catch (error) {
        console.error('Failed to delete project:', error);
        triggerNotice(language === 'ar' ? 'فشل حذف المشروع' : 'Failed to delete project');
      }
    }
  };

  const handleAddCustomAmenity = () => {
    if (!tempCustomAmenityAr || !tempCustomAmenityEn) {
      triggerNotice(language === 'ar' ? 'الرجاء ملء الاسم للميزة الإضافية باللغتين' : 'Please input custom amenity in both languages');
      return;
    }
    setProjectCustomAmenities(prev => [
      ...prev,
      { ar: tempCustomAmenityAr, en: tempCustomAmenityEn }
    ]);
    setTempCustomAmenityAr('');
    setTempCustomAmenityEn('');
  };

  const handleRemoveCustomAmenity = (index: number) => {
    setProjectCustomAmenities(prev => prev.filter((_, i) => i !== index));
  };

  // Properties CRUD Handlers
  const resetPropertyForm = () => {
    setIsEditingProperty(false);
    setCurrentPropertyId(null);
    setPropertyProjectId('');
    setPropertyTypeSelection('apartment');
    setPropertyCustomTypeAr('');
    setPropertyCustomTypeEn('');
    setPropertyNameAr('');
    setPropertyNameEn('');
    setPropertyDescAr('');
    setPropertyDescEn('');
    setPropertyLocationAr('');
    setPropertyLocationEn('');
    setPropertyUnitNumber('');
    setPropertyAreaSqm('');
    setPropertyBedrooms('');
    setPropertyBathrooms('');
    setPropertyLivingRooms('');
    setPropertyBalconies('');
    setPropertyParkingSpaces('');
    setPropertyPrice('');
    setPropertyCurrency('SAR');
    setPropertySaleOrRent('sale');
    setPropertyStatus('available');
    setPropertyFeatured(false);
    setPropertyCoverImageId('');
    setProjectGalleryImageIds_toUse_as_prop_instead([]);
    setPropertyFloorPlanImageId('');
    setPropertyVideoUploadId('');
    resetPropertyUploadState();

    // Reset Premium States
    setPropertyDistrictAr('');
    setPropertyDistrictEn('');
    setPropertyAddressAr('');
    setPropertyAddressEn('');
    setPropertyCoordinates('');
    setPropertyFloorNumber('');
    setPropertyAge('');
    setPropertyFinishingTypeAr('');
    setPropertyFinishingTypeEn('');
    setPropertyOwnershipTypeAr('');
    setPropertyOwnershipTypeEn('');
    setPropertyDeveloperAr('');
    setPropertyDeveloperEn('');
    setPropertyListingDate('');
    setPropertyHighlights([]);
    setTempHighlightAr('');
    setTempHighlightEn('');
    setPropAmenityParking(false);
    setPropAmenityCoveredParking(false);
    setPropAmenityPool(false);
    setPropAmenityPrivatePool(false);
    setPropAmenityGym(false);
    setPropAmenityElevator(false);
    setPropAmenitySecurity(false);
    setPropAmenityMosque(false);
    setPropAmenityChildrenArea(false);
    setPropAmenityGarden(false);
    setPropAmenityMaidRoom(false);
    setPropAmenityDriverRoom(false);
    setPropAmenitySmartHome(false);
    setPropCustomAmenities([]);
    setTempPropAmenityAr('');
    setTempPropAmenityEn('');
    setTempPropAmenityIcon('sparkles');
    setPropertyFloorPlanMediaIds([]);
    setPropertyDocumentMediaIds([]);
    setPropertyProjectVideoUrl('');
    setPropertyVirtualTourUrl('');
    setPropertyTour360Url('');
    setPropertyNearbyPlaces([]);
    setTempNearbyPlaceNameAr('');
    setTempNearbyPlaceNameEn('');
    setTempNearbyPlaceType('school');
    setTempNearbyPlaceDistance('');
    setPropertySeoTitleAr('');
    setPropertySeoTitleEn('');
    setPropertySeoDescAr('');
    setPropertySeoDescEn('');
    setPropertySeoKeywords('');
    setPropertyOpenGraphImageId('');
    setPropertyCanonicalUrl('');
    setPropertyInquiryMobile('');
    setPropertyInquiryEmail('');
    setPropertyInquiryMessageDefault('');
    setActivePropertyEditorSubtab('general');
  };

  const handleOpenAddProperty = () => {
    resetPropertyForm();
    setIsEditingProperty(true);
  };

  const handleEditPropertyClick = (prop: Property) => {
    setIsEditingProperty(true);
    setCurrentPropertyId(prop.id);
    setPropertyProjectId(prop.projectId || '');
    
    const normalizedType = getPropertyTypeFromText(prop.type);
    setPropertyTypeSelection(normalizedType.preset);
    setPropertyCustomTypeAr(normalizedType.preset === 'custom' ? (prop.type?.ar || '') : '');
    setPropertyCustomTypeEn(normalizedType.preset === 'custom' ? (prop.type?.en || '') : '');

    setPropertyNameAr(prop.title?.ar || '');
    setPropertyNameEn(prop.title?.en || '');
    setPropertyDescAr(prop.description?.ar || '');
    setPropertyDescEn(prop.description?.en || '');
    setPropertyLocationAr(prop.location?.ar || '');
    setPropertyLocationEn(prop.location?.en || '');
    setPropertyUnitNumber(prop.unitNumber || '');
    setPropertyAreaSqm(prop.areaSqm || '');
    setPropertyBedrooms(prop.bedrooms || '');
    setPropertyBathrooms(prop.bathrooms || '');
    setPropertyLivingRooms(prop.livingRooms || '');
    setPropertyBalconies(prop.balconies || '');
    setPropertyParkingSpaces(prop.parkingSpaces || '');
    setPropertyPrice(prop.price || '');
    setPropertyCurrency(prop.currency || 'SAR');
    setPropertySaleOrRent(prop.saleOrRent || 'sale');
    setPropertyStatus(prop.status || 'available');
    setPropertyFeatured(prop.featured || false);
    setPropertyCoverImageId(prop.featuredImageId || '');
    setProjectGalleryImageIds_toUse_as_prop_instead(prop.galleryImageIds || []);
    setPropertyFloorPlanImageId(prop.floorPlanImageId || '');
    setPropertyVideoUploadId(prop.videoUploadId || '');

    // Load Premium States
    setPropertyDistrictAr(prop.district?.ar || '');
    setPropertyDistrictEn(prop.district?.en || '');
    setPropertyAddressAr(prop.address?.ar || '');
    setPropertyAddressEn(prop.address?.en || '');
    setPropertyCoordinates(prop.coordinates || '');
    setPropertyFloorNumber(prop.floorNumber || '');
    setPropertyAge(prop.propertyAge || '');
    setPropertyFinishingTypeAr(prop.finishingType?.ar || '');
    setPropertyFinishingTypeEn(prop.finishingType?.en || '');
    setPropertyOwnershipTypeAr(prop.ownershipType?.ar || '');
    setPropertyOwnershipTypeEn(prop.ownershipType?.en || '');
    setPropertyDeveloperAr(prop.developer?.ar || '');
    setPropertyDeveloperEn(prop.developer?.en || '');
    setPropertyListingDate(prop.listingDate || '');
    setPropertyHighlights(prop.highlights || []);
    setPropAmenityParking(prop.amenityParking || false);
    setPropAmenityCoveredParking(prop.amenityCoveredParking || false);
    setPropAmenityPool(prop.amenityPool || false);
    setPropAmenityPrivatePool(prop.amenityPrivatePool || false);
    setPropAmenityGym(prop.amenityGym || false);
    setPropAmenityElevator(prop.amenityElevator || false);
    setPropAmenitySecurity(prop.amenitySecurity || false);
    setPropAmenityMosque(prop.amenityMosque || false);
    setPropAmenityChildrenArea(prop.amenityChildrenArea || false);
    setPropAmenityGarden(prop.amenityGarden || false);
    setPropAmenityMaidRoom(prop.amenityMaidRoom || false);
    setPropAmenityDriverRoom(prop.amenityDriverRoom || false);
    setPropAmenitySmartHome(prop.amenitySmartHome || false);
    setPropCustomAmenities(prop.customAmenities || []);
    setPropertyFloorPlanMediaIds(prop.floorPlanMediaIds || []);
    setPropertyDocumentMediaIds(prop.documentMediaIds || []);
    setPropertyProjectVideoUrl(prop.projectVideoUrl || '');
    setPropertyVirtualTourUrl(prop.virtualTourUrl || '');
    setPropertyTour360Url(prop.tour360Url || '');
    setPropertyNearbyPlaces(prop.nearbyPlaces || []);
    setPropertySeoTitleAr(prop.seoTitleAr || '');
    setPropertySeoTitleEn(prop.seoTitleEn || '');
    setPropertySeoDescAr(prop.seoDescAr || '');
    setPropertySeoDescEn(prop.seoDescEn || '');
    setPropertySeoKeywords(prop.seoKeywords || '');
    setPropertyOpenGraphImageId(prop.openGraphImageId || '');
    setPropertyCanonicalUrl(prop.canonicalUrl || '');

    const pAny = prop as any;
    setPropertyInquiryMobile(pAny.inquiryMobile || '');
    setPropertyInquiryEmail(pAny.inquiryEmail || '');
    setPropertyInquiryMessageDefault(pAny.inquiryMessageDefault || '');
    setActivePropertyEditorSubtab('general');
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyNameAr || !propertyNameEn) {
      triggerNotice(language === 'ar' ? 'الرجاء إدخال اسم العقار باللغتين' : 'Please input Property Name in both languages');
      return;
    }

    const rawType: BilingualText = propertyTypeSelection === 'custom'
      ? {
          ar: propertyCustomTypeAr.trim() || propertyCustomTypeEn.trim(),
          en: propertyCustomTypeEn.trim() || propertyCustomTypeAr.trim(),
        }
      : getPropertyTypeLabel(propertyTypeSelection);
    const normalizedType = getPropertyTypeFromText(rawType);
    const computedType: BilingualText = normalizedType.preset === 'custom'
      ? rawType
      : normalizedType.value;

    if (propertyTypeSelection === 'custom' && !computedType.ar && !computedType.en) {
      triggerNotice(language === 'ar' ? 'الرجاء إدخال نوع العقار المخصص' : 'Please provide a custom property type');
      return;
    }

    let locAr = propertyLocationAr;
    let locEn = propertyLocationEn;
    if (!locAr && propertyProjectId) {
      const parentProj = projects.find(p => p.id === propertyProjectId);
      if (parentProj) {
        locAr = `${parentProj.district?.ar || ''}، ${parentProj.city?.ar || ''}`;
        locEn = `${parentProj.district?.en || ''}, ${parentProj.city?.en || ''}`;
      }
    }

    const propData: Omit<Property, 'id'> = {
      title: { ar: propertyNameAr, en: propertyNameEn },
      description: { ar: propertyDescAr, en: propertyDescEn },
      price: Number(propertyPrice) || 0,
      location: { ar: locAr || 'الرياض', en: locEn || 'Riyadh' },
      district: { ar: propertyDistrictAr, en: propertyDistrictEn },
      address: { ar: propertyAddressAr, en: propertyAddressEn },
      coordinates: propertyCoordinates,
      bedrooms: Number(propertyBedrooms) || 0,
      bathrooms: Number(propertyBathrooms) || 0,
      areaSqm: Number(propertyAreaSqm) || 0,
      featuredImageId: propertyCoverImageId || undefined,
      galleryImageIds: propertyGalleryImageIds,
      status: propertyStatus,
      type: computedType,
      projectId: propertyProjectId || undefined,
      unitNumber: propertyUnitNumber || undefined,
      unitCode: propertyUnitNumber || undefined,
      livingRooms: Number(propertyLivingRooms) || undefined,
      balconies: Number(propertyBalconies) || undefined,
      parkingSpaces: Number(propertyParkingSpaces) || undefined,
      floorNumber: Number(propertyFloorNumber) || undefined,
      propertyAge: Number(propertyAge) || undefined,
      finishingType: { ar: propertyFinishingTypeAr, en: propertyFinishingTypeEn },
      ownershipType: { ar: propertyOwnershipTypeAr, en: propertyOwnershipTypeEn },
      developer: { ar: propertyDeveloperAr, en: propertyDeveloperEn },
      currency: propertyCurrency || 'SAR',
      saleOrRent: propertySaleOrRent,
      featured: propertyFeatured,
      listingDate: propertyListingDate || new Date().toISOString().split('T')[0],
      floorPlanImageId: propertyFloorPlanImageId || undefined,
      floorPlanMediaIds: propertyFloorPlanMediaIds,
      documentMediaIds: propertyDocumentMediaIds,
      videoUploadId: propertyVideoUploadId || undefined,
      
      // Amenities
      amenityParking: propAmenityParking,
      amenityCoveredParking: propAmenityCoveredParking,
      amenityPool: propAmenityPool,
      amenityPrivatePool: propAmenityPrivatePool,
      amenityGym: propAmenityGym,
      amenityElevator: propAmenityElevator,
      amenitySecurity: propAmenitySecurity,
      amenityMosque: propAmenityMosque,
      amenityChildrenArea: propAmenityChildrenArea,
      amenityGarden: propAmenityGarden,
      amenityMaidRoom: propAmenityMaidRoom,
      amenityDriverRoom: propAmenityDriverRoom,
      amenitySmartHome: propAmenitySmartHome,
      customAmenities: propCustomAmenities,

      // Unique Completeness
      highlights: propertyHighlights,
      projectVideoUrl: propertyProjectVideoUrl,
      virtualTourUrl: propertyVirtualTourUrl,
      tour360Url: propertyTour360Url,
      nearbyPlaces: propertyNearbyPlaces,
      seoKeywords: propertySeoKeywords,
      openGraphImageId: propertyOpenGraphImageId || undefined,
      canonicalUrl: propertyCanonicalUrl || undefined,

      seoTitleAr: propertySeoTitleAr || undefined,
      seoTitleEn: propertySeoTitleEn || undefined,
      seoDescAr: propertySeoDescAr || undefined,
      seoDescEn: propertySeoDescEn || undefined,
    } as any;

    // Extend custom direct values
    (propData as any).inquiryMobile = propertyInquiryMobile || undefined;
    (propData as any).inquiryEmail = propertyInquiryEmail || undefined;
    (propData as any).inquiryMessageDefault = propertyInquiryMessageDefault || undefined;

    try {
      if (currentPropertyId) {
        await propertyRepository.updateProperty(currentPropertyId, propData);
        triggerNotice(language === 'ar' ? 'تم تحديث بيانات العقار بنجاح' : 'Property details updated successfully');
      } else {
        await propertyRepository.createProperty(propData);
        triggerNotice(language === 'ar' ? 'تم إدراج الأصل العقاري الجديد بنجاح' : 'Property created successfully');
      }
      resetPropertyForm();
      loadAdminData();
    } catch (err) {
      console.error(err);
      triggerNotice('Error saving real estate asset');
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من رغبتك في حذف هذا العقار؟' : 'Are you sure you want to delete this property?')) {
      try {
        await propertyRepository.deleteProperty(id);
        triggerNotice(language === 'ar' ? 'تم حذف ملفات هذا العقار وعزله' : 'Property records wiped successfully');
        void loadAdminData();
      } catch (error) {
        console.error('Failed to delete property:', error);
        triggerNotice(language === 'ar' ? 'فشل حذف العقار' : 'Failed to delete property');
      }
    }
  };

  const handlePropertyDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'cover' | 'floorplan' | 'video' | 'gallery' | 'floorplans_gallery' | 'documents') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      if (field === 'gallery' || field === 'floorplans_gallery' || field === 'documents') {
        const uploadedIds: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const label = field === 'gallery'
            ? (language === 'ar' ? `جارٍ رفع صورة العقار ${i + 1} من ${files.length}` : `Uploading property gallery image ${i + 1} of ${files.length}`)
            : field === 'floorplans_gallery'
              ? (language === 'ar' ? `جارٍ رفع صورة مخطط الطابق ${i + 1} من ${files.length}` : `Uploading floor plan image ${i + 1} of ${files.length}`)
              : (language === 'ar' ? `جارٍ رفع وثيقة ${i + 1} من ${files.length}` : `Uploading document ${i + 1} of ${files.length}`);
          const id = await uploadProjectAsset(file, file.name, label);
          uploadedIds.push(id);
        }
        if (field === 'gallery') {
          setProjectGalleryImageIds_toUse_as_prop_instead(prev => [...prev, ...uploadedIds]);
          triggerNotice(language === 'ar' ? `تم رفع عدد (${files.length}) صور بنجاح في معرض العقار` : `Uploaded ${files.length} images to property gallery`);
        } else if (field === 'floorplans_gallery') {
          setPropertyFloorPlanMediaIds(prev => [...prev, ...uploadedIds]);
          triggerNotice(language === 'ar' ? `تم رفع عدد (${files.length}) صور في معرض مخططات الطوابق` : `Uploaded ${files.length} images to floor plans gallery`);
        } else if (field === 'documents') {
          setPropertyDocumentMediaIds(prev => [...prev, ...uploadedIds]);
          triggerNotice(language === 'ar' ? `تم رفع عدد (${files.length}) ملفات وثائق للتحميل` : `Uploaded ${files.length} document files`);
        }
        const freshMedia = await mediaRepository.getMediaItems();
        setMediaItems(freshMedia);
      } else {
        const file = files[0];
        const label = field === 'cover'
          ? (language === 'ar' ? 'جارٍ رفع صورة غلاف العقار' : 'Uploading property cover image')
          : field === 'floorplan'
            ? (language === 'ar' ? 'جارٍ رفع صورة مخطط الطابق' : 'Uploading floor plan image')
            : (language === 'ar' ? 'جارٍ رفع الفيديو الترويجي للعقار' : 'Uploading property video');
        const id = await uploadProjectAsset(file, file.name, label);
        if (field === 'cover') {
          setPropertyCoverImageId(id);
          triggerNotice(language === 'ar' ? 'تم رفع غلاف العقار بنجاح' : 'Uploaded cover image');
        } else if (field === 'floorplan') {
          setPropertyFloorPlanImageId(id);
          triggerNotice(language === 'ar' ? 'تم مواءمة ورفع كروكي مخطط الطابق' : 'Uploaded floor plan diagram');
        } else if (field === 'video') {
          setPropertyVideoUploadId(id);
          triggerNotice(language === 'ar' ? 'تم اختيار ورفع الفيديو الترويجي للعقار' : 'Uploaded property tour video');
        }
        const freshMedia = await mediaRepository.getMediaItems();
        setMediaItems(freshMedia);
      }
    } catch (err) {
      console.error(err);
      triggerNotice(language === 'ar' ? 'فشل رفع الملف في مستودع الوسائط' : 'Asset upload failure');
    }
  };

  const resolveMediaBase64 = (id?: string): string | null => {
    if (!id) return null;
    const found = mediaItems.find(item => item.id === id);
    return found ? found.base64Data : null;
  };
  const navItems: Array<{ id: ActiveAdminTab; labelAr: string; labelEn: string; icon: React.ReactNode }> = [
    { id: 'dashboard', labelAr: 'لوحة التحكم والمؤشرات', labelEn: 'Dashboard overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'projects', labelAr: 'المشاريع الكبرى والمدن', labelEn: 'Projects Database', icon: <Milestone className="w-5 h-5" /> },
    { id: 'properties', labelAr: 'العقارات المدرجة والأصول', labelEn: 'Properties Inventory', icon: <Building2 className="w-5 h-5" /> },
    { id: 'inquiries', labelAr: 'طلبات التواصل الواردة', labelEn: 'Inquiries Box', icon: <Inbox className="w-5 h-5" /> },
    { id: 'pages', labelAr: 'إدارة المحتوى المكتوب', labelEn: 'Page Editors', icon: <FileText className="w-5 h-5" /> },
    { id: 'page_builder', labelAr: 'منشئ الصفحات المرئي', labelEn: 'Visual Page Builder', icon: <Layers className="w-5 h-5" /> },
    { id: 'media', labelAr: 'مكتبة الوسائط والرفع', labelEn: 'Media Library', icon: <ImageIcon className="w-5 h-5" /> },
    { id: 'settings', labelAr: 'إعدادات المنصة والهوية', labelEn: 'System Settings', icon: <Sliders className="w-5 h-5" /> },
    { id: 'import', labelAr: 'استيراد البيانات إكسل', labelEn: 'Excel Import Engine', icon: <Database className="w-5 h-5" /> }
  ];

  return (
    <div id="admin-dashboard-container" className="min-h-screen bg-[#F8FAFB] text-[#1A202C] flex flex-col md:flex-row font-sans relative">
      
      {/* Toast Notice System */}
      {notification && (
        <div className="fixed bottom-6 left-6 z-50 px-6 py-3.5 rounded bg-emerald-600 text-white shadow-2xl font-sans font-bold flex items-center gap-3 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Sidebar Desk */}
      <aside 
        id="admin-sidebar"
        className="w-full md:w-80 bg-[#0F172A] text-slate-400 border-b md:border-b-0 md:border-l border-slate-800/80 flex flex-col justify-between shrink-0"
      >
        <div className="p-6 space-y-8">
          {/* Executive Stamp */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-6 text-right">
            <div className="w-10 h-10 rounded bg-(--color-secondary)/20 flex items-center justify-center text-(--color-secondary)" style={{ color: theme.secondary }}>
              <Database className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-500">{staticT('adminHeader')}</span>
              <span className="block font-sans font-bold text-sm text-slate-200">بناء وإدارة العقارية</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav id="admin-nav-tabs" className="space-y-1.5">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  id={`admin-tab-btn-${item.id}`}
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full py-3 px-4 rounded-lg text-right flex items-center justify-between transition-all duration-300 text-sm font-semibold ${
                    active 
                      ? 'bg-[#064E3B]/10 text-emerald-400 border-r-4 border-emerald-500' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                  style={active ? { borderRightColor: theme.secondary } : undefined}
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Back to Site trigger */}
        <div className="p-6 border-t border-slate-805 border-slate-800/80">
          <button
            onClick={onBackToWebsite}
            className="w-full py-3 rounded border border-slate-700 hover:border-slate-500 bg-slate-900/50 flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>{staticT('backToWebsite')}</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace Area */}
      <main id="admin-main-workspace" className="flex-1 px-6 py-8 md:px-6 space-y-8 overflow-y-auto w-full max-w-none">
        
        {/* Workspace Title bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 gap-4">
          <div>
            <h1 className="font-sans font-black text-3xl text-[#0F172A] mb-1">
              {language === 'ar' 
                ? navItems.find(i => i.id === activeTab)?.labelAr 
                : navItems.find(i => i.id === activeTab)?.labelEn}
            </h1>
            <p className="text-slate-500 text-sm">
              {language === 'ar' ? 'مرحباً بك في نظام بناء وإدارة المتكامل للمشاريع العقارية' : 'Control center & Real Estate entities catalogs'}
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 shrink-0">
            {/* Workspace Switcher Pill Group */}
            <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs select-none shadow-sm h-full items-center font-sans">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 flex items-center gap-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab !== 'page_builder' 
                    ? 'bg-[#0F172A] text-white shadow font-bold' 
                    : 'text-[#1A202C] hover:bg-slate-200/60 font-semibold'
                }`}
              >
                <span>🏢</span>
                <span>{language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>
              </button>
              
              <button
                onClick={() => setActiveTab('page_builder')}
                className={`px-4 py-2 flex items-center gap-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'page_builder' 
                    ? 'bg-[#0F172A] text-white shadow font-bold' 
                    : 'text-[#1A202C] hover:bg-slate-200/60 font-semibold'
                }`}
              >
                <span>🎨</span>
                <span>{language === 'ar' ? 'منشئ الصفحات' : 'Page Builder'}</span>
              </button>

              <button
                onClick={onBackToWebsite}
                className="px-4 py-2 flex items-center gap-1.5 rounded-lg text-[#1A202C] hover:bg-slate-200/60 transition-all font-semibold cursor-pointer"
              >
                <span>🌐</span>
                <span>{language === 'ar' ? 'عرض الموقع' : 'Website Preview'}</span>
              </button>
            </div>

            <div className="flex gap-3 h-full items-center">
              <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{language === 'ar' ? 'حالة النظام' : 'System status'}</div>
                <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {language === 'ar' ? 'نشط' : 'Active'}
                </div>
              </div>
              
              <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
                <div className="text-[10px] text-slate-450 text-slate-400 uppercase font-bold tracking-widest">{language === 'ar' ? 'مستودع البيانات' : 'Repository'}</div>
                <div className="text-slate-600 font-bold text-sm font-mono uppercase">SQL Cloud</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Body Renderers */}
        {activeTab === 'dashboard' && (
          <div id="admin-tab-dashboard-body" className="space-y-8">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md text-right">
                <div>
                  <span className="block text-slate-450 text-slate-400 text-xs font-bold uppercase tracking-wider">{language === 'ar' ? 'العقارات المدرجة' : 'Properties Inventory'}</span>
                  <span className="block text-3xl font-black text-[#0F172A] mt-1">{properties.length}</span>
                  <span className="block text-[10px] text-indigo-600 font-bold mt-1">{language === 'ar' ? 'نشطة ومحفوظة' : 'Active and persisted'}</span>
                </div>
                <div className="p-3.5 bg-indigo-50 rounded-xl text-indigo-600"><Building2 className="w-6 h-6" /></div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md text-right">
                <div>
                  <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider">{language === 'ar' ? 'المشاريع العمرانية' : 'Projects Registered'}</span>
                  <span className="block text-3xl font-black text-[#0F172A] mt-1">{projects.length}</span>
                  <span className="block text-[10px] text-amber-600 font-bold mt-1">{language === 'ar' ? 'رؤية ٢٠٣٠' : 'Saudi Vision 2030'}</span>
                </div>
                <div className="p-3.5 bg-amber-50 rounded-xl text-[#B45309]"><Milestone className="w-6 h-6" /></div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md text-right">
                <div>
                  <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider">{language === 'ar' ? 'طلبات الاتصال' : 'Inquiries Inbox'}</span>
                  <span className="block text-3xl font-black text-[#0F172A] mt-1">{inquiries.length}</span>
                  <span className="block text-[10px] text-[#064E3B] font-bold mt-1">{language === 'ar' ? 'تحتاج للمتابعة' : 'Requires follow-up'}</span>
                </div>
                <div className="p-3.5 bg-emerald-50 rounded-xl text-[#064E3B]"><Inbox className="w-6 h-6" /></div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md text-right">
                <div>
                  <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider">{language === 'ar' ? 'القيمة التقديرية' : 'Estimated Value'}</span>
                  <span className="block text-2xl font-black text-[#064E3B] mt-1">٧٤,٥ م</span>
                  <span className="block text-[10px] text-slate-500 mt-1">{language === 'ar' ? 'مليون ريال سعودي' : 'Million SAR'}</span>
                </div>
                <div className="p-3.5 bg-teal-50 rounded-xl text-teal-600"><DollarSign className="w-6 h-6" /></div>
              </div>

            </div>

            {/* Leads Analytics & Export Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
              
              {/* Lead Breakdown & Export List */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-right">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-lg text-[#0F172A]">{language === 'ar' ? 'متابعة وإدارة مسار المبيعات' : 'Lead Tracking & Sales Funnel'}</h3>
                  </div>
                  
                  <button
                    onClick={handleExportInquiriesCSV}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-sans transition-all active:scale-95 shadow cursor-pointer"
                  >
                    <FilePdf className="w-4 h-4" />
                    <span>{language === 'ar' ? 'تصدير البيانات CSV' : 'Export CSV Leads'}</span>
                  </button>
                </div>

                <div className="space-y-4 pt-2">
                  <p className="text-slate-500 text-xs">
                    {language === 'ar' 
                      ? 'يمكنك تنزيل تقرير مبيعات فوري لجميع طلبات الملاك والعملاء المهتمين بالمشاريع السكنية، بما يدعم الأنظمة الخارجية CRM.'
                      : 'Download instant sales raw logs for premium property buyers and leads matching external CRM workflows.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {/* New Leads tracking card */}
                    <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 text-right">
                      <span className="block text-slate-500 text-xs font-medium">{language === 'ar' ? 'الجديدة غير المقروءة' : 'Unread New Leads'}</span>
                      <span className="block text-2xl font-black text-rose-700 mt-1">
                        {inquiries.filter(i => i.status === 'new').length}
                      </span>
                    </div>

                    {/* Contacted Leads tracking card */}
                    <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 text-right">
                      <span className="block text-slate-500 text-xs font-medium">{language === 'ar' ? 'جاري التواصل والمبيعات' : 'In Discussion'}</span>
                      <span className="block text-2xl font-black text-amber-700 mt-1">
                        {inquiries.filter(i => i.status === 'contacted').length}
                      </span>
                    </div>

                    {/* Closed Leads tracking card */}
                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-right">
                      <span className="block text-slate-500 text-xs font-medium">{language === 'ar' ? 'المغلقة والناجحة' : 'Successful Closed'}</span>
                      <span className="block text-2xl font-black text-emerald-700 mt-1">
                        {inquiries.filter(i => i.status === 'closed').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Interest Distribution Visualizer */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-right flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Sliders className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-lg text-[#0F172A]">{language === 'ar' ? 'مسار التحويل النسبي' : 'Status Conversion %'}</h3>
                  </div>
                  
                  <div className="space-y-4 pt-4 font-sans">
                    {(() => {
                      const total = inquiries.length || 1;
                      const nVal = Math.round((inquiries.filter(i => i.status === 'new').length / total) * 100);
                      const cVal = Math.round((inquiries.filter(i => i.status === 'contacted').length / total) * 100);
                      const closeVal = Math.round((inquiries.filter(i => i.status === 'closed').length / total) * 100);
                      
                      return (
                        <>
                          {/* New lead bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-rose-600">{nVal}%</span>
                              <span className="text-slate-700">{language === 'ar' ? 'طلب جديد' : 'New Requests'}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${nVal}%` }} />
                            </div>
                          </div>

                          {/* Contacted lead bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-amber-600">{cVal}%</span>
                              <span className="text-slate-700">{language === 'ar' ? 'قيد المعالجة والتواصل' : 'In Discussion'}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${cVal}%` }} />
                            </div>
                          </div>

                          {/* Closed lead bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-emerald-600">{closeVal}%</span>
                              <span className="text-slate-700">{language === 'ar' ? 'مبيعات منجزة ومغلقة' : 'Closed Deals'}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${closeVal}%` }} />
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="text-[11px] text-slate-450 leading-relaxed font-semibold pt-4 text-center">
                  {language === 'ar' 
                    ? 'يتم تحديث النسب المئوية تلقائياً عند تغيير الحالات' 
                    : 'Conversion funnel updates seamlessly upon status alterations.'}
                </div>
              </div>

            </div>

            {/* Architecture Details Log */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-right">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Database className="w-5 h-5 text-[#B45309]" style={{ color: theme.secondary }} />
                <h3 className="font-sans font-bold text-lg text-[#0F172A]">هيكل قواعد البيانات والتحويل (Future SQL Migration Path)</h3>
              </div>
              <p className="text-slate-550 text-slate-500 text-sm leading-relaxed">
                تم صياغة المنصة بالكامل باستخدام **نمط المستودعات (Repository Pattern)** وعزل المكونات المرئية عن مصدر البيانات. 
                في الإصدار القادم، لن تتعرض أي مكونات للتعديل، وسيتم تبديل ملفات الاستيراد فقط لتوجيه المنصة لتقنيات قواعد البيانات العلاقة المستهدفة:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs text-slate-700 uppercase tracking-wider font-mono font-bold">PostgreSQL</div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs text-slate-700 uppercase tracking-wider font-mono font-bold">SQL Server</div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs text-slate-700 uppercase tracking-wider font-mono font-bold">MySQL Engine</div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs text-slate-700 uppercase tracking-wider font-mono font-bold">Supabase client</div>
              </div>
            </div>

            {/* Recent inquiries display */}
            <div className="bg-white border border-slate-200 rounded-2xl space-y-4 p-6 shadow-sm">
              <h3 className="font-sans font-bold text-lg text-[#0F172A] border-b border-slate-110 border-slate-100 pb-3 text-right">آخر الاستفسارات الواردة</h3>
              {inquiries.length === 0 ? (
                <p className="text-slate-405 text-slate-400 text-xs text-right">لا توجد طلبات جارية حالياً.</p>
              ) : (
                <div className="space-y-4">
                  {inquiries.slice(0, 3).map(inq => (
                    <div key={inq.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-start text-xs gap-4 text-right">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{inq.fullName}</span>
                          <span className="text-[10px] text-slate-400 font-mono pr-2 border-r border-slate-205 border-slate-200">{inq.phone}</span>
                        </div>
                        <p className="text-slate-500 leading-normal font-medium">{inq.message}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                        inq.status === 'new' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {inq.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div id="admin-tab-projects-body" className="space-y-6 text-right">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="space-y-1">
                <h3 className="font-sans font-black text-lg text-[#0F172A] flex items-center justify-center sm:justify-start gap-2">
                  <Milestone className="w-5 h-5 text-[#B45309]" />
                  <span>{language === 'ar' ? 'إدارة المشاريع العقارية الكبرى' : 'Megaprojects Management'}</span>
                </h3>
                <p className="text-slate-500 text-xs">
                  {language === 'ar' 
                    ? 'تحكم بالمجمعات السكنية والأبراج، خصائص الهندسة، تحميل البروشورات والوسائط المصاحبة.' 
                    : 'Configure dynamic communities, towers, brochure PDFs, custom amenities, and map elements.'}
                </p>
              </div>
              {!isEditingProject && (
                <button 
                  onClick={handleOpenAddProject}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0F172A] hover:bg-[#1E293B] text-white flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إضافة مشروع جديد' : 'Create New Project'}</span>
                </button>
              )}
            </div>

            {/* Editing / Creating Form */}
            {isEditingProject ? (
              <form onSubmit={handleSaveProject} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h4 className="font-sans font-black text-sm text-[#0F172A] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]"></span>
                    {currentProjectId 
                      ? (language === 'ar' ? 'تعديل بيانات وملفات المشروع' : 'Edit Project Details') 
                      : (language === 'ar' ? 'تأسيس وبناء مشروع عقاري جديد' : 'Draft New Residential Project')}
                  </h4>
                  <button 
                    type="button" 
                    onClick={resetProjectForm}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 cursor-pointer flex items-center justify-center"
                    title={language === 'ar' ? 'إلغاء والتراجع' : 'Cancel'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Grid layout */}
                <div className="space-y-8">
                  {/* Category 1: Names & Description */}
                  <div className="space-y-4">
                    <h5 className="font-sans font-bold text-xs text-[#B45309] border-b border-slate-100 pb-2">
                      {language === 'ar' ? 'القسم الأول: العناوين والمحتوى الترويجي' : 'Section 1: General Details & Core Content'}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5 text-xs text-right">
                        <label className="text-slate-500 font-bold block">{language === 'ar' ? 'اسم المشروع السكني (بالعربية)' : 'Project Name (Arabic)'} <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          required
                          value={projectNameAr}
                          onChange={(e) => setProjectNameAr(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                          placeholder="مثال: واحة المجمع السكني المتميز"
                        />
                      </div>
                      <div className="space-y-1.5 text-xs text-right" dir="ltr">
                        <label className="text-slate-500 font-bold block text-left font-sans">{language === 'ar' ? 'Project Name (English)' : 'Project Name (English)'} <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          required
                          value={projectNameEn}
                          onChange={(e) => setProjectNameEn(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C] text-left"
                          placeholder="e.g. Al-Wasil Luxury Oasis"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-1.5 text-xs text-right">
                        <label className="text-slate-500 font-bold block">{language === 'ar' ? 'الوصف الهندسي والمميزات (العربية)' : 'Project Description (Arabic)'}</label>
                        <textarea 
                          rows={4}
                          value={projectDescAr}
                          onChange={(e) => setProjectDescAr(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                          placeholder="تحدث باستفاضة عن التصميم المعماري والموقع والمساحة الفنية..."
                        />
                      </div>
                      <div className="space-y-1.5 text-xs text-right" dir="ltr">
                        <label className="text-slate-500 font-bold block text-left font-sans">{language === 'ar' ? 'Project Description (English)' : 'Project Description (English)'}</label>
                        <textarea 
                          rows={4}
                          value={projectDescEn}
                          onChange={(e) => setProjectDescEn(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C] text-left"
                          placeholder="Describe the architectural language, built area, environment..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-1.5 text-xs text-right">
                        <label className="text-slate-500 font-bold block">{language === 'ar' ? 'المطور (العربية)' : 'Developer (Arabic)'}</label>
                        <input
                          type="text"
                          value={projectDeveloperAr}
                          onChange={(e) => setProjectDeveloperAr(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                          placeholder={language === 'ar' ? 'شركة بناء وإدارة' : 'Bina & Edarah'}
                        />
                      </div>
                      <div className="space-y-1.5 text-xs text-right" dir="ltr">
                        <label className="text-slate-500 font-bold block text-left font-sans">{language === 'ar' ? 'المطور (الإنجليزية)' : 'Developer (English)'}</label>
                        <input
                          type="text"
                          value={projectDeveloperEn}
                          onChange={(e) => setProjectDeveloperEn(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C] text-left"
                          placeholder="Bina & Edarah"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                      <div className="space-y-1.5 text-xs text-right">
                        <label className="text-slate-500 font-bold block">{language === 'ar' ? 'تاريخ الانتهاء المحدّد' : 'Target Completion Date'}</label>
                        <input 
                          type="date"
                          value={projectCompletionDate}
                          onChange={(e) => setProjectCompletionDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[#1A202C]"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs text-right">
                        <label className="text-slate-500 font-bold block">{language === 'ar' ? 'حالة جاهزية المشروع السكني' : 'Project Status'}</label>
                        <select 
                          value={projectStatus}
                          onChange={(e) => setProjectStatus(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-[#1A202C]"
                        >
                          <option value="available">{language === 'ar' ? 'متاح للبيع (Available)' : 'Available'}</option>
                          <option value="under-construction">{language === 'ar' ? 'تحت الإنشاء' : 'Under Construction'}</option>
                          <option value="sold">{language === 'ar' ? 'مباع (Sold)' : 'Sold'}</option>
                          <option value="sold-out">{language === 'ar' ? 'مباع بالكامل' : 'Sold Out'}</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 text-xs text-right">
                        <label className="text-slate-500 font-bold block">{language === 'ar' ? 'عدد الوحدات' : 'Units Count'}</label>
                        <input
                          type="number"
                          min={0}
                          value={projectUnits}
                          onChange={(e) => setProjectUnits(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[#1A202C]"
                          placeholder={language === 'ar' ? 'مثال: 84' : 'e.g. 84'}
                        />
                      </div>

                      <div className="space-y-1.5 text-xs text-right flex flex-col justify-end">
                        <label className="flex items-center gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                          <input 
                            type="checkbox"
                            checked={projectFeatured}
                            onChange={(e) => setProjectFeatured(e.target.checked)}
                            className="w-4 h-4 rounded text-[#B45309] focus:ring-[#B45309]"
                          />
                          <span className="font-bold text-slate-700">{language === 'ar' ? 'وضع كـ مشروع مميز بالرئيسية' : 'Featured Project (Main page)'}</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Category 2: Coordinates, City, District */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h5 className="font-sans font-bold text-xs text-[#B45309] border-b border-slate-100 pb-2">
                      {language === 'ar' ? 'القسم الثاني: الموقع الجغرافي والإحداثيات الدقيقة' : 'Section 2: Detailed Location & Map Grid'}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                      <div className="space-y-1.5 text-right">
                        <label className="text-slate-500 font-bold block">{language === 'ar' ? 'المدينة (العربية / English)' : 'City (Ar / En)'}</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={projectCityAr}
                            onChange={(e) => setProjectCityAr(e.target.value)}
                            className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl p-3 font-sans"
                            placeholder="المدينة بالعربي"
                          />
                          <input 
                            type="text" 
                            value={projectCityEn}
                            onChange={(e) => setProjectCityEn(e.target.value)}
                            className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl p-3 font-sans text-left"
                            placeholder="City (English)"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-right">
                        <label className="text-slate-500 font-bold block">{language === 'ar' ? 'الحي (العربية / English)' : 'District (Ar / En)'}</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={projectDistrictAr}
                            onChange={(e) => setProjectDistrictAr(e.target.value)}
                            className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl p-3"
                            placeholder="حي الملقا"
                          />
                          <input 
                            type="text" 
                            value={projectDistrictEn}
                            onChange={(e) => setProjectDistrictEn(e.target.value)}
                            className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-left"
                            placeholder="Al-Malqa"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-right">
                        <label className="text-slate-500 font-bold block">{language === 'ar' ? 'العنوان التفصيلي ومكتب المبيعات (العربية / English)' : 'Detailed Address (Ar / En)'}</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={projectAddressAr}
                            onChange={(e) => setProjectAddressAr(e.target.value)}
                            className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl p-3"
                            placeholder="طريق الملك سلمان، الرياض"
                          />
                          <input 
                            type="text" 
                            value={projectAddressEn}
                            onChange={(e) => setProjectAddressEn(e.target.value)}
                            className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-left"
                            placeholder="King Salman Road"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs">
                      <div className="space-y-1.5 text-right md:col-span-1">
                        <label className="text-slate-500 font-bold block">{language === 'ar' ? 'خط العرض (Latitude)' : 'Latitude Coordinate'}</label>
                        <input 
                          type="number"
                          step="0.000001"
                          value={projectLatitude}
                          onChange={(e) => setProjectLatitude(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono"
                          placeholder="e.g. 24.812300"
                        />
                      </div>
                      
                      <div className="space-y-1.5 text-right md:col-span-1">
                        <label className="text-slate-500 font-bold block">{language === 'ar' ? 'خط الطول (Longitude)' : 'Longitude Coordinate'}</label>
                        <input 
                          type="number"
                          step="0.000001"
                          value={projectLongitude}
                          onChange={(e) => setProjectLongitude(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono"
                          placeholder="e.g. 46.612300"
                        />
                      </div>

                      <div className="space-y-1.5 text-right md:col-span-1">
                        <label className="text-slate-500 font-bold block">{language === 'ar' ? 'رابط خريطة جوجل (Google Maps Link)' : 'Google Maps Web Link'}</label>
                        <input 
                          type="url"
                          value={projectGoogleMapsLink}
                          onChange={(e) => setProjectGoogleMapsLink(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[#1A202C]"
                          placeholder="https://maps.google.com/?q=..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category 3: Visual Assets & Client Uploads */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h5 className="font-sans font-bold text-xs text-[#B45309] border-b border-slate-100 pb-2">
                      {language === 'ar' ? 'القسم الثالث: المرفقات التوضيحية والصور (ALL MEDIA MUST BE UPLOADED)' : 'Section 3: Multimedia Attachments'}
                    </h5>
                    {renderUploadProgressPanel()}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Cover Image upload Card */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5 text-xs text-right">
                          <span className="font-bold text-slate-800 block">{language === 'ar' ? 'صورة الغلاف الرسمية للمشروع' : 'Primary Project Cover Image'}</span>
                          <p className="text-[10px] text-slate-450 leading-normal">
                            {language === 'ar' ? 'يرجى اختيار ملف الصورة لغلاف المشروع، سيتحول تلقائياً إلى ترميز مشفّر لضمان عدم توقفه.' : 'Please choose an image file which will be immediately parsed to base64.'}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          {projectCoverImageId ? (
                            <div className="w-20 h-20 bg-slate-900 border border-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1">
                              <img src={resolveMediaBase64(projectCoverImageId) || ''} alt="Project Cover" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-slate-100 border border-dashed border-slate-300 finished rounded-lg shrink-0 flex items-center justify-center text-slate-400 text-[10px]">
                              {language === 'ar' ? 'لا يوجد غلاف' : 'No image'}
                            </div>
                          )}
                          <div className="space-y-2">
                            <label className="px-4 py-2 inline-block rounded-xl bg-[#0F172A] hover:bg-slate-800 cursor-pointer text-xs font-bold text-white transition-colors">
                              <span>{language === 'ar' ? 'اختر ورفع صورة الغلاف' : 'Upload Cover Image'}</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleProjectDirectUpload(e, 'cover')} 
                                className="hidden" 
                              />
                            </label>
                            {projectCoverImageId && (
                              <button 
                                type="button"
                                onClick={() => setProjectCoverImageId('')}
                                className="text-red-600 block text-[10px] font-bold hover:underline"
                              >
                                {language === 'ar' ? 'عزل وإلغاء الغلاف' : 'Remove Cover'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Brochure PDF and Video Row */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5 text-xs text-right">
                          <span className="font-bold text-slate-800 block">{language === 'ar' ? 'كتيب المشروع والبروشور المعتمد (PDF Brochure)' : 'Project Brochure (PDF)'}</span>
                          <p className="text-[10px] text-slate-450 leading-normal">
                            {language === 'ar' ? 'بروشور المجمعات السكنية بصيغة PDF ليتمكن الجمهور من تصفحه وتنزيله.' : 'Provide the complete technical brochure PDF file for the users to download.'}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          {projectBrochurePdfId ? (
                            <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-center text-rose-500 shrink-0">
                              <FilePdf className="w-6 h-6" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-slate-100 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-[#B45309]/50 font-bold text-[10px] shrink-0">
                              PDF
                            </div>
                          )}
                          <div className="space-y-2">
                            <label className="px-4 py-2 inline-block rounded-xl bg-slate-800 hover:bg-slate-700 cursor-pointer text-xs font-bold text-white transition-colors">
                              <span>{language === 'ar' ? 'ارفع كراس الشروط والمواصفات (PDF)' : 'Upload PDF Brochure'}</span>
                              <input 
                                type="file" 
                                accept="application/pdf" 
                                onChange={(e) => handleProjectDirectUpload(e, 'pdf')} 
                                className="hidden" 
                              />
                            </label>
                            {projectBrochurePdfId && (
                              <div className="flex gap-2 items-center">
                                <span className="text-[10px] text-slate-500 font-mono select-all font-bold block">{projectBrochurePdfId}</span>
                                <button 
                                  type="button"
                                  onClick={() => setProjectBrochurePdfId('')}
                                  className="text-red-500 text-[10px] font-bold"
                                >
                                  ❌
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Video clip upload */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5 text-xs text-right">
                          <span className="font-bold text-slate-800 block">{language === 'ar' ? 'فيديو تعريفي ترويجي للمشروع (MP4 Video)' : 'Introductory Project Video'}</span>
                          <p className="text-[10px] text-slate-450 leading-normal">
                            {language === 'ar' ? 'رفع ملف فيديو مباشر يعرض التصميم الثلاثي الأبعاد أو جولات البناء الحقيقية.' : 'Upload an MP4 clip to display walkthroughs, render animations, or status videos.'}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          {projectVideoUploadId ? (
                            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-500 shrink-0">
                              <Film className="w-6 h-6" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-slate-100 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-[#B45309]/50 font-bold text-[10px] shrink-0">
                              MP4
                            </div>
                          )}
                          <div className="space-y-2">
                            <label className="px-4 py-2 inline-block rounded-xl bg-slate-800 hover:bg-slate-700 cursor-pointer text-xs font-bold text-white transition-colors">
                              <span>{language === 'ar' ? 'اختر وارفع ملف فيديو للمشروع (MP4)' : 'Upload MP4 Walkthrough'}</span>
                              <input 
                                type="file" 
                                accept="video/*" 
                                onChange={(e) => handleProjectDirectUpload(e, 'video')} 
                                className="hidden" 
                              />
                            </label>
                            {projectVideoUploadId && (
                              <div className="flex gap-2 items-center">
                                <span className="text-[10px] text-slate-500 font-mono select-all font-bold block">{projectVideoUploadId}</span>
                                <button 
                                  type="button"
                                  onClick={() => setProjectVideoUploadId('')}
                                  className="text-red-500 text-[10px] font-bold"
                                >
                                  ❌
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Gallery Multi images */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5 text-xs text-right">
                          <span className="font-bold text-slate-800 block">{language === 'ar' ? 'معرض الصور الكلي للمشروع (Project Image Gallery)' : 'Project Gallery Photostrip'}</span>
                          <p className="text-[10px] text-slate-450 leading-normal">
                            {language === 'ar' ? 'اختر صورة واحدة أو أكثر لرفع وتغذية ألبوم صور تفاصيل الوحدات والتشطيبات.' : 'Select multiple images to formulate the slide display for structural assets.'}
                          </p>
                        </div>
                        <div className="space-y-3">
                          <label className="px-4 py-2 inline-block rounded-xl bg-[#B45309] hover:bg-[#92400E] cursor-pointer text-xs font-bold text-white transition-colors">
                            <span>{language === 'ar' ? 'رفع صور ألبوم المعرض' : 'Upload Multi-Gallery Images'}</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              multiple
                              onChange={(e) => handleProjectDirectUpload(e, 'gallery')} 
                              className="hidden" 
                            />
                          </label>

                          {/* Render gallery thumbnails */}
                          {projectGalleryImageIds.length > 0 && (
                            <div className="grid grid-cols-5 gap-2 pt-1 border-t border-slate-205 border-slate-200">
                              {projectGalleryImageIds.map((imgId, idx) => (
                                <div key={imgId + '_' + idx} className="h-10 bg-slate-900 rounded border border-slate-200 relative group overflow-hidden flex items-center justify-center p-0.5">
                                  <img src={resolveMediaBase64(imgId) || ''} alt="Thumb" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                                  <button 
                                    type="button"
                                    onClick={() => setProjectGalleryImageIds(projectGalleryImageIds.filter(id => id !== imgId))}
                                    className="absolute -top-1 -right-1 p-0.5 rounded-full bg-red-600 text-white hover:scale-105 text-[8px] flex items-center justify-center"
                                    title="حذف"
                                  >
                                    ❌
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category 4: Amenities & Custom ones */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h5 className="font-sans font-bold text-xs text-[#B45309] border-b border-slate-100 pb-2">
                      {language === 'ar' ? 'القسم الرابع: حزمة المرافق ومواصفات الرفاهية السكنية' : 'Section 4: Project Amenities & Comfort Matrix'}
                    </h5>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans text-right">
                      <label className="flex items-center gap-2.5 p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={projectAmenityParking}
                          onChange={(e) => setProjectAmenityParking(e.target.checked)}
                          className="w-4 h-4 rounded text-[#B45309] focus:ring-[#B45309]"
                        />
                        <span className="font-bold text-slate-700">{language === 'ar' ? 'مواقف سيارات (Parking)' : 'Parking Area'}</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={projectAmenitySecurity}
                          onChange={(e) => setProjectAmenitySecurity(e.target.checked)}
                          className="w-4 h-4 rounded text-[#B45309] focus:ring-[#B45309]"
                        />
                        <span className="font-bold text-slate-700">{language === 'ar' ? 'حراسة وأمن (Security)' : '24/7 Security'}</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={projectAmenityElevators}
                          onChange={(e) => setProjectAmenityElevators(e.target.checked)}
                          className="w-4 h-4 rounded text-[#B45309] focus:ring-[#B45309]"
                        />
                        <span className="font-bold text-slate-700">{language === 'ar' ? 'مصاعد ذكية (Elevators)' : 'Smart Elevators'}</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={projectAmenityMosque}
                          onChange={(e) => setProjectAmenityMosque(e.target.checked)}
                          className="w-4 h-4 rounded text-[#B45309] focus:ring-[#B45309]"
                        />
                        <span className="font-bold text-slate-700">{language === 'ar' ? 'مسجد جامع (Mosque)' : 'Mosque'}</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={projectAmenityGym}
                          onChange={(e) => setProjectAmenityGym(e.target.checked)}
                          className="w-4 h-4 rounded text-[#B45309] focus:ring-[#B45309]"
                        />
                        <span className="font-bold text-slate-700">{language === 'ar' ? 'نادي رياضي (Gym)' : 'Premium Gym'}</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={projectAmenityPool}
                          onChange={(e) => setProjectAmenityPool(e.target.checked)}
                          className="w-4 h-4 rounded text-[#B45309] focus:ring-[#B45309]"
                        />
                        <span className="font-bold text-slate-700">{language === 'ar' ? 'مسبح خارجي (Pool)' : 'Swimming Pool'}</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={projectAmenityChildrenArea}
                          onChange={(e) => setProjectAmenityChildrenArea(e.target.checked)}
                          className="w-4 h-4 rounded text-[#B45309] focus:ring-[#B45309]"
                        />
                        <span className="font-bold text-slate-700">{language === 'ar' ? 'منطقة ملاعب أطفال (Kids)' : 'Children Area'}</span>
                      </label>
                    </div>

                    {/* Custom Amenities Builder */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 pt-3">
                      <span className="text-xs font-bold text-slate-800 block">{language === 'ar' ? 'إضافة مميزات ومرافق مخصصة إضافية' : 'Build Custom Project Amenities'}</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <input 
                          type="text"
                          value={tempCustomAmenityAr}
                          onChange={(e) => setTempCustomAmenityAr(e.target.value)}
                          placeholder="الميزة بالعربية (مثال: محطة شحن سيارات)"
                          className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-sans text-[#1A202C]"
                        />
                        <input 
                          type="text"
                          value={tempCustomAmenityEn}
                          onChange={(e) => setTempCustomAmenityEn(e.target.value)}
                          placeholder="Amenity in English (e.g. EV Charger)"
                          className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-left font-sans text-[#1A202C]"
                          dir="ltr"
                        />
                        <button 
                          type="button" 
                          onClick={handleAddCustomAmenity}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>{language === 'ar' ? 'إدراج الميزة' : 'Insert Amenity'}</span>
                        </button>
                      </div>

                      {/* Pill display of added custom amenities */}
                      {projectCustomAmenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {projectCustomAmenities.map((am, idx) => (
                            <div key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EEF2F6] border border-slate-205 border-slate-200 rounded-full text-[10px] font-bold text-slate-700">
                              <span>{t(am)}</span>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveCustomAmenity(idx)}
                                className="text-red-600 hover:text-red-800 font-bold ml-1"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category 5: SEO configuration fields */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h5 className="font-sans font-bold text-xs text-[#B45309] border-b border-slate-100 pb-2">
                      {language === 'ar' ? 'القسم الخامس: مصفوفة محركات البحث الفنية وتحسين الأرشفة (SEO Settings)' : 'Section 5: Advanced Search-Engine Optimization'}
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      <div className="space-y-1.5 text-right">
                        <label className="text-slate-500 font-bold block">{language === 'ar' ? 'عنوان ميتا بالعربية (Meta Title Arabic)' : 'Meta Title (Arabic)'}</label>
                        <input 
                          type="text" 
                          value={projectSeoTitleAr}
                          onChange={(e) => setProjectSeoTitleAr(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white text-[#1A202C]"
                          placeholder="مثال: واحة بناء العقارية | فلل راقية للبيع شمال الرياض"
                        />
                      </div>
                      
                      <div className="space-y-1.5 text-right" dir="ltr">
                        <label className="text-slate-500 font-bold block text-left font-sans">{language === 'ar' ? 'Meta Title English' : 'Meta Title (English)'}</label>
                        <input 
                          type="text" 
                          value={projectSeoTitleEn}
                          onChange={(e) => setProjectSeoTitleEn(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white text-[#1A202C] text-left"
                          placeholder="e.g. BINA Oasis | High-End Residential Villas Riyadh"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs">
                      <div className="space-y-1.5 text-right">
                        <label className="text-slate-500 font-bold block">{language === 'ar' ? 'وصف ميتا المختصر بالعربية (Meta Description Arabic)' : 'Meta Description (Arabic)'}</label>
                        <textarea 
                          rows={2}
                          value={projectSeoDescAr}
                          onChange={(e) => setProjectSeoDescAr(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white text-[#1A202C]"
                          placeholder="كافئ محركات البحث بوصف شيق وصغير للمشروع لجلب عملائك..."
                        />
                      </div>
                      
                      <div className="space-y-1.5 text-right" dir="ltr">
                        <label className="text-slate-500 font-bold block text-left font-sans">{language === 'ar' ? 'Meta Description English' : 'Meta Description (English)'}</label>
                        <textarea 
                          rows={2}
                          value={projectSeoDescEn}
                          onChange={(e) => setProjectSeoDescEn(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white text-[#1A202C] text-left"
                          placeholder="Provide a search snippet to present this project when indexing..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form buttons */}
                <div className="flex pt-6 border-t border-slate-100 gap-4 justify-start font-sans">
                  <button 
                    type="submit"
                    className="px-8 py-3.5 rounded-xl bg-[#0F172A] text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-[#FFECA1]" />
                    <span>{language === 'ar' ? 'حفظ المشروع وتثبيت المرفقات' : 'Save Project Files'}</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={resetProjectForm}
                    className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </form>
            ) : (
              /* Listing Table Content */
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs text-[#1A202C]">
                    <thead className="bg-[#0F172A] text-white uppercase tracking-wider font-bold">
                      <tr>
                        <th className="p-4 font-bold">{language === 'ar' ? 'غلاف المشروع' : 'Cover Snapshot'}</th>
                        <th className="p-4 font-bold">{language === 'ar' ? 'اسم المشروع السكني' : 'Project Name'}</th>
                        <th className="p-4 font-bold">{language === 'ar' ? 'المطور' : 'Developer'}</th>
                        <th className="p-4 font-bold">{language === 'ar' ? 'مقر المدينة والحي' : 'Location / Territory'}</th>
                        <th className="p-4 font-bold">{language === 'ar' ? 'تاريخ الانتهاء المخطط' : 'Completion'}</th>
                        <th className="p-4 font-bold">{language === 'ar' ? 'عدد الوحدات' : 'Units'}</th>
                        <th className="p-4 font-bold">{language === 'ar' ? 'الحالة الإدارية' : 'Status'}</th>
                        <th className="p-4 font-bold">{language === 'ar' ? 'المميزات السيو/الرئيسية' : 'Features'}</th>
                        <th className="p-4 text-center font-bold">{language === 'ar' ? 'إجراءات التحكم' : 'Operations'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {projects.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-10 text-center text-slate-400 font-sans">
                            {language === 'ar' ? 'لا يوجد مشاريع مسجلة في محرك التخزين حالياً. الرجاء البدء بالنقر على "اضافة مشروع جديد"' : 'No projects registered. Click "Create New Project" to initialize.'}
                          </td>
                        </tr>
                      ) : (
                        projects.map((proj) => (
                          <tr key={proj.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-4">
                              {proj.coverImageId ? (
                                <div className="w-14 h-10 bg-slate-900 rounded border border-slate-100 overflow-hidden flex items-center justify-center p-0.5">
                                  <img src={resolveMediaBase64(proj.coverImageId) || ''} alt="Cover" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                                </div>
                              ) : (
                                <div className="w-14 h-10 bg-slate-100 rounded border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-[9px] font-sans">
                                  {language === 'ar' ? 'بلا غلاف' : 'No Cover'}
                                </div>
                              )}
                            </td>
                            <td className="p-4 font-black text-slate-900 text-sm">{t(proj.name)}</td>
                            <td className="p-4 text-slate-600">
                              {proj.developer ? (
                                <span className="block font-bold">{t(proj.developer)}</span>
                              ) : (
                                <span className="block text-slate-300">---</span>
                              )}
                            </td>
                            <td className="p-4 text-slate-600">
                              <span className="block font-bold">{t(proj.city)}</span>
                              <span className="block text-[10px] text-slate-400">{t(proj.district)}</span>
                            </td>
                            <td className="p-4 font-mono text-slate-500 font-bold">{proj.completionDate || '---'}</td>
                            <td className="p-4 font-mono text-slate-700 font-bold">{proj.units ?? 0}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 inline-block rounded-lg text-[10px] uppercase font-bold text-center ${
                                proj.status === 'available' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                proj.status === 'under-construction' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                proj.status === 'sold-out' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                                'bg-rose-50 text-rose-600 border border-rose-100'
                              }`}>
                                {proj.status === 'available' ? (language === 'ar' ? 'متاح' : 'Available') :
                                 proj.status === 'under-construction' ? (language === 'ar' ? 'تحت الإنشاء' : 'Under Construction') :
                                 proj.status === 'sold-out' ? (language === 'ar' ? 'مباع بالكامل' : 'Sold Out') :
                                 (language === 'ar' ? 'مباع' : 'Sold')}
                              </span>
                            </td>
                            <td className="p-4 space-y-1">
                              {proj.featured && (
                                <span className="inline-block bg-[#FFECA1] text-amber-950 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ml-1">
                                  {language === 'ar' ? 'مميز' : 'Featured'}
                                </span>
                              )}
                              {proj.brochurePdfId && (
                                <span className="inline-block bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ml-1">
                                  PDF
                                </span>
                              )}
                              {proj.videoUploadId && (
                                <span className="inline-block bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                                  MP4
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2 justify-center items-center">
                                <button 
                                  onClick={() => handleEditProjectClick(proj)}
                                  className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-950 cursor-pointer transition-colors"
                                  title={language === 'ar' ? 'تعديل المشروع' : 'Edit'}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProject(proj.id)}
                                  className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center text-red-650 hover:text-red-900 cursor-pointer transition-colors"
                                  title={language === 'ar' ? 'حذف المشروع' : 'Delete'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'properties' && (
          <div id="admin-tab-properties-body" className="space-y-6 text-right">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-sans font-black text-lg text-slate-800 mb-1">
                  {language === 'ar' ? 'لوحة الأصول والوحدات العقارية' : 'Property Assets & Units Inventory'}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {language === 'ar' 
                    ? 'أدرج الوحدات السكنية والتجارية، وحدد مواصفات الكروكي والأسعار وتفاصيل مخططات الطوابق والربط بالمشاريع.'
                    : 'Manage residential and commercial units, prices, floor plans, specs, and parent projects.'}
                </p>
              </div>
              {!isEditingProperty && (
                <button
                  type="button"
                  onClick={handleOpenAddProperty}
                  className="px-5 py-2.5 rounded-xl font-sans text-xs font-bold text-white shadow-md transition-all flex items-center gap-2 cursor-pointer border-0"
                  style={{ backgroundColor: theme.secondary || '#B45309' }}
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إضافة وحدة عقارية جديدة' : 'Add New Unit'}</span>
                </button>
              )}
            </div>

            {isEditingProperty ? (
              <form onSubmit={handleSaveProperty} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h4 className="font-sans font-black text-sm text-[#0F172A] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]"></span>
                    {currentPropertyId 
                      ? (language === 'ar' ? `تعديل بيانات وملفات العقار (${currentPropertyId})` : `Edit Property Details (${currentPropertyId})`) 
                      : (language === 'ar' ? 'تأسيس وبناء أصل عقاري جديد' : 'Create New Real Estate Asset')}
                  </h4>
                  <button 
                    type="button" 
                    onClick={resetPropertyForm}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 cursor-pointer flex items-center justify-center animate-pulse"
                    title={language === 'ar' ? 'إلغاء والتراجع' : 'Cancel'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Sub-tab Selection Buttons */}
                <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4 shrink-0 overflow-x-auto select-none" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {[
                    { id: 'general', labelAr: 'البيانات الأساسية', labelEn: 'General Info' },
                    { id: 'pricing', labelAr: 'التثمين والأسعار', labelEn: 'Pricing & Status' },
                    { id: 'location', labelAr: 'العنوان وموقع الخارطة', labelEn: 'Location Setup' },
                    { id: 'media', labelAr: 'معارض الصور والوسائط', labelEn: 'Media Gallery' },
                    { id: 'highlights', labelAr: 'النقاط البارزة والمزايا', labelEn: 'Highlights' },
                    { id: 'amenities', labelAr: 'الخدمات والتجهيزات', labelEn: 'Amenities' },
                    { id: 'floor_plans', labelAr: 'كروكي ومخطط الطابق', labelEn: 'Floor Plans' },
                    { id: 'documents', labelAr: 'وثائق ومستندات تنزيل', labelEn: 'Documents' },
                    { id: 'video', labelAr: 'الفيديو والجولة الافتراضية', labelEn: 'Video & Tours' },
                    { id: 'nearby', labelAr: 'المرافق المجاورة للعقار', labelEn: 'Nearby Places' },
                    { id: 'seo', labelAr: 'محركات البحث SEO Meta', labelEn: 'SEO Meta' },
                    { id: 'inquiry', labelAr: 'إعدادات استقبال الاتصال', labelEn: 'Inquiry Settings' },
                  ].map((subtab) => {
                    const isSel = activePropertyEditorSubtab === subtab.id;
                    return (
                      <button
                        key={subtab.id}
                        type="button"
                        onClick={() => setActivePropertyEditorSubtab(subtab.id)}
                        className={`px-4 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer border-0 ${
                          isSel 
                            ? 'text-white shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-650'
                        }`}
                        style={isSel ? { backgroundColor: theme.primary || '#0F172A' } : undefined}
                      >
                        {language === 'ar' ? subtab.labelAr : subtab.labelEn}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-6 pt-3">
                  {/* ====== TAB 1: GENERAL INFO ====== */}
                  {activePropertyEditorSubtab === 'general' && (
                    <div className="space-y-6">
                      <h5 className="font-sans font-bold text-xs text-[#B45309] border-b border-slate-100 pb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
                        {language === 'ar' ? 'البيانات الأساسية ونوع العقار' : 'General specifications and type'}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'المشروع التابع له (اختياري)' : 'Parent Project (Optional)'}</label>
                          <select
                            value={propertyProjectId}
                            onChange={(e) => setPropertyProjectId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                          >
                            <option value="">{language === 'ar' ? '-- بدون مشروع --' : '-- No Project --'}</option>
                            {projects.map(proj => (
                              <option key={proj.id} value={proj.id}>{t(proj.name)}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'نوع العقار' : 'Property Type'} <span className="text-red-500">*</span></label>
                          <select
                            value={propertyTypeSelection}
                            onChange={(e) => setPropertyTypeSelection(e.target.value as PropertyPresetType | 'custom')}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                          >
                            <option value="apartment">{language === 'ar' ? 'شقة سكنية' : 'Apartment'}</option>
                            <option value="villa">{language === 'ar' ? 'فيلا فاخرة' : 'Villa'}</option>
                            <option value="office">{language === 'ar' ? 'مكتب تجاري' : 'Office'}</option>
                            <option value="shop">{language === 'ar' ? 'معرض أو محل تجاري' : 'Shop / Retail'}</option>
                            <option value="land">{language === 'ar' ? 'أرض عقارية' : 'Land'}</option>
                            <option value="custom">{language === 'ar' ? 'نوع مخصص' : 'Custom Type'}</option>
                          </select>
                          {propertyTypeSelection === 'custom' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                              <div className="space-y-1.5" dir="rtl">
                                <label className="text-slate-500 font-bold block">{language === 'ar' ? 'نوع العقار (عربي)' : 'Property Type (Arabic)'}</label>
                                <input
                                  type="text"
                                  value={propertyCustomTypeAr}
                                  onChange={(e) => setPropertyCustomTypeAr(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                                  placeholder={language === 'ar' ? 'مثال: دوبلكس فاخر' : 'e.g. Luxury Duplex'}
                                />
                              </div>
                              <div className="space-y-1.5" dir="ltr">
                                <label className="text-slate-500 font-bold block text-left font-sans">{language === 'ar' ? 'Property Type (English)' : 'Property Type (English)'}</label>
                                <input
                                  type="text"
                                  value={propertyCustomTypeEn}
                                  onChange={(e) => setPropertyCustomTypeEn(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                                  placeholder={language === 'ar' ? 'مثال: دوبلكس فاخر' : 'e.g. Luxury Duplex'}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'رقم الوحدة (اختياري)' : 'Unit Number'}</label>
                          <input 
                            type="text" 
                            value={propertyUnitNumber}
                            onChange={(e) => setPropertyUnitNumber(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder={language === 'ar' ? 'مثال: شقة 14A أو معرض ف' : 'e.g. Apt 14A or Shop B'}
                          />
                        </div>

                        <div className="space-y-1.5 text-xs text-right flex items-end">
                          <label className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center lg:items-center gap-3 cursor-pointer w-full justify-between select-none">
                            <span className="text-[#0F172A] font-bold">{language === 'ar' ? 'عقار مميز في الواجهة' : 'Featured Property'}</span>
                            <input 
                              type="checkbox"
                              checked={propertyFeatured}
                              onChange={(e) => setPropertyFeatured(e.target.checked)}
                              className="w-4 h-4 rounded text-[#0F172A] cursor-pointer"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'اسم العقار (عربي)' : 'Property Name (Arabic)'} <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            required
                            value={propertyNameAr}
                            onChange={(e) => setPropertyNameAr(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="مثال: شقة أوركيد مع إطلالة معلقة"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right" dir="ltr">
                          <label className="text-slate-500 font-bold block text-left font-sans">{language === 'ar' ? 'Property Name (English)' : 'Property Name (English)'} <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            required
                            value={propertyNameEn}
                            onChange={(e) => setPropertyNameEn(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="e.g. Orchid Sky Penthouse with Scenic View"
                          />
                        </div>

                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'الوصف التفصيلي (عربي)' : 'Detailed Description (Arabic)'}</label>
                          <textarea 
                            rows={4}
                            value={propertyDescAr}
                            onChange={(e) => setPropertyDescAr(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="اكتب مواصفات العقار الفاخرة..."
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right" dir="ltr">
                          <label className="text-slate-500 font-bold block text-left font-sans">{language === 'ar' ? 'Detailed Description (English)' : 'Detailed Description (English)'}</label>
                          <textarea 
                            rows={4}
                            value={propertyDescEn}
                            onChange={(e) => setPropertyDescEn(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="Write property rich specifications..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'المطور العقاري (عربي)' : 'Developer Name (Arabic)'}</label>
                          <input 
                            type="text" 
                            value={propertyDeveloperAr}
                            onChange={(e) => setPropertyDeveloperAr(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="e.g. روشن العقارية"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right" dir="ltr">
                          <label className="text-slate-500 font-bold block text-left font-sans">{language === 'ar' ? 'Developer Name (English)' : 'Developer Name (English)'}</label>
                          <input 
                            type="text" 
                            value={propertyDeveloperEn}
                            onChange={(e) => setPropertyDeveloperEn(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="e.g. ROSHN Developments"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'نوع التشطيب (عربي)' : 'Finishing Type (Arabic)'}</label>
                          <input 
                            type="text" 
                            value={propertyFinishingTypeAr}
                            onChange={(e) => setPropertyFinishingTypeAr(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="مثال: سوبر ديلوكس فاخر"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right" dir="ltr">
                          <label className="text-slate-500 font-bold block text-left font-sans">{language === 'ar' ? 'Finishing Type (English)' : 'Finishing Type (English)'}</label>
                          <input 
                            type="text" 
                            value={propertyFinishingTypeEn}
                            onChange={(e) => setPropertyFinishingTypeEn(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="e.g. Fully Furnished Ultra-luxury"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'نوع الملكية (عربي)' : 'Ownership Type (Arabic)'}</label>
                          <input 
                            type="text" 
                            value={propertyOwnershipTypeAr}
                            onChange={(e) => setPropertyOwnershipTypeAr(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="مثال: فرز حر مع صك مستقل"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right" dir="ltr">
                          <label className="text-slate-500 font-bold block text-left font-sans">{language === 'ar' ? 'Ownership Type (English)' : 'Ownership Type (English)'}</label>
                          <input 
                            type="text" 
                            value={propertyOwnershipTypeEn}
                            onChange={(e) => setPropertyOwnershipTypeEn(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="e.g. Freehold with Independent Title Deed"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'تاريخ إدراج العقار' : 'Listing Date'}</label>
                          <input 
                            type="date" 
                            value={propertyListingDate}
                            onChange={(e) => setPropertyListingDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'عمر العقار (بالسنوات)' : 'Property Age (Years)'}</label>
                          <input 
                            type="number" 
                            value={propertyAge}
                            onChange={(e) => setPropertyAge(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="مثال: 0 للجديد بالكامل"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ====== TAB 2: PRICING DETAILS ====== */}
                  {activePropertyEditorSubtab === 'pricing' && (
                    <div className="space-y-6">
                      <h5 className="font-sans font-bold text-xs text-[#B45309] border-b border-slate-100 pb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
                        {language === 'ar' ? 'تفاصيل التكلفة والحالة التجارية' : 'Price valuation & commercial mode'}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'السعر (القيمة السوقية للبيع أو مبلغ الإيجار)' : 'Price amount'} <span className="text-red-500">*</span></label>
                          <input 
                            type="number" 
                            required
                            min="0"
                            value={propertyPrice}
                            onChange={(e) => setPropertyPrice(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="مثال: 1250000"
                          />
                        </div>

                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-[#0F172A] font-bold block">{language === 'ar' ? 'العُملة الماليّة' : 'Currency'} <span className="text-red-500">*</span></label>
                          <select
                            value={propertyCurrency}
                            onChange={(e) => setPropertyCurrency(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                          >
                            <option value="SAR">SAR (ريال سعودي)</option>
                            <option value="USD">USD ($ دولار أمريكي)</option>
                            <option value="AED">AED (درهم إماراتي)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-[#0F172A] font-bold block">{language === 'ar' ? 'صفة التعاقد' : 'Contract Mode'} <span className="text-red-500">*</span></label>
                          <select
                            value={propertySaleOrRent}
                            onChange={(e) => setPropertySaleOrRent(e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                          >
                            <option value="sale">{language === 'ar' ? 'للبيع نقداً أو تمويل' : 'For Sale'}</option>
                            <option value="rent">{language === 'ar' ? 'للإيجار الدوري' : 'For Rent'}</option>
                          </select>
                        </div>

                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-[#0F172A] font-bold block">{language === 'ar' ? 'حالة التوفر الحالية' : 'Availability Status'} <span className="text-red-500">*</span></label>
                          <select
                            value={propertyStatus}
                            onChange={(e) => setPropertyStatus(e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                          >
                            <option value="available">{language === 'ar' ? 'متاح للطلب الفوري' : 'Available'}</option>
                            <option value="reserved">{language === 'ar' ? 'محجوز تأكيديًا' : 'Reserved'}</option>
                            <option value="sold">{language === 'ar' ? 'مباع تم الإخلاء' : 'Sold'}</option>
                            <option value="rented">{language === 'ar' ? 'مؤجر حالياً' : 'Rented'}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ====== TAB 3: LOCATION SETUP ====== */}
                  {activePropertyEditorSubtab === 'location' && (
                    <div className="space-y-6">
                      <h5 className="font-sans font-bold text-xs text-[#B45309] border-b border-slate-100 pb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
                        {language === 'ar' ? 'العنوان الجغرافي والخرائط' : 'Address setup and map links'}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'مقر المدينة والمحافظة (عربي)' : 'Province/City (Arabic)'}</label>
                          <input 
                            type="text" 
                            value={propertyLocationAr}
                            onChange={(e) => setPropertyLocationAr(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="مثال: الرياض"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right" dir="ltr">
                          <label className="text-slate-500 font-bold block text-left font-sans">{language === 'ar' ? 'Province/City (English)' : 'Province/City (English)'}</label>
                          <input 
                            type="text" 
                            value={propertyLocationEn}
                            onChange={(e) => setPropertyLocationEn(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="e.g. Riyadh"
                          />
                        </div>

                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'اسم الحي والمربّع السكني (عربي)' : 'District Name (Arabic)'}</label>
                          <input 
                            type="text" 
                            value={propertyDistrictAr}
                            onChange={(e) => setPropertyDistrictAr(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="مثال: حى النرجس"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right" dir="ltr">
                          <label className="text-slate-500 font-bold block text-left font-sans">{language === 'ar' ? 'District Name (English)' : 'District Name (English)'}</label>
                          <input 
                            type="text" 
                            value={propertyDistrictEn}
                            onChange={(e) => setPropertyDistrictEn(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="e.g. Al Narjis District"
                          />
                        </div>

                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'العنوان التفصيلي والطريق (عربي)' : 'Specific Road Name (Arabic)'}</label>
                          <input 
                            type="text" 
                            value={propertyAddressAr}
                            onChange={(e) => setPropertyAddressAr(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="مثال: تقاطع طريق عثمان بن عفان"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right" dir="ltr">
                          <label className="text-slate-500 font-bold block text-left font-sans">{language === 'ar' ? 'Specific Road Name (English)' : 'Specific Road Name (English)'}</label>
                          <input 
                            type="text" 
                            value={propertyAddressEn}
                            onChange={(e) => setPropertyAddressEn(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="e.g. Intersection of Othman Bin Affan Rd"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'إحداثيات تحديد الموقع بالمتر (خريطة Google)' : 'Latitude, Longitude Coordinates (Google link / map)'}</label>
                          <input 
                            type="text" 
                            value={propertyCoordinates}
                            onChange={(e) => setPropertyCoordinates(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white text-[#1A202C]"
                            placeholder="e.g. 24.8124, 46.6345"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'رقم الطابق / المنسوب' : 'Floor Number'}</label>
                          <input 
                            type="number" 
                            value={propertyFloorNumber}
                            onChange={(e) => setPropertyFloorNumber(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white text-[#1A202C]"
                            placeholder="مثال: 3 للطابق الثالث ، 0 للأرضي"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'المساحة الكلية (م²)' : 'Area (Sqm)'} <span className="text-red-500">*</span></label>
                          <input 
                            type="number" 
                            required
                            min="1"
                            value={propertyAreaSqm}
                            onChange={(e) => setPropertyAreaSqm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                            placeholder="مثال: 240"
                          />
                        </div>

                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'غرف النوم' : 'Bedrooms'}</label>
                          <input 
                            type="number" 
                            min="0"
                            value={propertyBedrooms}
                            onChange={(e) => setPropertyBedrooms(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                          />
                        </div>

                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'دورات المياه' : 'Bathrooms'}</label>
                          <input 
                            type="number" 
                            min="0"
                            value={propertyBathrooms}
                            onChange={(e) => setPropertyBathrooms(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                          />
                        </div>

                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'الصالات المعيشية' : 'Living Rooms'}</label>
                          <input 
                            type="number" 
                            min="0"
                            value={propertyLivingRooms}
                            onChange={(e) => setPropertyLivingRooms(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                          />
                        </div>

                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'الشرفات / البلكونات' : 'Balconies'}</label>
                          <input 
                            type="number" 
                            min="0"
                            value={propertyBalconies}
                            onChange={(e) => setPropertyBalconies(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                          />
                        </div>

                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-500 font-bold block">{language === 'ar' ? 'مواقف السيارات' : 'Parking Spaces'}</label>
                          <input 
                            type="number" 
                            min="0"
                            value={propertyParkingSpaces}
                            onChange={(e) => setPropertyParkingSpaces(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-slate-400 font-sans text-[#1A202C]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ====== TAB 4: MEDIA GALLERY ====== */}
                  {activePropertyEditorSubtab === 'media' && (
                    <div className="space-y-6">
                      <h5 className="font-sans font-bold text-xs text-[#B45309] border-b border-slate-100 pb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
                        {language === 'ar' ? 'معرض صور العقار الإعلانية' : 'Media files & rich presentation folders'}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cover Image */}
                        <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50 space-y-3">
                          <span className="block text-xs font-black text-slate-800">{language === 'ar' ? 'صورة الغلاف الفاخرة المضيئة' : 'Official Featured Image'} <span className="text-red-500">*</span></span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handlePropertyDirectUpload(e, 'cover')}
                            className="block w-full text-xs text-slate-550 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#B45309]/10 file:text-[#B45309] hover:file:bg-[#B45309]/20"
                          />
                          {propertyUploadState.visible && propertyUploadState.label ? (
                            <div className={`rounded-xl border px-3 py-2 space-y-2 ${
                              propertyUploadState.status === 'error'
                                ? 'border-rose-200 bg-rose-50 text-rose-700'
                                : propertyUploadState.status === 'success'
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                  : 'border-slate-200 bg-white text-slate-700'
                            }`}>
                              <div className="flex items-center justify-between gap-3 text-[10px] font-bold">
                                <span className="truncate">{propertyUploadState.label}</span>
                                <span>{propertyUploadState.progress}%</span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    propertyUploadState.status === 'error'
                                      ? 'bg-rose-500'
                                      : propertyUploadState.status === 'success'
                                        ? 'bg-emerald-500'
                                        : 'bg-[#B45309]'
                                  }`}
                                  style={{ width: `${propertyUploadState.progress}%` }}
                                />
                              </div>
                              <div className="text-[10px] font-medium">
                                {propertyUploadState.status === 'preparing' && (language === 'ar' ? 'جارٍ تجهيز الملف' : 'Preparing file')}
                                {propertyUploadState.status === 'uploading' && (language === 'ar' ? 'جارٍ الرفع إلى الخادم' : 'Uploading to server')}
                                {propertyUploadState.status === 'success' && (language === 'ar' ? 'تم الرفع بنجاح' : 'Upload complete')}
                                {propertyUploadState.status === 'error' && (language === 'ar' ? 'فشل الرفع' : 'Upload failed')}
                              </div>
                            </div>
                          ) : null}
                          {propertyCoverImageId ? (
                            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 flex items-center justify-center">
                              <img src={resolveMediaBase64(propertyCoverImageId) || ''} referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain" />
                              <button 
                                type="button"
                                onClick={() => setPropertyCoverImageId('')}
                                className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full cursor-pointer shadow-sm border-0 flex items-center justify-center animate-pulse"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-full text-xs text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-100 font-bold text-center">
                              {language === 'ar' ? 'الرجاء تحميل صورة الغلاف لعرضها بواجهة المشترين' : 'Please upload a representative cover snapshot.'}
                            </div>
                          )}
                        </div>

                        {/* Gallery Folder and uploaders */}
                        <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50 space-y-3">
                          <span className="block text-xs font-black text-slate-800">{language === 'ar' ? 'مجلد ألبوم الصور الإضافية' : 'Bespoke Property Albums'}</span>
                          <input 
                            type="file" 
                            multiple
                            accept="image/*"
                            onChange={(e) => handlePropertyDirectUpload(e, 'gallery')}
                            className="block w-full text-xs text-slate-550 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#B45309]/10 file:text-[#B45309] hover:file:bg-[#B45309]/20"
                          />
                          {propertyGalleryImageIds.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pt-2 border-t border-slate-200">
                              {propertyGalleryImageIds.map((imgId, idx) => (
                                <div key={`${imgId}-${idx}`} className="relative group border border-slate-200 rounded-lg overflow-hidden h-16 bg-white flex items-center justify-center">
                                  <img src={resolveMediaBase64(imgId) || ''} referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain" />
                                  <button
                                    type="button"
                                    onClick={() => setProjectGalleryImageIds_toUse_as_prop_instead(prev => prev.filter(x => x !== imgId))}
                                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-800 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] cursor-pointer border-0 shadow"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="w-full text-xs text-slate-400 bg-slate-100 p-4 rounded-xl border border-slate-150 text-center">
                              {language === 'ar' ? 'لم يتم تحميل أي صور إضافية بعد العقار' : 'No folder media loaded yet for this asset.'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ====== TAB 5: HIGHLIGHTS ====== */}
                  {activePropertyEditorSubtab === 'highlights' && (
                    <div className="space-y-6">
                      <h5 className="font-sans font-bold text-xs text-[#B45309] border-b border-slate-100 pb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
                        {language === 'ar' ? 'مزايا ونقاط العقار الفريدة المفصلية' : 'Premium Highlights and selling advantages'}
                      </h5>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        {language === 'ar' 
                          ? 'أضف سمات مميزة تظهر كبطاقات فاخرة في أعلى صفحة العقار (مثل: إطلالة بحرية، على شارعين، قريب من المترو، تكييف مركزي متكامل).'
                          : 'Add key selling assets displayed as glossy top luxury badges (e.g. Near Metro, Sea Views, Penthouse Terrace).'}
                      </p>
                      
                      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-650 font-bold block">{language === 'ar' ? 'الميزة بالعربية' : 'Highlight Label (Arabic)'}</label>
                          <input 
                            type="text"
                            value={tempHighlightAr}
                            onChange={(e) => setTempHighlightAr(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:border-slate-400 text-[#1A202C]"
                            placeholder="مثال: قريب جداً من المترو"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right" dir="ltr">
                          <label className="text-slate-650 font-bold block text-left font-sans">{language === 'ar' ? 'Highlight Label (English)' : 'Highlight Label (English)'}</label>
                          <input 
                            type="text"
                            value={tempHighlightEn}
                            onChange={(e) => setTempHighlightEn(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:border-slate-400 text-[#1A202C]"
                            placeholder="e.g. 5 Mins Walking to Metro"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (!tempHighlightAr || !tempHighlightEn) {
                                triggerNotice(language === 'ar' ? 'تأكد من ملء الميزة باللغتين' : 'Provide highlight text in both languages');
                                return;
                              }
                              setPropertyHighlights(prev => [...prev, { ar: tempHighlightAr, en: tempHighlightEn }]);
                              setTempHighlightAr('');
                              setTempHighlightEn('');
                            }}
                            className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs p-3 rounded-xl cursor-pointer w-full text-center border-0"
                          >
                            + {language === 'ar' ? 'إضافة الميزة الخاصة' : 'Append Highlight Card'}
                          </button>
                        </div>
                      </div>

                      {propertyHighlights.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-4 select-none">
                          {propertyHighlights.map((hl, index) => (
                            <div key={index} className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-xl flex items-center justify-between text-right">
                              <div>
                                <span className="block text-sm font-extrabold text-slate-800">{hl.ar}</span>
                                <span className="block text-[10px] text-slate-400 font-mono italic">{hl.en}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setPropertyHighlights(prev => prev.filter((_, i) => i !== index))}
                                className="p-1 text-red-650 hover:bg-red-50 rounded cursor-pointer border-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-400 bg-slate-50 border border-dashed rounded-xl font-sans text-xs">
                          {language === 'ar' ? 'لا يوجد ميزات ونقاط بارزة مخصصة حتى الآن' : 'No custom luxury highlights catalogued.'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ====== TAB 6: AMENITIES & PERKS ====== */}
                  {activePropertyEditorSubtab === 'amenities' && (
                    <div className="space-y-6">
                      <h5 className="font-sans font-bold text-xs text-[#B45309] border-b border-slate-100 pb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
                        {language === 'ar' ? 'خدمات وتجهيزات العقار الأساسية والإضافية' : 'Comprehensive structural luxuries and services'}
                      </h5>
                      <span className="text-xs text-slate-400 block mb-3 font-bold">{language === 'ar' ? 'تجهيزات هيكلية فورية' : 'Pre-configured elements'}</span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { state: propAmenityParking, setter: setPropAmenityParking, labelAr: 'موقف سيارات', labelEn: 'Parking Slot' },
                          { state: propAmenityCoveredParking, setter: setPropAmenityCoveredParking, labelAr: 'موقف مغطى خاص', labelEn: 'Private Garage' },
                          { state: propAmenityPool, setter: setPropAmenityPool, labelAr: 'مسبح مشترك', labelEn: 'Public Pool' },
                          { state: propAmenityPrivatePool, setter: setPropAmenityPrivatePool, labelAr: 'مسبح خاص فاخر', labelEn: 'Infinity Private Pool' },
                          { state: propAmenityGym, setter: setPropAmenityGym, labelAr: 'صالة رياضية فتنس', labelEn: 'State-of-art Gym' },
                          { state: propAmenityElevator, setter: setPropAmenityElevator, labelAr: 'مصاعد ذكية', labelEn: 'Elevators' },
                          { state: propAmenitySecurity, setter: setPropAmenitySecurity, labelAr: 'حراسة وأمن ٢٤ ساعة', labelEn: 'CCTV Security Guard' },
                          { state: propAmenityMosque, setter: setPropAmenityMosque, labelAr: 'مسجد قريب جداً', labelEn: 'Mosque Vicinity' },
                          { state: propAmenityChildrenArea, setter: setPropAmenityChildrenArea, labelAr: 'منطقة ألعاب أطفال', labelEn: 'Kids Play Zone' },
                          { state: propAmenityGarden, setter: setPropAmenityGarden, labelAr: 'حدائق خاصة ومساحة خضراء', labelEn: 'Private Landscaped Garden' },
                          { state: propAmenityMaidRoom, setter: setPropAmenityMaidRoom, labelAr: 'غرفة عاملة منزلية مستقلة', labelEn: "Maid's Quarters" },
                          { state: propAmenityDriverRoom, setter: setPropAmenityDriverRoom, labelAr: 'غرفة سائق خاصة', labelEn: "Driver's Room" },
                          { state: propAmenitySmartHome, setter: setPropAmenitySmartHome, labelAr: 'أنظمة تحكم ذكية بالكامل Smart', labelEn: 'Smart Home Automation' },
                        ].map((item, idx) => (
                          <label key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between select-none cursor-pointer hover:bg-slate-100 transition-colors">
                            <span className="text-slate-800 font-bold text-xs">{language === 'ar' ? item.labelAr : item.labelEn}</span>
                            <input 
                              type="checkbox"
                              checked={item.state}
                              onChange={(e) => item.setter(e.target.checked)}
                              className="w-4 h-4 rounded text-slate-900 cursor-pointer"
                            />
                          </label>
                        ))}
                      </div>

                      {/* Custom dynamic list */}
                      <span className="text-xs text-slate-800 block mt-6 mb-2 font-black border-t pt-4 border-slate-100">
                        {language === 'ar' ? 'المزيد من الخدمات ومواصفات الرفاهية المخصصة (مع أيقونات ديناميكية)' : 'Bespoke custom amenities & unique features (with dynamic icons)'}
                      </span>
                      
                      <div className="bg-slate-50 p-5 rounded-2xl space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5 text-xs text-right">
                            <label className="text-slate-600 block font-bold">{language === 'ar' ? 'اسم الخدمة المخصصة بالعربية' : 'Custom Amenity Name (Arabic)'}</label>
                            <input 
                              type="text"
                              value={tempPropAmenityAr}
                              onChange={(e) => setTempPropAmenityAr(e.target.value)}
                              className="w-full bg-white border border-slate-200 p-3 rounded-xl text-[#1A202C] focus:outline-hidden focus:border-[#B45309]"
                              placeholder="مثال: واجهة زجاجية عازلة مزدوجة"
                            />
                          </div>
                          <div className="space-y-1.5 text-xs text-right" dir="ltr">
                            <label className="text-slate-600 block text-left font-sans font-bold">{language === 'ar' ? 'Custom Amenity Name (English)' : 'Custom Amenity Name (English)'}</label>
                            <input 
                              type="text"
                              value={tempPropAmenityEn}
                              onChange={(e) => setTempPropAmenityEn(e.target.value)}
                              className="w-full bg-white border border-slate-200 p-3 rounded-xl text-[#1A202C] focus:outline-hidden"
                              placeholder="e.g. Double-glazed thermal windows"
                            />
                          </div>
                        </div>

                        {/* Icon Selection Grid */}
                        <div className="space-y-2">
                          <label className="text-slate-600 text-xs block font-bold text-right">
                            {language === 'ar' ? 'اختر وتعيين الأيقونة المناسبة لتمييز هذه الخدمة:' : 'Select and map the representative icon for this feature:'}
                          </label>
                          <div className="grid grid-cols-5 sm:grid-cols-9 md:grid-cols-10 gap-2 border border-slate-200 bg-white p-3 rounded-xl max-h-48 overflow-y-auto">
                            {SELECTABLE_AMENITY_ICONS.map((item) => {
                              const IconElement = item.icon;
                              const isSelected = tempPropAmenityIcon === item.name;
                              return (
                                <button
                                  key={item.name}
                                  type="button"
                                  onClick={() => setTempPropAmenityIcon(item.name)}
                                  className={`p-2.5 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                    isSelected 
                                      ? 'bg-amber-50 border-[#B45309] text-[#B45309] shadow-xs' 
                                      : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-500'
                                  }`}
                                  title={language === 'ar' ? item.iconNameAr : item.iconNameEn}
                                >
                                  <IconElement className="w-4 h-4" />
                                  <span className="text-[8px] opacity-70 truncate max-w-full font-mono">{item.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!tempPropAmenityAr || !tempPropAmenityEn) {
                                triggerNotice(language === 'ar' ? 'الرجاء كتابة اسم الخدمة باللغتين' : 'Provide names in both languages');
                                return;
                              }
                              setPropCustomAmenities(prev => [...prev, { ar: tempPropAmenityAr, en: tempPropAmenityEn, icon: tempPropAmenityIcon }]);
                              setTempPropAmenityAr('');
                              setTempPropAmenityEn('');
                              setTempPropAmenityIcon('sparkles');
                            }}
                            className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-6 py-3 text-xs rounded-xl cursor-pointer shadow-sm transition-all border-0 flex items-center gap-1.5"
                          >
                            <span>+</span>
                            <span>{language === 'ar' ? 'تثبيت الخدمة الترفيهية المخصصة' : 'Append Bespoke Custom Amenity'}</span>
                          </button>
                        </div>
                      </div>

                      {propCustomAmenities.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-400 font-bold block text-right">
                            {language === 'ar' ? 'الخدمات المضافة حالياً وجاهزة للحفظ:' : 'Currently appended features ready to save:'}
                          </span>
                          <div className="flex flex-wrap gap-2.5">
                            {propCustomAmenities.map((amen, idx) => {
                              const IconElement = getAdminAmenityIcon(amen.icon);
                              return (
                                <span key={idx} className="bg-amber-55/60 border border-amber-200/50 text-slate-800 px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all hover:bg-amber-100/50">
                                  <IconElement className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>{language === 'ar' ? amen.ar : amen.en}</span>
                                  <button 
                                    type="button"
                                    onClick={() => setPropCustomAmenities(prev => prev.filter((_, i) => i !== idx))}
                                    className="w-4 h-4 bg-amber-200 hover:bg-amber-300 rounded-full flex items-center justify-center text-[10px] text-amber-900 border-0 cursor-pointer transition-all"
                                  >
                                    ×
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ====== TAB 7: FLOOR PLANS ====== */}
                  {activePropertyEditorSubtab === 'floor_plans' && (
                    <div className="space-y-6">
                      <h5 className="font-sans font-bold text-xs text-[#B45309] border-b border-slate-100 pb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
                        {language === 'ar' ? 'مخططات الطوابق والهندسة المعمارية (Floor Plans)' : 'Bespoke structural plans & architecture layout'}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Primary floor plan */}
                        <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50 space-y-3">
                          <span className="block text-xs font-bold text-slate-700">{language === 'ar' ? 'المخطط الهندسي الكروكي الرئيسي' : 'Primary Structural Layout'}</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handlePropertyDirectUpload(e, 'floorplan')}
                            className="block w-full text-xs text-slate-550 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#B45309]/10 file:text-[#B45309] hover:file:bg-[#B45309]/20"
                          />
                          {propertyFloorPlanImageId ? (
                            <div className="relative w-full h-40 rounded-xl overflow-hidden border bg-white flex items-center justify-center">
                              <img src={resolveMediaBase64(propertyFloorPlanImageId) || ''} referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain" />
                              <button 
                                type="button"
                                onClick={() => setPropertyFloorPlanImageId('')}
                                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full cursor-pointer shadow-sm border-0 flex items-center justify-center"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-full text-xs text-slate-400 bg-slate-100 p-4 rounded-xl border border-dashed text-center">
                              {language === 'ar' ? 'لم يتم رفع مخطط كروكي رئيسي بعد' : 'No primary architecture chart uploaded.'}
                            </div>
                          )}
                        </div>

                        {/* Multiple floor plans package */}
                        <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50 space-y-3">
                          <span className="block text-xs font-bold text-slate-700">{language === 'ar' ? 'ألبوم مخططات طوابق إضافية للفئات الفاخرة' : 'Bespoke Floorplans Package'}</span>
                          <input 
                            type="file" 
                            multiple
                            accept="image/*"
                            onChange={(e) => handlePropertyDirectUpload(e, 'floorplans_gallery')}
                            className="block w-full text-xs text-slate-550 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#B45309]/10 file:text-[#B45309] hover:file:bg-[#B45309]/20"
                          />
                          {propertyFloorPlanMediaIds.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pt-2 border-t border-slate-200">
                              {propertyFloorPlanMediaIds.map((itemMediaId, idx) => (
                                <div key={idx} className="relative group border rounded-lg h-16 bg-white overflow-hidden flex items-center justify-center">
                                  <img src={resolveMediaBase64(itemMediaId) || ''} referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain" />
                                  <button
                                    type="button"
                                    onClick={() => setPropertyFloorPlanMediaIds(prev => prev.filter(x => x !== itemMediaId))}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer border-0 shadow"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="w-full text-xs text-slate-400 bg-slate-100 p-4 rounded-xl border border-dashed text-center">
                              {language === 'ar' ? 'لا يوجد ملفات مخططات طوابق متعددة' : 'No floorplans package attached yet.'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ====== TAB 8: DOCUMENTS ====== */}
                  {activePropertyEditorSubtab === 'documents' && (
                    <div className="space-y-6">
                      <h5 className="font-sans font-bold text-xs text-[#B45309] border-b border-slate-100 pb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
                        {language === 'ar' ? 'وثائق ومستندات تنزيل وتحميل مستقلة' : 'Bespoke contracts & download documentation bundles'}
                      </h5>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-2xl mb-4">
                        {language === 'ar' 
                          ? 'ارفع الملفات بصيغة PDF أو مستندات بروشور الشقة، صكوك ملكية، جداول أسعار، لتقدم للمشترين المعتمدين خيار التنزيل المباشر.'
                          : 'Provide verified title deeds, pricing sheets, premium marketing booklets, or engineering charts directly.'}
                      </p>

                      <div className="border border-slate-200 p-6 rounded-2xl bg-slate-50 space-y-4">
                        <span className="block text-xs font-black text-slate-800">{language === 'ar' ? 'تحميل وثائق ملفات عقار جديدة (PDF, DOCS, IMAGES)' : 'Upload Verified Documents Package'}</span>
                        <input 
                          type="file" 
                          multiple
                          onChange={(e) => handlePropertyDirectUpload(e, 'documents')}
                          className="block w-full text-xs text-slate-550 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#B45309]/10 file:text-[#B45309] hover:file:bg-[#B45309]/20"
                        />
                        {propertyDocumentMediaIds.length > 0 ? (
                          <div className="space-y-2 pt-4 border-t border-slate-200">
                            {propertyDocumentMediaIds.map((itemMediaId, idx) => {
                              const foundRef = mediaItems.find(m => m.id === itemMediaId);
                              const fileName = foundRef ? foundRef.name : `DOC-${itemMediaId.substring(0, 5)}`;
                              return (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-150 rounded-xl">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-red-600 shrink-0" />
                                    <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]" title={fileName}>{fileName}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setPropertyDocumentMediaIds(prev => prev.filter(x => x !== itemMediaId))}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer border-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="w-full text-xs text-slate-400 bg-slate-100 p-6 rounded-xl border border-dashed text-center">
                            {language === 'ar' ? 'لم يتم إدراج أي بروشورات أو ملفات مستندات مخصصة' : 'No premium document leaflets bundled yet.'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ====== TAB 9: VIDEO & TOURS ====== */}
                  {activePropertyEditorSubtab === 'video' && (
                    <div className="space-y-6">
                      <h5 className="font-sans font-bold text-xs text-[#B45309] border-b border-slate-100 pb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
                        {language === 'ar' ? 'الفيديو والجولة الافتراضية واللقطات ثلاثية الأبعاد 360' : 'Digital walkthrough, VR goggles and 360 virtual tours'}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50 space-y-3">
                          <span className="block text-xs font-bold text-slate-700">{language === 'ar' ? 'فيديو العقار المستضاف محلياً' : 'Locally Hosted Drone MP4'}</span>
                          <input 
                            type="file" 
                            accept="video/*"
                            onChange={(e) => handlePropertyDirectUpload(e, 'video')}
                            className="block w-full text-xs text-slate-550 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#B45309]/10 file:text-[#B45309] hover:file:bg-[#B45309]/20"
                          />
                          {propertyVideoUploadId ? (
                            <div className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-150 flex items-center justify-between">
                              <span>{language === 'ar' ? 'تم اختيار ورفع فيديو العقار' : 'Video asset uploaded & linked'}</span>
                              <button 
                                type="button"
                                onClick={() => setPropertyVideoUploadId('')}
                                className="text-red-500 hover:text-red-700 font-bold border-0 cursor-pointer bg-transparent"
                              >
                                {language === 'ar' ? 'إزالة' : 'Remove'}
                              </button>
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-400 font-sans italic">{language === 'ar' ? 'لم يتم تحميل أي فيديو MP4' : 'No direct MP4 uploaded.'}</p>
                          )}
                        </div>

                        <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50 space-y-3 flex flex-col justify-between">
                          <span className="block text-xs font-bold text-slate-700">{language === 'ar' ? 'فيديو يوتيوب أو فيميو للمشروع السكني' : 'YouTube/Vimeo Project Promo URL'}</span>
                          <input 
                            type="text" 
                            value={propertyProjectVideoUrl}
                            onChange={(e) => setPropertyProjectVideoUrl(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:border-slate-400 font-sans text-xs text-[#1A202C]"
                            placeholder="e.g. https://www.youtube.com/watch?v=XXXXX"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-550 font-bold block">{language === 'ar' ? 'رابط الجولة الافتراضية (Virtual Tour Link)' : 'Matterport / Digital Virtual Tour Link'}</label>
                          <input 
                            type="text" 
                            value={propertyVirtualTourUrl}
                            onChange={(e) => setPropertyVirtualTourUrl(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white text-[#1A202C]"
                            placeholder="e.g. https://my.matterport.com/show/?m=XXXXXXXXX"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-550 font-bold block">{language === 'ar' ? 'رابط المسح الجيروسكوبي ٣٦٠ درجة' : '360 Panoramic Goggles Link'}</label>
                          <input 
                            type="text" 
                            value={propertyTour360Url}
                            onChange={(e) => setPropertyTour360Url(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white text-[#1A202C]"
                            placeholder="e.g. https://momento360.com/e/XXXXXXX"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ====== TAB 10: NEARBY PLACES ====== */}
                  {activePropertyEditorSubtab === 'nearby' && (
                    <div className="space-y-6">
                      <h5 className="font-sans font-bold text-xs text-[#B45309] border-b border-slate-100 pb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
                        {language === 'ar' ? 'المرافق والخدمات المجاورة لحرم العقار' : 'Nearby amenities, transport links & services'}
                      </h5>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        {language === 'ar' 
                          ? 'أدرج المدارس، المستشفيات، المولات، المساجد، المطارات للتوضيح للمشترين قرب العقار عن المرافق الحيوية في المدينة بالدقائق أو الكيلومترات.'
                          : 'Catalogue nearby high-profile districts, colleges, shopping hubs, airport coordinates, or parks with details.'}
                      </p>

                      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-650 font-bold block">{language === 'ar' ? 'المرفق بالعربية' : 'Place Name (Arabic)'}</label>
                          <input 
                            type="text"
                            value={tempNearbyPlaceNameAr}
                            onChange={(e) => setTempNearbyPlaceNameAr(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-[#1A202C]"
                            placeholder="مثال: مطار الملك خالد الدولي"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right" dir="ltr">
                          <label className="text-slate-650 block text-left font-sans font-bold">{language === 'ar' ? 'Place Name (English)' : 'Place Name (English)'}</label>
                          <input 
                            type="text"
                            value={tempNearbyPlaceNameEn}
                            onChange={(e) => setTempNearbyPlaceNameEn(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-[#1A202C]"
                            placeholder="e.g. King Khalid Int Airport"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-650 font-bold block">{language === 'ar' ? 'نوع التصنيف والمرفق' : 'Facility Category'}</label>
                          <select
                            value={tempNearbyPlaceType}
                            onChange={(e) => setTempNearbyPlaceType(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-[#1A202C] font-sans"
                          >
                            <option value="school">{language === 'ar' ? '🎓 مدرسة / مجمع تعليمي' : '🎓 School/College'}</option>
                            <option value="hospital">{language === 'ar' ? '🏥 مستشفى / رعاية صحية' : '🏥 Hospital/Clinic'}</option>
                            <option value="mosque">{language === 'ar' ? '🕌 مسجد جامع' : '🕌 Mosque'}</option>
                            <option value="mall">{language === 'ar' ? '������️ مركز تسوق أو مول' : '🛍️ Shopping Mall'}</option>
                            <option value="restaurant">{language === 'ar' ? '🍽️ مطاعم ومقاهي فاخرة' : '🍽️ Cafe / Restaurant'}</option>
                            <option value="park">{language === 'ar' ? '🌳 منتزه وحديقة عامة' : '🌳 Recreation / Park'}</option>
                            <option value="transport">{language === 'ar' ? '🚇 محطة قطار أو مترو' : '🚇 Metro / Train'}</option>
                          </select>
                        </div>
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-655 font-bold block">{language === 'ar' ? 'المسافة أو البعد البيني' : 'Distance or Duration'}</label>
                          <input 
                            type="text"
                            value={tempNearbyPlaceDistance}
                            onChange={(e) => setTempNearbyPlaceDistance(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-[#1A202C]"
                            placeholder="مثال: 12 كم أو 10 دقائق بالسيارة"
                          />
                        </div>
                        <div className="md:col-span-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (!tempNearbyPlaceNameAr || !tempNearbyPlaceNameEn || !tempNearbyPlaceDistance) {
                                triggerNotice(language === 'ar' ? 'الرجاء تعبئة بيانات المرفق لإدراجه' : 'Please specify places name and distance metric.');
                                return;
                              }
                              setPropertyNearbyPlaces(prev => [...prev, {
                                name: { ar: tempNearbyPlaceNameAr, en: tempNearbyPlaceNameEn },
                                type: tempNearbyPlaceType,
                                distance: tempNearbyPlaceDistance
                              }]);
                              setTempNearbyPlaceNameAr('');
                              setTempNearbyPlaceNameEn('');
                              setTempNearbyPlaceDistance('');
                            }}
                            className="bg-[#0F172A] hover:bg-slate-800 text-white font-sans text-xs font-bold px-6 py-3 rounded-xl border-0 cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{language === 'ar' ? 'تثبيت وحفظ المرفق المجاور' : 'Append Nearby Place Record'}</span>
                          </button>
                        </div>
                      </div>

                      {propertyNearbyPlaces.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                          {propertyNearbyPlaces.map((place, idx) => (
                            <div key={idx} className="p-3 bg-white border border-slate-150 rounded-2xl flex items-center justify-between text-right shadow-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">
                                  {place.type === 'school' ? '🎓' :
                                   place.type === 'hospital' ? '🏥' :
                                   place.type === 'mosque' ? '🕌' :
                                   place.type === 'mall' ? '🛍️' :
                                   place.type === 'restaurant' ? '🍽️' :
                                   place.type === 'park' ? '🌳' : '🚇'}
                                </span>
                                <div>
                                  <span className="block text-xs font-black text-slate-800">{language === 'ar' ? place.name.ar : place.name.en}</span>
                                  <span className="block text-[10px] text-amber-700 font-bold bg-amber-50 rounded px-1.5 mt-0.5 inline-block">{place.distance}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setPropertyNearbyPlaces(prev => prev.filter((_, i) => i !== idx))}
                                className="p-1.5 text-red-650 hover:bg-red-50 rounded-lg cursor-pointer border-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-400 bg-slate-50 border border-dashed rounded-xl font-sans text-xs">
                          {language === 'ar' ? 'لا يوجد قائمة مرافق حيوية مسجلة' : 'No neighborhood transport maps listed.'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ====== TAB 11: SEO META ====== */}
                  {activePropertyEditorSubtab === 'seo' && (
                    <div className="space-y-6">
                      <h5 className="font-sans font-bold text-xs text-[#B45309] border-b border-slate-100 pb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
                        {language === 'ar' ? 'تهيئة محرّكات البحث ومكتشفات الويب (SEO Meta)' : 'Search engine indexing, Sitemap and schema options'}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-550 font-bold block">{language === 'ar' ? 'عنوان سيو المخصص للمتصفح (عربي)' : 'SEO Browser Title (Arabic)'}</label>
                          <input 
                            type="text" 
                            value={propertySeoTitleAr}
                            onChange={(e) => setPropertySeoTitleAr(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white text-[#1A202C]"
                            placeholder="مثال: فلل أوركيد الفاخرة للبيع بالرياض"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right" dir="ltr">
                          <label className="text-slate-550 font-bold block text-left font-sans">{language === 'ar' ? 'SEO Browser Title (English)' : 'SEO Browser Title (English)'}</label>
                          <input 
                            type="text" 
                            value={propertySeoTitleEn}
                            onChange={(e) => setPropertySeoTitleEn(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white text-[#1A202C]"
                            placeholder="e.g. Luxury Villas for Sale in Orchid Riyadh | Elite Real Estate"
                          />
                        </div>

                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-550 font-bold block">{language === 'ar' ? 'مقتطف وصف سيو (عربي)' : 'SEO Meta Description (Arabic)'}</label>
                          <textarea 
                            rows={3}
                            value={propertySeoDescAr}
                            onChange={(e) => setPropertySeoDescAr(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white text-[#1A202C]"
                            placeholder="مثال: استكشف شقة أوركيد كلاس المفروشة بالرياض مع كروكي ومخطط الطابق مباشرة..."
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right" dir="ltr">
                          <label className="text-slate-550 font-bold block text-left font-sans">{language === 'ar' ? 'SEO Meta Description (English)' : 'SEO Meta Description (English)'}</label>
                          <textarea 
                            rows={3}
                            value={propertySeoDescEn}
                            onChange={(e) => setPropertySeoDescEn(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white text-[#1A202C]"
                            placeholder="e.g. Discover premium residential unit listing with floor plans, Matterport 3D digital simulation, and secure direct developers call..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-550 font-bold block">{language === 'ar' ? 'الكلمات المفتاحية المكتوبة (مفصولة بفاصلة)' : 'SEO Keywords List (Comma-separated)'}</label>
                          <input 
                            type="text" 
                            value={propertySeoKeywords}
                            onChange={(e) => setPropertySeoKeywords(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white text-[#1A202C]"
                            placeholder="e.g. عقارات الرياض, شقة للبيع, orchid penthouse, luxury saudi real estate"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-550 font-bold block">{language === 'ar' ? 'الرابط الكنسي الأساسي الشامل (Canonical URL)' : 'Canonical URL (Avoid duplicates)'}</label>
                          <input 
                            type="text" 
                            value={propertyCanonicalUrl}
                            onChange={(e) => setPropertyCanonicalUrl(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white text-[#1A202C]"
                            placeholder="e.g. https://yoursite.com/property/orchid-sky-penthouse"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-550 font-bold block">{language === 'ar' ? 'معرف الصورة لفيسبوك (OpenGraph Image ID)' : 'OpenGraph Meta Image ID'}</label>
                          <select
                            value={propertyOpenGraphImageId}
                            onChange={(e) => setPropertyOpenGraphImageId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white text-[#1A202C]"
                          >
                            <option value="">{language === 'ar' ? '-- استخدم صورة الغلاف الافتراضية --' : '-- Use Default Cover Image --'}</option>
                            {propertyCoverImageId && <option value={propertyCoverImageId}>{language === 'ar' ? 'صورة الغلاف الرسمية المرفوعة' : 'Uploaded Cover Page Snapshot'}</option>}
                            {propertyGalleryImageIds.map((item, idX) => (
                              <option key={idX} value={item}>{language === 'ar' ? `صورة المعرض الفرعية #${idX + 1}` : `Gallery Picture #${idX + 1}`}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ====== TAB 12: INQUIRY SETTINGS ====== */}
                  {activePropertyEditorSubtab === 'inquiry' && (
                    <div className="space-y-6">
                      <h5 className="font-sans font-bold text-xs text-[#B45309] border-b border-slate-100 pb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
                        {language === 'ar' ? 'إعدادات استقبال الاتصال وتوجيه الرسائل المخصصة' : 'Interactive Inquiry channels override'}
                      </h5>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        {language === 'ar' 
                          ? 'يمكنك هنا تخصيص قنوات هاتف واتساب مخصصة لهذا العقار بعينه بدلاً من رقم الهاتف العام لشركة الوساطة.'
                          : 'Configure specific agent email, WhatsApp numbers, or customized prefilled template messages for this unit.'}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-655 font-bold block">{language === 'ar' ? 'رقم هاتف الاتصال/واتساب الحصري للعقار (رقم دولي كامل)' : 'WhatsApp Override Mobile (Country-code first)'}</label>
                          <input 
                            type="text" 
                            value={propertyInquiryMobile}
                            onChange={(e) => setPropertyInquiryMobile(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white text-[#1A202C]"
                            placeholder="e.g. +966500000000"
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-right">
                          <label className="text-slate-655 font-bold block">{language === 'ar' ? 'بريد وكيل العقار المستلم' : 'Agent Inbox Override'}</label>
                          <input 
                            type="email" 
                            value={propertyInquiryEmail}
                            onChange={(e) => setPropertyInquiryEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white text-[#1A202C]"
                            placeholder="e.g. sales-agent@luxuryfirm.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-right font-sans">
                        <label className="text-slate-655 font-bold block">{language === 'ar' ? 'نص ترويجي ترحيبي يظهر تلقائياً عندما ينقر المشتري على واتس اب' : 'Interactive automatic prefilled message layout (WhatsApp text template)'}</label>
                        <textarea 
                          rows={3}
                          value={propertyInquiryMessageDefault}
                          onChange={(e) => setPropertyInquiryMessageDefault(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white text-[#1A202C]"
                          placeholder="e.g. السلام عليكم ورحمة الله، أنا مهتم بحجز ومعاينة العقار الفاخر: {اسم العقار}"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-00 pb-0 shadow-none">
                  <button
                    type="button"
                    onClick={resetPropertyForm}
                    className="px-6 py-3 rounded-xl text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  >
                    {language === 'ar' ? 'إلغاء التعديل والتراجع' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer border-0"
                    style={{ backgroundColor: theme.primary || '#0F172A' }}
                  >
                    {language === 'ar' ? 'حفظ وتثبيت كافة بيانات العقار والمرفقات' : 'Save Property'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs text-[#1A202C]">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide border-b border-slate-100 font-bold">
                      <tr>
                        <th className="p-4 font-bold">{language === 'ar' ? 'العقار والغلاف' : 'Property & Cover'}</th>
                        <th className="p-4 font-bold">{language === 'ar' ? 'نوع العقار' : 'Property Type'}</th>
                        <th className="p-4 font-bold">{language === 'ar' ? 'المشروع التابع له' : 'Parent Project'}</th>
                        <th className="p-4 font-bold">{language === 'ar' ? 'القيمة والمبلغ' : 'Price'}</th>
                        <th className="p-4 font-bold">{language === 'ar' ? 'المواصفات الكلية' : 'Specs'}</th>
                        <th className="p-4 font-bold">{language === 'ar' ? 'حالة التوفر' : 'Availability'}</th>
                        <th className="p-4 font-bold text-center">{language === 'ar' ? 'خيارات الإدارة' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-705 text-slate-700">
                      {properties.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-16 text-center text-slate-400 font-medium">
                            {language === 'ar' ? 'لا توجد أصول عقارية مدرجة حالياً. يمكنك إنشاء عقارات جديدة.' : 'No property records found. Create some.'}
                          </td>
                        </tr>
                      ) : (
                        properties.map((prop) => {
                          const projectOfProp = projects.find(p => p.id === prop.projectId);
                          const coverBase64 = resolveMediaBase64(prop.featuredImageId);
                          return (
                            <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded border overflow-hidden shrink-0 bg-slate-50">
                                    {coverBase64 ? (
                                      <img src={coverBase64} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold uppercase text-[9px]">لا توجد صورة</div>
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-sans font-extrabold text-[#0D0E12] block mb-0.5">{t(prop.title)}</span>
                                    {prop.unitNumber && (
                                      <span className="text-[10px] text-[#B45309] font-bold block">#{prop.unitNumber}</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-slate-650">
                                <span className="bg-slate-150 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                  {t(prop.type)}
                                </span>
                              </td>
                              <td className="p-4 text-slate-750">
                                {projectOfProp ? t(projectOfProp.name) : <span className="text-slate-300">-</span>}
                              </td>
                              <td className="p-4 text-emerald-650 text-emerald-700 font-mono font-bold">
                                {prop.price.toLocaleString()} {prop.currency || 'SAR'}
                                {prop.saleOrRent === 'rent' && (
                                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                                    {language === 'ar' ? 'سنوي' : 'yearly'}
                                  </span>
                                )}
                              </td>
                              <td className="p-4 font-sans text-slate-500 text-[11px] font-semibold" dir="ltr">
                                {prop.bedrooms || 0} Bed | {prop.bathrooms || 0} Bath | {prop.areaSqm || 0} m²
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border ${
                                  prop.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 font-bold' :
                                  prop.status === 'reserved' ? 'bg-amber-50 text-[#B45309] border-amber-100 font-bold' :
                                  prop.status === 'sold' ? 'bg-[#FFF1F2] text-[#E11D48] border-[#FFE4E6] font-bold' :
                                  'bg-blue-50 text-blue-600 border-blue-100 font-bold'
                                }`}>
                                  {prop.status}
                                </span>
                                {prop.featured && (
                                  <span className="block mt-1 text-[8px] bg-indigo-50 text-indigo-600 font-black px-1 py-0.5 rounded text-center border border-indigo-100 max-w-[60px]">
                                    {language === 'ar' ? 'مميز' : 'Featured'}
                                  </span>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2 justify-center items-center">
                                  <button 
                                    type="button"
                                    onClick={() => handleEditPropertyClick(prop)}
                                    className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-650 hover:text-slate-950 cursor-pointer transition-colors"
                                    title={language === 'ar' ? 'تعديل العقار' : 'Edit'}
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => handleDeleteProperty(prop.id)}
                                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center text-red-650 hover:text-red-905 cursor-pointer transition-colors"
                                    title={language === 'ar' ? 'حذف العقار' : 'Delete'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div id="admin-tab-inquiries-body" className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-6">
              <h3 className="font-sans font-bold text-lg text-slate-200 mb-2">معالجة طلبات الملاك والعملاء المستكشفين</h3>
              <p className="text-slate-450 text-xs leading-relaxed">
                مستودع طلبات التواصل متصل بشكل استباقي ومباشر بـ `InquiryRepository`. يمكنك إدارة حالة الطلب (من حالة "جديد" إلى "تم الاتصال" أو "محلول") أو حذف السجلات في بيئة العرض المؤقت للتجربة.
              </p>
            </div>

            {inquiries.length === 0 ? (
              <div className="text-center py-20 text-slate-500 font-medium">لا توجد طلبات ملاك جارية حتى الآن.</div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="p-6 rounded bg-slate-950 border border-slate-800 flex flex-col md:flex-row justify-between text-right gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-white font-extrabold text-base">{inq.fullName}</span>
                        <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">{inq.phone}</span>
                        <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">{inq.email}</span>
                      </div>
                      <p className="text-slate-350 text-xs leading-relaxed bg-slate-900 p-4 rounded border border-slate-800/60 font-medium">{inq.message}</p>
                    </div>

                    <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-4">
                      {/* State badge indicator */}
                      <span className={`px-3 py-1 rounded text-[10px] uppercase font-bold border ${
                        inq.status === 'new' ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' :
                        inq.status === 'contacted' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                        'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {language === 'ar' ? (
                          inq.status === 'new' ? 'طلب جديد' :
                          inq.status === 'contacted' ? 'تم التواصل' : 'مغلق ومحسوم'
                        ) : (
                          inq.status === 'new' ? 'New Lead' :
                          inq.status === 'contacted' ? 'Contacted' : 'Closed'
                        )}
                      </span>

                      {/* State controllers */}
                      <div className="flex gap-2">
                        {inq.status !== 'contacted' && (
                          <button 
                            type="button"
                            onClick={() => handleInquiryStatusChange(inq.id, 'contacted')}
                            className="px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-bold cursor-pointer transition-all active:scale-95"
                          >
                            {language === 'ar' ? 'تحديث للاتصال' : 'Mark Contacted'}
                          </button>
                        )}
                        {inq.status !== 'closed' && (
                          <button 
                            type="button"
                            onClick={() => handleInquiryStatusChange(inq.id, 'closed')}
                            className="px-2.5 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold cursor-pointer transition-all active:scale-95"
                          >
                            {language === 'ar' ? 'إنهاء ومغلق' : 'Close Lead'}
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={() => handleInquiryDelete(inq.id)}
                          className="p-1.5 rounded bg-red-950 text-red-00 hover:bg-red-900 text-red-400 hover:text-white cursor-pointer transition-all active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pages' && (
          <div id="admin-tab-pages-body" className="space-y-6 text-right">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-sans font-bold text-lg text-slate-800 mb-1">إدارة الصفحات الثابتة والمحتوى اللغوي العربي والإنجليزي (CMS Web Pages)</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  أنشئ عدداً غير محدود من الصفحات والمقالات الفرعية بترميز بليغ ومستوى هرمي متدرج. تُدرج المنشورات تلقائياً في شريط التصفح عند تفعيل خيار النشر.
                </p>
              </div>
              {!isEditingPage && (
                <button
                  type="button"
                  onClick={() => { resetPageForm(); setIsEditingPage(true); }}
                  className="px-5 py-2.5 rounded-xl font-sans text-xs font-bold text-white shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  style={{ backgroundColor: theme.secondary || '#B45309' }}
                >
                  <span>+ إضافة صفحة جديدة</span>
                </button>
              )}
            </div>

            {isEditingPage ? (
              <form onSubmit={handleSavePage} className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <button
                    type="button"
                    onClick={resetPageForm}
                    className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    {language === 'ar' ? 'إلغاء وتراجع' : 'Cancel'}
                  </button>
                  <h4 className="font-sans font-black text-lg text-[#0F172A]">
                    {currentPageId ? (language === 'ar' ? 'تعديل الصفحة واستمرارية البيانات' : 'Edit Page') : (language === 'ar' ? 'إنشاء صفحة مخصصة جديدة' : 'Create Custom Page')}
                  </h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-right">
                  {/* Arabic Input Fields Card */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4">
                    <h5 className="font-bold text-sm text-slate-700 border-b border-slate-200 pb-2">المحتوى والعناوين باللغة العربية</h5>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">العنوان العربي <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={pageTitleAr} 
                        onChange={e => setPageTitleAr(e.target.value)} 
                        className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-emerald-500 text-right bg-white text-slate-800" 
                        placeholder="مثال: الخدمات المساندة" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">الرابط العربي (Slug العربي) <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={pageSlugAr} 
                        onChange={e => setPageSlugAr(e.target.value)} 
                        className="w-full p-3 rounded-lg border border-slate-300 text-sm text-right bg-white font-mono text-slate-800" 
                        placeholder="services-ar" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">محتوى الصفحة بالتفصيل (بالعربية) <span className="text-red-500">*</span></label>
                      <textarea 
                        rows={6} 
                        value={pageContentAr} 
                        onChange={e => setPageContentAr(e.target.value)} 
                        className="w-full p-3 rounded-lg border border-slate-300 text-sm text-right bg-white leading-relaxed text-slate-800" 
                        placeholder="اكتب هنا محتوى وتفاصيل الصفحة الكاملة..." 
                      />
                    </div>
                    <div className="pt-4 border-t border-slate-200 space-y-3">
                      <h6 className="font-bold text-xs text-slate-600">إعدادات سيو الأرشفة (SEO Arabic Meta)</h6>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">عنوان SEO بالعربية </label>
                        <input 
                          type="text" 
                          value={pageSeoTitleAr} 
                          onChange={e => setPageSeoTitleAr(e.target.value)} 
                          className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-right bg-white text-slate-800" 
                          placeholder="مثال: الخدمات العقارية الفاخرة - بناء وإدارة" 
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">وصف SEO بالعربية</label>
                        <textarea 
                          rows={2} 
                          value={pageSeoDescAr} 
                          onChange={e => setPageSeoDescAr(e.target.value)} 
                          className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-right bg-white text-slate-800" 
                          placeholder="اكتب وصفاً لمحركات البحث يصف محتوى هذه الصفحة لزيادة التقييم..." 
                        />
                      </div>
                    </div>
                  </div>

                  {/* English Input Fields Card */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4 text-left font-sans" dir="ltr">
                    <h5 className="font-bold text-sm text-slate-700 border-b border-slate-200 pb-2">English Content & Headings</h5>
                    <div>
                      <label className="text-xs font-bold text-slate-505 text-slate-500 block mb-1">English Title <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={pageTitleEn} 
                        onChange={e => setPageTitleEn(e.target.value)} 
                        className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-emerald-500 text-left bg-white text-slate-800" 
                        placeholder="e.g. Supporting Services" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-505 text-slate-500 block mb-1">English Slug <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={pageSlugEn} 
                        onChange={e => setPageSlugEn(e.target.value)} 
                        className="w-full p-3 rounded-lg border border-slate-300 text-sm text-left bg-white font-mono text-slate-800" 
                        placeholder="services" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-505 text-slate-500 block mb-1">Page Content (English) <span className="text-red-500">*</span></label>
                      <textarea 
                        rows={6} 
                        value={pageContentEn} 
                        onChange={e => setPageContentEn(e.target.value)} 
                        className="w-full p-3 rounded-lg border border-slate-300 text-sm text-left bg-white leading-relaxed text-slate-800" 
                        placeholder="Type page content details in English..." 
                      />
                    </div>
                    <div className="pt-4 border-t border-slate-200 space-y-3">
                      <h6 className="font-bold text-xs text-slate-650 text-slate-600">SEO Meta Settings (SEO English)</h6>
                      <div>
                        <label className="text-[11px] font-bold text-slate-505 text-slate-500 block mb-1">SEO Title English</label>
                        <input 
                          type="text" 
                          value={pageSeoTitleEn} 
                          onChange={e => setPageSeoTitleEn(e.target.value)} 
                          className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-left bg-white text-slate-800" 
                          placeholder="e.g. Supporting Services - BINA & EDARAH" 
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-505 text-slate-500 block mb-1">SEO Description English</label>
                        <textarea 
                          rows={2} 
                          value={pageSeoDescEn} 
                          onChange={e => setPageSeoDescEn(e.target.value)} 
                          className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-left bg-white text-slate-800" 
                          placeholder="Meta description for search engine ranking..." 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1.5">المستوى الهرمي والتبعية (Parent Page Hierarchy)</label>
                    <select 
                      value={pageParentId} 
                      onChange={e => setPageParentId(e.target.value)} 
                      className="w-full p-3 rounded-lg border border-slate-300 text-sm bg-white cursor-pointer text-slate-800"
                    >
                      <option value="">لا يوجد - صفحة من المستوى الرئيسي الأول (None - Root Page)</option>
                      {pages.filter(p => p.id !== currentPageId).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title.ar} | {p.title.en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1.5">حالة النشر ومستوى العرض (Status)</label>
                    <div className="flex gap-6 pt-3">
                      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer font-semibold">
                        <input 
                          type="radio" 
                          name="page_status_radio"
                          checked={pageStatus === 'draft'} 
                          onChange={() => setPageStatus('draft')} 
                          className="w-4.5 h-4.5 accent-emerald-600" 
                        />
                        <span>مسودة مغلقة (Draft)</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer font-semibold">
                        <input 
                          type="radio" 
                          name="page_status_radio"
                          checked={pageStatus === 'published'} 
                          onChange={() => setPageStatus('published')} 
                          className="w-4.5 h-4.5 accent-emerald-600" 
                        />
                        <span>منشور عام (Published)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit" 
                    className="px-8 py-3.5 rounded-xl text-xs font-bold font-sans text-white bg-slate-900 hover:bg-black transition-transform duration-200 active:scale-95 shadow-md"
                  >
                    {language === 'ar' ? 'حفظ ونشر الصفحة فورياً' : 'Save & Publish Page'}
                  </button>
                  <button 
                    type="button" 
                    onClick={resetPageForm}
                    className="px-6 py-3.5 rounded-xl text-xs font-bold font-sans text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {language === 'ar' ? 'إلغاء وتراجع' : 'Cancel'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-right">
                <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-500">
                  {language === 'ar' ? 'قائمة الصفحات المسجلة حالياً' : 'Registered Static/Dynamic Pages'}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-[#1A202C]">
                    <thead className="bg-[#FAFBFD] text-[#64748B] font-bold border-b border-slate-100 text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="p-4 text-right font-bold">{language === 'ar' ? 'اسم الصفحة بالعربية' : 'Page Title (AR)'}</th>
                        <th className="p-4 text-right font-bold">{language === 'ar' ? 'اسم الصفحة بالإنجليزية' : 'Page Title (EN)'}</th>
                        <th className="p-4 text-right font-bold font-mono">English Slug</th>
                        <th className="p-4 text-right font-bold">{language === 'ar' ? 'التبعية الهرمية ' : 'Parent Page'}</th>
                        <th className="p-4 text-right font-bold">{language === 'ar' ? 'حالة النشر' : 'Status'}</th>
                        <th className="p-4 text-center font-bold">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pages.map((page) => {
                        const parent = pages.find(p => p.id === page.parentId);
                        return (
                          <tr key={page.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-900 text-sm">{page.title.ar}</td>
                            <td className="p-4 text-slate-600 font-medium text-sm">{page.title.en}</td>
                            <td className="p-4 font-mono text-slate-500 font-bold">{page.slugEn || page.slug}</td>
                            <td className="p-4 text-slate-500 font-semibold direct-rtl">
                              {parent ? (
                                <span className="px-2 py-1 rounded bg-[#F1F5F9] text-slate-600 border border-slate-200/50 font-bold">
                                  {language === 'ar' ? parent.title.ar : parent.title.en}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-normal">
                                  {language === 'ar' ? 'صفحة رئيسية' : 'Root'}
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                !page.status || page.status === 'published' 
                                  ? 'bg-emerald-55 bg-emerald-50 text-emerald-600 border border-emerald-150' 
                                  : 'bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5]'
                              }`}>
                                {!page.status || page.status === 'published' 
                                  ? (language === 'ar' ? 'منشورة' : 'Published') 
                                  : (language === 'ar' ? 'مسودة مغلقة' : 'Draft')}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditPageClick(page)}
                                  className="px-3 py-1.5 rounded-md bg-[#EEF2F6] hover:bg-[#E2E8F0] text-slate-700 font-bold hover:text-slate-950 transition-all cursor-pointer"
                                >
                                  {language === 'ar' ? 'تعديل' : 'Edit'}
                                </button>
                                {/* Do not allow deleting root core pages for absolute site safety */}
                                {page.id !== 'page_home' && page.id !== 'page_about' && page.id !== 'page_contact' && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePage(page.id)}
                                    className="p-1.5 rounded-md bg-red-50 hover:bg-red-500 text-red-500 hover:text-white transition-all cursor-pointer"
                                    title={language === 'ar' ? 'حذف الصفحة' : 'Delete Page'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}


        {activeTab === 'media' && (
          <div id="admin-tab-media-body" className="space-y-6">
            <div className="bg-slate-950 border border-slate-805 rounded-lg p-6 space-y-4">
              <h3 className="font-sans font-bold text-lg text-slate-200">مستودع الصور والمرفقات المباشرة (Base64 Database Library)</h3>
              <p className="text-slate-450 text-xs leading-relaxed">
                بموجب التعاميم البرمجية: **يُمنع استخدام روابط صور خارجية ومجهولة المصدر**. 
                يتوجب رفع الهياكل الرسومية والصور العقارية من خلال هذا المرفع الإداري حصرياً. تقوم المنصة بتخزينها ديناميكياً بصيغة Base64 مشفرة في قواعد البيانات المحلية لتتوافق مع الرفع الخادم المباشر ومخرجات الـ Blobs مستقبلاً.
              </p>
              {renderUploadProgressPanel()}

              {/* Upload Drop Zone */}
              <div 
                className={`border-2 border-dashed rounded-lg p-10 text-center transition-all ${
                  dragOver ? 'border-(--color-secondary) bg-slate-900' : 'border-slate-700 bg-slate-900/50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const files = e.dataTransfer.files;
                  if (files && files.length > 0) processAndSaveFile(files[0]);
                }}
              >
                <div className="space-y-3">
                  <Upload className="w-10 h-10 mx-auto text-slate-500" />
                  <div className="text-sm font-semibold">اسحب وألقِ المخطط المعماري أو الصورة هنا، أو قم بـ</div>
                  <label className="p-2 inline-block rounded bg-slate-800 border border-slate-700 cursor-pointer text-xs font-bold text-white hover:bg-slate-700 transition-colors">
                    <span>تصفح ملفات جهازك</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>
                  <p className="text-[10px] text-slate-500">الملفات المدعومة: PNG, JPG, WEBP. سيتم حفظها في مستودع MediaRepository</p>
                </div>
              </div>
            </div>

            {/* Media Items Catalog */}
            {mediaItems.length === 0 ? (
              <div className="text-center py-10 bg-slate-950 rounded border border-slate-800 text-slate-500 text-xs">
                لا توجد صور مرفوعة بقاعدة البيانات المحلية للوسائط حالياً.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {mediaItems.map(item => (
                  <div key={item.id} className="bg-slate-950 rounded border border-slate-800 overflow-hidden group relative flex flex-col justify-between">
                    <div className="h-32 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                      <img 
                        src={item.base64Data} 
                        alt={item.name} 
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" 
                        referrerPolicy="no-referrer"
                      />
                      <button 
                        onClick={() => handleMediaDelete(item.id)}
                        className="absolute top-2 left-2 p-1.5 rounded-full bg-red-950/80 text-red-500 hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="حذف الملف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-3 bg-slate-900 text-[10px] space-y-1 text-right border-t border-slate-800">
                      <span className="block text-white font-semibold truncate" title={item.name}>{item.name}</span>
                      <span className="block text-slate-500 font-mono select-all font-bold">{item.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div id="admin-tab-settings-body" className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-6">
              <h3 className="font-sans font-bold text-lg text-slate-200 mb-2">إدارة لوحة التحكم وسّمات الهوية المؤسساتية (Theme Manager)</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                هيكل الهوية العقارية للشركة يتضمن تخصيص ثلاثة ألوان رئيسية. عند النقر على "حفظ الهوية وتعديل الألوان"، يتم تحديث معلمات النظام وقراءتها في الوقت الفعلي في كامل أقسام المنصة ومكوناتها.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-slate-950 border border-slate-800 rounded-2xl p-8 space-y-8 text-right text-slate-200">
              
              {/* Category 1: General & Identity Branding */}
              <div className="space-y-6">
                <h4 className="font-sans font-black text-sm text-(--color-secondary) border-b border-slate-800 pb-3 block" style={{ color: theme.secondary }}>
                  📌 القسم الأول: الهوية الإدارية والمرفقات البصرية (General & Branding)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">اسم الموقع / عنوان الشركة (بالعربية)</label>
                    <input 
                      type="text" 
                      value={websiteNameArDraft}
                      onChange={(e) => setWebsiteNameArDraft(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-3 text-white focus:outline-none focus:border-slate-500 font-sans"
                      placeholder="مثال: بناء وإدارة للتطوير العقاري"
                    />
                  </div>
                  
                  <div className="space-y-1.5 font-sans">
                    <label className="text-slate-400 font-bold block">Website / Company Name (English)</label>
                    <input 
                      type="text" 
                      value={websiteNameEnDraft}
                      onChange={(e) => setWebsiteNameEnDraft(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-3 text-white focus:outline-none focus:border-slate-500 text-left font-sans"
                      placeholder="e.g. BINA & EDARAH Real Estate"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
                  {/* Logo Base64 Upload component */}
                  <div className="p-5 bg-slate-900/40 rounded-xl border border-slate-800 space-y-4 font-sans">
                    <span className="text-xs font-bold text-slate-300 block">تحميل شعار الشركة المعتمد (Company Logo)</span>
                    <div className="flex items-center gap-4 text-xs font-medium">
                      {logoBase64Draft ? (
                        <div className="w-16 h-16 rounded bg-slate-900 border border-slate-750 p-1 flex items-center justify-center overflow-hidden shrink-0">
                          <img src={logoBase64Draft} alt="Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded bg-slate-900 border border-dashed border-slate-700 shrink-0 flex items-center justify-center text-slate-500 text-[10px]">
                          لا يوجد
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="px-3.5 py-2 inline-block rounded bg-slate-800 border border-slate-700 cursor-pointer text-xs font-bold text-white hover:bg-slate-700 transition-colors">
                          <span>اختر ملف الشعار</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleLogoUpload} 
                            className="hidden" 
                          />
                        </label>
                        <p className="text-[10px] text-slate-500 font-sans font-medium">مرفق الشعار يُثبت فورياً في الهيدر والفوتر والصفحات</p>
                      </div>
                    </div>
                  </div>

                  {/* Favicon Base64 Upload component */}
                  <div className="p-5 bg-slate-900/40 rounded-xl border border-slate-800 space-y-4 font-sans">
                    <span className="text-xs font-bold text-slate-300 block">تحميل الأيقونة المصغرة للتبويب (Favicon Upload)</span>
                    <div className="flex items-center gap-4 text-xs font-medium">
                      {faviconBase64Draft ? (
                        <div className="w-12 h-12 rounded bg-slate-900 border border-slate-755 p-1 flex items-center justify-center overflow-hidden shrink-0">
                          <img src={faviconBase64Draft} alt="Favicon" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded bg-slate-900 border border-dashed border-slate-700 shrink-0 flex items-center justify-center text-slate-500 text-[10px]">
                          لا يوجد
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="px-3.5 py-2 inline-block rounded bg-slate-800 border border-slate-700 cursor-pointer text-xs font-bold text-white hover:bg-slate-700 transition-colors">
                          <span>اختر ملف الأيقونة</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFaviconUpload} 
                            className="hidden" 
                          />
                        </label>
                        <p className="text-[10px] text-slate-500 font-sans font-medium">صورة favicon بترميز Base64 لتحديث هوية عميل الويب</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category 2: Contact Coordinates Info */}
              <div className="space-y-4 pt-6 border-t border-slate-800">
                <h4 className="font-sans font-black text-sm text-(--color-secondary) border-b border-slate-800 pb-3 block" style={{ color: theme.secondary }}>
                  📞 القسم الثاني: قنوات وبيانات الاتصال والجمهور (Contact Coordinates)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">البريد الإلكتروني للشركة</label>
                    <input 
                      type="email" 
                      value={emailDraft}
                      onChange={(e) => setEmailDraft(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded p-3 text-white focus:outline-none focus:border-slate-655"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">رقم الهاتف الموحد</label>
                    <input 
                      type="text" 
                      value={phoneDraft}
                      onChange={(e) => setPhoneDraft(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded p-3 text-white focus:outline-none focus:border-slate-655 font-mono text-left"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">رقم الواتساب الموثق (WhatsApp Contact)</label>
                    <input 
                      type="text" 
                      value={whatsappDraft}
                      onChange={(e) => setWhatsappDraft(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded p-3 text-white focus:outline-none focus:border-slate-655 font-mono text-left"
                      placeholder="+96655555555"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-3 font-sans">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">موقع ومكتب الإدارة بالعربية</label>
                    <textarea 
                      rows={2}
                      value={addressArDraft}
                      onChange={(e) => setAddressArDraft(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded p-3 text-white focus:outline-none"
                      placeholder="برج الفيصلية، الرياض، المملكة العربية السعودية"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Headquarters Address (English)</label>
                    <textarea 
                      rows={2}
                      value={addressEnDraft}
                      onChange={(e) => setAddressEnDraft(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-855 rounded p-3 text-white focus:outline-none text-left font-sans"
                      dir="ltr"
                      placeholder="Al Faisaliah Tower, Riyadh, Kingdom of Saudi Arabia"
                    />
                  </div>
                </div>
              </div>

              {/* Category 3: Social Media Links */}
              <div className="space-y-4 pt-6 border-t border-slate-800">
                <h4 className="font-sans font-black text-sm text-(--color-secondary) border-b border-slate-800 pb-3 block" style={{ color: theme.secondary }}>
                  🌐 القسم الثالث: روابط منصات التواصل الاجتماعي (Social Media Integration)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs font-sans">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">منصة X (تويتر سابقاً)</label>
                    <input 
                      type="text" 
                      value={socialXDraft}
                      onChange={(e) => setSocialXDraft(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded p-3 text-white focus:outline-none focus:border-slate-650 text-left font-semibold"
                      placeholder="https://x.com/username"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">إنستغرام (Instagram)</label>
                    <input 
                      type="text" 
                      value={socialInstagramDraft}
                      onChange={(e) => setSocialInstagramDraft(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded p-3 text-white focus:outline-none focus:border-slate-650 text-left font-semibold"
                      placeholder="https://instagram.com/username"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">لينكدإن (LinkedIn)</label>
                    <input 
                      type="text" 
                      value={socialLinkedInDraft}
                      onChange={(e) => setSocialLinkedInDraft(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded p-3 text-white focus:outline-none focus:border-slate-650 text-left font-semibold"
                      placeholder="https://linkedin.com/company/bina-edarah"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">تيك توك (TikTok)</label>
                    <input 
                      type="text" 
                      value={socialTikTokDraft}
                      onChange={(e) => setSocialTikTokDraft(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded p-3 text-white focus:outline-none focus:border-slate-650 text-left font-semibold"
                      placeholder="https://tiktok.com/@username"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">سناب شات (Snapchat)</label>
                    <input 
                      type="text" 
                      value={socialSnapchatDraft}
                      onChange={(e) => setSocialSnapchatDraft(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded p-3 text-white focus:outline-none focus:border-slate-650 text-left font-semibold"
                      placeholder="https://snapchat.com/add/username"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Category 4: Dynamic Theme Color Overrides */}
              <div className="space-y-4 pt-6 border-t border-slate-800">
                <h4 className="font-sans font-black text-sm text-(--color-secondary) border-b border-slate-800 pb-3 block" style={{ color: theme.secondary }}>
                  🎨 القسم الرابع: علامة اللون وإكساء الفخامة الهندسية (Instant Theme Engine)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">اللون الأساسي المتدرج (Primary Color)</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={primaryColorDraft}
                        onChange={(e) => setPrimaryColorDraft(e.target.value)}
                        className="w-10 h-10 border border-slate-700 bg-transparent rounded cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={primaryColorDraft}
                        onChange={(e) => setPrimaryColorDraft(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-xs font-mono text-center text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-455 text-slate-400 block">اللون الثانوي التميزي (Secondary Color)</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={secondaryColorDraft}
                        onChange={(e) => setSecondaryColorDraft(e.target.value)}
                        className="w-10 h-10 border border-slate-700 bg-transparent rounded cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={secondaryColorDraft}
                        onChange={(e) => setSecondaryColorDraft(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-xs font-mono text-center text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-455 text-slate-400 block">لون اللمسات الفرعية (Accent Color)</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={accentColorDraft}
                        onChange={(e) => setAccentColorDraft(e.target.value)}
                        className="w-10 h-10 border border-slate-700 bg-transparent rounded cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={accentColorDraft}
                        onChange={(e) => setAccentColorDraft(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-xs font-mono text-center text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Category 5: Dynamic Hero Slider Customizer */}
              <div className="space-y-6 pt-6 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
                  <h4 className="font-sans font-black text-sm text-(--color-secondary) block" style={{ color: theme.secondary }}>
                    👑 القسم الخامس: شرائح المعرض البصري البارز (Hero Slider Creator)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddSlideItem}
                    className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة شريحة جديدة / Add Slide</span>
                  </button>
                </div>
                
                <p className="text-slate-400 text-xs leading-relaxed">
                  يمكنك رفع صور مخصصة لكل شريحة وتحديد نصوص العناوين والروابط في الهوم بيج بنسقين عربي/إنجليزي متكامل.
                </p>

                {heroSlidesDraft.length === 0 ? (
                  <div className="text-center py-10 rounded-xl border border-dashed border-slate-800 p-6 bg-slate-900/10 text-slate-500 text-xs font-medium">
                    لا يوجد أي شرائح مخصصة حالياً. سيتم عرض الشرائح الافتراضية للفخامة العقارية.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {heroSlidesDraft.map((slide, sIdx) => (
                      <div key={slide.id} className="p-5 rounded-xl border border-slate-800 bg-[#0c1322] space-y-4 text-right">
                        <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                          <span className="text-xs font-black text-(--color-secondary)" style={{ color: theme.secondary }}>
                            {language === 'ar' ? `الشريحة المعروضة #${sIdx + 1}` : `Display Slide #${sIdx + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => setHeroSlidesDraft(prev => prev.filter(s => s.id !== slide.id))}
                            className="px-2.5 py-1 rounded bg-rose-950/50 hover:bg-rose-900 text-rose-450 border border-rose-900/30 text-xs font-bold transition-all cursor-pointer hover:text-white"
                          >
                            حذف الشريحة / Delete
                          </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-sans">
                          {/* Image upload column */}
                          <div className="space-y-2">
                            <label className="text-slate-400 font-bold block">صورة الشريحة (Slide Image Upload)</label>
                            <div className="border border-dashed border-slate-800 rounded-lg p-4 bg-slate-900/30 flex flex-col items-center justify-center gap-3">
                              {slide.base64Data ? (
                                <img src={slide.base64Data} alt="Slide Preview" className="h-32 w-full object-cover rounded border border-slate-700/50" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="h-32 w-full bg-slate-950 flex items-center justify-center text-slate-500 rounded text-[11px] font-bold">
                                  لا توجد صورة مرفقة / No Image Uploaded
                                </div>
                              )}
                              <label className="px-3 py-1.5 inline-block rounded bg-slate-800 border border-slate-700 text-white cursor-pointer text-xs font-bold hover:bg-slate-705 transition-colors">
                                <span>رفع صورة الشريحة</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleAddHeroSlideImageUpload(e, sIdx)}
                                />
                              </label>
                            </div>
                          </div>

                          {/* Data column */}
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-slate-400 font-bold block">العنوان (عربي)</label>
                                <input
                                  type="text"
                                  value={slide.title.ar}
                                  onChange={(e) => {
                                    const updated = [...heroSlidesDraft];
                                    updated[sIdx].title.ar = e.target.value;
                                    setHeroSlidesDraft(updated);
                                  }}
                                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-slate-400 font-bold block">Title (English)</label>
                                <input
                                  type="text"
                                  value={slide.title.en}
                                  onChange={(e) => {
                                    const updated = [...heroSlidesDraft];
                                    updated[sIdx].title.en = e.target.value;
                                    setHeroSlidesDraft(updated);
                                  }}
                                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white"
                                  dir="ltr"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-slate-400 font-bold block">الوصف الفرعي (عربي)</label>
                                <input
                                  type="text"
                                  value={slide.subtitle.ar}
                                  onChange={(e) => {
                                    const updated = [...heroSlidesDraft];
                                    updated[sIdx].subtitle.ar = e.target.value;
                                    setHeroSlidesDraft(updated);
                                  }}
                                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-slate-400 font-bold block">Subtitle (English)</label>
                                <input
                                  type="text"
                                  value={slide.subtitle.en}
                                  onChange={(e) => {
                                    const updated = [...heroSlidesDraft];
                                    updated[sIdx].subtitle.en = e.target.value;
                                    setHeroSlidesDraft(updated);
                                  }}
                                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white"
                                  dir="ltr"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-slate-400 font-bold block">نص زر الإجراء (عربي)</label>
                                <input
                                  type="text"
                                  value={slide.ctaText?.ar || ''}
                                  onChange={(e) => {
                                    const updated = [...heroSlidesDraft];
                                    if (!updated[sIdx].ctaText) updated[sIdx].ctaText = { ar: '', en: '' };
                                    updated[sIdx].ctaText!.ar = e.target.value;
                                    setHeroSlidesDraft(updated);
                                  }}
                                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white"
                                  placeholder="تصفح الآن"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-slate-400 font-bold block">CTA Button Text (English)</label>
                                <input
                                  type="text"
                                  value={slide.ctaText?.en || ''}
                                  onChange={(e) => {
                                    const updated = [...heroSlidesDraft];
                                    if (!updated[sIdx].ctaText) updated[sIdx].ctaText = { ar: '', en: '' };
                                    updated[sIdx].ctaText!.en = e.target.value;
                                    setHeroSlidesDraft(updated);
                                  }}
                                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                                  placeholder="Learn More"
                                  dir="ltr"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-slate-400 font-bold block">صفحة التوجيه عند النقر (CTA Redirect Option)</label>
                              <select
                                value={slide.ctaPage || 'properties'}
                                onChange={(e) => {
                                  const updated = [...heroSlidesDraft];
                                  updated[sIdx].ctaPage = e.target.value;
                                  setHeroSlidesDraft(updated);
                                }}
                                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white"
                              >
                                <option value="properties">صفحة العقارات (Properties Showcase)</option>
                                <option value="projects">صفحة المشاريع الكبرى (Projects Portfolio)</option>
                                <option value="contact">صفحة تقديم استفسار مباشر (Contact & Inquire)</option>
                                <option value="about">صفحة تاريخ الشركة من نحن (Corporate Story)</option>
                              </select>
                            </div>

                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-800 font-sans">
                <button 
                  type="submit"
                  className="px-10 py-4 rounded-xl font-sans text-xs font-black uppercase tracking-wider text-black transition-transform duration-250 active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                  style={{
                    background: `linear-gradient(135deg, ${theme.secondary || '#B45309'}, #FFECA1)`
                  }}
                >
                  <Sliders className="w-4 h-4 rotate-90" />
                  <span>تطبيق إعدادات الهوية الشاملة وتحديث الموقع فورياً</span>
                </button>
              </div>

            </form>

            {/* SEO & Dynamic Sitemap XML Card */}
            <div id="admin-seo-sitemap-card" className="bg-slate-950 border border-slate-800 rounded-2xl p-8 space-y-4 text-right text-slate-200">
              <h4 className="font-sans font-black text-sm border-b border-slate-800 pb-3 block" style={{ color: theme.secondary || '#B45309' }}>
                📌 القسم السادس: خريطة الموقع لمحركات البحث (SEO & Dynamic Sitemap XML)
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                يقوم النظام بالتقاط كافة المشاريع والعقارات المسجلة ديناميكياً لتكوين ملف خريطة موقع قياسي (Sitemap.xml) يعكس البنية الحية في الوقت الفعلي لمحركات البحث مثل Google و Bing بما يضمن الأرشفة ونقاط الثقة العقارية.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => {
                    const baseUrl = window.location.origin;
                    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
                    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
                    
                    const paths = ['', 'properties', 'projects', 'about', 'contact'];
                    const nowStr = new Date().toISOString().split('T')[0];
                    
                    paths.forEach(p => {
                      xml += `  <url>\n`;
                      xml += `    <loc>${baseUrl}/${p}</loc>\n`;
                      xml += `    <lastmod>${nowStr}</lastmod>\n`;
                      xml += `    <changefreq>daily</changefreq>\n`;
                      xml += `    <priority>${p === '' ? '1.0' : '0.8'}</priority>\n`;
                      xml += `  </url>\n`;
                    });
                    
                    properties.forEach(p => {
                      xml += `  <url>\n`;
                      xml += `    <loc>${baseUrl}/?property=${p.id}</loc>\n`;
                      xml += `    <lastmod>${nowStr}</lastmod>\n`;
                      xml += `    <changefreq>weekly</changefreq>\n`;
                      xml += `    <priority>0.7</priority>\n`;
                      xml += `  </url>\n`;
                    });

                    projects.forEach(proj => {
                      xml += `  <url>\n`;
                      xml += `    <loc>${baseUrl}/?project=${proj.id}</loc>\n`;
                      xml += `    <lastmod>${nowStr}</lastmod>\n`;
                      xml += `    <changefreq>weekly</changefreq>\n`;
                      xml += `    <priority>0.7</priority>\n`;
                      xml += `  </url>\n`;
                    });
                    
                    xml += `</urlset>`;

                    const blob = new Blob([xml], { type: 'application/xml' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'sitemap.xml';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    triggerNotice(language === 'ar' ? 'تم توليد السايت ماب XML بنجاح!' : 'Dynamic XML Sitemap generated successfully!');
                  }}
                  className="px-6 py-3 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 rounded-lg text-xs font-black tracking-wider text-indigo-200 transition-all cursor-pointer shadow flex items-center gap-2"
                >
                  <span>توليد وتنزيل Sitemap.xml المحدث فورياً</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'page_builder' && (
          <div id="admin-tab-page-builder-body" className="p-1">
            <VisualPageBuilder 
              onExit={(destTab) => setActiveTab(destTab || 'dashboard')}
              onBackToWebsite={onBackToWebsite}
            />
          </div>
        )}

        {activeTab === 'import' && (
          <div id="admin-tab-import-body" className="p-1">
            <ExcelImportEngine 
              language={language} 
              onImportComplete={() => {
                loadAdminData();
                triggerNotice(language === 'ar' ? 'تم استيراد كافة السجلات بنجاح!' : 'All records successfully imported!');
              }} 
            />
          </div>
        )}

      </main>
    </div>
  );
};
