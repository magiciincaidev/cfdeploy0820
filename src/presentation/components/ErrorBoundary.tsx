'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    // エラーレポートをサーバーに送信（本番環境では実装）
    if (process.env.NODE_ENV === 'production') {
      // 実際のエラー追跡サービス（Sentry等）に送信
      console.log('Error would be reported to error tracking service')
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FCFCFC',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #F44336',
            borderRadius: '12px',
            padding: '40px',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              ⚠️
            </div>
            
            <h2 style={{
              fontSize: '24px',
              fontWeight: 600,
              marginBottom: '16px',
              color: '#333'
            }}>
              申し訳ございません
            </h2>
            
            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              予期しないエラーが発生しました。<br />
              ページを再読み込みしてお試しください。
            </p>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: '#2196F3',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#1976D2'}
              onMouseOut={(e) => e.currentTarget.style.background = '#2196F3'}
            >
              ページを再読み込み
            </button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginTop: '20px',
                textAlign: 'left',
                background: '#F5F5F5',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#666'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                  開発者情報（本番環境では非表示）
                </summary>
                <pre style={{
                  marginTop: '12px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary