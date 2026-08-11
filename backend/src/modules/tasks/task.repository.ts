import type { QueryFilter, UpdateQuery } from "mongoose";
import { Types } from "mongoose";

import type {
  TaskPriority,
  TaskStatus,
} from "../../constants/task.constants.js";
import type { ITask } from "./task.model.js";
import { Task } from "./task.model.js";

export interface CreateTaskData {
  user_id: string;
  title: string;
  description?: string | undefined;
  priority?: TaskPriority | undefined;
  due_date?: Date | null | undefined;
  status?: TaskStatus | undefined;
}

export interface UpdateTaskData {
  title?: string | undefined;
  description?: string | undefined;
  priority?: TaskPriority | undefined;
  due_date?: Date | null | undefined;
  status?: TaskStatus | undefined;
}

export interface TaskListOptions {
  status?: TaskStatus | undefined;
  priority?: TaskPriority | undefined;
  sort_by?: "due_date" | "created_at" | undefined;
  sort_order?: "asc" | "desc" | undefined;
}

export interface TaskDashboardStats {
  total_tasks: number;

  by_status: {
    to_do: number;
    in_progress: number;
    done: number;
  };

  overdue_tasks: number;
}

type TaskEditableFields = Pick<
  ITask,
  "title" | "description" | "priority" | "due_date" | "status"
>;

export class TaskRepository {
  async create(data: CreateTaskData) {
    const task = await Task.create({
      user_id: new Types.ObjectId(data.user_id),
      title: data.title,
      description: data.description ?? "",
      priority: data.priority ?? "medium",
      due_date: data.due_date ?? null,
      status: data.status ?? "to_do",
    });

    return task.toObject();
  }
  async findAllByUser(userId: string, options: TaskListOptions = {}) {
    const filter: QueryFilter<ITask> = {
      user_id: new Types.ObjectId(userId),
    };

    if (options.status) {
      filter.status = options.status;
    }

    if (options.priority) {
      filter.priority = options.priority;
    }

    const sortField = options.sort_by ?? "created_at";

    const sortDirection: 1 | -1 = options.sort_order === "asc" ? 1 : -1;

    return Task.find(filter)
      .sort({
        [sortField]: sortDirection,
      })
      .lean()
      .exec();
  }

  async findByIdForUser(taskId: string, userId: string) {
    return Task.findOne({
      _id: new Types.ObjectId(taskId),
      user_id: new Types.ObjectId(userId),
    })
      .lean()
      .exec();
  }

  async updateByIdForUser(
    taskId: string,
    userId: string,
    data: UpdateTaskData,
  ) {
    const setFields: Partial<TaskEditableFields> = {};

    if (data.title !== undefined) {
      setFields.title = data.title;
    }

    if (data.description !== undefined) {
      setFields.description = data.description;
    }

    if (data.priority !== undefined) {
      setFields.priority = data.priority;
    }

    if (data.status !== undefined) {
      setFields.status = data.status;
    }

    if (data.due_date !== undefined) {
      setFields.due_date = data.due_date;
    }

    const update: UpdateQuery<ITask> = {
      $set: setFields,
    };

    return Task.findOneAndUpdate(
      {
        _id: new Types.ObjectId(taskId),
        user_id: new Types.ObjectId(userId),
      },
      update,
      {
        returnDocument: "after",
        runValidators: true,
      },
    )
      .lean()
      .exec();
  }

  async deleteByIdForUser(taskId: string, userId: string) {
    return Task.findOneAndDelete({
      _id: new Types.ObjectId(taskId),
      user_id: new Types.ObjectId(userId),
    })
      .lean()
      .exec();
  }

  async getDashboardByUser(userId: string): Promise<TaskDashboardStats | null> {
    const now = new Date();

    const [stats] = await Task.aggregate<TaskDashboardStats>([
      {
        $match: {
          user_id: new Types.ObjectId(userId),
        },
      },

      {
        $group: {
          _id: null,

          total_tasks: {
            $sum: 1,
          },

          to_do: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "to_do"],
                },
                1,
                0,
              ],
            },
          },

          in_progress: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "in_progress"],
                },
                1,
                0,
              ],
            },
          },

          done: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "done"],
                },
                1,
                0,
              ],
            },
          },

          overdue_tasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $ne: ["$due_date", null],
                    },
                    {
                      $lt: ["$due_date", now],
                    },
                    {
                      $ne: ["$status", "done"],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },

      {
        $project: {
          _id: 0,

          total_tasks: 1,

          by_status: {
            to_do: "$to_do",
            in_progress: "$in_progress",
            done: "$done",
          },

          overdue_tasks: 1,
        },
      },
    ]).exec();

    return stats ?? null;
  }
}

export const taskRepository = new TaskRepository();
