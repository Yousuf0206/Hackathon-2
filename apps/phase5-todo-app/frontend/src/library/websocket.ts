/**
 * WebSocket client library for real-time task and reminder updates.
 * Connects to the WebSocket Service, handles incoming events,
 * and auto-reconnects on disconnect.
 */

export type WebSocketEventType =
  | 'task.created'
  | 'task.updated'
  | 'task.completed'
  | 'task.deleted'
  | 'reminder.triggered'
  | 'reminder.delivered';

export interface WebSocketMessage {
  type: string;
  data: Record<string, unknown>;
}

type EventHandler = (data: Record<string, unknown>) => void;

export class TodoWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private userId: string;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isManualClose = false;

  constructor(wsUrl: string, userId: string) {
    this.url = `${wsUrl}/ws?user_id=${encodeURIComponent(userId)}`;
    this.userId = userId;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.isManualClose = false;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        console.log('[WS] Connected');
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.dispatch(message.type, message.data);
        } catch {
          console.warn('[WS] Failed to parse message:', event.data);
        }
      };

      this.ws.onclose = () => {
        console.log('[WS] Disconnected');
        if (!this.isManualClose) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WS] Error:', error);
      };
    } catch (error) {
      console.error('[WS] Connection failed:', error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.isManualClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  on(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  onTaskUpdate(handler: EventHandler): () => void {
    const unsubs = [
      this.on('task.created', handler),
      this.on('task.updated', handler),
      this.on('task.completed', handler),
      this.on('task.deleted', handler),
    ];
    return () => unsubs.forEach((unsub) => unsub());
  }

  onReminder(handler: EventHandler): () => void {
    const unsubs = [
      this.on('reminder.triggered', handler),
      this.on('reminder.delivered', handler),
    ];
    return () => unsubs.forEach((unsub) => unsub());
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private dispatch(eventType: string, data: Record<string, unknown>): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[WS] Handler error for ${eventType}:`, error);
        }
      });
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WS] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }
}
