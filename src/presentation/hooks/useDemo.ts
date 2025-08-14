'use client'

import { useCallback, useEffect, useState } from 'react'

export interface DemoStep {
    id: string
    description: string
    action: 'navigate' | 'click' | 'type' | 'highlight' | 'wait' | 'calling'
    target?: string
    value?: string
    duration: number
    telop: string
    cursorPosition?: { x: number; y: number }
}

const demoSteps: DemoStep[] = [
    {
        id: '1',
        description: 'Navigate to before-call page',
        action: 'navigate',
        target: '/before-call',
        duration: 3000,
        telop: '通話前確認画面に移動します',
        cursorPosition: { x: 100, y: 100 }
    },
    {
        id: '2',
        description: 'Select customer',
        action: 'click',
        target: 'select',
        duration: 3000,
        telop: '顧客「山田太郎」さんを選択します',
        cursorPosition: { x: 300, y: 200 }
    },
    {
        id: '3',
        description: 'Check first precheck item',
        action: 'click',
        target: 'input[type="checkbox"]:first-of-type',
        duration: 2000,
        telop: '前回の約束内容を確認しました',
        cursorPosition: { x: 500, y: 400 }
    },
    {
        id: '4',
        description: 'Check second precheck item',
        action: 'click',
        target: 'input[type="checkbox"]:nth-of-type(2)',
        duration: 2000,
        telop: '顧客の支払い履歴を確認しました',
        cursorPosition: { x: 500, y: 450 }
    },
    {
        id: '5',
        description: 'Check third precheck item',
        action: 'click',
        target: 'input[type="checkbox"]:nth-of-type(3)',
        duration: 2000,
        telop: '返済可能額の目安を把握しました',
        cursorPosition: { x: 500, y: 500 }
    },
    {
        id: '6',
        description: 'Check fourth precheck item',
        action: 'click',
        target: 'input[type="checkbox"]:nth-of-type(4)',
        duration: 2000,
        telop: '交渉材料の準備ができました',
        cursorPosition: { x: 500, y: 550 }
    },
    {
        id: '7',
        description: 'Click start call button',
        action: 'click',
        target: 'button[onclick*="handleStartCall"]',
        duration: 2000,
        telop: '通話を開始します',
        cursorPosition: { x: 600, y: 700 }
    },
    {
        id: '8',
        description: 'Show calling screen',
        action: 'calling',
        duration: 3000,
        telop: '顧客に発信中です...',
        cursorPosition: { x: 640, y: 360 }
    },
    {
        id: '9',
        description: 'Navigate to in-call page',
        action: 'navigate',
        target: '/in-call',
        duration: 3000,
        telop: '通話が接続されました。手続き選択画面に移動します',
        cursorPosition: { x: 400, y: 300 }
    },
    {
        id: '10',
        description: 'Select procedure',
        action: 'click',
        target: 'select',
        value: 'p1',
        duration: 3000,
        telop: '手続き「一時約束」を選択します',
        cursorPosition: { x: 800, y: 400 }
    },
    {
        id: '11',
        description: 'Check first todo',
        action: 'click',
        target: 'input[type="checkbox"]:first-of-type',
        duration: 3000,
        telop: '本人確認が完了しました',
        cursorPosition: { x: 500, y: 500 }
    },
    {
        id: '12',
        description: 'Check second todo',
        action: 'click',
        target: 'input[type="checkbox"]:nth-of-type(2)',
        duration: 3000,
        telop: '要件説明を行いました',
        cursorPosition: { x: 500, y: 550 }
    },
    {
        id: '13',
        description: 'Check third todo',
        action: 'click',
        target: 'input[type="checkbox"]:nth-of-type(3)',
        duration: 4000,
        telop: '返済交渉を実施します',
        cursorPosition: { x: 500, y: 600 }
    },
    {
        id: '14',
        description: 'Navigate to after-call page',
        action: 'navigate',
        target: '/after-call',
        duration: 3000,
        telop: '通話を終了し、事後処理画面に移動します',
        cursorPosition: { x: 600, y: 800 }
    },
    {
        id: '15',
        description: 'Show results',
        action: 'wait',
        duration: 3000,
        telop: '通話結果を確認しています',
        cursorPosition: { x: 400, y: 400 }
    },
    {
        id: '16',
        description: 'Show auto-generated todos',
        action: 'highlight',
        target: '.auto-generated-todos',
        duration: 4000,
        telop: 'システムが自動的に事後処理TODOを生成しました',
        cursorPosition: { x: 800, y: 600 }
    }
]

