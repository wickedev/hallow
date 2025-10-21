import { Injectable, NotFoundException } from '@nestjs/common';
import { Observable, Subject, from, interval, map, take } from 'rxjs';
import {
  GetUserRequest,
  GetUserResponse,
  ListUsersRequest,
  ListUsersResponse,
  CreateUserRequest,
  StreamMessage,
} from './user.interface';

@Injectable()
export class UserService {
  private users: Map<string, GetUserResponse> = new Map();
  private userIdCounter = 1;

  constructor() {
    // Initialize with test data
    this.initializeTestData();
  }

  private initializeTestData(): void {
    const testUsers = [
      { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com' },
      { id: 'user-2', name: 'Bob Smith', email: 'bob@example.com' },
      { id: 'user-3', name: 'Charlie Davis', email: 'charlie@example.com' },
      { id: 'user-4', name: 'Diana Wilson', email: 'diana@example.com' },
      { id: 'user-5', name: 'Edward Brown', email: 'edward@example.com' },
      { id: 'user-6', name: 'Fiona Martinez', email: 'fiona@example.com' },
      { id: 'user-7', name: 'George Taylor', email: 'george@example.com' },
      { id: 'user-8', name: 'Helen Anderson', email: 'helen@example.com' },
      { id: 'user-9', name: 'Ivan Thomas', email: 'ivan@example.com' },
      { id: 'user-10', name: 'Julia Moore', email: 'julia@example.com' },
    ];

    testUsers.forEach(user => {
      this.users.set(user.id, user);
    });
  }

  /**
   * Unary RPC: Get a single user by ID
   */
  getUser(request: GetUserRequest): GetUserResponse {
    const user = this.users.get(request.user_id);

    if (!user) {
      throw new NotFoundException(`User with ID ${request.user_id} not found`);
    }

    console.log(`[GetUser] Retrieved user: ${user.id} - ${user.name}`);
    return user;
  }

  /**
   * Server streaming RPC: List users with pagination
   */
  listUsers(request: ListUsersRequest): Observable<ListUsersResponse> {
    const pageSize = request.page_size || 10;
    const pageToken = request.page_token || '0';
    const startIndex = parseInt(pageToken, 10);

    const usersArray = Array.from(this.users.values());
    const endIndex = Math.min(startIndex + pageSize, usersArray.length);

    console.log(`[ListUsers] Streaming users from index ${startIndex} to ${endIndex}`);

    // Create an observable that emits batches of users
    return new Observable<ListUsersResponse>((observer) => {
      let currentIndex = startIndex;

      const emitBatch = () => {
        if (currentIndex >= endIndex) {
          observer.complete();
          return;
        }

        const batchSize = 2;
        const batch = usersArray.slice(
          currentIndex,
          Math.min(currentIndex + batchSize, endIndex)
        );

        const response: ListUsersResponse = {
          users: batch,
          next_page_token: currentIndex + batchSize < usersArray.length
            ? String(currentIndex + batchSize)
            : '',
        };

        console.log(`[ListUsers] Emitting batch with ${batch.length} users`);
        observer.next(response);
        currentIndex += batchSize;

        // Simulate network delay
        setTimeout(emitBatch, 100);
      };

      emitBatch();
    });
  }

  /**
   * Client streaming RPC: Create multiple users
   */
  createUsers(
    request: Observable<CreateUserRequest>
  ): Observable<ListUsersResponse> {
    return new Observable<ListUsersResponse>((observer) => {
      const createdUsers: GetUserResponse[] = [];

      const subscription = request.subscribe({
        next: (createRequest: CreateUserRequest) => {
          const newUser: GetUserResponse = {
            id: `user-${this.userIdCounter++}`,
            name: createRequest.name,
            email: createRequest.email,
          };

          this.users.set(newUser.id, newUser);
          createdUsers.push(newUser);

          console.log(`[CreateUsers] Created user: ${newUser.id} - ${newUser.name}`);
        },
        error: (error) => {
          console.error('[CreateUsers] Error:', error);
          observer.error(error);
        },
        complete: () => {
          const response: ListUsersResponse = {
            users: createdUsers,
            next_page_token: '',
          };

          console.log(`[CreateUsers] Completed. Created ${createdUsers.length} users`);
          observer.next(response);
          observer.complete();
        },
      });

      // Cleanup subscription on unsubscribe
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Bidirectional streaming RPC: Chat functionality
   */
  chat(request: Observable<StreamMessage>): Observable<StreamMessage> {
    const responseSubject = new Subject<StreamMessage>();

    console.log('[Chat] Session started');

    const subscription = request.subscribe({
      next: (message: StreamMessage) => {
        console.log(`[Chat] Received: ${message.content}`);

        // Echo the message back with server prefix
        const echoResponse: StreamMessage = {
          content: `Server echo: ${message.content}`,
          timestamp: String(Date.now()),
        };

        // Add a small delay to simulate processing
        setTimeout(() => {
          responseSubject.next(echoResponse);

          // Send additional server messages for specific keywords
          if (message.content.toLowerCase().includes('hello')) {
            const greeting: StreamMessage = {
              content: 'Server: Hello! How can I help you today?',
              timestamp: String(Date.now()),
            };
            responseSubject.next(greeting);
          }

          if (message.content.toLowerCase().includes('time')) {
            const timeMessage: StreamMessage = {
              content: `Server: Current time is ${new Date().toISOString()}`,
              timestamp: String(Date.now()),
            };
            responseSubject.next(timeMessage);
          }
        }, 50);
      },
      error: (error) => {
        console.error('[Chat] Error:', error);
        responseSubject.error(error);
      },
      complete: () => {
        console.log('[Chat] Session ended by client');
        responseSubject.complete();
      },
    });

    // Return the subject as observable and handle cleanup
    return new Observable<StreamMessage>((observer) => {
      const innerSubscription = responseSubject.subscribe(observer);

      return () => {
        subscription.unsubscribe();
        innerSubscription.unsubscribe();
      };
    });
  }
}