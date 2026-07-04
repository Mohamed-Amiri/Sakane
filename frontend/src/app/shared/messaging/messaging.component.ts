import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessagingService, Conversation, Message } from './messaging.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="messaging-container">
      <!-- Conversations List -->
      <div class="conversations-panel" [class.hidden]="selectedConversation && isMobile">
        <div class="conversations-header">
          <h2>Messages</h2>
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input 
              type="text" 
              placeholder="Rechercher une conversation..."
              [(ngModel)]="searchQuery"
              (input)="onSearch()">
          </div>
        </div>

        <div class="conversations-list">
          <div 
            class="conversation-item"
            *ngFor="let conversation of filteredConversations"
            [class.active]="selectedConversation?.id === conversation.id"
            [class.unread]="conversation.unreadCount > 0"
            (click)="selectConversation(conversation)">
            
            <div class="conversation-avatar">
              <img [src]="getOtherParticipant(conversation)?.avatar" [alt]="getOtherParticipant(conversation)?.name">
              <div class="online-indicator" *ngIf="getOtherParticipant(conversation)?.isOnline"></div>
            </div>

            <div class="conversation-content">
              <div class="conversation-header">
                <h3>{{ getOtherParticipant(conversation)?.name }}</h3>
                <span class="timestamp">{{ formatTimestamp(conversation.lastMessage?.timestamp) }}</span>
              </div>
              
              <div class="conversation-preview">
                <span class="lieu-title" *ngIf="conversation.lieuTitle">{{ conversation.lieuTitle }}</span>
                <p class="last-message">{{ conversation.lastMessage?.content }}</p>
              </div>
            </div>

            <div class="conversation-meta">
              <div class="unread-badge" *ngIf="conversation.unreadCount > 0">
                {{ conversation.unreadCount }}
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="filteredConversations.length === 0">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <h3>Aucune conversation</h3>
            <p>Vos conversations apparaîtront ici</p>
          </div>
        </div>
      </div>

      <!-- Chat Panel -->
      <div class="chat-panel" [class.hidden]="!selectedConversation">
        <div class="chat-header" *ngIf="selectedConversation">
          <button class="back-btn" *ngIf="isMobile" (click)="deselectConversation()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </button>

          <div class="chat-participant">
            <img [src]="getOtherParticipant(selectedConversation)?.avatar" [alt]="getOtherParticipant(selectedConversation)?.name">
            <div class="participant-info">
              <h3>{{ getOtherParticipant(selectedConversation)?.name }}</h3>
              <span class="status" [class.online]="getOtherParticipant(selectedConversation)?.isOnline">
                {{ getOtherParticipant(selectedConversation)?.isOnline ? 'En ligne' : 'Hors ligne' }}
              </span>
            </div>
          </div>

          <div class="chat-actions">
            <button class="action-btn" (click)="toggleConversationMenu()">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="12" cy="5" r="1"/>
                <circle cx="12" cy="19" r="1"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="messages-container" #messagesContainer>
          <div class="messages-list" *ngIf="messages.length > 0">
            <div 
              class="message"
              *ngFor="let message of messages"
              [class.own]="isOwnMessage(message)"
              [class.system]="message.type === 'system'">
              
              <div class="message-avatar" *ngIf="!isOwnMessage(message) && message.type !== 'system'">
                <img [src]="message.senderAvatar" [alt]="message.senderName">
              </div>

              <div class="message-content">
                <div class="message-bubble">
                  <p>{{ message.content }}</p>
                  
                  <div class="message-attachments" *ngIf="message.attachments?.length">
                    <div class="attachment" *ngFor="let attachment of message.attachments">
                      <div class="attachment-icon">
                        <svg *ngIf="attachment.type === 'document'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                        <img *ngIf="attachment.type === 'image'" [src]="attachment.url" [alt]="attachment.name">
                      </div>
                      <div class="attachment-info">
                        <span class="attachment-name">{{ attachment.name }}</span>
                        <span class="attachment-size">{{ formatFileSize(attachment.size) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="message-meta">
                  <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
                  <span class="message-status" *ngIf="isOwnMessage(message)">
                    <svg *ngIf="message.read" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    <svg *ngIf="!message.read" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-chat" *ngIf="messages.length === 0">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>Commencez votre conversation</p>
          </div>
        </div>

        <div class="message-input" *ngIf="selectedConversation">
          <div class="input-attachments" *ngIf="selectedFiles.length > 0">
            <div class="attachment-preview" *ngFor="let file of selectedFiles; let i = index">
              <span>{{ file.name }}</span>
              <button (click)="removeFile(i)">×</button>
            </div>
          </div>

          <div class="input-container">
            <input 
              type="file" 
              #fileInput 
              multiple 
              accept="image/*,.pdf,.doc,.docx"
              (change)="onFilesSelected($event)"
              style="display: none">
            
            <button class="attach-btn" (click)="fileInput.click()">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
              </svg>
            </button>

            <input 
              type="text" 
              [(ngModel)]="newMessage"
              (keydown.enter)="sendMessage()"
              placeholder="Tapez votre message..."
              [disabled]="isSending">

            <button 
              class="send-btn" 
              (click)="sendMessage()"
              [disabled]="!newMessage.trim() && selectedFiles.length === 0 || isSending">
              <svg *ngIf="!isSending" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22,2 15,22 11,13 2,9 22,2"/>
              </svg>
              <div *ngIf="isSending" class="spinner"></div>
            </button>
          </div>
        </div>

        <div class="no-conversation" *ngIf="!selectedConversation">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <h3>Sélectionnez une conversation</h3>
          <p>Choisissez une conversation pour commencer à discuter</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .messaging-container {
      display: flex;
      height: 100vh;
      background: #f9fafb;
    }

    .conversations-panel {
      width: 350px;
      background: white;
      border-right: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
    }

    .conversations-header {
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .conversations-header h2 {
      margin: 0 0 16px 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
    }

    .search-box {
      position: relative;
    }

    .search-box svg {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7280;
    }

    .search-box input {
      width: 100%;
      padding: 10px 12px 10px 40px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .conversations-list {
      flex: 1;
      overflow-y: auto;
    }

    .conversation-item {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      cursor: pointer;
      transition: background-color 0.2s;
      border-bottom: 1px solid #f3f4f6;
    }

    .conversation-item:hover {
      background: #f9fafb;
    }

    .conversation-item.active {
      background: #eff6ff;
      border-right: 3px solid #3b82f6;
    }

    .conversation-item.unread {
      background: #fefce8;
    }

    .conversation-avatar {
      position: relative;
      margin-right: 12px;
    }

    .conversation-avatar img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }

    .online-indicator {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      background: #10b981;
      border: 2px solid white;
      border-radius: 50%;
    }

    .conversation-content {
      flex: 1;
      min-width: 0;
    }

    .conversation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .conversation-header h3 {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: #1f2937;
      truncate: true;
    }

    .timestamp {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .conversation-preview {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .lieu-title {
      font-size: 0.75rem;
      color: #3b82f6;
      font-weight: 500;
    }

    .last-message {
      margin: 0;
      font-size: 0.875rem;
      color: #6b7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .conversation-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .unread-badge {
      background: #3b82f6;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .chat-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: white;
    }

    .chat-header {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
      background: white;
    }

    .back-btn {
      background: none;
      border: none;
      padding: 8px;
      margin-right: 12px;
      cursor: pointer;
      border-radius: 6px;
      color: #6b7280;
    }

    .back-btn:hover {
      background: #f3f4f6;
    }

    .chat-participant {
      display: flex;
      align-items: center;
      flex: 1;
    }

    .chat-participant img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 12px;
      object-fit: cover;
    }

    .participant-info h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
    }

    .status {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .status.online {
      color: #10b981;
    }

    .chat-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      border-radius: 6px;
      color: #6b7280;
    }

    .action-btn:hover {
      background: #f3f4f6;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f9fafb;
    }

    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .message {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .message.own {
      flex-direction: row-reverse;
    }

    .message.system {
      justify-content: center;
    }

    .message.system .message-content {
      background: #e5e7eb;
      color: #6b7280;
      font-size: 0.875rem;
      padding: 8px 16px;
      border-radius: 16px;
    }

    .message-avatar img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .message-content {
      max-width: 70%;
    }

    .message-bubble {
      background: white;
      padding: 12px 16px;
      border-radius: 18px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .message.own .message-bubble {
      background: #3b82f6;
      color: white;
    }

    .message-bubble p {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .message-attachments {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .attachment {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 8px;
    }

    .message.own .attachment {
      background: rgba(255, 255, 255, 0.2);
    }

    .attachment-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .attachment-icon img {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      object-fit: cover;
    }

    .attachment-info {
      flex: 1;
      min-width: 0;
    }

    .attachment-name {
      display: block;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .attachment-size {
      display: block;
      font-size: 0.625rem;
      opacity: 0.7;
    }

    .message-meta {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .message.own .message-meta {
      justify-content: flex-end;
    }

    .message-status svg {
      width: 12px;
      height: 12px;
    }

    .message-input {
      padding: 16px 20px;
      border-top: 1px solid #e5e7eb;
      background: white;
    }

    .input-attachments {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .attachment-preview {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: #f3f4f6;
      border-radius: 16px;
      font-size: 0.875rem;
    }

    .attachment-preview button {
      background: none;
      border: none;
      cursor: pointer;
      color: #6b7280;
      font-size: 1.2rem;
      line-height: 1;
    }

    .input-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .attach-btn {
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      color: #6b7280;
      border-radius: 6px;
    }

    .attach-btn:hover {
      background: #f3f4f6;
    }

    .input-container input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 24px;
      font-size: 0.875rem;
    }

    .input-container input:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .send-btn {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 12px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }

    .send-btn:hover:not(:disabled) {
      background: #2563eb;
    }

    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state,
    .empty-chat,
    .no-conversation {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
      color: #6b7280;
    }

    .empty-state svg,
    .empty-chat svg,
    .no-conversation svg {
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3,
    .no-conversation h3 {
      margin: 0 0 8px 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #374151;
    }

    .empty-state p,
    .empty-chat p,
    .no-conversation p {
      margin: 0;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .conversations-panel {
        width: 100%;
      }

      .conversations-panel.hidden,
      .chat-panel.hidden {
        display: none;
      }

      .message {
        gap: 8px;
      }

      .message-content {
        max-width: 85%;
      }
    }
  `]
})
export class MessagingComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  
  searchQuery = '';
  newMessage = '';
  selectedFiles: File[] = [];
  isSending = false;
  isMobile = false;
  
  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;

  constructor(private messagingService: MessagingService) {}

  ngOnInit() {
    this.checkMobile();
    this.loadConversations();
    
    window.addEventListener('resize', () => this.checkMobile());
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    window.removeEventListener('resize', () => this.checkMobile());
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private checkMobile() {
    this.isMobile = window.innerWidth < 768;
  }

  private loadConversations() {
    const sub = this.messagingService.getConversations().subscribe(conversations => {
      this.conversations = conversations;
      this.filteredConversations = conversations;
    });
    this.subscriptions.push(sub);
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    this.loadMessages(conversation.id);
    
    // Mark messages as read
    if (conversation.unreadCount > 0) {
      const unreadMessageIds = this.messages
        .filter(msg => !msg.read && !this.isOwnMessage(msg))
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        this.messagingService.markAsRead(conversation.id, unreadMessageIds).subscribe();
      }
    }
  }

  deselectConversation() {
    this.selectedConversation = null;
    this.messages = [];
  }

  private loadMessages(conversationId: string) {
    const sub = this.messagingService.getMessages(conversationId).subscribe(messages => {
      this.messages = messages;
      this.shouldScrollToBottom = true;
    });
    this.subscriptions.push(sub);
  }

  sendMessage() {
    if ((!this.newMessage.trim() && this.selectedFiles.length === 0) || !this.selectedConversation || this.isSending) {
      return;
    }

    this.isSending = true;
    
    const sub = this.messagingService.sendMessage(
      this.selectedConversation.id,
      this.newMessage,
      this.selectedFiles
    ).subscribe(() => {
      this.newMessage = '';
      this.selectedFiles = [];
      this.isSending = false;
      this.shouldScrollToBottom = true;
    });
    
    this.subscriptions.push(sub);
  }

  onFilesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles = [...this.selectedFiles, ...files].slice(0, 5); // Max 5 files
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.filteredConversations = this.conversations;
      return;
    }

    this.filteredConversations = this.conversations.filter(conv =>
      conv.lieuTitle?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      this.getOtherParticipant(conv)?.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      conv.lastMessage?.content.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getOtherParticipant(conversation: Conversation) {
    return conversation.participants.find(p => p.id !== 'guest1'); // Current user ID
  }

  isOwnMessage(message: Message): boolean {
    return message.senderId === 'guest1'; // Current user ID
  }

  formatTimestamp(timestamp?: Date): string {
    if (!timestamp) return '';
    
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    
    return timestamp.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
  }

  formatMessageTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  toggleConversationMenu() {
    // Implementation for conversation menu (block, report, etc.)
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}