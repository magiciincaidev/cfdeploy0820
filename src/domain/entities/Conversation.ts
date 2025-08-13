export interface Conversation {
    id: string;
    userId: string;
    operatorId?: string;
    status: ConversationStatus;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Message {
    id: string;
    conversationId: string;
    content: string;
    type: MessageType;
    sender: MessageSender;
    timestamp: Date;
    metadata?: MessageMetadata;
}

export interface MessageMetadata {
    confidence?: number;
    language?: string;
    duration?: number;
    transcriptionSource?: 'google' | 'manual';
}

// enum から as const に変更
export const ConversationStatus = {
    ACTIVE: 'active',
    WAITING: 'waiting',
    COMPLETED: 'completed',
    ARCHIVED: 'archived'
} as const;

export type ConversationStatus = typeof ConversationStatus[keyof typeof ConversationStatus];

export const MessageType = {
    TEXT: 'text',
    AUDIO: 'audio',
    SYSTEM: 'system'
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];

export const MessageSender = {
    USER: 'user',
    OPERATOR: 'operator',
    AI: 'ai',
    SYSTEM: 'system'
} as const;

export type MessageSender = typeof MessageSender[keyof typeof MessageSender];

export interface NextAction {
    id: string;
    conversationId: string;
    action: string;
    priority: 'low' | 'medium' | 'high';
    description: string;
    suggestedResponse?: string;
    createdAt: Date;
}
