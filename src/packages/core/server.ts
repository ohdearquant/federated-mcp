import { ServerInfo, Capabilities } from './types.ts';

export class MCPServer {
  private info: ServerInfo;

  constructor(info: ServerInfo) {
    this.info = info;
  }

  async handleWebSocket(socket: WebSocket): Promise<void> {
    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        const response = await this.handleMessage(message);
        socket.send(JSON.stringify(response));
      } catch (error) {
        socket.send(JSON.stringify({ error: error.message }));
      }
    };
  }

  async handleHTTP(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      const response = await this.handleMessage(body);
      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleMessage(message: any): Promise<any> {
    switch (message.type) {
      case 'info':
        return this.info;
      case 'capabilities':
        return this.info.capabilities;
      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  }
}
