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
  requiredEnvVars: { name: string; description: string }[];
  isConfigured: () => boolean;
}

const serverInfo: ServerInfo = {
  name: "deno-mcp-server",
  version: "1.0.0",
  capabilities: {
    models: ["gpt-3.5-turbo", "gpt-4"],
    protocols: ["json-rpc", "http", "websocket"],
    features: [
      "task-execution",
      "federation",
      "intent-detection",
      "meeting-info",
      "webhook-handler"
    ]
  }
};

const stats: ServerStats = {
  connections: 0,
  edgeFunctionsEnabled: false,
  activeEdgeFunctions: [],
  deployedUrls: {},
  selectedProvider: undefined
};

const edgeProviders: Record<string, EdgeProviderConfig> = {
  supabase: {
    name: "Supabase",
    requiredEnvVars: [
      { name: "SUPABASE_PROJECT_ID", description: "Your Supabase project ID" },
      { name: "SUPABASE_ACCESS_TOKEN", description: "Your Supabase access token" }
    ],
    isConfigured: () => !!Deno.env.get("SUPABASE_PROJECT_ID") && !!Deno.env.get("SUPABASE_ACCESS_TOKEN")
  },
  cloudflare: {
    name: "Cloudflare Workers",
    requiredEnvVars: [
      { name: "CLOUDFLARE_API_TOKEN", description: "Your Cloudflare API token" },
      { name: "CLOUDFLARE_ACCOUNT_ID", description: "Your Cloudflare account ID" }
    ],
    isConfigured: () => !!Deno.env.get("CLOUDFLARE_API_TOKEN") && !!Deno.env.get("CLOUDFLARE_ACCOUNT_ID")
  },
  flyio: {
    name: "Fly.io",
    requiredEnvVars: [
      { name: "FLY_API_TOKEN", description: "Your Fly.io API token" },
      { name: "FLY_APP_NAME", description: "Your Fly.io application name" }
    ],
    isConfigured: () => !!Deno.env.get("FLY_API_TOKEN") && !!Deno.env.get("FLY_APP_NAME")
  }
};

const server = new MCPServer(serverInfo);
const supabaseDeployer = new SupabaseDeployer();

async function checkEdgeProviders(): Promise<void> {
  console.log('\n\x1b[35m=== Edge Function Provider Status ===\x1b[0m');
  let anyConfigured = false;
  
  for (const [key, provider] of Object.entries(edgeProviders)) {
    const isConfigured = provider.isConfigured();
    console.log(`${provider.name}: ${isConfigured ? '\x1b[32m✓ Configured\x1b[0m' : '\x1b[31m✗ Not Configured\x1b[0m'}`);
    if (isConfigured) anyConfigured = true;
  }
  
  if (!anyConfigured) {
    console.log('\n\x1b[33m! No edge function providers configured');
    console.log('Use option [4] to configure a provider\x1b[0m');
  }
}

async function configureProvider(): Promise<string | undefined> {
  console.log('\n\x1b[35m=== Configure Edge Function Provider ===\x1b[0m');
  console.log('Available providers:');
  console.log('1. Supabase');
  console.log('2. Cloudflare Workers');
  console.log('3. Fly.io');
  console.log('4. Cancel');

  for await (const line of readLines(Deno.stdin)) {
    const choice = line.trim();
    let provider: string;
    
    switch (choice) {
      case '1':
        provider = 'supabase';
        break;
      case '2':
        provider = 'cloudflare';
        break;
      case '3':
        provider = 'flyio';
        break;
      case '4':
        return undefined;
      default:
        console.log('\x1b[31m✗ Invalid choice\x1b[0m');
        return undefined;
    }

    const config = edgeProviders[provider];
    console.log(`\n\x1b[35mConfiguring ${config.name}\x1b[0m`);

    const envVars: Record<string, string> = {};
    for (const envVar of config.requiredEnvVars) {
      const current = Deno.env.get(envVar.name);
      if (current) {
        console.log(`${envVar.name}: \x1b[32m✓ Already configured\x1b[0m`);
        envVars[envVar.name] = current;
        continue;
      }

      console.log(`\nEnter ${envVar.description} (${envVar.name}):`);
      for await (const value of readLines(Deno.stdin)) {
        if (value.trim()) {
          envVars[envVar.name] = value.trim();
          Deno.env.set(envVar.name, value.trim());
          break;
        }
        console.log('\x1b[31m✗ Value cannot be empty\x1b[0m');
      }
    }

    console.log(`\n\x1b[32m✓ ${config.name} configured successfully\x1b[0m`);
    return provider;
  }
}

