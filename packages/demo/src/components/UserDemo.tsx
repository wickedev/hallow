import React, { useState } from 'react';
// TODO: 이 import가 SWC 플러그인에 의해 실제 UserStub 클래스로 변환됩니다
// import { UserStub } from '../protos/user.proto';

export function UserDemo() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [result, setResult] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState('');

  // TODO: SWC 플러그인 구현 후 활성화
  // const client = new Client({ baseURL: '/api' });
  // const userService = new UserStub(client);

  const handleCreateUser = async () => {
    try {
      // TODO: 실제 gRPC 호출
      // const response = await userService.createUser({
      //   username,
      //   email,
      //   age: parseInt(age) || 0
      // });
      
      // 임시 mock 응답
      const mockResponse = {
        success: true,
        message: 'User created successfully',
        user: {
          id: Math.floor(Math.random() * 1000),
          username,
          email,
          age: parseInt(age) || 0,
          created_at: Date.now(),
          updated_at: Date.now()
        }
      };
      
      setResult(JSON.stringify(mockResponse, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  const handleGetUser = async () => {
    try {
      // TODO: 실제 gRPC 호출
      // const response = await userService.getUser({
      //   id: parseInt(selectedUserId)
      // });
      
      // 임시 mock 응답
      const mockResponse = {
        success: true,
        message: 'User found',
        user: {
          id: parseInt(selectedUserId),
          username: 'john_doe',
          email: 'john@example.com',
          age: 28,
          created_at: Date.now() - 86400000, // 1 day ago
          updated_at: Date.now()
        }
      };
      
      setResult(JSON.stringify(mockResponse, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  const handleListUsers = async () => {
    try {
      // TODO: 실제 gRPC 호출
      // const response = await userService.listUsers({
      //   page: 1,
      //   limit: 10
      // });
      
      // 임시 mock 응답
      const mockResponse = {
        users: [
          { id: 1, username: 'alice', email: 'alice@example.com', age: 25 },
          { id: 2, username: 'bob', email: 'bob@example.com', age: 30 },
          { id: 3, username: 'charlie', email: 'charlie@example.com', age: 22 }
        ],
        total: 3,
        page: 1,
        limit: 10
      };
      
      setResult(JSON.stringify(mockResponse, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <h3>User CRUD Operations</h3>
      
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        {/* Create User */}
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <h4>Create User</h4>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button 
            onClick={handleCreateUser}
            disabled={!username.trim() || !email.trim()}
            style={{ padding: '0.5rem' }}
          >
            Create User
          </button>
        </div>

        {/* Get/List Users */}
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <h4>Get User</h4>
          <input
            type="number"
            placeholder="User ID"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button 
            onClick={handleGetUser}
            disabled={!selectedUserId.trim()}
            style={{ padding: '0.5rem' }}
          >
            Get User
          </button>
          <button 
            onClick={handleListUsers}
            style={{ padding: '0.5rem' }}
          >
            List All Users
          </button>
        </div>
      </div>

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

      <div style={{ marginTop: '1rem' }}>
        <h4>Streaming Example</h4>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>
          TODO: <code>userService.watchUserUpdates()</code> with server streaming
        </p>
        <div style={{ 
          padding: '1rem', 
          background: 'rgba(100, 108, 255, 0.1)', 
          borderRadius: '4px',
          border: '1px dashed #646cff'
        }}>
          <code style={{ fontSize: '0.8rem' }}>
            {`const stream = userService.watchUserUpdates({ id: ${selectedUserId || '1'} });
// Real-time updates for user changes`}
          </code>
        </div>
      </div>
    </div>
  );
}