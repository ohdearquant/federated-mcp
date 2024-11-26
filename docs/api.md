# Federated MCP API Reference

## Table of Contents
1. [FederationProxy API](#federationproxy-api)
2. [AuthManager API](#authmanager-api)
3. [Type Definitions](#type-definitions)
4. [Error Handling](#error-handling)

## FederationProxy API

### Class: FederationProxy

The main class for managing federated server connections.

#### Constructor

```typescript
constructor(secret: string)
```

```python
def __init__(self, secret: str)
```

Parameters:
- `secret: string` - The secret key used for JWT token generation and validation

Example:
```typescript
const proxy = new FederationProxy("your-secret-key");
```

```python
proxy = FederationProxy("your-secret-key")
```

#### Method: registerServer

Registers a new server in the federation network.

```typescript
async registerServer(config: FederationConfig): Promise<void>
```

```python
async def register_server(self, config: FederationConfig) -> None
```

Parameters:
- `config: FederationConfig` - Server configuration object

Example:
```typescript
await proxy.registerServer({
  serverId: "server-1",
  endpoints: {
    control: "ws://localhost:3000",
    data: "http://localhost:3001"
  },
  auth: {
    type: "jwt",
    config: { secret: "your-secret-key" }
  }
});
```

```python
await proxy.register_server({
  "server_id": "server-1",
  "endpoints": {
    "control": "ws://localhost:3000",
    "data": "http://localhost:3001"
  },
  "auth": {
    "type": "jwt",
    "config": { "secret": "your-secret-key" }
  }
})
```

#### Method: removeServer

Removes a server from the federation network.

```typescript
async removeServer(serverId: string): Promise<void>
```

```python
async def remove_server(self, server_id: str) -> None
```

Parameters:
- `serverId: string` - Unique identifier of the server to remove

Example:
```typescript
await proxy.removeServer("server-1");
```

```python
await proxy.remove_server("server-1")
```

#### Method: getConnectedServers

Returns an array of connected server IDs.

```typescript
getConnectedServers(): string[]
```

```python
def get_connected_servers(self) -> List[str]
```

Returns:
- `string[]` - Array of server IDs

Example:
```typescript
const servers = proxy.getConnectedServers();
console.log("Connected servers:", servers);
```

```python
servers = proxy.get_connected_servers()
print("Connected servers:", servers)
```

## AuthManager API

### Class: AuthManager

Handles authentication and token management.

#### Constructor

```typescript
constructor(secret: string)
```

```python
def __init__(self, secret: str)
```

Parameters:
- `secret: string` - Secret key for token generation and validation

Example:
```typescript
const authManager = new AuthManager("your-secret-key");
```

```python
auth_manager = AuthManager("your-secret-key")
```

#### Method: createToken

Creates a JWT token for server authentication.

```typescript
async createToken(payload: Record<string, unknown>): Promise<string>
```

```python
def create_token(self, payload: dict) -> str
```

Parameters:
- `payload: Record<string, unknown>` - Token payload data

Returns:
- `Promise<string>` - Generated JWT token

Example:
```typescript
const token = await authManager.createToken({
  serverId: "server-1",
  type: "federation"
});
```

```python
token = auth_manager.create_token({
  "server_id": "server-1",
  "type": "federation"
})
```

#### Method: verifyToken

Verifies a JWT token.

```typescript
async verifyToken(token: string): Promise<Record<string, unknown>>
```

```python
def verify_token(self, token: str) -> dict
```

Parameters:
- `token: string` - JWT token to verify

Returns:
- `Promise<Record<string, unknown>>` - Decoded token payload

Example:
```typescript
const payload = await authManager.verifyToken(token);
```

```python
payload = auth_manager.verify_token(token)
```

## Type Definitions

### Interface: FederationConfig

Configuration for a federated server.

```typescript
interface FederationConfig {
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
```

```python
class FederationConfig:
    def __init__(self, server_id: str, endpoints: dict, auth: dict):
        self.server_id = server_id
        self.endpoints = endpoints
        self.auth = auth
```

Fields:
- `serverId: string` - Unique identifier for the server
- `endpoints` - Server endpoints
  - `control: string` - WebSocket control endpoint
  - `data: string` - HTTP data endpoint
- `auth` - Authentication configuration
  - `type: 'jwt' | 'oauth2'` - Authentication type
  - `config: Record<string, unknown>` - Authentication-specific configuration

### Interface: MCPCapabilities

Defines server capabilities.

```typescript
interface MCPCapabilities {
  resources: boolean;
  prompts: boolean;
  tools: boolean;
  sampling: boolean;
}
```

```python
class MCPCapabilities:
    def __init__(self, resources: bool, prompts: bool, tools: bool, sampling: bool):
        self.resources = resources
        self.prompts = prompts
        self.tools = tools
        self.sampling = sampling
```

### Interface: ServerInfo

Server information structure.

```typescript
interface ServerInfo {
  name: string;
  version: string;
  capabilities: MCPCapabilities;
}
```

```python
class ServerInfo:
    def __init__(self, name: str, version: str, capabilities: MCPCapabilities):
        self.name = name
        self.version = version
        self.capabilities = capabilities
```

## Error Handling

### Connection Errors

The system throws specific errors for various connection scenarios:

```typescript
// Connection timeout error
new Error('Connection timeout')

// Authentication error
new Error('Invalid token')

// Server error
new Error('Server connection failed')
```

```python
# Connection timeout error
raise TimeoutError('Connection timeout')

# Authentication error
raise ValueError('Invalid token')

# Server error
raise ConnectionError('Server connection failed')
```

### Error Types

1. **ConnectionError**
   - Thrown when WebSocket connection fails
   - Includes connection details and server ID

2. **AuthenticationError**
   - Thrown for authentication failures
   - Includes token validation details

3. **TimeoutError**
   - Thrown when connection or operation timeouts occur
   - Includes timeout duration and operation type

### Error Handling Example

```typescript
try {
  await proxy.registerServer(config);
} catch (error) {
  if (error.message.includes('timeout')) {
    // Handle timeout error
  } else if (error.message.includes('token')) {
    // Handle authentication error
  } else {
    // Handle general error
  }
}
```

```python
try:
    await proxy.register_server(config)
except Exception as error:
    if 'timeout' in str(error):
        # Handle timeout error
    elif 'token' in str(error):
        # Handle authentication error
    else:
        # Handle general error
```

## WebSocket Events

### Connection Events

```typescript
ws.onopen = () => {
  // Connection established
}

ws.onclose = () => {
  // Connection closed
}

ws.onerror = (error) => {
  // Connection error
}
```

```python
async def on_open():
    # Connection established

async def on_close():
    # Connection closed

async def on_error(error):
    # Connection error
```

### Message Events

```typescript
ws.onmessage = (event) => {
  // Handle incoming message
}
```

```python
async def on_message(event):
    # Handle incoming message
```

## Best Practices

1. **Error Handling**
   ```typescript
   try {
     await proxy.registerServer(config);
   } catch (error) {
     console.error('Registration failed:', error);
     // Implement retry logic or fallback
   }
   ```

   ```python
   try:
       await proxy.register_server(config)
   except Exception as error:
       print('Registration failed:', error)
       # Implement retry logic or fallback
   ```

2. **Connection Management**
   ```typescript
   const servers = proxy.getConnectedServers();
   if (servers.includes(serverId)) {
     await proxy.removeServer(serverId);
   }
   ```

   ```python
   servers = proxy.get_connected_servers()
   if server_id in servers:
       await proxy.remove_server(server_id)
   ```

3. **Token Management**
   ```typescript
   const token = await authManager.createToken({
     serverId,
     exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
   });
   ```

   ```python
   token = auth_manager.create_token({
       "server_id": server_id,
       "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
   })
   ```

## Rate Limiting

The system implements rate limiting for various operations:

```typescript
// Example rate limit configuration
const rateLimits = {
  connections: 100,    // Max concurrent connections
  messages: 1000,      // Messages per minute
  tokens: 100         // Token generations per minute
};
```

```python
# Example rate limit configuration
rate_limits = {
    "connections": 100,    # Max concurrent connections
    "messages": 1000,      # Messages per minute
    "tokens": 100          # Token generations per minute
}
```

## Security Considerations

1. **Token Security**
   - Use strong secrets
   - Implement token expiration
   - Validate token signatures

2. **Connection Security**
   - Use WSS (WebSocket Secure)
   - Implement connection timeouts
   - Validate server certificates

3. **Data Security**
   - Validate message payloads
   - Implement message encryption
   - Use secure protocols
