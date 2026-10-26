import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lightbulb, Compass, ListOrdered, Code2, Target, Flame, TrendingUp, Gauge, Cpu, Smartphone } from 'lucide-react';
import { PublicTopNav } from '../components/layout/TopNav';
import { useAuth } from '../context/AuthContext';
import { btnPrimary, btnGhost, cardCls } from '../utils/ui';

const levels = [
  { icon: Lightbulb, title: 'Nudge', text: 'One or two sentences to get you unstuck. No code, no algorithm name.' },
  { icon: Compass, title: 'Approach', text: 'The idea and the data structure to use, explained in plain words.' },
  { icon: ListOrdered, title: 'Pseudocode', text: 'Numbered steps you can turn into code yourself.' },
  { icon: Code2, title: 'Full solution', text: 'The complete answer, only when you really need it.' },
];

const highlights = [
  { icon: Lightbulb, title: 'Four hint levels', text: 'From a small nudge to the full solution, unlocked one step at a time.' },
  { icon: Target, title: 'Weak topic insights', text: 'See which topics need the most hints, then jump straight into practising them.' },
  { icon: Cpu, title: 'Choose your AI model', text: 'Switch between Groq, OpenAI and Anthropic models from a simple dropdown.' },
];

const features = [
  { icon: Flame, title: 'Daily streak', text: 'Solve one problem a day to keep your streak going.' },
  { icon: TrendingUp, title: 'Independence score', text: 'See how often you solve with only a small hint.' },
  { icon: Gauge, title: 'Complexity check', text: 'Get a quick time and space estimate of your code.' },
  { icon: Smartphone, title: 'Works everywhere', text: 'Use it on your phone, tablet or laptop.' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-dvh">
      <PublicTopNav />

      <section className="bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center md:py-28">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl"
          >
            Stop copying solutions. Learn to find them.
          </motion.h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-600 md:text-lg dark:text-slate-300">
            Paste a DSA problem and your attempt. AlgoMentor gives you hints one level at a time, so you do the thinking.
          </p>
          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link to="/try" className={`${btnPrimary} h-12 px-7`}>
              Try it now
            </Link>
            <Link to={isAuthenticated ? '/dashboard' : '/auth'} className={`${btnGhost} h-12 px-7`}>
              {isAuthenticated ? 'Go to dashboard' : 'Get started'}
            </Link>
          </div>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
            <span>No credit card required</span>
            <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block dark:bg-slate-600" />
            <span>Free for students</span>
            <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block dark:bg-slate-600" />
            <span>Powered by advanced AI</span>
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-14 dark:bg-slate-950 md:py-20" aria-labelledby="core-features">
        <div className="mx-auto max-w-5xl px-4">
        <h2 id="core-features" className="mb-10 text-center text-2xl font-bold">Core Features</h2>
        {/* borderless three-column list: icon, title, text, with thin dividers on wide screens */}
        <dl className="grid grid-cols-1 gap-10 text-center md:grid-cols-3 md:gap-0 md:divide-x md:divide-slate-200 md:dark:divide-slate-700">
          {highlights.map((h) => (
            <div key={h.title} className="md:px-8 md:first:pl-0 md:last:pr-0">
              <h.icon className="mx-auto h-7 w-7 text-indigo-600 dark:text-indigo-400" strokeWidth={1.6} aria-hidden="true" />
              <dt className="mt-4 text-lg font-semibold">{h.title}</dt>
              <dd className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-600 dark:text-slate-300">{h.text}</dd>
            </div>
          ))}
        </dl>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-12 dark:border-slate-700 dark:bg-slate-900 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-bold">How it works</h2>
        <p className="mt-2 text-center text-slate-600 dark:text-slate-300">Four hint levels. You unlock them in order.</p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {levels.map((l, i) => (
            <div key={l.title} className={cardCls}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                  <l.icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold text-slate-500">LEVEL {i + 1}</span>
              </div>
              <h3 className="mt-3 font-semibold">{l.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{l.text}</p>
            </div>
          ))}
        </div>
        </div>
      </section>

      <section className="bg-slate-50 py-12 dark:bg-slate-950 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold">Built for real practice</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <f.icon className="h-6 w-6 text-indigo-500" />
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{f.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/try" className={btnPrimary}>Try it now</Link>
            <Link to="/auth" className={btnGhost}>Create free account</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-700 dark:bg-slate-900">
        <p className="px-4 text-center text-sm text-slate-500">
          AlgoMentor &copy; 2026 &mdash; Master Data Structures &amp; Algorithms step-by-step.
        </p>
      </footer>
    </div>
  );
}