/**
 * @hallow/react - React hooks for Hallow gRPC
 *
 * This package provides React hooks for consuming gRPC services with automatic
 * adapter selection (grpc-web or native gRPC) based on the runtime environment.
 *
 * @example
 * ```typescript
 * import { useGrpc, useSuspenseGrpc, useGrpcStream } from '@hallow/react';
 *
 * // Unary RPC with loading states
 * function UserProfile() {
 *   const { data, loading, error } = useGrpc({
 *     serverUrl: 'https://api.example.com',
 *     method: getUserMethod,
 *     request: { userId: '123' },
 *   });
 *
 *   if (loading) return <div>Loading...</div>;
 *   return <div>{data?.name}</div>;
 * }
 *
 * // Unary RPC with Suspense
 * function UserProfileSuspense() {
 *   const data = useSuspenseGrpc({
 *     serverUrl: 'https://api.example.com',
 *     method: getUserMethod,
 *     request: { userId: '123' },
 *   });
 *
 *   return <div>{data.name}</div>;
 * }
 *
 * // Server streaming
 * function ChatMessages() {
 *   const { messages, streaming } = useGrpcStream({
 *     serverUrl: 'https://api.example.com',
 *     method: streamMessagesMethod,
 *     request: { roomId: 'general' },
 *   });
 *
 *   return (
 *     <div>
 *       {messages.map((msg, i) => (
 *         <div key={i}>{msg.text}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

// Export hooks
export { useGrpc } from './hooks/useGrpc';
export { useSuspenseGrpc, clearSuspenseCache, preloadGrpc } from './hooks/useSuspenseGrpc';
export { useGrpcStream } from './hooks/useGrpcStream';

// Export types
export * from './types';
