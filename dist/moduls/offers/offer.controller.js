import { prisma } from "../../lib/prisma.js";
const offerSelect = {
    id: true,
    title: true,
    description: true,
    discountPercent: true,
    discountAmount: true,
    validFrom: true,
    validTo: true,
    imageUrl: true,
    isActive: true,
    serviceIds: true,
    createdAt: true,
    updatedAt: true,
};
export async function listOffers(_req, res) {
    try {
        const now = new Date();
        const offers = await prisma.offer.findMany({
            where: {
                isActive: true,
                validFrom: { lte: now },
                validTo: { gte: now },
            },
            select: offerSelect,
            orderBy: { validTo: "asc" },
        });
        res.json(offers);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch offers" });
    }
}
export async function getOfferById(req, res) {
    try {
        const id = req.params.id;
        const now = new Date();
        const offer = await prisma.offer.findFirst({
            where: {
                id,
                isActive: true,
                validFrom: { lte: now },
                validTo: { gte: now },
            },
            select: offerSelect,
        });
        if (!offer) {
            res.status(404).json({ error: "Offer not found" });
            return;
        }
        res.json(offer);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch offer" });
    }
}
export async function adminListOffers(_req, res) {
    try {
        const offers = await prisma.offer.findMany({
            select: offerSelect,
            orderBy: { createdAt: "desc" },
        });
        res.json(offers);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch offers" });
    }
}
export async function adminCreateOffer(req, res) {
    try {
        const { title, description, discountPercent, discountAmount, validFrom, validTo, imageUrl, isActive, serviceIds, } = req.body;
        if (!title || !description || !validFrom || !validTo) {
            res.status(400).json({ error: "Missing required offer fields" });
            return;
        }
        const offer = await prisma.offer.create({
            data: {
                title,
                description,
                discountPercent: discountPercent === undefined || discountPercent === null
                    ? null
                    : Number(discountPercent),
                discountAmount: discountAmount === undefined || discountAmount === null
                    ? null
                    : Number(discountAmount),
                validFrom: new Date(validFrom),
                validTo: new Date(validTo),
                imageUrl: imageUrl || null,
                isActive: isActive ?? true,
                serviceIds: serviceIds ?? [],
            },
            select: offerSelect,
        });
        res.status(201).json(offer);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create offer" });
    }
}
export async function adminUpdateOffer(req, res) {
    try {
        const id = req.params.id;
        const body = req.body;
        const offer = await prisma.offer.update({
            where: { id },
            data: {
                ...(body.title !== undefined ? { title: body.title } : {}),
                ...(body.description !== undefined ? { description: body.description } : {}),
                ...(body.discountPercent !== undefined
                    ? {
                        discountPercent: body.discountPercent === null ? null : Number(body.discountPercent),
                    }
                    : {}),
                ...(body.discountAmount !== undefined
                    ? {
                        discountAmount: body.discountAmount === null ? null : Number(body.discountAmount),
                    }
                    : {}),
                ...(body.validFrom !== undefined
                    ? { validFrom: new Date(body.validFrom) }
                    : {}),
                ...(body.validTo !== undefined ? { validTo: new Date(body.validTo) } : {}),
                ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {}),
                ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
                ...(body.serviceIds !== undefined ? { serviceIds: body.serviceIds } : {}),
            },
            select: offerSelect,
        });
        res.json(offer);
    }
    catch (error) {
        console.error(error);
        if (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2025") {
            res.status(404).json({ error: "Offer not found" });
            return;
        }
        res.status(500).json({ error: "Failed to update offer" });
    }
}
export async function adminDeleteOffer(req, res) {
    try {
        const id = req.params.id;
        await prisma.offer.delete({ where: { id } });
        res.json({ message: "Offer deleted" });
    }
    catch (error) {
        console.error(error);
        if (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2025") {
            res.status(404).json({ error: "Offer not found" });
            return;
        }
        res.status(500).json({ error: "Failed to delete offer" });
    }
}
//# sourceMappingURL=offer.controller.js.map