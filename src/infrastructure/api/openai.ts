export interface OpenAIResponse {
    action: string;
    priority: 'low' | 'medium' | 'high';
    description: string;
    suggestedResponse?: string;
    confidence: number;
}

export class OpenAIService {
    private apiKey: string;
    private model: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY || '';
        this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        this.baseUrl = 'https://api.openai.com/v1';

        if (!this.apiKey) {
            throw new Error('OPENAI_API_KEY is not set');
        }
    }

    /**
     * ユーザーの発言内容から次のアクションを生成
     */
    async generateNextAction(
        userMessage: string,
        conversationContext: string,
        operatorGuidelines?: string
    ): Promise<OpenAIResponse> {
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
            throw new Error('Failed to generate next action');
        }
    }

    /**
     * プロンプトの構築
     */
    private buildPrompt(
        userMessage: string,
        conversationContext: string,
        operatorGuidelines?: string
    ): string {
        let prompt = `ユーザーの発言内容: "${userMessage}"\n\n`;
        prompt += `会話の文脈: ${conversationContext}\n\n`;

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
     * OpenAIのレスポンスをパース
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
        };
    }
}
