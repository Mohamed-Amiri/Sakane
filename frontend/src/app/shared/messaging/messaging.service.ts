import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap, map } from 'rxjs/operators';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'system';
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document';
  size: number;
}

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  lieuId?: number;
  lieuTitle?: string;
  lieuImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar: string;
  role: 'host' | 'guest';
  isOnline: boolean;
  lastSeen?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private currentConversationId: string | null = null;

  conversations$ = this.conversationsSubject.asObservable();
  messages$ = this.messagesSubject.asObservable();

  constructor() {
    // Initialize with empty arrays
  }



  getConversations(): Observable<Conversation[]> {
    return this.conversations$;
  }

  getConversation(id: string): Observable<Conversation | undefined> {
    return of(this.conversationsSubject.value.find(c => c.id === id));
  }

  getMessages(conversationId: string): Observable<Message[]> {
    this.currentConversationId = conversationId;
    
    // Initialize with empty messages - should be loaded from API
    this.messagesSubject.next([]);
    return this.messages$.pipe(delay(300));
  }

  sendMessage(conversationId: string, content: string, attachments?: File[]): Observable<Message> {
    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId,
      senderId: 'guest1', // Current user ID
      senderName: 'Marie Martin', // Current user name
      senderAvatar: 'https://i.pravatar.cc/150?u=guest1',
      content,
      timestamp: new Date(),
      read: false,
      type: 'text',
      attachments: attachments?.map(file => ({
        id: Date.now().toString(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'document',
        size: file.size
      }))
    };

    // Add message to current messages
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, newMessage]);

    // Update conversation
    const conversations = this.conversationsSubject.value;
    const conversationIndex = conversations.findIndex(c => c.id === conversationId);
    if (conversationIndex !== -1) {
      conversations[conversationIndex].lastMessage = newMessage;
      conversations[conversationIndex].updatedAt = new Date();
      this.conversationsSubject.next([...conversations]);
    }

    return of(newMessage).pipe(delay(100));
  }

  markAsRead(conversationId: string, messageIds: string[]): Observable<void> {
    // Update messages
    const messages = this.messagesSubject.value.map(msg => 
      messageIds.includes(msg.id) ? { ...msg, read: true } : msg
    );
    this.messagesSubject.next(messages);

    // Update conversation unread count
    const conversations = this.conversationsSubject.value;
    const conversationIndex = conversations.findIndex(c => c.id === conversationId);
    if (conversationIndex !== -1) {
      conversations[conversationIndex].unreadCount = Math.max(0, 
        conversations[conversationIndex].unreadCount - messageIds.length
      );
      this.conversationsSubject.next([...conversations]);
    }

    return of(void 0).pipe(delay(100));
  }

  createConversation(hostId: string, lieuId: number, initialMessage: string): Observable<Conversation> {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      participants: [
        {
          id: hostId,
          name: 'Hôte',
          avatar: 'https://i.pravatar.cc/150?u=' + hostId,
          role: 'host',
          isOnline: Math.random() > 0.5
        },
        {
          id: 'guest1',
          name: 'Marie Martin',
          avatar: 'https://i.pravatar.cc/150?u=guest1',
          role: 'guest',
          isOnline: true
        }
      ],
      unreadCount: 0,
      lieuId,
      lieuTitle: 'Propriété',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const conversations = this.conversationsSubject.value;
    this.conversationsSubject.next([newConversation, ...conversations]);

    // Send initial message
    this.sendMessage(newConversation.id, initialMessage);

    return of(newConversation).pipe(delay(300));
  }

  getTotalUnreadCount(): Observable<number> {
    return this.conversations$.pipe(
      map(conversations => conversations.reduce((sum, conv) => sum + conv.unreadCount, 0))
    );
  }

  searchConversations(query: string): Observable<Conversation[]> {
    return this.conversations$.pipe(
      tap(conversations => {
        if (!query.trim()) return conversations;
        
        return conversations.filter(conv => 
          conv.lieuTitle?.toLowerCase().includes(query.toLowerCase()) ||
          conv.participants.some(p => p.name.toLowerCase().includes(query.toLowerCase())) ||
          conv.lastMessage?.content.toLowerCase().includes(query.toLowerCase())
        );
      })
    );
  }

  deleteConversation(conversationId: string): Observable<void> {
    const conversations = this.conversationsSubject.value.filter(c => c.id !== conversationId);
    this.conversationsSubject.next(conversations);
    return of(void 0).pipe(delay(100));
  }

  blockUser(userId: string): Observable<void> {
    // Implementation for blocking a user
    return of(void 0).pipe(delay(300));
  }

  reportConversation(conversationId: string, reason: string): Observable<void> {
    // Implementation for reporting a conversation
    return of(void 0).pipe(delay(300));
  }
}