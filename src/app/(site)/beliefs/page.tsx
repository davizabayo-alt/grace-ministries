import { SectionHeading } from "@/components/section-heading";

const beliefs = [
  ["The Bible", "We believe the Scriptures are God-breathed, trustworthy, and our final authority for faith and life."],
  ["God", "We believe in one God eternally existing as Father, Son, and Holy Spirit."],
  ["Jesus Christ", "We believe Jesus is fully God and fully man, our crucified, risen, and returning Savior."],
  ["Holy Spirit", "We believe the Holy Spirit regenerates, indwells, empowers, and sanctifies believers."],
  ["Salvation", "We believe salvation is by grace alone through faith alone in Christ alone."],
  ["The Church", "We believe the church is the body of Christ, called to worship, fellowship, discipleship, and mission."],
  ["Baptism", "We believe baptism and the Lord’s Supper are ordinances given by Christ to His church."],
  ["Christian Living", "We believe believers are called to holiness, love, justice, generosity, and faithful witness."],
  ["Resurrection", "We believe in the bodily resurrection of the dead and the final judgment."],
  ["Eternal Life", "We believe all who belong to Christ will enjoy everlasting life in the presence of God."],
];

export default function BeliefsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Faith" title="What We Believe" description="A historic, gospel-centered Christian confession." />
      <div className="mt-10 space-y-6">
        {beliefs.map(([title, text]) => (
          <section key={title} className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-3 leading-7 text-slate-600">{text}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
