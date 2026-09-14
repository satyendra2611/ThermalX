import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/common/Sidebar';
import Topbar from '@/components/common/Topbar';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/career-paths': 'Career Paths',
  '/assessment': 'Initial Assessment',
  '/competency': 'Competency Analysis',
  '/roadmap': 'Learning Roadmap',
  '/projects': 'Project Challenge',
  '/viva': 'AI Project Viva',
  '/modification': 'Modification Challenge',
  '/interview': 'Mock Interview',
  '/job-readiness': 'Job Readiness Report',
};

export default function MainLayout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen bg-sb-bg">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={titles[pathname] ?? 'SkillBridge AI'} />
        <main className="p-8 max-w-[1200px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
