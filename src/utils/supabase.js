import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * Sanitize a file name to be safe for Supabase Storage.
 * Removes non-ASCII chars, replaces spaces, and keeps extension.
 * @param {string} originalName
 * @returns {string}
 */
export function sanitizeFileName(originalName) {
  const ext = path.extname(originalName); // .pdf, .docx, etc.
  const baseName = path.basename(originalName, ext);

  const asciiOnly = baseName
    .replace(/\s+/g, "_")         // spaces -> underscores
    .replace(/[^\x00-\x7F]/g, ""); // remove non-ASCII chars

  return `${Date.now()}-${asciiOnly || "file"}${ext}`;
}

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * @param {Buffer} fileBuffer
 * @param {string} fileName
 * @param {string} bucketName
 * @param {string} contentType
 * @returns {Promise<string>}
 */
export async function uploadToSupabase(fileBuffer, fileName, bucketName = "waraqi_bucket", contentType = "application/pdf") {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    return data.publicUrl;
  } catch (err) {
    console.error("Supabase upload error:", err.message);
    throw new Error("Failed to upload document to Supabase");
  }
}





/**
 * Deletes a file from Supabase Storage.
 * @param {string} fileUrlOrPath - Either the public URL or the storage path of the file.
 * @param {string} bucketName - The storage bucket name.
 */
export async function deleteFromSupabase(fileUrlOrPath, bucketName = "waraqi_bucket") {
  try {
    let filePath = fileUrlOrPath;

    // If a full public URL is provided, extract the path
    if (fileUrlOrPath.startsWith("http")) {
      const urlParts = new URL(fileUrlOrPath);
      // Supabase public URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
      const match = urlParts.pathname.match(/\/object\/public\/[^/]+\/(.+)/);
      if (match && match[1]) {
        filePath = match[1];
      }
    }

    const { error } = await supabase.storage.from(bucketName).remove([filePath]);
    if (error) throw error;

    console.log(`Deleted from Supabase: ${filePath}`);
  } catch (err) {
    console.error("Supabase delete error:", err.message);
    throw new Error("Failed to delete document from Supabase");
  }
}