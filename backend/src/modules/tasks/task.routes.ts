import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middlewares/validate.middleware.js";

import { taskController } from "./task.controller.js";
import {
  createTaskSchema,
  taskListQuerySchema,
  taskParamsSchema,
  updateTaskSchema,
} from "./task.validation.js";

const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.post("/", validateBody(createTaskSchema), taskController.create);

taskRouter.get("/", validateQuery(taskListQuerySchema), taskController.getAll);

taskRouter.get(
  "/:task_id",
  validateParams(taskParamsSchema),
  taskController.getById,
);

taskRouter.patch(
  "/:task_id",
  validateParams(taskParamsSchema),
  validateBody(updateTaskSchema),
  taskController.update,
);

taskRouter.delete(
  "/:task_id",
  validateParams(taskParamsSchema),
  taskController.delete,
);

export default taskRouter;
