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

  // 通話画面用の共有IDを生成
  const [sharedIds, setSharedIds] = useState(() => {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const operatorId = `operator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return { userId, operatorId, conversationId }
  })

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
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'Inter', margin: 0, color: '#333' }}>
              受架電支援AI -α版検証サイト
            </h1>
            <p style={{ fontSize: '16px', color: '#666', fontFamily: 'Inter', marginTop: '16px' }}>
              システムを利用するにはログインが必要です
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FCFCFC' }}>
      {/* Header */}
      <div style={{
        background: '#FFFFFF',
        boxShadow: '0px 0px 11px rgba(0,0,0,0.25)',
        padding: '40px 0'
      }}>
        <div style={{ width: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          {/* ユーザー情報とログアウト */}
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#666',
              fontFamily: 'Inter'
            }}>
              ログイン中: <span style={{ fontWeight: 600, color: '#333' }}>{currentUser?.name}</span> ({currentUser?.role})
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                background: '#F44336',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'Inter',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#D32F2F'}
              onMouseOut={(e) => e.currentTarget.style.background = '#F44336'}
            >
              ログアウト
            </button>
          </div>

          <h1 style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'Inter', margin: 0, color: '#333' }}>
            受架電支援AI -α版検証サイト
          </h1>

          {/* α版にアクセスするボタン */}
          <div style={{ marginTop: '32px' }}>
            <Link
              href="/before-call"
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                background: '#2196F3',
                color: '#FFFFFF',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: 'Inter',
                transition: 'all 0.3s ease'
              }}
            >
              α版にアクセスする
            </Link>
          </div>

          {/* オペレーター通話画面ボタン */}
          <div style={{ marginTop: '12px' }}>
            <Link
              href={`/in-call?role=operator&userId=${sharedIds.userId}&operatorId=${sharedIds.operatorId}&conversationId=${sharedIds.conversationId}`}
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                background: 'green',
                color: '#FFFFFF',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: 'Inter',
                transition: 'all 0.3s ease'
              }}
            >
              オペレーター通話画面
            </Link>
          </div>

          {/* ユーザー通話画面ボタン */}
          <div style={{ marginTop: '12px' }}>
            <Link
              href={`/in-call?role=user&userId=${sharedIds.userId}&operatorId=${sharedIds.operatorId}&conversationId=${sharedIds.conversationId}`}
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                background: '#FF9800',
                color: '#FFFFFF',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: 'Inter',
                transition: 'all 0.3s ease'
              }}
            >
              ユーザー通話画面
            </Link>
          </div>


          {/* Demo Button - 一時的に非表示 */}
          {false && (
            <div style={{ marginTop: '32px' }}>
              <button
                onClick={handleDemoStart}
                style={{
                  padding: '16px 32px',
                  background: '#2196F3',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: 600,
                  fontFamily: 'Inter',
                  cursor: 'pointer'
                }}
              >
                デモンストレーション開始
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pulse Animation CSS */}
      <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3); }
          50% { box-shadow: 0 8px 25px rgba(255, 107, 107, 0.6), 0 0 0 10px rgba(255, 107, 107, 0.1); }
          100% { box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3); }
        }
      `}</style>

      {/* Feature Cards */}
      <div style={{ width: '1200px', margin: '40px auto', padding: '0 20px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {/* 前 */}
          <div style={{
            background: '#FFF',
            border: '1px solid #E0E0E0',
            borderRadius: '12px',
            padding: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: '#2196F3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontSize: '24px',
                fontWeight: 600
              }}>
                前
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 600, fontFamily: 'Inter', margin: 0 }}>
                通話前確認
              </h3>
            </div>
            <p style={{ fontSize: '16px', color: '#666', fontFamily: 'Inter', lineHeight: '1.5', margin: 0 }}>
              顧客情報と通話前TODOリストを確認し、効率的な通話準備支援
            </p>
          </div>

          {/* 中 */}
          <div style={{
            background: '#FFF',
            border: '1px solid #E0E0E0',
            borderRadius: '12px',
            padding: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: '#4CAF50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontSize: '24px',
                fontWeight: 600
              }}>
                中
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 600, fontFamily: 'Inter', margin: 0 }}>
                通話中支援
              </h3>
            </div>
            <p style={{ fontSize: '16px', color: '#666', fontFamily: 'Inter', lineHeight: '1.5', margin: 0 }}>
              手続き別のTODO・スクリプト・ナレッジを表示し、通話を支援
            </p>
          </div>

          {/* 後 */}
          <div style={{
            background: '#FFF',
            border: '1px solid #E0E0E0',
            borderRadius: '12px',
            padding: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: '#FF9800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontSize: '24px',
                fontWeight: 600
              }}>
                後
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 600, fontFamily: 'Inter', margin: 0 }}>
                通話後処理
              </h3>
            </div>
            <p style={{ fontSize: '16px', color: '#666', fontFamily: 'Inter', lineHeight: '1.5', margin: 0 }}>
              通話結果の確認と事後処理TODOの管理支援
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}