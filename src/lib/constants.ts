export const CHURCH = {
  name: "Grace Covenant Church",
  shortName: "Grace Covenant",
  mission:
    "Growing disciples of Jesus Christ through worship, prayer, Scripture, and compassionate outreach.",
  vision:
    "To see lives transformed by the gospel and communities renewed by the love of Christ.",
  tagline: "A Christ-centered family of worship, discipleship, and mission.",
  address: "125 Hope Avenue, Springfield, USA",
  phone: "+1 (555) 123-4567",
  email: "hello@gracecovenant.local",
  serviceTimes: [
    "Sunday Worship — 9:00 AM & 11:00 AM",
    "Wednesday Prayer Gathering — 6:30 PM",
    "Friday Youth Fellowship — 7:00 PM",
  ],
  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
  },
};

export const CONTACT_CATEGORIES = [
  "General inquiry",
  "Prayer request",
  "Counseling",
  "Membership",
  "Event inquiry",
  "Partnership",
  "Volunteering",
  "Donation inquiry",
  "Testimony",
  "Other",
] as const;

export const ADMIN_PATHS = [
  "/admin/login",
  "/admin/dashboard",
  "/admin/events",
  "/admin/announcements",
  "/admin/sermons",
  "/admin/media",
  "/admin/messages",
  "/admin/settings",
] as const;
