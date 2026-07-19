import "dotenv/config";
function parseWeekdays(value) {
    if (!value)
        return [0];
    return value
        .split(",")
        .map((part) => Number(part.trim()))
        .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
}
export const salonConfig = {
    name: "Queen's Beauty Salon and Spa",
    openTime: process.env.SALON_OPEN_TIME ?? "10:00",
    closeTime: process.env.SALON_CLOSE_TIME ?? "19:00",
    slotIntervalMinutes: Number(process.env.SALON_SLOT_INTERVAL_MINUTES ?? 30),
    closedWeekdays: parseWeekdays(process.env.SALON_CLOSED_WEEKDAYS),
    timezone: process.env.SALON_TIMEZONE ?? "Asia/Kolkata",
    phone: process.env.SALON_PHONE ?? "+91 98765 43210",
    email: process.env.SALON_EMAIL ?? "hello@queensbeauty.salon",
    address: process.env.SALON_ADDRESS ??
        "12 Rosewood Lane, Bandra West, Mumbai 400050",
};
//# sourceMappingURL=salon.config.js.map