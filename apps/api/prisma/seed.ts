import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../src/config/prisma.js';
import { ensureMediaStorageLayout, buildMediaDirectory, buildMediaRelativePath } from '../src/utils/mediaStorage.js';
import { PLACEHOLDER_PROPERTY_FEATURED_MEDIA_ID, PLACEHOLDER_PROPERTY_GALLERY_MEDIA_ID } from '../../../packages/shared/src/constants/mediaPlaceholders.ts';

const permissions = [
  'properties.create',
  'properties.edit',
  'properties.delete',
  'properties.publish',
  'projects.create',
  'projects.edit',
  'projects.delete',
  'pages.create',
  'pages.edit',
  'pages.publish',
  'media.upload',
  'media.edit',
  'media.delete',
  'media.restore',
  'media.download',
  'media.manage',
  'users.create',
  'users.edit',
  'settings.edit',
  'crm.manage',
];

const cloneJson = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const SECTION_TEMPLATES: Array<{ key: string; nameAr: string; nameEn: string; category: string; descAr?: string; descEn?: string; sectionData: unknown }> = [];
const PAGE_TEMPLATES: Array<{ key: string; nameAr: string; nameEn: string; category: string; descAr?: string; descEn?: string; sections: unknown[] }> = [];

const rootPlaceholderFiles = [
  {
    id: PLACEHOLDER_PROPERTY_FEATURED_MEDIA_ID,
    sourceFile: path.resolve(process.cwd(), '..', '..', 'placeholder1.png'),
    originalName: 'placeholder1.png',
    titleAr: 'صورة افتراضية للعقار الرئيسي',
    titleEn: 'Property Featured Placeholder',
    altTextAr: 'صورة افتراضية لواجهة عقار',
    altTextEn: 'Placeholder property cover image',
  },
  {
    id: PLACEHOLDER_PROPERTY_GALLERY_MEDIA_ID,
    sourceFile: path.resolve(process.cwd(), '..', '..', 'placeholder2.png'),
    originalName: 'placeholder2.png',
    titleAr: 'صورة افتراضية للمعرض',
    titleEn: 'Property Gallery Placeholder',
    altTextAr: 'صورة افتراضية إضافية للعقار',
    altTextEn: 'Additional placeholder property image',
  },
];

const upsertPlaceholderMedia = async (params: {
  id: string;
  sourceFile: string;
  originalName: string;
  titleAr: string;
  titleEn: string;
  altTextAr: string;
  altTextEn: string;
  folderId: string;
  uploadedById: string;
}) => {
  if (!fs.existsSync(params.sourceFile)) {
    throw new Error(`Placeholder file not found: ${params.sourceFile}`);
  }

  const stats = fs.statSync(params.sourceFile);
  const extension = path.extname(params.originalName).replace('.', '').toLowerCase() || 'png';
  const storedName = `${params.id}.${extension}`;
  const finalDir = buildMediaDirectory('image', new Date(), 'properties/placeholders');
  fs.mkdirSync(finalDir, { recursive: true });
  const finalFilePath = path.join(finalDir, storedName);
  fs.copyFileSync(params.sourceFile, finalFilePath);

  const relativePath = buildMediaRelativePath('image', storedName, new Date(), 'properties/placeholders');

  await prisma.mediaAsset.upsert({
    where: { id: params.id },
    update: {
      originalName: params.originalName,
      storedName,
      filePath: relativePath,
      publicUrl: `/api/media/${params.id}/file`,
      mimeType: 'image/png',
      extension,
      category: 'IMAGE',
      fileSize: stats.size,
      titleAr: params.titleAr,
      titleEn: params.titleEn,
      altTextAr: params.altTextAr,
      altTextEn: params.altTextEn,
      folder: 'properties/placeholders',
      isPublic: true,
      uploadedById: params.uploadedById,
      folderId: params.folderId,
    },
    create: {
      id: params.id,
      originalName: params.originalName,
      storedName,
      filePath: relativePath,
      publicUrl: `/api/media/${params.id}/file`,
      mimeType: 'image/png',
      extension,
      category: 'IMAGE',
      fileSize: stats.size,
      titleAr: params.titleAr,
      titleEn: params.titleEn,
      altTextAr: params.altTextAr,
      altTextEn: params.altTextEn,
      folder: 'properties/placeholders',
      isPublic: true,
      uploadedById: params.uploadedById,
      folderId: params.folderId,
    },
  });
};

