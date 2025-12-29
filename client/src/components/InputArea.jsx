import { useState } from 'react';

function InputArea({ onSend, disabled }) {
  const [input, setInput] = useState('');
  const maxLength = 500;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about Steins;Gate..."
              disabled={disabled}
              maxLength={maxLength}
              className="w-full bg-slate-700/70 text-white rounded-xl px-5 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-slate-700 disabled:opacity-50 placeholder-slate-400 transition-all shadow-lg border border-slate-600/50 focus:border-purple-500/50"
            />
            {input.length > 0 && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <span className={`text-xs font-medium ${
                  input.length > maxLength * 0.9 ? 'text-orange-400' : 'text-slate-500'
                }`}>
                  {input.length}/{maxLength}
                </span>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6 py-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 active:scale-95 flex items-center gap-2 group font-mono"
          >
            {disabled ? (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <>
                <span>Send</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-green-400/70 px-1 font-mono">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>ENTER TO TRANSMIT</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span>LAB MEM #001</span>
          </div>
        </div>
      </div>
    </form>
  );
}

export default InputArea;
