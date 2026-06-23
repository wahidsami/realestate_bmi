import React from 'react';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Render Error]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-6">
          <div className="max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
            <h1 className="text-2xl font-black">Something went wrong</h1>
            <p className="mt-3 text-sm text-slate-300">
              The application hit a rendering error. Please refresh the page. If the issue repeats, check the console output for the failing endpoint or component.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
