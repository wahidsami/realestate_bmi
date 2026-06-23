import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  MapPin, 
  Database, 
  Play, 
  CheckCircle, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  FileText, 
  Download, 
  Trash2, 
  Table, 
  Building2, 
  Milestone,
  Check,
  Building
} from 'lucide-react';
import { 
  projectRepository, 
  propertyRepository 
} from '../repositories';
import { 
  PLACEHOLDER_PROPERTY_FEATURED_MEDIA_ID,
  PLACEHOLDER_PROPERTY_GALLERY_MEDIA_ID,
  PROPERTY_TYPE_PRESETS,
} from '@bina/shared';
import { 
  Project, 
  Property, 
  BilingualText 
} from '../types';

interface ExcelImportEngineProps {
  language: 'ar' | 'en';
  onImportComplete?: () => void;
}

// target field metadata definition - decoupled schema representation
interface TargetField {
  key: string; // e.g. 'project.name.ar', 'property.price'
  labelAr: string;
  labelEn: string;
  entity: 'project' | 'property';
  required?: boolean;
  type: 'string' | 'number' | 'boolean' | 'enum';
  enumOptions?: string[];
  synonyms: string[]; // for smart automatic mapping
}

// Complete list of target SQL/DB fields, matching types.ts models
const TARGET_FIELDS: TargetField[] = [
  // PROJECT FIELDS
  {
    key: 'project.name.ar',
    labelAr: 'اسم المشروع (العربية)',
    labelEn: 'Project Name (Arabic)',
    entity: 'project',
    required: true,
    type: 'string',
    synonyms: ['اسم المشروع', 'المشروع بالعربي', 'مشروع عربي', 'اسم مشروع عربي', 'اسم المشروع عربي', 'project name ar', 'project name arabic', 'project_name_ar']
  },
  {
    key: 'project.name.en',
    labelAr: 'اسم المشروع (الإنجليزية)',
    labelEn: 'Project Name (English)',
    entity: 'project',
    required: true,
    type: 'string',
    synonyms: ['اسم المشروع بالانجليزي', 'المشروع انجليزي', 'project name', 'project name en', 'project name english', 'project_name_en', 'project']
  },
  {
    key: 'project.description.ar',
    labelAr: 'وصف المشروع (العربية)',
    labelEn: 'Project Description (Arabic)',
    entity: 'project',
    type: 'string',
    synonyms: ['وصف المشروع', 'شرح المشروع', 'تفاصيل المشروع', 'project description ar', 'project desc ar']
  },
  {
    key: 'project.description.en',
    labelAr: 'وصف المشروع (الإنجليزية)',
    labelEn: 'Project Description (English)',
    entity: 'project',
    type: 'string',
    synonyms: ['project description', 'project desc', 'project description en', 'project desc en']
  },
  {
    key: 'project.developer.ar',
    labelAr: 'المطور (العربية)',
    labelEn: 'Developer (Arabic)',
    entity: 'project',
    type: 'string',
    synonyms: ['المطور', 'شركة التطوير', 'developer ar', 'project developer ar', 'developer arabic']
  },
  {
    key: 'project.developer.en',
    labelAr: 'المطور (الإنجليزية)',
    labelEn: 'Developer (English)',
    entity: 'project',
    type: 'string',
    synonyms: ['developer', 'developer en', 'project developer', 'project developer en', 'developer english']
  },
  {
    key: 'project.city.ar',
    labelAr: 'المدينة (العربية)',
    labelEn: 'City (Arabic)',
    entity: 'project',
    type: 'string',
    synonyms: ['المدينة', 'مدينة', 'المدينه', 'city ar', 'city arabic']
  },
  {
    key: 'project.city.en',
    labelAr: 'المدينة (الإنجليزية)',
    labelEn: 'City (English)',
    entity: 'project',
    type: 'string',
    synonyms: ['city', 'city en', 'city english']
  },
  {
    key: 'project.district.ar',
    labelAr: 'الحي (العربية)',
    labelEn: 'District (Arabic)',
    entity: 'project',
    type: 'string',
    synonyms: ['الحي', 'حي', 'المقاطعة', 'district ar', 'district arabic', 'neighborhood ar']
  },
  {
    key: 'project.district.en',
    labelAr: 'الحي (الإنجليزية)',
    labelEn: 'District (English)',
    entity: 'project',
    type: 'string',
    synonyms: ['district', 'district en', 'district english', 'neighborhood', 'suburb', 'area']
  },
  {
    key: 'project.location.ar',
    labelAr: 'الموقع الجغرافي (العربية)',
    labelEn: 'Combined Location (Arabic)',
    entity: 'project',
    type: 'string',
    synonyms: ['الموقع', 'العنوان', 'موقع عربي', 'location ar', 'location arabic']
  },
  {
    key: 'project.location.en',
    labelAr: 'الموقع الجغرافي (الإنجليزية)',
    labelEn: 'Combined Location (English)',
    entity: 'project',
    type: 'string',
    synonyms: ['location', 'address', 'location en', 'location english']
  },
  {
    key: 'project.completionDate',
    labelAr: 'تاريخ اكتمال المشروع',
    labelEn: 'Project Completion Date',
    entity: 'project',
    type: 'string',
    synonyms: ['تاريخ الانتهاء', 'تاريخ التسليم', 'تاريخ الاكتمال', 'تاريخ التدشين', 'completion date', 'completion_date', 'date of completion']
  },
  {
    key: 'project.googleMapsLink',
    labelAr: 'رابط خرائط جوجل للمشروع',
    labelEn: 'Project Google Maps Link',
    entity: 'project',
    type: 'string',
    synonyms: ['google maps', 'google map link', 'google maps link', 'project google maps', 'googlemap', 'map link', 'maps url']
  },
  {
    key: 'project.units',
    labelAr: 'عدد الوحدات',
    labelEn: 'Project Units',
    entity: 'project',
    type: 'number',
    synonyms: ['عدد الوحدات', 'الوحدات', 'units', 'project units', 'unit count', 'project_units']
  },
  {
    key: 'project.status',
    labelAr: 'حالة المشروع',
    labelEn: 'Project Status',
    entity: 'project',
    type: 'enum',
    enumOptions: ['available', 'under-construction', 'sold', 'sold-out'],
    synonyms: ['حالة المشروع', 'وضع المشروع', 'status project', 'project status', 'project_status']
  },
  {
    key: 'project.featured',
    labelAr: 'مشروع مميز (نعم/لا)',
    labelEn: 'Featured Project (Yes/No)',
    entity: 'project',
    type: 'boolean',
    synonyms: ['مميز', 'مشروع مميز', 'مشروع بطل', 'featured project', 'is featured', 'project featured', 'featured_project']
  },

  // PROPERTY FIELDS
  {
    key: 'property.title.ar',
    labelAr: 'عنوان العقار (العربية)',
    labelEn: 'Property Title (Arabic)',
    entity: 'property',
    required: true,
    type: 'string',
    synonyms: ['عنوان العقار', 'اسم العقار', 'وصف الوحدة عربي', 'عنوان الإعلان عربي', 'property title ar', 'property_title_ar', 'title ar', 'property name ar']
  },
  {
    key: 'property.title.en',
    labelAr: 'عنوان العقار (الإنجليزية)',
    labelEn: 'Property Title (English)',
    entity: 'property',
    required: true,
    type: 'string',
    synonyms: ['عنوان العقار بالانجليزي', 'property title', 'property name en', 'property title en', 'property_title_en', 'title', 'title en']
  },
  {
    key: 'property.description.ar',
    labelAr: 'وصف العقار (العربية)',
    labelEn: 'Property Description (Arabic)',
    entity: 'property',
    type: 'string',
    synonyms: ['وصف العقار', 'تفاصيل الوحدة', 'شرح العقار عربي', 'property description ar', 'property desc ar']
  },
  {
    key: 'property.description.en',
    labelAr: 'وصف العقار (الإنجليزية)',
    labelEn: 'Property Description (English)',
    entity: 'property',
    type: 'string',
    synonyms: ['property description', 'property desc', 'unit description', 'property description en', 'property desc en']
  },
  {
    key: 'property.location.ar',
    labelAr: 'الموقع (العربية)',
    labelEn: 'Property Location (Arabic)',
    entity: 'property',
    type: 'string',
    synonyms: ['الموقع', 'العنوان', 'property location ar', 'location ar', 'location arabic']
  },
  {
    key: 'property.location.en',
    labelAr: 'الموقع (الإنجليزية)',
    labelEn: 'Property Location (English)',
    entity: 'property',
    type: 'string',
    synonyms: ['location', 'address', 'property location en', 'location en', 'location english']
  },
  {
    key: 'property.address.ar',
    labelAr: 'العنوان (العربية)',
    labelEn: 'Property Address (Arabic)',
    entity: 'property',
    type: 'string',
    synonyms: ['العنوان التفصيلي', 'address ar', 'property address ar', 'full address ar', 'detailed address ar']
  },
  {
    key: 'property.address.en',
    labelAr: 'العنوان (الإنجليزية)',
    labelEn: 'Property Address (English)',
    entity: 'property',
    type: 'string',
    synonyms: ['address', 'address en', 'property address en', 'full address en', 'detailed address en']
  },
  {
    key: 'property.price',
    labelAr: 'السعر الكلي',
    labelEn: 'Offered Price',
    entity: 'property',
    required: true,
    type: 'number',
    synonyms: ['السعر', 'القيمة السوقية', 'القيمة', 'سعر العقار', 'سعر الكلي', 'سعر', 'price', 'unit price', 'cost', 'amount', 'property_price']
  },
  {
    key: 'property.unitNumber',
    labelAr: 'رقم الوحدة السكنية',
    labelEn: 'Unit Number / Code',
    entity: 'property',
    type: 'string',
    synonyms: ['رقم الوحدة', 'رقم الشقة', 'رقم الفيلا', 'رقم عقار', 'الوحدة', 'رقم وحدة', 'unit number', 'unit no', 'unit_number', 'unit', 'apartment no', 'apartment number']
  },
  {
    key: 'property.type.ar',
    labelAr: 'نوع العقار (العربية)',
    labelEn: 'Property Type (Arabic)',
    entity: 'property',
    required: true,
    type: 'string',
    synonyms: ['نوع العقار', 'النوع', 'تصنيف العقار', 'نوع الوحدة', 'property type ar', 'property_type_ar', 'type ar', 'category ar']
  },
  {
    key: 'property.type.en',
    labelAr: 'نوع العقار (الإنجليزية)',
    labelEn: 'Property Type (English)',
    entity: 'property',
    required: true,
    type: 'string',
    synonyms: ['property type', 'property type en', 'type en', 'property_type_en', 'type', 'category']
  },
  {
    key: 'property.bedrooms',
    labelAr: 'عدد غرف النوم',
    labelEn: 'Bedrooms Count',
    entity: 'property',
    type: 'number',
    synonyms: ['غرف النوم', 'غرف نوم', 'عدد الغرف', 'نوم', 'bedrooms', 'beds', 'bed count', 'bed_count', 'beds_count']
  },
  {
    key: 'property.bathrooms',
    labelAr: 'عدد دورات المياه',
    labelEn: 'Bathrooms Count',
    entity: 'property',
    type: 'number',
    synonyms: ['دورات المياه', 'حمامات', 'عدد دورات المياه', 'الحمامات', 'حمام', 'bathrooms', 'baths', 'bath_count', 'bathrooms_count']
  },
  {
    key: 'property.areaSqm',
    labelAr: 'المساحة الإجمالية بالمتر المربع',
    labelEn: 'Area (Sqm)',
    entity: 'property',
    required: true,
    type: 'number',
    synonyms: ['المساحة', 'مساحة العقار', 'المتر المربع', 'المساحة م٢', 'مساحة بالمتر', 'مساحه', 'area', 'sqm', 'area sqm', 'area_sqm', 'size sqm', 'size_sqm', 'square meters']
  },
  {
    key: 'property.status',
    labelAr: 'حالة العقار المتاح',
    labelEn: 'Property Inventory Status',
    entity: 'property',
    type: 'enum',
    enumOptions: ['available', 'reserved', 'sold', 'rented'],
    synonyms: ['حالة العقار', 'الحالة التشغيلية', 'حالة الوحدة', 'وضع العقار', 'property status', 'status property', 'property_status', 'unit status']
  },
  {
    key: 'property.livingRooms',
    labelAr: 'عدد الصالونات/المجالس',
    labelEn: 'Living Rooms Count',
    entity: 'property',
    type: 'number',
    synonyms: ['مجالس', 'عدد المجالس', 'صالات', 'الصالة', 'عدد الصالات', 'living rooms', 'living_rooms', 'livingrooms']
  },
  {
    key: 'property.balconies',
    labelAr: 'عدد الشرفات/البلكونات',
    labelEn: 'Balconies Count',
    entity: 'property',
    type: 'number',
    synonyms: ['شرفات', 'بلكونات', 'عدد الشرفات', 'شرفة', 'balconies', 'balconies count', 'balcony']
  },
  {
    key: 'property.parkingSpaces',
    labelAr: 'مواقف السيارات المخصصة',
    labelEn: 'Parking Spaces',
    entity: 'property',
    type: 'number',
    synonyms: ['مواقف', 'موقف', 'كراج', 'مواقف سيارات', 'parking', 'parking spaces', 'parking_spaces', 'garage']
  },
  {
    key: 'property.currency',
    labelAr: 'العملة',
    labelEn: 'Currency',
    entity: 'property',
    type: 'string',
    synonyms: ['العملة', 'عملة', 'تفاصيل السعر عملة', 'currency', 'price currency']
  },
  {
    key: 'property.googleMapsLink',
    labelAr: 'رابط خرائط جوجل',
    labelEn: 'Google Maps Link',
    entity: 'property',
    type: 'string',
    synonyms: ['رابط خرائط جوجل', 'رابط الخريطة', 'google maps link', 'google map link', 'maps link', 'google maps', 'location map']
  },
  {
    key: 'property.saleOrRent',
    labelAr: 'نوع العرض (بيع/إيجار)',
    labelEn: 'Deal Type (sale/rent)',
    entity: 'property',
    type: 'enum',
    enumOptions: ['sale', 'rent'],
    synonyms: ['نوع العرض', 'بيع او ايجار', 'غرض العقار', 'sale or rent', 'sale_or_rent', 'deal type', 'offer type']
  },
  {
    key: 'property.featured',
    labelAr: 'عقار مميز (نعم/لا)',
    labelEn: 'Featured Property (Yes/No)',
    entity: 'property',
    type: 'boolean',
    synonyms: ['عقار مميز', 'مميز عقاري', 'ترويج', 'featured property', 'is featured', 'property featured', 'featured_property']
  },
  {
    key: 'property.featuredImageId',
    labelAr: 'معرف صورة الغلاف',
    labelEn: 'Cover Image Media ID',
    entity: 'property',
    type: 'string',
    synonyms: ['معرف صورة الغلاف', 'cover image id', 'featured image id', 'featuredMediaId', 'featured_image_id', 'cover_media_id']
  },
  {
    key: 'property.galleryImageIds',
    labelAr: 'معرفات معرض الصور',
    labelEn: 'Gallery Image Media IDs',
    entity: 'property',
    type: 'string',
    synonyms: ['معرفات الصور', 'gallery image ids', 'galleryImageIds', 'gallery_image_ids', 'image ids', 'gallery media ids']
  },
  {
    key: 'property.videoUploadId',
    labelAr: 'معرف الفيديو',
    labelEn: 'Video Media ID',
    entity: 'property',
    type: 'string',
    synonyms: ['معرف الفيديو', 'video upload id', 'videoUploadId', 'video_media_id', 'video id']
  }
];

