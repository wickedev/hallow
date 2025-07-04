import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          border: '1px solid #ff6b6b', 
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          color: '#ff6b6b'
        }}>
          <h3>🚨 Something went wrong</h3>
          <details>
            <summary>Error details</summary>
            <pre style={{ 
              marginTop: '1rem', 
              fontSize: '0.8rem',
              overflow: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error?.message}
            </pre>
          </details>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined })}
            style={{ marginTop: '1rem' }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}