import React from 'react';
import { RefreshCw, Home, ShieldAlert } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 shadow-xl p-6 sm:p-8 space-y-6 text-center">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
              <ShieldAlert size={28} />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                Something went wrong
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                An unexpected interface error occurred. Your civic reports and data remain safe.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <RefreshCw size={14} />
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium text-xs rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-neutral-400/20"
              >
                <Home size={14} />
                Return to Home
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="text-left bg-neutral-50 rounded-xl p-3 border border-neutral-200/80 text-[11px] text-neutral-700 space-y-1">
                <summary className="cursor-pointer font-semibold text-neutral-600 select-none">
                  Technical Details
                </summary>
                <p className="font-mono text-red-600 break-words mt-1">{this.state.error?.toString()}</p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="mt-2 text-[10px] text-neutral-500 overflow-x-auto p-2 bg-neutral-100 rounded">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

