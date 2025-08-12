import { create } from 'zustand'
import { CallSession, Customer, TodoResult } from '../types'
import { mockCustomers } from '../data/mockData'

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
  
  // 認証機能
  login: async (username: string, password: string) => {
    // 簡単な認証ロジック（実際のプロダクションでは外部認証システムを使用）
    const validCredentials = [
      { username: 'user1', password: 'secret123', name: 'ユーザー1', role: 'operator' },
      { username: 'manager1', password: 'secret456', name: 'マネージャー1', role: 'supervisor' },
      { username: 'system', password: 'system789', name: 'システム管理者', role: 'admin' }
    ]
    
    const user = validCredentials.find(cred => 
      cred.username === username && cred.password === password
    )
    
    if (user) {
      set({
        isAuthenticated: true,
        currentUser: {
          id: user.username,
          name: user.name,
          role: user.role
        }
      })
      // ローカルストレージに認証情報を保存
      localStorage.setItem('auth-user', JSON.stringify({
        id: user.username,
        name: user.name,
        role: user.role
      }))
      return true
    }
    return false
  },
  
  logout: () => {
    set({
      isAuthenticated: false,
      currentUser: null,
      currentSession: null
    })
    // ローカルストレージから認証情報を削除
    localStorage.removeItem('auth-user')
  },
  
  initializeAuth: () => {
    // ローカルストレージから認証情報を復元
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('auth-user')
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser)
          set({
            isAuthenticated: true,
            currentUser: user
          })
        } catch (err) {
          // 無効なデータの場合は削除
          localStorage.removeItem('auth-user')
        }
      }
    }
  }
}))

export default useCallStore