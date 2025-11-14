import React, { useState } from 'react';
import { useGrpc } from '@hallow/react';
import { GreetingServiceStub } from '../../proto/greeting.proto';

interface HookExampleProps {
  serverUrl: string;
}

/**
 * HookExample component demonstrating declarative gRPC calls with useGrpc hook
 */
const HookExample: React.FC<HookExampleProps> = ({ serverUrl }) => {
  const [name, setName] = useState('World');
  const [triggerFetch, setTriggerFetch] = useState(0);

  // Use the useGrpc hook for declarative data fetching
  const { data, loading, error } = useGrpc({
    serverUrl,
    StubClass: GreetingServiceStub,
    stubMethod: (stub) =>
      stub.methods.greet({
        name: name,
        language: 'en',
        options: {
          style: 3, // FRIENDLY
          include_timestamp: true,
          metadata: {},
        },
      }),
    deps: [name, triggerFetch],
    onSuccess: (response) => {
      console.log('=== Response Debug ===');
      console.log('Full response:', response);
      console.log('Timestamp:', response.timestamp, typeof response.timestamp);
      console.log('Metadata:', response.metadata);
      console.log('Metadata keys:', response.metadata ? Object.keys(response.metadata) : 'N/A');
      console.log('Server version:', response.metadata?.serverVersion);
      console.log('Request ID:', response.metadata?.requestId);
      console.log('All response keys:', Object.keys(response));
    },
  });

  const handleRefetch = () => {
    setTriggerFetch((prev) => prev + 1);
  };

  return (
    <div className="example-container">
      <div className="example-header">
        <h2>Hook API Example</h2>
        <p>Declarative data fetching using the useGrpc hook</p>
      </div>

      <div className="example-controls">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="example-input"
        />
        <button onClick={handleRefetch} disabled={loading} className="example-button">
          {loading ? 'Loading...' : 'Refetch'}
        </button>
      </div>

      {loading && <div className="loading">Fetching data...</div>}

      {error && (
        <div className="error-display">
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {data && (
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
      )}

      <div className="code-example">
        <h3>Code Example:</h3>
        <pre>{`import { useGrpc } from '@hallow/react';
import { GreetingServiceStub } from './greeting.proto';

const { data, loading, error, refetch } = useGreet({ name: name }, [name]);

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
return <div>{data.reply}</div>;`}</pre>
      </div>
    </div>
  );
};

export default HookExample;
