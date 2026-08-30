import { Router } from "express";

import { requireAuth, requirePermission } from "../../middlewares/index.js";
import {
  createDepartmentHandler,
  deleteDepartmentHandler,
  getDepartmentHandler,
  listDepartmentsHandler,
  updateDepartmentHandler,
} from "./departments.controller.js";

export const departmentsRouter = Router();

departmentsRouter.use(requireAuth);

departmentsRouter.get(
  "/",
  requirePermission("department", "read"),
  listDepartmentsHandler,
);

departmentsRouter.get(
  "/:departmentId",
  requirePermission("department", "read"),
  getDepartmentHandler,
);

departmentsRouter.post(
  "/",
  requirePermission("department", "create"),
  createDepartmentHandler,
);

departmentsRouter.patch(
  "/:departmentId",
  requirePermission("department", "update"),
  updateDepartmentHandler,
);

departmentsRouter.delete(
  "/:departmentId",
  requirePermission("department", "delete"),
  deleteDepartmentHandler,
);
