import React, { useState } from 'react';
import Navigation, { Tab } from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import PromiseExample from './components/PromiseExample';
import HookExample from './components/HookExample';
import SuspenseExample from './components/SuspenseExample';
import './App.css';

/**
 * Main App component
 */
const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('promise');

  // Configuration tabs
  const tabs: Tab[] = [
    {
      id: 'promise',
      label: 'Promise API',
      description: 'Imperative data fetching with async/await',
    },
    {
      id: 'hook',
      label: 'Hook API',
      description: 'Declarative data fetching with useGrpc',
    },
    {
      id: 'suspense',
      label: 'Suspense API',
      description: 'Concurrent rendering with useSuspenseGrpc',
    },
  ];

  // Get server URL from environment with fallback
  // Use '/grpc' to go through webpack proxy for gRPC-web protocol
  const serverUrl = process.env.GRPC_SERVER_URL || '/grpc';

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌟 Hallow gRPC + Webpack Example</h1>
        <p className="app-subtitle">
          Demonstrating seamless gRPC-web integration with React 18 and TypeScript
        </p>
      </header>

      <Navigation currentTab={currentTab} onTabChange={setCurrentTab} tabs={tabs} />

      <main className="app-main">
        <ErrorBoundary>
          {currentTab === 'promise' && (
            <PromiseExample serverUrl={serverUrl} />
          )}
          {currentTab === 'hook' && (
            <HookExample serverUrl={serverUrl} />
          )}
          {currentTab === 'suspense' && (
            <SuspenseExample serverUrl={serverUrl} />
          )}
        </ErrorBoundary>
      </main>

      <footer className="app-footer">
        <p>
          Built with{' '}
          <a href="https://github.com/your-org/hallow" target="_blank" rel="noopener noreferrer">
            Hallow gRPC
          </a>
          {' • '}
          <a
            href="https://github.com/your-org/hallow/tree/main/packages/example-webpack"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Source
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;
