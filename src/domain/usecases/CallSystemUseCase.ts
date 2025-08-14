import { CallParticipants, CallSession, CallSessionConstraints, ConversationMessage } from '@/src/domain/entities/CallSession';
import { ConversationContext, OpenAIResponse, OpenAIService } from '@/src/infrastructure/api/openai';
import { CallSessionStatus, CallSessionConstraints as Constraints, StorageKeys } from '@/src/shared/constants/callSession';

/**
 * CallSystemUseCase - 通話システムの中核ビジネスロジック
 * 
 * このユースケースクラスは、通話システムにおける以下の機能を提供します：
 * 
 * 1. AI支援機能
 *    - ユーザーメッセージの処理とAI提案の生成
 *    - OpenAI APIとの連携（モック対応）
 *    - オペレーターへの次のアクション提案
 * 
 * 2. セッション管理
 *    - ユーザー・オペレーター・会話の一意ID生成
 *    - 通話セッションの開始・終了・状態管理
 *    - セッション情報の永続化と取得
 * 
 * 3. データ永続化
 *    - ローカルストレージを使用したセッション情報の保存
 *    - 会話履歴の管理（メッセージ、タイムスタンプ、AI提案など）
 *    - ブラウザセッション間でのデータ保持
 * 
 * 4. システム統合
 *    - プレゼンテーション層とインフラストラクチャ層の橋渡し
 *    - ビジネスルールの適用とデータフローの制御
 *    - ユーザー側とオペレーター側の両方で使用
 * 
 * 5. セッション制約管理
 *    - 同時ペア数の制限（現状1組のみ）
 *    - 参加者の入室制御
 *    - セッション状態の自動管理
 * 
 * 使用方法:
 * - ユーザー画面: メッセージ送信時のAI提案生成
 * - オペレーター画面: セッション管理と会話履歴表示
 * - 通話管理: 通話の開始・終了・履歴の保存・復元
 * - 制約管理: セッション制約の適用と参加者入室制御
 * 
 * アーキテクチャ上の位置づけ:
 * プレゼンテーション層 (UI) → CallSystemUseCase → インフラストラクチャ層 (API, Storage)
 */
export class CallSystemUseCase {
    private openAIService: OpenAIService;

    constructor() {
        this.openAIService = new OpenAIService();
    }

