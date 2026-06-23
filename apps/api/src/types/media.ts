export type MediaCategory =
  | 'image'
  | 'video'
  | 'document'
  | 'floorplan'
  | 'avatar'
  | 'blog'
  | 'seo'
  | 'gallery'
  | 'other';

export type MediaVariantKey = 'thumbnail' | 'medium' | 'large' | 'web';

export type MediaSortField = 'createdAt' | 'updatedAt' | 'originalName' | 'fileSize';
