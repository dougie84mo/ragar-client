import React, { Component, type ReactNode } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI or default error message
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="page-background">
          <div className="container mx-auto p-6">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center">
                  ⚠️ Something went wrong
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-secondary">
                  An unexpected error occurred while rendering this page. This is likely a temporary issue.
                </p>
                
                {this.state.error && (
                  <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded border">
                    <summary className="cursor-pointer font-medium text-sm">
                      Error Details (Click to expand)
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto text-red-600">
                      {this.state.error.toString()}
                    </pre>
                  </details>
                )}
                
                <div className="flex space-x-3">
                  <Button
                    onClick={() => this.setState({ hasError: false, error: undefined })}
                    className="flex-1"
                  >
                    🔄 Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                    className="flex-1"
                  >
                    🏠 Go Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
