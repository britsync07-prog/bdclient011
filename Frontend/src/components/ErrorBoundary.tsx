"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ERROR_BOUNDARY_MESSAGES } from "@/constants";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🎰</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {ERROR_BOUNDARY_MESSAGES.SOMETHING_WENT_WRONG}
              </h2>
              <p className="text-slate-600 mb-4">
                {ERROR_BOUNDARY_MESSAGES.SOMETHING_UNEXPECTED_HAPPENED}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 cursor-pointer"
              >
                {ERROR_BOUNDARY_MESSAGES.RELOAD_PAGE}
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
