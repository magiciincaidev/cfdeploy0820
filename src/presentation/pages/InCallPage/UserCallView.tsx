'use client'

import { ConversationMessage } from '@/src/domain/entities/CallSession';
import { CallSystemUseCase } from '@/src/domain/usecases/CallSystemUseCase';
import { useEffect, useState } from 'react';

interface UserCallViewProps {
    userId: string;
    operatorId: string;
    conversationId: string;
}

export default function UserCallView({ userId, operatorId, conversationId }: UserCallViewProps) {
    const [userMessage, setUserMessage] = useState('')
    const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [callSystemUseCase] = useState(() => new CallSystemUseCase())

    // 初期化時に会話履歴を読み込み
    useEffect(() => {
        const savedHistory = callSystemUseCase.getConversationHistory(conversationId)
        if (savedHistory.length > 0) {
            setConversationHistory(savedHistory)
        }
    }, [conversationId, callSystemUseCase])

    // ユーザーメッセージを送信
    const handleSendMessage = async () => {
        if (!userMessage.trim()) return

        setIsLoading(true)

        const messageId = callSystemUseCase.generateUniqueId()
        const timestamp = new Date().toISOString()

        // ユーザーメッセージを会話履歴に追加
        const userMessageObj: ConversationMessage = {
            id: messageId,
            timestamp,
            sender: 'user',
            message: userMessage
        }

        const newHistory = [...conversationHistory, userMessageObj]
        setConversationHistory(newHistory)
        callSystemUseCase.saveConversationHistory(conversationId, newHistory)

        try {
            // AIから次のアクションを取得
            const conversationTexts = newHistory.map(msg => `${msg.sender}: ${msg.message}`)
            const aiResponse = await callSystemUseCase.processUserMessage(
                userId,
                operatorId,
                conversationId,
                userMessage,
                conversationTexts
            )

            // AI提案を会話履歴に追加
            const aiMessageObj: ConversationMessage = {
                id: callSystemUseCase.generateUniqueId(),
                timestamp: new Date().toISOString(),
                sender: 'ai',
                message: `AI提案: ${aiResponse.action}`,
                aiSuggestion: {
                    action: aiResponse.action,
                    priority: aiResponse.priority,
                    description: aiResponse.description,
                    suggestedResponse: aiResponse.suggestedResponse,
                    confidence: aiResponse.confidence,
                    timestamp: aiResponse.timestamp
                }
            }

            const updatedHistory = [...newHistory, aiMessageObj]
            setConversationHistory(updatedHistory)
            callSystemUseCase.saveConversationHistory(conversationId, updatedHistory)

        } catch (error) {
            console.error('AI応答の取得に失敗:', error)
            const errorMessageObj: ConversationMessage = {
                id: callSystemUseCase.generateUniqueId(),
                timestamp: new Date().toISOString(),
                sender: 'ai',
                message: 'エラー: AI応答の取得に失敗しました'
            }

            const updatedHistory = [...newHistory, errorMessageObj]
            setConversationHistory(updatedHistory)
            callSystemUseCase.saveConversationHistory(conversationId, updatedHistory)
        } finally {
            setIsLoading(false)
            setUserMessage('')
        }
    }

    // Enterキーでメッセージ送信
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ヘッダー */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">ユーザー通話画面</h1>
                        <div className="text-sm text-gray-600">
                            <div>ユーザーID: {userId}</div>
                            <div>オペレーターID: {operatorId}</div>
                            <div>会話ID: {conversationId}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 左側: 会話履歴 */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">会話履歴</h2>

                            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                                {conversationHistory.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">会話を開始してください</p>
                                ) : (
                                    conversationHistory.map((message) => (
                                        <div key={message.id} className={`p-3 rounded-lg ${message.sender === 'user' ? 'bg-blue-50 ml-8' :
                                            message.sender === 'operator' ? 'bg-green-50 mr-8' : 'bg-yellow-50'
                                            }`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-medium px-2 py-1 rounded ${message.sender === 'user' ? 'bg-blue-200 text-blue-800' :
                                                    message.sender === 'operator' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                                                    }`}>
                                                    {message.sender === 'user' ? 'ユーザー' :
                                                        message.sender === 'operator' ? 'オペレーター' : 'AI'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(message.timestamp).toLocaleTimeString('ja-JP')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700">{message.message}</p>

                                            {/* AI提案の詳細表示 */}
                                            {message.aiSuggestion && (
                                                <div className="mt-2 p-2 bg-yellow-100 rounded border-l-4 border-yellow-400">
                                                    <div className="text-xs font-medium text-yellow-800 mb-1">
                                                        推奨アクション: {message.aiSuggestion.action}
                                                    </div>
                                                    <div className="text-xs text-yellow-700">
                                                        優先度: {message.aiSuggestion.priority === 'high' ? '高' :
                                                            message.aiSuggestion.priority === 'medium' ? '中' : '低'}
                                                    </div>
                                                    <div className="text-xs text-yellow-700">
                                                        信頼度: {message.aiSuggestion.confidence}%
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* メッセージ入力 */}
                            <div className="flex gap-3">
                                <textarea
                                    value={userMessage}
                                    onChange={(e) => setUserMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="メッセージを入力してください..."
                                    className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !userMessage.trim()}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading ? '送信中...' : '送信'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 右側: 通話情報 */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">通話情報</h2>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">通話状態</h3>
                                    <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                        通話中
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">通話時間</h3>
                                    <p className="text-gray-700 text-sm">
                                        {new Date().toLocaleTimeString('ja-JP')}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">メッセージ数</h3>
                                    <p className="text-gray-700 text-sm">
                                        {conversationHistory.length} 件
                                    </p>
                                </div>

                                <div className="pt-4 border-t">
                                    <h3 className="font-medium text-gray-900 mb-2">使用方法</h3>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        <li>• メッセージを入力して送信</li>
                                        <li>• AIが次のアクションを提案</li>
                                        <li>• 会話履歴は自動保存</li>
                                        <li>• Enterキーで素早く送信</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