    /**
     * ユニークIDを生成
     * 
     * タイムスタンプとランダム文字列を組み合わせて、
     * システム内で一意となるIDを生成します。
     * 
     * @returns 一意のID文字列（例: id_1703123456789_abc123def）
     */
    generateUniqueId(): string {
        return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * セッションIDを生成
     * 
     * 通話セッションを識別するための一意IDを生成します。
     * ユーザーとオペレーターの間の通話セッションを管理するために使用されます。
     * 
     * @returns セッションID文字列（例: session_1703123456789_abc123def）
     */
    generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 会話IDを生成
     * 
     * 個別の会話を識別するための一意IDを生成します。
     * 通話内での特定の会話スレッドを管理するために使用されます。
     * 
     * @returns 会話ID文字列（例: conv_1703123456789_abc123def）
     */
    generateConversationId(): string {
        return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 制約付きセッションを作成
     * 
     * セッション制約を適用して新しい通話セッションを作成します。
     * 同時ペア数の制限や入室制御などのビジネスルールを適用します。
     * 
     * @param userId ユーザーID
     * @param operatorId オペレーターID
     * @returns 作成されたセッション情報
     * @throws 制約違反の場合のエラー
     */
    createConstrainedSession(userId: string, operatorId: string): CallSession {
        console.log('=== createConstrainedSession 開始 ===', { userId, operatorId })

        // 既存セッションの制約チェック
        this.checkSessionConstraints();

        const now = new Date().toISOString();
        const sessionId = this.generateSessionId();
        const conversationId = this.generateConversationId();

        const constraints: CallSessionConstraints = {
            maxConcurrentPairs: Constraints.MAX_CONCURRENT_PAIRS,
            createdAt: now,
            cleanupAt: new Date(Date.now() + Constraints.SESSION_CLEANUP_DELAY).toISOString(),
            maxWaitingTime: Constraints.MAX_WAITING_TIME
        };

        const participants: CallParticipants = {
            user: {
                id: userId,
                joinedAt: now,
                status: 'waiting'
            },
            operator: {
                id: operatorId,
                joinedAt: now,
                status: 'waiting'
            }
        };

        const session: CallSession = {
            sessionId,
            userId,
            operatorId,
            conversationId,
            startTime: now,
            status: CallSessionStatus.WAITING,
            conversationHistory: [],
            constraints,
            participants
        };

        console.log('セッション作成完了:', {
            sessionId,
            conversationId,
            status: session.status,
            userStatus: session.participants.user.status,
            operatorStatus: session.participants.operator.status,
            timestamp: now
        });

        this.saveSessionToStorage(session);
        this.saveSessionConstraints(sessionId, constraints);
        this.saveParticipantStatus(sessionId, participants);

        return session;
    }

    /**
     * セッション制約をチェック
     * 
     * 同時ペア数の制限などのセッション制約をチェックします。
     * 制約違反の場合はエラーを投げます。
     * 
     * @throws 制約違反の場合のエラー
     */
    private checkSessionConstraints(): void {
        const activeSessions = this.getActiveSessions();
        if (activeSessions.length >= Constraints.MAX_CONCURRENT_PAIRS) {
            throw new Error(`同時ペア数の制限に達しています。最大${Constraints.MAX_CONCURRENT_PAIRS}組まで利用可能です。`);
        }
    }

    /**
     * 全てのセッションを取得
     * 
     * ローカルストレージから全てのセッション情報を取得します。
     * データ構造が不完全なセッションは除外します。
     * 
     * @returns 全てのセッションの配列
     */
    getAllSessions(): CallSession[] {
        const sessions: CallSession[] = [];
        const keys = Object.keys(localStorage);

        console.log('=== getAllSessions 開始 ===')
        console.log('localStorage キー数:', keys.length)
        console.log('CALL_SESSION プレフィックス:', StorageKeys.CALL_SESSION)

        for (const key of keys) {
            if (key.startsWith(StorageKeys.CALL_SESSION)) {
                try {
                    const session = JSON.parse(localStorage.getItem(key) || '');
                    if (session) {
                        // データ構造の整合性をチェック
                        if (this.isValidSession(session)) {
                            sessions.push(session);
                            console.log('セッション読み込み成功:', {
                                key,
                                sessionId: session.sessionId,
                                status: session.status
                            })
                        } else {
                            console.warn('不完全なセッションデータを除外:', {
                                key,
                                sessionId: session.sessionId,
                                reason: 'データ構造が不完全'
                            })
                            // 不完全なデータを削除
                            localStorage.removeItem(key)
                        }
                    }
                } catch (error) {
                    console.warn('セッション情報の解析に失敗:', key, error)
                    // 破損したデータを削除
                    localStorage.removeItem(key)
                }
            }
        }

        console.log('取得されたセッション数:', sessions.length)
        return sessions;
    }

    /**
     * セッションデータの整合性をチェック
     * 
     * @param session チェックするセッション
     * @returns 整合性が取れている場合はtrue
     */
    private isValidSession(session: any): session is CallSession {
        return (
            session &&
            typeof session === 'object' &&
            typeof session.sessionId === 'string' &&
            typeof session.userId === 'string' &&
            typeof session.operatorId === 'string' &&
            typeof session.status === 'string' &&
            session.participants &&
            typeof session.participants === 'object' &&
            session.participants.user &&
            typeof session.participants.user === 'object' &&
            session.participants.operator &&
            typeof session.participants.operator === 'object' &&
            typeof session.participants.user.status === 'string' &&
            typeof session.participants.operator.status === 'string'
        );
    }

    /**
     * アクティブなセッションを取得
     * 
     * 現在アクティブまたは待機中のセッションを取得します。
     * 
     * @returns アクティブなセッションの配列
     */
    private getActiveSessions(): CallSession[] {
        const sessions: CallSession[] = [];
        const keys = Object.keys(localStorage);

        for (const key of keys) {
            if (key.startsWith(StorageKeys.CALL_SESSION)) {
                try {
                    const session = JSON.parse(localStorage.getItem(key) || '');
                    if (session && (session.status === CallSessionStatus.ACTIVE || session.status === CallSessionStatus.WAITING)) {
                        sessions.push(session);
                    }
                } catch (error) {
                    console.warn('セッション情報の解析に失敗:', key, error);
                }
            }
        }

        return sessions;
    }

    /**
     * 参加者の入室処理
     * 
     * 指定された参加者がセッションに入室します。
     * 両方が入室した時点でセッションがアクティブになります。
     * 
     * @param sessionId セッションID
     * @param participantId 参加者ID
     * @param role 参加者の役割
     * @returns 更新されたセッション情報
     */
    joinSession(sessionId: string, participantId: string, role: 'user' | 'operator'): CallSession {
        console.log('=== joinSession 開始 ===', { sessionId, participantId, role })

        const session = this.getSessionFromStorage(sessionId);
        if (!session) {
            throw new Error('セッションが見つかりません');
        }

        console.log('入室前のセッション状態:', {
            sessionId,
            status: session.status,
            userStatus: session.participants.user.status,
            operatorStatus: session.participants.operator.status
        })

        const now = new Date().toISOString();
        const participantKey = role as keyof CallParticipants;

        // 参加者状態を更新
        const oldStatus = session.participants[participantKey].status
        session.participants[participantKey] = {
            ...session.participants[participantKey],
            joinedAt: now,
            status: 'joined'
        };

        console.log('参加者状態更新:', {
            role,
            participantId,
            oldStatus,
            newStatus: 'joined',
            timestamp: now
        })

        // 両方が入室したかチェック
        const bothJoined = session.participants.user.status === 'joined' &&
            session.participants.operator.status === 'joined';

        console.log('両方入室チェック:', {
            userStatus: session.participants.user.status,
            operatorStatus: session.participants.operator.status,
            bothJoined,
            currentSessionStatus: session.status
        })

        if (bothJoined && session.status === CallSessionStatus.WAITING) {
            const oldStatus = session.status
            session.status = CallSessionStatus.ACTIVE;
            console.log('🚨 セッションがアクティブになりました:', {
                sessionId,
                from: oldStatus,
                to: session.status,
                timestamp: now
            });
        }

        // セッション情報を保存
        this.saveSessionToStorage(session);
        this.saveParticipantStatus(sessionId, session.participants);

        // デバッグ情報
        console.log('参加者入室完了:', {
            sessionId,
            role,
            participantId,
            sessionStatus: session.status,
            userStatus: session.participants.user.status,
            operatorStatus: session.participants.operator.status,
            timestamp: now
        });

        return session;
    }

    /**
     * 参加者の退室処理
     * 
     * 指定された参加者がセッションから退室します。
     * セッション状態を適切に更新します。
     * 
     * @param sessionId セッションID
     * @param participantId 参加者ID
     * @param role 参加者の役割
     */
    leaveSession(sessionId: string, participantId: string, role: 'user' | 'operator'): void {
        const session = this.getSessionFromStorage(sessionId);
        if (!session) return;

        const now = new Date().toISOString();
        const participantKey = role as keyof CallParticipants;

        // 参加者状態を更新
        session.participants[participantKey] = {
            ...session.participants[participantKey],
            leftAt: now,
            status: 'left'
        };

        // セッション状態を更新
        if (session.participants.user.status === 'left' || session.participants.operator.status === 'left') {
            session.status = CallSessionStatus.ENDED;
            session.endTime = now;
        }

        this.saveSessionToStorage(session);
        this.saveParticipantStatus(sessionId, session.participants);
    }

    /**
     * セッション制約を保存
     * 
     * @param sessionId セッションID
     * @param constraints 制約情報
     */
    private saveSessionConstraints(sessionId: string, constraints: CallSessionConstraints): void {
        const storageKey = `${StorageKeys.SESSION_CONSTRAINTS}-${sessionId}`;
        localStorage.setItem(storageKey, JSON.stringify(constraints));
    }

    /**
     * 参加者状態を保存
     * 
     * @param sessionId セッションID
     * @param participants 参加者状態
     */
    private saveParticipantStatus(sessionId: string, participants: CallParticipants): void {
        const storageKey = `${StorageKeys.PARTICIPANT_STATUS}-${sessionId}`;
        localStorage.setItem(storageKey, JSON.stringify(participants));
    }

    /**
     * セッション制約を取得
     * 
     * @param sessionId セッションID
     * @returns 制約情報
     */
    getSessionConstraints(sessionId: string): CallSessionConstraints | null {
        const storageKey = `${StorageKeys.SESSION_CONSTRAINTS}-${sessionId}`;
        const stored = localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : null;
    }

    /**
     * 参加者状態を取得
     * 
     * @param sessionId セッションID
     * @returns 参加者状態
     */
    getParticipantStatus(sessionId: string): CallParticipants | null {
        const storageKey = `${StorageKeys.PARTICIPANT_STATUS}-${sessionId}`;
        const stored = localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : null;
    }

    /**
     * ユーザーメッセージを処理し、AI提案を生成
     * 
     * ユーザーが送信したメッセージを分析し、OpenAI APIを使用して
     * オペレーターへの次のアクション提案を生成します。
     * 
     * 処理フロー:
     * 1. ユーザーメッセージと会話履歴からコンテキストを構築
     * 2. OpenAI APIにコンテキストを送信
     * 3. AIからの提案を取得して返却
     * 
     * @param userId ユーザーID
     * @param operatorId オペレーターID
     * @param conversationId 会話ID
     * @param userMessage ユーザーが送信したメッセージ
     * @param conversationHistory これまでの会話履歴
     * @returns AIからの提案を含むOpenAIResponse
     * @throws AI応答の取得に失敗した場合のエラー
     */
    async processUserMessage(
        userId: string,
        operatorId: string,
        conversationId: string,
        userMessage: string,
        conversationHistory: string[]
    ): Promise<OpenAIResponse> {
        const context: ConversationContext = {
            userId,
            operatorId,
            conversationId,
            userMessage,
            conversationHistory
        };

        try {
            const aiResponse = await this.openAIService.generateNextAction(userMessage, context);
            return aiResponse;
        } catch (error) {
            console.error('AI応答の取得に失敗:', error);
            throw new Error('AI応答の取得に失敗しました');
        }
    }

    /**
     * セッション情報をローカルストレージに保存
     * 
     * 通話セッションの情報（ユーザー情報、オペレーター情報、通話状態、開始時間など）を
     * ブラウザのローカルストレージに永続化します。
     * 
     * @param session 保存するセッション情報
     */
    saveSessionToStorage(session: CallSession): void {
        const storageKey = `${StorageKeys.CALL_SESSION}-${session.sessionId}`;
        localStorage.setItem(storageKey, JSON.stringify(session));
    }

    /**
     * ローカルストレージからセッション情報を取得
     * 
     * 指定されたセッションIDに対応するセッション情報を
     * ローカルストレージから取得します。
     * 
     * @param sessionId 取得するセッションのID
     * @returns セッション情報、存在しない場合はnull
     */
    getSessionFromStorage(sessionId: string): CallSession | null {
        const storageKey = `${StorageKeys.CALL_SESSION}-${sessionId}`;
        const stored = localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : null;
    }

    /**
     * 会話履歴をローカルストレージに保存
     * 
     * 特定のセッションにおける会話の履歴（メッセージ、タイムスタンプ、AI提案など）を
     * ローカルストレージに永続化します。
     * 
     * @param sessionId セッションID
     * @param history 保存する会話履歴の配列
     */
    saveConversationHistory(sessionId: string, history: ConversationMessage[]): void {
        const storageKey = `${StorageKeys.CONVERSATION_HISTORY}-${sessionId}`;
        localStorage.setItem(storageKey, JSON.stringify(history));
    }

    /**
     * ローカルストレージから会話履歴を取得
     * 
     * 指定されたセッションIDに対応する会話履歴を
     * ローカルストレージから取得します。
     * 
     * @param sessionId 取得するセッションのID
     * @returns 会話履歴の配列、存在しない場合は空配列
     */
    getConversationHistory(sessionId: string): ConversationMessage[] {
        const storageKey = `${StorageKeys.CONVERSATION_HISTORY}-${sessionId}`;
        const stored = localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * セッションを終了
     * 
     * 指定されたセッションのステータスを「終了」に更新し、
     * 終了時間を記録してローカルストレージに保存します。
     * 
     * @param sessionId 終了するセッションのID
     */
    endSession(sessionId: string): void {
        const session = this.getSessionFromStorage(sessionId);
        if (session) {
            session.status = 'ended';
            session.endTime = new Date().toISOString();
            this.saveSessionToStorage(session);
        }
    }

    /**
     * 全てのセッションデータをクリア
     * 
     * ローカルストレージから全てのセッション関連データを削除します。
     * デバッグやテスト時に使用します。
     */
    clearAllSessions(): void {
        console.log('=== 全セッションデータクリア開始 ===')

        const keys = Object.keys(localStorage);
        let clearedCount = 0;

        for (const key of keys) {
            if (key.startsWith(StorageKeys.CALL_SESSION) ||
                key.startsWith(StorageKeys.CONVERSATION_HISTORY) ||
                key.startsWith(StorageKeys.SESSION_CONSTRAINTS) ||
                key.startsWith(StorageKeys.PARTICIPANT_STATUS)) {

                localStorage.removeItem(key);
                clearedCount++;
                console.log('削除されたキー:', key);
            }
        }

        console.log(`クリア完了: ${clearedCount}個のキーを削除`);
    }

    /**
     * 特定のセッションの全データをクリア
     * 
     * @param sessionId クリアするセッションID
     */
    clearSession(sessionId: string): void {
        console.log('=== セッションデータクリア開始 ===', { sessionId })

        const keys = [
            `${StorageKeys.CALL_SESSION}-${sessionId}`,
            `${StorageKeys.CONVERSATION_HISTORY}-${sessionId}`,
            `${StorageKeys.SESSION_CONSTRAINTS}-${sessionId}`,
            `${StorageKeys.PARTICIPANT_STATUS}-${sessionId}`
        ];

        keys.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log('削除されたキー:', key);
            }
        });

        console.log('セッションデータクリア完了');
    }
}