const upsertBuilderAsset = async (params: {
  kind: 'section_template' | 'page_template';
  key: string;
  nameAr: string;
  nameEn: string;
  data: unknown;
}) => {
  const existing = await prisma.builderAsset.findFirst({
    where: {
      kind: params.kind,
      key: params.key,
      deletedAt: null,
    },
  });

  const payload = {
    kind: params.kind,
    key: params.key,
    nameAr: params.nameAr,
    nameEn: params.nameEn,
    data: cloneJson(params.data) as Prisma.InputJsonValue,
  };

  if (existing) {
    await prisma.builderAsset.update({
      where: { id: existing.id },
      data: payload,
    });
    return;
  }

  await prisma.builderAsset.create({
    data: payload,
  });
};

async function main() {
  const permissionRecords = await Promise.all(
    permissions.map((key) =>
      prisma.permission.upsert({
        where: { key },
        update: {},
        create: {
          key,
          nameAr: key,
          nameEn: key,
          module: key.split('.')[0] || 'general',
        },
      }),
    ),
  );

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super-admin' },
    update: {},
    create: {
      name: 'super-admin',
      nameAr: 'مشرف عام',
      nameEn: 'Super Admin',
      descriptionAr: 'صلاحيات كاملة على المنصة',
      descriptionEn: 'Full platform access',
      isSystem: true,
    },
  });

  await Promise.all(
    permissionRecords.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      }),
    ),
  );

  const passwordHash = await bcrypt.hash('Admin@123456', 12);
  const fullName = 'Super Admin';

  const admin = await prisma.user.upsert({
    where: { email: 'admin@bmi-realestate.com' },
    update: {
      username: 'admin',
      fullName,
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash,
      isActive: true,
      status: 'ACTIVE',
      failedLoginAttempts: 0,
      lockedUntil: null,
      passwordChangedAt: null,
    },
    create: {
      email: 'admin@bmi-realestate.com',
      username: 'admin',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      fullName,
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      status: 'ACTIVE',
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: superAdminRole.id,
    },
  });

  const folders = [
    { name: 'Properties', path: 'properties', slug: 'properties' },
    { name: 'Projects', path: 'projects', slug: 'projects' },
    { name: 'Hero Sliders', path: 'hero-sliders', slug: 'hero-sliders' },
    { name: 'Blog', path: 'blog', slug: 'blog' },
    { name: 'SEO', path: 'seo', slug: 'seo' },
    { name: 'Documents', path: 'documents', slug: 'documents' },
  ];

  for (const folder of folders) {
    await prisma.mediaFolder.upsert({
      where: { path: folder.path },
      update: {
        name: folder.name,
        slug: folder.slug,
        updatedById: admin.id,
      },
      create: {
        name: folder.name,
        path: folder.path,
        slug: folder.slug,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
  }

  ensureMediaStorageLayout();

  const propertiesFolder = await prisma.mediaFolder.findFirst({
    where: { path: 'properties', deletedAt: null },
  });

  if (!propertiesFolder) {
    throw new Error('Properties media folder was not created');
  }

  for (const placeholder of rootPlaceholderFiles) {
    await upsertPlaceholderMedia({
      ...placeholder,
      folderId: propertiesFolder.id,
      uploadedById: admin.id,
    });
  }

  for (const template of SECTION_TEMPLATES) {
    await upsertBuilderAsset({
      kind: 'section_template',
      key: template.key,
      nameAr: template.nameAr,
      nameEn: template.nameEn,
      data: {
        ...cloneJson(template),
        isSystem: true,
      },
    });
  }

  for (const template of PAGE_TEMPLATES) {
    await upsertBuilderAsset({
      kind: 'page_template',
      key: template.key,
      nameAr: template.nameAr,
      nameEn: template.nameEn,
      data: {
        ...cloneJson(template),
        isSystem: true,
      },
    });
  }

  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
