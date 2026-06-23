/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BilingualText {
  ar: string;
  en: string;
  icon?: string;
}

export interface HeroSlide {
  id: string;
  title: BilingualText;
  subtitle: BilingualText;
  ctaText?: BilingualText;
  ctaPage?: string; // 'properties' | 'projects' | 'contact' | 'about' etc
  base64Data?: string; // Direct uploaded image Base64 representation
}

export interface WebsiteSettings {
  id: string;
  companyName: BilingualText;
  companyTagline: BilingualText;
  primaryColor: string; // HEX
  secondaryColor: string; // HEX
  accentColor: string; // HEX
  contactEmail: string;
  contactPhone: string;
  address: BilingualText;
  logoBase64?: string; // Stored in database as Base64/CLOB, no hardcoded image URLs
  faviconBase64?: string; // Favicon upload
  whatsapp?: string;
  socialX?: string;
  socialInstagram?: string;
  socialLinkedIn?: string;
  socialTikTok?: string;
  socialSnapchat?: string;
  heroSlides?: HeroSlide[]; // Dynamic Slider Configuration
}

export interface MediaItem {
  id: string;
  name: string;
  mimeType: string;
  base64Data: string; // Standard base64 representation matching "ALL IMAGES MUST BE UPLOADED THROUGH THE DASHBOARD"
  uploadedAt: string;
}

export interface Property {
  id: string;
  title: BilingualText;
  description: BilingualText;
  price: number;
  status: 'available' | 'reserved' | 'sold' | 'rented'; // Current Property Status (Available, Reserved, Sold, Rented etc)
  type: BilingualText; // Property Type (e.g. Villa / Apartment / Land etc)
  location: BilingualText; // Fallback or general location
  district?: BilingualText; // Added in Issue #4
  address?: BilingualText; // Added in Issue #4
  coordinates?: string; // Added in Issue #4 (Latitude, Longitude string)
  bedrooms: number;
  bathrooms: number;
  livingRooms?: number;
  areaSqm: number;
  balconies?: number;
  parkingSpaces?: number;
  floorNumber?: number; // Added in Issue #4
  propertyAge?: number; // Added in Issue #4 (years)
  unitNumber?: string;
  unitCode?: string; // Added in Issue #4 (reference/code)
  finishingType?: BilingualText; // Added in Issue #4 (e.g. Deluxe, Super Deluxe)
  ownershipType?: BilingualText; // Added in Issue #4 (e.g. Freehold, Inherited)
  developer?: BilingualText; // Added in Issue #4
  currency?: string; // e.g. 'SAR', 'USD'
  googleMapsLink?: string; // Google Maps URL for the property location
  saleOrRent?: 'sale' | 'rent'; // Property Purpose
  featured?: boolean;
  listingDate?: string; // Added in Issue #4 (YYYY-MM-DD)
  featuredImageId?: string; // Reference to MediaItem id (Cover Image)
  galleryImageIds: string[]; // List of reference ids (Gallery Images)
  floorPlanMediaIds?: string[]; // List of reference ids (Floor Plans)
  floorPlanImageId?: string; // Backward compatibility fallback
  documentMediaIds?: string[]; // List of reference ids (Documents)
  videoUploadId?: string; // Reference to MediaItem (Video)
  projectId?: string; // Foreign key / link to Project
  
  // Custom Amenities & Flag specs (For Issue #2 & Issue #5)
  amenityParking?: boolean;
  amenityCoveredParking?: boolean;
  amenityPool?: boolean;
  amenityPrivatePool?: boolean;
  amenityGym?: boolean;
  amenityElevator?: boolean;
  amenitySecurity?: boolean;
  amenityMosque?: boolean;
  amenityChildrenArea?: boolean;
  amenityGarden?: boolean;
  amenityMaidRoom?: boolean;
  amenityDriverRoom?: boolean;
  amenitySmartHome?: boolean;
  customAmenities?: BilingualText[];

  // Premium Luxury Completion Fields
  highlights?: BilingualText[];
  projectVideoUrl?: string;
  virtualTourUrl?: string;
  tour360Url?: string;
  nearbyPlaces?: Array<{ name: BilingualText; type: string; distance: string }>;
  seoKeywords?: string;
  openGraphImageId?: string;
  canonicalUrl?: string;

  // SEO completed fields (Issue #7)
  seoTitleAr?: string;
  seoTitleEn?: string;
  seoDescAr?: string;
  seoDescEn?: string;
}

