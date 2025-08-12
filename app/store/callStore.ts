import { create } from 'zustand'
import { CallSession, Customer, TodoResult } from '../types'
import { mockCustomers } from '../data/mockData'

interface CallStore {
  // 現在のセッション情報
  currentSession: CallSession | null
  currentCustomer: Customer | null
  
  // アクション
  selectCustomer: (customerId: string) => void
  startCall: () => void
  endCall: () => void
  selectProcedures: (procedureIds: string[]) => void
  toggleTodo: (todoId: string, checked: boolean, note?: string) => void
  getTodoResults: () => TodoResult[]
  getPhase: () => 'before' | 'during' | 'after'
  resetSession: () => void
}

const useCallStore = create<CallStore>((set, get) => ({
  currentSession: null,
  currentCustomer: mockCustomers[0], // デフォルトで最初の顧客を選択
  
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
  }
}))

export default useCallStore