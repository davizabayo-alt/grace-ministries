import { db } from "@/db";
import { announcements, events, media, sermons, administrators } from "@/db/schema";
import { createAnnouncement, createEvent, createMedia, createSermon } from "@/lib/content";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  const adminEmail =
    process.env.ADMIN_EMAIL?.trim() ||
    (process.env.NODE_ENV === "production"
      ? (() => {
          throw new Error("ADMIN_EMAIL is required in production");
        })()
      : "admin@church.local");
  const adminPassword =
    process.env.ADMIN_PASSWORD ||
    (process.env.NODE_ENV === "production"
      ? (() => {
          throw new Error("ADMIN_PASSWORD is required in production");
        })()
      : "change-this-local-password");

  const existingAdmin = await db.query.administrators.findFirst({
    where: eq(administrators.email, adminEmail),
  });

  if (!existingAdmin) {
    await db.insert(administrators).values({
      email: adminEmail,
      fullName: "Church Administrator",
      passwordHash: await hashPassword(adminPassword),
      mustChangePassword: true,
    });
  }

  const existingEvents = await db.select().from(events).limit(1);
  if (existingEvents.length === 0) {
    await createEvent({
      title: "Sample Sunday Worship Celebration",
      description: "Join us for heartfelt worship, biblical preaching, prayer, and fellowship with the church family.",
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      startTime: "09:00",
      endTime: "11:00",
      location: "Main Sanctuary",
      organizer: "Grace Covenant Worship Team",
      imageUrl: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&w=1200&q=80",
      registrationUrl: "https://example.com/register",
      status: "PUBLISHED",
    });
  }

  const existingAnnouncements = await db.select().from(announcements).limit(1);
  if (existingAnnouncements.length === 0) {
    await createAnnouncement({
      title: "Sample Community Prayer Week",
      content: "<p>We invite the whole church to a week of united prayer for our city, families, and mission partners.</p>",
      imageUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
    });
  }

  const existingSermons = await db.select().from(sermons).limit(1);
  if (existingSermons.length === 0) {
    await createSermon({
      title: "Sample Sermon: Walking by Faith",
      speaker: "Pastor Daniel Brooks",
      scripture: "2 Corinthians 5:7",
      description: "A practical message on trusting Christ daily with courage, obedience, and hope.",
      sermonDate: new Date().toISOString(),
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnailUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80",
      category: "Faith",
      status: "PUBLISHED",
    });
  }

  const existingMedia = await db.select().from(media).limit(1);
  if (existingMedia.length === 0) {
    await createMedia({
      title: "Sample Worship Night Highlights",
      description: "Moments from a church worship night focused on praise, testimony, and prayer.",
      mediaType: "VIDEO",
      mediaUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnailUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80",
      category: "Worship media",
      status: "PUBLISHED",
    });
  }
}
