import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ProgressBar from '@/components/common/ProgressBar';
import { assessmentService } from '@/services/assessmentService';
import { useAuthContext } from '@/context/AuthContext';
import type { AssessmentQuestion } from '@/types';

const fallbackQuestions: AssessmentQuestion[] = [
  {
    id: 'q1',
    topicId: 'html',
    questionType: 'mcq',
    question: 'Which tag creates a hyperlink in HTML?',
    options: ['<link>', '<a>', '<href>', '<nav>'],
  },
  {
    id: 'q2',
    topicId: 'css',
    questionType: 'mcq',
    question: 'Which property controls spacing outside an element?',
    options: ['padding', 'margin', 'gap', 'border'],
  },
  {
    id: 'q3',
    topicId: 'javascript',
    questionType: 'conceptual',
    question: 'What does "hoisting" mean in JavaScript?',
    options: [
      'Variable declarations move to the top of scope',
      'CSS loads before JS',
      'The DOM re-renders',
      'Functions run twice',
    ],
  },
  {
    id: 'q4',
    topicId: 'javascript',
    questionType: 'scenario',
    question:
      'A button click should wait for an API response before updating the UI. What do you reach for?',
    options: [
      'async/await with a promise',
      'A CSS transition',
      'A synchronous loop',
      'setInterval',
    ],
  },
  {
    id: 'q5',
    topicId: 'react',
    questionType: 'conceptual',
    question: 'What triggers a React component to re-render?',
    options: [
      'State or prop changes',
      'Refreshing CSS',
      'Browser resize only',
      'Nothing, it is static',
    ],
  },
];

export default function Assessment() {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Get the REAL authenticated user
  const { user } = useAuthContext();

  useEffect(() => {
    assessmentService
      .getQuestions('web-development')
      .then((qs) => setQuestions(qs.length ? qs : fallbackQuestions))
      .catch(() => setQuestions(fallbackQuestions));
  }, []);

  const current = questions[index];

  const progress = questions.length
    ? ((index + 1) / questions.length) * 100
    : 0;

  function selectAnswer(option: string) {
    if (!current) return;

    setAnswers((prev) => ({
      ...prev,
      [current.id]: option,
    }));
  }

  async function handleNext() {
    // Move to the next question
    if (index < questions.length - 1) {
      setIndex(index + 1);
      return;
    }

    // Make sure the user is authenticated
    if (!user) {
      console.error('User is not authenticated');
      return;
    }

    setSubmitting(true);

    try {
      // Submit assessment using REAL logged-in user's ID
      await assessmentService.submit({
        userId: user.id,
        domainId: 'web-development',
        answers: Object.entries(answers).map(
          ([questionId, answer]) => ({
            questionId,
            answer,
          })
        ),
      });

      // Go to competency page after successful submission
      navigate('/competency');
    } catch (error) {
      console.error('Assessment submission failed:', error);

      // Still allow the demo flow to continue
      navigate('/competency');
    } finally {
      setSubmitting(false);
    }
  }

  if (!current) {
    return (
      <div className="text-sb-textSoft">
        Loading your assessment…
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <p className="text-sm text-sb-textSoft mb-2">
        Question {String(index + 1).padStart(2, '0')} /{' '}
        {String(questions.length).padStart(2, '0')}
      </p>

      <div className="mb-8">
        <ProgressBar value={progress} />
      </div>

      <Card>
        <h2 className="font-serif text-xl mb-6">
          {current.question}
        </h2>

        <div className="flex flex-col gap-3">
          {(current.options ?? []).map((opt) => (
            <button
              key={opt}
              onClick={() => selectAnswer(opt)}
              className={`text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                answers[current.id] === opt
                  ? 'border-sb-blue bg-sb-blue/10 font-semibold'
                  : 'border-sb-border hover:border-sb-blue'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex justify-between mt-6">
        <Button
          variant="ghost"
          disabled={index === 0}
          onClick={() =>
            setIndex((i) => Math.max(0, i - 1))
          }
        >
          Previous
        </Button>

        <Button
          disabled={!answers[current.id] || submitting}
          onClick={handleNext}
        >
          {index === questions.length - 1
            ? submitting
              ? 'Submitting…'
              : 'Submit assessment'
            : 'Next →'}
        </Button>
      </div>
    </div>
  );
}