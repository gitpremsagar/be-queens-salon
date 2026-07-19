import type { Request, Response } from "express";
export declare function getAvailability(req: Request, res: Response): Promise<void>;
export declare function createAppointment(req: Request, res: Response): Promise<void>;
export declare function getMyAppointments(req: Request, res: Response): Promise<void>;
export declare function cancelMyAppointment(req: Request, res: Response): Promise<void>;
export declare function adminListAppointments(req: Request, res: Response): Promise<void>;
export declare function adminUpdateAppointment(req: Request, res: Response): Promise<void>;
export declare function adminStats(_req: Request, res: Response): Promise<void>;
export declare function getSalonInfo(_req: Request, res: Response): Promise<void>;
//# sourceMappingURL=appointment.controller.d.ts.map