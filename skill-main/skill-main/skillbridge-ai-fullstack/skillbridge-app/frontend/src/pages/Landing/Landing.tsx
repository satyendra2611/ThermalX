import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';

const domains = [
  { name: 'Web Development', icon: '🌐', status: 'Available now', available: true, blurb: 'HTML, CSS, JavaScript, React and practical build skills.' },
  { name: 'Data Science', icon: '📊', status: 'Coming soon', available: false, blurb: 'Statistics, Python and model building.' },
  { name: 'Artificial Intelligence', icon: '🤖', status: 'Coming soon', available: false, blurb: 'Machine learning fundamentals through applied systems.' },
  { name: 'UI/UX Design', icon: '🎨', status: 'Coming soon', available: false, blurb: 'Research, wireframing and interface design.' },
  { name: 'Cybersecurity', icon: '🔐', status: 'Coming soon', available: false, blurb: 'Threat modeling and secure system design.' },
  { name: 'Cloud Computing', icon: '☁️', status: 'Coming soon', available: false, blurb: 'Infrastructure and cloud-native architecture.' },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="bg-sb-bg text-sb-text">
      <div className="fixed top-0 inset-x-0 z-40 bg-sb-bg/85 backdrop-blur border-b border-sb-border">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="font-serif text-lg font-bold">SkillBridge AI</div>
          <div className="hidden md:flex gap-8 text-sm text-sb-textSoft">
            <a href="#how">How it works</a>
            <a href="#paths">Career paths</a>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="!px-4 !py-2" onClick={() => navigate('/auth')}>Sign in</Button>
            <Button className="!px-4 !py-2" onClick={() => navigate('/auth')}>Start your journey</Button>
          </div>
        </div>
      </div>

      <header className="pt-40 pb-20 max-w-6xl mx-auto px-8 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="font-serif text-5xl leading-tight mb-6">
            Build skills.<br /> Prove competency.<br /> Become job ready.
          </h1>
          <p className="text-lg text-sb-textSoft max-w-md mb-8">
            Courses tell you what you watched. SkillBridge AI tells you what you can actually do —
            then builds a roadmap around your real strengths and weak spots.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button onClick={() => navigate('/auth')}>Discover my skill level →</Button>
            <Button variant="ghost" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>
              See how it works
            </Button>
          </div>
        </div>
        <div className="rounded-hero bg-white border border-sb-border shadow-card p-8 grid grid-cols-2 gap-4">
          {['HTML • Strong', 'CSS • Strong', 'JavaScript • Developing', 'React • Needs Focus'].map((s, i) => (
            <div
              key={s}
              className="rounded-2xl p-4 text-sm font-semibold bg-sb-bg border border-sb-border"
              style={{ borderColor: ['#75BDE0', '#F8D49B', '#F8BC9B', '#F89B9B'][i] }}
            >
              {s}
            </div>
          ))}
        </div>
      </header>

      <section id="how" className="max-w-6xl mx-auto px-8 py-20">
        <h2 className="font-serif text-3xl mb-3">One journey, six stages, no guesswork.</h2>
        <p className="text-sb-textSoft mb-10 max-w-xl">
          Every learner follows the same bridge — from figuring out where they stand to walking into
          an interview prepared.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {['Discover', 'Learn', 'Apply', 'Validate', 'Interview', 'Adapt'].map((stage, i) => (
            <div key={stage} className="text-center">
              <div
                className="w-11 h-11 rounded-full mx-auto mb-3 flex items-center justify-center font-serif font-bold"
                style={{ background: ['#75BDE0', '#F8D49B', '#F8BC9B', '#F89B9B', '#75BDE0', '#F8D49B'][i] }}
              >
                {i + 1}
              </div>
              <div className="text-sm font-semibold">{stage}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="paths" className="bg-white border-y border-sb-border py-20">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="font-serif text-3xl mb-3">Choose your career path.</h2>
          <p className="text-sb-textSoft mb-10 max-w-xl">
            Web Development is fully live in this release. The rest of the map is already drawn.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {domains.map((d) => (
              <div
                key={d.name}
                onClick={() => d.available && navigate('/auth')}
                className={`rounded-card border p-6 transition-transform ${
                  d.available
                    ? 'border-sb-border cursor-pointer hover:-translate-y-1 hover:shadow-hover hover:border-sb-blue'
                    : 'border-sb-border opacity-60'
                }`}
              >
                <div className="text-2xl mb-3">{d.icon}</div>
                <h3 className="font-semibold mb-1">{d.name}</h3>
                <p className="text-sm text-sb-textSoft mb-4">{d.blurb}</p>
                <span className={`text-xs font-semibold ${d.available ? 'text-[#4E9FC9]' : 'text-sb-textSoft'}`}>
                  {d.available ? '● ' : '🔒 '}{d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-8 py-24 text-center">
        <div className="rounded-hero p-16 border border-sb-border" style={{ background: 'linear-gradient(135deg,#EAF6FC,#FBF3E4,#FCEEE8)' }}>
          <h2 className="font-serif text-3xl md:text-4xl mb-4">Your bridge to job readiness starts with one assessment.</h2>
          <p className="text-sb-textSoft max-w-md mx-auto mb-8">No prior skill level required. Fifteen minutes tells us where your roadmap should begin.</p>
          <Button onClick={() => navigate('/auth')}>Start your journey →</Button>
        </div>
      </section>

      <footer className="border-t border-sb-border py-8 text-center text-sm text-sb-textSoft">
        © 2026 SkillBridge AI
      </footer>
    </div>
  );
}
