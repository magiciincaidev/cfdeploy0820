import { create } from 'zustand'
import { mockCustomers } from '../data/mockData'
import { CallSession, Customer, TodoResult } from '../types'

interface CallStore {
    // 現在のセッション情報
    currentSession: CallSession | null
    currentCustomer: Customer | null

    // 認証情報
    isAuthenticated: boolean
    currentUser: { id: string, name: string, role: string } | null

    // アクション
    selectCustomer: (customerId: string) => void
    startCall: () => void
    endCall: () => void
    selectProcedures: (procedureIds: string[]) => void
    toggleTodo: (todoId: string, checked: boolean, note?: string) => void
    getTodoResults: () => TodoResult[]
    getPhase: () => 'before' | 'during' | 'after'
    resetSession: () => void

    // 認証アクション
    login: (username: string, password: string) => Promise<boolean>
    logout: () => void
    initializeAuth: () => void
}

const useCallStore = create<CallStore>((set, get) => ({
    currentSession: null,
    currentCustomer: mockCustomers[0], // デフォルトで最初の顧客を選択

    // 認証の初期状態
    isAuthenticated: false,
    currentUser: null,

    selectCustomer: (customerId: string) => {
        const customer = mockCustomers.find(c => c.customerId === customerId)
        set({ currentCustomer: customer })
    },

    startCall: () => {
        const { currentCustomer } = get()
        if (!currentCustomer) return

        const newSession: CallSession = {
            sessionId: `session-${Date.now()}`,
            customerId: currentCustomer.customerId,
            startTime: new Date(),
            endTime: null,
            selectedProcedures: ['p1'], // デフォルトで「一時約束」を選択
            todoResults: [],
            phase: 'during'
        }
        set({ currentSession: newSession })
    },

    endCall: () => {
        const { currentSession } = get()
        if (!currentSession) return

        set({
            currentSession: {
                ...currentSession,
                endTime: new Date(),
                phase: 'after'
            }
        })
    },

    selectProcedures: (procedureIds: string[]) => {
        const { currentSession } = get()
        if (!currentSession) return

        set({
            currentSession: {
                ...currentSession,
                selectedProcedures: procedureIds
            }
        })
    },

    toggleTodo: (todoId: string, checked: boolean, note?: string) => {
        const { currentSession } = get()
        if (!currentSession) return

        const existingResults = currentSession.todoResults.filter(r => r.todoId !== todoId)
        const newResult: TodoResult = {
            todoId,
            checked,
            note,
            timestamp: new Date(),
            operatorId: 'op1'
        }

        set({
            currentSession: {
                ...currentSession,
                todoResults: [...existingResults, newResult]
            }
        })
    },

    getTodoResults: () => {
        const { currentSession } = get()
        return currentSession?.todoResults || []
    },

    getPhase: () => {
        const { currentSession } = get()
        if (!currentSession) return 'before'
        return currentSession.phase
    },

    resetSession: () => {
        set({ currentSession: null })
    },

    // セキュアな認証機能
    login: async (username: string, password: string) => {
        try {
            // 動的インポートでサーバーサイド認証を使用
            const { authenticate, generateSessionToken } = await import('../lib/auth')

            const user = await authenticate(username, password)

            if (user) {
                // セッショントークンを生成（非同期対応）
                const sessionToken = await generateSessionToken(user)

                set({
                    isAuthenticated: true,
                    currentUser: user
                })

                // セキュアなセッション情報をlocalStorageに保存
                const sessionData = {
                    user,
                    token: sessionToken,
                    timestamp: Date.now()
                }

                localStorage.setItem('auth-session', JSON.stringify(sessionData))
                return true
            }

            return false
        } catch (error) {
            console.error('Login error:', error)
            return false
        }
    },

    logout: () => {
        set({
            isAuthenticated: false,
            currentUser: null,
            currentSession: null
        })
        // セキュアなセッション情報を削除
        localStorage.removeItem('auth-session')
        localStorage.removeItem('auth-user') // 旧バージョンとの互換性
    },

    initializeAuth: async () => {
        // セキュアなセッション復元
        if (typeof window !== 'undefined') {
            const sessionData = localStorage.getItem('auth-session')
            if (sessionData) {
                try {
                    const { user, token, timestamp } = JSON.parse(sessionData)

                    // セッションの有効期限をチェック（24時間）
                    const sessionAge = Date.now() - timestamp
                    const maxAge = 24 * 60 * 60 * 1000 // 24時間

                    if (sessionAge > maxAge) {
                        // セッション期限切れ
                        localStorage.removeItem('auth-session')
                        return
                    }

                    // トークン検証（動的インポート、非同期対応）
                    try {
                        const { verifySessionToken } = await import('../lib/auth')
                        const userData = JSON.stringify({ user, timestamp })

                        const isValidToken = await verifySessionToken(token, userData)
                        if (isValidToken) {
                            set({
                                isAuthenticated: true,
                                currentUser: user
                            })
                        } else {
                            // 無効なトークン
                            localStorage.removeItem('auth-session')
                        }
                    } catch (importError) {
                        // サーバーサイドでのエラー処理
                        console.error('Auth verification error:', importError)
                        localStorage.removeItem('auth-session')
                    }
                } catch (err) {
                    // 無効なデータの場合は削除
                    localStorage.removeItem('auth-session')
                }
            }

            // 旧バージョンのauth-userがあれば削除
            const oldAuth = localStorage.getItem('auth-user')
            if (oldAuth) {
                localStorage.removeItem('auth-user')
            }
        }
    }
}))

export default useCallStore