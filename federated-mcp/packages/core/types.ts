export interface MCPCapabilities {
  resources: boolean;
  prompts: boolean;
  tools: boolean;
  sampling: boolean;
}

export interface ServerInfo {
  name: string;
  version: string;
  capabilities: MCPCapabilities;
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
