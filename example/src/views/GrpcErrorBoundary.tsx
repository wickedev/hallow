import React, { ReactNode } from "react";
import { IgRPCError } from "../api/greeting-stub";

export class GrpcErrorBoundary extends React.Component<{}, { error?: IgRPCError }> {
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
          <div>message: {error.message}</div>
          <div>status: {error.status}</div>

          {error.metadata.throwable && (
            <>
              <div>throwable: {error.metadata.throwable.originalMessage}</div>
              <pre>{JSON.stringify(error.metadata.throwable, null, 4)}</pre>
            </>
          )}
        </div>
      ) as any;
    }

    return this.props.children as any;
  }
}
