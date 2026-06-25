import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a binary file buffer to Cloudinary using upload streams.
 * Prevents filesystem write operations, keeping the upload serverless-compatible.
 * 
 * @param fileBuffer The file buffer to upload
 * @param folder Cloudinary folder designation
 */
export async function uploadImageBuffer(
  fileBuffer: Buffer,
  folder: string = "portfolio"
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload stream error:", error);
          reject(error);
        } else if (result) {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          reject(new Error("Cloudinary returned empty result."));
        }
      }
    );
    
    uploadStream.end(fileBuffer);
  });
}

/**
 * Upload a binary document/file buffer to Cloudinary using auto resource type mapping.
 * Supports PDF, DOC, DOCX, XLS, XLSX, etc.
 * 
 * @param fileBuffer The file buffer to upload
 * @param folder Cloudinary folder designation
 * @param filename Custom public_id designation
 */
export async function uploadFileBuffer(
  fileBuffer: Buffer,
  folder: string = "inquiries",
  filename?: string
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        public_id: filename,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary file upload stream error:", error);
          reject(error);
        } else if (result) {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          reject(new Error("Cloudinary returned empty result."));
        }
      }
    );
    
    uploadStream.end(fileBuffer);
  });
}

export { cloudinary };
