import { and, asc, count, desc, eq, gt, ilike, isNull, lt, or } from "drizzle-orm";
import { db } from "@/db";
import {
  announcements,
  auditLogs,
  contactMessages,
  events,
  media,
  sermons,
  type MessageStatus,
  type PublicationStatus,
} from "@/db/schema";
import { createSlug, excerpt, sanitizeRichText } from "@/lib/utils";

async function uniqueSlug(table: typeof events | typeof announcements | typeof sermons | typeof media, title: string) {
  const base = createSlug(title);
  let slug = base;
  let index = 1;

  while (true) {
    const row = await db.select({ id: table.id }).from(table).where(eq(table.slug, slug)).limit(1);
    if (row.length === 0) return slug;
    index += 1;
    slug = `${base}-${index}`;
  }
}

export async function getDashboardStats() {
  const [eventCount] = await db.select({ value: count() }).from(events).where(isNull(events.deletedAt));
  const [upcomingEvents] = await db
    .select({ value: count() })
    .from(events)
    .where(and(isNull(events.deletedAt), gt(events.eventDate, new Date())));
  const [announcementCount] = await db
    .select({ value: count() })
    .from(announcements)
    .where(isNull(announcements.deletedAt));
  const [sermonCount] = await db.select({ value: count() }).from(sermons).where(isNull(sermons.deletedAt));
  const [mediaCount] = await db.select({ value: count() }).from(media).where(isNull(media.deletedAt));
  const [newMessages] = await db
    .select({ value: count() })
    .from(contactMessages)
    .where(and(isNull(contactMessages.deletedAt), eq(contactMessages.status, "NEW")));
  const [messageCount] = await db
    .select({ value: count() })
    .from(contactMessages)
    .where(isNull(contactMessages.deletedAt));

  const recentActivity = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(8);

  return {
    totalEvents: eventCount?.value ?? 0,
    upcomingEvents: upcomingEvents?.value ?? 0,
    totalAnnouncements: announcementCount?.value ?? 0,
    totalSermons: sermonCount?.value ?? 0,
    totalMedia: mediaCount?.value ?? 0,
    newMessages: newMessages?.value ?? 0,
    totalMessages: messageCount?.value ?? 0,
    recentActivity,
  };
}

export async function listEvents(params: {
  page?: number;
  status?: PublicationStatus | "ALL";
  search?: string;
  upcoming?: boolean;
  publicOnly?: boolean;
}) {
  const page = params.page ?? 1;
  const limit = 6;
  const conditions = [isNull(events.deletedAt)];

  if (params.status && params.status !== "ALL") conditions.push(eq(events.status, params.status));
  if (params.publicOnly) conditions.push(eq(events.status, "PUBLISHED"));
  if (params.upcoming === true) conditions.push(gt(events.eventDate, new Date()));
  if (params.upcoming === false) conditions.push(lt(events.eventDate, new Date()));
  if (params.search) conditions.push(or(ilike(events.title, `%${params.search}%`), ilike(events.location, `%${params.search}%`))!);

  const where = and(...conditions);
  const items = await db
    .select()
    .from(events)
    .where(where)
    .orderBy(params.upcoming === true ? asc(events.eventDate) : desc(events.eventDate))
    .limit(limit)
    .offset((page - 1) * limit);
  const [total] = await db.select({ value: count() }).from(events).where(where);
  return { items, pagination: { page, pageSize: limit, total: total?.value ?? 0 } };
}

export async function getEventBySlug(slug: string, publicOnly = true) {
  return db.query.events.findFirst({
    where: and(eq(events.slug, slug), isNull(events.deletedAt), ...(publicOnly ? [eq(events.status, "PUBLISHED")] : [])),
  });
}

export async function createEvent(data: {
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  location: string;
  organizer?: string;
  imageUrl?: string | null;
  registrationUrl?: string | null;
  status: PublicationStatus;
}) {
  const slug = await uniqueSlug(events, data.title);
  const [item] = await db
    .insert(events)
    .values({
      ...data,
      slug,
      eventDate: new Date(data.eventDate),
      endTime: data.endTime || null,
      organizer: data.organizer || null,
      imageUrl: data.imageUrl || null,
      registrationUrl: data.registrationUrl || null,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    })
    .returning();
  return item;
}

