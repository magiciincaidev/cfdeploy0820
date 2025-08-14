'use client'

import { CallSession } from '@/src/domain/entities/CallSession'
import { CallSystemUseCase } from '@/src/domain/usecases/CallSystemUseCase'
import { CallParticipantRole, CallSessionStatus } from '@/src/shared/constants/callSession'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import OperatorCallView from './OperatorCallView'
import UserCallView from './UserCallView'

/**
 * InCallPage - 通話中画面のメインコンポーネント
 * 
 * URLパラメーター 'role' でユーザー画面とオペレーター画面を切り替え
 * - role=user: ユーザー通話画面（AI提案付きチャット）
 * - role=operator: オペレーター通話画面（既存のInCallPage UI）
 * - パラメーターなし: デフォルトでオペレーター画面
 * 
 * セッション制約:
 * - 同時ペア数は1組のみ
 * - 先に入室した参加者はwaiting状態
 * - 両方が入室した時点でセッションがアクティブになる
 * 
 * 使用方法:
 * - /in-call?role=user&userId=xxx&operatorId=yyy
 * - /in-call?role=operator&userId=xxx&operatorId=yyy
 * - /in-call (デフォルト: オペレーター画面)
 */
export default function InCallPage() {
  const searchParams = useSearchParams()
  const [userId, setUserId] = useState<string>('')
  const [operatorId, setOperatorId] = useState<string>('')
  const [conversationId, setConversationId] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [sessionStatus, setSessionStatus] = useState<CallSessionStatus>(CallSessionStatus.WAITING)
  const [isInitialized, setIsInitialized] = useState(false)
  const [callSystemUseCase] = useState(() => new CallSystemUseCase())

  // URLパラメーターからIDとロールを取得
  useEffect(() => {
    const urlUserId = searchParams.get('userId')
    const urlOperatorId = searchParams.get('operatorId')
    const urlConversationId = searchParams.get('conversationId')

    if (urlUserId && urlOperatorId) {
      setUserId(urlUserId)
      setOperatorId(urlOperatorId)
      setConversationId(urlConversationId || callSystemUseCase.generateConversationId())
    } else {
      // パラメーターがない場合はランダムIDを生成
      setUserId(callSystemUseCase.generateUniqueId())
      setOperatorId(callSystemUseCase.generateUniqueId())
      setConversationId(callSystemUseCase.generateConversationId())
    }
    setIsInitialized(true)
  }, [searchParams, callSystemUseCase])

  // セッション管理と参加者入室処理
  useEffect(() => {
    if (!isInitialized || !userId || !operatorId) return

    console.log('=== セッション管理開始 ===')
    console.log('現在の状態:', { userId, operatorId, sessionId, sessionStatus, isInitialized })

    try {
      // 既存セッションを検索（同じIDのセッションを探す）
      let existingSession = null
      const allSessions = callSystemUseCase.getAllSessions()
      console.log('既存セッション数:', allSessions.length)

      // データ構造の安全性を確保
      const validSessions = allSessions.filter(session =>
        session &&
        session.participants &&
        session.participants.user &&
        session.participants.operator
      )

      console.log('有効なセッション数:', validSessions.length)
      console.log('有効なセッション詳細:', validSessions.map(s => ({
        sessionId: s.sessionId,
        userId: s.userId,
        operatorId: s.operatorId,
        status: s.status,
        userStatus: s.participants.user.status,
        operatorStatus: s.participants.operator.status
      })))

      // 同じuserIdとoperatorIdを持つセッションを検索
      existingSession = validSessions.find((session: CallSession) =>
        session.userId === userId && session.operatorId === operatorId
      )

      if (!existingSession) {
        // 新しいセッションを作成（制約付き）
        console.log('新しいセッションを作成します...')
        const newSession = callSystemUseCase.createConstrainedSession(userId, operatorId)
        setSessionId(newSession.sessionId)
        setSessionStatus(newSession.status)
        existingSession = newSession
        console.log('新しいセッションを作成しました:', {
          sessionId: newSession.sessionId,
          status: newSession.status,
          userStatus: newSession.participants.user.status,
          operatorStatus: newSession.participants.operator.status
        })
      } else {
        // 既存セッションを使用
        console.log('既存セッションを使用します:', {
          sessionId: existingSession.sessionId,
          status: existingSession.status,
          userStatus: existingSession.participants.user.status,
          operatorStatus: existingSession.participants.operator.status
        })
        setSessionId(existingSession.sessionId)
        setSessionStatus(existingSession.status)
      }

      // 現在の参加者として入室処理
      const role = searchParams.get('role') || CallParticipantRole.OPERATOR
      console.log('入室処理開始:', { role, participantId: role === CallParticipantRole.USER ? userId : operatorId })

      const updatedSession = callSystemUseCase.joinSession(
        existingSession.sessionId,
        role === CallParticipantRole.USER ? userId : operatorId,
        role as 'user' | 'operator'
      )

      console.log('入室処理完了:', {
        role,
        sessionId: existingSession.sessionId,
        oldStatus: existingSession.status,
        newStatus: updatedSession.status,
        userStatus: updatedSession.participants.user.status,
        operatorStatus: updatedSession.participants.operator.status
      })

      setSessionStatus(updatedSession.status)

      // ページタイトルを動的に変更
      const roleText = role === CallParticipantRole.USER ? 'ユーザー' : 'オペレーター'
      document.title = `通話画面 - ${roleText} | 受架電支援AI`

    } catch (error) {
      console.error('セッション作成・入室処理に失敗:', error)
      // エラーハンドリング（制約違反など）
    }
  }, [isInitialized, userId, operatorId, callSystemUseCase, searchParams])

  // セッション状態の監視（両方入室後の状態変更を検知）
  useEffect(() => {
    if (!sessionId) return

    console.log('=== セッション状態監視開始 ===', { sessionId, currentStatus: sessionStatus })

    const checkSessionStatus = () => {
      const currentSession = callSystemUseCase.getSessionFromStorage(sessionId)
      if (currentSession) {
        console.log('セッション状態チェック:', {
          sessionId,
          currentStatus: sessionStatus,
          storedStatus: currentSession.status,
          userStatus: currentSession.participants.user.status,
          operatorStatus: currentSession.participants.operator.status,
          timestamp: new Date().toISOString()
        })

        if (currentSession.status !== sessionStatus) {
          console.log('🚨 セッション状態が変更されました:', {
            from: sessionStatus,
            to: currentSession.status,
            sessionId,
            userStatus: currentSession.participants.user.status,
            operatorStatus: currentSession.participants.operator.status,
            timestamp: new Date().toISOString()
          });
          setSessionStatus(currentSession.status)
        }
      } else {
        console.warn('セッションが見つかりません:', sessionId)
      }
    }

    // 初回チェック
    checkSessionStatus()

    // より頻繁にチェック（500ms間隔）
    const interval = setInterval(checkSessionStatus, 500)
    return () => {
      console.log('セッション状態監視を停止:', sessionId)
      clearInterval(interval)
    }
  }, [sessionId, sessionStatus, callSystemUseCase])

  // 初期化中はローディング表示
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">初期化中...</p>
        </div>
      </div>
    )
  }

  // セッションがwaiting状態の場合は待機画面を表示
  if (sessionStatus === CallSessionStatus.WAITING) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-pulse rounded-full h-16 w-16 bg-blue-600 mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">⏳</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">通話準備中</h2>
          <p className="text-gray-600 mb-4">
            もう一方の参加者の入室をお待ちください
          </p>
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-sm text-gray-500 mb-2">セッション情報:</div>
            <div className="space-y-1 text-xs">
              <div>ユーザーID: {userId}</div>
              <div>オペレーターID: {operatorId}</div>
              <div>会話ID: {conversationId}</div>
              <div>セッションID: {sessionId}</div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                💡 この画面は新しいタブで開かれています
              </div>
            </div>
            {/* デバッグ用: 手動でセッション状態をチェック */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => {
                      if (sessionId) {
                        const currentSession = callSystemUseCase.getSessionFromStorage(sessionId)
                        console.log('=== 手動チェック結果 ===')
                        console.log('現在のセッション状態:', currentSession)
                        if (currentSession) {
                          setSessionStatus(currentSession.status)
                          // 参加者状態も表示
                          console.log('参加者状態:', {
                            user: currentSession.participants.user,
                            operator: currentSession.participants.operator
                          })

                          // 両方入室チェック
                          const bothJoined = currentSession.participants.user.status === 'joined' &&
                            currentSession.participants.operator.status === 'joined'
                          console.log('両方入室チェック:', {
                            bothJoined,
                            shouldBeActive: bothJoined && currentSession.status === CallSessionStatus.WAITING
                          })
                        }
                      }
                    }}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                  >
                    状態を手動チェック
                  </button>
                  <button
                    onClick={() => {
                      console.log('=== キャッシュクリア開始 ===')
                      callSystemUseCase.clearAllSessions()
                      // ページをリロード
                      window.location.reload()
                    }}
                    className="px-3 py-1 bg-red-200 text-red-700 rounded text-xs hover:bg-red-300"
                  >
                    全キャッシュクリア
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <div>ユーザー状態: {callSystemUseCase.getSessionFromStorage(sessionId)?.participants.user.status || 'N/A'}</div>
                  <div>オペレーター状態: {callSystemUseCase.getSessionFromStorage(sessionId)?.participants.operator.status || 'N/A'}</div>
                  <div>両方入室: {(() => {
                    const session = callSystemUseCase.getSessionFromStorage(sessionId)
                    if (session) {
                      return session.participants.user.status === 'joined' &&
                        session.participants.operator.status === 'joined' ? 'YES' : 'NO'
                    }
                    return 'N/A'
                  })()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // URLパラメーターからロールを取得
  const role = searchParams.get('role') || CallParticipantRole.OPERATOR

  // デバッグ情報を表示（開発環境のみ）
  const debugInfo = process.env.NODE_ENV === 'development' && (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div><strong>DEBUG INFO:</strong></div>
      <div>Role: {searchParams.get('role') || 'operator'}</div>
      <div>User ID: {userId}</div>
      <div>Operator ID: {operatorId}</div>
      <div>Conversation ID: {conversationId}</div>
      <div>Session ID: {sessionId}</div>
      <div>Session Status: {sessionStatus}</div>
      <div>Initialized: {isInitialized ? 'true' : 'false'}</div>
      <div>URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
    </div>
  )

  // ロールに応じて表示内容を切り替え
  if (role === CallParticipantRole.USER) {
    // ユーザー通話画面
    return (
      <>
        {debugInfo}
        <UserCallView
          userId={userId}
          operatorId={operatorId}
          conversationId={conversationId}
          sessionId={sessionId}
          onLeave={() => {
            if (sessionId) {
              callSystemUseCase.leaveSession(sessionId, userId, 'user')
            }
          }}
        />
      </>
    )
  }

  // オペレーター通話画面（デフォルト）
  return (
    <>
      {debugInfo}
      <OperatorCallView
        userId={userId}
        operatorId={operatorId}
        conversationId={conversationId}
        sessionId={sessionId}
        onLeave={() => {
          if (sessionId) {
            callSystemUseCase.leaveSession(sessionId, operatorId, 'operator')
          }
        }}
      />
    </>
  )
}