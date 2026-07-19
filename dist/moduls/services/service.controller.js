import { prisma } from "../../lib/prisma.js";
import { slugify } from "../../lib/slots.js";
const publicSelect = {
    id: true,
    name: true,
    slug: true,
    description: true,
    category: true,
    durationMinutes: true,
    price: true,
    imageUrl: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
};
export async function listServices(req, res) {
    try {
        const category = req.query.category;
        const services = await prisma.service.findMany({
            where: {
                isActive: true,
                ...(category ? { category } : {}),
            },
            select: publicSelect,
            orderBy: { name: "asc" },
        });
        res.json(services);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch services" });
    }
}
export async function getServiceBySlug(req, res) {
    try {
        const slug = req.params.slug;
        const service = await prisma.service.findFirst({
            where: { slug, isActive: true },
            select: publicSelect,
        });
        if (!service) {
            res.status(404).json({ error: "Service not found" });
            return;
        }
        res.json(service);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch service" });
    }
}
export async function adminListServices(_req, res) {
    try {
        const services = await prisma.service.findMany({
            select: publicSelect,
            orderBy: { name: "asc" },
        });
        res.json(services);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch services" });
    }
}
export async function adminCreateService(req, res) {
    try {
        const { name, description, category, durationMinutes, price, imageUrl, isActive, slug: customSlug, } = req.body;
        if (!name || !description || !category || !durationMinutes || price == null) {
            res.status(400).json({ error: "Missing required service fields" });
            return;
        }
        const slug = customSlug?.trim() || slugify(name);
        const service = await prisma.service.create({
            data: {
                name,
                slug,
                description,
                category,
                durationMinutes: Number(durationMinutes),
                price: Number(price),
                imageUrl: imageUrl || null,
                isActive: isActive ?? true,
            },
            select: publicSelect,
        });
        res.status(201).json(service);
    }
    catch (error) {
        console.error(error);
        if (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002") {
            res.status(409).json({ error: "Service slug already exists" });
            return;
        }
        res.status(500).json({ error: "Failed to create service" });
    }
}
export async function adminUpdateService(req, res) {
    try {
        const id = req.params.id;
        const body = req.body;
        const service = await prisma.service.update({
            where: { id },
            data: {
                ...(body.name !== undefined ? { name: body.name } : {}),
                ...(body.description !== undefined ? { description: body.description } : {}),
                ...(body.category !== undefined ? { category: body.category } : {}),
                ...(body.durationMinutes !== undefined
                    ? { durationMinutes: Number(body.durationMinutes) }
                    : {}),
                ...(body.price !== undefined ? { price: Number(body.price) } : {}),
                ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {}),
                ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
                ...(body.slug !== undefined ? { slug: body.slug } : {}),
            },
            select: publicSelect,
        });
        res.json(service);
    }
    catch (error) {
        console.error(error);
        if (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2025") {
            res.status(404).json({ error: "Service not found" });
            return;
        }
        res.status(500).json({ error: "Failed to update service" });
    }
}
export async function adminDeleteService(req, res) {
    try {
        const id = req.params.id;
        await prisma.service.delete({ where: { id } });
        res.json({ message: "Service deleted" });
    }
    catch (error) {
        console.error(error);
        if (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2025") {
            res.status(404).json({ error: "Service not found" });
            return;
        }
        res.status(500).json({ error: "Failed to delete service" });
    }
}
//# sourceMappingURL=service.controller.js.map