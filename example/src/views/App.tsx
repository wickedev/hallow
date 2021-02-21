import React, { Suspense } from "react";
import { GrpcErrorBoundary } from "./GrpcErrorBoundary";
import { v4 as uuid } from "uuid";
import { hooks } from "../api/hooks";

function Greeting({greeting}: any) {
    return <pre>{JSON.stringify(greeting.read(), null, 4)}</pre>;
}

export function App() {
    const greeting = hooks.useGreeting({name: `Ryan Yang ${uuid()}`});

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
                    <Greeting greeting={greeting}/>
                </GrpcErrorBoundary>
            </Suspense>
        </div>
    );
}
