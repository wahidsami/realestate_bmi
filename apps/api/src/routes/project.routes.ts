import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validate.js';
import { createProject, deleteProject, getProjectById, listProjects, updateProject } from '../controllers/project.controller.js';
import { projectCreateSchema, projectUpdateSchema } from '../validators/project.validator.js';

export const projectRouter = Router();

projectRouter.get('/', listProjects);
projectRouter.get('/:id', getProjectById);
projectRouter.post('/', authenticate, authorize('projects.create'), validateBody(projectCreateSchema), createProject);
projectRouter.put('/:id', authenticate, authorize('projects.edit'), validateBody(projectUpdateSchema), updateProject);
projectRouter.delete('/:id', authenticate, authorize('projects.delete'), deleteProject);
