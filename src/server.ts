import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authConfig } from "./config/auth.config.js";
import authRoutes from "./moduls/auth/auth.route.js";
import userRoutes from "./moduls/users/user.route.js";
import serviceRoutes from "./moduls/services/service.route.js";
import offerRoutes from "./moduls/offers/offer.route.js";
import appointmentRoutes from "./moduls/appointments/appointment.route.js";
import adminRoutes from "./moduls/admin/admin.route.js";
import { getSalonInfo } from "./moduls/appointments/appointment.controller.js";

const app = express();

app.use(
  cors({
    origin: authConfig.clientOrigin,
    methods: ["GET", "POST", "PUT","PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({ name: "Queen's Beauty Salon and Spa API", status: "ok" });
});

app.get("/salon", getSalonInfo);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/services", serviceRoutes);
app.use("/offers", offerRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/admin", adminRoutes);

app.listen(4000, () => {
  console.log("Server is running on port 4000\nhttp://localhost:4000");
});
