import { Observable } from 'rxjs';

// Message interfaces matching the proto definitions
export interface GetUserRequest {
  user_id: string;
}

export interface GetUserResponse {
  id: string;
  name: string;
  email: string;
}

export interface ListUsersRequest {
  page_size?: number;
  page_token?: string;
}

export interface ListUsersResponse {
  users: GetUserResponse[];
  next_page_token: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface StreamMessage {
  content: string;
  timestamp: string;
}

// gRPC Service interface
export interface UserService {
  GetUser(request: GetUserRequest): Observable<GetUserResponse>;
  ListUsers(request: ListUsersRequest): Observable<ListUsersResponse>;
  CreateUsers(request: Observable<CreateUserRequest>): Observable<ListUsersResponse>;
  Chat(request: Observable<StreamMessage>): Observable<StreamMessage>;
}
