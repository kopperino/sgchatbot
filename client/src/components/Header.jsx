function Header() {
  return (
    <header className="border-b border-purple-500/30 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-purple-900/20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 animate-gradient">
                Steins;Gate Wiki AI
              </h1>
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Ask anything about the Steins;Gate universe
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/20">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-purple-300 text-sm font-mono font-semibold">
              El Psy Kongroo
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