const getTemplateExampleValue = (field: TargetField) => {
  switch (field.key) {
    case 'project.name.ar':
      return 'مشروع الموجة الذهبية';
    case 'project.name.en':
      return 'Golden Wave Project';
    case 'project.description.ar':
      return 'وصف مختصر للمشروع';
    case 'project.description.en':
      return 'Short project description';
    case 'project.developer.ar':
      return 'شركة بناء وإدارة';
    case 'project.developer.en':
      return 'Bina & Edarah';
    case 'project.city.ar':
      return 'الرياض';
    case 'project.city.en':
      return 'Riyadh';
    case 'project.district.ar':
      return 'الملقا';
    case 'project.district.en':
      return 'Al Malqa';
    case 'project.location.ar':
      return 'طريق الملك سلمان';
    case 'project.location.en':
      return 'King Salman Road';
    case 'project.completionDate':
      return '2026-12-31';
    case 'project.googleMapsLink':
      return 'https://maps.google.com/?q=24.7136,46.6753';
    case 'project.units':
      return '120';
    case 'project.status':
      return 'available';
    case 'project.featured':
      return 'true';
    case 'property.title.ar':
      return 'فيلا نموذجية';
    case 'property.title.en':
      return 'Sample Villa';
    case 'property.description.ar':
      return 'وصف العقار';
    case 'property.description.en':
      return 'Property description';
    case 'property.location.ar':
      return 'الموقع';
    case 'property.location.en':
      return 'Location';
    case 'property.address.ar':
      return 'العنوان';
    case 'property.address.en':
      return 'Address';
    case 'property.price':
      return '2500000';
    case 'property.unitNumber':
      return 'A-101';
    case 'property.type.ar':
      return 'فيلا';
    case 'property.type.en':
      return 'Villa';
    case 'property.bedrooms':
      return '4';
    case 'property.bathrooms':
      return '3';
    case 'property.areaSqm':
      return '320';
    case 'property.status':
      return 'available';
    case 'property.livingRooms':
      return '2';
    case 'property.balconies':
      return '1';
    case 'property.parkingSpaces':
      return '2';
    case 'property.currency':
      return 'SAR';
    case 'property.googleMapsLink':
      return 'https://maps.google.com/?q=24.7136,46.6753';
    case 'property.saleOrRent':
      return 'sale';
    case 'property.featured':
      return 'true';
    case 'property.featuredImageId':
      return 'placeholder-property-cover';
    case 'property.galleryImageIds':
      return 'placeholder-property-gallery';
    case 'property.videoUploadId':
      return '';
    default:
      return '';
  }
};

