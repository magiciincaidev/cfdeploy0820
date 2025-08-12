'use client'

import { useState, useEffect } from 'react'

interface CallingScreenProps {
  customerName: string
  onCallConnected: () => void
}

export default function CallingScreen({ customerName, onCallConnected }: CallingScreenProps) {
  const [callDuration, setCallDuration] = useState(0)
  const [pulseSize, setPulseSize] = useState(1)
  
  useEffect(() => {
    // 3秒後に通話接続
    const connectTimer = setTimeout(() => {
      onCallConnected()
    }, 3000)
    
    // 通話時間カウンター
    const durationTimer = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 100)
    
    // パルスアニメーション
    const pulseTimer = setInterval(() => {
      setPulseSize(prev => prev === 1 ? 1.2 : 1)
    }, 800)
    
    return () => {
      clearTimeout(connectTimer)
      clearInterval(durationTimer)
      clearInterval(pulseTimer)
    }
  }, [onCallConnected])
  
  const formatDuration = (duration: number) => {
    const seconds = Math.floor(duration / 10)
    return `00:0${seconds}`
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      fontFamily: 'Inter, sans-serif',
      zIndex: 10000
    }}>
      
      {/* 発信中アニメーション */}
      <div style={{
        position: 'relative',
        marginBottom: '48px'
      }}>
        {/* 中央の電話アイコン */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4CAF50, #45a049)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          zIndex: 3,
          position: 'relative',
          transform: `scale(${pulseSize})`,
          transition: 'transform 0.8s ease-in-out',
          boxShadow: '0 8px 32px rgba(76, 175, 80, 0.4)'
        }}>
          📞
        </div>
        
        {/* 波紋エフェクト */}
        {[1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${120 + (i * 40)}px`,
              height: `${120 + (i * 40)}px`,
              border: '3px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `ripple ${2 + i * 0.5}s infinite ease-out`,
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </div>
      
      {/* 顧客名 */}
      <div style={{
        fontSize: '32px',
        fontWeight: 600,
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        {customerName} さん
      </div>
      
      {/* 発信中メッセージ */}
      <div style={{
        fontSize: '24px',
        fontWeight: 400,
        marginBottom: '32px',
        opacity: 0.9,
        animation: 'fade 2s infinite ease-in-out'
      }}>
        発信中...
      </div>
      
      {/* 通話時間 */}
      <div style={{
        fontSize: '20px',
        fontWeight: 500,
        opacity: 0.7,
        marginBottom: '48px'
      }}>
        {formatDuration(callDuration)}
      </div>
      
      {/* 通話状態インジケーター */}
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            style={{
              width: '4px',
              height: '20px',
              background: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '2px',
              animation: `wave 1.2s infinite ease-in-out`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>
      
      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        
        @keyframes fade {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.5; }
        }
        
        @keyframes wave {
          0%, 40%, 100% {
            transform: scaleY(1);
            background: rgba(255, 255, 255, 0.6);
          }
          20% {
            transform: scaleY(2);
            background: rgba(76, 175, 80, 0.8);
          }
        }
      `}</style>
    </div>
  )
}