async function toggleEdgeFunctions() {
  let anyConfigured = false;
  for (const provider of Object.values(edgeProviders)) {
    if (provider.isConfigured()) {
      anyConfigured = true;
      break;
    }
  }

  if (!anyConfigured) {
    console.log('\n\x1b[33m! No edge function providers configured\x1b[0m');
    console.log('Would you like to configure a provider now? (y/n)');
    
    for await (const line of readLines(Deno.stdin)) {
      const choice = line.trim().toLowerCase();
      if (choice === 'y' || choice === 'yes') {
        const provider = await configureProvider();
        if (provider) {
          stats.selectedProvider = provider;
          stats.edgeFunctionsEnabled = true;
          console.log('\n\x1b[32m✓ Edge functions enabled\x1b[0m');
        }
        break;
      } else if (choice === 'n' || choice === 'no') {
        console.log('\n\x1b[31m✗ Edge functions remain disabled\x1b[0m');
        break;
      }
      console.log('\x1b[31m✗ Invalid choice. Please enter y or n\x1b[0m');
    }
  } else if (!stats.edgeFunctionsEnabled) {
    console.log('\n\x1b[35m=== Select Edge Function Provider ===\x1b[0m');
    const availableProviders = Object.entries(edgeProviders)
      .filter(([_, provider]) => provider.isConfigured());
    
    availableProviders.forEach((([key, provider], index) => {
      console.log(`${index + 1}. ${provider.name}`);
    }));
    console.log(`${availableProviders.length + 1}. Cancel`);

    for await (const line of readLines(Deno.stdin)) {
      const choice = parseInt(line.trim());
      if (choice > 0 && choice <= availableProviders.length) {
        stats.selectedProvider = availableProviders[choice - 1][0];
        stats.edgeFunctionsEnabled = true;
        console.log(`\n\x1b[32m✓ Edge functions enabled using ${edgeProviders[stats.selectedProvider].name}\x1b[0m`);
        break;
      } else if (choice === availableProviders.length + 1) {
        console.log('\n\x1b[31m✗ Edge functions remain disabled\x1b[0m');
        break;
      }
      console.log('\x1b[31m✗ Invalid choice\x1b[0m');
    }
  } else {
    stats.edgeFunctionsEnabled = false;
    stats.selectedProvider = undefined;
    stats.activeEdgeFunctions = [];
    console.log('\n\x1b[31m✗ Edge functions disabled\x1b[0m');
  }
  
  displayServerStatus();
}

function displayServerStatus() {
  console.clear();
  console.log('\x1b[36m%s\x1b[0m', ASCII_LOGO);
  console.log('\x1b[33m=== MCP Server Status ===\x1b[0m');
  console.log('\x1b[32m✓ Server Running\x1b[0m');
  console.log(`\x1b[37m• Port: 3000`);
  console.log(`• Active Connections: ${stats.connections}`);
  console.log(`• Server Name: ${serverInfo.name}`);
  console.log(`• Version: ${serverInfo.version}\x1b[0m`);
  
  console.log('\n\x1b[33m=== Edge Functions ===\x1b[0m');
  console.log(`\x1b[37m• Status: ${stats.edgeFunctionsEnabled ? '\x1b[32mEnabled\x1b[0m' : '\x1b[31mDisabled\x1b[0m'}`);
  if (stats.selectedProvider) {
    console.log(`• Provider: ${edgeProviders[stats.selectedProvider].name}`);
  }
  console.log('• Active Functions:', stats.activeEdgeFunctions.length ? stats.activeEdgeFunctions.join(', ') : 'None');
  if (stats.lastDeployment) {
    console.log(`• Last Deployment: ${stats.lastDeployment}`);
  }
  if (Object.keys(stats.deployedUrls).length > 0) {
    console.log('\n• Deployed URLs:');
    for (const [func, url] of Object.entries(stats.deployedUrls)) {
      console.log(`  - ${func}: ${url}`);
    }
  }
  
  console.log('\n\x1b[33m=== Capabilities ===\x1b[0m');
  console.log('\x1b[37m• Models:', serverInfo.capabilities.models?.join(', '));
  console.log('• Protocols:', serverInfo.capabilities.protocols?.join(', '));
  console.log('• Features:', serverInfo.capabilities.features?.join(', '), '\x1b[0m');

  console.log('\n\x1b[33m=== Menu ===\x1b[0m');
  console.log('\x1b[37m[1] View Active Connections');
  console.log('[2] View Server Info');
  console.log('[3] View Capabilities');
  console.log('[4] Configure Edge Functions');
  console.log('[5] Deploy Edge Function');
  console.log('[6] View Edge Function Status');
  console.log('[7] View Edge Function Logs');
  console.log('[8] List Deployed Functions');
  console.log('[9] Refresh Display');
  console.log('[Ctrl+C] Exit Server\x1b[0m');
}

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

// Start the server
const server = Deno.serve({ port: 3000 }, handler);
await server.finished;
