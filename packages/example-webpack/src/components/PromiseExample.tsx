import React, { useState } from 'react';
import { GreetingServiceStub } from '../../proto/greeting.proto';

interface PromiseExampleProps {
  serverUrl: string;
}

/**
 * PromiseExample component demonstrating imperative gRPC calls with Promises
 */
const PromiseExample: React.FC<PromiseExampleProps> = ({ serverUrl }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  const handleGreet = async () => {
    if (!name.trim()) {
      setError(new Error('Please enter a name'));
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      // Create stub instance
      const stub = new GreetingServiceStub({ serverUrl });

      // Call greet method
      const response = await stub.methods.greet({
        name: name,
        language: 'en',
        options: {
          style: 1, // CASUAL
          include_timestamp: true,
          metadata: {},
        },
      });

      setData(response);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="example-container">
      <div className="example-header">
        <h2>Promise API Example</h2>
        <p>Imperative data fetching using async/await pattern</p>
      </div>

      <div className="example-controls">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          disabled={loading}
          className="example-input"
          onKeyPress={(e) => e.key === 'Enter' && handleGreet()}
        />
        <button onClick={handleGreet} disabled={loading} className="example-button">
          {loading ? 'Loading...' : 'Send Greeting'}
        </button>
      </div>

      {loading && <div className="loading">Sending gRPC request...</div>}

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
              <strong>Timestamp:</strong> {new Date(Number(data.timestamp)).toLocaleString()}
            </p>
            <p>
              <strong>Server Version:</strong> {data.metadata?.serverVersion || data.metadata?.server_version || 'N/A'}
            </p>
            <p>
              <strong>Request ID:</strong> {data.metadata?.requestId || data.metadata?.request_id || 'N/A'}
            </p>
          </div>
        </div>
      )}

      <div className="code-example">
        <h3>Code Example:</h3>
        <pre>{`import { GreetingServiceStub } from './greeting.proto';

const stub = new GreetingServiceStub({ serverUrl });

const response = await stub.methods.greet({
  name: 'World',
  language: 'en',
  options: { style: 1 }
});

console.log(response.reply);`}</pre>
      </div>
    </div>
  );
};

export default PromiseExample;
