import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useState } from 'react';

const faqs = [
  {
    question: 'What makes this forum AI-powered?',
    answer: 'Our platform uses advanced AI to provide smart content recommendations, auto-moderate discussions, summarize long threads, and suggest relevant topics based on your interests and study habits.'
  },
  {
    question: 'Is it free for students?',
    answer: 'Yes! Forum.dev is completely free for all university students. We offer premium features for power users and institutions, but core functionality is always free.'
  },
  {
    question: 'Which universities are using it?',
    answer: 'Thousands of students from UIT, HCMUT, FPT, PTIT, and many other universities across Vietnam are already building their communities here.'
  },
  {
    question: 'Can I create private groups?',
    answer: 'Absolutely! Create private study groups, project teams, or class cohorts with invite-only access and custom moderation tools.'
  },
  {
    question: 'What about mobile experience?',
    answer: 'Fully responsive design works perfectly on mobile, tablet, and desktop. PWA support coming soon for offline access.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            Frequently Asked
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Everything you need to know before joining the future of student collaboration
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="card-surface overflow-hidden"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex items-center justify-between p-6 cursor-pointer">
                <h3 className="text-xl font-bold text-slate-900">{faq.question}</h3>
                {openIndex === index ? (
                  <FiChevronUp className="h-5 w-5 text-blue-600" />
                ) : (
                  <FiChevronDown className="h-5 w-5 text-slate-500" />
                )}
              </div>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
