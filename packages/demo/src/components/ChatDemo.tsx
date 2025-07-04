import React, { useState, useEffect, useRef } from 'react';
// TODO: 이 import가 SWC 플러그인에 의해 실제 ChatStub 클래스로 변환됩니다
// import { ChatStub } from '../protos/chat.proto';

interface Message {
  id: number;
  user: string;
  content: string;
  timestamp: number;
  type: 'sent' | 'received';
}

export function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('user1');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // TODO: SWC 플러그인 구현 후 활성화
  // const client = new Client({ baseURL: '/api' });
  // const chatService = new ChatStub(client);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mock 메시지 시뮬레이션
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        if (Math.random() > 0.7) { // 30% 확률로 메시지 수신
          const mockMessage: Message = {
            id: Date.now() + Math.random(),
            user: ['alice', 'bob', 'charlie'][Math.floor(Math.random() * 3)],
            content: [
              'Hello everyone!',
              'How are you doing?',
              'This is a test message',
              'gRPC streaming is working!',
              'Real-time messaging 🚀'
            ][Math.floor(Math.random() * 5)],
            timestamp: Date.now(),
            type: 'received'
          };
          setMessages(prev => [...prev, mockMessage]);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const handleConnect = async () => {
    try {
      // TODO: 실제 gRPC 스트리밍 연결
      // const stream = chatService.joinChat({ username });
      // stream.on('message', (message) => {
      //   setMessages(prev => [...prev, {
      //     id: message.id,
      //     user: message.user,
      //     content: message.content,
      //     timestamp: message.timestamp,
      //     type: message.user === username ? 'sent' : 'received'
      //   }]);
      // });

      setIsConnected(true);
      setMessages(prev => [...prev, {
        id: Date.now(),
        user: 'system',
        content: `${username} joined the chat`,
        timestamp: Date.now(),
        type: 'received'
      }]);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = () => {
    // TODO: 실제 스트리밍 연결 해제
    // stream.close();
    
    setIsConnected(false);
    setMessages(prev => [...prev, {
      id: Date.now(),
      user: 'system',
      content: `${username} left the chat`,
      timestamp: Date.now(),
      type: 'received'
    }]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isConnected) return;

    const message: Message = {
      id: Date.now(),
      user: username,
      content: newMessage,
      timestamp: Date.now(),
      type: 'sent'
    };

    try {
      // TODO: 실제 gRPC 스트리밍 메시지 전송
      // await chatService.sendMessage({
      //   user: username,
      //   content: newMessage,
      //   timestamp: Date.now()
      // });

      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{ display: 'grid', gap: '1rem', height: '500px' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isConnected}
          style={{ 
            padding: '0.5rem', 
            borderRadius: '4px', 
            border: '1px solid #ccc',
            opacity: isConnected ? 0.6 : 1
          }}
        />
        {!isConnected ? (
          <button 
            onClick={handleConnect}
            disabled={!username.trim()}
            style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: '#646cff',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Connect
          </button>
        ) : (
          <button 
            onClick={handleDisconnect}
            style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Disconnect
          </button>
        )}
        <span style={{ 
          fontSize: '0.9rem', 
          color: isConnected ? '#4caf50' : '#888',
          fontWeight: 'bold'
        }}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
      </div>

      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        padding: '1rem',
        height: '300px',
        overflowY: 'auto',
        backgroundColor: 'rgba(0, 0, 0, 0.02)'
      }}>
        {messages.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', margin: '2rem 0' }}>
            No messages yet. Connect to start chatting!
          </p>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.type === 'sent' ? 'flex-end' : 'flex-start',
                marginBottom: '0.5rem'
              }}
            >
              <div style={{
                maxWidth: '70%',
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                backgroundColor: message.type === 'sent' ? '#646cff' : '#e5e5e5',
                color: message.type === 'sent' ? 'white' : 'black'
              }}>
                <div style={{ fontSize: '0.8rem', marginBottom: '0.25rem', opacity: 0.8 }}>
                  {message.user} • {new Date(message.timestamp).toLocaleTimeString()}
                </div>
                <div>{message.content}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!isConnected}
          style={{ 
            flex: 1, 
            padding: '0.5rem', 
            borderRadius: '4px', 
            border: '1px solid #ccc',
            opacity: !isConnected ? 0.6 : 1
          }}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || !isConnected}
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            opacity: (!newMessage.trim() || !isConnected) ? 0.6 : 1
          }}
        >
          Send
        </button>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h4>Streaming APIs Preview</h4>
        <div style={{ 
          padding: '1rem', 
          background: 'rgba(100, 108, 255, 0.1)', 
          borderRadius: '4px',
          border: '1px dashed #646cff'
        }}>
          <code style={{ fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
            {`// Client-side streaming
const stream = chatService.joinChat({ username: "${username}" });
stream.on('message', (msg) => console.log(msg));

// Bidirectional streaming
const biStream = chatService.chatStream();
biStream.write({ user: "${username}", content: "${newMessage || 'Hello!'}" });
biStream.on('data', (response) => updateMessages(response));`}
          </code>
        </div>
      </div>
    </div>
  );
}