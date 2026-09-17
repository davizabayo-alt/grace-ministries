import { redirect } from "next/navigation";

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/publications/announcements/${slug}`);
}
