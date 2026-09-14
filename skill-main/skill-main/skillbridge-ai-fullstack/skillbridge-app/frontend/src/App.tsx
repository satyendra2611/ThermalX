import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';

import Landing from '@/pages/Landing/Landing';
import Authentication from '@/pages/Authentication/Authentication';
import Dashboard from '@/pages/Dashboard/Dashboard';
import CareerPaths from '@/pages/CareerPaths/CareerPaths';
import Assessment from '@/pages/Assessment/Assessment';
import Competency from '@/pages/Competency/Competency';
import Roadmap from '@/pages/Roadmap/Roadmap';
import Projects from '@/pages/Projects/Projects';
import Viva from '@/pages/Viva/Viva';
import Interview from '@/pages/Interview/Interview';
import JobReadiness from '@/pages/JobReadiness/JobReadiness';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<AuthLayout />}>
        <Route path="/auth" element={<Authentication />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/career-paths" element={<CareerPaths />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/competency" element={<Competency />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/viva" element={<Viva />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/job-readiness" element={<JobReadiness />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
