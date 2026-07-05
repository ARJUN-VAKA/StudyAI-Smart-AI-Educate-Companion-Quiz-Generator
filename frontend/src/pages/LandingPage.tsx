import React from 'react';
import { Link } from 'react-router-dom';
import { HiAcademicCap, HiLightningBolt, HiClipboardList, HiCalendar, HiChartBar, HiViewGrid, HiArrowRight, HiCheckCircle } from 'react-icons/hi';
import { motion } from 'framer-motion';

const features = [
  {
    icon: HiLightningBolt,
    title: 'AI Summaries',
    description: 'Upload any study material and get structured summaries with key concepts, definitions, and revision notes.',
    color: 'text-primary bg-primary/10',
  },
  {
    icon: HiViewGrid,
    title: 'Flashcards',
    description: 'Auto-generate Q&A flashcards with flip animations, difficulty levels, and progress tracking.',
    color: 'text-accent bg-accent/10',
  },
  {
    icon: HiClipboardList,
    title: 'Smart Quizzes',
    description: 'MCQ, True/False, and Short Answer quizzes with instant AI evaluation and weak topic detection.',
    color: 'text-success bg-green-100',
  },
  {
    icon: HiCalendar,
    title: 'Study Schedule',
    description: 'Personalized 7-day study plans with daily tasks, time slots, and priority topics.',
    color: 'text-warning bg-amber-100',
  },
  {
    icon: HiChartBar,
    title: 'Analytics',
    description: 'Track quiz scores, study progress, completion rates, and identify weak areas with charts.',
    color: 'text-purple-600 bg-purple-100',
  },
];

const steps = [
  { step: '01', title: 'Upload Material', desc: 'Upload a PDF, DOCX, TXT, or paste text directly.' },
  { step: '02', title: 'AI Processes It', desc: 'Flask backend extracts content and sends it to Groq Llama 3.3 70B.' },
  { step: '03', title: 'Generate Tools', desc: 'Get summaries, flashcards, and quizzes instantly.' },
  { step: '04', title: 'Track Progress', desc: 'Build your schedule and monitor analytics over time.' },
];

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* ─── Navbar ─── */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30">
        <div className="page-container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <HiAcademicCap className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-[#0F172A] text-[15px]">StudyAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="bg-white border-b border-[#E2E8F0] py-20">
        <div className="page-container">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <span className="badge badge-primary mb-4 inline-flex">
                Powered by Llama 3.3 70B
              </span>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-5xl font-bold text-[#0F172A] leading-tight mb-5">
                Study Smarter <br className="hidden sm:block" />
                <span className="text-primary">with AI</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg text-[#64748B] mb-8 leading-relaxed max-w-2xl mx-auto">
                Upload your study material and generate AI-powered summaries, flashcards, quizzes,
                personalized study schedules, and learning analytics — all in one place.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="flex items-center justify-center gap-4">
                <Link to="/register" className="btn-primary px-7 py-3 text-base">
                  Get Started Free
                  <HiArrowRight className="w-4 h-4" />
                </Link>
                <a href="#how-it-works" className="btn-secondary px-7 py-3 text-base">
                  Learn More
                </a>
              </div>
            </FadeIn>

            {/* Trust badges */}
            <FadeIn delay={0.4}>
              <div className="flex items-center justify-center gap-6 mt-10 text-sm text-[#64748B]">
                {['PDF, DOCX, TXT support', 'No credit card required', 'Free to use'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <HiCheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-20" id="features">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Everything You Need to Study Better</h2>
            <p className="text-[#64748B] max-w-xl mx-auto">
              Five powerful AI tools that transform how you study, review, and retain knowledge.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="card p-6 hover:shadow-card-hover transition-shadow duration-200"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-[#0F172A] mb-2">{f.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 bg-white border-t border-[#E2E8F0]" id="how-it-works">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">How StudyAI Works</h2>
            <p className="text-[#64748B] max-w-xl mx-auto">
              From upload to insight in four simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-sm">{s.step}</span>
                </div>
                <h3 className="font-semibold text-[#0F172A] mb-2">{s.title}</h3>
                <p className="text-sm text-[#64748B]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 bg-primary">
        <div className="page-container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Study Smarter?</h2>
          <p className="text-primary-100 mb-8 max-w-lg mx-auto">
            Join thousands of students who use StudyAI to improve their learning outcomes.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 px-7 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-primary-50 transition-colors duration-150">
            Get Started Free
            <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-white border-t border-[#E2E8F0] py-8">
        <div className="page-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <HiAcademicCap className="text-white w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-[#0F172A]">StudyAI</span>
          </div>
          <p className="text-sm text-[#94A3B8]">
            © {new Date().getFullYear()} StudyAI. Built for students, by students.
          </p>
          <div className="flex gap-4 text-sm text-[#64748B]">
            <Link to="/login" className="hover:text-[#0F172A]">Login</Link>
            <Link to="/register" className="hover:text-[#0F172A]">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
