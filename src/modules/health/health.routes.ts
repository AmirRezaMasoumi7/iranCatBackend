import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { checkMinioHealth } from "../../lib/minio.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    let dbStatus: "ok" | "error" = "ok";

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = "error";
    }

    const minioStatus = await checkMinioHealth();
    const allHealthy = dbStatus === "ok" && minioStatus === "ok";
    const status = allHealthy ? "healthy" : "degraded";
    const statusCode = allHealthy ? 200 : 503;

    res.status(statusCode).json({
      success: allHealthy,
      data: {
        status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
          database: dbStatus,
          minio: minioStatus,
        },
      },
    });
  }),
);

export default router;
