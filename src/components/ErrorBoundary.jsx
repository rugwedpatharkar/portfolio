import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
          <p className="text-secondary text-sm">
            Something went wrong loading this section.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-white text-sm bg-tertiary px-4 py-2 rounded-lg border border-secondary/30 hover:border-secondary/60 transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
