import { useRef, useEffect, useState } from 'react';
import MessageBubble from './MessageBubble';
import InputArea from './InputArea';
import LoadingIndicator from './LoadingIndicator';
import useChat from '../hooks/useChat';

function ChatInterface() {
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [divergence, setDivergence] = useState((Math.random() * 0.5 + 1.0).toFixed(6));

  // Animate divergence meter
  useEffect(() => {
    const interval = setInterval(() => {
      setDivergence((Math.random() * 0.5 + 1.0).toFixed(6));
    }, Math.random() * 5000 + 5000); // Random interval between 5-10 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Check scroll position to show/hide scroll button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      clearChat();
    }
  };

  const suggestedQuestions = [
    { icon: "🧠", text: "What is Reading Steiner?" },
    { icon: "👨‍🔬", text: "Who is Rintaro Okabe?" },
    { icon: "🌐", text: "Explain world lines" },
    { icon: "📧", text: "What is a D-Mail?" },
    { icon: "💜", text: "Tell me about Kurisu Makise" },
    { icon: "⏰", text: "What is the PhoneWave?" }
  ];

  return (
    <div className="h-full max-w-5xl mx-auto flex flex-col">
      <div className="flex-1 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-green-900/20 border border-green-500/30 overflow-hidden flex flex-col">
        {/* Chat Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-green-500/30 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex-shrink-0 relative overflow-hidden">
          {/* CRT Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-gradient-to-b from-transparent via-green-500/10 to-transparent animate-scan"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-green-400 flex items-center gap-2 font-mono tracking-wide">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="truncate text-shadow-glow">FUTURE GADGET LAB DATABASE</span>
              </h2>
              <p className="text-xs sm:text-sm text-green-300/70 mt-1 font-mono">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  GPT-5-NANO ACTIVE
                </span>
                <span className="hidden sm:inline mx-2">•</span>
                <span className="hidden sm:inline">{messages.length} MSG</span>
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="p-2 hover:bg-green-500/10 rounded-lg transition-colors group border border-transparent hover:border-green-500/30"
                  title="Clear chat"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400/70 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <div className="px-3 py-1.5 bg-slate-900/50 border border-green-500/30 rounded font-mono text-xs text-green-400 transition-all duration-1000">
                DIV: {divergence}%
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div ref={messagesContainerRef} className={`flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 scroll-smooth bg-gradient-to-b from-slate-900/40 via-slate-900/60 to-slate-900/80 relative ${messages.length > 0 || isLoading ? 'overflow-y-auto' : 'overflow-hidden'}`}>
          {messages.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/30 border border-green-500/50">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-green-400 mb-3 font-mono">EL PSY KONGROO</h3>
              <p className="text-green-300/70 mb-8 max-w-md font-mono text-sm">
                Access the Future Gadget Lab's complete database. 119 classified documents loaded. Query any intel on Steins;Gate universe operations.
              </p>

              <div className="w-full max-w-2xl">
                <p className="text-sm text-green-400 font-semibold mb-4 flex items-center justify-center gap-2 font-mono">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  QUICK ACCESS QUERIES:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q.text)}
                      className="flex items-center gap-3 px-4 py-3 bg-slate-900/60 hover:bg-slate-800/80 border border-green-500/20 hover:border-green-500/50 rounded-lg transition-all duration-200 text-left group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="text-2xl relative z-10">{q.icon}</span>
                      <span className="text-sm text-green-300/80 group-hover:text-green-300 font-mono relative z-10">{q.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg text-red-400 font-semibold mb-2">Connection Error</p>
              <p className="text-sm text-slate-400">{error}</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <MessageBubble message={msg} />
            </div>
          ))}

          {isLoading && <LoadingIndicator />}

          <div ref={messagesEndRef} />

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-36 right-8 p-3 bg-green-600 hover:bg-green-500 text-white rounded-full shadow-lg shadow-green-500/50 transition-all hover:scale-110 z-10 border border-green-400/30"
              title="Scroll to bottom"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-green-500/30 bg-slate-900/80 flex-shrink-0">
          <InputArea onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
