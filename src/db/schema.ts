import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const publicationStatusEnum = pgEnum("publication_status", ["DRAFT", "PUBLISHED"]);
export const messageStatusEnum = pgEnum("message_status", ["NEW", "READ", "REPLIED", "ARCHIVED"]);
export const mediaTypeEnum = pgEnum("media_type", ["PHOTO", "VIDEO", "LIVESTREAM"]);
export const adminRoleEnum = pgEnum("admin_role", ["ADMIN"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const administrators = pgTable(
  "administrators",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    role: adminRoleEnum("role").default("ADMIN").notNull(),
    mustChangePassword: boolean("must_change_password").default(true).notNull(),
    failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [uniqueIndex("administrators_email_idx").on(table.email)]
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    sessionTokenHash: text("session_token_hash").notNull(),
    administratorId: integer("administrator_id")
      .notNull()
      .references(() => administrators.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
    ipAddress: varchar("ip_address", { length: 128 }),
    userAgent: text("user_agent"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("admin_sessions_token_idx").on(table.sessionTokenHash),
    index("admin_sessions_admin_idx").on(table.administratorId),
    index("admin_sessions_expires_idx").on(table.expiresAt),
  ]
);

export const events = pgTable(
  "events",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    description: text("description").notNull(),
    eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
    startTime: varchar("start_time", { length: 20 }).notNull(),
    endTime: varchar("end_time", { length: 20 }),
    location: varchar("location", { length: 255 }).notNull(),
    organizer: varchar("organizer", { length: 160 }),
    imageUrl: text("image_url"),
    registrationUrl: text("registration_url"),
    status: publicationStatusEnum("status").default("DRAFT").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("events_slug_idx").on(table.slug),
    index("events_status_idx").on(table.status),
    index("events_event_date_idx").on(table.eventDate),
    index("events_published_at_idx").on(table.publishedAt),
    index("events_created_at_idx").on(table.createdAt),
  ]
);

export const announcements = pgTable(
  "announcements",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    content: text("content").notNull(),
    excerpt: text("excerpt"),
    imageUrl: text("image_url"),
    status: publicationStatusEnum("status").default("DRAFT").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("announcements_slug_idx").on(table.slug),
    index("announcements_status_idx").on(table.status),
    index("announcements_published_at_idx").on(table.publishedAt),
    index("announcements_created_at_idx").on(table.createdAt),
  ]
);

export const sermons = pgTable(
  "sermons",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    speaker: varchar("speaker", { length: 160 }).notNull(),
    scripture: varchar("scripture", { length: 255 }),
    description: text("description").notNull(),
    sermonDate: timestamp("sermon_date", { withTimezone: true }).notNull(),
    audioUrl: text("audio_url"),
    videoUrl: text("video_url"),
    thumbnailUrl: text("thumbnail_url"),
    category: varchar("category", { length: 120 }).notNull(),
    status: publicationStatusEnum("status").default("DRAFT").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("sermons_slug_idx").on(table.slug),
    index("sermons_status_idx").on(table.status),
    index("sermons_sermon_date_idx").on(table.sermonDate),
    index("sermons_category_idx").on(table.category),
    index("sermons_published_at_idx").on(table.publishedAt),
    index("sermons_created_at_idx").on(table.createdAt),
  ]
);

export const media = pgTable(
  "media",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    description: text("description").notNull(),
    mediaType: mediaTypeEnum("media_type").notNull(),
    mediaUrl: text("media_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    category: varchar("category", { length: 120 }).notNull(),
    status: publicationStatusEnum("status").default("DRAFT").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("media_slug_idx").on(table.slug),
    index("media_status_idx").on(table.status),
    index("media_category_idx").on(table.category),
    index("media_published_at_idx").on(table.publishedAt),
    index("media_created_at_idx").on(table.createdAt),
  ]
);

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    subject: varchar("subject", { length: 200 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    message: text("message").notNull(),
    status: messageStatusEnum("status").default("NEW").notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("contact_messages_status_idx").on(table.status),
    index("contact_messages_email_idx").on(table.email),
    index("contact_messages_created_at_idx").on(table.createdAt),
  ]
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    administratorId: integer("administrator_id").references(() => administrators.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entity_type", { length: 120 }).notNull(),
    entityId: varchar("entity_id", { length: 120 }).notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_admin_idx").on(table.administratorId),
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ]
);

export type PublicationStatus = (typeof publicationStatusEnum.enumValues)[number];
export type MessageStatus = (typeof messageStatusEnum.enumValues)[number];
export type MediaType = (typeof mediaTypeEnum.enumValues)[number];
