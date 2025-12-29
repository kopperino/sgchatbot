import ChatInterface from './components/ChatInterface';
import Header from './components/Header';

function App() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}

export default App;
