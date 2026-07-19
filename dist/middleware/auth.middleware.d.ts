import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
export declare function authenticate(req: Request, res: Response, next: NextFunction): void;
export declare function authorize(...roles: Role[]): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map