export async function updateEvent(id: number, data: Parameters<typeof createEvent>[0]) {
  const [item] = await db
    .update(events)
    .set({
      ...data,
      eventDate: new Date(data.eventDate),
      endTime: data.endTime || null,
      organizer: data.organizer || null,
      imageUrl: data.imageUrl || null,
      registrationUrl: data.registrationUrl || null,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    })
    .where(eq(events.id, id))
    .returning();
  return item;
}

export async function softDeleteEvent(id: number) {
  await db.update(events).set({ deletedAt: new Date() }).where(eq(events.id, id));
}

export async function listAnnouncements(params: { page?: number; status?: PublicationStatus | "ALL"; search?: string; publicOnly?: boolean }) {
  const page = params.page ?? 1;
  const limit = 6;
  const conditions = [isNull(announcements.deletedAt)];
  if (params.status && params.status !== "ALL") conditions.push(eq(announcements.status, params.status));
  if (params.publicOnly) conditions.push(eq(announcements.status, "PUBLISHED"));
  if (params.search) conditions.push(ilike(announcements.title, `%${params.search}%`));
  const where = and(...conditions);
  const items = await db.select().from(announcements).where(where).orderBy(desc(announcements.createdAt)).limit(limit).offset((page - 1) * limit);
  const [total] = await db.select({ value: count() }).from(announcements).where(where);
  return { items, pagination: { page, pageSize: limit, total: total?.value ?? 0 } };
}

export async function getAnnouncementBySlug(slug: string, publicOnly = true) {
  return db.query.announcements.findFirst({
    where: and(eq(announcements.slug, slug), isNull(announcements.deletedAt), ...(publicOnly ? [eq(announcements.status, "PUBLISHED")] : [])),
  });
}

export async function createAnnouncement(data: { title: string; content: string; imageUrl?: string | null; status: PublicationStatus }) {
  const sanitized = sanitizeRichText(data.content);
  const slug = await uniqueSlug(announcements, data.title);
  const [item] = await db
    .insert(announcements)
    .values({
      title: data.title,
      slug,
      content: sanitized,
      excerpt: excerpt(sanitized, 180),
      imageUrl: data.imageUrl || null,
      status: data.status,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    })
    .returning();
  return item;
}

export async function updateAnnouncement(id: number, data: { title: string; content: string; imageUrl?: string | null; status: PublicationStatus }) {
  const sanitized = sanitizeRichText(data.content);
  const [item] = await db
    .update(announcements)
    .set({
      title: data.title,
      content: sanitized,
      excerpt: excerpt(sanitized, 180),
      imageUrl: data.imageUrl || null,
      status: data.status,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    })
    .where(eq(announcements.id, id))
    .returning();
  return item;
}

export async function softDeleteAnnouncement(id: number) {
  await db.update(announcements).set({ deletedAt: new Date() }).where(eq(announcements.id, id));
}

export async function listSermons(params: { page?: number; status?: PublicationStatus | "ALL"; search?: string; category?: string; publicOnly?: boolean }) {
  const page = params.page ?? 1;
  const limit = 6;
  const conditions = [isNull(sermons.deletedAt)];
  if (params.status && params.status !== "ALL") conditions.push(eq(sermons.status, params.status));
  if (params.publicOnly) conditions.push(eq(sermons.status, "PUBLISHED"));
  if (params.search) conditions.push(or(ilike(sermons.title, `%${params.search}%`), ilike(sermons.speaker, `%${params.search}%`))!);
  if (params.category) conditions.push(eq(sermons.category, params.category));
  const where = and(...conditions);
  const items = await db.select().from(sermons).where(where).orderBy(desc(sermons.sermonDate)).limit(limit).offset((page - 1) * limit);
  const [total] = await db.select({ value: count() }).from(sermons).where(where);
  return { items, pagination: { page, pageSize: limit, total: total?.value ?? 0 } };
}

export async function getSermonBySlug(slug: string, publicOnly = true) {
  return db.query.sermons.findFirst({
    where: and(eq(sermons.slug, slug), isNull(sermons.deletedAt), ...(publicOnly ? [eq(sermons.status, "PUBLISHED")] : [])),
  });
}

export async function createSermon(data: { title: string; speaker: string; scripture?: string; description: string; sermonDate: string; audioUrl?: string | null; videoUrl?: string | null; thumbnailUrl?: string | null; category: string; status: PublicationStatus }) {
  const slug = await uniqueSlug(sermons, data.title);
  const [item] = await db
    .insert(sermons)
    .values({
      ...data,
      slug,
      scripture: data.scripture || null,
      sermonDate: new Date(data.sermonDate),
      audioUrl: data.audioUrl || null,
      videoUrl: data.videoUrl || null,
      thumbnailUrl: data.thumbnailUrl || null,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    })
    .returning();
  return item;
}

