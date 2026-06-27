import crypto from "crypto";

const getEncryptionKey = (): Buffer => {
  const secret =
    process.env.OAUTH_ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    "fallback_secret_key_at_least_32_bytes_long";
  return crypto.createHash("sha256").update(secret).digest();
};

const IV_LENGTH = 12; // Standard GCM IV length

export function encryptToken(text: string): string {
  if (!text) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  // Format: iv:encrypted:authTag
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

export function decryptToken(encryptedText: string): string {
  if (!encryptedText) return "";
  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted text format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const encrypted = Buffer.from(parts[1], "hex");
    const authTag = Buffer.from(parts[2], "hex");
    const key = getEncryptionKey();

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, undefined, "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Token decryption failed:", err);
    return "";
  }
}
