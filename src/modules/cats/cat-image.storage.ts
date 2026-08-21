import sharp from "sharp";
import { env } from "../../config/env.js";
import {
  buildCatImageObjectKey,
  buildCatImagePublicUrl,
  minioClient,
} from "../../lib/minio.js";
import { AppError } from "../../middleware/errorHandler.js";

export async function processImageToWebp(fileBuffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(fileBuffer)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw new AppError(400, "Invalid image file", "INVALID_IMAGE");
  }
}

export async function uploadWebpToMinio(
  oemCode: string,
  fileName: string,
  webpBuffer: Buffer,
): Promise<{ objectKey: string; imageUrl: string }> {
  const objectKey = buildCatImageObjectKey(oemCode, fileName);

  try {
    await minioClient.putObject(
      env.MINIO_BUCKET,
      objectKey,
      webpBuffer,
      webpBuffer.length,
      { "Content-Type": "image/webp" },
    );
  } catch {
    throw new AppError(502, "Failed to upload image to storage", "MINIO_UPLOAD_FAILED");
  }

  return {
    objectKey,
    imageUrl: buildCatImagePublicUrl(objectKey),
  };
}

export async function deleteMinioObjects(objectKeys: string[]): Promise<void> {
  await Promise.all(
    objectKeys.map((objectKey) =>
      minioClient.removeObject(env.MINIO_BUCKET, objectKey).catch(() => undefined),
    ),
  );
}
