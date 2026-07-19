import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { getUsers } from "./user.controller.js";
const router = Router();
router.get("/", authenticate, authorize("ADMIN"), getUsers);
export default router;
//# sourceMappingURL=user.route.js.map