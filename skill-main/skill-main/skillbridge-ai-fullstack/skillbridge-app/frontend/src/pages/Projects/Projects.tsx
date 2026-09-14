import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { projectService } from '@/services/projectService';
import { useAuthContext } from '@/context/AuthContext';

export default function Projects() {
  const [file, setFile] = useState<File | null>(null);

  const [status, setStatus] = useState<
    'idle' | 'uploading' | 'done' | 'error'
  >('idle');

  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Get the REAL authenticated user
  const { user } = useAuthContext();

  async function handleSubmit() {
    if (!file) return;

    // Make sure the user is authenticated
    if (!user) {
      setError('Please sign in before submitting a project.');
      return;
    }

    setError('');
    setStatus('uploading');

    const form = new FormData();

    form.append('file', file);

    // REAL authenticated user ID
    form.append('user_id', user.id);

    form.append('project_id', 'task-manager');

    try {
      await projectService.submit(form);

      setStatus('done');
    } catch (err) {
      console.error('Project submission failed:', err);

      setError(
        'Project upload failed. Please make sure the backend server is running.'
      );

      setStatus('error');
    }
  }

  return (
    <div className="max-w-2xl">
      <Card
        className="mb-6"
        style={{ borderTop: '4px solid #F8BC9B' }}
      >
        <h2 className="font-serif text-xl mb-2">
          Build a Task Management Application
        </h2>

        <p className="text-sm text-sb-textSoft mb-4">
          Apply the JavaScript and DOM concepts from your current roadmap step
          in a real, working project.
        </p>

        <h4 className="text-sm font-semibold mb-2">
          Requirements
        </h4>

        <ul className="text-sm text-sb-textSoft list-disc pl-5 mb-4 space-y-1">
          <li>Add, complete, and delete tasks</li>
          <li>Persist tasks between page reloads</li>
          <li>Responsive layout for mobile and desktop</li>
        </ul>

        <h4 className="text-sm font-semibold mb-2">
          Skills tested
        </h4>

        <div className="flex gap-2 flex-wrap">
          {[
            'DOM manipulation',
            'Event handling',
            'Local storage',
            'Responsive CSS',
          ].map((skill) => (
            <span
              key={skill}
              className="text-xs bg-sb-peach/30 text-[#8a4a2a] px-3 py-1 rounded-full font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">
          Submit your project
        </h3>

        {status !== 'done' ? (
          <>
            <label className="block border-2 border-dashed border-sb-border rounded-2xl py-10 text-center cursor-pointer hover:border-sb-blue transition-colors mb-4">
              <input
                type="file"
                className="hidden"
                accept=".zip,.pdf,.doc,.docx"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setError('');
                  setStatus('idle');
                }}
              />

              <div className="text-2xl mb-2">📁</div>

              <div className="text-sm font-medium">
                {file
                  ? file.name
                  : 'Drop your project here, or browse'}
              </div>

              <div className="text-xs text-sb-textSoft mt-1">
                ZIP • PDF • DOCX
              </div>
            </label>

            {error && (
              <p className="text-sm text-red-500 mb-4">
                {error}
              </p>
            )}

            <Button
              disabled={!file || status === 'uploading'}
              onClick={handleSubmit}
            >
              {status === 'uploading'
                ? 'Uploading...'
                : 'Submit project'}
            </Button>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-2xl mb-2">✓</div>

            <p className="font-semibold mb-1">
              Upload complete
            </p>

            <p className="text-sm text-sb-textSoft mb-4">
              Your AI viva is now unlocked.
            </p>

            <Button onClick={() => navigate('/viva')}>
              Start AI viva →
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}