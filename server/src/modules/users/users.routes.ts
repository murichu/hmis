import { Router } from "express";

import { requireAuth, requirePermission } from "../../middlewares/index.js";
import {
  createUserHandler,
  getUserHandler,
  listUsersHandler,
  updateUserHandler,
} from "./users.controller.js";

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get("/", requirePermission("user", "read"), listUsersHandler);

usersRouter.get("/:userId", requirePermission("user", "read"), getUserHandler);

usersRouter.post("/", requirePermission("user", "create"), createUserHandler);

usersRouter.patch(
  "/:userId",
  requirePermission("user", "update"),
  updateUserHandler,
);