export async function updateSermon(id: number, data: Parameters<typeof createSermon>[0]) {
  const [item] = await db
    .update(sermons)
    .set({
      ...data,
      scripture: data.scripture || null,
      sermonDate: new Date(data.sermonDate),
      audioUrl: data.audioUrl || null,
      videoUrl: data.videoUrl || null,
      thumbnailUrl: data.thumbnailUrl || null,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    })
    .where(eq(sermons.id, id))
    .returning();
  return item;
}

export async function softDeleteSermon(id: number) {
  await db.update(sermons).set({ deletedAt: new Date() }).where(eq(sermons.id, id));
}

export async function listMedia(params: { page?: number; status?: PublicationStatus | "ALL"; search?: string; category?: string; publicOnly?: boolean }) {
  const page = params.page ?? 1;
  const limit = 8;
  const conditions = [isNull(media.deletedAt)];
  if (params.status && params.status !== "ALL") conditions.push(eq(media.status, params.status));
  if (params.publicOnly) conditions.push(eq(media.status, "PUBLISHED"));
  if (params.search) conditions.push(ilike(media.title, `%${params.search}%`));
  if (params.category) conditions.push(eq(media.category, params.category));
  const where = and(...conditions);
  const items = await db.select().from(media).where(where).orderBy(desc(media.createdAt)).limit(limit).offset((page - 1) * limit);
  const [total] = await db.select({ value: count() }).from(media).where(where);
  return { items, pagination: { page, pageSize: limit, total: total?.value ?? 0 } };
}

export async function getMediaBySlug(slug: string, publicOnly = true) {
  return db.query.media.findFirst({
    where: and(eq(media.slug, slug), isNull(media.deletedAt), ...(publicOnly ? [eq(media.status, "PUBLISHED")] : [])),
  });
}

export async function createMedia(data: { title: string; description: string; mediaType: "PHOTO" | "VIDEO" | "LIVESTREAM"; mediaUrl: string; thumbnailUrl?: string | null; category: string; status: PublicationStatus }) {
  const slug = await uniqueSlug(media, data.title);
  const [item] = await db
    .insert(media)
    .values({
      ...data,
      slug,
      thumbnailUrl: data.thumbnailUrl || null,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    })
    .returning();
  return item;
}

export async function updateMedia(id: number, data: Parameters<typeof createMedia>[0]) {
  const [item] = await db
    .update(media)
    .set({
      ...data,
      thumbnailUrl: data.thumbnailUrl || null,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    })
    .where(eq(media.id, id))
    .returning();
  return item;
}

export async function softDeleteMedia(id: number) {
  await db.update(media).set({ deletedAt: new Date() }).where(eq(media.id, id));
}

export async function listMessages(params: { page?: number; status?: MessageStatus | "ALL"; search?: string }) {
  const page = params.page ?? 1;
  const limit = 10;
  const conditions = [isNull(contactMessages.deletedAt)];
  if (params.status && params.status !== "ALL") conditions.push(eq(contactMessages.status, params.status));
  if (params.search) conditions.push(or(ilike(contactMessages.fullName, `%${params.search}%`), ilike(contactMessages.subject, `%${params.search}%`))!);
  const where = and(...conditions);
  const items = await db.select().from(contactMessages).where(where).orderBy(desc(contactMessages.createdAt)).limit(limit).offset((page - 1) * limit);
  const [total] = await db.select({ value: count() }).from(contactMessages).where(where);
  return { items, pagination: { page, pageSize: limit, total: total?.value ?? 0 } };
}

export async function getMessageById(id: number) {
  return db.query.contactMessages.findFirst({ where: and(eq(contactMessages.id, id), isNull(contactMessages.deletedAt)) });
}

export async function createMessage(data: { fullName: string; email: string; phone?: string; subject: string; category: string; message: string }) {
  const [item] = await db.insert(contactMessages).values({ ...data, phone: data.phone || null }).returning();
  return item;
}

export async function updateMessageStatus(id: number, status: MessageStatus) {
  const [item] = await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id)).returning();
  return item;
}

export async function softDeleteMessage(id: number) {
  await db.update(contactMessages).set({ deletedAt: new Date() }).where(eq(contactMessages.id, id));
}
