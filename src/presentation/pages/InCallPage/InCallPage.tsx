'use client'

import { CallSystemUseCase } from '@/src/domain/usecases/CallSystemUseCase'
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
 * 使用方法:
 * - /in-call?role=user&userId=xxx&operatorId=yyy
 * - /in-call?role=operator
 * - /in-call (デフォルト: オペレーター画面)
 */
export default function InCallPage() {
  const searchParams = useSearchParams()
  const [userId, setUserId] = useState<string>('')
  const [operatorId, setOperatorId] = useState<string>('')
  const [conversationId, setConversationId] = useState<string>('')
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

  // URLパラメーターからロールを取得
  const role = searchParams.get('role') || 'operator'

  // ロールに応じて表示内容を切り替え
  if (role === 'user') {
    // ユーザー通話画面
    return (
      <UserCallView
        userId={userId}
        operatorId={operatorId}
        conversationId={conversationId}
      />
    )
  }

  // オペレーター通話画面（デフォルト）
  return (
    <OperatorCallView
      userId={userId}
      operatorId={operatorId}
      conversationId={conversationId}
    />
  )
}