export function useDemo() {
    const [currentStep, setCurrentStep] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
    const [isClicking, setIsClicking] = useState(false)
    const [showCallingScreen, setShowCallingScreen] = useState(false)

    const executeStep = useCallback(async (step: DemoStep) => {
        console.log(`Executing step: ${step.description}`)

        // カーソル位置を更新
        if (step.cursorPosition) {
            setCursorPosition(step.cursorPosition)
        }

        switch (step.action) {
            case 'navigate':
                if (step.target) {
                    window.location.href = step.target
                }
                break

            case 'click':
                setIsClicking(true)

                if (step.target) {
                    // 要素を見つけてクリック
                    const element = document.querySelector(step.target) as HTMLElement
                    if (element) {
                        await new Promise(resolve => setTimeout(resolve, 1000)) // カーソル移動待機
                        element.click()
                    }
                }

                setTimeout(() => setIsClicking(false), 300)
                break

            case 'type':
                if (step.target && step.value) {
                    const element = document.querySelector(step.target) as HTMLInputElement
                    if (element) {
                        element.focus()
                        // タイピングアニメーション
                        for (let i = 0; i <= step.value.length; i++) {
                            await new Promise(resolve => setTimeout(resolve, 100))
                            element.value = step.value.substring(0, i)
                            element.dispatchEvent(new Event('input', { bubbles: true }))
                        }
                    }
                }
                break

            case 'highlight':
                if (step.target) {
                    const element = document.querySelector(step.target) as HTMLElement
                    if (element) {
                        element.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.8)'
                        element.style.transform = 'scale(1.02)'
                        element.style.transition = 'all 0.3s ease'

                        setTimeout(() => {
                            element.style.boxShadow = ''
                            element.style.transform = ''
                        }, step.duration)
                    }
                }
                break

            case 'calling':
                setShowCallingScreen(true)
                setTimeout(() => {
                    setShowCallingScreen(false)
                }, step.duration)
                break

            case 'wait':
                // 待機のみ
                break
        }
    }, [])

    const nextStep = useCallback(() => {
        if (currentStep < demoSteps.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            setIsRunning(false)
        }
    }, [currentStep])

    const startDemo = useCallback(() => {
        setIsRunning(true)
        setCurrentStep(0)
    }, [])

    const pauseDemo = useCallback(() => {
        setIsPaused(!isPaused)
    }, [isPaused])

    const stopDemo = useCallback(() => {
        setIsRunning(false)
        setCurrentStep(0)
        setIsPaused(false)
    }, [])

    useEffect(() => {
        if (isRunning && !isPaused && currentStep < demoSteps.length) {
            const step = demoSteps[currentStep]

            executeStep(step).then(() => {
                const timer = setTimeout(() => {
                    nextStep()
                }, step.duration)

                return () => clearTimeout(timer)
            })
        }
    }, [currentStep, isRunning, isPaused, executeStep, nextStep])

    return {
        currentStep,
        totalSteps: demoSteps.length,
        isRunning,
        isPaused,
        cursorPosition,
        isClicking,
        showCallingScreen,
        currentStepData: demoSteps[currentStep],
        startDemo,
        pauseDemo,
        stopDemo,
        nextStep,
        setCurrentStep
    }
}