const getTemplateHeaderLabel = (field: TargetField) => {
  switch (field.key) {
    case 'project.name.ar':
      return 'Project Name (Arabic)';
    case 'project.name.en':
      return 'Project Name (English)';
    case 'project.description.ar':
      return 'Project Description (Arabic)';
    case 'project.description.en':
      return 'Project Description (English)';
    case 'project.developer.ar':
      return 'Developer (Arabic)';
    case 'project.developer.en':
      return 'Developer (English)';
    case 'project.city.ar':
      return 'City (Arabic)';
    case 'project.city.en':
      return 'City (English)';
    case 'project.district.ar':
      return 'District (Arabic)';
    case 'project.district.en':
      return 'District (English)';
    case 'project.location.ar':
      return 'Location (Arabic)';
    case 'project.location.en':
      return 'Location (English)';
    case 'project.googleMapsLink':
      return 'Project Google Maps Link';
    case 'property.title.ar':
      return 'Property Title (Arabic)';
    case 'property.title.en':
      return 'Property Title (English)';
    case 'property.description.ar':
      return 'Property Description (Arabic)';
    case 'property.description.en':
      return 'Property Description (English)';
    case 'property.location.ar':
      return 'Property Location (Arabic)';
    case 'property.location.en':
      return 'Property Location (English)';
    case 'property.address.ar':
      return 'Property Address (Arabic)';
    case 'property.address.en':
      return 'Property Address (English)';
    case 'property.type.ar':
      return 'Property Type (Arabic)';
    case 'property.type.en':
      return 'Property Type (English)';
    case 'property.featuredImageId':
      return 'Cover Image Media ID';
    case 'property.galleryImageIds':
      return 'Gallery Image Media IDs';
    case 'property.videoUploadId':
      return 'Video Media ID';
    default:
      return field.labelEn;
  }
};

const getTemplateGroupLabel = (field: TargetField, kind: TemplateKind) => {
  if (kind === 'project') return 'PROJECT INFO';
  if (kind === 'property') {
    if (field.key === 'property.featuredImageId' || field.key === 'property.galleryImageIds' || field.key === 'property.videoUploadId') {
      return 'MEDIA';
    }
    return 'PROPERTY INFO';
  }
  if (field.entity === 'project') return 'PROJECT INFO (OPTIONAL)';
  if (field.key === 'property.featuredImageId' || field.key === 'property.galleryImageIds' || field.key === 'property.videoUploadId') {
    return 'MEDIA';
  }
  return 'PROPERTY INFO';
};

type TemplateKind = 'full' | 'property' | 'project';

const getTemplateFields = (kind: TemplateKind) => {
  if (kind === 'project') {
    return TARGET_FIELDS.filter((field) => field.entity === 'project');
  }
  if (kind === 'property') {
    return TARGET_FIELDS.filter((field) => field.entity === 'property');
  }
  return TARGET_FIELDS;
};

const matchesTemplateHeader = (value: string, field: TargetField) => {
  const v = value.trim().toLowerCase();
  const labels = [
    getTemplateHeaderLabel(field),
    field.labelEn,
    field.labelAr,
    field.key,
    ...field.synonyms,
  ].filter(Boolean).map((item) => String(item).trim().toLowerCase());
  return labels.some((label) => v === label || v.includes(label) || label.includes(v));
};

interface MappingResult {
  rowIdx: number;
  warnings: string[];
  errors: string[];
  projectAction: 'create' | 'update' | 'none';
  projectId?: string;
  projectName?: string;
  projectFields?: Partial<Project>;
  propertyAction: 'create' | 'update' | 'none';
  propertyId?: string;
  propertyFields?: Partial<Property>;
}

interface ImportReport {
  createdProjects: Array<{ id: string; name: string }>;
  updatedProjects: Array<{ id: string; name: string }>;
  createdProperties: Array<{ id: string; title: string; unitNumber?: string }>;
  updatedProperties: Array<{ id: string; title: string; unitNumber?: string }>;
  failedRows: Array<{ rowIdx: number; error: string; data: any }>;
}

