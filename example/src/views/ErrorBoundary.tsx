import React, { ReactNode } from "react";
import { IgRPCError } from "../api/greeting-stub";

export class ErrorBoundary extends React.Component<{}, { error?: IgRPCError }> {
  constructor(props: {}) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(
    previousProps: { children: ReactNode },
    previousState: { error?: IgRPCError }
  ) {
    if (previousProps.children !== this.props.children) {
      this.setState({ error: undefined });
    }
  }

  static getDerivedStateFromError(error: IgRPCError) {
    return { error };
  }

  render() {
    const error = this.state.error;
    if (error) {
      return (
        <div style={{ color: "#c7384b" }}>
          {toString(error)}
          {error.metadata.throwable && (
            <pre>{JSON.stringify(error.metadata.throwable, null, 4)}</pre>
          )}
        </div>
      ) as any;
    }

    return this.props.children as any;
  }
}

function toString(error: IgRPCError) {
  return typeof error === "object" ? error.message : error;
}