import { Controller } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import {
  GetUserRequest,
  GetUserResponse,
  ListUsersRequest,
  ListUsersResponse,
  CreateUserRequest,
  StreamMessage,
} from './user.interface';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'GetUser')
  getUser(request: GetUserRequest): GetUserResponse {
    return this.userService.getUser(request);
  }

  @GrpcMethod('UserService', 'ListUsers')
  listUsers(request: ListUsersRequest): Observable<ListUsersResponse> {
    return this.userService.listUsers(request);
  }

  @GrpcStreamMethod('UserService', 'CreateUsers')
  createUsers(request: Observable<CreateUserRequest>): Observable<ListUsersResponse> {
    return this.userService.createUsers(request);
  }

  @GrpcStreamMethod('UserService', 'Chat')
  chat(request: Observable<StreamMessage>): Observable<StreamMessage> {
    return this.userService.chat(request);
  }
}
