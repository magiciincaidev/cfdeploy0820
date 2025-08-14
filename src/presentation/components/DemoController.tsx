'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import CallingScreen from './CallingScreen'

interface DemoStep {
  id: string
  description: string
  action: 'navigate' | 'click' | 'select' | 'wait' | 'calling'
  target?: string
  value?: string
  duration: number
  telop: string
}

const demoSteps: DemoStep[] = [
  { id: '1', description: 'Navigate to before-call', action: 'navigate', target: '/before-call', duration: 2000, telop: '通話前確認画面に移動します' },
  { id: '2', description: 'Select customer', action: 'select', target: 'select', value: '1', duration: 2000, telop: '顧客「山田太郎」さんを選択します' },
  { id: '3', description: 'Check first item', action: 'click', target: 'input[type="checkbox"]:nth-of-type(1)', duration: 2000, telop: '前回の約束内容を確認しました' },
  { id: '4', description: 'Check second item', action: 'click', target: 'input[type="checkbox"]:nth-of-type(2)', duration: 2000, telop: '顧客の支払い履歴を確認しました' },
  { id: '5', description: 'Check third item', action: 'click', target: 'input[type="checkbox"]:nth-of-type(3)', duration: 2000, telop: '返済可能額の目安を把握しました' },
  { id: '6', description: 'Check fourth item', action: 'click', target: 'input[type="checkbox"]:nth-of-type(4)', duration: 2000, telop: '交渉材料の準備ができました' },
  { id: '7', description: 'Start call', action: 'click', target: 'button:contains("通話を開始"), button[onclick*="handleStartCall"], button:last-of-type', duration: 2000, telop: '通話を開始します' },
  { id: '8', description: 'Calling screen', action: 'calling', duration: 3000, telop: '顧客に発信中です...' },
  { id: '9', description: 'Navigate to in-call', action: 'navigate', target: '/in-call', duration: 3000, telop: '通話が接続されました。手続き選択画面に移動します' },
  { id: '10', description: 'Select procedure', action: 'select', target: 'select', value: 'p1', duration: 3000, telop: '手続き「一時約束」を選択します' },
  { id: '11', description: 'Check todo 1', action: 'click', target: 'input[type="checkbox"]:nth-of-type(1)', duration: 3000, telop: '本人確認が完了しました' },
  { id: '12', description: 'Check todo 2', action: 'click', target: 'input[type="checkbox"]:nth-of-type(2)', duration: 3000, telop: '要件説明を行いました' },
  { id: '13', description: 'Check todo 3', action: 'click', target: 'input[type="checkbox"]:nth-of-type(3)', duration: 4000, telop: '返済交渉を実施しました' },
  { id: '14', description: 'Navigate to after-call', action: 'navigate', target: '/after-call', duration: 3000, telop: '通話を終了し、事後処理画面に移動します' },
  { id: '15', description: 'Show results', action: 'wait', duration: 3000, telop: '通話結果を確認しています' },
  { id: '16', description: 'Demo complete', action: 'wait', duration: 4000, telop: 'システムが自動的に事後処理TODOを生成しました。デモ完了です！' }
]

interface DemoControllerProps {
  currentStep: number
  onStepChange: (step: number) => void
}

