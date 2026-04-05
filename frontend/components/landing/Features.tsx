import { FiMessageSquare, FiShield, FiZap, FiTrendingUp, FiUsers, FiStar, FiCheck } from 'react-icons/fi';
import { SiOpenai } from 'react-icons/si';

const features = [
  { icon: FiMessageSquare, title: 'Smart Threading', description: 'AI-powered conversation organization that keeps discussions focused and productive.' },
  { icon: SiOpenai, title: 'Intelligent Recommendations', description: 'Discover relevant content and connections based on your study interests and activity.' },
  { icon: FiShield, title: 'AI Moderation', description: 'Automatic content quality control ensures a positive, academic-focused environment.' },
  { icon: FiZap, title: 'Real-time Collaboration', description: 'Instant updates and notifications keep your entire study group synchronized.' },
  { icon: FiTrendingUp, title: 'Engagement Analytics', description: 'Track what content resonates with your audience and optimize your contributions.' },
  { icon: FiUsers, title: 'Smart Groups', description: 'AI helps form perfect study groups based on skills, availability, and project needs.' },
  { icon: FiStar, title: 'Content Summaries', description: 'Get instant AI-generated summaries of long discussions and research threads.' },
  { icon: FiCheck, title: 'Quality Signals', description: 'Community + AI verification system highlights truly valuable academic content.' }
];

export default function Features() {
  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-blue-900 bg-clip-text text-center">
        Core Features
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <article key={feature.title} className="card-surface p-6 hover:shadow-lg transition-all group">
            <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 w-fit">
              <feature.icon className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

