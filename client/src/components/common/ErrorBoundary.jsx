import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
          <div className="card p-10 text-center max-w-md w-full">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-extrabold text-ink mb-2">Something went wrong</h2>
            <p className="text-sm text-ink-muted mb-4 font-mono bg-surface-100 rounded-lg p-3 text-left break-all">
              {this.state.error.message}
            </p>
            <button
              onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
              className="btn btn-primary btn-md"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
