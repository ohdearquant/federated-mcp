import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { MCPServer } from "../../packages/core/server.ts";
import { ServerInfo } from "../../packages/core/types.ts";

const ASCII_LOGO = `
███╗   ███╗ ██████╗██████╗     ███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗ 
████╗ ████║██╔════╝██╔══██╗    ██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗
██╔████╔██║██║     ██████╔╝    ███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝
██║╚██╔╝██║██║     ██╔═══╝     ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗
██║ ╚═╝ ██║╚██████╗██║         ███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║
╚═╝     ╚═╝ ╚═════╝╚═╝         ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝
`;

const serverInfo: ServerInfo = {
  name: "deno-mcp-server",
  version: "1.0.0",
  capabilities: {
    models: ["gpt-3.5-turbo", "gpt-4"],
    protocols: ["json-rpc"],
    features: ["task-execution", "federation"]
  }
};

function displayServerStatus(connections: number) {
  console.clear();
  console.log('\x1b[36m%s\x1b[0m', ASCII_LOGO); // Cyan color
  console.log('\x1b[33m=== MCP Server Status ===\x1b[0m'); // Yellow color
  console.log('\x1b[32m✓ Server Running\x1b[0m'); // Green color
  console.log(`\x1b[37m• Port: 3000`);
  console.log(`• Active Connections: ${connections}`);
  console.log(`• Server Name: ${serverInfo.name}`);
  console.log(`• Version: ${serverInfo.version}\x1b[0m`);
  
  console.log('\n\x1b[33m=== Capabilities ===\x1b[0m');
  console.log('\x1b[37m• Models:', serverInfo.capabilities.models?.join(', '));
  console.log('• Protocols:', serverInfo.capabilities.protocols?.join(', '));
  console.log('• Features:', serverInfo.capabilities.features?.join(', '), '\x1b[0m');

  console.log('\n\x1b[33m=== Menu ===\x1b[0m');
  console.log('\x1b[37m[1] View Active Connections');
  console.log('[2] View Server Info');
  console.log('[3] View Capabilities');
  console.log('[4] Refresh Display');
  console.log('[Ctrl+C] Exit Server\x1b[0m');
}

const server = new MCPServer(serverInfo);
let activeConnections = 0;

// Handle keyboard input
async function handleKeypress() {
  const buffer = new Uint8Array(1);
  while (true) {
    await Deno.stdin.read(buffer);
    const key = String.fromCharCode(buffer[0]);
    
    switch (key) {
      case '1':
        console.log('\n\x1b[35m=== Active Connections ===\x1b[0m');
        console.log(`Current connections: ${activeConnections}`);
        break;
      case '2':
        console.log('\n\x1b[35m=== Server Info ===\x1b[0m');
        console.log(`Name: ${serverInfo.name}`);
        console.log(`Version: ${serverInfo.version}`);
        break;
      case '3':
        console.log('\n\x1b[35m=== Capabilities ===\x1b[0m');
        console.log('Models:', serverInfo.capabilities.models?.join(', '));
        console.log('Protocols:', serverInfo.capabilities.protocols?.join(', '));
        console.log('Features:', serverInfo.capabilities.features?.join(', '));
        break;
      case '4':
        displayServerStatus(activeConnections);
        break;
    }
    
    if (key === '\x03') { // Ctrl+C
      Deno.exit(0);
    }
  }
}

// Start the server
console.log("Starting MCP server...");

const handler = async (req: Request) => {
  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    // Update connection count
    activeConnections++;
    displayServerStatus(activeConnections);
    
    socket.onclose = () => {
      activeConnections--;
      displayServerStatus(activeConnections);
    };
    
    await server.handleWebSocket(socket);
    return response;
  }
  return server.handleHTTP(req);
};

// Display initial status
displayServerStatus(activeConnections);

// Start keyboard input handler
handleKeypress();

// Start the server
await serve(handler, { port: 3000 });
