import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // No inline citation processing needed - sources are displayed separately
  const content = message.content;

  // Get unique images from sources
  const images = !isUser && message.sources
    ? message.sources
        .filter(source => source.imageUrl)
        .filter((source, index, self) =>
          index === self.findIndex(s => s.imageUrl === source.imageUrl)
        )
        .slice(0, 3) // Limit to 3 images max
    : [];

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>
      )}

      <div className={`max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        <div className={`rounded-2xl px-5 py-4 shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-slate-900/50 border border-slate-600/50'
            : 'bg-gradient-to-br from-slate-800 to-slate-900 text-green-100 shadow-green-900/20 border border-green-500/30'
        }`}>
          {!isUser && (
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-green-500/30">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-green-400 font-mono">ASSISTANT//GPT-5-NANO</span>
                <span className="text-xs text-green-500/50">•</span>
                <span className="text-xs text-green-300/60 font-mono">{new Date(message.timestamp).toLocaleTimeString()}</span>
              </div>
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-green-500/10 rounded-md transition-colors group border border-transparent hover:border-green-500/30"
                title={copied ? "Copied!" : "Copy message"}
              >
                {copied ? (
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-green-400/70 group-hover:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          )}

          {/* Images from sources */}
          {images.length > 0 && (
            <div className="mb-4 pb-4 border-b border-slate-600/50">
              <div className={`grid gap-3 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {images.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden rounded-lg border border-slate-600/50 hover:border-green-500/50 transition-all bg-slate-900/50 flex items-center justify-center"
                  style={{ maxHeight: '200px' }}
                  >
                    <img
                      src={source.imageUrl}
                      alt={source.title}
                      className="max-w-full max-h-[200px] object-contain group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.target.parentElement.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-xs text-white font-medium truncate w-full">{source.title}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="prose prose-invert prose-sm max-w-none"
            components={{
              p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-base font-sans" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}>{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 font-sans" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}>{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 font-sans" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}>{children}</ol>,
              li: ({ children }) => <li className="mb-1 leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
              code: ({ children }) => <code className="bg-slate-900/50 px-1.5 py-0.5 rounded text-sm border border-slate-600/30 font-mono">{children}</code>,
              a: ({ children, href }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-baseline gap-1 text-green-400 hover:text-green-300 no-underline hover:underline transition-colors font-mono"
                >
                  {children}
                  <svg className="w-3 h-3 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>

          {/* Sources */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-500/30">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs font-bold text-green-400 uppercase tracking-wide font-mono">
                  DATA SOURCES ({message.sources.length})
                </p>
              </div>
              <div className="space-y-2">
                {message.sources.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 p-2 bg-slate-800/50 hover:bg-slate-800/80 rounded-lg border border-slate-600/30 hover:border-green-500/50 transition-all group cursor-pointer"
                  >
                    <div className="inline-flex items-center justify-center min-w-[32px] h-6 px-2 bg-green-500/20 group-hover:bg-green-500/30 border border-green-500/40 group-hover:border-green-400 rounded-md text-xs font-semibold text-green-300 group-hover:text-green-200 transition-all flex-shrink-0 font-mono">
                      [{i + 1}]
                    </div>
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-400 group-hover:text-green-300 mt-0.5 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-green-200 group-hover:text-green-300 transition-colors truncate font-mono">
                          {source.title}
                        </p>
                        <p className="text-xs text-green-400/50 group-hover:text-green-400/70 truncate font-mono transition-colors">{source.section}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {isUser && (
            <p className="text-xs text-purple-200/70 mt-2">
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg border border-slate-500/50">
            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
