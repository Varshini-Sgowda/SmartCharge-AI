import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Clock
} from 'lucide-react';
import { api } from '../api/client';
import { CopilotResponse } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  meta?: CopilotResponse;
}

export const CopilotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 Hello! I am the **SmartCharge AI Energy Copilot**. I analyze real-time grid telemetry, trained Random Forest multi-step forecasts, and Time-Of-Use tariffs across your 12 charging hubs.\n\nAsk me questions like:\n- *Which station is likely to overload tomorrow?*\n- *Why is demand increasing?*\n- *How can energy costs be reduced?*\n- *What happens if EV adoption increases by 30%?*",
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedPrompts = [
    'Which station is likely to overload tomorrow?',
    'Why is demand increasing?',
    'How can energy costs be reduced?',
    'What happens if EV adoption increases by 30%?',
    'What is the model accuracy and R2 score?',
    'Which charging stations are underutilized?',
  ];

  const handleSend = async (queryText = input) => {
    if (!queryText.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.queryCopilot(queryText);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        meta: response,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Copilot request failed', err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Sorry, I encountered an issue accessing the telemetry database. Please ensure the backend is running.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col glass-card rounded-2xl border border-white/5 overflow-hidden animate-fadeIn">
      {/* Copilot Header */}
      <div className="p-4 border-b border-white/5 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-glow-cyan">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Autonomous Energy Intelligence Copilot</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Online & Synced
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic analytical reasoning powered by live ML forecasts and grid telemetry.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-white/5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Telemetry Active</span>
        </div>
      </div>

      {/* Suggested Prompts Pill Strip */}
      <div className="p-3 border-b border-white/5 bg-slate-950/60 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-mono uppercase text-slate-500 shrink-0">Quick Queries:</span>
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-medium border border-white/5 shrink-0 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-2xl ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-slate-950 font-semibold rounded-tr-none'
                    : 'bg-slate-900/90 border border-white/10 text-slate-100 rounded-tl-none space-y-3'
                }`}
              >
                {/* Parse Markdown-style formatting */}
                <div className="space-y-2 whitespace-pre-wrap">
                  {m.text.split('\n\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                {/* Assistant Metadata Extras (Suggested actions & follow-ups) */}
                {m.meta && (
                  <div className="pt-3 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Intent: {m.meta.intent_detected}</span>
                      <span className="text-cyan-400 font-bold">Confidence: {(m.meta.confidence_score * 100).toFixed(0)}%</span>
                    </div>

                    {m.meta.suggested_actions?.length > 0 && (
                      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-1.5">
                        <span className="text-[11px] font-bold text-cyan-300 font-mono flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Recommended Operator Next Actions:
                        </span>
                        {m.meta.suggested_actions.map((act, idx) => (
                          <p key={idx} className="text-xs text-slate-200 pl-3 border-l-2 border-cyan-400">
                            {act}
                          </p>
                        ))}
                      </div>
                    )}

                    {m.meta.follow_up_questions?.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-slate-500">Related Explorations:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.meta.follow_up_questions.map((fq, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(fq)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-cyan-300 border border-white/5 transition-colors"
                            >
                              {fq}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-500 font-mono mt-1 px-1 block">
                {m.timestamp}
              </span>
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono text-xs">
                U
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 text-xs font-mono text-cyan-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Analyzing 24h demand matrix and station stress indicators...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box Footer */}
      <div className="p-4 border-t border-white/5 bg-slate-900/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            placeholder="Ask anything about grid demand, overload risks, cost reduction, or fleet scheduling..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs sm:text-sm shadow-glow-cyan hover:scale-[1.02] disabled:opacity-40 transition-all flex items-center gap-2"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
