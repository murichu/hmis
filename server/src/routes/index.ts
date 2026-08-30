import { Router } from "express";

import { authRouter } from "../modules/auth/index.js";
import { departmentsRouter } from "../modules/departments/index.js";
import { facilitiesRouter } from "../modules/facilities/index.js";
import { usersRouter } from "../modules/users/index.js";

export const apiRouter = Router();

apiRouter.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/facilities", facilitiesRouter);
apiRouter.use("/departments", departmentsRouter);
apiRouter.use("/users", usersRouter);
