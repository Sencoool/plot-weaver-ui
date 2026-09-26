import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  message: string | null;
}

/**
 * Catches render-time errors so one bad component cannot blank the whole app.
 * Without this, any throw inside a page unmounts the entire tree and the user
 * sees a white screen with no way back.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: unknown): State {
    return {
      message: error instanceof Error ? error.message : 'Unexpected error',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.message) {
      return (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              marginTop: '0.5rem',
            }}
          >
            {this.state.message}
          </p>
          <button
            onClick={() => {
              this.setState({ message: null });
              window.location.reload();
            }}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-base)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
