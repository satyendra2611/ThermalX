import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ProgressBar from '@/components/common/ProgressBar';

const questions = [
  'Explain the difference between var, let and const.',
  'How would you center a div both horizontally and vertically?',
  'What is a JavaScript closure, and where might you use one?',
  'How does React decide when to re-render a component?',
];

export default function Interview() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [finished, setFinished] = useState(false);
  const navigate = useNavigate();

  function handleNext() {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setAnswer('');
    } else {
      setFinished(true);
    }
  }

  if (!started) {
    return (
      <Card className="max-w-lg">
        <h2 className="font-serif text-xl mb-4">Before we begin</h2>
        <ul className="text-sm text-sb-textSoft space-y-2 mb-6">
          <li>📋 Topics: HTML, CSS, JavaScript, React, problem-solving</li>
          <li>❓ {questions.length} questions</li>
          <li>⏱️ About 10 minutes</li>
          <li>📊 Evaluated on: technical knowledge, communication, problem-solving</li>
        </ul>
        <Button onClick={() => setStarted(true)}>Start interview</Button>
      </Card>
    );
  }

  if (finished) {
    return (
      <Card className="max-w-lg text-center">
        <div className="text-2xl mb-2">✓</div>
        <h2 className="font-serif text-xl mb-2">Interview complete</h2>
        <p className="text-sm text-sb-textSoft mb-6">Your responses are being combined with your project and viva performance.</p>
        <Button onClick={() => navigate('/job-readiness')}>See my job readiness score →</Button>
      </Card>
    );
  }

  return (
    <div className="max-w-lg">
      <p className="text-sm text-sb-textSoft mb-2">Question {index + 1} / {questions.length}</p>
      <div className="mb-6"><ProgressBar value={((index + 1) / questions.length) * 100} color="#F89B9B" /></div>
      <Card className="mb-4">
        <h3 className="font-serif text-lg mb-4">{questions[index]}</h3>
        <textarea
          className="w-full border border-sb-border rounded-xl px-4 py-3 text-sm h-32 resize-none focus:outline-none focus:border-sb-blue"
          placeholder="Type your answer…"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
      </Card>
      <Button disabled={!answer.trim()} onClick={handleNext}>
        {index + 1 === questions.length ? 'Submit response' : 'Submit & continue'}
      </Button>
    </div>
  );
}
