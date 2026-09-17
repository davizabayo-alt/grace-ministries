import { redirect } from "next/navigation";

export default async function SermonDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/publications/sermons/${slug}`);
}
