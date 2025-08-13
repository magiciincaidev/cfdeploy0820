import { Conversation, Message, NextAction } from '@/src/domain/entities/Conversation';

export interface IConversationRepository {
    // 会話管理
    createConversation(userId: string): Promise<Conversation>;
    getConversation(id: string): Promise<Conversation | null>;
    updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation>;

    // メッセージ管理
    addMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message>;
    getMessages(conversationId: string, limit?: number): Promise<Message[]>;

    // 次のアクション管理
    createNextAction(conversationId: string, action: Omit<NextAction, 'id' | 'createdAt'>): Promise<NextAction>;
    getNextActions(conversationId: string): Promise<NextAction[]>;
    updateNextAction(id: string, updates: Partial<NextAction>): Promise<NextAction>;

    // 会話検索
    getConversationsByUser(userId: string): Promise<Conversation[]>;
    getActiveConversations(): Promise<Conversation[]>;
}
