import { db } from "@/db";
import { auditLogs } from "@/db/schema";

export async function writeAuditLog(input: {
  administratorId?: number | null;
  action: string;
  entityType: string;
  entityId: string | number;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(auditLogs).values({
    administratorId: input.administratorId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: String(input.entityId),
    metadata: input.metadata ?? null,
  });
}
