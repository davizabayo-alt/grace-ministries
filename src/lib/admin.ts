import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { announcements, contactMessages, events, media, sermons } from "@/db/schema";

export async function getAdminEvent(id: number) {
  return db.query.events.findFirst({ where: and(eq(events.id, id), isNull(events.deletedAt)) });
}

export async function getAdminAnnouncement(id: number) {
  return db.query.announcements.findFirst({ where: and(eq(announcements.id, id), isNull(announcements.deletedAt)) });
}

export async function getAdminSermon(id: number) {
  return db.query.sermons.findFirst({ where: and(eq(sermons.id, id), isNull(sermons.deletedAt)) });
}

export async function getAdminMedia(id: number) {
  return db.query.media.findFirst({ where: and(eq(media.id, id), isNull(media.deletedAt)) });
}

export async function getAdminMessage(id: number) {
  return db.query.contactMessages.findFirst({ where: and(eq(contactMessages.id, id), isNull(contactMessages.deletedAt)) });
}
