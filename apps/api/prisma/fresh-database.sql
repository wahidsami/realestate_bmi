-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "public"."InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."PageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."TemplateStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'FLOORPLAN', 'AVATAR', 'SEO', 'GALLERY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MediaVariantType" AS ENUM ('THUMBNAIL', 'MEDIUM', 'LARGE', 'WEB');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."SessionDeviceType" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET', 'BOT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."TokenType" AS ENUM ('REFRESH', 'PASSWORD_RESET');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "jobTitle" TEXT,
    "department" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "deletedById" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "description" TEXT,
    "group" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PropertyCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "PropertyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PropertyFeature" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PropertyFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Amenity" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "category" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "developerAr" TEXT,
    "developerEn" TEXT,
    "cityAr" TEXT,
    "cityEn" TEXT,
    "districtAr" TEXT,
    "districtEn" TEXT,
    "addressAr" TEXT,
    "addressEn" TEXT,
    "completionDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'available',
    "unitCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "coverMediaId" TEXT,
    "seoTitleAr" TEXT,
    "seoTitleEn" TEXT,
    "seoDescriptionAr" TEXT,
    "seoDescriptionEn" TEXT,
    "seoKeywords" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "categoryId" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Property" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "price" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "status" TEXT NOT NULL DEFAULT 'available',
    "saleOrRent" TEXT NOT NULL DEFAULT 'sale',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "projectId" TEXT,
    "categoryId" TEXT,
    "featuredMediaId" TEXT,
    "seoTitleAr" TEXT,
    "seoTitleEn" TEXT,
    "seoDescriptionAr" TEXT,
    "seoDescriptionEn" TEXT,
    "seoKeywords" TEXT,
    "listingDate" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Unit" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "titleAr" TEXT,
    "titleEn" TEXT,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "propertyId" TEXT,
    "projectId" TEXT,
    "categoryId" TEXT,
    "unitNumber" TEXT,
    "floorNumber" INTEGER,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "areaSqm" DECIMAL(12,2),
    "price" DECIMAL(18,2),
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "status" TEXT NOT NULL DEFAULT 'available',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "listingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PropertyAmenity" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyAmenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectAmenity" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectAmenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UnitAmenity" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnitAmenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PropertyFeatureOnProperty" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyFeatureOnProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PropertyFeatureOnUnit" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyFeatureOnUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Media" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "publicUrl" TEXT,
    "mimeType" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "category" "public"."MediaType" NOT NULL DEFAULT 'OTHER',
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" DOUBLE PRECISION,
    "altTextAr" TEXT,
    "altTextEn" TEXT,
    "captionAr" TEXT,
    "captionEn" TEXT,
    "titleAr" TEXT,
    "titleEn" TEXT,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "folder" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dominantColor" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "uploadedById" TEXT,
    "folderId" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MediaFolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "MediaFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MediaVariant" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "variant" "public"."MediaVariantType" NOT NULL,
    "filePath" TEXT NOT NULL,
    "publicUrl" TEXT,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MediaVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PropertyMedia" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectMedia" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UnitMedia" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnitMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PageMedia" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WidgetMedia" (
    "id" TEXT NOT NULL,
    "widgetId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "pageWidgetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WidgetMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TemplateMedia" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SettingMedia" (
    "id" TEXT NOT NULL,
    "settingId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettingMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogPostMedia" (
    "id" TEXT NOT NULL,
    "blogPostId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogPostMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Lead" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "source" TEXT,
    "status" "public"."LeadStatus" NOT NULL DEFAULT 'NEW',
    "crmStage" TEXT NOT NULL DEFAULT 'new',
    "stageId" TEXT,
    "notesAr" TEXT,
    "notesEn" TEXT,
    "propertyId" TEXT,
    "projectId" TEXT,
    "unitId" TEXT,
    "assignedToId" TEXT,
    "lastContactAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Inquiry" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "messageAr" TEXT,
    "messageEn" TEXT,
    "status" "public"."InquiryStatus" NOT NULL DEFAULT 'NEW',
    "propertyId" TEXT,
    "projectId" TEXT,
    "unitId" TEXT,
    "leadId" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadPipelineStage" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "LeadPipelineStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "stageId" TEXT,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "activityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Page" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "subtitleAr" TEXT,
    "subtitleEn" TEXT,
    "contentAr" TEXT,
    "contentEn" TEXT,
    "seoTitleAr" TEXT,
    "seoTitleEn" TEXT,
    "seoDescriptionAr" TEXT,
    "seoDescriptionEn" TEXT,
    "status" "public"."PageStatus" NOT NULL DEFAULT 'DRAFT',
    "parentId" TEXT,
    "metadata" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PageVersion" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "versionName" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VisualPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sections" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "VisualPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VisualPageVersion" (
    "id" TEXT NOT NULL,
    "visualPageId" TEXT NOT NULL,
    "versionName" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisualPageVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BuilderAsset" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "key" TEXT,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "BuilderAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PageSection" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "templateId" TEXT,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "backgroundColor" TEXT,
    "paddingY" TEXT,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "PageSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PageWidget" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "widgetType" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "PageWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Template" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "public"."TemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "pageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TemplateSection" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Widget" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "defaults" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Widget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "group" TEXT,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NavigationMenu" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "NavigationMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NavigationMenuItem" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "parentId" TEXT,
    "labelAr" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "target" TEXT NOT NULL DEFAULT '_self',
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "NavigationMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "excerptAr" TEXT,
    "excerptEn" TEXT,
    "contentAr" TEXT,
    "contentEn" TEXT,
    "seoTitleAr" TEXT,
    "seoTitleEn" TEXT,
    "seoDescriptionAr" TEXT,
    "seoDescriptionEn" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceType" "public"."SessionDeviceType" NOT NULL DEFAULT 'UNKNOWN',
    "browser" TEXT,
    "operatingSystem" TEXT,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoutAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "tokenHash" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "tokenType" "public"."TokenType" NOT NULL DEFAULT 'REFRESH',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "messageAr" TEXT NOT NULL,
    "messageEn" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "public"."NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "readAt" TIMESTAMP(3),
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "public"."User"("status");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "public"."User"("isActive");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "public"."User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "public"."Role"("name");

-- CreateIndex
CREATE INDEX "Role_deletedAt_idx" ON "public"."Role"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "public"."Permission"("key");

-- CreateIndex
CREATE INDEX "Permission_module_idx" ON "public"."Permission"("module");

-- CreateIndex
CREATE INDEX "Permission_deletedAt_idx" ON "public"."Permission"("deletedAt");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "public"."UserRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "public"."UserRole"("userId", "roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "public"."RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "public"."RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyCategory_slug_key" ON "public"."PropertyCategory"("slug");

-- CreateIndex
CREATE INDEX "PropertyCategory_parentId_idx" ON "public"."PropertyCategory"("parentId");

-- CreateIndex
CREATE INDEX "PropertyCategory_deletedAt_idx" ON "public"."PropertyCategory"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyFeature_key_key" ON "public"."PropertyFeature"("key");

-- CreateIndex
CREATE INDEX "PropertyFeature_deletedAt_idx" ON "public"."PropertyFeature"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Amenity_key_key" ON "public"."Amenity"("key");

-- CreateIndex
CREATE INDEX "Amenity_category_idx" ON "public"."Amenity"("category");

-- CreateIndex
CREATE INDEX "Amenity_deletedAt_idx" ON "public"."Amenity"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "public"."Project"("slug");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "public"."Project"("status");

-- CreateIndex
CREATE INDEX "Project_featured_idx" ON "public"."Project"("featured");

-- CreateIndex
CREATE INDEX "Project_categoryId_idx" ON "public"."Project"("categoryId");

-- CreateIndex
CREATE INDEX "Project_deletedAt_idx" ON "public"."Project"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "public"."Property"("slug");

-- CreateIndex
CREATE INDEX "Property_status_idx" ON "public"."Property"("status");

-- CreateIndex
CREATE INDEX "Property_saleOrRent_idx" ON "public"."Property"("saleOrRent");

-- CreateIndex
CREATE INDEX "Property_featured_idx" ON "public"."Property"("featured");

-- CreateIndex
CREATE INDEX "Property_projectId_idx" ON "public"."Property"("projectId");

-- CreateIndex
CREATE INDEX "Property_categoryId_idx" ON "public"."Property"("categoryId");

-- CreateIndex
CREATE INDEX "Property_deletedAt_idx" ON "public"."Property"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_code_key" ON "public"."Unit"("code");

-- CreateIndex
CREATE INDEX "Unit_status_idx" ON "public"."Unit"("status");

-- CreateIndex
CREATE INDEX "Unit_propertyId_idx" ON "public"."Unit"("propertyId");

-- CreateIndex
CREATE INDEX "Unit_projectId_idx" ON "public"."Unit"("projectId");

-- CreateIndex
CREATE INDEX "Unit_categoryId_idx" ON "public"."Unit"("categoryId");

-- CreateIndex
CREATE INDEX "Unit_deletedAt_idx" ON "public"."Unit"("deletedAt");

-- CreateIndex
CREATE INDEX "PropertyAmenity_amenityId_idx" ON "public"."PropertyAmenity"("amenityId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyAmenity_propertyId_amenityId_key" ON "public"."PropertyAmenity"("propertyId", "amenityId");

-- CreateIndex
CREATE INDEX "ProjectAmenity_amenityId_idx" ON "public"."ProjectAmenity"("amenityId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAmenity_projectId_amenityId_key" ON "public"."ProjectAmenity"("projectId", "amenityId");

-- CreateIndex
CREATE INDEX "UnitAmenity_amenityId_idx" ON "public"."UnitAmenity"("amenityId");

-- CreateIndex
CREATE UNIQUE INDEX "UnitAmenity_unitId_amenityId_key" ON "public"."UnitAmenity"("unitId", "amenityId");

-- CreateIndex
CREATE INDEX "PropertyFeatureOnProperty_featureId_idx" ON "public"."PropertyFeatureOnProperty"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyFeatureOnProperty_propertyId_featureId_key" ON "public"."PropertyFeatureOnProperty"("propertyId", "featureId");

-- CreateIndex
CREATE INDEX "PropertyFeatureOnUnit_featureId_idx" ON "public"."PropertyFeatureOnUnit"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyFeatureOnUnit_unitId_featureId_key" ON "public"."PropertyFeatureOnUnit"("unitId", "featureId");

-- CreateIndex
CREATE INDEX "Media_category_idx" ON "public"."Media"("category");

-- CreateIndex
CREATE INDEX "Media_folderId_idx" ON "public"."Media"("folderId");

-- CreateIndex
CREATE INDEX "Media_uploadedById_idx" ON "public"."Media"("uploadedById");

-- CreateIndex
CREATE INDEX "Media_deletedAt_idx" ON "public"."Media"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MediaFolder_path_key" ON "public"."MediaFolder"("path");

-- CreateIndex
CREATE INDEX "MediaFolder_parentId_idx" ON "public"."MediaFolder"("parentId");

-- CreateIndex
CREATE INDEX "MediaFolder_deletedAt_idx" ON "public"."MediaFolder"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MediaFolder_parentId_name_key" ON "public"."MediaFolder"("parentId", "name");

-- CreateIndex
CREATE INDEX "MediaVariant_variant_idx" ON "public"."MediaVariant"("variant");

-- CreateIndex
CREATE INDEX "MediaVariant_deletedAt_idx" ON "public"."MediaVariant"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MediaVariant_mediaId_variant_key" ON "public"."MediaVariant"("mediaId", "variant");

-- CreateIndex
CREATE INDEX "PropertyMedia_mediaId_idx" ON "public"."PropertyMedia"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyMedia_propertyId_mediaId_key" ON "public"."PropertyMedia"("propertyId", "mediaId");

-- CreateIndex
CREATE INDEX "ProjectMedia_mediaId_idx" ON "public"."ProjectMedia"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMedia_projectId_mediaId_key" ON "public"."ProjectMedia"("projectId", "mediaId");

-- CreateIndex
CREATE INDEX "UnitMedia_mediaId_idx" ON "public"."UnitMedia"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "UnitMedia_unitId_mediaId_key" ON "public"."UnitMedia"("unitId", "mediaId");

-- CreateIndex
CREATE INDEX "PageMedia_mediaId_idx" ON "public"."PageMedia"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "PageMedia_pageId_mediaId_key" ON "public"."PageMedia"("pageId", "mediaId");

-- CreateIndex
CREATE INDEX "WidgetMedia_pageWidgetId_idx" ON "public"."WidgetMedia"("pageWidgetId");

-- CreateIndex
CREATE INDEX "WidgetMedia_mediaId_idx" ON "public"."WidgetMedia"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "WidgetMedia_widgetId_mediaId_key" ON "public"."WidgetMedia"("widgetId", "mediaId");

-- CreateIndex
CREATE INDEX "TemplateMedia_mediaId_idx" ON "public"."TemplateMedia"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateMedia_templateId_mediaId_key" ON "public"."TemplateMedia"("templateId", "mediaId");

-- CreateIndex
CREATE INDEX "SettingMedia_mediaId_idx" ON "public"."SettingMedia"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "SettingMedia_settingId_mediaId_key" ON "public"."SettingMedia"("settingId", "mediaId");

-- CreateIndex
CREATE INDEX "BlogPostMedia_mediaId_idx" ON "public"."BlogPostMedia"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPostMedia_blogPostId_mediaId_key" ON "public"."BlogPostMedia"("blogPostId", "mediaId");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "public"."Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_crmStage_idx" ON "public"."Lead"("crmStage");

-- CreateIndex
CREATE INDEX "Lead_stageId_idx" ON "public"."Lead"("stageId");

-- CreateIndex
CREATE INDEX "Lead_propertyId_idx" ON "public"."Lead"("propertyId");

-- CreateIndex
CREATE INDEX "Lead_projectId_idx" ON "public"."Lead"("projectId");

-- CreateIndex
CREATE INDEX "Lead_unitId_idx" ON "public"."Lead"("unitId");

-- CreateIndex
CREATE INDEX "Lead_deletedAt_idx" ON "public"."Lead"("deletedAt");

-- CreateIndex
CREATE INDEX "Inquiry_status_idx" ON "public"."Inquiry"("status");

-- CreateIndex
CREATE INDEX "Inquiry_propertyId_idx" ON "public"."Inquiry"("propertyId");

-- CreateIndex
CREATE INDEX "Inquiry_projectId_idx" ON "public"."Inquiry"("projectId");

-- CreateIndex
CREATE INDEX "Inquiry_unitId_idx" ON "public"."Inquiry"("unitId");

-- CreateIndex
CREATE INDEX "Inquiry_leadId_idx" ON "public"."Inquiry"("leadId");

-- CreateIndex
CREATE INDEX "Inquiry_deletedAt_idx" ON "public"."Inquiry"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LeadPipelineStage_slug_key" ON "public"."LeadPipelineStage"("slug");

-- CreateIndex
CREATE INDEX "LeadPipelineStage_sortOrder_idx" ON "public"."LeadPipelineStage"("sortOrder");

-- CreateIndex
CREATE INDEX "LeadPipelineStage_deletedAt_idx" ON "public"."LeadPipelineStage"("deletedAt");

-- CreateIndex
CREATE INDEX "LeadActivity_leadId_idx" ON "public"."LeadActivity"("leadId");

-- CreateIndex
CREATE INDEX "LeadActivity_stageId_idx" ON "public"."LeadActivity"("stageId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "public"."Page"("slug");

-- CreateIndex
CREATE INDEX "Page_status_idx" ON "public"."Page"("status");

-- CreateIndex
CREATE INDEX "Page_parentId_idx" ON "public"."Page"("parentId");

-- CreateIndex
CREATE INDEX "Page_deletedAt_idx" ON "public"."Page"("deletedAt");

-- CreateIndex
CREATE INDEX "PageVersion_pageId_idx" ON "public"."PageVersion"("pageId");

-- CreateIndex
CREATE INDEX "PageVersion_createdAt_idx" ON "public"."PageVersion"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VisualPage_slug_key" ON "public"."VisualPage"("slug");

-- CreateIndex
CREATE INDEX "VisualPage_status_idx" ON "public"."VisualPage"("status");

-- CreateIndex
CREATE INDEX "VisualPage_deletedAt_idx" ON "public"."VisualPage"("deletedAt");

-- CreateIndex
CREATE INDEX "VisualPageVersion_visualPageId_idx" ON "public"."VisualPageVersion"("visualPageId");

-- CreateIndex
CREATE INDEX "VisualPageVersion_createdAt_idx" ON "public"."VisualPageVersion"("createdAt");

-- CreateIndex
CREATE INDEX "BuilderAsset_kind_idx" ON "public"."BuilderAsset"("kind");

-- CreateIndex
CREATE INDEX "BuilderAsset_key_idx" ON "public"."BuilderAsset"("key");

-- CreateIndex
CREATE INDEX "BuilderAsset_deletedAt_idx" ON "public"."BuilderAsset"("deletedAt");

-- CreateIndex
CREATE INDEX "PageSection_pageId_idx" ON "public"."PageSection"("pageId");

-- CreateIndex
CREATE INDEX "PageSection_templateId_idx" ON "public"."PageSection"("templateId");

-- CreateIndex
CREATE INDEX "PageSection_deletedAt_idx" ON "public"."PageSection"("deletedAt");

-- CreateIndex
CREATE INDEX "PageWidget_sectionId_idx" ON "public"."PageWidget"("sectionId");

-- CreateIndex
CREATE INDEX "PageWidget_widgetType_idx" ON "public"."PageWidget"("widgetType");

-- CreateIndex
CREATE INDEX "PageWidget_deletedAt_idx" ON "public"."PageWidget"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Template_slug_key" ON "public"."Template"("slug");

-- CreateIndex
CREATE INDEX "Template_type_idx" ON "public"."Template"("type");

-- CreateIndex
CREATE INDEX "Template_pageId_idx" ON "public"."Template"("pageId");

-- CreateIndex
CREATE INDEX "Template_deletedAt_idx" ON "public"."Template"("deletedAt");

-- CreateIndex
CREATE INDEX "TemplateSection_templateId_idx" ON "public"."TemplateSection"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "Widget_type_key" ON "public"."Widget"("type");

-- CreateIndex
CREATE INDEX "Widget_category_idx" ON "public"."Widget"("category");

-- CreateIndex
CREATE INDEX "Widget_deletedAt_idx" ON "public"."Widget"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "public"."Setting"("key");

-- CreateIndex
CREATE INDEX "Setting_group_idx" ON "public"."Setting"("group");

-- CreateIndex
CREATE INDEX "Setting_deletedAt_idx" ON "public"."Setting"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "NavigationMenu_slug_key" ON "public"."NavigationMenu"("slug");

-- CreateIndex
CREATE INDEX "NavigationMenu_location_idx" ON "public"."NavigationMenu"("location");

-- CreateIndex
CREATE INDEX "NavigationMenu_deletedAt_idx" ON "public"."NavigationMenu"("deletedAt");

-- CreateIndex
CREATE INDEX "NavigationMenuItem_menuId_idx" ON "public"."NavigationMenuItem"("menuId");

-- CreateIndex
CREATE INDEX "NavigationMenuItem_parentId_idx" ON "public"."NavigationMenuItem"("parentId");

-- CreateIndex
CREATE INDEX "NavigationMenuItem_deletedAt_idx" ON "public"."NavigationMenuItem"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "public"."BlogCategory"("slug");

-- CreateIndex
CREATE INDEX "BlogCategory_deletedAt_idx" ON "public"."BlogCategory"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "public"."BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_status_idx" ON "public"."BlogPost"("status");

-- CreateIndex
CREATE INDEX "BlogPost_categoryId_idx" ON "public"."BlogPost"("categoryId");

-- CreateIndex
CREATE INDEX "BlogPost_publishedAt_idx" ON "public"."BlogPost"("publishedAt");

-- CreateIndex
CREATE INDEX "BlogPost_deletedAt_idx" ON "public"."BlogPost"("deletedAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "public"."AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "public"."AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE INDEX "Session_isActive_idx" ON "public"."Session"("isActive");

-- CreateIndex
CREATE INDEX "Session_lastActivityAt_idx" ON "public"."Session"("lastActivityAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "public"."RefreshToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_jti_key" ON "public"."RefreshToken"("jti");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "public"."RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_sessionId_idx" ON "public"."RefreshToken"("sessionId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "public"."RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "RefreshToken_deletedAt_idx" ON "public"."RefreshToken"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "public"."PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "public"."PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "public"."PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "PasswordResetToken_deletedAt_idx" ON "public"."PasswordResetToken"("deletedAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "public"."Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "public"."Notification"("status");

-- CreateIndex
CREATE INDEX "Notification_deletedAt_idx" ON "public"."Notification"("deletedAt");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Role" ADD CONSTRAINT "Role_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Role" ADD CONSTRAINT "Role_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "public"."Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyCategory" ADD CONSTRAINT "PropertyCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."PropertyCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyCategory" ADD CONSTRAINT "PropertyCategory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyCategory" ADD CONSTRAINT "PropertyCategory_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."PropertyCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."PropertyCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Unit" ADD CONSTRAINT "Unit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Unit" ADD CONSTRAINT "Unit_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Unit" ADD CONSTRAINT "Unit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Unit" ADD CONSTRAINT "Unit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Unit" ADD CONSTRAINT "Unit_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."PropertyCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyAmenity" ADD CONSTRAINT "PropertyAmenity_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyAmenity" ADD CONSTRAINT "PropertyAmenity_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "public"."Amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectAmenity" ADD CONSTRAINT "ProjectAmenity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectAmenity" ADD CONSTRAINT "ProjectAmenity_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "public"."Amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UnitAmenity" ADD CONSTRAINT "UnitAmenity_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UnitAmenity" ADD CONSTRAINT "UnitAmenity_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "public"."Amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyFeatureOnProperty" ADD CONSTRAINT "PropertyFeatureOnProperty_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyFeatureOnProperty" ADD CONSTRAINT "PropertyFeatureOnProperty_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "public"."PropertyFeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyFeatureOnUnit" ADD CONSTRAINT "PropertyFeatureOnUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyFeatureOnUnit" ADD CONSTRAINT "PropertyFeatureOnUnit_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "public"."PropertyFeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Media" ADD CONSTRAINT "Media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Media" ADD CONSTRAINT "Media_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."MediaFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaFolder" ADD CONSTRAINT "MediaFolder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaFolder" ADD CONSTRAINT "MediaFolder_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaFolder" ADD CONSTRAINT "MediaFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."MediaFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaVariant" ADD CONSTRAINT "MediaVariant_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyMedia" ADD CONSTRAINT "PropertyMedia_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyMedia" ADD CONSTRAINT "PropertyMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectMedia" ADD CONSTRAINT "ProjectMedia_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectMedia" ADD CONSTRAINT "ProjectMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UnitMedia" ADD CONSTRAINT "UnitMedia_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UnitMedia" ADD CONSTRAINT "UnitMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PageMedia" ADD CONSTRAINT "PageMedia_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "public"."Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PageMedia" ADD CONSTRAINT "PageMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WidgetMedia" ADD CONSTRAINT "WidgetMedia_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "public"."Widget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WidgetMedia" ADD CONSTRAINT "WidgetMedia_pageWidgetId_fkey" FOREIGN KEY ("pageWidgetId") REFERENCES "public"."PageWidget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WidgetMedia" ADD CONSTRAINT "WidgetMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateMedia" ADD CONSTRAINT "TemplateMedia_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateMedia" ADD CONSTRAINT "TemplateMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SettingMedia" ADD CONSTRAINT "SettingMedia_settingId_fkey" FOREIGN KEY ("settingId") REFERENCES "public"."Setting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SettingMedia" ADD CONSTRAINT "SettingMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPostMedia" ADD CONSTRAINT "BlogPostMedia_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "public"."BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPostMedia" ADD CONSTRAINT "BlogPostMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lead" ADD CONSTRAINT "Lead_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lead" ADD CONSTRAINT "Lead_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lead" ADD CONSTRAINT "Lead_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "public"."LeadPipelineStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lead" ADD CONSTRAINT "Lead_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lead" ADD CONSTRAINT "Lead_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lead" ADD CONSTRAINT "Lead_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inquiry" ADD CONSTRAINT "Inquiry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inquiry" ADD CONSTRAINT "Inquiry_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inquiry" ADD CONSTRAINT "Inquiry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inquiry" ADD CONSTRAINT "Inquiry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inquiry" ADD CONSTRAINT "Inquiry_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inquiry" ADD CONSTRAINT "Inquiry_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadPipelineStage" ADD CONSTRAINT "LeadPipelineStage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadPipelineStage" ADD CONSTRAINT "LeadPipelineStage_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadActivity" ADD CONSTRAINT "LeadActivity_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "public"."LeadPipelineStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Page" ADD CONSTRAINT "Page_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Page" ADD CONSTRAINT "Page_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Page" ADD CONSTRAINT "Page_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PageVersion" ADD CONSTRAINT "PageVersion_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "public"."Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisualPage" ADD CONSTRAINT "VisualPage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisualPage" ADD CONSTRAINT "VisualPage_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisualPageVersion" ADD CONSTRAINT "VisualPageVersion_visualPageId_fkey" FOREIGN KEY ("visualPageId") REFERENCES "public"."VisualPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BuilderAsset" ADD CONSTRAINT "BuilderAsset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BuilderAsset" ADD CONSTRAINT "BuilderAsset_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PageSection" ADD CONSTRAINT "PageSection_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PageSection" ADD CONSTRAINT "PageSection_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PageSection" ADD CONSTRAINT "PageSection_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "public"."Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PageSection" ADD CONSTRAINT "PageSection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PageWidget" ADD CONSTRAINT "PageWidget_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PageWidget" ADD CONSTRAINT "PageWidget_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PageWidget" ADD CONSTRAINT "PageWidget_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."PageSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Template" ADD CONSTRAINT "Template_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Template" ADD CONSTRAINT "Template_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Template" ADD CONSTRAINT "Template_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "public"."Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateSection" ADD CONSTRAINT "TemplateSection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NavigationMenuItem" ADD CONSTRAINT "NavigationMenuItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."NavigationMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NavigationMenuItem" ADD CONSTRAINT "NavigationMenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."NavigationMenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPost" ADD CONSTRAINT "BlogPost_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPost" ADD CONSTRAINT "BlogPost_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."BlogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_replacedById_fkey" FOREIGN KEY ("replacedById") REFERENCES "public"."RefreshToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

