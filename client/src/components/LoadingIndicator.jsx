function LoadingIndicator() {
  return (
    <div className="flex gap-3 justify-start animate-fadeIn">
      {/* AI Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      </div>

      {/* Loading Message */}
      <div className="max-w-[75%]">
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 text-slate-100 rounded-2xl px-5 py-4 shadow-lg shadow-slate-900/50 border border-slate-600/50">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-600/50">
            <span className="text-xs font-semibold text-purple-300">Steins;Gate Wiki AI</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">thinking...</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-slate-400 animate-pulse">
              Searching knowledge base...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingIndicator;
