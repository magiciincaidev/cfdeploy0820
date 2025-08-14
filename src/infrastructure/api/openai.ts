/**
 * OpenAI API サービスとモック実装
 * 
 * このファイルは、通話システムにおけるAI支援機能を提供します：
 * 
 * 1. OpenAI API連携
 *    - 実際のOpenAI APIとの通信
 *    - ユーザーメッセージの分析とAI提案の生成
 * 
 * 2. モック機能
 *    - 開発環境やAPIキーがない場合の代替実装
 *    - 事前定義されたレスポンスパターン
 * 
 * 3. レスポンス処理
 *    - AIからの提案を構造化されたデータに変換
 *    - 優先度、信頼度、推奨応答などの詳細情報
 */

/**
 * OpenAI APIからのレスポンス構造
 * 
 * AIがオペレーターに対して提案する次のアクションの詳細情報です。
 * 各フィールドは、オペレーターが適切な対応を取るための指針となります。
 */
export interface OpenAIResponse {
    /** 提案するアクションの概要 */
    action: string;

    /** アクションの優先度（低・中・高） */
    priority: 'low' | 'medium' | 'high';

    /** アクションの詳細説明 */
    description: string;

    /** オペレーターへの推奨応答例（オプション） */
    suggestedResponse?: string;

    /** AI提案の信頼度（0-100のパーセンテージ） */
    confidence: number;

    /** 提案生成時刻（ISO 8601形式） */
    timestamp: string;

    /** 会話を識別するID */
    conversationId: string;
}

/**
 * 会話のコンテキスト情報
 * 
 * AIが適切な提案を生成するために必要な会話の背景情報です。
 * ユーザーID、オペレーターID、会話履歴などを含みます。
 */
export interface ConversationContext {
    /** 通話を行うユーザーのID */
    userId: string;

    /** 通話を担当するオペレーターのID */
    operatorId: string;

    /** 会話を識別するID */
    conversationId: string;

    /** ユーザーが送信した最新のメッセージ */
    userMessage: string;

    /** これまでの会話履歴（時系列順） */
    conversationHistory: string[];
}

/**
 * OpenAI APIサービスクラス
 * 
 * ユーザーのメッセージを分析し、オペレーターへの次のアクション提案を生成します。
 * 実際のOpenAI APIとの通信と、開発用のモック機能の両方を提供します。
 * 
 * 特徴:
 * - 環境に応じた自動切り替え（API/モック）
 * - エラー時のフォールバック機能
 * - カスタマイズ可能なプロンプト生成
 * - 構造化されたレスポンス処理
 */
export class OpenAIService {
    /** OpenAI APIキー */
    private apiKey: string;

    /** 使用するAIモデル名 */
    private model: string;

    /** OpenAI APIのベースURL */
    private baseUrl: string;

    /** モックモードの有効/無効フラグ */
    private isMockMode: boolean;

    /**
     * モックレスポンスのテンプレート
     * 
     * 開発環境やAPIキーがない場合に使用される事前定義されたレスポンスです。
     * 実際の通話シーンでよくあるパターンを網羅しています。
     */
    private mockResponses: OpenAIResponse[] = [
        {
            action: '顧客情報の確認',
            priority: 'high',
            description: '顧客の基本情報（氏名、電話番号、契約内容）を確認してください',
            suggestedResponse: '申し訳ございませんが、お客様の基本情報を確認させていただいてもよろしいでしょうか？',
            confidence: 95,
            timestamp: new Date().toISOString(),
            conversationId: ''
        },
        {
            action: '問題の詳細ヒアリング',
            priority: 'medium',
            description: 'お客様が抱えている問題の詳細を聞き取り、具体的な状況を把握してください',
            suggestedResponse: '具体的にどのような状況でお困りでしょうか？もう少し詳しく教えていただけますか？',
            confidence: 88,
            timestamp: new Date().toISOString(),
            conversationId: ''
        },
        {
            action: '解決策の提案',
            priority: 'high',
            description: '問題の解決策を複数提示し、お客様の希望に沿った対応を提案してください',
            suggestedResponse: 'この問題に対して、以下のような解決策がございます。どちらがお客様のご希望に近いでしょうか？',
            confidence: 92,
            timestamp: new Date().toISOString(),
            conversationId: ''
        },
        {
            action: '確認とフォローアップ',
            priority: 'medium',
            description: '提案した解決策についてお客様の理解を確認し、次のステップを説明してください',
            suggestedResponse: 'ご説明した内容でご理解いただけましたでしょうか？次に進めさせていただいてもよろしいでしょうか？',
            confidence: 85,
            timestamp: new Date().toISOString(),
            conversationId: ''
        },
        {
            action: '緊急対応の判断',
            priority: 'high',
            description: '緊急性の高い問題の場合は、即座にエスカレーションまたは緊急対応を実施してください',
            suggestedResponse: 'この件は緊急性が高いため、すぐに担当部署に連絡いたします。少々お待ちください。',
            confidence: 98,
            timestamp: new Date().toISOString(),
            conversationId: ''
        }
    ];

