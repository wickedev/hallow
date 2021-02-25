import React, { Suspense } from "react";
import { GrpcErrorBoundary } from "./GrpcErrorBoundary";
import { v4 as uuid } from "uuid";
import { isDevelopment } from "../api/utils";
import { GreeterStub } from "../api/greeting";

const greetingStub = new GreeterStub({
  host: isDevelopment ? "/api" : "http://localhost:8080",
});

function Greeting({ greeting }: any) {
  return <pre>{JSON.stringify(greeting.read(), null, 4)}</pre>;
}

export function App() {
  const greeting = greetingStub.useGreeting({ name: `Ryan Yang ${uuid()}` });

  return (
    <div>
      <button
        onClick={() => {
          greeting.refresh();
        }}
      >
        Refresh
      </button>
      <Suspense fallback={<p>loading</p>}>
        <GrpcErrorBoundary>
          <Greeting greeting={greeting} />
        </GrpcErrorBoundary>
      </Suspense>
    </div>
  );
}
