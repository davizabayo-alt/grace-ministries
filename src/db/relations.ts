import { relations } from "drizzle-orm";
import { adminSessions, administrators, auditLogs } from "@/db/schema";

export const administratorRelations = relations(administrators, ({ many }) => ({
  sessions: many(adminSessions),
  auditLogs: many(auditLogs),
}));

export const adminSessionRelations = relations(adminSessions, ({ one }) => ({
  administrator: one(administrators, {
    fields: [adminSessions.administratorId],
    references: [administrators.id],
  }),
}));

export const auditLogRelations = relations(auditLogs, ({ one }) => ({
  administrator: one(administrators, {
    fields: [auditLogs.administratorId],
    references: [administrators.id],
  }),
}));
