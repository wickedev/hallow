import React, { useState } from 'react';
import { Client } from '@hallow/grpc-web';
// SWC 플러그인에 의해 GreetingStub 클래스로 변환됩니다
import { GreetingStub } from '../protos/greeting.proto';

export function GreetingDemo() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [result, setResult] = useState<string>('');

  // SWC 플러그인에 의해 생성된 GreetingStub 사용
  const client = new Client({ baseURL: '/api' });
  const greeter = new GreetingStub(client);

  const handlePromiseAPI = async () => {
    try {
      const response = await greeter.greeting({
        name,
        age: parseInt(age) || 0,
        hobbies: hobbies
          .split(',')
          .map(h => h.trim())
          .filter(Boolean),
      });

      console.log('Greeting response:', response);
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      console.log('Greeting error:', error);
      setResult(`Error: ${error}`);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <h3>Promise API Example</h3>

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={e => setAge(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <input
          type="text"
          placeholder="Hobbies (comma separated)"
          value={hobbies}
          onChange={e => setHobbies(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
      </div>

      <button onClick={handlePromiseAPI} style={{ padding: '0.75rem' }}>
        Send Greeting (Promise API)
      </button>

      {result && (
        <pre
          style={{
            background: 'rgba(0, 0, 0, 0.1)',
            padding: '1rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            overflow: 'auto',
          }}
        >
          {result}
        </pre>
      )}
    </div>
  );
}
