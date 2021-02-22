export interface IGreeting {
  readonly message: string;
  readonly created?: string;
}

export interface IGreetingRequest {
  readonly name: string;
}

export interface IGreetingResponse {
  readonly greeting: IGreeting[];
}
