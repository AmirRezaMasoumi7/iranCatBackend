import * as Minio from "minio";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

export const minioClient = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

export function buildCatImageObjectKey(oemCode: string, fileName: string): string {
  return `cats/${oemCode}/${fileName}`;
}

export function buildCatImagePublicUrl(objectKey: string): string {
  const baseUrl = env.MINIO_PUBLIC_URL.replace(/\/$/, "");
  return `${baseUrl}/${objectKey}`;
}

export function extractObjectKeyFromImageUrl(imageUrl: string): string | null {
  const baseUrl = env.MINIO_PUBLIC_URL.replace(/\/$/, "");

  if (imageUrl.startsWith(`${baseUrl}/`)) {
    return imageUrl.slice(baseUrl.length + 1);
  }

  const match = imageUrl.match(/cats\/[^?#]+/);
  return match?.[0] ?? null;
}

export async function ensureMinioBucket(): Promise<void> {
  const bucketExists = await minioClient.bucketExists(env.MINIO_BUCKET);

  if (!bucketExists) {
    await minioClient.makeBucket(env.MINIO_BUCKET);
    logger.info({ bucket: env.MINIO_BUCKET }, "MinIO bucket created");
  }
}

export async function checkMinioHealth(): Promise<"ok" | "error"> {
  try {
    const bucketExists = await minioClient.bucketExists(env.MINIO_BUCKET);
    return bucketExists ? "ok" : "error";
  } catch {
    return "error";
  }
}
