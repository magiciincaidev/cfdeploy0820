/**
 * CallSession - 通話セッションのエンティティ定義
 * 
 * このファイルは、通話システムにおけるセッション管理と会話データの構造を定義します。
 * ユーザー側とオペレーター側の両方で使用される共通のデータ構造です。
 * 
 * 主要な概念:
 * - CallSession: 通話セッション全体の情報
 * - ConversationMessage: 個別の会話メッセージ
 * - AIActionSuggestion: AIからのアクション提案
 * - CallSessionRepository: データアクセスの抽象化
 * - CallSessionConstraints: セッション制約の管理
 */

/**
 * 通話セッションの基本情報
 * 
 * ユーザーとオペレーターの間の通話セッションを表現します。
 * セッションの開始から終了まで、通話に関する全ての情報を管理します。
 */
export interface CallSession {
    /** セッションを一意に識別するID */
    sessionId: string;

    /** 通話を行うユーザーのID */
    userId: string;

    /** 通話を担当するオペレーターのID */
    operatorId: string;

    /** 会話を識別するID（複数の会話がある場合の管理用） */
    conversationId: string;

    /** セッション開始時刻（ISO 8601形式） */
    startTime: string;

    /** セッション終了時刻（ISO 8601形式、終了前はundefined） */
    endTime?: string;

    /** セッションの現在の状態 */
    status: 'waiting' | 'active' | 'ended';

    /** セッション内の会話履歴 */
    conversationHistory: ConversationMessage[];

    /** セッションの制約情報 */
    constraints: CallSessionConstraints;

    /** 参加者の入室状態 */
    participants: CallParticipants;
}

/**
 * セッション制約の情報
 * 
 * 通話セッションにおける制約条件を管理します。
 * 同時ペア数や入室制限などのビジネスルールを表現します。
 */
export interface CallSessionConstraints {
    /** 最大同時ペア数 */
    maxConcurrentPairs: number;

    /** セッション作成時刻 */
    createdAt: string;

    /** セッション自動削除予定時刻 */
    cleanupAt: string;

    /** 入室待機状態の最大保持時間（ミリ秒） */
    maxWaitingTime: number;
}

/**
 * 通話参加者の状態
 * 
 * ユーザーとオペレーターの入室状態を管理します。
 * 両方が入室した時点でセッションがアクティブになります。
 */
export interface CallParticipants {
    /** ユーザーの入室状態 */
    user: ParticipantStatus;

    /** オペレーターの入室状態 */
    operator: ParticipantStatus;
}

/**
 * 個別参加者の状態
 */
export interface ParticipantStatus {
    /** 参加者ID */
    id: string;

    /** 入室時刻（ISO 8601形式） */
    joinedAt: string;

    /** 退室時刻（ISO 8601形式、在室中はundefined） */
    leftAt?: string;

    /** 現在の状態 */
    status: 'waiting' | 'joined' | 'left';
}

/**
 * 会話メッセージの構造
 * 
 * 通話内でやり取りされる個別のメッセージを表現します。
 * ユーザー、オペレーター、AIの3つの送信者に対応しています。
 */
export interface ConversationMessage {
    /** メッセージを一意に識別するID */
    id: string;

    /** メッセージ送信時刻（ISO 8601形式） */
    timestamp: string;

    /** メッセージの送信者 */
    sender: 'user' | 'operator' | 'ai';

    /** メッセージの内容 */
    message: string;

    /** AIからの提案（AIメッセージの場合のみ） */
    aiSuggestion?: AIActionSuggestion;
}

/**
 * AIアクション提案の構造
 * 
 * AIがオペレーターに対して提案する次のアクションの詳細情報です。
 * 優先度、説明、推奨応答、信頼度などの情報を含みます。
 */
export interface AIActionSuggestion {
    /** 提案するアクションの概要 */
    action: string;

    /** アクションの優先度 */
    priority: 'low' | 'medium' | 'high';

    /** アクションの詳細説明 */
    description: string;

    /** オペレーターへの推奨応答例 */
    suggestedResponse?: string;

    /** AI提案の信頼度（0-100のパーセンテージ） */
    confidence: number;

    /** 提案生成時刻（ISO 8601形式） */
    timestamp: string;
}

/**
 * 通話セッションのリポジトリインターフェース
 * 
 * データアクセス層との契約を定義します。
 * 実際の実装は、ローカルストレージ、データベース、APIなどで提供されます。
 * 
 * このインターフェースにより、ビジネスロジック層はデータアクセスの詳細に依存せずに
 * セッション管理を行うことができます。
 */
export interface CallSessionRepository {
    /**
     * 新しい通話セッションを作成
     * 
     * @param userId ユーザーID
     * @param operatorId オペレーターID
     * @returns 作成されたセッション情報
     */
    createSession(userId: string, operatorId: string): Promise<CallSession>;

    /**
     * 指定されたIDのセッションを取得
     * 
     * @param sessionId セッションID
     * @returns セッション情報、存在しない場合はnull
     */
    getSession(sessionId: string): Promise<CallSession | null>;

    /**
     * セッション情報を更新
     * 
     * @param sessionId 更新するセッションのID
     * @param updates 更新する情報の部分オブジェクト
     */
    updateSession(sessionId: string, updates: Partial<CallSession>): Promise<void>;

    /**
     * セッションを終了
     * 
     * @param sessionId 終了するセッションのID
     */
    endSession(sessionId: string): Promise<void>;

    /**
     * セッションにメッセージを追加
     * 
     * @param sessionId メッセージを追加するセッションのID
     * @param message 追加するメッセージ
     */
    addMessage(sessionId: string, message: ConversationMessage): Promise<void>;
}
