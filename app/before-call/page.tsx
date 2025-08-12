'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import useCallStore from '../store/callStore'
import { mockCustomers, mockTodoItems, mockMemoSummaries } from '../data/mockData'

export default function BeforeCallPage() {
  const router = useRouter()
  const { currentCustomer, selectCustomer, startCall } = useCallStore()
  
  const beforeCallTodos = mockTodoItems.filter(t => t.phase === 'before')
  const customerSummary = mockMemoSummaries.find(s => s.customerId === currentCustomer?.customerId)
  
  const [checkedItems, setCheckedItems] = useState<{[key: string]: boolean}>({})
  const [showValidation, setShowValidation] = useState(false)
  
  const handleCheckToggle = (todoId: string, checked: boolean) => {
    setCheckedItems(prev => ({...prev, [todoId]: checked}))
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
  
  return (
    <div style={{
      position: 'relative',
      width: '1678px',
      height: 'auto',
      minHeight: '100vh',
      background: '#FCFCFC',
      margin: '0 auto',
      fontFamily: 'Inter, sans-serif'
    }}>
      
      {/* Header Container */}
      <div style={{
        position: 'absolute',
        width: '1766px',
        height: '111px',
        left: '-3px',
        top: '-3px',
        background: '#FFFFFF',
        boxShadow: '0px 0px 11px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Brand Text */}
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '34px',
          left: '69px',
          top: '41px',
          fontFamily: 'Inter',
          fontWeight: 600,
          fontSize: '28px',
          lineHeight: '34px',
          color: '#000000'
        }}>
          受架電支援AI — 8月検証版
        </div>
        <div style={{
          position: 'absolute',
          width: '150px',
          height: '20px',
          left: '400px',
          top: '50px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '16px',
          lineHeight: '20px',
          color: '#666666'
        }}>
          通話前確認画面
        </div>
      </div>
      
      {/* Status Pills */}
      <div style={{position: 'absolute', top: '142px', left: '681px', display: 'flex', gap: '26px'}}>
        <div style={{
          width: '146px',
          height: '48px',
          borderRadius: '60px',
          background: '#005DDA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontFamily: 'Inter',
          color: '#FFFFFF'
        }}>
          架電前
        </div>
        <div style={{
          width: '146px',
          height: '48px',
          borderRadius: '60px',
          background: '#D9D9D9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontFamily: 'Inter',
          color: '#000000'
        }}>
          架電中
        </div>
        <div style={{
          width: '146px',
          height: '48px',
          borderRadius: '60px',
          background: '#D9D9D9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontFamily: 'Inter',
          color: '#000000'
        }}>
          架電後
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{position: 'absolute', top: '223px', left: '55px', right: '55px'}}>
        
        {/* Left Sidebar - Customer Information */}
        <div style={{
          position: 'absolute',
          width: '372px',
          height: '1454px',
          left: '0px',
          top: '0px',
          background: '#FFFFFF',
          border: '1px solid #818181',
          borderRadius: '13px',
          padding: '24px'
        }}>
          
          {/* Customer Selector */}
          <div style={{marginBottom:'24px'}}>
            <div style={{fontSize:'24px', fontWeight:600, marginBottom:'16px', fontFamily:'Inter', lineHeight:'29px'}}>顧客選択</div>
            <select 
              value={currentCustomer?.customerId || ''}
              onChange={(e) => selectCustomer(e.target.value)}
              style={{
                width:'100%', 
                padding:'12px', 
                fontSize:'16px', 
                border:'1px solid #D9D9D9', 
                borderRadius:'8px',
                background:'#FFFFFF',
                fontFamily:'Inter'
              }}
            >
              {mockCustomers.map(customer => (
                <option key={customer.customerId} value={customer.customerId}>
                  {customer.name} ({customer.accountNumber})
                </option>
              ))}
            </select>
          </div>
          
          {/* Customer Information Fields */}
          <div style={{marginBottom:'24px'}}>
            <div style={{fontSize:'24px', fontWeight:400, marginBottom:'12px', fontFamily:'Inter', lineHeight:'29px'}}>会員番号</div>
            <div style={{
              width:'327px',
              height:'75px',
              background:'#F3F3F3',
              borderRadius:'13px',
              display:'flex',
              alignItems:'center',
              paddingLeft:'16px',
              fontSize:'28px',
              fontWeight:700,
              fontFamily:'Inter',
              lineHeight:'34px'
            }}>
              {currentCustomer?.accountNumber}
            </div>
          </div>
          
          <div style={{marginBottom:'24px'}}>
            <div style={{fontSize:'24px', fontWeight:400, marginBottom:'12px', fontFamily:'Inter', lineHeight:'29px'}}>名前</div>
            <div style={{
              width:'327px',
              height:'75px',
              background:'#F3F3F3',
              borderRadius:'13px',
              display:'flex',
              alignItems:'center',
              paddingLeft:'16px',
              fontSize:'28px',
              fontWeight:700,
              fontFamily:'Inter',
              lineHeight:'34px'
            }}>
              {currentCustomer?.name}
            </div>
          </div>
          
          <div style={{marginBottom:'24px'}}>
            <div style={{fontSize:'24px', fontWeight:400, marginBottom:'12px', fontFamily:'Inter', lineHeight:'29px'}}>返済日</div>
            <div style={{
              width:'327px',
              height:'75px',
              background:'#F3F3F3',
              borderRadius:'13px',
              display:'flex',
              alignItems:'center',
              paddingLeft:'16px',
              fontSize:'28px',
              fontWeight:700,
              fontFamily:'Inter',
              lineHeight:'34px'
            }}>
              {currentCustomer?.paymentDate}
            </div>
          </div>
          
          <div style={{marginBottom:'24px'}}>
            <div style={{fontSize:'24px', fontWeight:400, marginBottom:'12px', fontFamily:'Inter', lineHeight:'29px'}}>返済額</div>
            <div style={{
              width:'327px',
              height:'75px',
              background:'#F3F3F3',
              borderRadius:'13px',
              display:'flex',
              alignItems:'center',
              paddingLeft:'16px',
              fontSize:'28px',
              fontWeight:700,
              fontFamily:'Inter',
              lineHeight:'34px'
            }}>
              {currentCustomer?.paymentAmount}
            </div>
          </div>
          
          {currentCustomer?.migrationProbability && (
            <div style={{marginBottom:'24px'}}>
              <div style={{fontSize:'24px', fontWeight:400, marginBottom:'12px', fontFamily:'Inter', lineHeight:'29px'}}>移管確率</div>
              <div style={{
                width:'327px',
                height:'75px',
                background: currentCustomer.migrationProbability >= 50 ? '#FFF3E0' : '#F3F3F3',
                borderRadius:'13px',
                display:'flex',
                alignItems:'center',
                paddingLeft:'16px',
                fontSize:'28px',
                fontWeight:700,
                fontFamily:'Inter',
                lineHeight:'34px',
                color: currentCustomer.migrationProbability >= 50 ? '#F57C00' : '#000'
              }}>
                {currentCustomer.migrationProbability}%
              </div>
            </div>
          )}
          
          {/* Contact History Summary */}
          <div>
            <div style={{fontSize:'24px', fontWeight:400, marginBottom:'12px', fontFamily:'Inter', lineHeight:'29px'}}>コンタクト履歴（サマリ）</div>
            <div style={{
              width:'327px',
              height:'385px',
              background:'#F3F3F3',
              borderRadius:'13px',
              padding:'16px',
              fontSize:'22px',
              fontFamily:'Inter',
              lineHeight:'33px',
              overflow:'auto'
            }}>
              {customerSummary?.summaryText || 'サマリ情報はありません'}
            </div>
            {customerSummary?.lastUpdated && (
              <div style={{marginTop:'12px', fontSize:'12px', color:'#6B6B6B', textAlign:'right', fontFamily:'Inter'}}>
                最終更新: {new Date(customerSummary.lastUpdated).toLocaleDateString('ja-JP')}
              </div>
            )}
          </div>
        </div>
        
        {/* Right Side - Negotiation History Summary */}
        <div style={{
          position: 'absolute',
          left: '427px',
          top: '0px',
          width: '1121px',
          minHeight: '800px',
          background: '#FFFFFF',
          border: '1px solid #818181',
          borderRadius: '13px',
          padding: '24px'
        }}>
          <h2 style={{fontSize:'28px', fontWeight:700, marginBottom:'24px', fontFamily:'Inter', lineHeight:'34px'}}>交渉履歴サマリ</h2>
          
          {/* Past Promise Content */}
          <div style={{marginBottom:'32px'}}>
            <h3 style={{fontSize:'24px', fontWeight:600, marginBottom:'16px', fontFamily:'Inter', lineHeight:'29px'}}>過去の一時約束内容</h3>
            <div style={{
              background:'#F8F9FA',
              border:'1px solid #E0E0E0',
              borderRadius:'8px',
              padding:'20px',
              fontSize:'18px',
              lineHeight:'22px',
              fontFamily:'Inter'
            }}>
              <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px'}}>
                <span style={{
                  width:'8px',
                  height:'8px',
                  borderRadius:'50%',
                  background:'#2196F3',
                  flexShrink:0
                }}></span>
                <strong>最新の約束:</strong> {currentCustomer?.contactHistory || '約束履歴はありません'}
              </div>
              <div style={{fontSize:'16px', color:'#666', marginTop:'8px'}}>
                最終更新: {customerSummary?.lastUpdated ? new Date(customerSummary.lastUpdated).toLocaleDateString('ja-JP') : '未更新'}
              </div>
              {currentCustomer?.paymentDate && (
                <div style={{
                  marginTop:'12px',
                  padding:'8px 12px',
                  background:'#E8F5E8',
                  border:'1px solid #4CAF50',
                  borderRadius:'6px',
                  fontSize:'16px',
                  color:'#2E7D32'
                }}>
                  📅 次回返済予定日: {currentCustomer.paymentDate} ({currentCustomer.paymentAmount})
                </div>
              )}
            </div>
          </div>
          
          {/* Claims and Cautions */}
          <div style={{marginBottom:'32px'}}>
            <h3 style={{fontSize:'24px', fontWeight:600, marginBottom:'16px', fontFamily:'Inter', lineHeight:'29px'}}>クレーム・注意点</h3>
            <div style={{
              background: currentCustomer?.migrationProbability && currentCustomer.migrationProbability >= 50 ? '#FFEBEE' : '#FFF3E0',
              border: `1px solid ${currentCustomer?.migrationProbability && currentCustomer.migrationProbability >= 50 ? '#F44336' : '#FFA726'}`,
              borderRadius:'8px',
              padding:'20px',
              fontSize:'18px',
              lineHeight:'22px',
              fontFamily:'Inter'
            }}>
              {currentCustomer?.migrationProbability && currentCustomer.migrationProbability >= 50 ? (
                <div>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px'}}>
                    <span style={{fontSize:'20px'}}>⚠️</span>
                    <strong style={{color:'#D32F2F'}}>高リスク顧客</strong>
                  </div>
                  <div>移管確率{currentCustomer.migrationProbability}%のため、以下に注意してください：</div>
                  <ul style={{marginTop:'8px', marginBottom:0, paddingLeft:'20px'}}>
                    <li>強圧的な言動は避け、共感的な姿勢を保つ</li>
                    <li>顧客の事情を十分にヒアリングする</li>
                    <li>現実的な返済計画を共に検討する</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px'}}>
                    <span style={{fontSize:'20px'}}>ℹ️</span>
                    <strong>標準対応</strong>
                  </div>
                  特別な注意事項はありません。標準的な債務整理支援手順に従って対応してください。
                </div>
              )}
            </div>
          </div>
          
          {/* Operation Notes */}
          <div style={{marginBottom:'32px'}}>
            <h3 style={{fontSize:'24px', fontWeight:600, marginBottom:'16px', fontFamily:'Inter', lineHeight:'29px'}}>運用上の留意事項</h3>
            <div style={{
              background:'#E3F2FD',
              border:'1px solid #64B5F6',
              borderRadius:'8px',
              padding:'20px',
              fontSize:'18px',
              lineHeight:'22px',
              fontFamily:'Inter'
            }}>
              <div style={{marginBottom:'16px'}}>
                <strong>移管確率: {currentCustomer?.migrationProbability || 'N/A'}%</strong>
                <span style={{
                  marginLeft:'12px',
                  padding:'2px 8px',
                  background: currentCustomer?.migrationProbability && currentCustomer.migrationProbability >= 50 ? '#F44336' : '#4CAF50',
                  color:'#FFF',
                  borderRadius:'12px',
                  fontSize:'14px',
                  fontWeight:600
                }}>
                  {currentCustomer?.migrationProbability && currentCustomer.migrationProbability >= 50 ? '高リスク' : '標準'}
                </span>
              </div>
              <ul style={{margin:0, paddingLeft:'20px'}}>
                <li>返済意思の確認を最優先に実施</li>
                <li>具体的な返済計画の提示を促す</li>
                <li>次回コンタクト日程の明確化</li>
                {currentCustomer?.migrationProbability && currentCustomer.migrationProbability >= 50 && (
                  <li style={{color:'#D32F2F', fontWeight:600}}>上長への報告準備（必要に応じて）</li>
                )}
                <li>通話録音の確認（重要なやり取りの記録）</li>
              </ul>
            </div>
          </div>
          
          {/* Pre-check Status */}
          <div style={{marginBottom:'24px'}}>
            <div style={{
              background: getCompletionStatus().canStart ? '#E8F5E8' : '#FFF3E0',
              border: `1px solid ${getCompletionStatus().canStart ? '#4CAF50' : '#FFA726'}`,
              borderRadius:'8px',
              padding:'16px',
              display:'flex',
              alignItems:'center',
              justifyContent:'space-between'
            }}>
              <div>
                <div style={{fontSize:'18px', fontWeight:600, fontFamily:'Inter', marginBottom:'4px'}}>
                  プリチェック進捗
                </div>
                <div style={{fontSize:'16px', fontFamily:'Inter'}}>
                  必須項目: {getCompletionStatus().required.completed}/{getCompletionStatus().required.total} | 
                  全項目: {getCompletionStatus().all.completed}/{getCompletionStatus().all.total}
                </div>
              </div>
              <div style={{
                padding:'8px 16px',
                background: getCompletionStatus().canStart ? '#4CAF50' : '#FFA726',
                color:'#FFF',
                borderRadius:'20px',
                fontSize:'14px',
                fontWeight:600,
                fontFamily:'Inter'
              }}>
                {getCompletionStatus().canStart ? '✓ 開始可能' : '⚠ 要確認'}
              </div>
            </div>
          </div>

          {/* Pre-call Checklist */}
          <div style={{marginBottom:'32px'}}>
            <h3 style={{fontSize:'24px', fontWeight:600, marginBottom:'16px', fontFamily:'Inter', lineHeight:'29px'}}>通話前チェック事項</h3>
            <div style={{
              border:'1px solid #DEDEDE',
              borderRadius:'8px',
              overflow:'hidden'
            }}>
              {beforeCallTodos.map((todo, index) => {
                const isChecked = checkedItems[todo.todoId] || false
                
                return (
                  <label 
                    key={todo.todoId} 
                    style={{
                      display:'flex', 
                      alignItems:'center', 
                      gap:'16px', 
                      padding:'16px 20px',
                      background: isChecked ? '#F1F8E9' : (index % 2 === 0 ? '#FAFAFA' : '#FFF'),
                      borderBottom: index < beforeCallTodos.length - 1 ? '1px solid #DEDEDE' : 'none',
                      cursor:'pointer',
                      transition:'all 0.2s',
                      userSelect:'none'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        handleCheckToggle(todo.todoId, e.target.checked)
                      }}
                      style={{
                        width:'20px',
                        height:'20px',
                        accentColor:'#4CAF50',
                        cursor:'pointer',
                        flexShrink:0
                      }}
                    />
                    <div style={{flex:1, pointerEvents:'none'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        {todo.required && (
                          <span style={{
                            padding:'2px 8px',
                            background:'#EB0000',
                            color:'#FFF',
                            borderRadius:'12px',
                            fontSize:'12px',
                            fontWeight:600,
                            fontFamily:'Inter'
                          }}>
                            必須
                          </span>
                        )}
                        <span style={{
                          fontSize:'18px', 
                          fontWeight:500, 
                          fontFamily:'Inter', 
                          lineHeight:'22px',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          color: isChecked ? '#666' : '#000'
                        }}>
                          {todo.label}
                        </span>
                        {isChecked && (
                          <span style={{
                            fontSize:'16px',
                            color:'#4CAF50',
                            marginLeft:'8px'
                          }}>
                            ✓
                          </span>
                        )}
                      </div>
                      {todo.todoId === 't1' && currentCustomer?.contactHistory && (
                        <div style={{marginTop:'8px', padding:'8px', background:'#F5F5F5', borderRadius:'6px', fontSize:'14px', color:'#666', fontFamily:'Inter'}}>
                          {currentCustomer.contactHistory}
                        </div>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
          
          {/* Validation Message */}
          {showValidation && (
            <div style={{
              marginBottom:'24px',
              padding:'16px',
              background:'#FFEBEE',
              border:'1px solid #F44336',
              borderRadius:'8px',
              fontSize:'16px',
              color:'#D32F2F',
              fontFamily:'Inter'
            }}>
              <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px'}}>
                <span style={{fontSize:'20px'}}>❌</span>
                <strong>通話開始前の確認が必要です</strong>
              </div>
              必須項目をすべて確認してからチェックしてください。未確認の必須項目：
              <ul style={{marginTop:'8px', marginBottom:0, paddingLeft:'20px'}}>
                {beforeCallTodos.filter(t => t.required && !checkedItems[t.todoId]).map(todo => (
                  <li key={todo.todoId}>{todo.label}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Start Call Button */}
          <div style={{display:'flex', justifyContent:'center', marginTop:'40px'}}>
            <button
              onClick={handleStartCall}
              style={{
                padding:'16px 48px',
                background: getCompletionStatus().canStart ? '#005DDA' : '#CCC',
                color:'#FFF',
                border:'none',
                borderRadius:'30px',
                fontSize:'24px',
                fontWeight:600,
                cursor: getCompletionStatus().canStart ? 'pointer' : 'not-allowed',
                transition:'all 0.3s',
                fontFamily:'Inter',
                lineHeight:'29px',
                opacity: getCompletionStatus().canStart ? 1 : 0.7
              }}
              onMouseOver={(e) => {
                if (getCompletionStatus().canStart) {
                  e.currentTarget.style.background = '#0047B3'
                }
              }}
              onMouseOut={(e) => {
                if (getCompletionStatus().canStart) {
                  e.currentTarget.style.background = '#005DDA'
                }
              }}
            >
              {getCompletionStatus().canStart ? '通話を開始' : 'プリチェック未完了'}
            </button>
          </div>
          
          {/* Instructions */}
          <div style={{
            marginTop:'24px',
            padding:'16px',
            background:'rgba(43,153,85,0.06)',
            borderRadius:'12px',
            fontSize:'14px',
            color:'#2B9955',
            fontFamily:'Inter',
            textAlign:'center'
          }}>
            <div style={{marginBottom:'8px'}}>
              <strong>✓ 通話開始前の準備</strong>
            </div>
            <div>
              上記のプリチェック項目を確認し、すべての必須項目にチェックを入れてから通話を開始してください。<br/>
              プリチェック完了後は、手続き別の対応事項が通話中画面に表示されます。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}