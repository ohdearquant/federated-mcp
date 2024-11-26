import { FederationConfig } from '../core/types';
import { AuthManager } from '../core/auth';

export class FederationProxy {
  private servers: Map<string, FederationConfig>;
  private authManager: AuthManager;
  private connections: Map<string, WebSocket>;

  constructor(secret: string) {
    this.servers = new Map();
    this.connections = new Map();
    this.authManager = new AuthManager(secret);
  }

  async registerServer(config: FederationConfig): Promise<void> {
    this.servers.set(config.serverId, config);
    await this.establishConnection(config);
  }

  async removeServer(serverId: string): Promise<void> {
    const connection = this.connections.get(serverId);
    if (connection) {
      connection.close();
      this.connections.delete(serverId);
    }
    this.servers.delete(serverId);
  }

  private async establishConnection(config: FederationConfig): Promise<void> {
    try {
      const token = await this.authManager.createToken({
        serverId: config.serverId,
        type: 'federation'
      });

      const ws = new WebSocket(config.endpoints.control, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      ws.onopen = () => {
        console.log(`Connected to server ${config.serverId}`);
        this.connections.set(config.serverId, ws);
      };

      ws.onclose = () => {
        console.log(`Disconnected from server ${config.serverId}`);
        this.connections.delete(config.serverId);
      };

      ws.onerror = (error) => {
        console.error(`Error with server ${config.serverId}:`, error);
      };

    } catch (error) {
      console.error(`Failed to establish connection with ${config.serverId}:`, error);
      throw error;
    }
  }

  getConnectedServers(): string[] {
    return Array.from(this.connections.keys());
  }
}
