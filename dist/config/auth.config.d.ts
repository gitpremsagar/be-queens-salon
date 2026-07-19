import "dotenv/config";
export declare const authConfig: {
    readonly accessTokenSecret: string;
    readonly refreshTokenSecret: string;
    readonly accessTokenExpiresIn: string;
    readonly refreshTokenExpiresIn: string;
    readonly refreshCookie: {
        readonly name: string;
        readonly maxAgeMs: number;
        readonly httpOnly: true;
        readonly secure: boolean;
        readonly sameSite: "strict" | "lax" | "none";
        readonly path: "/auth";
    };
    readonly clientOrigin: string;
};
//# sourceMappingURL=auth.config.d.ts.map