    /**
     * コンストラクタ
     * 
     * 環境変数から設定を読み込み、APIモードかモックモードかを決定します。
     * モックモードは以下の場合に有効になります：
     * - OPENAI_API_KEYが設定されていない
     * - NODE_ENVが'development'の場合
     */
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY || '';
        this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        this.baseUrl = 'https://api.openai.com/v1';
        this.isMockMode = !this.apiKey || process.env.NODE_ENV === 'development';
    }

    /**
     * ユーザーの発言内容から次のアクションを生成
     * 
     * このメソッドは、ユーザーが送信したメッセージを分析し、
     * オペレーターが取るべき次のアクションをAIが提案します。
     * 
     * 処理フロー:
     * 1. モックモードの場合は事前定義されたレスポンスを返却
     * 2. APIモードの場合はOpenAI APIにリクエストを送信
     * 3. エラー時はモックレスポンスにフォールバック
     * 
     * @param userMessage ユーザーが送信したメッセージ
     * @param conversationContext 会話のコンテキスト情報（文字列またはオブジェクト）
     * @param operatorGuidelines オペレーター向けのガイドライン（オプション）
     * @returns AIからのアクション提案
     */
    async generateNextAction(
        userMessage: string,
        conversationContext: string | ConversationContext,
        operatorGuidelines?: string
    ): Promise<OpenAIResponse> {
        // モックモードの場合はモックレスポンスを返す
        if (this.isMockMode) {
            return this.generateMockResponse(userMessage, conversationContext);
        }

        try {
            const prompt = this.buildPrompt(userMessage, conversationContext, operatorGuidelines);

            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'あなたはコールセンターのオペレーターをサポートするAIアシスタントです。ユーザーの発言内容を分析し、オペレーターが取るべき次のアクションを提案してください。'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 500,
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            if (!content) {
                throw new Error('No response content from OpenAI');
            }

            return this.parseOpenAIResponse(content);
        } catch (error) {
            console.error('OpenAI API error:', error);
            // エラー時はモックレスポンスを返す
            return this.generateMockResponse(userMessage, conversationContext);
        }
    }

    /**
     * プロンプトの構築
     * 
     * OpenAI APIに送信するプロンプトを構築します。
     * ユーザーメッセージ、会話コンテキスト、オペレーターガイドラインを
     * 構造化された形式で組み合わせます。
     * 
     * @param userMessage ユーザーのメッセージ
     * @param conversationContext 会話のコンテキスト
     * @param operatorGuidelines オペレーター向けガイドライン
     * @returns 構築されたプロンプト文字列
     */
    private buildPrompt(
        userMessage: string,
        conversationContext: string | ConversationContext,
        operatorGuidelines?: string
    ): string {
        let contextStr = '';
        if (typeof conversationContext === 'string') {
            contextStr = conversationContext;
        } else {
            contextStr = `ユーザーID: ${conversationContext.userId}, オペレーターID: ${conversationContext.operatorId}, 会話履歴: ${conversationContext.conversationHistory.join(', ')}`;
        }

        let prompt = `ユーザーの発言内容: "${userMessage}"\n\n`;
        prompt += `会話の文脈: ${contextStr}\n\n`;

        if (operatorGuidelines) {
            prompt += `オペレーターガイドライン: ${operatorGuidelines}\n\n`;
        }

        prompt += `以下の形式で次のアクションを提案してください:\n`;
        prompt += `アクション: [具体的なアクション]\n`;
        prompt += `優先度: [low/medium/high]\n`;
        prompt += `説明: [アクションの詳細説明]\n`;
        prompt += `提案レスポンス: [オペレーターが言うべき内容（オプション）]\n`;
        prompt += `信頼度: [0-100の数値]`;

        return prompt;
    }

    /**
     * モックレスポンスを生成
     * 
     * 開発環境やAPIキーがない場合に使用されるモック機能です。
     * 事前定義されたレスポンスからランダムに選択し、
     * ユーザーメッセージの内容に応じて適切に調整します。
     * 
     * 特徴:
     * - ランダムなレスポンス選択
     * - キーワードベースのレスポンス調整
     * - 実際のAPI呼び出しを模擬した遅延
     * 
     * @param userMessage ユーザーメッセージ
     * @param conversationContext 会話コンテキスト
     * @returns 調整されたモックレスポンス
     */
    private async generateMockResponse(
        userMessage: string,
        conversationContext: string | ConversationContext
    ): Promise<OpenAIResponse> {
        // ランダムなレスポンスを選択
        const randomIndex = Math.floor(Math.random() * this.mockResponses.length);
        const mockResponse = { ...this.mockResponses[randomIndex] };

        // コンテキスト情報を設定
        if (typeof conversationContext === 'object') {
            mockResponse.conversationId = conversationContext.conversationId;
        }
        mockResponse.timestamp = new Date().toISOString();

        // ユーザーメッセージの内容に応じてレスポンスを調整
        if (userMessage.includes('緊急') || userMessage.includes('困った') || userMessage.includes('大変')) {
            mockResponse.action = '緊急対応の判断';
            mockResponse.priority = 'high';
            mockResponse.description = '緊急性の高い問題のため、即座に対応が必要です';
            mockResponse.suggestedResponse = '緊急のご相談とのことですので、すぐに対応いたします。';
            mockResponse.confidence = 98;
        } else if (userMessage.includes('確認') || userMessage.includes('調べて')) {
            mockResponse.action = '顧客情報の確認';
            mockResponse.priority = 'medium';
            mockResponse.description = 'お客様の情報を確認し、詳細を調べる必要があります';
            mockResponse.suggestedResponse = '承知いたしました。お客様の情報を確認させていただきます。';
            mockResponse.confidence = 90;
        }

        // モックの遅延を再現（実際のAPI呼び出しを模擬）
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        return mockResponse;
    }

    /**
     * OpenAIのレスポンスをパース
     * 
     * OpenAI APIから返されたテキストレスポンスを、
     * 構造化されたデータ（OpenAIResponse）に変換します。
     * 
     * 現在の実装は基本的な文字列分割によるパースですが、
     * 実際の運用ではより堅牢なパース処理が必要です。
     * 
     * @param content OpenAI APIからのテキストレスポンス
     * @returns パースされたOpenAIResponseオブジェクト
     */
    private parseOpenAIResponse(content: string): OpenAIResponse {
        // 簡単なパース処理（実際の実装ではより堅牢にする）
        const lines = content.split('\n');
        const result: Partial<OpenAIResponse> = {};

        for (const line of lines) {
            if (line.includes('アクション:')) {
                result.action = line.split('アクション:')[1]?.trim() || 'アクション未定';
            } else if (line.includes('優先度:')) {
                const priority = line.split('優先度:')[1]?.trim() || 'medium';
                result.priority = priority as 'low' | 'medium' | 'high';
            } else if (line.includes('説明:')) {
                result.description = line.split('説明:')[1]?.trim() || '';
            } else if (line.includes('提案レスポンス:')) {
                result.suggestedResponse = line.split('提案レスポンス:')[1]?.trim();
            } else if (line.includes('信頼度:')) {
                const confidenceStr = line.split('信頼度:')[1]?.trim() || '50';
                result.confidence = parseInt(confidenceStr) || 50;
            }
        }

        // デフォルト値の設定
        return {
            action: result.action || 'アクション未定',
            priority: result.priority || 'medium',
            description: result.description || '説明なし',
            suggestedResponse: result.suggestedResponse,
            confidence: result.confidence || 50,
            timestamp: new Date().toISOString(),
            conversationId: '',
        };
    }
}
