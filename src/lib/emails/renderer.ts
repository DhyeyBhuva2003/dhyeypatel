import { IBrandSetting } from "@/models/BrandSetting";
import { ISubscriber } from "@/models/Subscriber";

export interface EmailBlock {
  type: string;
  content?: string;
  title?: string;
  url?: string;
  imageUrl?: string;
  altText?: string;
  buttonText?: string;
  color?: string;
  textColor?: string;
  align?: "left" | "center" | "right";
  items?: Array<{ name: string; value?: string; description?: string }>;
  columns?: EmailBlock[][];
  alertType?: "info" | "warning" | "success" | "danger";
  styles?: Record<string, string>;
}

/**
 * Resolves a nested dot-notation path inside an object
 */
export function resolvePath(obj: any, path: string, fallback: any = ""): any {
  if (!path) return fallback;
  
  // Handle default value syntax: variable || "default"
  if (path.includes("||")) {
    const parts = path.split("||");
    const val = resolvePath(obj, parts[0].trim(), "");
    if (val) return val;
    // Strip quotes from fallback
    const rawFallback = parts[1].trim();
    if (rawFallback.startsWith('"') && rawFallback.endsWith('"')) {
      return rawFallback.slice(1, -1);
    }
    if (rawFallback.startsWith("'") && rawFallback.endsWith("'")) {
      return rawFallback.slice(1, -1);
    }
    return rawFallback;
  }

  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined) {
      return fallback;
    }
    // Handle Map objects if present
    if (current instanceof Map) {
      current = current.get(key);
    } else {
      current = current[key];
    }
  }
  return current !== undefined && current !== null ? current : fallback;
}

/**
 * Escape HTML special character tags to preventStored XSS / HTML Injection.
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (m) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;"
    };
    return map[m];
  });
}

/**
 * Compiles and interpolates variables, conditionals, and loops in a string
 */
