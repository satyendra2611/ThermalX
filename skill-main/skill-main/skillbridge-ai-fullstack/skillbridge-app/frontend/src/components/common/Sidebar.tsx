import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, Target, Brain, BarChart3, Map, Wrench, Mic, Wand2, Briefcase, Trophy, Settings, User,
} from 'lucide-react';

const groups = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: Home },
      { to: '/career-paths', label: 'Career Paths', icon: Target },
    ],
  },
  {
    label: 'My Journey',
    items: [
      { to: '/assessment', label: 'Assessment', icon: Brain },
      { to: '/competency', label: 'Competency Analysis', icon: BarChart3 },
      { to: '/roadmap', label: 'Learning Roadmap', icon: Map },
    ],
  },
  {
    label: 'Practice',
    items: [
      { to: '/projects', label: 'Project Challenge', icon: Wrench },
      { to: '/viva', label: 'AI Project Viva', icon: Mic },
      { to: '/modification', label: 'Modification Challenge', icon: Wand2 },
    ],
  },
  {
    label: 'Job Readiness',
    items: [
      { to: '/interview', label: 'Mock Interview', icon: Briefcase },
      { to: '/job-readiness', label: 'Job Readiness', icon: Trophy },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-[260px] shrink-0 bg-white border-r border-sb-border h-screen sticky top-0 flex flex-col">
      <div className="px-6 py-6 border-b border-sb-border">
        <div className="font-serif text-lg font-bold">SkillBridge AI</div>
        <div className="text-xs text-sb-textSoft">AI Career Intelligence</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {groups.map((g) => (
          <div key={g.label} className="mb-5">
            <div className="px-3 mb-2 text-[11px] font-semibold text-sb-textSoft tracking-wide">{g.label}</div>
            {g.items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1 transition-colors ${
                    isActive ? 'bg-sb-blue/15 text-[#2B6E93] font-semibold' : 'text-sb-text hover:bg-gray-50'
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-sb-border">
        <NavLink to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-gray-50">
          <User size={17} /> Profile
        </NavLink>
        <NavLink to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-gray-50">
          <Settings size={17} /> Settings
        </NavLink>
      </div>
    </aside>
  );
}
