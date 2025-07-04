import React, { useState } from 'react';
// TODO: 이 import가 SWC 플러그인에 의해 실제 GreetingStub 클래스로 변환됩니다
// import { GreetingStub } from '../protos/greeting.proto';

export function GreetingDemo() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [result, setResult] = useState<string>('');

  // TODO: SWC 플러그인 구현 후 활성화
  // const client = new Client({ baseURL: '/api' });
  // const greeter = new GreetingStub(client);

  const handlePromiseAPI = async () => {
    try {
      // TODO: 실제 gRPC 호출
      // const response = await greeter.greeting({
      //   name,
      //   age: parseInt(age) || 0,
      //   hobbies: hobbies.split(',').map(h => h.trim()).filter(Boolean)
      // });
      
      // 임시 mock 응답
      const mockResponse = {
        message: `Hello ${name}! You are ${age} years old and enjoy: ${hobbies}`,
        timestamp: Date.now(),
        success: true
      };
      
      setResult(JSON.stringify(mockResponse, null, 2));
    } catch (error) {
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
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Hobbies (comma separated)"
          value={hobbies}
          onChange={(e) => setHobbies(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <button 
        onClick={handlePromiseAPI}
        disabled={!name.trim()}
        style={{ padding: '0.75rem' }}
      >
        Send Greeting (Promise API)
      </button>

      {result && (
        <pre style={{ 
          background: 'rgba(0, 0, 0, 0.1)', 
          padding: '1rem', 
          borderRadius: '4px',
          fontSize: '0.8rem',
          overflow: 'auto'
        }}>
          {result}
        </pre>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h4>React Hooks API Example (Suspense)</h4>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>
          TODO: This will use <code>hooks.useGreeting()</code> when SWC plugin is implemented
        </p>
        <div style={{ 
          padding: '1rem', 
          background: 'rgba(100, 108, 255, 0.1)', 
          borderRadius: '4px',
          border: '1px dashed #646cff'
        }}>
          <code style={{ fontSize: '0.8rem' }}>
            {`const hooks = greeter.createHooks();
const response = hooks.useGreeting({ name: "${name || 'John'}", age: ${age || '25'} });
return <div>{JSON.stringify(response.read())}</div>;`}
          </code>
        </div>
      </div>
    </div>
  );
}