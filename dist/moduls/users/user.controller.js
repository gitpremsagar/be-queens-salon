import { prisma } from "../../lib/prisma.js";
export async function getUsers(_req, res) {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
}
//# sourceMappingURL=user.controller.js.map