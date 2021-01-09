import React, { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { v4 as uuid } from "uuid";
import { hooks } from "../api/hooks";

function Greeting({ greeting }: any) {
  return <pre>{JSON.stringify(greeting.read(), null, 4)}</pre>;
}

export function App() {
  const [id, setID] = useState(uuid());

  useEffect(() => {
    const disposable = setInterval(() => {
      setID(uuid());
    }, 10000);

    return () => {
      clearInterval(disposable);
    };
  });

  const greeting = hooks.useGreeting({ name: id });
  return (
    <div>
      <button
        onClick={() => {
          greeting.refresh({ name: uuid() });
        }}
      >
        Refresh
      </button>

      <ErrorBoundary>
        <Suspense fallback={<p>loading</p>}>
          <Greeting greeting={greeting} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
