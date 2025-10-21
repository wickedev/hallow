import { grpc } from '@improbable-eng/grpc-web';
import { Message } from 'google-protobuf';
import { Observable, Subject, Subscription } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

/**
 * Generated gRPC service stubs
 * @generated
 */

;
;
;
;

/**
 * Cancellation token for streaming operations
 */
export interface CancellationToken {
  cancel(): void;
  readonly isCancelled: boolean;
  onCancel(callback: () => void): void;
}

/**
 * Implementation of cancellation token
 */
class CancellationTokenImpl implements CancellationToken {
  private _isCancelled = false;
  private readonly cancelCallbacks: Array<() => void> = [];
  
  get isCancelled(): boolean {
    return this._isCancelled;
  }
  
  cancel(): void {
    if (this._isCancelled) return;
  }
  
  onCancel(callback: () => void): void {
    if (this._isCancelled) {
      callback();
    } else {
      this.cancelCallbacks.push(callback);
    }
  }
}

/**
 * UserService service client
 * Generated gRPC service stub with Promise and Streaming APIs
 */
export class UserServiceStub {
  private readonly client: any;
  
  constructor(private readonly baseUrl: string) {
    // Initialize gRPC-web client
    // TODO: Properly initialize with @improbable-eng/grpc-web
  }

  /**
   * Get the service base URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * RPC method GetUser (unary)
   * @param request - GetUserRequest request message
   * @returns Promise<GetUserResponse> - Response message
      }, 0);
    });
  }
  
  /**
   * RPC method ListUsers (server streaming)
   * @param request - ListUsersRequest request message
   * @returns Observable stream of ListUsersResponse messages
        }
        
        if (index < mockResponses.length) {
          observer.next(mockResponses[index++] as any);
        } else {
          clearInterval(interval);
          observer.complete();
        }
      }, 100);
      
      cancellationToken.onCancel(() => {
        clearInterval(interval);
      });
      
      // Return teardown logic
      return () => {
      };
    });
  }

  /**
   * RPC method CreateUsers (client streaming)
   * @returns Object with send method and response promise
  } {
    const requests: CreateUserRequest[] = [];
    const cancellationToken = new CancellationTokenImpl();
    let isCompleted = false;
    
    return {
        }
      },
      complete: async () => {
        if (isCompleted || cancellationToken.isCancelled) {
          throw new Error('Stream already completed or cancelled');
        }
        isCompleted = true;
        
        // TODO: Implement actual gRPC-web client streaming
        // 1. Send all accumulated requests
        // 2. Signal stream completion
        // 3. Wait for server response
        // 4. Deserialize and return response
          }
          
          // Placeholder implementation
          setTimeout(() => {
            reject(new Error('Client streaming not yet implemented for createUsers'));
          }, 0);
        });
      },
      cancel: () => {
        cancellationToken.cancel();
      }
    };
  }

  /**
   * RPC method Chat (bidirectional streaming)
   * @returns Observable stream for bidirectional streaming
  } {
    const requestSubject = new Subject<StreamMessage>();
    const responseSubject = new Subject<StreamMessage>();
    const cancellationToken = new CancellationTokenImpl();
    
    // Set up the bidirectional stream
    // TODO: Implement actual gRPC-web bidirectional streaming
    const subscription = requestSubject.pipe(
      takeUntil(responseSubject.pipe(finalize(() => cancellationToken.cancel())))
    ).subscribe({
      next: (request) => {
        // TODO: Send request to server
        console.log('Sending request:', request);
      },
      error: (err) => {
        responseSubject.error(err);
      },
      complete: () => {
        // Signal stream completion to server
        responseSubject.complete();
      }
    });
    
    cancellationToken.onCancel(() => {
      subscription.unsubscribe();
      responseSubject.complete();
    });
    
    return {
        }
      },
      responses: responseSubject.asObservable(),
      complete: () => {
        requestSubject.complete();
      },
      cancel: () => {
        cancellationToken.cancel();
      }
    };
  }

}



