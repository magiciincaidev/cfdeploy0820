import { Conversation, Message, MessageSender, MessageType, NextAction } from '@/src/domain/entities/Conversation';
import { IConversationRepository } from '@/src/domain/repositories/IConversationRepository';
import { GoogleSpeechService } from '@/src/infrastructure/api/googleSpeech';
import { OpenAIService } from '@/src/infrastructure/api/openai';

export class ConversationUseCase {
    constructor(
        private conversationRepository: IConversationRepository,
        private openAIService: OpenAIService,
        private speechService: GoogleSpeechService
    ) { }

    /**
     * 音声から次のアクションを生成
     */
    async generateNextActionFromAudio(
        conversationId: string,
        audioContent: Buffer,
        operatorGuidelines?: string
    ): Promise<NextAction> {
        try {
            // 1. 音声を文字起こし
            const transcription = await this.speechService.transcribeAudio(audioContent);

            // 2. 文字起こし結果をメッセージとして保存
            const message: Omit<Message, 'id' | 'timestamp'> = {
                conversationId,
                content: transcription.transcript,
                type: MessageType.TEXT,
                sender: MessageSender.USER,
                metadata: {
                    confidence: transcription.confidence,
                    language: transcription.language,
                    duration: transcription.duration,
                    transcriptionSource: 'google',
                },
            };

            await this.conversationRepository.addMessage(conversationId, message);

            // 3. 会話の文脈を取得
            const conversation = await this.conversationRepository.getConversation(conversationId);
            if (!conversation) {
                throw new Error('Conversation not found');
            }

            const messages = await this.conversationRepository.getMessages(conversationId, 10);
            const conversationContext = this.buildConversationContext(messages);

            // 4. OpenAIで次のアクションを生成
            const aiResponse = await this.openAIService.generateNextAction(
                transcription.transcript,
                conversationContext,
                operatorGuidelines
            );

            // 5. 次のアクションを保存
            const nextAction: Omit<NextAction, 'id' | 'createdAt'> = {
                conversationId,
                action: aiResponse.action,
                priority: aiResponse.priority,
                description: aiResponse.description,
                suggestedResponse: aiResponse.suggestedResponse,
            };

            return await this.conversationRepository.createNextAction(conversationId, nextAction);
        } catch (error) {
            console.error('Failed to generate next action from audio:', error);
            throw error;
        }
    }

    /**
     * テキストから次のアクションを生成
     */
    async generateNextActionFromText(
        conversationId: string,
        textContent: string,
        operatorGuidelines?: string
    ): Promise<NextAction> {
        try {
            // 1. テキストをメッセージとして保存
            const message: Omit<Message, 'id' | 'timestamp'> = {
                conversationId,
                content: textContent,
                type: MessageType.TEXT,
                sender: MessageSender.USER,
            };

            await this.conversationRepository.addMessage(conversationId, message);

            // 2. 会話の文脈を取得
            const messages = await this.conversationRepository.getMessages(conversationId, 10);
            const conversationContext = this.buildConversationContext(messages);

            // 3. OpenAIで次のアクションを生成
            const aiResponse = await this.openAIService.generateNextAction(
                textContent,
                conversationContext,
                operatorGuidelines
            );

            // 4. 次のアクションを保存
            const nextAction: Omit<NextAction, 'id' | 'createdAt'> = {
                conversationId,
                action: aiResponse.action,
                priority: aiResponse.priority,
                description: aiResponse.description,
                suggestedResponse: aiResponse.suggestedResponse,
            };

            return await this.conversationRepository.createNextAction(conversationId, nextAction);
        } catch (error) {
            console.error('Failed to generate next action from text:', error);
            throw error;
        }
    }

    /**
     * 会話の文脈を構築
     */
    private buildConversationContext(messages: Message[]): string {
        if (messages.length === 0) {
            return '会話開始';
        }

        const recentMessages = messages
            .slice(-5) // 最新5件
            .map(msg => `${msg.sender}: ${msg.content}`)
            .join('\n');

        return `最近の会話内容:\n${recentMessages}`;
    }

    /**
     * 会話の作成
     */
    async createConversation(userId: string): Promise<Conversation> {
        return await this.conversationRepository.createConversation(userId);
    }

    /**
     * 会話の取得
     */
    async getConversation(id: string): Promise<Conversation | null> {
        return await this.conversationRepository.getConversation(id);
    }

    /**
     * 次のアクションの取得
     */
    async getNextActions(conversationId: string): Promise<NextAction[]> {
        return await this.conversationRepository.getNextActions(conversationId);
    }

    /**
     * オペレーターの応答を記録
     */
    async recordOperatorResponse(
        conversationId: string,
        response: string
    ): Promise<Message> {
        const message: Omit<Message, 'id' | 'timestamp'> = {
            conversationId,
            content: response,
            type: MessageType.TEXT,
            sender: MessageSender.OPERATOR,
        };

        return await this.conversationRepository.addMessage(conversationId, message);
    }
}
