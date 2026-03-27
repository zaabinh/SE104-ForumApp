const features = [
  { title: 'Share posts', description: 'Publish engineering stories, notes, and tutorials.' },
  { title: 'Discuss with community', description: 'Join meaningful conversations with developers.' },
  { title: 'Bookmark posts', description: 'Save useful content for future reference.' },
  { title: 'Follow topics', description: 'Personalize your feed by tracking favorite tags.' }
];

export default function Features() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Features</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <article key={feature.title} className="card-surface p-5">
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