export interface Project {
  id: string;
  name: BilingualText;
  description: BilingualText;
  location: BilingualText; // Fallback / combined location
  city: BilingualText;
  district: BilingualText;
  address: BilingualText;
  completionDate: string;
  status: 'available' | 'under-construction' | 'sold-out';
  googleMapsLink?: string;
  latitude?: number;
  longitude?: number;
  featured: boolean; // featured project
  coverImageId?: string; // Reference to MediaItem
  galleryImageIds: string[]; // Reference ids to MediaItems
  brochurePdfId?: string; // Reference to MediaItem (PDF)
  videoUploadId?: string; // Reference to MediaItem (Video)
  
  // Amenities
  amenityParking: boolean;
  amenitySecurity: boolean;
  amenityElevators: boolean;
  amenityMosque: boolean;
  amenityGym: boolean;
  amenityPool: boolean;
  amenityChildrenArea: boolean;
  customAmenities: BilingualText[]; // Custom amenities array
  
  // SEO fields
  seoTitleAr?: string;
  seoTitleEn?: string;
  seoDescAr?: string;
  seoDescEn?: string;
}

export interface Inquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  propertyId?: string; // Optional linked property id
  projectId?: string; // Optional linked project id
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;
}

export interface PageContent {
  id: string;
  slug: string; // e.g. 'about', 'contact'
  title: BilingualText;
  subtitle?: BilingualText;
  sections: Array<{
    id: string;
    title?: BilingualText;
    body: BilingualText;
  }>;
  // Dynamic Custom CMS Fields
  slugAr?: string;
  slugEn?: string;
  contentAr?: string;
  contentEn?: string;
  seoTitleAr?: string;
  seoTitleEn?: string;
  seoDescAr?: string;
  seoDescEn?: string;
  status?: 'draft' | 'published';
  parentId?: string; // parent-child page hierarchy ID
}

// Layout view options
export type ViewMode = 'public' | 'admin';
export type ActivePublicPage = string; // can be 'home' | 'properties' | 'projects' | 'about' | 'contact' or any dynamic slug
export type ActiveAdminTab = 'dashboard' | 'projects' | 'properties' | 'inquiries' | 'pages' | 'media' | 'settings' | 'import' | 'page_builder';

// Visual Page Builder Sub-Architecture (Hierarchy: Page -> Section -> Row -> Column -> Widget)
export interface VisualWidget {
  id: string;
  type: string; // Dynamic support for complex widget types from categories
  settings: {
    textAr?: string;
    textEn?: string;
    align?: 'right' | 'left' | 'center';
    color?: string;
    size?: string;
    imageUrl?: string;
    paddingY?: string;
    buttonLink?: string;

    // Advanced visual custom styles supporting the requirements:
    // Responsive Settings & Screen Visibility Rules
    responsiveVisibility?: {
      desktop: boolean;
      tablet: boolean;
      mobile: boolean;
    };
    // Typography
    typography?: {
      fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
      fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
      fontFamily?: 'sans' | 'serif' | 'mono';
      lineHeight?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
    };
    // Colors
    colors?: {
      text?: string;
      background?: string;
      border?: string;
      accent?: string;
    };
    // Borders
    borders?: {
      radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
      width?: '0' | '1' | '2' | '4' | '8';
      style?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
      color?: string;
    };
    // Spacing
    spacing?: {
      paddingTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
      paddingBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
      paddingLeft?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
      paddingRight?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
      marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
      marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
      marginLeft?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
      marginRight?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    };
    // Background style
    background?: {
      color?: string;
      opacity?: number;
      imageUrl?: string;
    };
    // Animations support
    animation?: {
      type?: 'none' | 'fade-in' | 'slide-up' | 'zoom-in' | 'bounce' | 'pulse';
      hoverEffect?: 'none' | 'scaleup' | 'glow' | 'lift';
    };

    [key: string]: any; // fallback for rich specific inputs
  };
}

export interface VisualColumn {
  id: string;
  span: number; // grid system e.g. 12 (full), 6 (half), 4 (third), 3 (quarter)
  widgets: VisualWidget[];
}

export interface VisualRow {
  id: string;
  columns: VisualColumn[];
}

export interface VisualSection {
  id: string;
  nameAr: string;
  nameEn: string;
  visible: boolean; // hide/show state
  backgroundColor?: string;
  paddingY?: 'none' | 'small' | 'medium' | 'large';
  rows: VisualRow[];
  componentId?: string;
  effects?: any;
}

export interface VisualPage {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  sections: VisualSection[];
}

export interface PageVersion {
  id: string;
  pageId: string;
  versionName: string;
  createdAt: string;
  data: VisualPage;
}
