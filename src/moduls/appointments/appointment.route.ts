import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  cancelMyAppointment,
  createAppointment,
  getAvailability,
  getMyAppointments,
} from "./appointment.controller.js";

const router = Router();

router.get("/availability", getAvailability);
router.post("/", authenticate, createAppointment);
router.get("/me", authenticate, getMyAppointments);
router.patch("/:id/cancel", authenticate, cancelMyAppointment);

export default router;
