import { createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import { authConfig } from "../config/auth.config.js";
export function signAccessToken(payload) {
    const options = {
        expiresIn: authConfig.accessTokenExpiresIn,
    };
    return jwt.sign(payload, authConfig.accessTokenSecret, options);
}
export function signRefreshToken(payload) {
    const options = {
        expiresIn: authConfig.refreshTokenExpiresIn,
    };
    return jwt.sign(payload, authConfig.refreshTokenSecret, options);
}
export function verifyAccessToken(token) {
    return jwt.verify(token, authConfig.accessTokenSecret);
}
export function verifyRefreshToken(token) {
    return jwt.verify(token, authConfig.refreshTokenSecret);
}
export function hashToken(token) {
    return createHash("sha256").update(token).digest("hex");
}
export function getRefreshTokenExpiryDate() {
    return new Date(Date.now() + authConfig.refreshCookie.maxAgeMs);
}
//# sourceMappingURL=tokens.js.map