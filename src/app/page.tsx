'use client'

import useCallStore from '@/src/infrastructure/store/callStore'
import LoginForm from '@/src/presentation/components/LoginForm'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const { currentCustomer, currentSession, getPhase, isAuthenticated, currentUser, logout, initializeAuth } = useCallStore()
  const phase = getPhase()
  const [showDemo, setShowDemo] = useState(false)

  // 認証状態を初期化
  useEffect(() => {
    initializeAuth()
  }, [])

  const handleDemoStart = () => {
    setShowDemo(true)
    // デモ画面に遷移
    router.push('/demo')
  }

  const features = [
    {
      id: 'before-call',
      title: '通話前確認',
      description: '顧客情報と通話前TODOリストを確認し、効率的な通話準備を行います',
      icon: null,
      color: '#2196F3',
      path: '/before-call'
    },
    {
      id: 'in-call',
      title: '通話中支援',
      description: '手続き別のTODO・スクリプト・ナレッジを表示し、通話をリアルタイムでサポート',
      icon: null,
      color: '#4CAF50',
      path: '/in-call',
      disabled: !currentSession
    },
    {
      id: 'after-call',
      title: '通話後処理',
      description: '通話結果の確認と事後処理TODOの管理で、漏れのないフォローアップ',
      icon: null,
      color: '#FF9800',
      path: '/after-call',
      disabled: !currentSession?.endTime
    }
  ]

  const handleFeatureClick = (feature: typeof features[0]) => {
    if (feature.disabled) return
    router.push(feature.path)
  }

  const handleLogout = () => {
    logout()
  }

  // 認証されていない場合はログインフォームを表示
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FCFCFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '500px', padding: '20px' }}>
          <LoginForm />
        </div>
      </div>
    )
  }

  // 認証済みの場合は直接メイン画面へ
  router.push('/before-call')
  return null
}