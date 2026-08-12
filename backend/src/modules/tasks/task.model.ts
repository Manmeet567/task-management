import type { Types } from "mongoose";
import { Schema, model } from "mongoose";

import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "../../constants/task.constants.js";

export interface ITask {
  user_id: Types.ObjectId;
  title: string;
  description: string;
  priority: TaskPriority;
  due_date: Date | null;
  status: TaskStatus;
  created_at: Date;
  updated_at: Date;
}

const taskSchema = new Schema<ITask>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: "medium",
      required: true,
    },

    due_date: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "to_do",
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    versionKey: false,
  },
);

taskSchema.index({
  user_id: 1,
  status: 1,
});

taskSchema.index({
  user_id: 1,
  priority: 1,
});

taskSchema.index({
  user_id: 1,
  due_date: 1,
});

taskSchema.index({
  user_id: 1,
  created_at: -1,
});

export const Task = model<ITask>("Task", taskSchema);
