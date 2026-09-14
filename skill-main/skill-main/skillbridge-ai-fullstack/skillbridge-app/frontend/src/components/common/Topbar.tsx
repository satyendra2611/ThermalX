import React, { useState } from 'react';
import { Bell, Sparkles, Send, X, Loader2 } from 'lucide-react';

import { aiService } from '@/services/aiService';

export default function Topbar({ title }: { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAskAI() {
    if (!message.trim() || loading) return;

    setLoading(true);
    setResponse('');

    try {
      const result = await aiService.ask(message.trim());
      setResponse(result);
    } catch (error) {
      console.error(error);

      setResponse(
        'Sorry, I could not connect to SkillBridge AI right now. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === 'Enter') {
      handleAskAI();
    }
  }

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center justify-between bg-sb-bg/90 backdrop-blur px-8 py-5 border-b border-sb-border">
        <h1 className="font-serif text-xl font-semibold">
          {title}
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 text-sm text-sb-textSoft hover:text-sb-text transition-colors"
          >
            <Sparkles size={16} />
            Ask SkillBridge AI
          </button>

          <button className="w-9 h-9 rounded-full bg-white border border-sb-border flex items-center justify-center">
            <Bell size={16} />
          </button>

          <div className="w-9 h-9 rounded-full bg-sb-blue" />
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6 bg-black/20">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-sb-border overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-sb-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sb-blue text-white flex items-center justify-center">
                  <Sparkles size={18} />
                </div>

                <div>
                  <h2 className="font-serif text-lg font-semibold">
                    SkillBridge AI
                  </h2>

                  <p className="text-xs text-sb-textSoft">
                    Your AI career assistant
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-sb-textSoft hover:text-sb-text"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="p-6 min-h-[300px] max-h-[400px] overflow-y-auto">
              
              {!response && !loading && (
                <div className="text-sm text-sb-textSoft">
                  👋 Hi! I'm SkillBridge AI.

                  <br />
                  <br />

                  Ask me anything about:
                  <ul className="list-disc ml-5 mt-3 space-y-1">
                    <li>Your career roadmap</li>
                    <li>Skills you should learn</li>
                    <li>Projects for your portfolio</li>
                    <li>Interview preparation</li>
                    <li>Career guidance</li>
                  </ul>
                </div>
              )}

              {loading && (
                <div className="flex items-center gap-3 text-sb-textSoft">
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />

                  <span>
                    SkillBridge AI is thinking...
                  </span>
                </div>
              )}

              {response && (
                <div className="bg-sb-blue/5 border border-sb-blue/10 rounded-xl p-4">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {response}
                  </p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-sb-border p-4 flex gap-3">
              <input
                type="text"
                placeholder="Ask about your career..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="flex-1 border border-sb-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sb-blue"
              />

              <button
                onClick={handleAskAI}
                disabled={!message.trim() || loading}
                className="w-12 rounded-xl bg-sb-blue text-white flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {loading ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}