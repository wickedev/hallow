import { useEffect, useMemo } from "react";
import { useForceUpdate } from "../api/hooks";
import { isDevelopment, Optional } from "./utils";

export enum Status {
  PENDING,
  FULLFILED,
  REJECTED
}

type PromiseFactory<T> = (...args: any[]) => Promise<T>;

type ForceUpdate = () => void;

export class Resource<ARGS, T> {
  public status: Status = Status.PENDING;
  private result: Optional<T>;
  private suspender: Optional<Promise<void>>;
  public forceUpdate: Optional<ForceUpdate>;
  public initialArgs: Optional<ARGS>;

  constructor(private readonly factory: PromiseFactory<T>, initialArgs: ARGS) {
    // escape React Strict Mode fetching twice
    if (isDevelopment) {
      this.initialArgs = initialArgs;
    } else {
      this.fetch(initialArgs);
    }
  }

  public read() {
    // escape React Strict Mode fetching twice
    if (isDevelopment && this.initialArgs) {
      this.fetch(this.initialArgs);
      this.initialArgs = undefined;
    }

    switch (this.status) {
      case Status.PENDING:
        throw this.suspender;
      case Status.REJECTED:
        throw this.result;
      case Status.FULLFILED:
        return this.result;
    }
  }

  public refresh(args: ARGS) {
    this.status = Status.PENDING;
    this.suspender = undefined;
    this.result = undefined;
    this.fetch(args);
    this.forceUpdate?.();
  }

  private fetch(args: ARGS) {
    this.suspender = this.factory(args).then(
      r => {
        this.status = Status.FULLFILED;
        this.result = r;
      },
      e => {
        this.status = Status.REJECTED;
        this.result = e;
      }
    );
  }
}

export function useResource<ARGS, R>(
  factory: (req: ARGS) => Promise<R>,
  request: any
): Resource<ARGS, R> {
  const forceUpdate = useForceUpdate();
  const resource = useMemo(() => new Resource(factory, request), []);
  resource.forceUpdate = forceUpdate;

  useEffect(() => {
    if (
      resource.status === Status.FULLFILED ||
      resource.status === Status.REJECTED
    ) {
      resource.refresh(request);
    }
  }, [resource, request]);

  return resource;
}
