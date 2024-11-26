// ... (keep existing imports and interfaces) ...

// Add these functions before displayServerStatus
async function viewEdgeFunctionStatus() {
  console.log('\n\x1b[35m=== Edge Function Status ===\x1b[0m');
  if (stats.edgeFunctionsEnabled) {
    if (stats.activeEdgeFunctions.length === 0) {
      console.log('\x1b[33m! No edge functions deployed\x1b[0m');
    } else {
      for (const func of stats.activeEdgeFunctions) {
        console.log(`\x1b[32m✓ ${func} (running)\x1b[0m`);
        if (stats.deployedUrls[func]) {
          console.log(`  URL: ${stats.deployedUrls[func]}`);
        }
      }
    }
  } else {
    console.log('\x1b[31m✗ Edge functions are disabled\x1b[0m');
  }
}

async function viewEdgeFunctionLogs() {
  console.log('\n\x1b[35m=== Edge Function Logs ===\x1b[0m');
  if (stats.edgeFunctionsEnabled && stats.activeEdgeFunctions.length > 0) {
    if (stats.selectedProvider === 'supabase') {
      for (const func of stats.activeEdgeFunctions) {
        console.log(`\n\x1b[33m${func} Logs:\x1b[0m`);
        const logs = await supabaseDeployer.getFunctionLogs(func);
        logs.forEach(log => console.log(log));
      }
    } else {
      console.log('\x1b[31m✗ Logs not supported for current provider\x1b[0m');
    }
  } else {
    console.log('\x1b[31m✗ No active edge functions\x1b[0m');
  }
}

import { MCPServer } from "../../packages/core/server.ts";
import { ServerInfo } from "../../packages/core/types.ts";
import { SupabaseDeployer } from "../../packages/edge/supabase-deploy.ts";
import { readLines } from "https://deno.land/std/io/mod.ts";
import { 
  serverInfo, 
  stats, 
  edgeProviders 
} from "./lib/types.ts";
import { 
  checkEdgeProviders,
  configureProvider 
} from "./lib/edge-providers.ts";
import {
  toggleEdgeFunctions,
  viewEdgeFunctionStatus,
  viewEdgeFunctionLogs
} from "./lib/edge-functions.ts";
import { displayServerStatus } from "./lib/server-status.ts";

const server = new MCPServer(serverInfo);
const supabaseDeployer = new SupabaseDeployer();


// ... (rest of the server code with handler and keyboard input) ...

async function handleKeypress() {
  // Use Deno's readLines for input handling
  for await (const line of readLines(Deno.stdin)) {
    const choice = line.trim();
    
    switch (choice) {
      case '1':
        console.log('\nActive Connections:', stats.connections);
        break;
        
      case '2':
        console.log('\nServer Information:');
        console.log(JSON.stringify(serverInfo, null, 2));
        break;
        
      case '3':
        console.log('\nServer Capabilities:');
        console.log(JSON.stringify(serverInfo.capabilities, null, 2));
        break;
        
      case '4':
        await configureProvider();
        break;
        
      case '5':
        if (!stats.edgeFunctionsEnabled) {
          console.log('\n\x1b[31m✗ Edge functions are not enabled\x1b[0m');
          console.log('Use option [4] to configure and enable edge functions');
          break;
        }
        // Show list of functions to deploy
        console.log('\nSelect function to deploy:');
        console.log('1. intent-detection');
        console.log('2. meeting-info'); 
        console.log('3. webhook-handler');
        console.log('4. Cancel');
        
        for await (const deployChoice of readLines(Deno.stdin)) {
          switch (deployChoice.trim()) {
            case '1':
              await supabaseDeployer.deployFunction('intent-detection');
              break;
            case '2':
              await supabaseDeployer.deployFunction('meeting-info');
              break;
            case '3':
              await supabaseDeployer.deployFunction('webhook-handler');
              break;
            case '4':
            default:
              break;
          }
          break;
        }
        break;
        
      case '6':
        await viewEdgeFunctionStatus();
        break;
        
      case '7':
        await viewEdgeFunctionLogs();
        break;
        
      case '8':
        if (stats.edgeFunctionsEnabled) {
          const functions = await supabaseDeployer.listDeployedFunctions();
          console.log('\nDeployed Functions:');
          functions.forEach(f => console.log(`- ${f}`));
        } else {
          console.log('\n\x1b[31m✗ Edge functions are not enabled\x1b[0m');
        }
        break;
        
      case '9':
        displayServerStatus();
        break;
        
      default:
        console.log('\nInvalid option');
        break;
    }
    
    // Show prompt for next input
    console.log('\nEnter option [1-9]:');
  }
}

// Start the server
console.log("Starting MCP server...");
await checkEdgeProviders();
displayServerStatus();

// Start keyboard input handler
handleKeypress();

// Start the HTTP server
const httpServer = Deno.serve({ port: 3000 }, handler);
await httpServer.finished;
