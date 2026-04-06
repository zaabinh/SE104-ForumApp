import Image from 'next/image';
import { FiStar } from 'react-icons/fi';

const testimonials = [
  {
    name: 'Nguyễn Văn A',
    role: 'UIT - CNTT K64',
    avatar: '/images/uit.png',
    content: 'This platform changed how I study and collaborate. The AI recommendations help me find exactly what I need, and the community is incredibly supportive.',
    rating: 5
  },
  {
    name: 'Trần Thị B',
    role: 'HCMUT - Khoa học máy tính',
    avatar: '/images/uit.png',
    content: 'Perfect for group projects and sharing study materials. The modern interface feels like using Notion but for academic discussions.',
    rating: 5
  },
  {
    name: 'Lê Văn C',
    role: 'FPT University',
    avatar: '/images/uit.png',
    content: 'AI moderation keeps discussions high-quality without being overly restrictive. Lightning fast and beautifully designed.',
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-blue-50/50 to-slate-50">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            Loved by students
            <span className="block text-blue-600">across Vietnam</span>
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Join 10K+ students already transforming their learning experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card-surface p-8 text-center group hover:shadow-xl hover:shadow-blue-100/50 transition-all">
              <div className="flex justify-center mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FiStar key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <div className="h-40 mb-6 overflow-hidden">
                <p className="text-slate-700 text-lg leading-relaxed italic">"{testimonial.content}"</p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100">
                  <Image 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    width={48} 
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
