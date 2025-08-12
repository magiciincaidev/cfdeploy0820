'use client'

import { useState, useEffect } from 'react'

interface DemoStep {
  id: string
  telop: string
  duration: number
  phase: 'preparation' | 'calling' | 'in-call' | 'after-call'
}

const demoSteps: DemoStep[] = [
  { id: '1', telop: '通話前確認画面に移動します', duration: 3000, phase: 'preparation' },
  { id: '2', telop: '顧客「山田太郎」さんを選択します', duration: 3000, phase: 'preparation' },
  { id: '3', telop: 'プリチェック項目を順番に確認していきます', duration: 4000, phase: 'preparation' },
  { id: '4', telop: '必須項目をすべてチェックしました', duration: 3000, phase: 'preparation' },
  { id: '5', telop: '通話を開始します', duration: 2000, phase: 'preparation' },
  { id: '6', telop: '顧客に発信中です...', duration: 3000, phase: 'calling' },
  { id: '7', telop: '通話が接続されました。手続き選択画面に移動します', duration: 3000, phase: 'in-call' },
  { id: '8', telop: '手続き「一時約束」を選択します', duration: 3000, phase: 'in-call' },
  { id: '9', telop: 'TODO項目を順番に実行していきます', duration: 4000, phase: 'in-call' },
  { id: '10', telop: '本人確認が完了しました', duration: 3000, phase: 'in-call' },
  { id: '11', telop: '要件説明を行いました', duration: 3000, phase: 'in-call' },
  { id: '12', telop: '返済交渉を実施します', duration: 4000, phase: 'in-call' },
  { id: '13', telop: '通話を終了し、事後処理画面に移動します', duration: 3000, phase: 'in-call' },
  { id: '14', telop: '通話結果を確認しています', duration: 3000, phase: 'after-call' },
  { id: '15', telop: 'システムが自動的に事後処理TODOを生成しました', duration: 4000, phase: 'after-call' },
  { id: '16', telop: 'デモンストレーション完了です！', duration: 3000, phase: 'after-call' }
]

interface DemoOverlayProps {
  currentStep: number
}

export default function DemoOverlay({ currentStep }: DemoOverlayProps) {
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  const currentStepData = demoSteps[currentStep]
  
  useEffect(() => {
    if (!currentStepData) return
    
    setIsTyping(true)
    setDisplayText('')
    
    // タイピングアニメーション
    const text = currentStepData.telop
    let i = 0
    
    const typeWriter = () => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1))
        i++
        setTimeout(typeWriter, 50) // 50ms間隔で1文字ずつ
      } else {
        setIsTyping(false)
      }
    }
    
    setTimeout(typeWriter, 500) // 0.5秒後に開始
  }, [currentStep, currentStepData])
  
  if (!currentStepData) return null
  
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'preparation': return '#2196F3'
      case 'calling': return '#FF9800'
      case 'in-call': return '#4CAF50'
      case 'after-call': return '#9C27B0'
      default: return '#666666'
    }
  }
  
  const getPhaseText = (phase: string) => {
    switch (phase) {
      case 'preparation': return '📋 通話前準備'
      case 'calling': return '📞 発信中'
      case 'in-call': return '💬 通話中'
      case 'after-call': return '📝 事後処理'
      default: return ''
    }
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.95) 100%)',
      padding: '40px 60px 60px',
      zIndex: 9999,
      borderTop: '1px solid rgba(255,255,255,0.1)'
    }}>
      
      {/* プログレスバー */}
      <div style={{
        width: '100%',
        height: '4px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '2px',
        marginBottom: '24px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${((currentStep + 1) / demoSteps.length) * 100}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${getPhaseColor(currentStepData.phase)}, #FF6B6B)`,
          borderRadius: '2px',
          transition: 'width 0.5s ease-out',
          animation: 'shimmer 2s infinite'
        }} />
      </div>
      
      {/* フェーズ表示 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '16px'
      }}>
        <div style={{
          padding: '8px 16px',
          background: getPhaseColor(currentStepData.phase),
          color: '#FFFFFF',
          borderRadius: '20px',
          fontSize: '16px',
          fontWeight: 600,
          fontFamily: 'Inter, sans-serif'
        }}>
          {getPhaseText(currentStepData.phase)}
        </div>
        
        <div style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '16px',
          fontFamily: 'Inter, sans-serif'
        }}>
          {currentStep + 1} / {demoSteps.length}
        </div>
      </div>
      
      {/* テロップテキスト */}
      <div style={{
        fontSize: '32px',
        fontWeight: 600,
        color: '#FFFFFF',
        fontFamily: 'Inter, sans-serif',
        lineHeight: '1.4',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
        minHeight: '45px',
        display: 'flex',
        alignItems: 'center'
      }}>
        {displayText}
        {isTyping && (
          <span style={{
            marginLeft: '4px',
            animation: 'blink 1s infinite',
            color: getPhaseColor(currentStepData.phase)
          }}>
            |
          </span>
        )}
      </div>
      
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}