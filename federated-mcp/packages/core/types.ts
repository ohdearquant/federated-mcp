import { 
  Capabilities,
  ServerInfo as MCPServerInfo,
  Message,
  Response
} from '@modelcontextprotocol/typescript-sdk';

export { Capabilities, Message, Response };

export interface ServerInfo extends MCPServerInfo {
  name: string;
  version: string;
  capabilities: Capabilities;
}

export interface FederationConfig {
  serverId: string;
  endpoints: {
    control: string;
    data: string;
  };
  auth: {
    type: 'jwt' | 'oauth2';
    config: Record<string, unknown>;
  };
}
