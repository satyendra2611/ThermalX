import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

interface Turn { from: 'ai' | 'user'; text: string; }

const questions = [
  'Why did you choose this approach for storing tasks between sessions?',
  'Walk me through what happens, step by step, when a user marks a task complete.',
  'What would happen if this component re-rendered before the save finished?',
];

export default function Viva() {
  const [turns, setTurns] = useState<Turn[]>([{ from: 'ai', text: questions[0] }]);
  const [input, setInput] = useState('');
  const [qIndex, setQIndex] = useState(0);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  function handleSend() {
    if (!input.trim()) return;
    const userTurn: Turn = { from: 'user', text: input };
    setInput('');
    if (qIndex + 1 < questions.length) {
      const next = questions[qIndex + 1];
      setTurns((t) => [...t, userTurn, { from: 'ai', text: next }]);
      setQIndex(qIndex + 1);
    } else {
      setTurns((t) => [...t, userTurn, { from: 'ai', text: 'Thanks — that gives me a clear picture of your understanding. Your viva is complete.' }]);
      setDone(true);
    }
  }

  return (
    <div className="max-w-xl">
      <Card className="mb-4">
        <p className="text-xs text-sb-textSoft mb-4">Question {Math.min(qIndex + 1, questions.length)} / {questions.length}</p>
        <div className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-1">
          {turns.map((t, i) => (
            <div key={i} className={`max-w-[85%] ${t.from === 'user' ? 'self-end ml-auto' : ''}`}>
              <div className={`text-xs font-semibold mb-1 ${t.from === 'ai' ? 'text-[#4E9FC9]' : 'text-sb-textSoft text-right'}`}>
                {t.from === 'ai' ? '🤖 SkillBridge AI' : 'You'}
              </div>
              <div className={`rounded-2xl px-4 py-2.5 text-sm ${t.from === 'ai' ? 'bg-sb-blue/10' : 'bg-gray-100'}`}>{t.text}</div>
            </div>
          ))}
        </div>
      </Card>
      {!done ? (
        <div className="flex gap-2">
          <input
            className="flex-1 border border-sb-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sb-blue"
            placeholder="Type your answer…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      ) : (
        <Button onClick={() => navigate('/interview')}>Continue to mock interview →</Button>
      )}
    </div>
  );
}
