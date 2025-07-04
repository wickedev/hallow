import { SuspenseResource } from '../types';

enum Status {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
}

interface PendingResource<T> {
  status: Status.PENDING;
  promise: Promise<T>;
}

interface FulfilledResource<T> {
  status: Status.FULFILLED;
  value: T;
}

interface RejectedResource<T> {
  status: Status.REJECTED;
  error: Error;
}

type ResourceState<T> =
  | PendingResource<T>
  | FulfilledResource<T>
  | RejectedResource<T>;

export function createSuspenseResource<T>(
  promise: Promise<T>
): SuspenseResource<T> {
  let resource: ResourceState<T> = {
    status: Status.PENDING,
    promise: promise.then(
      value => {
        resource = { status: Status.FULFILLED, value };
        return value;
      },
      error => {
        resource = { status: Status.REJECTED, error };
        throw error;
      }
    ),
  };

  return {
    read(): T {
      switch (resource.status) {
        case Status.PENDING:
          throw resource.promise;
        case Status.FULFILLED:
          return resource.value;
        case Status.REJECTED:
          throw resource.error;
      }
    },
  };
}
