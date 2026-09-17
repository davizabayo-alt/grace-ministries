export type EditorialPublication = {
  slug: string;
  type: "Newsletter" | "Devotional";
  title: string;
  summary: string;
  publishedAt: string;
  readingTime: string;
  imageUrl: string;
  content: Array<{ heading: string; paragraphs: string[] }>;
};

export const editorialPublications: EditorialPublication[] = [
  {
    slug: "grace-notes-september-2026",
    type: "Newsletter",
    title: "Grace Notes — September 2026",
    summary: "Stories of answered prayer, ministry milestones, upcoming gatherings, and practical ways to serve this month.",
    publishedAt: "2026-09-01T09:00:00.000Z",
    readingTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1400&q=80",
    content: [
      {
        heading: "A season of faithful growth",
        paragraphs: [
          "September gives our church family a fresh opportunity to gather around Scripture, deepen friendships, and serve our neighbors. We are grateful for every volunteer, ministry leader, and prayer partner who helps create spaces where people can meet Jesus and find community.",
          "During the past month, our care teams delivered food parcels to local families, the youth ministry welcomed new students, and several small groups began a new study through the Gospel of John. These ordinary acts of faithfulness are part of the way God builds His church.",
        ],
      },
      {
        heading: "Ways to take part",
        paragraphs: [
          "Join the Wednesday prayer gathering, invite a friend to Sunday worship, or register to serve with the community outreach team. Families can also connect with our children and youth leaders after either Sunday service.",
          "Please continue praying for wisdom for our leaders, courage for those exploring faith, comfort for families walking through grief, and open doors for our mission partners.",
        ],
      },
    ],
  },
  {
    slug: "grace-notes-august-2026",
    type: "Newsletter",
    title: "Grace Notes — August 2026",
    summary: "A monthly update celebrating outreach, youth ministry, congregational care, and the generosity of our church family.",
    publishedAt: "2026-08-01T09:00:00.000Z",
    readingTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=1400&q=80",
    content: [
      {
        heading: "Serving our city together",
        paragraphs: [
          "This month our outreach volunteers partnered with neighborhood organizations to provide school supplies and family support. Thank you to everyone who gave, packed, delivered, prayed, and welcomed our guests.",
          "Service is not simply a church project; it is one way we follow Jesus. Every conversation, meal, and practical gift can communicate the dignity and compassion of Christ.",
        ],
      },
      {
        heading: "Growing across generations",
        paragraphs: [
          "Our children and youth teams are preparing a new season of age-appropriate discipleship. Adults are also invited to join a small group, where Scripture, prayer, friendship, and mutual care can become a regular rhythm.",
        ],
      },
    ],
  },
  {
    slug: "steadfast-hope-in-every-season",
    type: "Devotional",
    title: "Steadfast Hope in Every Season",
    summary: "A short pastoral reflection on remembering God’s faithfulness when circumstances feel uncertain.",
    publishedAt: "2026-08-18T09:00:00.000Z",
    readingTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    content: [
      {
        heading: "Hope anchored in Christ",
        paragraphs: [
          "Christian hope is more than optimism. It rests on the character of God and the finished work of Jesus Christ. Circumstances can change quickly, but the promises of God remain trustworthy.",
          "When the path ahead feels unclear, we can remember where God has already been faithful. Prayer helps us bring our honest fears into His presence, and Scripture renews our minds with truth that is stronger than anxiety.",
        ],
      },
      {
        heading: "A practice for this week",
        paragraphs: [
          "Write down three ways you have seen God’s grace in the past year. Thank Him for each one, then share one of those stories with someone who needs encouragement. Hope grows when the church remembers together.",
        ],
      },
    ],
  },
];

export function findEditorialPublication(type: string, slug: string) {
  const normalizedType = type === "newsletters" ? "Newsletter" : type === "devotionals" ? "Devotional" : null;
  if (!normalizedType) return undefined;
  return editorialPublications.find((item) => item.type === normalizedType && item.slug === slug);
}
