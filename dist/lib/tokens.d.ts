import type { Role } from "@prisma/client";
export type AccessTokenPayload = {
    sub: string;
    email: string;
    role: Role;
};
export type RefreshTokenPayload = {
    sub: string;
};
export declare function signAccessToken(payload: AccessTokenPayload): string;
export declare function signRefreshToken(payload: RefreshTokenPayload): string;
export declare function verifyAccessToken(token: string): AccessTokenPayload;
export declare function verifyRefreshToken(token: string): RefreshTokenPayload;
export declare function hashToken(token: string): string;
export declare function getRefreshTokenExpiryDate(): Date;
//# sourceMappingURL=tokens.d.ts.map