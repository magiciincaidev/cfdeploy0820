import { CallSession, ConversationMessage } from '@/src/domain/entities/CallSession';
import { ConversationContext, OpenAIResponse, OpenAIService } from '@/src/infrastructure/api/openai';

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
 * 使用方法:
 * - ユーザー画面: メッセージ送信時のAI提案生成
 * - オペレーター画面: セッション管理と会話履歴表示
 * - 通話管理: 通話の開始・終了・履歴の保存・復元
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
        const storageKey = `call-session-${session.sessionId}`;
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
        const storageKey = `call-session-${sessionId}`;
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
        const storageKey = `conversation-history-${sessionId}`;
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
        const storageKey = `conversation-history-${sessionId}`;
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
}
