'use client'

import useCallStore from '@/src/infrastructure/store/callStore'
import { useState } from 'react'

interface LoginFormProps {
  onLoginSuccess?: () => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { login } = useCallStore()
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const success = await login(credentials.username, credentials.password)
      if (success) {
        onLoginSuccess?.()
      } else {
        setError('ユーザー名またはパスワードが正しくありません')
      }
    } catch (err) {
      setError('ログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E0E0E0',
      borderRadius: '12px',
      padding: '40px',
      maxWidth: '400px',
      margin: '0 auto',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 600,
        fontFamily: 'Inter',
        textAlign: 'center',
        marginBottom: '32px',
        color: '#333'
      }}>
        ログイン
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: 'Inter',
            marginBottom: '8px',
            color: '#333'
          }}>
            ユーザー名
          </label>
          <input
            type="text"
            value={credentials.username}
            onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #D9D9D9',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: 'Inter',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2196F3'}
            onBlur={(e) => e.target.style.borderColor = '#D9D9D9'}
            required
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: 'Inter',
            marginBottom: '8px',
            color: '#333'
          }}>
            パスワード
          </label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #D9D9D9',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: 'Inter',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2196F3'}
            onBlur={(e) => e.target.style.borderColor = '#D9D9D9'}
            required
          />
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: '#FFEBEE',
            border: '1px solid #F44336',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#D32F2F',
            fontFamily: 'Inter',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: isLoading ? '#CCC' : '#2196F3',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            fontFamily: 'Inter',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (!isLoading) e.currentTarget.style.background = '#1976D2'
          }}
          onMouseOut={(e) => {
            if (!isLoading) e.currentTarget.style.background = '#2196F3'
          }}
        >
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
    </div>
  )
}