export interface Customer {
    customerId: string
    name: string
    accountNumber: string
    paymentDate: string
    paymentAmount: string
    contactHistory?: string
    migrationProbability?: number
}

export interface MemoSummary {
    customerId: string
    summaryText: string
    lastUpdated: Date
}

export interface Procedure {
    procedureId: string
    name: string
    category: string
}

export interface TodoItem {
    todoId: string
    label: string
    required: boolean
    phase: 'before' | 'during' | 'after'
    procedureId?: string
}

export interface TodoResult {
    todoId: string
    checked: boolean
    note?: string
    timestamp: Date
    operatorId?: string
}

export interface TalkScript {
    scriptId: string
    procedureId: string
    title: string
    content: string
    required: boolean
}

export interface Knowledge {
    knowledgeId: string
    procedureId: string
    title: string
    content: string
    tags: string[]
}

export interface ProcedureAssets {
    procedureId: string
    todoItems: TodoItem[]
    talkScripts: TalkScript[]
    knowledgeSnippets: Knowledge[]
}

export interface CallSession {
    sessionId: string
    customerId: string
    startTime: Date | null
    endTime: Date | null
    selectedProcedures: string[]
    todoResults: TodoResult[]
    phase: 'before' | 'during' | 'after'
}