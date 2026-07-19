import { Router } from "express";
import { getOfferById, listOffers } from "./offer.controller.js";
const router = Router();
router.get("/", listOffers);
router.get("/:id", getOfferById);
export default router;
//# sourceMappingURL=offer.route.js.map