export default function DemoController({ currentStep, onStepChange }: DemoControllerProps) {
  const router = useRouter()
  const [internalStep, setInternalStep] = useState(0)
  const [showCallingScreen, setShowCallingScreen] = useState(false)
  const [currentPage, setCurrentPage] = useState('/before-call')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // 顧客データを準備
  const customerData = {
    name: '山田太郎',
    accountNumber: '7110-00433(6471)'
  }
  
  // 現在のステップデータ
  const currentStepData = demoSteps[internalStep]
  
  useEffect(() => {
    onStepChange(internalStep)
  }, [internalStep, onStepChange])
  
  // デモを自動実行
  useEffect(() => {
    if (currentStepData) {
      executeStep(currentStepData)
    }
  }, [internalStep])
  
  const executeStep = async (step: DemoStep) => {
    console.log(`Executing step ${internalStep + 1}: ${step.description}`)
    
    switch (step.action) {
      case 'navigate':
        if (step.target && step.target !== currentPage) {
          setCurrentPage(step.target)
          // ページ遷移後、少し待ってから次のステップ
          await new Promise(resolve => setTimeout(resolve, 1500))
        }
        break
        
      case 'calling':
        setShowCallingScreen(true)
        setTimeout(() => {
          setShowCallingScreen(false)
        }, step.duration)
        break
        
      case 'click':
      case 'select':
        // iframe内の要素を操作
        await executeActionInIframe(step)
        break
        
      case 'wait':
        // 待機のみ
        break
    }
    
    // 指定時間後に次のステップに進む
    stepTimerRef.current = setTimeout(() => {
      if (internalStep < demoSteps.length - 1) {
        setInternalStep(prev => prev + 1)
      }
    }, step.duration)
  }
  
  const executeActionInIframe = async (step: DemoStep) => {
    if (!iframeRef.current?.contentWindow) return
    
    try {
      const iframeDoc = iframeRef.current.contentDocument
      if (!iframeDoc) return
      
      await new Promise(resolve => setTimeout(resolve, 800)) // カーソル移動待機
      
      let element: HTMLElement | null = null
      
      if (step.action === 'click' && step.target) {
        // 複数のセレクターを試す（型安全性向上）
        const selectors = step.target.split(', ')
        for (const selector of selectors) {
          const foundElement = iframeDoc.querySelector(selector.trim())
          if (foundElement && foundElement instanceof HTMLElement) {
            element = foundElement
            break
          }
        }
        
        // テキストコンテンツでも検索（型安全性向上）
        if (!element && step.target.includes('通話を開始')) {
          const buttons = Array.from(iframeDoc.querySelectorAll('button'))
          const foundButton = buttons.find(btn => 
            btn.textContent?.includes('通話を開始') || 
            btn.textContent?.includes('通話開始') ||
            btn.getAttribute('onclick')?.includes('handleStartCall')
          )
          if (foundButton instanceof HTMLElement) {
            element = foundButton
          }
        }
      } else if (step.action === 'select' && step.target) {
        const selectElement = iframeDoc.querySelector(step.target)
        if (selectElement instanceof HTMLSelectElement) {
          element = selectElement
        }
      }
      
      if (element) {
        // 要素まで自動スクロール（null安全性向上）
        const elementRect = element.getBoundingClientRect()
        const iframe = iframeRef.current
        if (!iframe) return
        
        const iframeViewport = {
          height: iframe.clientHeight,
          width: iframe.clientWidth
        }
        
        // 要素が画面に見えない場合はスクロール
        if (elementRect.top < 0 || elementRect.bottom > iframeViewport.height) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          })
          
          // スクロール完了まで待機
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        // 要素をハイライト
        element.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.8)'
        element.style.transform = 'scale(1.05)'
        element.style.transition = 'all 0.3s ease'
        element.style.zIndex = '9999'
        element.style.position = 'relative'
        
        await new Promise(resolve => setTimeout(resolve, 800))
        
        if (step.action === 'click') {
          element.click()
        } else if (step.action === 'select' && step.value) {
          const selectElement = element as HTMLSelectElement
          selectElement.value = step.value
          selectElement.dispatchEvent(new Event('change', { bubbles: true }))
        }
        
        // ハイライトを解除
        setTimeout(() => {
          element!.style.boxShadow = ''
          element!.style.transform = ''
          element!.style.zIndex = ''
          element!.style.position = ''
        }, 1200)
      } else {
        console.warn(`Element not found for selector: ${step.target}`)
      }
    } catch (error) {
      console.error('Error executing action in iframe:', error)
    }
  }
  
  // クリーンアップ
  useEffect(() => {
    return () => {
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current)
      }
    }
  }, [])
  
  return (
    <>
      {/* 発信中画面 */}
      {showCallingScreen && (
        <CallingScreen
          customerName={customerData.name}
          onCallConnected={() => {
            console.log('Call connected')
          }}
        />
      )}
      
      {/* メインコンテンツ iframe */}
      <iframe
        ref={iframeRef}
        src={currentPage}
        style={{
          width: '100vw',
          height: '100vh',
          border: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: showCallingScreen ? -1 : 1
        }}
      />
      
      {/* デバッグ情報 */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.8)',
        color: '#FFF',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 10001
      }}>
        <div>Step: {internalStep + 1}/{demoSteps.length}</div>
        <div>Page: {currentPage}</div>
        <div>Action: {currentStepData?.action}</div>
        <div>Target: {currentStepData?.target}</div>
        <div>Calling: {showCallingScreen ? 'Yes' : 'No'}</div>
        
        <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
          <button
            onClick={() => {
              if (internalStep > 0) {
                setInternalStep(prev => prev - 1)
              }
            }}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              background: '#2196F3',
              color: '#FFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Prev
          </button>
          <button
            onClick={() => {
              if (internalStep < demoSteps.length - 1) {
                setInternalStep(prev => prev + 1)
              }
            }}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              background: '#4CAF50',
              color: '#FFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Next
          </button>
        </div>
      </div>
    </>
  )
}