import React, { useState, Suspense } from 'react';
import { useSuspenseGrpc } from '@hallow/react';
import { GreetingServiceStub } from '../../proto/greeting.proto';
import ErrorBoundary from './ErrorBoundary';

interface SuspenseExampleProps {
  serverUrl: string;
}

interface SuspenseContentProps {
  serverUrl: string;
  name: string;
}

/**
 * Inner component that uses useSuspenseGrpc
 */
const SuspenseContent: React.FC<SuspenseContentProps> = ({ serverUrl, name }) => {
  // useSuspenseGrpc suspends rendering until data is ready
  const data = useSuspenseGrpc({
    serverUrl,
    StubClass: GreetingServiceStub,
    stubMethod: (stub) =>
      stub.methods.greet({
        name: name,
        language: 'en',
        options: {
          style: 2, // FORMAL
          include_timestamp: true,
          metadata: {},
        },
      }),
  });

  return (
    <div className="result">
      <h3>Response:</h3>
      <p className="greeting-reply">{data.reply}</p>
      <div className="metadata">
        <p>
          <strong>Timestamp:</strong>{' '}
          {data.timestamp
            ? (() => {
                let ts: number;

                // Handle different timestamp formats
                if (typeof data.timestamp === 'string') {
                  ts = parseInt(data.timestamp, 10);
                } else if (typeof data.timestamp === 'number') {
                  ts = data.timestamp;
                } else if (data.timestamp && typeof data.timestamp === 'object' && 'toNumber' in data.timestamp) {
                  // Handle Long object from protobuf
                  ts = (data.timestamp as any).toNumber();
                } else {
                  return String(data.timestamp);
                }

                // Check if it's in seconds (< 10000000000) or milliseconds
                const milliseconds = ts > 10000000000 ? ts : ts * 1000;
                return new Date(milliseconds).toLocaleString();
              })()
            : 'N/A'}
        </p>
        <p>
          <strong>Server Version:</strong> {data.metadata?.serverVersion || 'N/A'}
        </p>
        <p>
          <strong>Request ID:</strong> {data.metadata?.requestId || 'N/A'}
        </p>
      </div>
    </div>
  );
};

/**
 * SuspenseExample component demonstrating React Suspense integration
 */
const SuspenseExample: React.FC<SuspenseExampleProps> = ({ serverUrl }) => {
  const [name, setName] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleGreet = () => {
    if (name.trim()) {
      setShowResult(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setShowResult(false);
  };

  return (
    <div className="example-container">
      <div className="example-header">
        <h2>Suspense API Example</h2>
        <p>Concurrent rendering using React Suspense and useSuspenseGrpc</p>
      </div>

      <div className="example-controls">
        <input
          type="text"
          value={name}
          onChange={handleInputChange}
          placeholder="Enter your name"
          className="example-input"
          onKeyPress={(e) => e.key === 'Enter' && handleGreet()}
        />
        <button onClick={handleGreet} disabled={!name.trim()} className="example-button">
          Send Greeting
        </button>
      </div>

      {showResult && (
        <ErrorBoundary
          fallback={(error, reset) => (
            <div className="error-display">
              <strong>Error:</strong> {error.message}
              <button onClick={reset} className="retry-button">
                Retry
              </button>
            </div>
          )}
        >
          <Suspense fallback={<div className="loading">Loading data...</div>}>
            <SuspenseContent serverUrl={serverUrl} name={name} />
          </Suspense>
        </ErrorBoundary>
      )}

      <div className="code-example">
        <h3>Code Example:</h3>
        <pre>{`import { Suspense } from 'react';
import { useSuspenseGrpc } from '@hallow/react';
import { GreetingServiceStub } from './greeting.proto';

function Content() {
  const data = useSuspenseGrpc({
    serverUrl: 'http://localhost:3000',
    StubClass: GreetingServiceStub,
    stubMethod: (stub) => stub.methods.greet({ name: 'World' })
  });

  return <div>{data.reply}</div>;
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content />
    </Suspense>
  );
}`}</pre>
      </div>
    </div>
  );
};

export default SuspenseExample;
