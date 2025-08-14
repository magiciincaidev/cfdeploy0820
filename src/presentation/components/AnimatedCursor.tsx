'use client'

import { useState, useEffect } from 'react'

interface AnimatedCursorProps {
  isClicking?: boolean
  targetPosition?: { x: number; y: number }
}

export default function AnimatedCursor({ isClicking = false, targetPosition }: AnimatedCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isAnimating, setIsAnimating] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
  
  useEffect(() => {
    // カーソルを非表示にする
    document.body.style.cursor = 'none'
    
    const updatePosition = (e: MouseEvent) => {
      if (!targetPosition) {
        setPosition({ x: e.clientX, y: e.clientY })
      }
    }
    
    window.addEventListener('mousemove', updatePosition)
    
    return () => {
      document.body.style.cursor = 'auto'
      window.removeEventListener('mousemove', updatePosition)
    }
  }, [targetPosition])
  
  useEffect(() => {
    if (targetPosition) {
      setIsAnimating(true)
      const duration = 1500 // 1.5秒で移動
      const startPos = position
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // イージング関数（ease-out）
        const easeOut = 1 - Math.pow(1 - progress, 3)
        
        const newX = startPos.x + (targetPosition.x - startPos.x) * easeOut
        const newY = startPos.y + (targetPosition.y - startPos.y) * easeOut
        
        setPosition({ x: newX, y: newY })
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
        }
      }
      
      requestAnimationFrame(animate)
    }
  }, [targetPosition])
  
  useEffect(() => {
    if (isClicking) {
      // クリック時の波紋エフェクト
      const rippleId = Date.now()
      setRipples(prev => [...prev, { id: rippleId, x: position.x, y: position.y }])
      
      // 波紋を1秒後に削除
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== rippleId))
      }, 1000)
    }
  }, [isClicking, position])
  
  return (
    <>
      {/* カスタムカーソル */}
      <div
        style={{
          position: 'fixed',
          left: position.x - 20,
          top: position.y - 20,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: isClicking 
            ? 'radial-gradient(circle, rgba(255,107,107,0.8) 0%, rgba(78,205,196,0.8) 100%)'
            : 'radial-gradient(circle, rgba(0,93,218,0.8) 0%, rgba(78,205,196,0.6) 100%)',
          border: '3px solid rgba(255,255,255,0.9)',
          boxShadow: isClicking 
            ? '0 0 20px rgba(255,107,107,0.6), 0 0 40px rgba(255,107,107,0.3)'
            : '0 0 15px rgba(0,93,218,0.4), 0 0 30px rgba(0,93,218,0.2)',
          zIndex: 10000,
          pointerEvents: 'none',
          transition: isAnimating ? 'none' : 'all 0.1s ease-out',
          transform: isClicking ? 'scale(1.3)' : 'scale(1)',
          animation: isAnimating ? 'none' : 'cursorPulse 2s infinite'
        }}
      />
      
      {/* 波紋エフェクト */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          style={{
            position: 'fixed',
            left: ripple.x - 25,
            top: ripple.y - 25,
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: '3px solid rgba(255,107,107,0.6)',
            background: 'transparent',
            zIndex: 9999,
            pointerEvents: 'none',
            animation: 'ripple 1s ease-out forwards'
          }}
        />
      ))}
      
      {/* カーソルの軌跡 */}
      {isAnimating && (
        <div
          style={{
            position: 'fixed',
            left: position.x - 5,
            top: position.y - 5,
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: 'rgba(0,93,218,0.3)',
            zIndex: 9998,
            pointerEvents: 'none',
            animation: 'trail 0.3s ease-out forwards'
          }}
        />
      )}
      
      <style jsx>{`
        @keyframes cursorPulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 15px rgba(0,93,218,0.4), 0 0 30px rgba(0,93,218,0.2);
          }
          50% { 
            transform: scale(1.1);
            box-shadow: 0 0 20px rgba(0,93,218,0.6), 0 0 40px rgba(0,93,218,0.3);
          }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        @keyframes trail {
          0% {
            opacity: 0.6;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(2);
          }
        }
      `}</style>
    </>
  )
}