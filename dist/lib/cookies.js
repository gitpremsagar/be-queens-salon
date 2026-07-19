import { authConfig } from "../config/auth.config.js";
export function setRefreshTokenCookie(res, token) {
    const { refreshCookie } = authConfig;
    res.cookie(refreshCookie.name, token, {
        httpOnly: refreshCookie.httpOnly,
        secure: refreshCookie.secure,
        sameSite: refreshCookie.sameSite,
        path: refreshCookie.path,
        maxAge: refreshCookie.maxAgeMs,
    });
}
export function clearRefreshTokenCookie(res) {
    const { refreshCookie } = authConfig;
    res.clearCookie(refreshCookie.name, {
        httpOnly: refreshCookie.httpOnly,
        secure: refreshCookie.secure,
        sameSite: refreshCookie.sameSite,
        path: refreshCookie.path,
    });
}
//# sourceMappingURL=cookies.js.map