import { Router } from "express";
import { getServiceBySlug, listServices, } from "./service.controller.js";
const router = Router();
router.get("/", listServices);
router.get("/:slug", getServiceBySlug);
export default router;
//# sourceMappingURL=service.route.js.map