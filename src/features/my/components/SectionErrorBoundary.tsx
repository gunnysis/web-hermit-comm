'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  sectionName: string
}

interface State {
  hasError: boolean
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // dynamic import to avoid circular deps
    import('@/lib/logger').then(({ logger }) => {
      logger.error(`[${this.props.sectionName}]`, error, errorInfo)
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl px-4 py-3 bg-muted">
          <p className="text-xs text-muted-foreground">
            {this.props.sectionName} 섹션을 불러올 수 없어요
          </p>
          <button
            onClick={this.handleRetry}
            className="mt-1.5 text-xs text-muted-foreground underline hover:text-foreground transition-colors"
          >
            다시 시도
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