export function ExcelImportEngine({ language, onImportComplete }: ExcelImportEngineProps) {
  // Navigation Wizard steps
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // SheetJS states
  const [excelSheets, setExcelSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [excelRawRows, setExcelRawRows] = useState<any[][]>([]); // raw grid: row-by-row lists
  
  // Dynamic column mappings: DB target field key -> Selected Excel column name
  const [mappings, setMappings] = useState<Record<string, string>>({});
  
  // Preview items
  const [previewItems, setPreviewItems] = useState<MappingResult[]>([]);
  const [systemProjects, setSystemProjects] = useState<Project[]>([]);
  const [systemProperties, setSystemProperties] = useState<Property[]>([]);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  
  // Import Execution report states
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [report, setReport] = useState<ImportReport | null>(null);

  // Load existing projects & properties to perform matching
  useEffect(() => {
    const loadSystemData = async () => {
      try {
        const projs = await projectRepository.getProjects();
        const props = await propertyRepository.getProperties();
        setSystemProjects(projs);
        setSystemProperties(props);
      } catch (e) {
        console.error("Error loading system lists: ", e);
      }
    };
    loadSystemData();
  }, []);

  const translate = (ar: string, en: string) => {
    return language === 'ar' ? ar : en;
  };

  // Step 1: Parse uploaded Excel file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFile(files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) return;
        const workbook = XLSX.read(data, { type: 'binary' });
        setExcelSheets(workbook.SheetNames);
        
        // Select first sheet by default
        const defaultSheet = workbook.SheetNames[0];
        setSelectedSheet(defaultSheet);
        parseSheet(workbook, defaultSheet);
      } catch (err) {
        console.error("Error reading file: ", err);
        alert(translate("خطأ في قراءة ملف الإكسل. يرجى التحقق من الصيغة.", "Failure reading Excel file. Please double check file formatting."));
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    // Reload parsing for this specific sheet
    // Need to read file again or cached binary string. 
    // Usually easier if we just parse the sheet from the main UI. Let's do a trick or standard SheetJS read.
  };

  const parseSheet = (workbook: XLSX.WorkBook, sheetName: string) => {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) return;

    // Convert to row arrays { header: 1 } to get absolute grid
    const rawGrid = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
    if (rawGrid.length === 0) {
      alert(translate("ملف الإكسل فارغ.", "Excel worksheet is completely empty."));
      return;
    }

    const scanLimit = Math.min(rawGrid.length, 10);
    let headerRowIndex = -1;
    let headerRowScore = -1;

    for (let i = 0; i < scanLimit; i++) {
      const row = rawGrid[i] || [];
      const score = TARGET_FIELDS.reduce((acc, field) => {
        const hasMatch = row.some((cell) => {
          if (cell === undefined || cell === null) return false;
          return matchesTemplateHeader(String(cell), field);
        });
        return acc + (hasMatch ? 1 : 0);
      }, 0);

      if (score > headerRowScore) {
        headerRowScore = score;
        headerRowIndex = i;
      }
    }

    if (headerRowIndex === -1) {
      alert(translate("لم يتم العثور على أسطر صالحة.", "No valid content found in selected worksheet."));
      return;
    }

    const headers = rawGrid[headerRowIndex].map(h => String(h || '').trim()).filter(Boolean);
    const rows = rawGrid.slice(headerRowIndex + 1).filter(row => row && row.some(cell => cell !== undefined && cell !== ''));

    setExcelHeaders(headers);
    setExcelRawRows(rows);
    
    // Auto-detect column mappings for awesome UX
    const initialMappings: Record<string, string> = {};
    TARGET_FIELDS.forEach(field => {
      // Look for a column whose header matches a synonym case-insensitively
      const matchedHeader = headers.find(header => {
        const lowerHeader = header.toLowerCase();
        return field.synonyms.some(synonym => {
          const lowerSynonym = synonym.toLowerCase();
          return lowerHeader === lowerSynonym || 
                 lowerHeader.includes(lowerSynonym) || 
                 lowerSynonym.includes(lowerHeader);
        });
      });
      if (matchedHeader) {
        initialMappings[field.key] = matchedHeader;
      }
    });

    setMappings(initialMappings);
    setStep(2); // advance to mapping
  };

  const clearFile = () => {
    setFileName(null);
    setExcelSheets([]);
    setSelectedSheet('');
    setExcelHeaders([]);
    setExcelRawRows([]);
    setMappings({});
    setPreviewItems([]);
    setReport(null);
    setStep(1);
  };

  // Step 2: Handle column assignments
  const handleMapField = (fieldKey: string, excelCol: string) => {
    setMappings(prev => {
      const updated = { ...prev };
      if (!excelCol) {
        delete updated[fieldKey];
      } else {
        updated[fieldKey] = excelCol;
      }
      return updated;
    });
  };

  const runAutoMatch = () => {
    const initialMappings: Record<string, string> = {};
    TARGET_FIELDS.forEach(field => {
      const matchedHeader = excelHeaders.find(header => {
        const lowerHeader = header.toLowerCase();
        return field.synonyms.some(synonym => 
          lowerHeader === synonym.toLowerCase() || 
          lowerHeader.includes(synonym.toLowerCase())
        );
      });
      if (matchedHeader) {
        initialMappings[field.key] = matchedHeader;
      }
    });
    setMappings(initialMappings);
  };

  const resetMappings = () => {
    setMappings({});
  };

  // Convert raw row array cells based on the currently defined mapping
  const resolveRowFields = (row: any[]): Record<string, any> => {
    const fields: Record<string, any> = {};
    
    const getValue = (fieldKey: string): any => {
      const mappedHeader = mappings[fieldKey];
      if (!mappedHeader) return undefined;
      const colIdx = excelHeaders.indexOf(mappedHeader);
      if (colIdx === -1) return undefined;
      let val = row[colIdx];
      if (val === undefined || val === null) return undefined;
      if (typeof val === 'string') {
        val = val.trim();
        if (val === '') return undefined;
      }
      return val;
    };

    TARGET_FIELDS.forEach(field => {
      const rawVal = getValue(field.key);
      if (rawVal === undefined) return;

      // Handle conversions
      let parsedVal: any = rawVal;
      if (field.type === 'number') {
        const cleanStr = String(rawVal).replace(/[^\d.-]/g, '');
        const num = Number(cleanStr);
        parsedVal = isNaN(num) ? undefined : num;
      } else if (field.type === 'boolean') {
        const str = String(rawVal).toLowerCase();
        parsedVal = (str === 'true' || str === '1' || str === 'yes' || str === 'نعم' || str === 'مفعل' || str === 'صح');
      } else if (field.type === 'enum' && field.enumOptions) {
        const str = String(rawVal).toLowerCase().trim();
        // search matching enum option
        const matchedOpt = field.enumOptions.find(opt => opt.toLowerCase() === str);
        parsedVal = matchedOpt || field.enumOptions[0]; // fallback to first option
      } else if (field.key === 'property.galleryImageIds') {
        const str = String(rawVal).trim();
        parsedVal = str
          .split(/[,;\n|]+/)
          .map((part) => part.trim())
          .filter(Boolean);
      }

      // Store in a nested path / key helper
      fields[field.key] = parsedVal;
    });

    return fields;
  };

  // Step 3: Run dry-run validation preview
  const generatePreview = () => {
    setLoadingPreview(true);
    setStep(3);
    
    setTimeout(() => {
      const results: MappingResult[] = excelRawRows.map((row, index) => {
        const rowIdx = index + 2; // offset for 1-based index + header row
        const mappedData = resolveRowFields(row);
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check Project fields
        let projectAction: 'create' | 'update' | 'none' = 'none';
        let matchedProjectId: string | undefined;
        let projectNameEn = mappedData['project.name.en'];
        let projectNameAr = mappedData['project.name.ar'];

        // If at least one project name is provided, compile project draft
        const hasProjectInput = projectNameAr || projectNameEn;
        let pFields: Partial<Project> = {};

        if (hasProjectInput) {
          // Check if parent project already exists in system, match on English or Arabic name
          const matchProjNameAr = String(projectNameAr || '').toLowerCase();
          const matchProjNameEn = String(projectNameEn || '').toLowerCase();

          const existingProj = systemProjects.find(p => {
            const sysAr = String(p.name?.ar || '').toLowerCase();
            const sysEn = String(p.name?.en || '').toLowerCase();
            return (matchProjNameAr && sysAr === matchProjNameAr) || 
                   (matchProjNameEn && sysEn === matchProjNameEn);
          });

          if (existingProj) {
            projectAction = 'update';
            matchedProjectId = existingProj.id;
          } else {
            projectAction = 'create';
          }

          // Build bilingual text structures safely
          const name: BilingualText = {
            ar: String(projectNameAr || projectNameEn || ''),
            en: String(projectNameEn || projectNameAr || '')
          };

          const description: BilingualText = {
            ar: String(mappedData['project.description.ar'] || ''),
            en: String(mappedData['project.description.en'] || '')
          };

          const developer: BilingualText = {
            ar: String(mappedData['project.developer.ar'] || ''),
            en: String(mappedData['project.developer.en'] || '')
          };

          const city: BilingualText = {
            ar: String(mappedData['project.city.ar'] || ''),
            en: String(mappedData['project.city.en'] || '')
          };

          const district: BilingualText = {
            ar: String(mappedData['project.district.ar'] || ''),
            en: String(mappedData['project.district.en'] || '')
          };

          const location: BilingualText = {
            ar: String(mappedData['project.location.ar'] || mappedData['project.address.ar'] || ''),
            en: String(mappedData['project.location.en'] || mappedData['project.address.en'] || '')
          };

          pFields = {
            name,
            description,
            developer,
            city,
            district,
            location,
            address: location,
            completionDate: String(mappedData['project.completionDate'] || ''),
            googleMapsLink: String(mappedData['project.googleMapsLink'] || ''),
            units: Number(mappedData['project.units'] || 0),
            status: (mappedData['project.status'] as any) || 'available',
            featured: Boolean(mappedData['project.featured']),
            amenityParking: true,
            amenitySecurity: true,
            amenityElevators: true,
            amenityMosque: true,
            amenityGym: true,
            amenityPool: false,
            amenityChildrenArea: true,
            customAmenities: [],
            galleryImageIds: []
          };
        }

        // Check Property fields
        let propertyAction: 'create' | 'update' | 'none' = 'none';
        let matchedPropertyId: string | undefined;
        let propertyTitleAr = mappedData['property.title.ar'];
        let propertyTitleEn = mappedData['property.title.en'];
        let propertyPrice = mappedData['property.price'];
        let propertyArea = mappedData['property.areaSqm'];
        let propertyLocationAr = mappedData['property.location.ar'];
        let propertyLocationEn = mappedData['property.location.en'];
        let propertyAddressAr = mappedData['property.address.ar'];
        let propertyAddressEn = mappedData['property.address.en'];
        let propertyTypeAr = mappedData['property.type.ar'];
        let propertyTypeEn = mappedData['property.type.en'];
        let unitNum = mappedData['property.unitNumber'];
        let propertyGoogleMapsLink = mappedData['property.googleMapsLink'];
        const hasFeaturedImageInput = mappedData['property.featuredImageId'] !== undefined;
        const hasGalleryImageInput = Array.isArray(mappedData['property.galleryImageIds']) && mappedData['property.galleryImageIds'].length > 0;
        const hasVideoUploadInput = mappedData['property.videoUploadId'] !== undefined;

        const hasPropertyInput = Boolean(
          propertyTitleAr ||
          propertyTitleEn ||
          propertyPrice !== undefined ||
          propertyArea !== undefined ||
          propertyTypeAr ||
          propertyTypeEn ||
          unitNum ||
          propertyGoogleMapsLink ||
          propertyLocationAr ||
          propertyLocationEn ||
          propertyAddressAr ||
          propertyAddressEn
        );
        let prFields: Partial<Property> = {};

        if (hasPropertyInput) {
          const resolvedTitleAr = String(propertyTitleAr || unitNum || mappedData['project.name.ar'] || mappedData['project.name.en'] || 'عقار');
          const resolvedTitleEn = String(propertyTitleEn || unitNum || mappedData['project.name.en'] || mappedData['project.name.ar'] || 'Property');
          const resolvedTypeAr = String(propertyTypeAr || 'عقار');
          const resolvedTypeEn = String(propertyTypeEn || 'Property');

          // Check if Property already exists inside the system
          // Match criteria: matching title, or matching Unit Number inside the matched Project
          let matchPropTitleAr = String(propertyTitleAr || unitNum || '').toLowerCase();
          let matchPropTitleEn = String(propertyTitleEn || unitNum || '').toLowerCase();

          const existingProp = systemProperties.find(p => {
            const sysAr = String(p.title?.ar || '').toLowerCase();
            const sysEn = String(p.title?.en || '').toLowerCase();
            // If project is mapped, match by unitNumber under that project
            if (matchedProjectId && p.projectId === matchedProjectId && unitNum && p.unitNumber === String(unitNum)) {
              return true;
            }
            return (matchPropTitleAr && sysAr === matchPropTitleAr) || 
                   (matchPropTitleEn && sysEn === matchPropTitleEn);
          });

          if (existingProp) {
            propertyAction = 'update';
            matchedPropertyId = existingProp.id;
          } else {
            propertyAction = 'create';
          }

          prFields = {
            title: {
              ar: resolvedTitleAr,
              en: resolvedTitleEn
            },
            description: {
              ar: String(mappedData['property.description.ar'] || ''),
              en: String(mappedData['property.description.en'] || '')
            },
            price: Number(propertyPrice || 0),
            location: {
              ar: String(propertyLocationAr || mappedData['project.location.ar'] || ''),
              en: String(propertyLocationEn || mappedData['project.location.en'] || '')
            },
            address: {
              ar: String(propertyAddressAr || propertyLocationAr || ''),
              en: String(propertyAddressEn || propertyLocationEn || '')
            },
            bedrooms: Number(mappedData['property.bedrooms'] || 0),
            bathrooms: Number(mappedData['property.bathrooms'] || 0),
            areaSqm: Number(propertyArea || 0),
            status: (mappedData['property.status'] as any) || 'available',
            type: {
              ar: resolvedTypeAr,
              en: resolvedTypeEn
            },
            googleMapsLink: String(propertyGoogleMapsLink || ''),
            unitNumber: unitNum ? String(unitNum) : undefined,
            livingRooms: mappedData['property.livingRooms'] !== undefined ? Number(mappedData['property.livingRooms']) : undefined,
            balconies: mappedData['property.balconies'] !== undefined ? Number(mappedData['property.balconies']) : undefined,
            parkingSpaces: mappedData['property.parkingSpaces'] !== undefined ? Number(mappedData['property.parkingSpaces']) : undefined,
            currency: String(mappedData['property.currency'] || 'SAR'),
            saleOrRent: (mappedData['property.saleOrRent'] as any) || 'sale',
            featured: Boolean(mappedData['property.featured']),
            featuredImageId: hasFeaturedImageInput
              ? String(mappedData['property.featuredImageId'])
              : (propertyAction === 'create' ? PLACEHOLDER_PROPERTY_FEATURED_MEDIA_ID : undefined),
            galleryImageIds: hasGalleryImageInput
              ? mappedData['property.galleryImageIds']
              : (propertyAction === 'create' ? [PLACEHOLDER_PROPERTY_GALLERY_MEDIA_ID] : undefined),
            videoUploadId: hasVideoUploadInput
              ? String(mappedData['property.videoUploadId'])
              : undefined,
          };
        }

        // Warn if neither project nor property has valid mapping inputs on this row
        if (!hasProjectInput && !hasPropertyInput) {
          warnings.push(translate("هذا السطر فارغ أو لم يتطابق مع أي من الحقول المطلوبة.", "Row appears empty or mapped variables are absent."));
        }

        return {
          rowIdx,
          warnings,
          errors,
          projectAction,
          projectId: matchedProjectId,
          projectName: pFields.name ? (language === 'ar' ? pFields.name.ar : pFields.name.en) : undefined,
          projectFields: pFields,
          propertyAction,
          propertyId: matchedPropertyId,
          propertyFields: prFields
        };
      });

      setPreviewItems(results);
      setLoadingPreview(false);
    }, 450);
  };

  // Step 4: Execute database transaction imports (upserts)
  const commitImport = async () => {
    setIsImporting(true);
    setImportProgress(0);
    
    const importReport: ImportReport = {
      createdProjects: [],
      updatedProjects: [],
      createdProperties: [],
      updatedProperties: [],
      failedRows: []
    };

    // Dictionary to keep track of newly created project names -> project IDs to bind units correctly in the same batch
    const batchProjectNameMap: Record<string, string> = {};

    const total = previewItems.length;
    for (let i = 0; i < total; i++) {
      const item = previewItems[i];
      
      // Update progress
      setImportProgress(Math.round(((i + 1) / total) * 100));

      // Skip rows with fatal errors
      if (item.errors.length > 0) {
        importReport.failedRows.push({
          rowIdx: item.rowIdx,
          error: item.errors.join(' | '),
          data: excelRawRows[i]
        });
        continue;
      }

      try {
        let projectId = item.projectId;

        // Perform Project transaction
        if (item.projectAction !== 'none' && item.projectFields) {
          const keyAr = String(item.projectFields.name?.ar || '').toLowerCase();
          const keyEn = String(item.projectFields.name?.en || '').toLowerCase();

          // Check if we already created it in this batch to avoid duplicates
          const foundBatchId = batchProjectNameMap[keyAr] || batchProjectNameMap[keyEn];

          if (foundBatchId) {
            projectId = foundBatchId;
            // update existing project in batch
            await projectRepository.updateProject(projectId, item.projectFields);
            importReport.updatedProjects.push({ id: projectId, name: item.projectName || '' });
          } else if (item.projectAction === 'update' && projectId) {
            await projectRepository.updateProject(projectId, item.projectFields);
            importReport.updatedProjects.push({ id: projectId, name: item.projectName || '' });
          } else {
            // create new project
            const newProj = await projectRepository.createProject(item.projectFields as Omit<Project, 'id'>);
            projectId = newProj.id;
            batchProjectNameMap[keyAr] = projectId;
            batchProjectNameMap[keyEn] = projectId;
            importReport.createdProjects.push({ id: projectId, name: item.projectName || '' });
          }
        }

        // Perform Property / Unit transaction
        if (item.propertyAction !== 'none' && item.propertyFields) {
          const propFields = { ...item.propertyFields };
          // set the associated project link ID
          if (projectId) {
            propFields.projectId = projectId;
          }

          if (item.propertyAction === 'update' && item.propertyId) {
            await propertyRepository.updateProperty(item.propertyId, propFields);
            importReport.updatedProperties.push({ 
              id: item.propertyId, 
              title: language === 'ar' ? (propFields.title?.ar || '') : (propFields.title?.en || ''), 
              unitNumber: propFields.unitNumber 
            });
          } else {
            const newProp = await propertyRepository.createProperty(propFields as Omit<Property, 'id'>);
            importReport.createdProperties.push({ 
              id: newProp.id, 
              title: language === 'ar' ? (propFields.title?.ar || '') : (propFields.title?.en || ''), 
              unitNumber: propFields.unitNumber 
            });
          }
        }
      } catch (err: any) {
        console.error("Row import error: ", err);
        importReport.failedRows.push({
          rowIdx: item.rowIdx,
          error: err?.message || String(err),
          data: excelRawRows[i]
        });
      }
    }

    setReport(importReport);
    setIsImporting(false);
    setStep(4);
    
    if (onImportComplete) {
      onImportComplete();
    }
  };

  const getMappedSummary = () => {
    const projectMappingsCount = TARGET_FIELDS.filter(f => f.entity === 'project' && mappings[f.key]).length;
    const propertyMappingsCount = TARGET_FIELDS.filter(f => f.entity === 'property' && mappings[f.key]).length;
    return {
      projects: projectMappingsCount,
      properties: propertyMappingsCount,
      total: projectMappingsCount + propertyMappingsCount
    };
  };

  const hasFatalErrors = previewItems.some(i => i.errors.length > 0);
  const totalWarnings = previewItems.reduce((acc, i) => acc + i.warnings.length, 0);

  const downloadTemplate = async (kind: TemplateKind = 'full') => {
    const fields = getTemplateFields(kind);
    const headers = fields.map((field) => getTemplateHeaderLabel(field));
    const exampleRow = fields.map((field) => getTemplateExampleValue(field));
    const groupRow = fields.map((field) => getTemplateGroupLabel(field, kind));

    const workbook = XLSX.utils.book_new();
    const sheetData = [
      groupRow,
      headers,
      exampleRow,
    ];

    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    sheet['!freeze'] = { xSplit: 0, ySplit: 3 };
    sheet['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }) };
    sheet['!cols'] = headers.map(() => ({ wch: 24 }));

    const merges: any[] = [];
    let start = 0;
    for (let i = 1; i <= groupRow.length; i++) {
      if (i === groupRow.length || groupRow[i] !== groupRow[start]) {
        if (i - start > 1) {
          merges.push({ s: { r: 0, c: start }, e: { r: 0, c: i - 1 } });
        }
        start = i;
      }
    }
    if (merges.length > 0) {
      sheet['!merges'] = merges;
    }

    XLSX.utils.book_append_sheet(
      workbook,
      sheet,
      language === 'ar' ? 'قالب الاستيراد' : 'Import Template'
    );

    if (kind !== 'property') {
      const projectFieldsSheet = XLSX.utils.aoa_to_sheet([
        [language === 'ar' ? 'حقول المشروع الأساسية' : 'Key Project Fields'],
        [language === 'ar' ? 'هذه الأعمدة يجب أن تظهر في قالب المشاريع لتسهيل تعبئة البيانات.' : 'These columns are included in the project template to make data entry easier.'],
        [],
        [language === 'ar' ? 'الحقل' : 'Field', language === 'ar' ? 'الوصف' : 'Description', language === 'ar' ? 'مثال' : 'Example'],
        [language === 'ar' ? 'عدد الوحدات' : 'Project Units', language === 'ar' ? 'إجمالي عدد الوحدات داخل المشروع' : 'Total number of units in the project', '120'],
        [language === 'ar' ? 'المطور' : 'Developer', language === 'ar' ? 'اسم المطور أو شركة التطوير' : 'Developer or development company name', 'Bina & Edarah'],
        [language === 'ar' ? 'حالة المشروع' : 'Project Status', language === 'ar' ? 'حالة المشروع الحالية' : 'Current project status', 'available'],
        [language === 'ar' ? 'تاريخ اكتمال المشروع' : 'Project Completion Date', language === 'ar' ? 'تاريخ التسليم أو الاكتمال' : 'Expected or actual completion date', '2026-12-31'],
        [language === 'ar' ? 'رابط خرائط جوجل' : 'Google Maps Link', language === 'ar' ? 'رابط الموقع على خرائط جوجل' : 'Google Maps location URL', 'https://maps.google.com/?q=24.7136,46.6753'],
      ]);
      projectFieldsSheet['!cols'] = [{ wch: 24 }, { wch: 48 }, { wch: 24 }];
      XLSX.utils.book_append_sheet(
        workbook,
        projectFieldsSheet,
        language === 'ar' ? 'حقول_المشروع' : 'Project Fields'
      );
    }

    const instructions = XLSX.utils.aoa_to_sheet([
      [language === 'ar' ? 'تعليمات الاستخدام' : 'How to Use'],
      [language === 'ar' ? '1) اترك الصف الأول الخاص بالمجموعة والصف الثاني الخاص بالأعمدة كما هما.' : '1) Keep the first group row and the second header row unchanged.'],
      [language === 'ar' ? '2) الصف الثالث هو مثال فقط. املأ البيانات الفعلية بدءاً من الصف الرابع.' : '2) The third row is sample data only. Start entering real data from row four.'],
      [language === 'ar' ? '3) يمكنك اختيار القيم من القوائم المنسدلة داخل الملف، خصوصاً نوع العقار والحالة ونوع البيع/الإيجار.' : '3) Use the in-cell dropdowns where available, especially for property type, status, and sale/rent fields.'],
      [language === 'ar' ? '4) إذا احتجت نوع عقار غير موجود في القائمة، يمكنك كتابته يدوياً وسيتم قبوله.' : '4) If you need a property type that is not in the list, you can still type it manually and it will be accepted.'],
      [language === 'ar' ? '5) يمكنك ترك المشروع فارغاً إذا كان العقار مستقلاً وغير تابع لأي مشروع.' : '5) You can leave the project columns empty if the property is standalone.'],
      [language === 'ar' ? '6) عند ترك صورة العقار فارغة سيتم استخدام الصورة الافتراضية.' : '6) If the property image is left empty, the default placeholder image will be used.'],
    ]);
    instructions['!cols'] = [{ wch: 110 }];
    XLSX.utils.book_append_sheet(
      workbook,
      instructions,
      language === 'ar' ? 'تعليمات' : 'Instructions'
    );

    const fileName = language === 'ar'
      ? (kind === 'project'
        ? 'قالب_استيراد_المشاريع.xlsx'
        : kind === 'property'
          ? 'قالب_استيراد_العقارات.xlsx'
          : 'قالب_استيراد_العقارات_والمشاريع.xlsx')
      : (kind === 'project'
        ? 'project_import_template.xlsx'
        : kind === 'property'
          ? 'property_import_template.xlsx'
          : 'property_project_import_template.xlsx');

    const allowedValuesSheet = XLSX.utils.aoa_to_sheet([
      ['Field', 'Allowed values'],
      ['Property Type (Arabic)', PROPERTY_TYPE_PRESETS.map((preset) => preset.label.ar).join(' | ')],
      ['Property Type (English)', PROPERTY_TYPE_PRESETS.map((preset) => preset.label.en).join(' | ')],
      ['Project Units', '0 | 1 | 2 | 10 | 100'],
      ['Project Status', 'available | under-construction | sold | sold-out'],
      ['Property Status', 'available | reserved | sold | rented'],
      ['Sale / Rent', 'sale | rent'],
      ['Yes / No', 'Yes | No'],
    ]);
    allowedValuesSheet['!cols'] = [{ wch: 24 }, { wch: 80 }];
    XLSX.utils.book_append_sheet(
      workbook,
      allowedValuesSheet,
      language === 'ar' ? 'القيم_المسموحة' : 'Allowed Values'
    );

    const workbookBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
    const finalBlob = new Blob([workbookBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(finalBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div id="excel-import-engine-root" className="space-y-6 text-right font-sans" dir="rtl">
      
      {/* Title Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0D0E12] flex items-center gap-2.5 justify-end">
            <span>{translate("محرك استيراد الأصول العقارية المميز", "Excel Asset Import Engine")}</span>
            <Database className="w-5 h-5 text-indigo-600" />
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {translate("قم برفع ملفات الإكسل لإنشاء وتحديث المشاريع، العقارات، والوحدات السكنية تلقائياً بنظام ربط ذكي.", "Upload spreadsheets to load, map, and import projects, properties, and units dynamically.")}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            {translate("يمكنك تنزيل قالب Excel كامل أو مخصص ثم تعبئته وإعادة رفعه للاستيراد.", "You can download a full or scoped Excel template, fill it, and upload it back for import.")}
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <button
          type="button"
          onClick={() => void downloadTemplate('property')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 border border-indigo-600 rounded-xl text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{translate("قالب العقارات فقط", "Property Only")}</span>
          </button>
          <button
          type="button"
          onClick={() => void downloadTemplate('full')}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{translate("قالب كامل مبسط", "Simple Full Template")}</span>
          </button>
          <button
          type="button"
          onClick={() => void downloadTemplate('project')}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{translate("قالب المشاريع فقط", "Project Only")}</span>
          </button>
          {fileName && (
            <button 
              type="button"
              onClick={clearFile}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-rose-600 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{translate("إلغاء الملف الحالي", "Cancel File")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Wizard Progress Tracks */}
      <div className="grid grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <div className={`py-3 px-2 text-center rounded-xl font-bold text-xs transition-all ${step === 1 ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80' : 'text-slate-500'}`}>
          <span className="block text-[9px] text-slate-400 font-normal">01</span>
          <span>{translate("رفع ملف الإكسل", "Upload File")}</span>
        </div>
        <div className={`py-3 px-2 text-center rounded-xl font-bold text-xs transition-all ${step === 2 ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80' : 'text-slate-500'}`}>
          <span className="block text-[9px] text-slate-400 font-normal">02</span>
          <span>{translate("مطابقة الحقول", "Map Columns")}</span>
        </div>
        <div className={`py-3 px-2 text-center rounded-xl font-bold text-xs transition-all ${step === 3 ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80' : 'text-slate-500'}`}>
          <span className="block text-[9px] text-slate-400 font-normal">03</span>
          <span>{translate("معاينة البيانات", "Preview Draft")}</span>
        </div>
        <div className={`py-3 px-2 text-center rounded-xl font-bold text-xs transition-all ${step === 4 ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80' : 'text-slate-500'}`}>
          <span className="block text-[9px] text-slate-400 font-normal">04</span>
          <span>{translate("تقرير الاستيراد", "Import Report")}</span>
        </div>
      </div>

      {/* STEP 1: UPLOAD FILE SCENARIO */}
      {step === 1 && (
        <div className="bg-white border-2 border-dashed border-slate-350 border-slate-300 rounded-3xl p-12 text-center transition-all hover:border-indigo-400 hover:bg-slate-50/50 bg-white shadow-sm">
          <input 
            type="file" 
            id="excel-file-hidden-input" 
            accept=".xlsx, .xls, .csv" 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <label 
            htmlFor="excel-file-hidden-input"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center cursor-pointer space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
              <Upload className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-[#0F172A]">
                {translate("اسحب ملف الإكسل هنا أو قم بالتصفح", "Drag & Drop Excel file here or browse")}
              </h3>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                {translate("يدعم صيغة البوك .xlsx, .xls أو ملفات القيم المفصولة بفواصل .csv. سيقوم المحرك بنمذجة وربط العلاقات تلقائياً.", "Supports .xlsx, .xls spreadsheets or .csv files flat arrays. Automatically links schema rows.")}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-4 y-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-colors px-4 py-2.5">
              <span>{translate("تصفح الملفات المحلية", "Choose File")}</span>
            </div>
          </label>
        </div>
      )}

      {/* STEP 2: FIELD MAPPING SCREEN */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3.5 text-amber-900">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs">{translate("تطابق الحقول والعلاقات الذكية", "Smart Columns Matching System")}</h4>
              <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                {translate("يسرد الجدول التالي كافة متغيرات قاعدة البيانات وحقول العقارات والمشاريع المعمارية في النظام. الرجاء مطابقة كل حقل بالعمود المقابل له في ملف الإكسل المرفوع للمزامنة العكسية والإنشاء المباشر.", "Verify target repository variables. We automatically matched columns inspired by headers synonyms. Unset keys will be ignored.")}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Table Action Controls */}
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#0F172A]">
                  {translate("الملف:", "Loaded spreadsheet:")} <span className="font-mono text-indigo-700">{fileName}</span>
                </span>
                <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-lg border border-indigo-100">
                  {excelRawRows.length} {translate("سجل", "rows parsed")}
                </span>
              </div>

              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={runAutoMatch} 
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  <span>{translate("مطابقة تلقائية", "Auto Match synonyms")}</span>
                </button>
                <button 
                  type="button"
                  onClick={resetMappings} 
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-rose-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>{translate("مسح المطابقات", "Clear Map")}</span>
                </button>
              </div>
            </div>

            {/* Field Mapping Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#F8FAFC] text-slate-500 font-bold uppercase tracking-wide border-b border-slate-100">
                  <tr>
                    <th className="p-4 text-slate-900">{translate("حقل قاعدة البيانات المعني", "Local Database Target Field")}</th>
                    <th className="p-4">{translate("نوع المتغير", "Variable Type")}</th>
                    <th className="p-4">{translate("حالة المتطلب", "Requirement")}</th>
                    <th className="p-4">{translate("العمود المقابل بالإكسيل", "Mapped Column in Excel")}</th>
                    <th className="p-4 text-center">{translate("الحالة", "Match Status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  
                  {/* Category Partition Header: Projects */}
                  <tr className="bg-slate-50 border-y border-slate-150">
                    <td colSpan={5} className="p-3 font-bold text-indigo-700 text-right flex items-center gap-2 justify-end">
                      <span>{translate("حقول المشاريع الكبرى (المجتمعات والمدن والمشروع)", "Large Capital Projects & Communities Schema Fields")}</span>
                      <Milestone className="w-4 h-4 text-indigo-500" />
                    </td>
                  </tr>

                  {TARGET_FIELDS.filter(f => f.entity === 'project').map(field => {
                    const isMapped = !!mappings[field.key];
                    return (
                      <tr key={field.key} className={`hover:bg-slate-50/50 transition-colors ${isMapped ? 'bg-indigo-50/10' : ''}`}>
                        <td className="p-4">
                          <span className="block font-bold text-[#0F172A]">{language === 'ar' ? field.labelAr : field.labelEn}</span>
                          <span className="block font-mono text-[9px] text-slate-400 mt-0.5">{field.key}</span>
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono leading-none">
                            {field.type}
                          </span>
                        </td>
                        <td className="p-4">
                          {field.required ? (
                            <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">
                              {translate("مطلوب للإنشاء", "Required to Create")}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">{translate("اختياري", "Optional")}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <select 
                            value={mappings[field.key] || ''} 
                            onChange={(e) => handleMapField(field.key, e.target.value)}
                            className="w-full max-w-xs px-3 py-1.5 border border-slate-250 border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 text-xs text-[#1A202C]"
                          >
                            <option value="">{translate("-- تجاهل / غير مربوط --", "-- Ignored / Not Mapped --")}</option>
                            {excelHeaders.map(hdr => (
                              <option key={hdr} value={hdr}>{hdr}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          {isMapped ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-bold">
                              <Check className="w-3 h-3" />
                              <span>{translate("تم الربط", "Mapped")}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg text-[10px]">
                              <span>{translate("تجاهل", "Ignored")}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Category Partition Header: Properties */}
                  <tr className="bg-slate-50 border-y border-slate-150">
                    <td colSpan={5} className="p-3 font-bold text-teal-700 text-right flex items-center gap-2 justify-end">
                      <span>{translate("حقول العقارات الفردية والوحدات والأجنحة المخصصة (شقق، فلل، بنتهاوس)", "Individual Properties & Units Inventory Schema Fields")}</span>
                      <Building2 className="w-4 h-4 text-teal-500" />
                    </td>
                  </tr>

                  {TARGET_FIELDS.filter(f => f.entity === 'property').map(field => {
                    const isMapped = !!mappings[field.key];
                    return (
                      <tr key={field.key} className={`hover:bg-slate-50/50 transition-colors ${isMapped ? 'bg-teal-50/10' : ''}`}>
                        <td className="p-4">
                          <span className="block font-bold text-[#0F172A]">{language === 'ar' ? field.labelAr : field.labelEn}</span>
                          <span className="block font-mono text-[9px] text-slate-400 mt-0.5">{field.key}</span>
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono leading-none">
                            {field.type}
                          </span>
                        </td>
                        <td className="p-4">
                          {field.required ? (
                            <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">
                              {translate("مطلوب للإنشاء", "Required to Create")}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">{translate("اختياري", "Optional")}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <select 
                            value={mappings[field.key] || ''} 
                            onChange={(e) => handleMapField(field.key, e.target.value)}
                            className="w-full max-w-xs px-3 py-1.5 border border-slate-250 border-slate-200 bg-white rounded-lg focus:outline-none focus:border-teal-500 text-xs text-[#1A202C]"
                          >
                            <option value="">{translate("-- تجاهل / غير مربوط --", "-- Ignored / Not Mapped --")}</option>
                            {excelHeaders.map(hdr => (
                              <option key={hdr} value={hdr}>{hdr}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          {isMapped ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-bold">
                              <Check className="w-3 h-3" />
                              <span>{translate("تم الربط", "Mapped")}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg text-[10px]">
                              <span>{translate("تجاهل", "Ignored")}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mapping Bottom Actions */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-bold">
                {translate("الحقول التي تم ربطها إجمالاً: ", "Total mapped keys count: ")}
                <span className="text-[#0F172A] font-extrabold text-sm">{getMappedSummary().total}</span>
              </span>

              <button 
                type="button"
                onClick={generatePreview}
                disabled={getMappedSummary().total === 0}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                <span>{translate("احسب المعاينة الفورية", "Generate Validation Preview")}</span>
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PLAY / PREVIEW DRILL DOWN SCREEN */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div>
              <h3 className="font-bold text-base text-[#0F172A]">{translate("محاكاة مراجعة السجلات والتحقق من النزاهة", "Data Dry-Run Integrity Review")}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                {translate("يقوم محرك الاستيراد بفلترة وتمثيل الحقول والتنبؤ بما إذا كان العقار سيسجل كعقار متاح جديد أو سيحدث عقاراً مسبقاً بناءً على رقم الوحدة والمقاييس المحددة.", "Our parser verifies unique keys, previews expected upsert queries, and flags required string anomalies.")}
              </p>
            </div>

            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl font-bold text-xs flex items-center gap-2 transition-transform cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                <span>{translate("تعديل مطابقة الحقول", "Back to Mapping")}</span>
              </button>

              <button 
                type="button"
                onClick={commitImport}
                disabled={previewItems.length === 0 || hasFatalErrors}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-bold text-center text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-emerald-500/10"
              >
                <Play className="w-4 h-4" />
                <span>{translate("بدء الاستيراد الفعلي الآن", "Execute Mass Import")}</span>
              </button>
            </div>
          </div>

          {/* Validation Indicators Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-250 border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="block text-[11px] text-emerald-800 font-bold">{translate("سجلات صالحة ومعتمدة", "Verifiably Safe Rows")}</span>
                <span className="block font-mono text-xl font-black text-emerald-900 mt-1">
                  {previewItems.filter(i => i.errors.length === 0).length} / {previewItems.length}
                </span>
              </div>
              <CheckCircle2 className="w-10 h-10 text-emerald-600/70" />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="block text-[11px] text-amber-800 font-bold">{translate("تحذيرات غير مميتة", "Partial Warnings")}</span>
                <span className="block font-mono text-xl font-black text-amber-900 mt-1">{totalWarnings}</span>
              </div>
              <AlertCircle className="w-10 h-10 text-amber-600/70" />
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="block text-[11px] text-rose-800 font-bold">{translate("أخطاء صياغة حرجة (مرفوضة)", "Fatal Validation Blocks")}</span>
                <span className="block font-mono text-xl font-black text-rose-950 mt-1">
                  {previewItems.filter(i => i.errors.length > 0).length}
                </span>
                {hasFatalErrors && (
                  <span className="block text-[9px] text-rose-650 font-semibold mt-0.5">{translate("عالج الأخطاء في الإكسيل للمتابعة", "Correct sheet missing data to proceed.")}</span>
                )}
              </div>
              <AlertCircle className="w-10 h-10 text-rose-600/70" />
            </div>
          </div>

          {/* Interactive Sheet Preview Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#F8FAFC] text-slate-500 font-bold tracking-wide border-b border-slate-100">
                  <tr>
                    <th className="p-3 text-center w-12 font-bold">#</th>
                    <th className="p-3 font-bold">{translate("العمليات المتوقعة للمشروع", "Expected Project Upsert Query")}</th>
                    <th className="p-3 font-bold">{translate("العمليات المتوقعة للعقار", "Expected Property Asset Query")}</th>
                    <th className="p-3 font-bold">{translate("بيانات العقار والوحدة السكنية", "Asset Properties Draft")}</th>
                    <th className="p-3 text-center font-bold">{translate("حالة التحقق والقيود", "Row Verification Summary")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {previewItems.map((item, idx) => {
                    const isError = item.errors.length > 0;
                    const isWarning = item.warnings.length > 0;
                    
                    return (
                      <tr 
                        key={item.rowIdx} 
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isError ? 'bg-rose-50/20' : isWarning ? 'bg-amber-50/10' : ''
                        }`}
                      >
                        {/* Row Index */}
                        <td className="p-3 font-mono text-slate-400 text-center border-l border-slate-100">
                          {item.rowIdx}
                        </td>

                        {/* Project Operations */}
                        <td className="p-3 space-y-1">
                          {item.projectAction === 'create' ? (
                            <div>
                              <span className="inline-block bg-teal-50 text-teal-700 border border-teal-100 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                + {translate("إنشاء مشروع", "Create Project")}
                              </span>
                              <span className="block font-bold text-slate-800 mt-1 max-w-[200px] truncate" title={item.projectName}>
                                {item.projectName}
                              </span>
                            </div>
                          ) : item.projectAction === 'update' ? (
                            <div>
                              <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-150 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                {/* Update Badge */}
                                {translate("تحديث مشروع قائم", "Update Project")}
                              </span>
                              <span className="block font-bold text-slate-800 mt-1 max-w-[200px] truncate" title={`${item.projectName} (ID: ${item.projectId})`}>
                                {item.projectName}
                              </span>
                              <span className="block font-mono text-[9px] text-slate-400 truncate">{item.projectId}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">{translate("-- لا يوجد حقول مشروع --", "-- No project details --")}</span>
                          )}
                        </td>

                        {/* Property Operations */}
                        <td className="p-3 space-y-1">
                          {item.propertyAction === 'create' ? (
                            <div>
                              <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                + {translate("إنشاء عقار جديد", "Create Property")}
                              </span>
                              <span className="block font-bold text-slate-800 mt-1 truncate max-w-[200px]" title={item.propertyFields?.title?.ar}>
                                {language === 'ar' ? item.propertyFields?.title?.ar : item.propertyFields?.title?.en}
                              </span>
                            </div>
                          ) : item.propertyAction === 'update' ? (
                            <div>
                              <span className="inline-block bg-amber-50 text-[#B45309] border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                {translate("تحديث عقار قائم", "Update Property")}
                              </span>
                              <span className="block font-bold text-slate-800 mt-1 truncate max-w-[200px]" title={`${item.propertyFields?.title?.ar} (ID: ${item.propertyId})`}>
                                {language === 'ar' ? item.propertyFields?.title?.ar : item.propertyFields?.title?.en}
                              </span>
                              <span className="block font-mono text-[9px] text-slate-400 truncate">{item.propertyId}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">{translate("-- لا يوجد حقول عقار --", "-- No property details --")}</span>
                          )}
                        </td>

                        {/* Property Details */}
                        <td className="p-3">
                          {item.propertyAction !== 'none' && item.propertyFields ? (
                            <div className="space-y-1 text-right text-slate-600">
                              <span className="block font-bold text-[#1A202C] font-mono text-emerald-650 text-emerald-700">
                                {item.propertyFields.price?.toLocaleString()} {item.propertyFields.currency || 'SAR'}
                              </span>
                              <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-500 font-semibold">
                                <span className="bg-slate-100 px-1 py-0.2 rounded font-normal text-slate-700">{language === 'ar' ? item.propertyFields.type?.ar : item.propertyFields.type?.en}</span>
                                {item.propertyFields.unitNumber && (
                                  <span className="font-extrabold text-[#B45309]">#{item.propertyFields.unitNumber}</span>
                                )}
                                <span>{item.propertyFields.areaSqm} m²</span>
                                <span>{item.propertyFields.bedrooms} {translate("غرف", "beds")}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Validation Status */}
                        <td className="p-3 text-center border-r border-slate-100">
                          {isError ? (
                            <div className="space-y-1 flex flex-col items-center">
                              {item.errors.map((err, i) => (
                                <span key={i} className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                  <AlertCircle className="w-3 h-3 text-rose-500" />
                                  <span>{err}</span>
                                </span>
                              ))}
                            </div>
                          ) : isWarning ? (
                            <div className="space-y-1 flex flex-col items-center">
                              {item.warnings.map((warn, i) => (
                                <span key={i} className="inline-flex items-center gap-1 bg-amber-50 text-[#B45309] border border-amber-100 px-2 py-0.5 rounded-lg text-[9px]">
                                  <AlertCircle className="w-2.5 h-2.5" />
                                  <span>{warn}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-0.5 rounded-lg text-[10px] font-bold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{translate("صالح للدمج", "Integrates Safely")}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: IMPORT EXECUTION & DETAILED REPORT */}
      {step === 4 && (
        <div className="space-y-6">
          
          {/* Main Success Greeting Billboard */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm bg-white">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-[#0F172A]">{translate("اكتمل معالجة وتثبيت سجلات الإكسل!", "Excel Processing & Commitment Complete!")}</h3>
              <p className="text-slate-400 text-xs max-w-lg mx-auto leading-relaxed">
                {translate("تم محاكاة ومعادلة حقول البيانات وتوطيد العلاقات بنظام المفاتيح بالنجاح التام. تم توثيق السجلات مباشرة في مستودع الكائنات المخصص الجاهز لدمج SQL.", "Your data maps have integrated and matched database targets. SQL schema alignment is stored in the current cache layer.")}
              </p>
            </div>
            
            <button 
              type="button"
              onClick={clearFile}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{translate("استيراد جدول بيانات جديد", "Upload New Spreadsheet")}</span>
            </button>
          </div>

          {/* Import Summary Counters Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">{translate("المشاريع الجديدة", "Projects Created")}</span>
              <span className="block font-mono text-xl font-extrabold text-teal-700 mt-1">{report?.createdProjects.length || 0}</span>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">{translate("تحديث المشاريع", "Projects Updated")}</span>
              <span className="block font-mono text-xl font-extrabold text-indigo-700 mt-1">{report?.updatedProjects.length || 0}</span>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">{translate("عقارات / وحدات جديدة", "Properties Created")}</span>
              <span className="block font-mono text-xl font-extrabold text-emerald-700 mt-1">{report?.createdProperties.length || 0}</span>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">{translate("تحديث العقارات", "Properties Updated")}</span>
              <span className="block font-mono text-xl font-extrabold text-amber-700 mt-1">{report?.updatedProperties.length || 0}</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center col-span-2 lg:col-span-1">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">{translate("الأسطر المرفوضة/الفاشلة", "Failed Rows")}</span>
              <span className={`block font-mono text-xl font-extrabold mt-1 ${report && report.failedRows.length > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {report?.failedRows.length || 0}
              </span>
            </div>
          </div>

          {/* DETAILED IMPORT REPORT */}
          {report && (
            <div className="space-y-6">
              
              {/* Created & Updated Records Logs */}
              {(report.createdProjects.length > 0 || report.updatedProjects.length > 0 || report.createdProperties.length > 0 || report.updatedProperties.length > 0) && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h4 className="font-bold text-xs text-[#0F172A] flex items-center gap-2 justify-end">
                      <span>{translate("سجلات المعاملات التي تمت بنجاح", "Successful Data Commitment Log")}</span>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </h4>
                  </div>
                  
                  <div className="p-4 max-h-72 overflow-y-auto space-y-3 text-right">
                    {/* Projects Created */}
                    {report.createdProjects.map(p => (
                      <div key={p.id} className="flex justify-between items-center bg-teal-50/40 p-2.5 rounded-lg border border-teal-100/50 text-[11px]">
                        <span className="font-mono text-slate-400">{p.id}</span>
                        <div className="flex gap-2 items-center">
                          <span className="font-extrabold text-slate-800">{p.name}</span>
                          <span className="bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase">+ {translate("إنشاء مشروع", "CREATE PROJECT")}</span>
                        </div>
                      </div>
                    ))}

                    {/* Projects Updated */}
                    {report.updatedProjects.map(p => (
                      <div key={p.id} className="flex justify-between items-center bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100/50 text-[11px]">
                        <span className="font-mono text-slate-400">{p.id}</span>
                        <div className="flex gap-2 items-center">
                          <span className="font-extrabold text-slate-800">{p.name}</span>
                          <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase">{translate("تحديث مشروع", "UPDATE PROJECT")}</span>
                        </div>
                      </div>
                    ))}

                    {/* Properties Created */}
                    {report.createdProperties.map(prop => (
                      <div key={prop.id} className="flex justify-between items-center bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100/50 text-[11px]">
                        <span className="font-mono text-slate-400">{prop.id}</span>
                        <div className="flex gap-2 items-center">
                          <span className="font-extrabold text-slate-800">
                            {prop.title} {prop.unitNumber && <span className="text-[#B45309]">#{prop.unitNumber}</span>}
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase">+ {translate("إنشاء عقار", "CREATE PROPERTY")}</span>
                        </div>
                      </div>
                    ))}

                    {/* Properties Updated */}
                    {report.updatedProperties.map(prop => (
                      <div key={prop.id} className="flex justify-between items-center bg-amber-50/40 p-2.5 rounded-lg border border-amber-100/50 text-[11px]">
                        <span className="font-mono text-slate-400">{prop.id}</span>
                        <div className="flex gap-2 items-center">
                          <span className="font-extrabold text-slate-800">
                            {prop.title} {prop.unitNumber && <span className="text-[#B45309]">#{prop.unitNumber}</span>}
                          </span>
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase">{translate("تحديث عقار", "UPDATE PROPERTY")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAILED RECORDS CARD */}
              {report.failedRows.length > 0 && (
                <div className="bg-white border border-rose-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-rose-150 bg-rose-50 flex justify-between items-center">
                    <span className="text-[10px] bg-rose-100 text-rose-700 px-2.5 py-1 rounded-lg font-black">
                      {report.failedRows.length} {translate("سطر فاشل", "Failed Rows")}
                    </span>
                    <h4 className="font-bold text-xs text-rose-950 flex items-center gap-2 justify-end">
                      <span>{translate("السجلات المرفوضة وتفاصيل المانع", "Rejected Records & Anomaly Logs")}</span>
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    </h4>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-[#FFFDFD] text-slate-500 font-bold border-b border-rose-100/80">
                        <tr>
                          <th className="p-3 text-center w-12 font-bold">{translate("السطر", "Row")}</th>
                          <th className="p-3 text-rose-900 font-bold">{translate("سبب الرفض والخطأ", "Failure Reason")}</th>
                          <th className="p-3 font-bold">{translate("بيانات السطر المستخلصة من الملف", "Extracted Input Cells")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100/80 font-medium text-slate-700">
                        {report.failedRows.map((failed, i) => (
                          <tr key={i} className="hover:bg-rose-50/10">
                            <td className="p-3 text-center font-mono text-slate-400 border-l border-slate-100">
                              {failed.rowIdx}
                            </td>
                            <td className="p-3 text-rose-650 font-bold">
                              {failed.error}
                            </td>
                            <td className="p-3 text-slate-500 font-mono text-[10px]">
                              {JSON.stringify(failed.data)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* IMPORTING MOCK LOADER IF EXECUTING TRANSACTION */}
      {isImporting && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-indigo-600 animate-spin">
              <RefreshCw className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-lg text-[#0F172A]">{translate("جاري معالجة وتثبيت البيانات الـMassive...", "Committing bulk transactional records...")}</h3>
              <p className="text-slate-400 text-xs">
                {translate("يقوم محرك الاستيراد بربط المعرفات وتحديث الحقول في مستودع الأصول العقارية.. يرجى الانتظار.", "Mapping foreign keys, parsing validation grids and syncing repository structures.")}
              </p>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              />
            </div>
            <span className="block text-xs font-mono font-bold text-indigo-700">{importProgress}%</span>
          </div>
        </div>
      )}

    </div>
  );
}
