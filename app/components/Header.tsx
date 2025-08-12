'use client'

import { useRouter } from 'next/navigation'
import useCallStore from '../store/callStore'

export default function Header() {
  const router = useRouter()
  const { currentCustomer, getPhase, currentSession } = useCallStore()
  const phase = getPhase()
  
  const getPhaseLabel = () => {
    switch(phase) {
      case 'before': return '架電前'
      case 'during': return '架電中'
      case 'after': return '架電後'
      default: return '架電前'
    }
  }
  
  const navigateToPhase = (targetPhase: string) => {
    switch(targetPhase) {
      case 'before':
        router.push('/before-call')
        break
      case 'during':
        if (currentSession) {
          router.push('/in-call')
        }
        break
      case 'after':
        if (currentSession?.endTime) {
          router.push('/after-call')
        }
        break
    }
  }
  
  return (
    <div style={{position:'absolute', top:0, left:'-44px', width:'calc(1678px + 88px)', height:'111px', background:'#FFFFFF', boxShadow:'0px 0px 11px rgba(0,0,0,0.25)'}}>
      <div style={{position:'absolute', left:'69px', top:'41px', fontSize:'28px', fontWeight:600}}>
        受架電支援AI - 8月検証版
      </div>
      
      {/* Status pills */}
      <div style={{position:'absolute', top:'41px', left:'681px', display:'flex', gap:'26px'}}>
        <button
          onClick={() => navigateToPhase('before')}
          style={{
            width:'146px', 
            height:'48px', 
            borderRadius:'60px', 
            display:'flex', 
            alignItems:'center', 
            justifyContent:'center', 
            fontSize:'24px', 
            background: phase === 'before' ? '#005DDA' : '#D9D9D9', 
            color: phase === 'before' ? '#FFF' : '#000',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          架電前
        </button>
        <button
          onClick={() => navigateToPhase('during')}
          disabled={!currentSession}
          style={{
            width:'146px', 
            height:'48px', 
            borderRadius:'60px', 
            display:'flex', 
            alignItems:'center', 
            justifyContent:'center', 
            fontSize:'24px', 
            background: phase === 'during' ? '#005DDA' : '#D9D9D9', 
            color: phase === 'during' ? '#FFF' : '#000',
            border: 'none',
            cursor: currentSession ? 'pointer' : 'not-allowed',
            opacity: currentSession ? 1 : 0.5,
            transition: 'all 0.3s'
          }}
        >
          架電中
        </button>
        <button
          onClick={() => navigateToPhase('after')}
          disabled={!currentSession?.endTime}
          style={{
            width:'146px', 
            height:'48px', 
            borderRadius:'60px', 
            display:'flex', 
            alignItems:'center', 
            justifyContent:'center', 
            fontSize:'24px', 
            background: phase === 'after' ? '#005DDA' : '#D9D9D9', 
            color: phase === 'after' ? '#FFF' : '#000',
            border: 'none',
            cursor: currentSession?.endTime ? 'pointer' : 'not-allowed',
            opacity: currentSession?.endTime ? 1 : 0.5,
            transition: 'all 0.3s'
          }}
        >
          架電後
        </button>
      </div>
      
      {/* Current customer display */}
      {currentCustomer && (
        <div style={{position:'absolute', top:'41px', right:'100px', fontSize:'18px', color:'#6B6B6B'}}>
          顧客: {currentCustomer.name} ({currentCustomer.accountNumber})
        </div>
      )}
    </div>
  )
}