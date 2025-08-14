'use client'

import useCallStore from '@/src/infrastructure/store/callStore'
import { mockMemoSummaries, mockProcedures } from '@/src/shared/data/mockData'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function InCallPage() {
  const router = useRouter()
  const { currentCustomer, currentSession, selectProcedures, toggleTodo, getTodoResults, endCall, isAuthenticated, initializeAuth } = useCallStore()

  const [selectedProcedureIds, setSelectedProcedureIds] = useState<string[]>(['p1'])
  const [currentProcedureId, setCurrentProcedureId] = useState<string>('p1')
  const [summaryText, setSummaryText] = useState('')
  const [checkedTodos, setCheckedTodos] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    initializeAuth()
    if (!isAuthenticated) {
      router.push('/')
      return
    }

    if (!currentSession) {
      router.push('/before-call')
      return
    }

    // Initialize summary
    const customerSummary = mockMemoSummaries.find(s => s.customerId === currentCustomer?.customerId)
    setSummaryText(customerSummary?.summaryText || '')

    // Load from localStorage first
    const storageKey = `call-todos-${currentSession?.sessionId}`
    const savedTodos = JSON.parse(localStorage.getItem(storageKey) || '{}')

    setCheckedTodos(savedTodos)
  }, [currentSession?.sessionId, currentCustomer?.customerId, router, isAuthenticated, initializeAuth])

  const handleEndCall = () => {
    endCall()
    router.push('/after-call')
  }


  const handleProcedureChange = (procedureId: string) => {
    setCurrentProcedureId(procedureId)
    setSelectedProcedureIds([procedureId])
  }

  const handleTodoToggle = (todoId: string, checked: boolean) => {
    setCheckedTodos(prev => ({ ...prev, [todoId]: checked }))
    toggleTodo(todoId, checked, '')

    // Save to localStorage
    const storageKey = `call-todos-${currentSession?.sessionId}`
    const currentData = JSON.parse(localStorage.getItem(storageKey) || '{}')
    currentData[todoId] = checked
    localStorage.setItem(storageKey, JSON.stringify(currentData))
  }

  const currentProcedure = mockProcedures.find(p => p.procedureId === currentProcedureId)

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

  if (!currentSession) {
    return <div>Loading...</div>
  }

  return (
    <div style={{
      position: 'relative',
      width: '1678px',
      height: '2900px',
      background: '#FCFCFC',
      margin: '0 auto',
      fontFamily: 'Roboto, sans-serif'
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
          受架電支援AI
        </div>
      </div>

      {/* Status Pills */}
      <div style={{
        position: 'absolute',
        width: '146px',
        height: '48px',
        left: '681px',
        top: '142px',
        background: '#D9D9D9',
        borderRadius: '60px'
      }}>
        <div style={{
          position: 'absolute',
          width: '72px',
          height: '29px',
          left: '37px',
          top: '9px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          架電前
        </div>
      </div>

      <div style={{
        position: 'absolute',
        width: '146px',
        height: '48px',
        left: '853px',
        top: '142px',
        background: '#005DDA',
        borderRadius: '60px'
      }}>
        <div style={{
          position: 'absolute',
          width: '72px',
          height: '29px',
          left: '37px',
          top: '9px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#FFFFFF'
        }}>
          架電中
        </div>
      </div>

      <div style={{
        position: 'absolute',
        width: '146px',
        height: '48px',
        left: '1025px',
        top: '142px',
        background: '#D9D9D9',
        borderRadius: '60px'
      }}>
        <div style={{
          position: 'absolute',
          width: '72px',
          height: '29px',
          left: '37px',
          top: '9px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          架電後
        </div>
      </div>

      {/* Left Sidebar */}
      <div style={{
        position: 'absolute',
        width: '372px',
        height: '1454px',
        left: '55px',
        top: '223px',
        background: '#FFFFFF',
        border: '1px solid #818181',
        borderRadius: '13px'
      }}>

        {/* Customer Info Sections */}
        <div style={{
          position: 'absolute',
          width: '96px',
          height: '29px',
          left: '40px',
          top: '80px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          会員番号
        </div>

        <div style={{
          position: 'absolute',
          width: '327px',
          height: '75px',
          left: '24px',
          top: '120px',
          background: '#F3F3F3',
          borderRadius: '13px'
        }}>
          <div style={{
            position: 'absolute',
            width: '252px',
            height: '34px',
            left: '19px',
            top: '20px',
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: '28px',
            lineHeight: '34px',
            color: '#000000'
          }}>
            {currentCustomer?.accountNumber}
          </div>
        </div>

        <div style={{
          position: 'absolute',
          width: '48px',
          height: '29px',
          left: '40px',
          top: '220px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          名前
        </div>

        <div style={{
          position: 'absolute',
          width: '327px',
          height: '75px',
          left: '24px',
          top: '260px',
          background: '#F3F3F3',
          borderRadius: '13px'
        }}>
          <div style={{
            position: 'absolute',
            width: '112px',
            height: '34px',
            left: '19px',
            top: '20px',
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: '28px',
            lineHeight: '34px',
            color: '#000000'
          }}>
            {currentCustomer?.name}
          </div>
        </div>

        <div style={{
          position: 'absolute',
          width: '72px',
          height: '29px',
          left: '40px',
          top: '360px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          返済日
        </div>

        <div style={{
          position: 'absolute',
          width: '327px',
          height: '75px',
          left: '24px',
          top: '400px',
          background: '#F3F3F3',
          borderRadius: '13px'
        }}>
          <div style={{
            position: 'absolute',
            width: '126px',
            height: '34px',
            left: '19px',
            top: '20px',
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: '28px',
            lineHeight: '34px',
            color: '#000000'
          }}>
            {currentCustomer?.paymentDate}
          </div>
        </div>

        <div style={{
          position: 'absolute',
          width: '72px',
          height: '29px',
          left: '40px',
          top: '500px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          返済額
        </div>

        <div style={{
          position: 'absolute',
          width: '327px',
          height: '75px',
          left: '24px',
          top: '540px',
          background: '#F3F3F3',
          borderRadius: '13px'
        }}>
          <div style={{
            position: 'absolute',
            width: '126px',
            height: '34px',
            left: '19px',
            top: '20px',
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: '28px',
            lineHeight: '34px',
            color: '#000000'
          }}>
            {currentCustomer?.paymentAmount}
          </div>
        </div>

        <div style={{
          position: 'absolute',
          width: '288px',
          height: '29px',
          left: '40px',
          top: '640px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          コンタクト履歴（サマリ）
        </div>

        <div style={{
          position: 'absolute',
          width: '327px',
          height: '385px',
          left: '24px',
          top: '680px',
          background: '#F3F3F3',
          borderRadius: '13px'
        }}>
          <div style={{
            position: 'absolute',
            width: '285px',
            height: '249px',
            left: '19px',
            top: '18px',
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '22px',
            lineHeight: '33px',
            color: '#000000',
            overflowY: 'auto'
          }}>
            {summaryText}
          </div>
        </div>

        <div style={{
          position: 'absolute',
          width: '96px',
          height: '29px',
          left: '40px',
          top: '1100px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          移管確率
        </div>

        <div style={{
          position: 'absolute',
          width: '327px',
          height: '75px',
          left: '24px',
          top: '1140px',
          background: '#F3F3F3',
          borderRadius: '13px'
        }}>
          <div style={{
            position: 'absolute',
            width: '61px',
            height: '34px',
            left: '19px',
            top: '20px',
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: '28px',
            lineHeight: '34px',
            color: '#000000'
          }}>
            {currentCustomer?.migrationProbability}%
          </div>
        </div>
      </div>

      {/* Opening Section */}
      <div style={{
        position: 'absolute',
        width: '1121px',
        height: '390px',
        left: '469px',
        top: '223px',
        background: '#FFFFFF',
        border: '1px solid #818181',
        borderRadius: '13px'
      }}>

        {/* Opening Button */}
        <div
          onClick={() => handleTodoToggle('t5', !checkedTodos['t5'])}
          style={{
            position: 'absolute',
            width: '36px',
            height: '36px',
            left: '29px',
            top: '20px',
            background: checkedTodos['t5'] ? '#4CAF50' : '#005DDA',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '20px',
            fontWeight: 600
          }}
        >
          {checkedTodos['t5'] ? '✓' : ''}
        </div>

        {/* Opening Header */}
        <div style={{
          position: 'absolute',
          width: '167px',
          height: '34px',
          left: '98px',
          top: '26px',
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: '28px',
          lineHeight: '34px',
          color: '#000000'
        }}>
          オープニング
        </div>

        {/* Line */}
        <div style={{
          position: 'absolute',
          width: '1120px',
          height: '0px',
          left: '1px',
          top: '80px',
          border: '1px solid #818181'
        }} />

        {/* Verification Button */}
        <div
          onClick={() => handleTodoToggle('t5', !checkedTodos['t5'])}
          style={{
            position: 'absolute',
            width: '36px',
            height: '36px',
            left: '29px',
            top: '94px',
            background: checkedTodos['t5'] ? '#4CAF50' : '#005DDA',
            border: '1px solid #000000',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          {checkedTodos['t5'] ? '✓' : ''}
        </div>

        {/* Required Label */}
        <div style={{
          position: 'absolute',
          width: '65px',
          height: '36px',
          left: '98px',
          top: '96px',
          background: '#EB0000',
          borderRadius: '20px'
        }}>
          <div style={{
            position: 'absolute',
            width: '36px',
            height: '21px',
            left: '14px',
            top: '7px',
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '19px',
            color: '#FFFFFF',
            textAlign: 'center'
          }}>
            必須
          </div>
        </div>

        {/* Verification Text */}
        <div style={{
          position: 'absolute',
          width: '384px',
          height: '29px',
          left: '178px',
          top: '99px',
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          本人確認の上でプロミスだと名乗る
        </div>

        {/* Verification Script */}
        <div style={{
          position: 'absolute',
          width: '655px',
          height: '112px',
          left: '183px',
          top: '146px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '18px',
          lineHeight: '28px',
          color: '#000000'
        }}>
          〇〇さまのお電話でまちがいないでしょうか。<br />
          ご本人さまであれば、生年月日を教えていただけますでしょうか？<br />
          確認がとれましたら、私、プロミスの◯◯と申します。
        </div>

        {/* Info Background */}
        <div style={{
          position: 'absolute',
          width: '918px',
          height: '82px',
          left: '171px',
          top: '280px',
          background: 'rgba(43, 153, 85, 0.06)',
          borderRadius: '12px'
        }}>
          <div style={{
            position: 'absolute',
            width: '20px',
            height: '20px',
            left: '15px',
            top: '31px',
            borderRadius: '50%',
            background: '#2B9955',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600
          }}>
            i
          </div>
          <div style={{
            position: 'absolute',
            width: '840px',
            height: '54px',
            left: '39px',
            top: '14px',
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '18px',
            lineHeight: '22px',
            color: '#000000'
          }}>
            ＊ 事業主宛/父母等はNG。氏名、生年月日、電話番号いずれかはNG。
          </div>
        </div>
      </div>

      {/* Requirements Section */}
      <div style={{
        position: 'absolute',
        width: '1121px',
        height: '577px',
        left: '469px',
        top: '646px',
        background: '#FFFFFF',
        border: '1px solid #818181',
        borderRadius: '13px'
      }}>

        {/* Requirements Button */}
        <div
          onClick={() => handleTodoToggle('t6', !checkedTodos['t6'])}
          style={{
            position: 'absolute',
            width: '36px',
            height: '36px',
            left: '30px',
            top: '27px',
            background: checkedTodos['t6'] ? '#4CAF50' : '#005DDA',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '20px',
            fontWeight: 600
          }}
        >
          {checkedTodos['t6'] ? '✓' : ''}
        </div>

        {/* Requirements Header */}
        <div style={{
          position: 'absolute',
          width: '112px',
          height: '34px',
          left: '99px',
          top: '31px',
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: '28px',
          lineHeight: '34px',
          color: '#000000'
        }}>
          要件特定
        </div>

        {/* Line */}
        <div style={{
          position: 'absolute',
          width: '1120px',
          height: '0px',
          left: '1px',
          top: '83px',
          border: '1px solid #818181'
        }} />

        {/* Second Button */}
        <div
          onClick={() => handleTodoToggle('t6', !checkedTodos['t6'])}
          style={{
            position: 'absolute',
            width: '36px',
            height: '36px',
            left: '30px',
            top: '99px',
            background: checkedTodos['t6'] ? '#4CAF50' : '#005DDA',
            border: '1px solid #000000',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          {checkedTodos['t6'] ? '✓' : ''}
        </div>

        {/* Required Label 2 */}
        <div style={{
          position: 'absolute',
          width: '65px',
          height: '36px',
          left: '98px',
          top: '99px',
          background: '#EB0000',
          borderRadius: '20px'
        }}>
          <div style={{
            position: 'absolute',
            width: '36px',
            height: '21px',
            left: '14px',
            top: '7px',
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '19px',
            color: '#FFFFFF',
            textAlign: 'center'
          }}>
            必須
          </div>
        </div>

        {/* Requirements Text */}
        <div style={{
          position: 'absolute',
          width: '288px',
          height: '29px',
          left: '177px',
          top: '102px',
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          今回の電話の要件を伝える
        </div>

        {/* Requirements Example */}
        <div style={{
          position: 'absolute',
          width: '717px',
          height: '44px',
          left: '177px',
          top: '147px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '18px',
          lineHeight: '22px',
          color: '#000000'
        }}>
          例）支払いの遅延について状況をお伺いできればと思い、ご連絡いたしました。
        </div>

        {/* Info Background 2 */}
        <div style={{
          position: 'absolute',
          width: '918px',
          height: '82px',
          left: '171px',
          top: '207px',
          background: 'rgba(43, 153, 85, 0.06)',
          borderRadius: '12px'
        }}>
          <div style={{
            position: 'absolute',
            width: '20px',
            height: '20px',
            left: '15px',
            top: '31px',
            borderRadius: '50%',
            background: '#2B9955',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600
          }}>
            i
          </div>
          <div style={{
            position: 'absolute',
            width: '680px',
            height: '44px',
            left: '39px',
            top: '19px',
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '18px',
            lineHeight: '22px',
            color: '#000000'
          }}>
            ＊ 「支払いが難しい＝滞納」とは言わない。理由のヒアリングに注力。
          </div>
        </div>

        {/* Optional Label */}
        <div style={{
          position: 'absolute',
          width: '65px',
          height: '36px',
          left: '98px',
          top: '325px',
          background: '#FFA305',
          borderRadius: '20px'
        }}>
          <div style={{
            position: 'absolute',
            width: '36px',
            height: '21px',
            left: '14px',
            top: '7px',
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '19px',
            color: '#FFFFFF',
            textAlign: 'center'
          }}>
            補足
          </div>
        </div>

        {/* Situation Confirmation */}
        <div style={{
          position: 'absolute',
          width: '384px',
          height: '29px',
          left: '179px',
          top: '328px',
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          事情について詳細確認
        </div>

        {/* Situation Example */}
        <div style={{
          position: 'absolute',
          width: '722px',
          height: '66px',
          left: '180px',
          top: '374px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '18px',
          lineHeight: '22px',
          color: '#000000'
        }}>
          例）差し支えなければ、どういったご事情があって難しかったかお聞かせいただけますか？
        </div>

        {/* Migration Info */}
        <div style={{
          position: 'absolute',
          width: '855px',
          height: '22px',
          left: '238px',
          top: '497px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '18px',
          lineHeight: '22px',
          color: '#000000'
        }}>
          ＊ お客さまは移管確率60%のため、返済行動率を高めるために事実と今後の収支見込みを確認する
        </div>
      </div>

      {/* Procedure Section */}
      <div style={{
        position: 'absolute',
        width: '1121px',
        height: '886px',
        left: '469px',
        top: '1269px',
        background: '#FFFFFF',
        border: '1px solid #818181',
        borderRadius: '13px'
      }}>

        {/* Procedure Button */}
        <div
          onClick={() => handleTodoToggle('t8', !checkedTodos['t8'])}
          style={{
            position: 'absolute',
            width: '36px',
            height: '36px',
            left: '30px',
            top: '32px',
            background: checkedTodos['t8'] ? '#4CAF50' : '#FFFFFF',
            border: '1px solid #000000',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: checkedTodos['t8'] ? '#FFFFFF' : '#000000',
            fontSize: '20px',
            fontWeight: 600
          }}
        >
          {checkedTodos['t8'] ? '✓' : ''}
        </div>

        {/* Procedure Header */}
        <div style={{
          position: 'absolute',
          width: '72px',
          height: '29px',
          left: '80px',
          top: '35px',
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          手続き
        </div>

        {/* Procedure Selection */}
        <div style={{
          position: 'absolute',
          width: '325px',
          height: '48px',
          left: '188px',
          top: '26px'
        }}>
          <select
            value={currentProcedureId}
            onChange={(e) => handleProcedureChange(e.target.value)}
            style={{
              width: '100%',
              height: '100%',
              background: '#005DDA',
              borderRadius: '30px',
              border: 'none',
              color: '#FFFFFF',
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: '24px',
              lineHeight: '29px',
              padding: '0 25px',
              appearance: 'none',
              cursor: 'pointer'
            }}
          >
            {mockProcedures.map(procedure => (
              <option
                key={procedure.procedureId}
                value={procedure.procedureId}
                style={{ background: '#FFFFFF', color: '#000000' }}
              >
                {procedure.name}
              </option>
            ))}
          </select>
          <div style={{
            position: 'absolute',
            right: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '15px',
            height: '15px',
            pointerEvents: 'none',
            color: '#FFFFFF'
          }}>
            ▼
          </div>
        </div>

        {/* Line */}
        <div style={{
          position: 'absolute',
          width: '1120px',
          height: '0px',
          left: '1px',
          top: '95px',
          border: '1px solid #818181'
        }} />

        {/* Negotiation Button */}
        <div
          onClick={() => handleTodoToggle('t7', !checkedTodos['t7'])}
          style={{
            position: 'absolute',
            width: '36px',
            height: '36px',
            left: '30px',
            top: '149px',
            background: checkedTodos['t7'] ? '#4CAF50' : '#005DDA',
            border: '1px solid #000000',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          {checkedTodos['t7'] ? '✓' : ''}
        </div>

        {/* Required Label 3 */}
        <div style={{
          position: 'absolute',
          width: '65px',
          height: '36px',
          left: '98px',
          top: '146px',
          background: '#EB0000',
          borderRadius: '20px'
        }}>
          <div style={{
            position: 'absolute',
            width: '36px',
            height: '21px',
            left: '14px',
            top: '7px',
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '19px',
            color: '#FFFFFF',
            textAlign: 'center'
          }}>
            必須
          </div>
        </div>

        {/* Negotiation Text */}
        <div style={{
          position: 'absolute',
          width: '408px',
          height: '29px',
          left: '180px',
          top: '148px',
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          お客さまと返済期日・金額を交渉する
        </div>

        {/* Negotiation Prompt */}
        <div style={{
          position: 'absolute',
          width: '717px',
          height: '22px',
          left: '179px',
          top: '201px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '18px',
          lineHeight: '22px',
          color: '#000000'
        }}>
          それでは、以下の候補をご確認いただけますか？
        </div>

        {/* Payment Proposals */}
        <div style={{
          position: 'absolute',
          width: '275px',
          height: '143px',
          left: '173px',
          top: '296px',
          background: '#FFFFFF',
          border: '1px solid #CDCDCD',
          borderRadius: '3px'
        }}>
          <div style={{
            position: 'absolute',
            width: '136px',
            height: '42px',
            left: '20px',
            top: '16px',
            background: '#6E6E6E',
            borderRadius: '30px'
          }}>
            <div style={{
              position: 'absolute',
              width: '45px',
              height: '22px',
              left: '40px',
              top: '10px',
              fontFamily: 'Inter',
              fontWeight: 400,
              fontSize: '18px',
              lineHeight: '22px',
              color: '#FFFFFF'
            }}>
              1回目
            </div>
          </div>
          <div style={{
            position: 'absolute',
            width: '148px',
            height: '24px',
            left: '28px',
            top: '71px',
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '24px',
            color: '#000000'
          }}>
            2025年8月15日
          </div>
          <div style={{
            position: 'absolute',
            width: '85px',
            height: '25px',
            left: '28px',
            top: '103px',
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: '21px',
            lineHeight: '25px',
            color: '#000000'
          }}>
            ¥12,000
          </div>
        </div>

        <div style={{
          position: 'absolute',
          width: '274px',
          height: '143px',
          left: '467px',
          top: '296px',
          background: '#FFFFFF',
          border: '1px solid #CDCDCD',
          borderRadius: '3px'
        }}>
          <div style={{
            position: 'absolute',
            width: '136px',
            height: '42px',
            left: '20px',
            top: '16px',
            background: '#6E6E6E',
            borderRadius: '30px'
          }}>
            <div style={{
              position: 'absolute',
              width: '54px',
              height: '22px',
              left: '40px',
              top: '10px',
              fontFamily: 'Inter',
              fontWeight: 400,
              fontSize: '18px',
              lineHeight: '22px',
              color: '#FFFFFF'
            }}>
              2回目
            </div>
          </div>
          <div style={{
            position: 'absolute',
            width: '151px',
            height: '24px',
            left: '18px',
            top: '71px',
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '24px',
            color: '#000000'
          }}>
            2025年8月25日
          </div>
          <div style={{
            position: 'absolute',
            width: '75px',
            height: '25px',
            left: '21px',
            top: '103px',
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: '21px',
            lineHeight: '25px',
            color: '#000000'
          }}>
            ¥9,000
          </div>
        </div>

        <div style={{
          position: 'absolute',
          width: '275px',
          height: '143px',
          left: '760px',
          top: '296px',
          background: '#FFFFFF',
          border: '1px solid #CDCDCD',
          borderRadius: '3px'
        }}>
          <div style={{
            position: 'absolute',
            width: '136px',
            height: '42px',
            left: '24px',
            top: '16px',
            background: '#6E6E6E',
            borderRadius: '30px'
          }}>
            <div style={{
              position: 'absolute',
              width: '54px',
              height: '22px',
              left: '40px',
              top: '10px',
              fontFamily: 'Inter',
              fontWeight: 400,
              fontSize: '18px',
              lineHeight: '22px',
              color: '#FFFFFF'
            }}>
              3回目
            </div>
          </div>
          <div style={{
            position: 'absolute',
            width: '149px',
            height: '24px',
            left: '23px',
            top: '71px',
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '24px',
            color: '#000000'
          }}>
            2025年8月31日
          </div>
          <div style={{
            position: 'absolute',
            width: '176px',
            height: '25px',
            left: '23px',
            top: '103px',
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: '21px',
            lineHeight: '25px',
            textAlign: 'center',
            color: '#000000'
          }}>
            ¥3,000（利息のみ）
          </div>
        </div>

        {/* Negotiation Info */}
        <div style={{
          position: 'absolute',
          width: '758px',
          height: '44px',
          left: '248px',
          top: '474px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '18px',
          lineHeight: '22px',
          color: '#000000'
        }}>
          ＊ まずは本日から近い日付、約定日に近い日程で交渉する
        </div>

        {/* Payment Method Section */}
        <div style={{
          position: 'absolute',
          width: '1120px',
          height: '0px',
          left: '1px',
          top: '574px',
          border: '1px solid #DEDEDE'
        }} />

        <div
          onClick={() => handleTodoToggle('t13', !checkedTodos['t13'])}
          style={{
            position: 'absolute',
            width: '36px',
            height: '36px',
            left: '30px',
            top: '593px',
            background: checkedTodos['t13'] ? '#4CAF50' : '#FFFFFF',
            border: '1px solid #000000',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: checkedTodos['t13'] ? '#FFFFFF' : '#000000',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          {checkedTodos['t13'] ? '✓' : ''}
        </div>

        <div style={{
          position: 'absolute',
          width: '65px',
          height: '36px',
          left: '98px',
          top: '593px',
          background: '#FFA305',
          borderRadius: '20px'
        }}>
          <div style={{
            position: 'absolute',
            width: '36px',
            height: '21px',
            left: '13px',
            top: '7px',
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '19px',
            color: '#FFFFFF',
            textAlign: 'center'
          }}>
            補足
          </div>
        </div>

        <div style={{
          position: 'absolute',
          width: '240px',
          height: '29px',
          left: '189px',
          top: '596px',
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          支払い方法を確認する
        </div>

        <div style={{
          position: 'absolute',
          width: '722px',
          height: '44px',
          left: '190px',
          top: '640px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '18px',
          lineHeight: '22px',
          color: '#000000'
        }}>
          現在の方法（ATM/銀行振込など）をご希望ですか？
        </div>

        {/* Fee Section */}
        <div style={{
          position: 'absolute',
          width: '1120px',
          height: '0px',
          left: '1px',
          top: '713px',
          border: '1px solid #DEDEDE'
        }} />

        <div
          onClick={() => handleTodoToggle('t14', !checkedTodos['t14'])}
          style={{
            position: 'absolute',
            width: '36px',
            height: '36px',
            left: '30px',
            top: '745px',
            background: checkedTodos['t14'] ? '#4CAF50' : '#FFFFFF',
            border: '1px solid #000000',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: checkedTodos['t14'] ? '#FFFFFF' : '#000000',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          {checkedTodos['t14'] ? '✓' : ''}
        </div>

        <div style={{
          position: 'absolute',
          width: '65px',
          height: '36px',
          left: '98px',
          top: '741px',
          background: '#FFA305',
          borderRadius: '20px'
        }}>
          <div style={{
            position: 'absolute',
            width: '36px',
            height: '21px',
            left: '13px',
            top: '7px',
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '19px',
            color: '#FFFFFF',
            textAlign: 'center'
          }}>
            補足
          </div>
        </div>

        <div style={{
          position: 'absolute',
          width: '192px',
          height: '29px',
          left: '184px',
          top: '743px',
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          手数料を案内する
        </div>

        <div style={{
          position: 'absolute',
          width: '722px',
          height: '44px',
          left: '189px',
          top: '792px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '18px',
          lineHeight: '22px',
          color: '#000000'
        }}>
          支払ATMでの取扱手数料が発生します。手数料は返済金額とは別にお客さまの負担になります。
        </div>
      </div>

      {/* Closing Section */}
      <div style={{
        position: 'absolute',
        width: '1121px',
        height: '586px',
        left: '469px',
        top: '2190px',
        background: '#FFFFFF',
        border: '1px solid #818181',
        borderRadius: '13px'
      }}>

        <div
          onClick={() => handleTodoToggle('t9', !checkedTodos['t9'])}
          style={{
            position: 'absolute',
            width: '36px',
            height: '36px',
            left: '44px',
            top: '33px',
            background: checkedTodos['t9'] ? '#4CAF50' : '#FFFFFF',
            border: '1px solid #000000',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: checkedTodos['t9'] ? '#FFFFFF' : '#000000',
            fontSize: '20px',
            fontWeight: 600
          }}
        >
          {checkedTodos['t9'] ? '✓' : ''}
        </div>

        <div style={{
          position: 'absolute',
          width: '229px',
          height: '42px',
          left: '101px',
          top: '37px',
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          クロージング
        </div>

        <div style={{
          position: 'absolute',
          width: '1120px',
          height: '0px',
          left: '1px',
          top: '99px',
          border: '1px solid #818181'
        }} />

        <div
          onClick={() => handleTodoToggle('t10', !checkedTodos['t10'])}
          style={{
            position: 'absolute',
            width: '36px',
            height: '36px',
            left: '44px',
            top: '127px',
            background: checkedTodos['t10'] ? '#4CAF50' : '#FFFFFF',
            border: '1px solid #000000',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: checkedTodos['t10'] ? '#FFFFFF' : '#000000',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          {checkedTodos['t10'] ? '✓' : ''}
        </div>

        <div style={{
          position: 'absolute',
          width: '65px',
          height: '36px',
          left: '98px',
          top: '127px',
          background: '#EB0000',
          borderRadius: '20px'
        }}>
          <div style={{
            position: 'absolute',
            width: '36px',
            height: '21px',
            left: '14px',
            top: '7px',
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '19px',
            color: '#FFFFFF',
            textAlign: 'center'
          }}>
            必須
          </div>
        </div>

        <div style={{
          position: 'absolute',
          width: '336px',
          height: '29px',
          left: '181px',
          top: '129px',
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          次回の期日・支払額を確認する
        </div>

        <div style={{
          position: 'absolute',
          width: '717px',
          height: '22px',
          left: '181px',
          top: '177px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '18px',
          lineHeight: '22px',
          color: '#000000'
        }}>
          それでは、○○○○年○月○日までに、提携ATMでのお支払いということで承りました。
        </div>

        <div style={{
          position: 'absolute',
          width: '1120px',
          height: '0px',
          left: '1px',
          top: '236px',
          border: '1px solid #DEDEDE'
        }} />

        <div
          onClick={() => handleTodoToggle('t11', !checkedTodos['t11'])}
          style={{
            position: 'absolute',
            width: '36px',
            height: '36px',
            left: '42px',
            top: '266px',
            background: checkedTodos['t11'] ? '#4CAF50' : '#FFFFFF',
            border: '1px solid #000000',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: checkedTodos['t11'] ? '#FFFFFF' : '#000000',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          {checkedTodos['t11'] ? '✓' : ''}
        </div>

        <div style={{
          position: 'absolute',
          width: '65px',
          height: '36px',
          left: '98px',
          top: '266px',
          background: '#FFA305',
          borderRadius: '20px'
        }}>
          <div style={{
            position: 'absolute',
            width: '36px',
            height: '21px',
            left: '13px',
            top: '7px',
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '19px',
            color: '#FFFFFF',
            textAlign: 'center'
          }}>
            補足
          </div>
        </div>

        <div style={{
          position: 'absolute',
          width: '528px',
          height: '29px',
          left: '184px',
          top: '270px',
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          次回期日までは督促が停止されることを案内する
        </div>

        <div style={{
          position: 'absolute',
          width: '722px',
          height: '44px',
          left: '184px',
          top: '323px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '18px',
          lineHeight: '22px',
          color: '#000000'
        }}>
          このお電話をもって、今後は次の期日までお客様に個別のご連絡は行わないように進めますので、ご了承ください。
        </div>

        <div style={{
          position: 'absolute',
          width: '1120px',
          height: '0px',
          left: '1px',
          top: '395px',
          border: '1px solid #DEDEDE'
        }} />

        <div
          onClick={() => handleTodoToggle('t12', !checkedTodos['t12'])}
          style={{
            position: 'absolute',
            width: '36px',
            height: '36px',
            left: '42px',
            top: '421px',
            background: checkedTodos['t12'] ? '#4CAF50' : '#FFFFFF',
            border: '1px solid #000000',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: checkedTodos['t12'] ? '#FFFFFF' : '#000000',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          {checkedTodos['t12'] ? '✓' : ''}
        </div>

        <div style={{
          position: 'absolute',
          width: '65px',
          height: '36px',
          left: '98px',
          top: '421px',
          background: '#FFA305',
          borderRadius: '20px'
        }}>
          <div style={{
            position: 'absolute',
            width: '36px',
            height: '21px',
            left: '13px',
            top: '7px',
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '19px',
            color: '#FFFFFF',
            textAlign: 'center'
          }}>
            補足
          </div>
        </div>

        <div style={{
          position: 'absolute',
          width: '432px',
          height: '29px',
          left: '178px',
          top: '424px',
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: '24px',
          lineHeight: '29px',
          color: '#000000'
        }}>
          お客さまからの質問がないかを確認する
        </div>

        <div style={{
          position: 'absolute',
          width: '722px',
          height: '44px',
          left: '184px',
          top: '477px',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '18px',
          lineHeight: '22px',
          color: '#000000'
        }}>
          私からのご案内は以上となりますが、最後にお客さまから気になることなどございますか？
        </div>
      </div>

      {/* End Call Button - Bottom of Content */}
      <div style={{
        position: 'absolute',
        left: '0',
        top: '2750px',
        width: '100%',
        padding: '40px 0',
        display: 'flex',
        justifyContent: 'center',
        background: '#FCFCFC'
      }}>
        <button
          onClick={handleEndCall}
          style={{
            padding: '20px 60px',
            background: '#EB0000',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            fontSize: '24px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(235, 0, 0, 0.3)',
            transition: 'all 0.3s ease',
            fontFamily: 'Inter, sans-serif'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#C50000'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(235, 0, 0, 0.4)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#EB0000'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(235, 0, 0, 0.3)'
          }}
        >
          🔚 通話終了
        </button>
      </div>

    </div>
  )
}