export function interpolateVariables(template: string, context: any): string {
  let result = template;

  // 1. Process Conditionals: {{#if variable}} content {{else}} content2 {{/if}}
  const ifRegex = /\{\{\s*#if\s+([a-zA-Z0-9_\.\s\|'"]+)\s*\}\}([\s\S]*?)(?:\{\{\s*else\s*\}\}([\s\S]*?))?\{\{\s*\/if\s*\}\}/g;
  let ifMatch;
  while ((ifMatch = ifRegex.exec(result)) !== null) {
    const fullMatch = ifMatch[0];
    const variablePath = ifMatch[1].trim();
    const thenBlock = ifMatch[2];
    const elseBlock = ifMatch[3] || "";

    const conditionValue = resolvePath(context, variablePath, null);
    const replacement = conditionValue ? thenBlock : elseBlock;

    result = result.replace(fullMatch, replacement);
    // Reset index since string length changed
    ifRegex.lastIndex = 0;
  }

  // 2. Process Loops: {{#each array}} content {{/each}}
  const eachRegex = /\{\{\s*#each\s+([a-zA-Z0-9_\.]+)\s*\}\}([\s\S]*?)\{\{\s*\/each\s*\}\}/g;
  let eachMatch;
  while ((eachMatch = eachRegex.exec(result)) !== null) {
    const fullMatch = eachMatch[0];
    const arrayPath = eachMatch[1].trim();
    const loopBlock = eachMatch[2];

    const list = resolvePath(context, arrayPath, []);
    let loopReplacement = "";

    if (Array.isArray(list)) {
      list.forEach((item) => {
        // Create an item-specific context merged with parent context
        const itemContext = typeof item === "object" ? { ...context, this: item, ...item } : { ...context, this: item };
        loopReplacement += interpolateVariables(loopBlock, itemContext);
      });
    }

    result = result.replace(fullMatch, loopReplacement);
    eachRegex.lastIndex = 0;
  }

  // 3. Process Standard Placeholders: {{variable}}
  const placeholderRegex = /\{\{\s*([a-zA-Z0-9_\.\s\|'"]+)\s*\}\}/g;
  let placeholderMatch;
  while ((placeholderMatch = placeholderRegex.exec(result)) !== null) {
    const fullMatch = placeholderMatch[0];
    const path = placeholderMatch[1].trim();
    const value = resolvePath(context, path, "");
    result = result.replace(fullMatch, escapeHtml(String(value)));
    placeholderRegex.lastIndex = 0;
  }

  return result;
}

/**
 * Converts block layouts to email client-compatible tables
 */
export function generateBlockHtml(block: EmailBlock, brand: IBrandSetting): string {
  const primaryColor = brand.primaryColor || "#4f46e5";
  const secondaryColor = brand.secondaryColor || "#475569";
  const accentColor = brand.accentColor || "#2563eb";
  const copyright = brand.copyright || `© ${new Date().getFullYear()} ${brand.brandName}. All rights reserved.`;
  const address = brand.address || "";

  switch (block.type) {
    case "header": {
      const logoHtml = brand.logoUrl 
        ? `<img src="${brand.logoUrl}" alt="${brand.brandName} Logo" style="max-height: 48px; border: 0; outline: none; display: block; margin: 0 auto;" />`
        : `<h2 style="margin: 0; font-size: 20px; font-weight: 800; color: ${primaryColor}; text-align: center;">${brand.brandName}</h2>`;
      return `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; padding: 24px 0; border-bottom: 1px solid #f1f5f9;">
          <tr>
            <td align="center" style="font-family: sans-serif;">
              <a href="${brand.website}" target="_blank" style="text-decoration: none;">
                ${logoHtml}
              </a>
            </td>
          </tr>
        </table>
      `;
    }
    case "hero": {
      return `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%); padding: 48px 32px; border-radius: 12px; margin-bottom: 24px;">
          <tr>
            <td align="center" style="font-family: sans-serif; color: #ffffff;">
              <h1 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 800; line-height: 1.25; letter-spacing: -0.5px;">${block.title || "Welcome"}</h1>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: rgba(255,255,255,0.9); max-width: 480px;">${block.content || ""}</p>
              ${
                block.buttonText && block.url
                  ? `<table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" bgcolor="#ffffff" style="border-radius: 6px;">
                          <a href="${block.url}" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 700; color: ${primaryColor}; text-decoration: none; border-radius: 6px;">${block.buttonText}</a>
                        </td>
                      </tr>
                    </table>`
                  : ""
              }
            </td>
          </tr>
        </table>
      `;
    }
    case "text": {
      const textAlign = block.align || "left";
      return `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
          <tr>
            <td align="${textAlign}" style="font-family: sans-serif; font-size: 15px; line-height: 1.6; color: ${secondaryColor};">
              ${block.content || ""}
            </td>
          </tr>
        </table>
      `;
    }
    case "image": {
      return `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
          <tr>
            <td align="${block.align || "center"}">
              ${
                block.url
                  ? `<a href="${block.url}" target="_blank">`
                  : ""
              }
              <img src="${block.imageUrl || ""}" alt="${block.altText || "Image"}" style="max-width: 100%; height: auto; border: 0; outline: none; border-radius: 8px; display: block;" />
              ${
                block.url
                  ? `</a>`
                  : ""
              }
              ${
                block.content
                  ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b; font-family: sans-serif; text-align: center;">${block.content}</p>`
                  : ""
              }
            </td>
          </tr>
        </table>
      `;
    }
    case "button": {
      const btnBg = block.color || primaryColor;
      const btnColor = block.textColor || "#ffffff";
      return `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
          <tr>
            <td align="${block.align || "center"}">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="${btnBg}" style="border-radius: 6px;">
                    <a href="${block.url || "#"}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 700; color: ${btnColor}; text-decoration: none; border-radius: 6px; border: 1px solid ${btnBg};">
                      ${block.buttonText || "Click Here"}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
    }
    case "divider": {
      return `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
          <tr>
            <td style="border-top: 1px solid #e2e8f0; height: 1px; line-height: 1px; font-size: 1px;">&nbsp;</td>
          </tr>
        </table>
      `;
    }
    case "table": {
      let rowsHtml = "";
      if (block.items) {
        block.items.forEach((item) => {
          rowsHtml += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 12px; font-family: sans-serif; font-size: 14px; font-weight: 600; color: #1e293b;">${item.name}</td>
              <td align="right" style="padding: 10px 12px; font-family: sans-serif; font-size: 14px; color: ${secondaryColor};">${item.value || ""}</td>
            </tr>
          `;
        });
      }
      return `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px; overflow: hidden;">
          ${
            block.title
              ? `<thead>
                  <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                    <th colspan="2" align="left" style="padding: 12px; font-family: sans-serif; font-size: 14px; font-weight: 800; color: #0f172a;">${block.title}</th>
                  </tr>
                </thead>`
              : ""
          }
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      `;
    }
    case "quote": {
      return `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px; border-left: 4px solid ${primaryColor}; background-color: #f8fafc;">
          <tr>
            <td style="padding: 16px 20px; font-family: sans-serif; font-style: italic; font-size: 16px; line-height: 1.5; color: #1e293b;">
              &ldquo;${block.content || ""}&rdquo;
              ${
                block.title
                  ? `<p style="margin: 8px 0 0 0; font-size: 13px; font-weight: 700; font-style: normal; color: ${secondaryColor};">&mdash; ${block.title}</p>`
                  : ""
              }
            </td>
          </tr>
        </table>
      `;
    }
    case "alert": {
      let bg = "#f0f9ff";
      let border = "#0ea5e9";
      let text = "#0369a1";

      if (block.alertType === "warning") {
        bg = "#fffbeb";
        border = "#f59e0b";
        text = "#b45309";
      } else if (block.alertType === "success") {
        bg = "#f0fdf4";
        border = "#22c55e";
        text = "#15803d";
      } else if (block.alertType === "danger") {
        bg = "#fef2f2";
        border = "#ef4444";
        text = "#b91c1c";
      }

      return `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px; border-radius: 8px; border: 1px solid ${border}; background-color: ${bg};">
          <tr>
            <td style="padding: 16px; font-family: sans-serif; font-size: 14px; line-height: 1.5; color: ${text};">
              ${block.title ? `<strong style="display: block; margin-bottom: 4px; font-size: 15px;">${block.title}</strong>` : ""}
              ${block.content || ""}
            </td>
          </tr>
        </table>
      `;
    }
    case "cta": {
      return `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px 24px; text-align: center; margin-bottom: 24px;">
          <tr>
            <td align="center" style="font-family: sans-serif;">
              <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 800; color: #0f172a;">${block.title || "Ready to get started?"}</h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: ${secondaryColor}; max-width: 400px; margin-left: auto; margin-right: auto;">${block.content || ""}</p>
              ${
                block.buttonText && block.url
                  ? `<table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" bgcolor="${primaryColor}" style="border-radius: 6px;">
                          <a href="${block.url}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 6px;">${block.buttonText}</a>
                        </td>
                      </tr>
                    </table>`
                  : ""
              }
            </td>
          </tr>
        </table>
      `;
    }
    case "columns": {
      if (!block.columns || block.columns.length === 0) return "";
      const colWidth = Math.floor(100 / block.columns.length);
      let tdsHtml = "";
      block.columns.forEach((colBlocks) => {
        let colContentHtml = "";
        colBlocks.forEach((subBlock) => {
          colContentHtml += generateBlockHtml(subBlock, brand);
        });
        tdsHtml += `
          <td width="${colWidth}%" valign="top" style="padding: 0 10px;">
            ${colContentHtml}
          </td>
        `;
      });
      return `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 -10px 24px -10px;">
          <tr>
            ${tdsHtml}
          </tr>
        </table>
      `;
    }
    case "footer": {
      let socialsHtml = "";
      if (brand.socialLinks) {
        const platforms = ["twitter", "linkedin", "github", "facebook", "instagram"] as const;
        platforms.forEach((platform) => {
          const link = brand.socialLinks[platform];
          if (link) {
            socialsHtml += `
              <a href="${link}" target="_blank" style="display: inline-block; margin: 0 8px; color: ${primaryColor}; font-weight: 700; text-decoration: none; font-size: 13px;">
                ${platform.charAt(0).toUpperCase() + platform.slice(1)}
              </a>
            `;
          }
        });
      }

      return `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 32px 24px; text-align: center; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
          <tr>
            <td align="center" style="font-family: sans-serif; font-size: 12px; line-height: 1.6; color: #64748b;">
              ${socialsHtml ? `<div style="margin-bottom: 20px;">${socialsHtml}</div>` : ""}
              <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">${brand.brandName}</div>
              ${address ? `<div style="margin-bottom: 4px;">${address}</div>` : ""}
              <div style="margin-bottom: 16px;">Support: <a href="mailto:${brand.supportEmail}" style="color: ${primaryColor}; text-decoration: none;">${brand.supportEmail}</a></div>
              <div style="margin-bottom: 12px; color: #94a3b8; font-size: 11px;">${brand.footerText || ""}</div>
              <div style="color: #94a3b8; font-size: 11px;">
                ${copyright} | 
                <a href="{{unsubscribeUrl}}" style="color: ${primaryColor}; text-decoration: underline;">Unsubscribe</a>
              </div>
            </td>
          </tr>
        </table>
      `;
    }
    default:
      return "";
  }
}

/**
 * Builds the complete HTML email body from Brand config, template blocks, and campaign info.
 */
export function compileEmailHtml(
  blocks: EmailBlock[],
  brand: IBrandSetting,
  subscriber?: Partial<ISubscriber> | null,
  campaign?: { subject?: string; name?: string } | null,
  extraVars: Record<string, any> = {}
): string {
  // Construct the JSON structure content
  let layoutHtml = "";
  
  // Ensure header blocks are rendered first if not present
  const hasHeader = blocks.some((b) => b.type === "header");
  const hasFooter = blocks.some((b) => b.type === "footer");

  if (!hasHeader) {
    layoutHtml += generateBlockHtml({ type: "header" }, brand);
  }

  blocks.forEach((block) => {
    layoutHtml += generateBlockHtml(block, brand);
  });

  if (!hasFooter) {
    layoutHtml += generateBlockHtml({ type: "footer" }, brand);
  }

  // Wrap in global layout table
  const emailTemplateFrame = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{{campaign.subject}}</title>
        <style type="text/css">
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; }
          img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          table { border-collapse: collapse !important; }
          body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f3f4f6; }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
          <tr>
            <td align="center" style="padding: 24px 8px; background-color: #f3f4f6;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.025); overflow: hidden;">
                <tr>
                  <td style="padding: 24px;">
                    ${layoutHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  // Construct context object for dynamic tags
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const unsubUrl = subscriber?.email 
    ? `${siteUrl.replace(/\/$/, "")}/api/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
    : `${siteUrl.replace(/\/$/, "")}/api/unsubscribe`;

  const context = {
    subscriber: subscriber || {},
    campaign: campaign || {},
    brand: brand,
    unsubscribeUrl: unsubUrl,
    currentDate: new Date().toLocaleDateString("en-US", { dateStyle: "long" }),
    currentYear: new Date().getFullYear().toString(),
    ...extraVars,
  };

  // Interpolate context variables inside template frame
  return interpolateVariables(emailTemplateFrame, context);
}

/**
 * Extracts unique user-defined variable tags from the subject and block contents
 */
export function extractTemplateVariables(jsonLayout: any, subject: string): string[] {
  const contentString = typeof jsonLayout === "string" ? jsonLayout : JSON.stringify(jsonLayout);
  const combined = `${subject} ${contentString}`;
  
  const regex = /\{\{\s*([a-zA-Z0-9_\.\s]+)\s*\}\}/g;
  const variables = new Set<string>();
  let match;
  
  while ((match = regex.exec(combined)) !== null) {
    const varPath = match[1].trim().split("||")[0].trim(); // Get path before default value if present
    
    // Ignore conditional operators/loops
    if (varPath.startsWith("#") || varPath.startsWith("/") || varPath === "else" || varPath === "this") {
      continue;
    }
    
    // Exclude helpers and built-in variables
    const isBuiltIn = 
      varPath.startsWith("brand.") || 
      varPath === "unsubscribeUrl" || 
      varPath === "currentDate" || 
      varPath === "currentYear" ||
      varPath.startsWith("inquiry.") ||
      varPath.startsWith("campaign.");
    if (!isBuiltIn) {
      variables.add(varPath);
    }
  }
  
  return Array.from(variables);
}

export default compileEmailHtml;
