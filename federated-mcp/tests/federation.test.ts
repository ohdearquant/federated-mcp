import { FederationProxy } from "../packages/proxy/federation";
import { FederationConfig } from "../packages/core/types";
import WebSocket from 'ws';

const TEST_SECRET = "test-secret-key";
const WS_PORT = 3000;

async function setupMockServer() {
  const wss = new WebSocket.Server({ port: WS_PORT });
  
  wss.on('connection', (ws) => {
    console.log("WebSocket connected");
    ws.on('close', () => console.log("WebSocket closed"));
  });

  // Wait for the server to be ready
  await new Promise(resolve => wss.once('listening', resolve));

  return {
    close: () => {
      return new Promise(resolve => wss.close(resolve));
    }
  };
}

describe("Federation Proxy", () => {
  let mockServer: { close: () => Promise<void> };

  beforeEach(async () => {
    mockServer = await setupMockServer();
  });

  afterEach(async () => {
    await mockServer.close();
  });

  test("Server Registration", async () => {
    const proxy = new FederationProxy(TEST_SECRET);
    
    const config: FederationConfig = {
      serverId: "test-server",
      endpoints: {
        control: `ws://localhost:${WS_PORT}`,
        data: "http://localhost:3001",
      },
      auth: {
        type: "jwt",
        config: { secret: TEST_SECRET }
      }
    };

    await proxy.registerServer(config);
    
    const servers = proxy.getConnectedServers();
    expect(servers.length).toBe(1);
    expect(servers[0]).toBe("test-server");
  });

  test("Server Removal", async () => {
    const proxy = new FederationProxy(TEST_SECRET);
    
    const config: FederationConfig = {
      serverId: "test-server",
      endpoints: {
        control: `ws://localhost:${WS_PORT}`,
        data: "http://localhost:3001",
      },
      auth: {
        type: "jwt",
        config: { secret: TEST_SECRET }
      }
    };

    await proxy.registerServer(config);
    await proxy.removeServer("test-server");
    
    const servers = proxy.getConnectedServers();
    expect(servers.length).toBe(0);
  });
});
