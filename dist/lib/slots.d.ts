export declare function timeToMinutes(time: string): number;
export declare function minutesToTime(total: number): string;
export declare function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean;
export declare function getTodayInSalonTimezone(): string;
export declare function getNowMinutesInSalonTimezone(): number;
export declare function weekdayForDate(dateStr: string): number;
export declare function isValidDateString(date: string): boolean;
export declare function isValidTimeString(time: string): boolean;
export declare function computeEndTime(startTime: string, durationMinutes: number): string;
export declare function generateCandidateSlots(durationMinutes: number): string[];
export declare function slugify(name: string): string;
//# sourceMappingURL=slots.d.ts.map