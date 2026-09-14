import "server-only";

import { createReadStream } from "node:fs";
import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type R2Config = {
  accountId: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
};

let client: S3Client | null = null;

export function getR2Config(): R2Config | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const bucket = process.env.CLOUDFLARE_R2_BUCKET?.trim();
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.trim();
  const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");

  if (!accountId || !bucket || !accessKeyId || !secretAccessKey || !publicBaseUrl) return null;
  return { accountId, bucket, accessKeyId, secretAccessKey, publicBaseUrl };
}

export function requireR2Config(): R2Config {
  const config = getR2Config();
  if (!config) throw new Error("Cloudflare R2 is not configured. Set the R2 account, bucket, credentials, and public URL.");
  return config;
}

function getClient(config: R2Config) {
  if (client) return client;
  client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
  });
  return client;
}

export async function putR2Object(input: { key: string; body: Buffer; contentType: string; contentLength: number }) {
  const config = requireR2Config();
  await getClient(config).send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: input.key,
    Body: input.body,
    ContentType: input.contentType,
    ContentLength: input.contentLength,
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return `${config.publicBaseUrl}/${input.key}`;
}

/** Stream a local file to R2 so large documents never need to be buffered in memory. */
export async function putR2File(input: { key: string; filePath: string; contentType: string; contentLength: number }) {
  const config = requireR2Config();
  await getClient(config).send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: input.key,
    Body: createReadStream(input.filePath),
    ContentType: input.contentType,
    ContentLength: input.contentLength,
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return `${config.publicBaseUrl}/${input.key}`;
}

export async function createR2UploadUrl(input: { key: string; contentType: string }) {
  const config = requireR2Config();
  const uploadUrl = await getSignedUrl(
    getClient(config),
    new PutObjectCommand({ Bucket: config.bucket, Key: input.key, ContentType: input.contentType }),
    { expiresIn: 600 },
  );
  return { uploadUrl, publicUrl: `${config.publicBaseUrl}/${input.key}` };
}

export async function hasR2Object(key: string) {
  return Boolean(await getR2ObjectMetadata(key));
}

export async function getR2ObjectMetadata(key: string) {
  const config = requireR2Config();
  try {
    const result = await getClient(config).send(new HeadObjectCommand({ Bucket: config.bucket, Key: key }));
    return { contentLength: result.ContentLength ?? 0, contentType: result.ContentType || "" };
  } catch (error) {
    if (error && typeof error === "object" && "$metadata" in error) {
      const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
      if (status === 404) return null;
    }
    throw error;
  }
}

export async function deleteR2Object(key: string) {
  const config = requireR2Config();
  await getClient(config).send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
}
