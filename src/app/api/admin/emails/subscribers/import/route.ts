import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { z } from "zod";

const importPayloadSchema = z.object({
  subscribers: z.array(
    z.object({
      email: z.string().email("Invalid email"),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      company: z.string().optional(),
      phone: z.string().optional(),
      customFields: z.record(z.string(), z.string()).optional(),
    })
  ),
  tagIds: z.array(z.string()).default([]),
  groupIds: z.array(z.string()).default([]),
});

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = importPayloadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const { subscribers, tagIds, groupIds } = result.data;
    let importedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    // Loop through each subscriber row
    for (let i = 0; i < subscribers.length; i++) {
      const row = subscribers[i];
      try {
        const cleanEmail = row.email.toLowerCase().trim();

        // Duplicate Check
        const existing = await Subscriber.findOne({ email: cleanEmail });
        
        if (existing) {
          // Merge tags and groups
          const mergedTags = Array.from(
            new Set([...existing.tags.map((t: any) => t.toString()), ...tagIds])
          );
          const mergedGroups = Array.from(
            new Set([...existing.groups.map((g: any) => g.toString()), ...groupIds])
          );

          existing.firstName = row.firstName || existing.firstName;
          existing.lastName = row.lastName || existing.lastName;
          existing.company = row.company || existing.company;
          existing.phone = row.phone || existing.phone;
          existing.tags = mergedTags as any;
          existing.groups = mergedGroups as any;
          
          // Merge custom fields
          if (row.customFields) {
            const currentFields = existing.customFields ? Object.fromEntries(existing.customFields) : {};
            existing.customFields = new Map(Object.entries({ ...currentFields, ...row.customFields }));
          }

          await existing.save();
          updatedCount++;
        } else {
          // Create new record
          await Subscriber.create({
            email: cleanEmail,
            firstName: row.firstName || "",
            lastName: row.lastName || "",
            company: row.company || "",
            phone: row.phone || "",
            status: "SUBSCRIBED",
            tags: tagIds,
            groups: groupIds,
            customFields: row.customFields || {},
          });
          importedCount++;
        }
      } catch (err: any) {
        errors.push(`Row ${i + 1} (${row.email}): ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "CSV contacts import processed",
      data: {
        imported: importedCount,
        updated: updatedCount,
        failed: errors.length,
        errors,
      },
    });
  } catch (err: any) {
    console.error("POST Import error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
