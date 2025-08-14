/**
 * 通話セッションの状態と制約を管理する定数
 * 
 * このファイルは、通話システムにおけるセッション状態の管理と
 * ユーザー・オペレーターの入室制約を定義します。
 */

/**
 * 通話セッションの状態
 */
export const CallSessionStatus = {
    WAITING: 'waiting',
    ACTIVE: 'active',
    ENDED: 'ended'
} as const;

export type CallSessionStatus = typeof CallSessionStatus[keyof typeof CallSessionStatus];

/**
 * 通話参加者の役割
 */
export const CallParticipantRole = {
    USER: 'user',
    OPERATOR: 'operator'
} as const;

export type CallParticipantRole = typeof CallParticipantRole[keyof typeof CallParticipantRole];

/**
 * 通話セッションの制約設定
 */
export const CallSessionConstraints = {
    /** 最大同時ペア数（現状は1組のみ） */
    MAX_CONCURRENT_PAIRS: 1,

    /** セッション作成から自動削除までの時間（ミリ秒） */
    SESSION_CLEANUP_DELAY: 30 * 60 * 1000, // 30分

    /** 入室待機状態の最大保持時間（ミリ秒） */
    MAX_WAITING_TIME: 10 * 60 * 1000, // 10分
} as const;

/**
 * ローカルストレージのキー
 */
export const StorageKeys = {
    /** 通話セッション情報 */
    CALL_SESSION: 'call-session',

    /** 会話履歴 */
    CONVERSATION_HISTORY: 'conversation-history',

    /** セッション制約状態 */
    SESSION_CONSTRAINTS: 'session-constraints',

    /** 参加者入室状態 */
    PARTICIPANT_STATUS: 'participant-status'
} as const;
