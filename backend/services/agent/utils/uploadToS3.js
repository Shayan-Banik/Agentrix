import dotenv from "dotenv";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";

dotenv.config();

export const uploadToS3 = async (filename, buffer, contentType) => {
    await s3.send(
        new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: filename,
            Body: buffer,
            ContentType: contentType
        })
    )
    return filename;
}