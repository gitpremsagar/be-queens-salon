import type { Request, Response } from "express";
import type { ServiceCategory } from "@prisma/client";
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
} as const;

export async function listServices(req: Request, res: Response) {
  try {
    const category = req.query.category as ServiceCategory | undefined;
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
      },
      select: publicSelect,
      orderBy: { name: "asc" },
    });
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
}

export async function getServiceBySlug(req: Request, res: Response) {
  try {
    const slug = req.params.slug as string;
    const service = await prisma.service.findFirst({
      where: { slug, isActive: true },
      select: publicSelect,
    });
    if (!service) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch service" });
  }
}

export async function adminListServices(_req: Request, res: Response) {
  try {
    const services = await prisma.service.findMany({
      select: publicSelect,
      orderBy: { name: "asc" },
    });
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
}

export async function adminCreateService(req: Request, res: Response) {
  try {
    const {
      name,
      description,
      category,
      durationMinutes,
      price,
      imageUrl,
      isActive,
      slug: customSlug,
    } = req.body as {
      name?: string;
      description?: string;
      category?: ServiceCategory;
      durationMinutes?: number;
      price?: number;
      imageUrl?: string;
      isActive?: boolean;
      slug?: string;
    };

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
  } catch (error: unknown) {
    console.error(error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      res.status(409).json({ error: "Service slug already exists" });
      return;
    }
    res.status(500).json({ error: "Failed to create service" });
  }
}

export async function adminUpdateService(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const body = req.body as Partial<{
      name: string;
      description: string;
      category: ServiceCategory;
      durationMinutes: number;
      price: number;
      imageUrl: string | null;
      isActive: boolean;
      slug: string;
    }>;

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
  } catch (error: unknown) {
    console.error(error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    res.status(500).json({ error: "Failed to update service" });
  }
}

export async function adminDeleteService(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await prisma.service.delete({ where: { id } });
    res.json({ message: "Service deleted" });
  } catch (error: unknown) {
    console.error(error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    res.status(500).json({ error: "Failed to delete service" });
  }
}
