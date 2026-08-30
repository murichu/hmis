import { Router } from "express";

import { requireAuth, requirePermission } from "../../middlewares/index.js";
import {
  archiveFacilityHandler,
  createFacilityHandler,
  getFacilityHandler,
  listFacilitiesHandler,
  updateFacilityHandler,
} from "./facilities.controller.js";

export const facilitiesRouter = Router();

facilitiesRouter.use(requireAuth);

facilitiesRouter.get(
  "/",
  requirePermission("facility", "read"),
  listFacilitiesHandler,
);

facilitiesRouter.get(
  "/:facilityId",
  requirePermission("facility", "read"),
  getFacilityHandler,
);

facilitiesRouter.post(
  "/",
  requirePermission("facility", "create"),
  createFacilityHandler,
);

facilitiesRouter.patch(
  "/:facilityId",
  requirePermission("facility", "update"),
  updateFacilityHandler,
);

facilitiesRouter.delete(
  "/:facilityId",
  requirePermission("facility", "delete"),
  archiveFacilityHandler,
);
