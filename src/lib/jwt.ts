const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_local_dev_only_key_12345";

// Helper to convert string to ArrayBuffer
function textToBuffer(text: string): ArrayBuffer {
  return new TextEncoder().encode(text).buffer as ArrayBuffer;
}

// Helper to convert base64url to ArrayBuffer
function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLength);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

// Helper to convert ArrayBuffer or Uint8Array to base64url
function bufferToBase64url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Sign a payload to create a JWT token (HMAC SHA-256)
 * @param payload Object payload to encode in the token
 * @param expiresInSeconds Duration in seconds for token validity (default 7 days)
 */
export async function signToken(
  payload: Record<string, any>,
  expiresInSeconds: number = 7 * 24 * 60 * 60
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };

  const encodedHeader = bufferToBase64url(textToBuffer(JSON.stringify(header)));
  const encodedPayload = bufferToBase64url(textToBuffer(JSON.stringify(fullPayload)));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    textToBuffer(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textToBuffer(signatureInput)
  );

  const encodedSignature = bufferToBase64url(signature);
  return `${signatureInput}.${encodedSignature}`;
}

/**
 * Verify a JWT token and return the decoded payload
 * @param token JWT string
 */
export async function verifyToken(token: string): Promise<Record<string, any> | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const key = await crypto.subtle.importKey(
      "raw",
      textToBuffer(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64urlToBuffer(encodedSignature),
      textToBuffer(signatureInput)
    );

    if (!isValid) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64urlToBuffer(encodedPayload)));

    // Check expiration
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null; // Token has expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}
export default { signToken, verifyToken };
