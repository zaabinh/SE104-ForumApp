import Features from '@/components/landing/Features';
import Footer from '@/components/landing/Footer';
import Hero from '@/components/landing/Hero';

const steps = ['Create account', 'Create post', 'Interact with community'];

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-12 px-4 py-8 md:px-6">
      <Hero />
      <Features />
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">How it works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step} className="card-surface p-5">
              <p className="text-sm font-semibold text-forum-secondary">Step {index + 1}</p>
              <h3 className="mt-2 font-semibold">{step}</h3>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
