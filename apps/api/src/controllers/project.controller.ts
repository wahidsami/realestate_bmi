import type { RequestHandler } from 'express';
import { ProjectService } from '../services/project.service.js';
import { HttpError } from '../utils/httpError.js';
import { projectQuerySchema } from '../validators/project.validator.js';

const projectService = new ProjectService();

const resolveProjectId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

export const listProjects: RequestHandler = async (req, res, next) => {
  try {
    const query = projectQuerySchema.parse(req.query);
    const result = await projectService.listProjects(query);
    res.json({
      success: true,
      data: result,
      message: 'Projects loaded successfully',
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById: RequestHandler = async (req, res, next) => {
  try {
    const projectId = resolveProjectId(req.params.id);
    if (!projectId) {
      throw new HttpError(400, 'Project id is required');
    }

    const project = await projectService.getProjectById(projectId);
    res.json({
      success: true,
      data: project,
      message: 'Project loaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const createProject: RequestHandler = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.auth?.id);
    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject: RequestHandler = async (req, res, next) => {
  try {
    const projectId = resolveProjectId(req.params.id);
    if (!projectId) {
      throw new HttpError(400, 'Project id is required');
    }

    const project = await projectService.updateProject(projectId, req.body, req.auth?.id);
    res.json({
      success: true,
      data: project,
      message: 'Project updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject: RequestHandler = async (req, res, next) => {
  try {
    const projectId = resolveProjectId(req.params.id);
    if (!projectId) {
      throw new HttpError(400, 'Project id is required');
    }

    const project = await projectService.deleteProject(projectId, req.auth?.id);
    res.json({
      success: true,
      data: project,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
