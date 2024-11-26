import { serve } from "https://deno.land/std/http/server.ts";
import { MCPServer } from "../../packages/core/server.ts";
import { ServerInfo } from "../../packages/core/types.ts";

const serverInfo: ServerInfo = {
  name: "deno-mcp-server",
  version: "1.0.0",
  capabilities: {
    resources: true,
    prompts: true,
    tools: true,
    sampling: true
  }
};

const server = new MCPServer(serverInfo);

console.log("Starting Deno MCP server on port 3000...");

await serve(async (req) => {
  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    await server.handleWebSocket(socket);
    return response;
  }
  return server.handleHTTP(req);
}, { port: 3000 });
