import { FederationProxy } from "../packages/proxy/federation";
import { FederationConfig } from "../packages/core/types";

const TEST_SECRET = "test-secret-key";

describe("Federation Proxy", () => {
  test("Server Registration", async () => {
  const proxy = new FederationProxy(TEST_SECRET);
  
  const config: FederationConfig = {
    serverId: "test-server",
    endpoints: {
      control: "ws://localhost:3000",
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
      control: "ws://localhost:3000",
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
