import { SectionHeading } from "@/components/section-heading";
import { CHURCH } from "@/lib/constants";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="About" title="About Our Church" description="A welcoming congregation committed to Christ, Scripture, and community." />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {[
          ["Church history", "Grace Covenant Church began as a small prayer gathering and grew into a vibrant community centered on worship, discipleship, and local outreach."],
          ["Mission", CHURCH.mission],
          ["Vision", CHURCH.vision],
          ["Core values", "Biblical truth, prayerful dependence, compassionate service, authentic fellowship, and gospel mission."],
          ["Leadership", "Our pastoral and ministry leaders shepherd the church with humility, accountability, and a heart for discipleship."],
          ["Statement of purpose", "We exist to glorify God by making disciples of Jesus Christ in our city and beyond."],
          ["Service times", CHURCH.serviceTimes.join(" • ")],
          ["Location", CHURCH.address],
        ].map(([title, text]) => (
          <section key={title} className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-3 leading-7 text-slate-600">{text}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
