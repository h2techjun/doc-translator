
import { S3Client, ListBucketsCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

/**
 * 🛠️ S3 연결 진단 스크립트
 * MinIO/S3 연결 상태를 확인하고 버킷 존재 여부를 검증합니다.
 */
async function checkS3Connection() {
    console.log("🔍 [Diagnostics] Checking S3 Connection...");
    console.log(`   Endpoint: ${process.env.AWS_ENDPOINT}`);
    console.log(`   Region: ${process.env.AWS_REGION}`);
    console.log(`   Bucket: ${process.env.AWS_BUCKET_NAME}`);

    const client = new S3Client({
        region: process.env.AWS_REGION || "auto",
        endpoint: process.env.AWS_ENDPOINT,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        },
        forcePathStyle: true,
    });

    try {
        const data = await client.send(new ListBucketsCommand({}));
        console.log("✅ [Success] Connected to S3!");
        console.log("   Available Buckets:", data.Buckets?.map(b => b.Name).join(", ") || "None");

        const bucketName = process.env.AWS_BUCKET_NAME;
        if (!bucketName) {
            console.error("❌ [Error] AWS_BUCKET_NAME is not defined in .env");
            return;
        }

        const bucketExists = data.Buckets?.some(b => b.Name === bucketName);
        if (bucketExists) {
            console.log(`✅ [Verified] Target bucket '${bucketName}' exists.`);
        } else {
            console.warn(`⚠️ [Warning] Bucket '${bucketName}' does not exist. Attempting creation...`);
            try {
                await client.send(new CreateBucketCommand({ Bucket: bucketName }));
                console.log(`✅ [Created] Bucket '${bucketName}' has been created successfully.`);
            } catch (createError) {
                console.error(`❌ [Failed] Could not create bucket '${bucketName}':`, createError);
            }
        }

    } catch (error) {
        console.error("❌ [Fatal] S3 Connection Failed:", error);
    }
}

checkS3Connection();
