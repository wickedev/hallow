import React, { useState, Suspense } from 'react';
import { useSuspenseGrpc, clearSuspenseCache } from '@hallow/react';
import { GreetingServiceStub } from '../../proto/greeting.proto';
import ErrorBoundary from './ErrorBoundary';
import { Highlight, themes } from 'prism-react-renderer';

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
  const stub = new GreetingServiceStub({ serverUrl });
  const data = stub.useGreetSuspense(
    {
      name: name,
      language: 'en',
      options: {
        style: 2, // FORMAL
        include_timestamp: true,
        metadata: {},
      },
    },
    {
      // Provide explicit cache key that includes the name parameter
      cacheKey: `${serverUrl}:greet:${name}`,
    }
  );

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
  const [refetchKey, setRefetchKey] = useState(0);

  const handleGreet = () => {
    if (name.trim()) {
      setShowResult(true);
    }
  };

  const handleRefetch = () => {
    // Clear the Suspense cache to force refetch
    clearSuspenseCache();
    // Force remount by changing the key
    setRefetchKey((prev) => prev + 1);
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
          onKeyDown={(e) => e.key === 'Enter' && handleGreet()}
        />
        <button onClick={handleGreet} disabled={!name.trim()} className="example-button">
          Send Greeting
        </button>
        {showResult && (
          <button onClick={handleRefetch} className="example-button">
            Refetch
          </button>
        )}
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
            <SuspenseContent key={`${name}-${refetchKey}`} serverUrl={serverUrl} name={name} />
          </Suspense>
        </ErrorBoundary>
      )}

      <div className="code-example">
        <h3>Code Example:</h3>
        <Highlight
          code={`import { Suspense } from 'react';
import { GreetingServiceStub } from './greeting.proto';

function Content() {
  const stub = new GreetingServiceStub({ serverUrl: 'http://localhost:3000' });
  const data = stub.useGreetSuspense({ name: 'World' });

  return <div>{data.reply}</div>;
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content />
    </Suspense>
  );
}`}
          language="typescript"
          theme={themes.vsDark}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={className} style={style}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
};

export default SuspenseExample;
