import { verifyAccessToken } from "../lib/tokens.js";
export function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid authorization header" });
        return;
    }
    const token = header.slice("Bearer ".length).trim();
    if (!token) {
        res.status(401).json({ error: "Missing access token" });
        return;
    }
    try {
        const payload = verifyAccessToken(token);
        req.user = {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid or expired access token" });
    }
}
export function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        if (roles.length > 0 && !roles.includes(req.user.role)) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }
        next();
    };
}
//# sourceMappingURL=auth.middleware.js.map