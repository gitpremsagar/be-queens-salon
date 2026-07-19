import { prisma } from "../../lib/prisma.js";
import { salonConfig } from "../../config/salon.config.js";
import { computeEndTime, generateCandidateSlots, getNowMinutesInSalonTimezone, getTodayInSalonTimezone, isValidDateString, isValidTimeString, rangesOverlap, timeToMinutes, weekdayForDate, } from "../../lib/slots.js";
const appointmentInclude = {
    service: {
        select: {
            id: true,
            name: true,
            slug: true,
            durationMinutes: true,
            price: true,
            category: true,
        },
    },
    user: {
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
        },
    },
};
async function getAvailableSlots(date, serviceId) {
    if (!isValidDateString(date)) {
        throw Object.assign(new Error("Invalid date"), { status: 400 });
    }
    const weekday = weekdayForDate(date);
    if (salonConfig.closedWeekdays.includes(weekday)) {
        return [];
    }
    const service = await prisma.service.findFirst({
        where: { id: serviceId, isActive: true },
    });
    if (!service) {
        throw Object.assign(new Error("Service not found"), { status: 404 });
    }
    const candidates = generateCandidateSlots(service.durationMinutes);
    const existing = await prisma.appointment.findMany({
        where: {
            date,
            status: { not: "CANCELLED" },
        },
    });
    const today = getTodayInSalonTimezone();
    const nowMinutes = getNowMinutesInSalonTimezone();
    return candidates.filter((start) => {
        const startMin = timeToMinutes(start);
        const endMin = startMin + service.durationMinutes;
        if (date < today)
            return false;
        if (date === today && startMin <= nowMinutes)
            return false;
        for (const appt of existing) {
            const aStart = timeToMinutes(appt.startTime);
            const aEnd = timeToMinutes(appt.endTime);
            if (rangesOverlap(startMin, endMin, aStart, aEnd)) {
                return false;
            }
        }
        return true;
    });
}
export async function getAvailability(req, res) {
    try {
        const date = req.query.date;
        const serviceId = req.query.serviceId;
        if (!date || !serviceId) {
            res.status(400).json({ error: "date and serviceId are required" });
            return;
        }
        const slots = await getAvailableSlots(date, serviceId);
        res.json({
            date,
            serviceId,
            slots,
            openTime: salonConfig.openTime,
            closeTime: salonConfig.closeTime,
        });
    }
    catch (error) {
        console.error(error);
        const status = typeof error === "object" &&
            error !== null &&
            "status" in error &&
            typeof error.status === "number"
            ? error.status
            : 500;
        const message = error instanceof Error ? error.message : "Failed to fetch availability";
        res.status(status).json({ error: message });
    }
}
export async function createAppointment(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const { serviceId, date, startTime, notes } = req.body;
        if (!serviceId || !date || !startTime) {
            res.status(400).json({ error: "serviceId, date, and startTime are required" });
            return;
        }
        if (!isValidDateString(date) || !isValidTimeString(startTime)) {
            res.status(400).json({ error: "Invalid date or startTime format" });
            return;
        }
        const available = await getAvailableSlots(date, serviceId);
        if (!available.includes(startTime)) {
            res.status(409).json({ error: "Selected time slot is not available" });
            return;
        }
        const service = await prisma.service.findUniqueOrThrow({
            where: { id: serviceId },
        });
        const endTime = computeEndTime(startTime, service.durationMinutes);
        const appointment = await prisma.appointment.create({
            data: {
                userId: req.user.id,
                serviceId,
                date,
                startTime,
                endTime,
                notes: notes?.trim() || null,
                status: "PENDING",
            },
            include: appointmentInclude,
        });
        res.status(201).json(appointment);
    }
    catch (error) {
        console.error(error);
        if (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002") {
            res.status(409).json({ error: "This time slot was just booked" });
            return;
        }
        const status = typeof error === "object" &&
            error !== null &&
            "status" in error &&
            typeof error.status === "number"
            ? error.status
            : 500;
        res.status(status).json({
            error: error instanceof Error ? error.message : "Failed to create appointment",
        });
    }
}
export async function getMyAppointments(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const appointments = await prisma.appointment.findMany({
            where: { userId: req.user.id },
            include: appointmentInclude,
            orderBy: [{ date: "desc" }, { startTime: "desc" }],
        });
        res.json(appointments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch appointments" });
    }
}
export async function cancelMyAppointment(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const id = req.params.id;
        const appointment = await prisma.appointment.findUnique({ where: { id } });
        if (!appointment || appointment.userId !== req.user.id) {
            res.status(404).json({ error: "Appointment not found" });
            return;
        }
        if (appointment.status === "CANCELLED") {
            res.status(400).json({ error: "Appointment already cancelled" });
            return;
        }
        if (appointment.status === "COMPLETED") {
            res.status(400).json({ error: "Completed appointments cannot be cancelled" });
            return;
        }
        const today = getTodayInSalonTimezone();
        if (appointment.date < today) {
            res.status(400).json({ error: "Past appointments cannot be cancelled" });
            return;
        }
        const updated = await prisma.appointment.update({
            where: { id },
            data: { status: "CANCELLED" },
            include: appointmentInclude,
        });
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to cancel appointment" });
    }
}
export async function adminListAppointments(req, res) {
    try {
        const date = req.query.date;
        const status = req.query.status;
        const appointments = await prisma.appointment.findMany({
            where: {
                ...(date ? { date } : {}),
                ...(status ? { status } : {}),
            },
            include: appointmentInclude,
            orderBy: [{ date: "asc" }, { startTime: "asc" }],
        });
        res.json(appointments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch appointments" });
    }
}
export async function adminUpdateAppointment(req, res) {
    try {
        const id = req.params.id;
        const { status } = req.body;
        if (!status) {
            res.status(400).json({ error: "status is required" });
            return;
        }
        const allowed = [
            "PENDING",
            "CONFIRMED",
            "COMPLETED",
            "CANCELLED",
        ];
        if (!allowed.includes(status)) {
            res.status(400).json({ error: "Invalid status" });
            return;
        }
        const appointment = await prisma.appointment.update({
            where: { id },
            data: { status },
            include: appointmentInclude,
        });
        res.json(appointment);
    }
    catch (error) {
        console.error(error);
        if (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2025") {
            res.status(404).json({ error: "Appointment not found" });
            return;
        }
        res.status(500).json({ error: "Failed to update appointment" });
    }
}
export async function adminStats(_req, res) {
    try {
        const today = getTodayInSalonTimezone();
        const [pending, todayCount, services, offers, confirmedToday] = await Promise.all([
            prisma.appointment.count({ where: { status: "PENDING" } }),
            prisma.appointment.count({
                where: { date: today, status: { not: "CANCELLED" } },
            }),
            prisma.service.count(),
            prisma.offer.count({ where: { isActive: true } }),
            prisma.appointment.count({
                where: { date: today, status: "CONFIRMED" },
            }),
        ]);
        res.json({
            pending,
            todayCount,
            confirmedToday,
            services,
            activeOffers: offers,
            today,
            salon: {
                name: salonConfig.name,
                openTime: salonConfig.openTime,
                closeTime: salonConfig.closeTime,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
}
export async function getSalonInfo(_req, res) {
    res.json({
        name: salonConfig.name,
        phone: salonConfig.phone,
        email: salonConfig.email,
        address: salonConfig.address,
        openTime: salonConfig.openTime,
        closeTime: salonConfig.closeTime,
        closedWeekdays: salonConfig.closedWeekdays,
        timezone: salonConfig.timezone,
    });
}
//# sourceMappingURL=appointment.controller.js.map