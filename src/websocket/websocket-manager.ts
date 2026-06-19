import { streamDeck } from "@elgato/streamdeck";
import WebSocket from "ws";

class WebSocketManager {
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (reason?: any) => void;
    }
  >();
  private generateId(): string {
    return crypto.randomUUID();
  }
  private ws?: WebSocket;
  private reconnectTimer?: NodeJS.Timeout;

  private readonly url = "ws://localhost:3000";

  connect(): void {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    streamDeck.logger.info(`Connecting to ${this.url}`);

    this.ws = new WebSocket(this.url);

    this.ws.on("open", () => {
      streamDeck.logger.info("WebSocket connected");
    });

    this.ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.requestId) {
          const pending = this.pendingRequests.get(message.requestId);

          if (pending) {
            pending.resolve(message);
            this.pendingRequests.delete(message.requestId);
            return;
          }
        }

        streamDeck.logger.info(`Unhandled message: ${JSON.stringify(message)}`);
      } catch (err) {
        streamDeck.logger.error(`Invalid JSON received`);
      }
    });

    this.ws.on("close", () => {
      streamDeck.logger.warn("WebSocket disconnected");

      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, 5000);
    });

    this.ws.on("error", (err) => {
      streamDeck.logger.error(`WebSocket error: ${err.message}`);
    });
  }

  send(data: unknown): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    this.ws.send(JSON.stringify(data));
    return true;
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  async sendRequest(payload: any): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }

    const id = this.generateId();

    const message = {
      requestId: id,
      ...payload,
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve,
        reject,
      });

      this.ws!.send(JSON.stringify(message));

      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error("Request timeout"));
        }
      }, 5000);
    });
  }
}

export const websocketManager = new WebSocketManager();
