import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";

function makeClients() {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!region || !accessKeyId || !secretAccessKey) return null;
  const credentials = { accessKeyId, secretAccessKey };
  return {
    s3: new S3Client({ region, credentials }),
    cf: new CloudFrontClient({ region: "us-east-1", credentials }),
  };
}

const clients = makeClients();
export const isS3Configured = !!clients;

export async function s3Upload(key: string, body: Buffer, contentType: string): Promise<void> {
  if (!clients) throw new Error("S3 not configured");
  await clients.s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
}

export async function s3Delete(key: string): Promise<void> {
  if (!clients) return;
  try {
    await clients.s3.send(new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    }));
  } catch { /* silent — don't fail app deletes if S3 is unavailable */ }
}

// Fires a CloudFront invalidation so edge caches don't serve stale or deleted content.
export async function cfInvalidate(s3Key: string): Promise<void> {
  const distId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
  if (!clients || !distId) return;
  try {
    await clients.cf.send(new CreateInvalidationCommand({
      DistributionId: distId,
      InvalidationBatch: {
        CallerReference: String(Date.now()),
        Paths: { Quantity: 1, Items: [`/${s3Key}`] },
      },
    }));
  } catch { /* silent — invalidation failure is non-critical */ }
}

export function buildCloudFrontUrl(s3Key: string): string {
  const domain = process.env.CLOUDFRONT_DOMAIN ?? "";
  return `https://${domain}/${s3Key}`;
}
