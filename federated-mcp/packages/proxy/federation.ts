import { 
  MCPClient,
  Message,
  Response,
  Capabilities
} from '@modelcontextprotocol/typescript-sdk';
import { FederationConfig } from '../core/types';
import { AuthManager } from '../core/auth';

export class FederationProxy {
  private servers: Map<string, FederationConfig>;
  private authManager: AuthManager;
  private connections: Map<string, MCPClient>;

  constructor(secret: string) {
    this.servers = new Map();
    this.connections = new Map();
    this.authManager = new AuthManager(secret);
  }

  async getServerCapabilities(serverId: string): Promise<Capabilities> {
    const client = this.connections.get(serverId);
    if (!client) {
      throw new Error(`Server ${serverId} not connected`);
    }
    return await client.getCapabilities();
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

      const client = new MCPClient({
        endpoint: config.endpoints.control,
        token,
        timeout: 5000
      });

      await client.connect();
      
      // Verify capabilities match configuration
      const capabilities = await client.getCapabilities();
      if (!this.validateCapabilities(capabilities, config)) {
        throw new Error('Server capabilities do not match configuration');
      }

      this.connections.set(config.serverId, client);
      
      client.onDisconnect(() => {
        console.log(`Disconnected from server ${config.serverId}`);
        this.connections.delete(config.serverId);
      });

    } catch (error) {
      console.error(`Failed to establish connection with ${config.serverId}:`, error);
      throw error;
    }
  }

  private validateCapabilities(actual: Capabilities, config: FederationConfig): boolean {
    // Implement capability validation logic based on your requirements
    return true;
  }

  getConnectedServers(): string[] {
    return Array.from(this.connections.keys());
  }
}
