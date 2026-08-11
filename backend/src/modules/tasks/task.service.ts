import type { Types } from "mongoose";

import type {
  TaskPriority,
  TaskStatus,
} from "../../constants/task.constants.js";
import { AppError } from "../../errors/AppError.js";

import { TaskRepository, taskRepository } from "./task.repository.js";

import type {
  CreateTaskInput,
  TaskListQuery,
  UpdateTaskInput,
} from "./task.validation.js";

interface TaskRecord {
  _id: Types.ObjectId;
  title: string;
  description: string;
  priority: TaskPriority;
  due_date: Date | null;
  status: TaskStatus;
  created_at: Date;
  updated_at: Date;
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  due_date: Date | null;
  status: TaskStatus;
  created_at: Date;
  updated_at: Date;
}

function toTaskResponse(task: TaskRecord): TaskResponse {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    priority: task.priority,
    due_date: task.due_date,
    status: task.status,
    created_at: task.created_at,
    updated_at: task.updated_at,
  };
}

export class TaskService {
  constructor(private readonly tasks: TaskRepository) {}

  async createTask(
    userId: string,
    input: CreateTaskInput,
  ): Promise<TaskResponse> {
    const task = await this.tasks.create({
      user_id: userId,
      ...input,
    });

    return toTaskResponse(task);
  }

  async getTasks(
    userId: string,
    query: TaskListQuery,
  ): Promise<TaskResponse[]> {
    const tasks = await this.tasks.findAllByUser(userId, query);

    return tasks.map(toTaskResponse);
  }

  async getTaskById(userId: string, taskId: string): Promise<TaskResponse> {
    const task = await this.tasks.findByIdForUser(taskId, userId);

    if (!task) {
      throw new AppError("Task not found", 404, "TASK_NOT_FOUND");
    }

    return toTaskResponse(task);
  }

  async updateTask(
    userId: string,
    taskId: string,
    input: UpdateTaskInput,
  ): Promise<TaskResponse> {
    const task = await this.tasks.updateByIdForUser(taskId, userId, input);

    if (!task) {
      throw new AppError("Task not found", 404, "TASK_NOT_FOUND");
    }

    return toTaskResponse(task);
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    const task = await this.tasks.deleteByIdForUser(taskId, userId);

    if (!task) {
      throw new AppError("Task not found", 404, "TASK_NOT_FOUND");
    }
  }
}

export const taskService = new TaskService(taskRepository);
