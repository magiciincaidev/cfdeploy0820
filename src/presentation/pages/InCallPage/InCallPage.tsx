'use client'

import useCallStore from '@/src/infrastructure/store/callStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import CallSupportScreen from '@/src/components/call/CallSupportScreen'

export default function InCallPage() {
  const router = useRouter()
  const { isAuthenticated, initializeAuth } = useCallStore()

  // 認証チェック
  useEffect(() => {
    initializeAuth()
    if (!isAuthenticated) {
      router.push('/')
      return
    }
  }, [isAuthenticated, router, initializeAuth])

  // 認証されていない場合はローディング表示
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#FCFCFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#666',
          fontFamily: 'Inter'
        }}>
          認証を確認中...
        </div>
      </div>
    )
  }

  // CallSupportScreenを使用
  return <CallSupportScreen />
}