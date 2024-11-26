import { assertEquals, assertExists } from "https://deno.land/std/testing/asserts.ts";
import { FederationProxy } from "../packages/proxy/federation.ts";
import { FederationConfig } from "../packages/core/types.ts";

const TEST_SECRET = "test-secret-key";

Deno.test("Federation Proxy - Server Registration", async () => {
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
  
  assertEquals(servers.length, 1, "Should have one registered server");
  assertEquals(servers[0], "test-server", "Server ID should match");
});

Deno.test("Federation Proxy - Server Removal", async () => {
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
  assertEquals(servers.length, 0, "Should have no registered servers after removal");
});
