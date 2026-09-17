import { SectionHeading } from "@/components/section-heading";

const ministries = [
  "Worship",
  "Prayer",
  "Evangelism",
  "Discipleship",
  "Youth ministry",
  "Children ministry",
  "Community outreach",
  "Missions",
  "Charity",
  "Leadership development",
];

export default function WhatWeDoPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Ministry" title="What We Do" description="Serving Christ through worship, formation, care, and mission." />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ministries.map((item) => (
          <article key={item} className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">{item}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Our {item.toLowerCase()} ministry helps people encounter Christ, grow in biblical maturity, and serve with compassion.
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
