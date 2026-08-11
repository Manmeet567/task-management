import type { Request, Response } from "express";

import { AppError } from "../../errors/AppError.js";
import { sendSuccess } from "../../utils/api-response.js";

import { TaskService, taskService } from "./task.service.js";

import type {
  CreateTaskInput,
  TaskListQuery,
  TaskParams,
  UpdateTaskInput,
} from "./task.validation.js";

type CreateTaskRequest = Request<
  Record<string, never>,
  unknown,
  CreateTaskInput
>;

type GetTasksRequest = Request<
  Record<string, never>,
  unknown,
  unknown,
  TaskListQuery
>;

type TaskByIdRequest = Request<TaskParams>;

type UpdateTaskRequest = Request<TaskParams, unknown, UpdateTaskInput>;

function getAuthenticatedUserId(req: Request): string {
  const userId = req.auth?.user_id;

  if (!userId) {
    throw new AppError(
      "Authentication required",
      401,
      "AUTHENTICATION_REQUIRED",
    );
  }

  return userId;
}

export class TaskController {
  constructor(private readonly service: TaskService) {}

  create = async (req: CreateTaskRequest, res: Response): Promise<void> => {
    const userId = getAuthenticatedUserId(req);

    const task = await this.service.createTask(userId, req.body);

    sendSuccess(res, 201, "Task created successfully", task);
  };

  getAll = async (req: GetTasksRequest, res: Response): Promise<void> => {
    const userId = getAuthenticatedUserId(req);

    const tasks = await this.service.getTasks(userId, req.query);

    sendSuccess(res, 200, "Tasks fetched successfully", tasks);
  };

  getById = async (req: TaskByIdRequest, res: Response): Promise<void> => {
    const userId = getAuthenticatedUserId(req);

    const task = await this.service.getTaskById(userId, req.params.task_id);

    sendSuccess(res, 200, "Task fetched successfully", task);
  };

  update = async (req: UpdateTaskRequest, res: Response): Promise<void> => {
    const userId = getAuthenticatedUserId(req);

    const task = await this.service.updateTask(
      userId,
      req.params.task_id,
      req.body,
    );

    sendSuccess(res, 200, "Task updated successfully", task);
  };

  delete = async (req: TaskByIdRequest, res: Response): Promise<void> => {
    const userId = getAuthenticatedUserId(req);

    await this.service.deleteTask(userId, req.params.task_id);

    sendSuccess(res, 200, "Task deleted successfully", null);
  };

  getDashboard = async (req: Request, res: Response): Promise<void> => {
    const userId = getAuthenticatedUserId(req);

    const dashboard = await this.service.getDashboard(userId);

    sendSuccess(res, 200, "Dashboard fetched successfully", dashboard);
  };
}

export const taskController = new TaskController(taskService);
