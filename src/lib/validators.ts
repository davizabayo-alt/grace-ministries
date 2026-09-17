import { z } from "zod";
import { CONTACT_CATEGORIES } from "@/lib/constants";

export const loginSchema = z.object({
  email: z.email().max(255).transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8).max(128),
});

const optionalUrl = z.union([z.url(), z.literal(""), z.null()]).transform((value) => value || null);

export const eventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(20),
  eventDate: z.string().min(1),
  startTime: z.string().min(1).max(20),
  endTime: z.string().max(20).optional().default(""),
  location: z.string().min(2).max(255),
  organizer: z.string().max(160).optional().default(""),
  imageUrl: optionalUrl,
  registrationUrl: optionalUrl,
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export const announcementSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(20),
  imageUrl: optionalUrl,
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export const sermonSchema = z.object({
  title: z.string().min(3).max(200),
  speaker: z.string().min(2).max(160),
  scripture: z.string().max(255).optional().default(""),
  description: z.string().min(20),
  sermonDate: z.string().min(1),
  audioUrl: optionalUrl,
  videoUrl: optionalUrl,
  thumbnailUrl: optionalUrl,
  category: z.string().min(2).max(120),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export const mediaSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(20),
  mediaType: z.enum(["PHOTO", "VIDEO", "LIVESTREAM"]),
  mediaUrl: z.url(),
  thumbnailUrl: optionalUrl,
  category: z.string().min(2).max(120),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export const messageSchema = z.object({
  fullName: z.string().min(2).max(160),
  email: z.email().max(255),
  phone: z.string().max(50).optional().default(""),
  subject: z.string().min(3).max(200),
  category: z.enum(CONTACT_CATEGORIES),
  message: z.string().min(10).max(5000),
  website: z.string().max(0).optional().default(""),
  turnstileToken: z.string().max(4096).optional().default(""),
});

export const messageStatusSchema = z.object({
  status: z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(12).max(128),
});
