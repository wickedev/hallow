import React, { Suspense } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GreetingDemo } from './components/GreetingDemo';
import { UserDemo } from './components/UserDemo';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 Hallow gRPC Demo</h1>
        <p>
          Demonstrating <code>.proto</code> file imports with TypeScript and React Hooks
        </p>
      </header>

      <main className="app-main">
        <ErrorBoundary>
          <section className="demo-section">
            <h2>📋 Greeting Service</h2>
            <p>Basic request/response pattern with Promise and React Hooks API</p>
            <Suspense fallback={<div className="loading">Loading greeting...</div>}>
              <GreetingDemo />
            </Suspense>
          </section>
        </ErrorBoundary>
      </main>

      <footer className="app-footer">
        <p>
          Built with <strong>Hallow gRPC</strong> - 
          Import <code>.proto</code> files directly in TypeScript! 🎉
        </p>
      </footer>
    </div>
  );
}

export default App;
