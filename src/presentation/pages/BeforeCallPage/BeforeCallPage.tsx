'use client'

import useCallStore from '@/src/infrastructure/store/callStore'
import { mockCustomers, mockMemoSummaries, mockTodoItems } from '@/src/shared/data/mockData'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import PreCallPhaseScreen from '@/src/components/precall/PreCallPhaseScreen'

export default function BeforeCallPage() {
  const router = useRouter()
  const { currentCustomer, selectCustomer, startCall, isAuthenticated, initializeAuth } = useCallStore()

  // 認証チェック
  useEffect(() => {
    initializeAuth()
    if (!isAuthenticated) {
      router.push('/')
      return
    }
  }, [isAuthenticated, router, initializeAuth])

  const beforeCallTodos = mockTodoItems.filter(t => t.phase === 'before')
  const customerSummary = mockMemoSummaries.find(s => s.customerId === currentCustomer?.customerId)

  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({})
  const [showValidation, setShowValidation] = useState(false)

  const handleCheckToggle = (todoId: string, checked: boolean) => {
    setCheckedItems(prev => ({ ...prev, [todoId]: checked }))
    if (showValidation) setShowValidation(false)
  }

  const getCompletionStatus = () => {
    const requiredItems = beforeCallTodos.filter(t => t.required)
    const checkedRequired = requiredItems.filter(t => checkedItems[t.todoId])
    const allItems = beforeCallTodos.length
    const checkedAll = Object.keys(checkedItems).filter(id => checkedItems[id]).length

    return {
      required: { total: requiredItems.length, completed: checkedRequired.length },
      all: { total: allItems, completed: checkedAll },
      canStart: checkedRequired.length === requiredItems.length
    }
  }

  const handleStartCall = () => {
    const status = getCompletionStatus()
    if (!status.canStart) {
      setShowValidation(true)
      return
    }

    // Save pre-check completion to localStorage
    const preCheckData = {
      customerId: currentCustomer?.customerId,
      completedItems: checkedItems,
      completionTime: new Date().toISOString()
    }
    localStorage.setItem(`precheck-${currentCustomer?.customerId}`, JSON.stringify(preCheckData))

    startCall()
    router.push('/in-call')
  }

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

  // 新しいPreCallPhaseScreenを使用
  return (
    <PreCallPhaseScreen 
      onStartCall={() => {
        startCall()
        router.push('/in-call')
      }}
    />
  )
}