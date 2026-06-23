/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectRepository } from './ProjectRepository';
import { ApiPropertyRepository } from './ApiPropertyRepository';
import { InquiryRepository } from './InquiryRepository';
import { SettingsRepository } from './SettingsRepository';
import { PageRepository } from './PageRepository';
import { MediaRepository } from './MediaRepository';
import { AuthRepository } from './AuthRepository';
import { VisualPagesRepository } from './VisualPagesRepository';
export * from './contracts';

export { ProjectRepository } from './ProjectRepository';
export { ApiPropertyRepository } from './ApiPropertyRepository';
export { PropertyRepository } from './PropertyRepository';
export { InquiryRepository } from './InquiryRepository';
export { SettingsRepository } from './SettingsRepository';
export { PageRepository } from './PageRepository';
export { MediaRepository } from './MediaRepository';
export { AuthRepository } from './AuthRepository';
export { VisualPagesRepository } from './VisualPagesRepository';

// Singleton Instances mimicking database connections
export const projectRepository = new ProjectRepository();
export const propertyRepository = new ApiPropertyRepository();
export const inquiryRepository = new InquiryRepository();
export const settingsRepository = new SettingsRepository();
export const pageRepository = new PageRepository();
export const mediaRepository = new MediaRepository();
export const authRepository = new AuthRepository();
export const visualPagesRepository = new VisualPagesRepository();
