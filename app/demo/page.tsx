'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DemoController from '../components/DemoController'
import DemoOverlay from '../components/DemoOverlay'

export default function DemoPage() {
  const router = useRouter()
  const [demoStarted, setDemoStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  
  useEffect(() => {
    // デモ開始のカウントダウン
    const timer = setTimeout(() => {
      setDemoStarted(true)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (!demoStarted) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#333333',
        fontFamily: 'Inter, sans-serif',
        zIndex: 9999
      }}>
        <div style={{
          fontSize: '48px',
          fontWeight: 600,
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          デモンストレーション開始
        </div>
        
        <div style={{
          fontSize: '18px',
          fontWeight: 400,
          opacity: 0.7,
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          受架電支援AI 8月検証版の全機能をご紹介します
        </div>
      </div>
    )
  }
  
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <DemoController 
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />
      <DemoOverlay 
        currentStep={currentStep}
      />
    </div>
  )
}